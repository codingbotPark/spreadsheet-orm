function defineTable<T extends SchemaType>(
   builder: (field: FieldBuilder) => T
   ): {
   schema: T
   } {
   const fieldBuilder: FieldBuilder = {
      string: () => ({ dataType: 'string' }),
      number: () => ({ dataType: 'number' }),
      boolean: () => ({ dataType: 'boolean' }),
      date: () => ({ dataType: 'date' }),
   }

   const schema = builder(fieldBuilder)
   return { schema }
}
export default defineTable


export type DataTypes = string | number | Date | boolean
export interface FieldType {
   dataType:DataTypes
   optional?:Boolean
   default?:DataTypes
}


interface FieldBuilder {
   string(): FieldType
   number(): FieldType
   boolean(): FieldType
   date(): FieldType
}
export type FieldsType =Record<string, FieldType> 


export interface SchemaType {
   name: string
   fields: FieldsType
   // references?: Reference[]
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

