import { SchemaManagerConfig } from "@src/types/configPicks";
import Schema from "./implements/Schema";
import { ColumnSpecificationType, RowSpecificationType } from "@src/config/SheetConfig";
import { FieldsType } from "./defineTable";
import Configs from "@src/config/Configs";
import { DataTypes } from "./abstracts/BaseFieldBuilder";
import { google, sheets_v4 } from "googleapis";
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
      const unstableSchemaSet = new Set(missingSheets.map((schema: Schema) => schema.sheetName))
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
         const stableReport =  this.checkCurrentSchemaStable(schema)
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



   async checkCurrentSchemaStable(schema: Schema):Promise<SchemaStableReport> {
      const data = await this.getSpecifiedSheetData(schema)
      const checkDataStable = this.checkDataStable(schema, data)

      const headers = data.at(0) ?? []
      const headerValidReport = await this.checkColumnPosition(schema, headers)
      // 고민해야할게, 컬럼 순서, 필수값, 기본값을 확인한다고 할 때,
      // 이걸 check 에서 처리하면 다시 sheet 가 만들어지기 때문에,
      // 수정시켜줄 수 있는 요소들은 나중에 missing 말고, existing sheet 들로 돌리는게 좋을듯
      // 즉, stable 은 일단 header 만 확인

      const isEmptySchema = headerValidReport.resultHeaders.every((data) => data === null) && contentValidReport.actualContentType.every((data) => data === null)
      // 지금은 스키마 전체가 빈 경우가 아니라면 notFixable => insert를 사용하진 않음(move만 사용가능)

      return {
         headerValidReport,
         contentValidReport,
         stable:isEmptySchema || (headerValidReport.stable && contentValidReport.stable), // 빈 스키마 또는 fixable한 스키마
         fixable:(headerValidReport.fixable ?? headerValidReport.stable) && (contentValidReport.fixable ?? contentValidReport.stable), // fixable 이 null 일 땐 각 stable 에 따름
         schema
      }
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


   private async checkDataStable(schema:Schema, contents:string[][]):DataStableReport{
      // resultHeaders 를 참고해서, header들의 이동이 먼저 요청되고, 값의 변
      
      

      const dataStableReport:DataStableReport = {
         valid,
         actualContentType,
         fixable
      }
      return dataStableReport
   }


   private async checkColumnPosition(schema:Schema, headers:string[]){
      const orderedColumns = schema.orderedColumns
      const sheetId = await this.getSchemaID(schema.sheetName, true) // !using cached

      const headerValidReport:HeaderValidReport = {
         expectedHeaders:orderedColumns,
         actualHeaders:headers,
         resultHeaders:orderedColumns, // reqeust 를 적용했을 때 나올 header / 새 sheet라면 다 null
         stable:true,
         fixable:null,
         fixRequest:[]
      }

      const workingHeaders = [...headers]

      // orderedColums forEach <= 생성 과정 중 set으로, 더 클린한 배열이기 떄문
      orderedColumns.forEach(async (orderedColumn, targetIdx) => {
         const actualIndex = workingHeaders.indexOf(orderedColumn) // 실제 해당 값의 idx
         workingHeaders[targetIdx]
         if (actualIndex === -1){ 
            // 실제 시트에 해당 컬럼이 없을 때, header가 빈값이든 아니든 contents에 값이 존재할 수 있음
            // 덮어쓰기 되면 안됨 => not fixable
            headerValidReport.fixable = false
            headerValidReport.stable = false
            if (workingHeaders[targetIdx].trim() === "") {
               headerValidReport.resultHeaders[targetIdx] = null // mark null for checking empty
            } else { // target idx column 에 어떤 다른 값이 이미 있을때때
               headerValidReport.resultHeaders[targetIdx] = workingHeaders[targetIdx]
            }
         } else if (actualIndex !== targetIdx){ // 선언한 위치가 실제와 다를 때
            headerValidReport.fixRequest.push({
               moveDimension: {
                  source: {
                    sheetId,
                    dimension: 'COLUMNS',
                    startIndex: actualIndex,
                    endIndex: actualIndex + 1
                  },
                  destinationIndex: targetIdx
                }
            })
            headerValidReport.fixable = true
            // 배열 자체를 수정해서 상태 반영
            const [moved] = workingHeaders.splice(actualIndex, 1);
            workingHeaders.splice(targetIdx, 0, moved);
         }
      })

 
      return columnPositionReport
   }

   

}

export default SchemaManager

type SchemaStableReport = {
   columnPositionReport:ColumnPositionReport,
   dataStableReport:DataStableReport,
   stable:boolean, // 빈 스키마 또는 fixable한 스키마
   fixable:boolean,
   schema:Schema
}
type ColumnPositionReport = {
   expectedHeaders:string[]
   actualHeaders:string[]
   resultHeaders:(string | null)[]
   stable:boolean
   fixable:null | boolean
   fixRequest:sheets_v4.Schema$Request[]
}
type DataStableReport = {
   actualContentType:(DataTypes | null)[]
   stable:boolean
   fixable:null | boolean
   fixRequest:sheets_v4.Schema$Request[]
}