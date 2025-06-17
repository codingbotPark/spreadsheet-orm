import { DataTypes, FieldType } from "./abstracts/BaseFieldBuilder"
import { BoooleanFieldBuilder, DateFieldBuilder, NumberFieldBuilder, ReferenceFieldBuilder, StringFieldBuilder } from "./implements/fieldBuilders"
import Schema from "./implements/Schema"

function defineTable<Name extends string,T extends FieldsType>(
   sheetName: Name,
   builder: (field: FieldBuilder) => T,
   keyOrder?:(keyof T)[]
 ): Schema<Name, T> { // SchemaType에 제네릭 추가
   const fieldBuilder: FieldBuilder = {
      boolean: () => new BoooleanFieldBuilder,
      date: () => new DateFieldBuilder,
      number: () => new NumberFieldBuilder,
      string: () => new StringFieldBuilder,
      reference: 
      <T extends FieldsType,K extends keyof T>(schema:Schema<string, T>, fields:K) => 
         new ReferenceFieldBuilder<T, Schema<string, T>, K>(schema, fields)
   }
   const fields = builder(fieldBuilder);

   const orderedKeys = Object.keys(fields) as (keyof T)[];
   
   return new Schema(sheetName, fields, orderedKeys);
 }
 
export default defineTable


export type FieldsType = Record<string,FieldType<DataTypes>>; 
export interface FieldBuilder {
   boolean(): BoooleanFieldBuilder;
   date(): DateFieldBuilder;
   number(): NumberFieldBuilder;
   string(): StringFieldBuilder;
   reference<T extends FieldsType,K extends keyof T>(schema:Schema<string, T>, fields:K) : ReferenceFieldBuilder<T, Schema<string, T>, K>;
}


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

