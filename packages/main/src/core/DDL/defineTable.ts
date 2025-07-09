import { DataTypes, FieldType } from "./abstracts/BaseFieldBuilder"
import { BoooleanFieldBuilder, DateFieldBuilder, NumberFieldBuilder, ReferenceFieldBuilder, StringFieldBuilder } from "./implements/fieldBuilders"
import Schema from "./implements/Schema"

export default function defineTable<Name extends string,T extends FieldsType>(
   sheetName: Name,
   builder: ((field: FieldBuilder) => T) | T,
   columnOrder?:(keyof T)[]
 ): Schema<Name, T> { // SchemaType에 제네릭 추가


   let fields:T
   if (typeof builder === "function"){
      fields = builder(fieldBuilder);
   } else {
      fields = builder
   }
   
   // set column attr
   const filedsNames = Object.keys(fields) as (keyof T)[];
   const columnOrderSet = new Set<keyof T>(columnOrder) // add key order param first
   for (const key of filedsNames){
      columnOrderSet.add(key)
   }
   const orderedColumns = [...columnOrderSet]
   orderedColumns.forEach((key,idx) => { // set in Field attr
      fields[key].columnOrder = idx + 1
   })
   console.log(sheetName,"orederedKeys",orderedColumns)
   
   // return new Schema(sheetName, fields);
   return new Schema(sheetName, fields, orderedColumns);
 }

export interface FieldBuilder {
   boolean(): BoooleanFieldBuilder;
   date(): DateFieldBuilder;
   number(): NumberFieldBuilder;
   string(): StringFieldBuilder;
   reference<T extends FieldsType>(schema:Schema<string, T>, fields:keyof T) : ReferenceFieldBuilder<T, keyof T>;
}
export const fieldBuilder: FieldBuilder = {
   boolean: () => new BoooleanFieldBuilder,
   date: () => new DateFieldBuilder,
   number: () => new NumberFieldBuilder,
   string: () => new StringFieldBuilder,
   reference: 
   <T extends FieldsType>(schema:Schema<string, T>, fields:keyof T) => 
      new ReferenceFieldBuilder<T, keyof T>(schema, fields)
}
export type FieldsType = Record<string,FieldType<DataTypes>>; 




type InferFieldType<T> =
 T extends 'string' ? string :
 T extends 'number' ? number :
 T extends 'boolean' ? boolean :
 T extends 'date' ? Date :
 never;
export type InferTableType<T extends FieldsType> = {
    [K in keyof T]: T[K]['optional'] extends true
    ? InferFieldType<T[K]['dataType']> | undefined
    : InferFieldType<T[K]['dataType']>;
   };

