import { SchemaManagerConfig } from "@src/types/configPicks";
import Schema from "./implements/Schema";
import { ColumnSpecificationType, RowSpecificationType } from "@src/config/SheetConfig";
import { FieldsType } from "./defineTable";
import { sheets_v4 } from "googleapis";
import { SchemaMap } from "@src/config/SchemaConfig";
import { SchemaValidator } from "./implements/SchemaValidator";
import { SheetQueries } from "@src/generators";


export type SyncModeType = "strict" | "smart" | "force" | "clean"
export interface SyncOptions {
   mode:SyncModeType
}
export interface SyncResult {
   created: string[];   // 새로 생성한 시트 이름
   written: string[];   // 스키마를 쓴 시트 이름
   fixed: string[];
   skipped?: string[];  // 'ignore' 전략으로 무시된 시트 이름
   errors?: string[];   // 오류 발생한 시트 이름이나 메시지
}

class SchemaManager<T extends Schema[]> {

   sheetIDStore?:Record<keyof SchemaMap<T>, number>

   async getSchemaID(schemaName:keyof SchemaMap<T>, useCached:boolean = false){
      if (!this.sheetIDStore || useCached === false){
         await this.updateSheetIDStore()
      }
      const sheetId = this.sheetIDStore?.[schemaName]
      if(!sheetId) throw Error("sheetIDStore not setted")
      return sheetId
   }

   // synchronize defined schema with spreadsheet
   async sync(syncOptions: SyncOptions = {
      mode:"strict"
   }) {
      const result: SyncResult = {
         created: [],
         skipped: [],
         fixed:[],
         written: [],
         errors: [],
      }

      const actualSheets = (await this.config.spread.getSpreadInfo()).sheets // 현재 시트
      const actualSheetNamesSet = new Set(actualSheets?.map((sheet) => sheet.properties?.title)) // 실제 시트들의 이름
      const missingSheets = this.config.schema.schemaList.filter((schema) => !actualSheetNamesSet.has(schema.sheetName)) // 정의된 스키마들 중 실제 시트에 있으면 제외

      // make Schema logic 
      // The Google Sheets API returns an error when trying to create a sheet that already exists.
      let missingSheetNames = missingSheets.map((schema) => schema.sheetName)
      if (missingSheetNames.length) {
         if (this.config.schema.DEFAULT_MISSING_STRATEGY === "create") {
            await this.config.spread.batchUpdateQuery(missingSheets.map((sheet) => SheetQueries.addSheet(sheet.sheetName)))
            result.created = missingSheetNames
            missingSheetNames = [] // clear to part of existingSchemas
         } else if (this.config.schema.DEFAULT_MISSING_STRATEGY === "error") {
            result.errors = missingSheetNames
            throw Error("there is no sheet" + missingSheets.join(","))
         } else if (this.config.schema.DEFAULT_MISSING_STRATEGY === "ignore") {
            result.skipped = missingSheetNames
         }
      }

      // 기본 unstableSchema 에는 missing으로 생성, 최종적으로 생성되지 않은 요소
      const missingSheetNameSet = new Set(missingSheetNames)
      // existing = schemaList - missing, 즉 선언된 스키마 중 실제 있는 것들
      const existingSchemas = this.config.schema.schemaList.filter((schema) => {
         const result = !missingSheetNameSet.has(schema.sheetName)
         console.log(result)
         return result
      })

      await this.updateSheetIDStore()

      // clean all existing schema empty
      if (syncOptions.mode === "clean") {
         const existSheetIds = await Promise.all(existingSchemas.map((schema) => this.getSchemaID(schema.sheetName)))
         const clearRequest = existSheetIds.map((id) => SheetQueries.clearSheet(id))
         await this.config.spread.batchUpdateQuery(clearRequest)
         return result
      } 
      
      // checking existing Sheets stable & create empty schema
      // to use cached sheetIDStore in check methods
      const existingSchemaStableReports = await Promise.all(existingSchemas.map((schema) => this.checkSchemaValidation(schema, this.config)))

      // strict <-> smart => fixable실행 차이
      const [stableReports, fixableReports, unstableReports] = existingSchemaStableReports.reduce<[SchemaStableReport[], SchemaStableReport[], SchemaStableReport[]]>(
      (acc, report) => {
         const [stable, fixable, unstable] = acc;
         if (report.stable) {
            stable.push(report);
         } else if (report.fixable) {
            fixable.push(report);
         } else {
            unstable.push(report);
         }
         return acc;
      }, [[], [], []]);
      console.log("stableReports",stableReports)
      console.log("fixableReports",fixableReports)
      console.log("unstableReports",unstableReports)
      

      if (unstableReports.length) {
         if (syncOptions.mode === "force"){
            const unstableSheetIds =  await Promise.all(unstableReports.map((report) => this.getSchemaID(report.schema.sheetName))) 
            const clearRequets = unstableSheetIds.map((id) => SheetQueries.clearSheet(id))
            await this.config.spread.batchUpdateQuery(clearRequets)
            // make fixable true make recognize like empty sceham
            const markWithStableReports = unstableReports.map((report) => {
               report.fixable = true
               return report
            })
            stableReports.concat(markWithStableReports)
         } else {
            result.errors = unstableReports.map((report) => report.schema.sheetName)
            throw("unstable")
         }
      }
      if (fixableReports.length){ 
         // force = unstable + fixable
         // smart = fixable only
         if (syncOptions.mode === "smart" || syncOptions.mode === "force"){
            const allFixRequest = fixableReports.flatMap((report) => [...report.fixRequest.dataSetting, ...report.fixRequest.columnMoving, ...report.fixRequest.headerSetting])
            Boolean(allFixRequest.length) && await this.config.spread.batchUpdateQuery(allFixRequest)
            result.fixed = fixableReports.map((report) => report.schema.sheetName)
         }
      }
      // emptySheetSchemas = 원래 empty | unstable in force option | all in clean option
      const emptySheetSchemas = stableReports.filter((report) => report.fixable).map((report) => report.schema)
      if (emptySheetSchemas.length){
         const writeSchemaRequests = await Promise.all(emptySheetSchemas.map((schema) => this.makeWriteSchemaRequest(schema)))
         await this.config.spread.batchUpdateQuery(writeSchemaRequests)
         result.written.concat(emptySheetSchemas.map(schema => schema.sheetName)) 
      }
      
      // set type to spreadsheet after processing schema structure
      const setTypedColumnRequests: sheets_v4.Schema$Request[] = []
      for (const schema of existingSchemas) {
         const sheetId = await this.getSchemaID(schema.sheetName, true)

         for (let idx = 0; idx < schema.orderedColumns.length; idx++) {
            const columnName = schema.orderedColumns[idx]
            const dataType = schema.fields[columnName].dataType

            if (dataType !== "number" && dataType !== "date") continue

            const startColumnIndex = this.config.sheet.columnToNumber(this.config.sheet.DEFAULT_RECORDING_START_COLUMN) + idx
            const request = SheetQueries.repeatTypedCell(sheetId, dataType, {
               startRowIndex: this.config.sheet.DATA_STARTING_ROW,
               startColumnIndex,
               endColumnIndex: startColumnIndex + 1
            })
            setTypedColumnRequests.push(request)
         }
      }
      this.config.spread.batchUpdateQuery(setTypedColumnRequests)

      return result
   }

