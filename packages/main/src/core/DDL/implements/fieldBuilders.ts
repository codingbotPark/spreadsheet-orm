import BaseFieldBuilder, { DataTypes, FieldType } from "../abstracts/BaseFieldBuilder";
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
    getType(): "date" {
        return "date"
    }
}

export class ReferenceFieldBuilder<
  T extends FieldsType,
  S extends Schema<string, T>,
  K extends keyof S['fields']
> extends BaseFieldBuilder<S['fields'][K]['dataType']> {
  constructor(
    private schema: Schema<string, T>,
    private field: K
  ) {
    super();
  }

  getType(): S['fields'][K]['dataType'] {
    return this.schema.fields[this.field].dataType;
  }
}
