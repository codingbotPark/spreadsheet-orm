import { SchemaManagerConfig } from "@src/types/configPicks";
import Schema from "./implements/Schema";
import { ColumnSpecificationType, RowSpecificationType } from "@src/config/SheetConfig";
import { FieldsType } from "./defineTable";
import Configs from "@src/config/Configs";


export interface SyncOptions {
   clear?: boolean
}
export interface SyncResult {
   created: string[];   // 새로 생성한 시트 이름
   written: string[];   // 데이터를 쓴 시트 이름
   skipped?: string[];  // 'ignore' 전략으로 무시된 시트 이름
   errors?: string[];   // 오류 발생한 시트 이름이나 메시지
}

class SchemaManager<T extends readonly Schema[]> {

   // synchronize defined schema with spreadsheet
   async sync(syncOptions?: SyncOptions) {
      if(!this.config.schema.isSchemaSetted()) return

      const result: SyncResult = {
         created: [],
         written: [],
         skipped: [],
         errors: [],
      }

      // make Schema logic 
      // The Google Sheets API returns an error when trying to create a sheet that already exists.
      let missingSheets = await this.getMissingSheets() // 일단 무조건 생성 및 write
      if (missingSheets) {
         this.config.schema
         if (this.config.schema.DEFAULT_MISSING_STRATEGY === "create") {
            await this.createSheets(missingSheets)
            result.created = missingSheets.map((schema) => schema.sheetName)
         } else if (this.config.schema.DEFAULT_MISSING_STRATEGY === "error") {
            throw Error("there is no sheet" + missingSheets.join(","))
         } else if (this.config.schema.DEFAULT_MISSING_STRATEGY === "ignore") {
            missingSheets = []
         }
      }

      // write Schema logic
      // clear true = no consider schema stable => clear all sheet, content from schema starting position
      if (syncOptions?.clear) {
         this.config.schema.schemaList.forEach(async (schema) => await this.writeSchema(schema))
      } else {
         // checking existing Sheets stable
         const unstableSheetSet = new Set(missingSheets.map((schema: Schema) => schema.sheetName)) // using string in set
         const existingSchemas = this.config.schema.schemaList.filter((schema: Schema) => !unstableSheetSet.has(schema.sheetName)) // defined sheets exclude missing

         existingSchemas.forEach(async(schema) => await this.checkCurrentSchemaStable(schema) && unstableSheetSet.add(schema.sheetName))
         for (const schema of this.config.schema.schemaList) {
            if (unstableSheetSet.has(schema.sheetName)) {
              await this.writeSchema(schema);
            }
          }
         // unstableSheetSet.forEach((sheetName) => this.writeSchema(this.config.schema.schemaMap![sheetName]))
      }

      return this.config.schema.schemaList
   }

   alter() {

   }



   async checkCurrentSchemaStable(schema: Schema): Promise<boolean> {
      const data = await this.getSheetData(schema)
      const headerStable = this.checkSheetHeaderStable(schema, data)
      // 고민해야할게, 컬럼 순서, 필수값, 기본값을 확인한다고 할 때,
      // 이걸 check 에서 처리하면 다시 sheet 를 만들어지기 때문에,
      // 수정시켜줄 수 있는 요소들은 나중에 missing 말고, existing sheet 들로 돌리는게 좋을듯
      // 즉, stable 은 일단 header 만 확인
      const stable = headerStable
      return stable
   }

   constructor(public config: SchemaManagerConfig<T>) {
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

   private async getCurrentSheets() {
      const sheetInfo = await this.config.spread.getSpreadInfo()
      return sheetInfo.sheets
   }
   private async getMissingSheets() {
      const currentSheets = await this.getCurrentSheets() ?? []
      const currentSheetNamesSet = new Set(currentSheets.map((sheet) => sheet.properties?.title))
      const missingSheets = this.config.schema.schemaList!.filter((schema) => !currentSheetNamesSet.has(schema.sheetName))

      return missingSheets
   }

   private async getSheetData(schema:Schema):Promise<string[][]>{
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

   private checkSheetHeaderStable(schema:Schema<string, FieldsType>, data:string[][]):boolean{
      const headers = data?.at(0) ?? []
      const isHavingAllFields = headers.some((header) => !Object.hasOwn(schema.fields, header)) // check fields with name
      const result = isHavingAllFields
      return result
   }

}

export default SchemaManager