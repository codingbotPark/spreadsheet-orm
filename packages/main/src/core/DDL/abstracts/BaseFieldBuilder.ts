
export type DataTypes = string | number | boolean | Date
export interface NotColumnedFieldType<T extends DataTypes>{
    dataType:T
    optional?:boolean
    default?:any
}
export interface FieldType<T extends DataTypes> extends NotColumnedFieldType<T>{
    columnOrder:number
 }


abstract class BaseFieldBuilder<T extends DataTypes>{
    private _optional:boolean = false
    private _default:any = undefined

    optional(): this {
        this._optional = true
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