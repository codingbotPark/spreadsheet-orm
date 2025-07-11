import { SchemaManagerConfig } from "@src/types/configPicks";
import Schema from "./implements/Schema";
import { ColumnSpecificationType, RowSpecificationType } from "@src/config/SheetConfig";
import { FieldsType } from "./defineTable";
import Configs from "@src/config/Configs";
import { DataTypes } from "./abstracts/BaseFieldBuilder";
import { google, sheets_v4, toolresults_v1beta3 } from "googleapis";
import { SchemaMap } from "@src/config/SchemaConfig";
import { eventarc } from "googleapis/build/src/apis/eventarc";
import { SchemaValidator } from "./implements/SchemaValidator";


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
      if(!this.config.schema.isSchemaSetted()) return

      const result: SyncResult = {
         created: [],
         skipped: [],
         fixed:[],
         written: [],
         errors: [],
      }

      // make Schema logic 
      // The Google Sheets API returns an error when trying to create a sheet that already exists.
      let missingSheets = await this.getMissingSheets() // 일단 무조건 생성 및 write
      const missingSheetNames = missingSheets.map((schema) => schema.sheetName)
      if (missingSheets) {
         if (this.config.schema.DEFAULT_MISSING_STRATEGY === "create") {
            await this.createSheets(missingSheets)
            result.created = missingSheetNames
            missingSheets = []
         } else if (this.config.schema.DEFAULT_MISSING_STRATEGY === "error") {
            result.errors = missingSheetNames
            throw Error("there is no sheet" + missingSheets.join(","))
         } else if (this.config.schema.DEFAULT_MISSING_STRATEGY === "ignore") {
            result.skipped = missingSheetNames
         }
      }

      // 기본 unstableSchema 에는 missing으로 생성, 최종적으로 생성되지 않은 요소
      const unstableSchemaSet = new Set(missingSheetNames)
      // existing = schemaList - missing
      const existingSchemas = this.config.schema.schemaList.filter((schema) => !unstableSchemaSet.has(schema.sheetName))

      await this.updateSheetIDStore()

      // write Schema logic
      // write schema as possible as(existing)
      if (syncOptions.mode === "clean") {
         const requests = await this.makeClearAndWriteRequest(existingSchemas)
         await this.config.spread.API.spreadsheets.batchUpdate({
            spreadsheetId:this.config.spread.ID,
            requestBody:{requests}
         })
         result.written = existingSchemas.map((schema) => schema.sheetName)
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
      

      if (unstableReports.length) {
         if (syncOptions.mode === "force"){
            const unstablSchemas = unstableReports.map((report) => report.schema)
            const requests = await this.makeClearAndWriteRequest(unstablSchemas)
            await this.config.spread.API.spreadsheets.batchUpdate({
               spreadsheetId:this.config.spread.ID,
               requestBody:{requests}
            })
            result.written.concat(unstablSchemas.map((schema) => schema.sheetName))
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
            Boolean(allFixRequest.length) && await this.config.spread.API.spreadsheets.batchUpdate({
               spreadsheetId:this.config.spread.ID,
               requestBody:{
                  requests:allFixRequest
               }
            })
            result.fixed = fixableReports.map((report) => report.schema.sheetName)
         }
      }
      if (stableReports.length){
         const emptySheetSchemas = stableReports.filter((report) => report.fixable).map((report) => report.schema)
         if (emptySheetSchemas.length){
            const writeSchemaRequests = await Promise.all(emptySheetSchemas.map((schema) => this.makeWriteSchemaRequest(schema)))
   
            await this.config.spread.API.spreadsheets.batchUpdate({
               spreadsheetId:this.config.spread.ID,
               requestBody:{requests:writeSchemaRequests}
            })
            result.written.concat(emptySheetSchemas.map(schema => schema.sheetName)) 
         }
      }

      return result
   }

   private async checkSchemaValidation(schema:Schema, config:SchemaManagerConfig<T>){
      const data = await this.getSpecifiedSheetData(schema) // 기본적으로 데이터가 있는 부분까지 가져오게 된다
      const sheetId = await this.getSchemaID(schema.sheetName, true) // !using cached 
      const headers = data.at(0) ?? []
      const validator = new SchemaValidator(schema, sheetId, data, config)
      return validator.validate()
   }


   alter() {

   }

   isColumnFullyFilled(rows:string[][], columnIdx:number) {
      return rows.every((row) => (row[columnIdx] ?? "").trim() === "")
   }
   removeNonEvaluableRows(rows: string[][]): string[][] {
      // 뒤에서부터 값이 있는 부분까지 remove
      const reversedIndex = [...rows].reverse().findIndex(row => row.every(cell => (cell ?? "").trim() === "")); 
      const lastIndex = reversedIndex === -1 ? 0 : rows.length - reversedIndex;
      return rows.slice(0, lastIndex);
   }

   constructor(private config: SchemaManagerConfig<T>) {
   }

   protected async updateSheetIDStore(){
      const actualSheets = await this.getActualSheets() ?? []
      const iterable = actualSheets.map((sheet) => [sheet.properties?.title, sheet.properties?.sheetId]).filter((iter) => iter[0] !== undefined)
      const fetchedSheetIDStore = Object.fromEntries(iterable)
      this.sheetIDStore = fetchedSheetIDStore
      return fetchedSheetIDStore
   }

   private async createSheets(schemas: Schema<string, FieldsType>[]) {
      const request = {
         spreadsheetId: this.config.spread.ID,
         resource: {
            requests: schemas.map((schema) => (
               {
                  addSheet: {
                     properties: {
                        title: schema.sheetName
                     }
                  }
               }
            ))
         },
      };

      const response = await this.config.spread.API.spreadsheets.batchUpdate(request)

      if (response.status !== 200) throw Error("error")
      return response.data.replies
   }

   private async makeWriteSchemaRequest(schema:Schema):Promise<sheets_v4.Schema$Request> {
      const sheetId = await this.getSchemaID(schema.sheetName, true)
      const startRowIndex = this.config.sheet.DATA_STARTING_ROW - 1
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
   private async makeClearSheetRequest(schema:Schema):Promise<sheets_v4.Schema$Request>{
      const sheetId = await this.getSchemaID(schema.sheetName, true)
      return {
         updateCells: {
           range: {
             sheetId,
           },
           fields: '*' // 모든 필드 삭제 (값 + 포맷 포함)
         }
       }
   }
   private async makeClearAndWriteRequest(schemaList:Schema[]){
      const clearSchemaRequests =  await Promise.all(schemaList.map((schema) => this.makeClearSheetRequest(schema)))
      const writeSchemaRequests = await Promise.all(schemaList.map((schema) => this.makeWriteSchemaRequest(schema)))
      return [...clearSchemaRequests, ...writeSchemaRequests]
   }



   private async getActualSheets() {
      const sheetInfo = await this.config.spread.getSpreadInfo()
      return sheetInfo.sheets
   }
   private async getMissingSheets() { // 지정된 스키마 기준 실제 sheet가 없는 스키마
      const actualSheets = await this.getActualSheets()
      const actualSheetNames = actualSheets?.map((sheet) => sheet.properties?.title)
      const currentSheetNamesSet = new Set(actualSheetNames)
      const missingSheets = this.config.schema.schemaList.filter((schema) => !currentSheetNamesSet.has(schema.sheetName))
      // 현재 스프레드와 
      return missingSheets
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

      const result = response.data.values
      if (!result) throw Error("error")

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
type StableDebugData = {
   expectedHeaders:string[]
   actualHeaders:string[]
   resultHeaders:(string | null)[]
   stable:boolean
   fixable:null | boolean
   fixRequest:sheets_v4.Schema$Request[]
}


