

export type DataTypes = string | number | boolean | Date
export type LiteralDataTypes = "string" | "number" | "boolean" | "date"
export type TypeFromLiteral<T extends LiteralDataTypes> =
    T extends "string" ? string :
    T extends "number" ? number :
    T extends "boolean" ? boolean :
    T extends "date" ? Date :
    never;



export interface NotColumnedFieldType<T extends LiteralDataTypes>{
    dataType:T
    optional?:boolean
    default?:T
    timestampAtCreated?:boolean
    timestampAtUpdated?:boolean
}
export interface FieldType<T extends LiteralDataTypes> extends NotColumnedFieldType<T>{
    columnOrder:number
 }

  

abstract class BaseFieldBuilder<T extends LiteralDataTypes>{
    private _optional:boolean = false
    private _default?:T

    optional(param?:boolean): this {
        this._optional = param ?? true
        return this
    }
    
    default(value: any): this {
        this._default = value
        return this
    }

    build(): NotColumnedFieldType<T> {
        return {
            dataType: this.getType(),
            optional: this._optional,
            default: this._default,
            timestampAtCreated: (this as any).timestampAtCreated,
            timestampAtUpdated: (this as any).timestampAtUpdated,
        }
    }

    abstract getType(): T
}

export default BaseFieldBuilder