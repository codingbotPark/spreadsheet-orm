import { DataTypes, FieldType, NotColumnedFieldType } from "./abstracts/BaseFieldBuilder"
import { BoooleanFieldBuilder, DateFieldBuilder, NumberFieldBuilder, ReferenceFieldBuilder, StringFieldBuilder } from "./implements/fieldBuilders"
import Schema from "./implements/Schema"

export default function defineTable<Name extends string, T extends NotColumnedFieldsType>(
   sheetName: Name,
   // builder: T,
   builder: ((field: FieldBuilder) => T) | T,
   columnOrder?: (keyof T)[]
):Schema<Name, FieldsType> { 
   let fields: T; // Explicitly type fields as NotColumnedFieldsType
   if (typeof builder === "function") {
      fields = builder(fieldBuilder);
   } else {
      fields = builder;
   }

   // Determine the final order of columns
   const columnOrderSet = new Set<keyof T>(columnOrder);
   const fieldNames = Object.keys(fields) as (keyof T)[];
   for (const key of fieldNames) {
      columnOrderSet.add(key);
   }
   const orderedColumns = [...columnOrderSet];

   // Create the new FieldsType object with columnOrder
   // const fieldsWithOrder = {} as Record<, FieldType<T[keyof T]['dataType']>>
   const fieldsWithOrder = {} as {[K in keyof T]: FieldType<T[K]['dataType']>;}
   orderedColumns.forEach((key, idx) => {
      const notColumnedField = fields[key];
      fieldsWithOrder[key] = {
         ...notColumnedField,
         columnOrder: idx + 1
      }
   });

   console.log(sheetName, "orderedKeys", orderedColumns);

   return new Schema(sheetName, fieldsWithOrder, orderedColumns) as Schema<Name, FieldsType>;
}

export interface FieldBuilder {
   boolean(): BoooleanFieldBuilder;
   date(): DateFieldBuilder;
   number(): NumberFieldBuilder;
   string(): StringFieldBuilder;
   reference<T extends FieldsType, Key extends keyof T>(schema:Schema<string, T>, field:Key) : ReferenceFieldBuilder<T, Key, T[Key]['dataType']>;
}
export const fieldBuilder: FieldBuilder = {
   boolean: () => new BoooleanFieldBuilder,
   date: () => new DateFieldBuilder,
   number: () => new NumberFieldBuilder,
   string: () => new StringFieldBuilder,
   reference: 
   <T extends FieldsType, Key extends keyof T>(schema:Schema<string, T>, field:Key) => 
      new ReferenceFieldBuilder<T, Key, T[Key]['dataType']>(schema, field)
}

export type NotColumnedFieldsType = Record<string,NotColumnedFieldType<DataTypes>>;
export type FieldsType = Record<string,FieldType<DataTypes>>; 
export type ColumnizeFields<T extends NotColumnedFieldsType> = {
   [K in keyof T]: FieldType<T[K]['dataType']>;
 };




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

