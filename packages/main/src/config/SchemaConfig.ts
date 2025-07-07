import Schema from "@src/core/DDL/implements/Schema"

export type MissingSchemaStrategy = 'create' | 'ignore' | 'error'

export interface SchemaConfigOptions<T extends Schema[]> {
    schemas?: T,
    onMissingSchema?: MissingSchemaStrategy
}
export type SchemaConfigOptionsWithSchema<T extends Schema[]> = SchemaConfigOptions<T> & {schemas:T}
export type SchemaConfigOptionsWithoutSchema = SchemaConfigOptions<Schema[]> & {schemas?:never}


export type SchemaMap<T extends Schema[]> = {
    [K in T[number]['sheetName']]: Extract<T[number], { sheetName: K }>
}


class SchemaConfig<T extends Schema[]>{
    missingSchemaStartegy:MissingSchemaStrategy
    readonly DEFAULT_MISSING_STRATEGY: MissingSchemaStrategy = 'create' 
    
    readonly schemaList?: T;
    readonly schemaMap?: SchemaMap<T>;

    isSchemaSetted(): this is SettedSchemaConfig<T>{
        const schemaMapSetted = (this.schemaMap && !!Object.keys(this.schemaMap).length) ?? false
        const schemaListSetted = (this.schemaList && !!this.schemaList.length) ?? false
        return schemaListSetted && schemaMapSetted
    }

    constructor(options:SchemaConfigOptions<T>) {
        // schema X => not constructed
        this.missingSchemaStartegy = options.onMissingSchema ?? this.DEFAULT_MISSING_STRATEGY
    }
}
export default SchemaConfig



export class SettedSchemaConfig<T extends Schema[]> extends SchemaConfig<T>{
    readonly schemaList: T;
    readonly schemaMap: SchemaMap<T>;

    constructor(options: SchemaConfigOptionsWithSchema<T>){
        super(options)
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