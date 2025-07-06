
export type DataTypes = string | number | boolean | Date
export interface FieldType<T extends DataTypes> {
    dataType:T
    column?:string
    optional?:boolean
    default?:any
 }
 

abstract class BaseFieldBuilder<D extends DataTypes>{
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

    build(): FieldType<D> {
        return {
            dataType: this.getType(),
            optional: this._optional,
            default: this._default,
        }
    }

    abstract getType(): D
}

export default BaseFieldBuilder