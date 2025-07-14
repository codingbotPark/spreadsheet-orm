import Schema from "@src/core/DDL/implements/Schema"

export type MissingSchemaStrategy = 'create' | 'ignore' | 'error'

// 이 인터페이스는 이제 Configs.ts에서 직접 정의되므로 주석 처리하거나 삭제할 수 있습니다.
export interface SchemaConfigOptions<T extends Schema[]> {
    onMissingSchema?: MissingSchemaStrategy;
    schemas?: T;
}

export type SchemaMap<T extends Schema[]> = {
    [K in T[number]['sheetName']]: Extract<T[number], { sheetName: K }>
}

class SchemaConfig<T extends Schema[]>{
    missingSchemaStartegy: MissingSchemaStrategy
    readonly DEFAULT_MISSING_STRATEGY: MissingSchemaStrategy = 'create' 
    
    readonly schemaList: T;
    readonly schemaMap: SchemaMap<T>;

    private makeSchemaMap(schemas:T){
        const schemaMap = schemas.reduce((schemaDefinition, schema) => {
            const key = schema.sheetName as keyof SchemaMap<T>
            schemaDefinition[key] = schema as unknown as SchemaMap<T>[typeof key]
            return schemaDefinition
        }, {} as SchemaMap<T>)
        return schemaMap
    }

    constructor(options: SchemaConfigOptions<T>) {
        this.missingSchemaStartegy = options.onMissingSchema ?? this.DEFAULT_MISSING_STRATEGY
        this.schemaList = (options.schemas ?? []) as T 
        this.schemaMap = this.makeSchemaMap(this.schemaList)
    }
}
export default SchemaConfig


