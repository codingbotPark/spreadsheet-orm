import { SchemaManagerConfig } from "@src/types/configPicks";
import Schema from "./implements/Schema";
import { ColumnSpecificationType, RowSpecificationType } from "@src/config/SheetConfig";
import { FieldsType } from "./defineTable";
import Configs from "@src/config/Configs";
import { DataTypes } from "./abstracts/BaseFieldBuilder";
import { google, sheets_v4, toolresults_v1beta3 } from "googleapis";
import { SchemaMap } from "@src/config/SchemaConfig";


export type SyncModeType = "strict" | "smart" | "force"
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
      const unstableSchemaSet = new Set(...missingSheetNames)
      // existing = schemaList - missing
      const existingSchemas = this.config.schema.schemaList.filter((schema) => !unstableSchemaSet.has(schema.sheetName))

      // write Schema logic
      // write schema as possible as(existing)
      if (syncOptions.mode === "force") {
         result.written = existingSchemas.map((schema) => schema.sheetName)
         await Promise.all(existingSchemas.map((schema) => this.writeSchema(schema)));
         return result
      }  
      
      // checking existing Sheets stable & create empty schema
      // to use cached sheetIDStore in check methods
      await this.updateSheetIDStore()
      const existingSchemaStableReports = await Promise.all(
         existingSchemas.map((schema) => {
         const stableReport =  this.checkSchemaStable(schema)
         return stableReport
      })
      )

      // strict <-> smart => fixable실행 차이
      const [stableReport, fixableReport, unstableReport] = existingSchemaStableReports.reduce<[SchemaStableReport[], SchemaStableReport[], SchemaStableReport[]]>(
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
      
      if (unstableReport.length) {
         result.errors = unstableReport.map((report) => report.schema.sheetName)
         throw("sheets already have data")
      }
      if (syncOptions.mode === "smart"){
         // fixing header first(because when fixReuqest made, it based with resultHeader position)
         const allFixRequest = fixableReport.flatMap((report) => [...report.headerValidReport.fixRequest, ...report.contentValidReport.fixRequest])
         Boolean(allFixRequest.length) && await this.config.spread.API.spreadsheets.batchUpdate({
            spreadsheetId:this.config.spread.ID,
            requestBody:{
               requests:allFixRequest
            }
         })
         result.fixed = fixableReport.map((report) => report.schema.sheetName)
         stableReport.concat(...fixableReport)
      }
   

      await Promise.all(stableReport.map((report) => this.writeSchema(report.schema)))
      result.written = stableReport.map((report) => report.schema.sheetName)
   

      return result
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

   async checkSchemaStable(schema: Schema):Promise<SchemaStableReport> {
      const data = await this.getSpecifiedSheetData(schema) // 기본적으로 데이터가 있는 부분까지 가져오게 된다
      const sheetId = await this.getSchemaID(schema.sheetName, true) // !using cached 
      const headers = data.at(0) ?? []
      const workingHeaders = [...headers]
      const evaluableRows = this.removeNonEvaluableRows(data.slice(this.config.sheet.DEFAULT_COLUMN_NAME_SIZE))

      const schemaStableReport:SchemaStableReport = {
         stable:true,
         fixable:undefined,
         fieldsStatus:Object.keys(schema.orderedColumns),
         fixRequest:{
            // columnMoving은 에서 위치가 변경되기 때문에 dataSet -> columnMove -> columnSet 순서로 fixRequest가 사용되어야 함
            dataSetting:[], // default값 등을 설정하는 경우
            columnMoving:[], // header위치가 지정된 것과 다른 경우
            columnSetting:[], // 해당 컬럼의 header 및 데이터가 빈 경우, moving할 때 actual이 존재할 수 있기 때문에 moving이 끝난 후 지정
         },
         schema
      }

      schema.orderedColumns.forEach((definedField, targetIdx) => {
         const actualFieldIdx = workingHeaders.indexOf(definedField)
         if (actualFieldIdx < 0){ // 못 찾았을 때
            // move가 끝난 후 set가능 여부를 확인하기 위해 recording
            schemaStableReport.stable = false
            schemaStableReport.fieldsStatus[targetIdx] = null
         }

         // 찾았을 땐 값 확인
         if (schema.fields[definedField].optional === false && !this.isColumnFullyFilled(evaluableRows, actualFieldIdx)){ // required인 필드가 비어있을 떄
            schemaStableReport.fixable = false
            schemaStableReport.stable = false
            schemaStableReport.fieldsStatus[targetIdx] = false
         } 
         if (schema.fields[definedField].default !== undefined && !this.isColumnFullyFilled(evaluableRows, actualFieldIdx)){
            schemaStableReport.fixable = schemaStableReport.fixable ?? true
            const columnDataRowsForm:sheets_v4.Schema$RowData[] = evaluableRows.map((row) => {
               let value = null
               if (row[actualFieldIdx].trim() === ""){
                  value = schema.fields[definedField].default
               } else {
                  value = row[actualFieldIdx]
               }
               return {values:[{userEnteredValue:{stringValue:value}}]}
            })
            const startRowIndex = this.config.sheet.DATA_STARTING_ROW - 1 
            const columnIndex = this.config.sheet.columnToNumber(this.config.sheet.DEFAULT_RECORDING_START_COLUMN) - 1 + actualFieldIdx 
            schemaStableReport.fixRequest.dataSetting.push({
               updateCells:{
                  range:{
                     sheetId,
                     startRowIndex:startRowIndex, // index 1 => 2번째 행부터
                     endRowIndex:startRowIndex + columnDataRowsForm.length,
                     startColumnIndex:columnIndex, // 0 ->열A열
                     endColumnIndex:columnIndex + 1 // 열은 하나만 변경하기 때문
                  },
                  rows:columnDataRowsForm,
                  fields: "userEnteredValue"
               }
            })
         }

         if (actualFieldIdx !== targetIdx && schemaStableReport.fieldsStatus[targetIdx]){ // 실제 위치와 다르지만, 옮길 수 있을 때(값에 문제가 없을때때)
            const ColumnRecordingIndex = this.config.sheet.columnToNumber(this.config.sheet.DEFAULT_RECORDING_START_COLUMN) - 1
             schemaStableReport.fixRequest.columnMoving.push({
               moveDimension:{
                  source:{
                     sheetId,
                     dimension:'COLUMNS',
                     startIndex:ColumnRecordingIndex + actualFieldIdx,
                     endIndex:ColumnRecordingIndex + actualFieldIdx + 1
                  },
                  destinationIndex:ColumnRecordingIndex + targetIdx
               }
             })  
             schemaStableReport.fixable = schemaStableReport.fixable ?? true
             
             const [moved] = workingHeaders.splice(actualFieldIdx, 1);
             workingHeaders.splice(targetIdx, 0, moved);
         }

      })

      return schemaStableReport
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

   private async writeSchema(schema:Schema) {

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
      columnSetting:sheets_v4.Schema$Request[], // 해당 컬럼의 header 및 데이터가 빈 경우
      columnMoving:sheets_v4.Schema$Request[], // header위치가 지정된 것과 다른 경우
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


