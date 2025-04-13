function defineTable<T extends FieldsType>(
   sheetName: string,
   builder: (field: FieldBuilder) => T
 ): SchemaType<T> { // SchemaType에 제네릭 추가
   const fieldBuilder: FieldBuilder = {
     string: () => ({ dataType: 'string' }),
     number: () => ({ dataType: 'number' }),
     boolean: () => ({ dataType: 'boolean' }),
     date: () => ({ dataType: 'date' }),
   }
   const fields = builder(fieldBuilder)
   return { sheetName, fields }
 }
 
 // SchemaType을 제네릭으로 수정
 export interface SchemaType<T extends FieldsType = FieldsType> {
   sheetName: string
   fields: T
 }
export default defineTable





interface FieldBuilder {
   string(): FieldType<'string'>;
   number(): FieldType<'number'>;
   boolean(): FieldType<'boolean'>;
   date(): FieldType<'date'>;
 }
export type FieldsType =Record<string, FieldType> 

export type DataTypes = 'string' | 'number' | 'boolean' | 'date'
// export type DataTypes = string | number | Date | boolean
export interface FieldType<T extends DataTypes = DataTypes> {
   dataType:T
   optional?:boolean
   default?:any
}



 type InferFieldType<T> =
 T extends 'string' ? string :
 T extends 'number' ? number :
 T extends 'boolean' ? boolean :
 T extends 'date' ? Date :
 never

export type InferTableType<T extends FieldsType> = {
   [K in keyof T]: T[K]['optional'] extends true
      ? InferFieldType<T[K]['dataType']> | undefined
      : InferFieldType<T[K]['dataType']>
}

const testSchema = defineTable("cars",(field) => ({
   name:field.string(),
   displacement:field.number()
}))
testSchema.sheetName


type Car = InferTableType<typeof testSchema.fields>
function addCar(car:Car){
   
}
