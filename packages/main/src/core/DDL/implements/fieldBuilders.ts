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
Fields extends FieldsType,
  Key extends keyof Fields
> extends BaseFieldBuilder<Fields[Key]['dataType']> {
  constructor(
    private schema: Schema<string, Fields>,
    private field:Key
  ) {
    super();
  }

  getType(): Fields[Key]['dataType'] {
    return this.schema.fields[this.field].dataType;
  }
}