   private async checkSchemaValidation(schema:Schema, config:SchemaManagerConfig<T>){
      console.log("checkSchemaValidation", schema.sheetName)
      const data = await this.getSpecifiedSheetData(schema) // 기본적으로 데이터가 있는 부분까지 가져오게 된다
      if (data.length === 0) {
         const emptySchemaReport:SchemaStableReport = {
            stable:true,
            fieldsStatus:Array(schema.orderedColumns.length).fill(null),
            fixable:true,
            schema,
            fixRequest:{
               dataSetting:[],
               columnMoving:[],
               headerSetting:[]
            }
         }
         return emptySchemaReport
      }
      const sheetId = await this.getSchemaID(schema.sheetName, true) // !using cached 
      const validator = new SchemaValidator(schema, sheetId, data, config)
      return validator.validate()
   }


   alter() {

   }


   constructor(private config: SchemaManagerConfig<T>) {
   }

   protected async updateSheetIDStore(){
      const actualSheets = (await this.config.spread.getSpreadInfo()).sheets ?? [] // 현재 시트
      const iterable = actualSheets.map((sheet) => [sheet.properties?.title, sheet.properties?.sheetId]).filter((iter) => iter[0] !== undefined)
      const fetchedSheetIDStore = Object.fromEntries(iterable)
      this.sheetIDStore = fetchedSheetIDStore
      return fetchedSheetIDStore
   }

   private async makeWriteSchemaRequest(schema:Schema):Promise<sheets_v4.Schema$Request> {
      const sheetId = await this.getSchemaID(schema.sheetName, true)
      const startRowIndex = this.config.sheet.DEFAULT_RECORDING_START_ROW - 1
      const startColumnIndex = this.config.sheet.columnToNumber(this.config.sheet.DEFAULT_RECORDING_START_COLUMN) - 1
      return {updateCells:{
            range: {
              sheetId, // 숫자 ID
              startRowIndex: startRowIndex, // A2이면 1 (0-based)
              endRowIndex: startRowIndex + 1,
              startColumnIndex: startColumnIndex,
              endColumnIndex: startColumnIndex + schema.orderedColumns.length
            },
            rows: [{values:schema.orderedColumns.map((column) => ({userEnteredValue:{stringValue:column}}))}],
            fields: 'userEnteredValue'
      }}
   }




   private async getSpecifiedSheetData(schema:Schema):Promise<string[][]>{
      // get all data from header
      const specifiedRow:RowSpecificationType = {
         startRow:this.config.sheet.DEFAULT_RECORDING_START_ROW + this.config.sheet.DEFAULT_COLUMN_NAME_SIZE - 1 ,
      }
      const specifiedColumn: ColumnSpecificationType = {
         startColumn: this.config.sheet.DEFAULT_RECORDING_START_COLUMN,
         endColumn: this.config.sheet.calcColumn(this.config.sheet.DEFAULT_RECORDING_START_COLUMN, Object.keys(schema.fields).length)
      }
      
      const response = await this.config.spread.API.spreadsheets.values.get({
         spreadsheetId: this.config.spread.ID,
         range: this.config.sheet.composeRange(
            schema.sheetName,
            specifiedRow,
            specifiedColumn
         ),
      });

      const result = response.data.values ?? []

      return result as string[][]
   }

   

}

export default SchemaManager

type SchemaStableReport = {
   stable:boolean, // 빈 스키마 또는 fixable한 스키마
   fieldsStatus:(string | null | false)[],
   fixable?:boolean,
   fixRequest:{
      // dataSetting:sheets_v4.Schema$Request[], // default값 등을 설정하는 경우
      dataSetting:sheets_v4.Schema$Request[], // default값 등을 설정하는 경우
      columnMoving:sheets_v4.Schema$Request[], // header위치가 지정된 것과 다른 경우
      headerSetting:sheets_v4.Schema$Request[], // 해당 컬럼의 header 및 데이터가 빈 경우
   },
   schema:Schema
}

