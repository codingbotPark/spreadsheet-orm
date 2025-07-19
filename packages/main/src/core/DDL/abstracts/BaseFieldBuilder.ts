
export type DataTypes = string | number | boolean | Date
export type LiteralDataTypes = "string" | "number" | "boolean" | "date"
export interface NotColumnedFieldType<T extends LiteralDataTypes>{
    dataType:T
    optional?:boolean
    default?:T
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
        }
    }

    abstract getType(): T
}

export default BaseFieldBuilder