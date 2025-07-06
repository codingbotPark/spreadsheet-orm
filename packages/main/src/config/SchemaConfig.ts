import Schema from "@src/core/DDL/implements/Schema"

export type MissingSchemaStrategy = 'create' | 'ignore' | 'error'

export type SchemaConfigOptions<T extends Schema[]> = 
    | SchemaConfigOptionsWithSchema<T>
    | SchemaConfigOptionsWithoutSchema
export interface SchemaConfigOptionsWithSchema<T extends Schema[]> {
    schemas: T,
    onMissingSchema?: MissingSchemaStrategy
}
export interface SchemaConfigOptionsWithoutSchema {
    schemas?: never,
    onMissingSchema?: MissingSchemaStrategy
}

// sheetName 을 배열로 사용할 때
export type SchemaMap<T extends Schema[]> = {
    [K in T[number]['sheetName']]: Extract<T[number], { sheetName: K }>
}

abstract class BaseSchemaConfig {
    missingSchemaStartegy:MissingSchemaStrategy
    readonly DEFAULT_MISSING_STRATEGY: MissingSchemaStrategy = 'create' 

    constructor(options: SchemaConfigOptionsWithoutSchema){
        this.missingSchemaStartegy = options.onMissingSchema ?? this.DEFAULT_MISSING_STRATEGY
    }
}



export interface SettedSchemaConfig<T extends Schema[]>{
    schemaList: T;
    schemaMap: SchemaMap<T>;
} 
export type SchemaConfig<T extends Schema[] | undefined> = 
    T extends Schema[] ? SchemaConfigWithSchemas<T> : SchemaConfigWithoutSchemas


    
export class SchemaConfigWithoutSchemas extends BaseSchemaConfig {
    constructor(options: SchemaConfigOptionsWithoutSchema) {
        super(options)
    }
}
class SchemaConfigWithSchemas<T extends Schema[]>{
    readonly schemaList: T;
    readonly schemaMap: SchemaMap<T>;

    isSchemaSetted(): this is SettedSchemaConfig<T>{
        const schemaMapSetted = (this.schemaMap && !!Object.keys(this.schemaMap).length) ?? false
        const schemaListSetted = (this.schemaList && !!this.schemaList.length) ?? false
        return schemaListSetted && schemaMapSetted
    }

    constructor(options: SchemaConfigOptionsWithSchema<T>) {
        // schema X => not constructed
        this.schemaList = options.schemas 
        this.schemaMap = this.makeSchemaMap(options.schemas)
    }

    private makeSchemaMap(schemas:T){
        const schemaMap = schemas.reduce((schemaDefinition, schema) => {
            const key = schema.sheetName as keyof SchemaMap<T>
            schemaDefinition[key] = schema as unknown as SchemaMap<T>[typeof key]
            return schemaDefinition
        }, {} as SchemaMap<T>)
        return schemaMap
    }


}
export default SchemaConfigWithSchemas


