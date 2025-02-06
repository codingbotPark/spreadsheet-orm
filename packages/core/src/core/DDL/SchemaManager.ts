




export interface SchemaConfig{
   schema?:{} 
}

export type DataTypes = string | number | Date | boolean
export type InputValueType = DataTypes[] | {[key:string]:DataTypes}
