import BaseFieldBuilder, { DataTypes, FieldType, LiteralDataTypes } from "../abstracts/BaseFieldBuilder";
import { FieldsType } from "../defineTable";
import Schema from "./Schema";


export class StringFieldBuilder extends BaseFieldBuilder<'string'>{
    getType(): "string" {
        return "string"
    }
}

export class NumberFieldBuilder extends BaseFieldBuilder<'number'>{
    getType(): "number" {
        return "number"
    }
}

export class BoooleanFieldBuilder extends BaseFieldBuilder<'boolean'>{
    getType(): "boolean" {
        return "boolean"
    }
}

export class DateFieldBuilder extends BaseFieldBuilder<'date'>{
  timestampAtCreated?:boolean
  timestampAtUpdated?:boolean

    getType(): "date" {
        return "date"
    }

    createdTimestamp(){
      this.timestampAtCreated = true
      return this
    }

    updatedTimestamp(){
      this.timestampAtCreated = true
      this.timestampAtUpdated = true
      return this
    }
}
export function isDateField(field: BaseFieldBuilder<any>): field is DateFieldBuilder {
  return field instanceof DateFieldBuilder
}

export class ReferenceFieldBuilder<
  RefSchemaFields extends FieldsType,
  RefKey extends keyof RefSchemaFields,
  RefType extends LiteralDataTypes = RefSchemaFields[RefKey]['dataType']
> extends BaseFieldBuilder<RefType> {
  constructor(
    private refSchema: Schema<string, RefSchemaFields>,
    private field: RefKey
  ) {
    super();
  }

  getType(): RefType{
    return this.refSchema.fields[this.field].dataType as RefType;
  }
}