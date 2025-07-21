import { DataTypes, LiteralDataTypes } from "@src/core/DDL/abstracts/BaseFieldBuilder";
import Schema from "@src/core/DDL/implements/Schema"

export type MissingSchemaStrategy = 'create' | 'ignore' | 'error'

// 이 인터페이스는 이제 Configs.ts에서 직접 정의되므로 주석 처리하거나 삭제할 수 있습니다.
export interface SchemaConfigOptions<T extends Schema[]> {
    onMissingSchema?: MissingSchemaStrategy;
    recordDetailType?:boolean,
    parseDetailType?:boolean,
    schemas?: T;
}

export type SchemaMap<T extends Schema[]> = {
    [K in T[number]['sheetName']]: Extract<T[number], { sheetName: K }>
}

class SchemaConfig<T extends Schema[]>{
    readonly DEFAULT_MISSING_STRATEGY: MissingSchemaStrategy = 'create' 

    missingSchemaStartegy: MissingSchemaStrategy
    recordDetailType: boolean
    parseDetailType: boolean
    
    readonly schemaList: T;
    readonly schemaMap: SchemaMap<T>;
    schemaSetted:boolean

    // type parser for spreadsheet values
    typeParsers:Record<LiteralDataTypes, (value:string) => DataTypes> = {
        boolean:(value) => value === "true",
        date: (value) => new Date(value),
        number: (value) => Number(value),
        string: (value) => value,
    }

    constructor({
        onMissingSchema = this.DEFAULT_MISSING_STRATEGY,
        recordDetailType = true,
        parseDetailType = true,
        schemas = [] as unknown as T,
    }: SchemaConfigOptions<T>) {
        this.missingSchemaStartegy = onMissingSchema;
        this.recordDetailType = recordDetailType;
        this.parseDetailType = parseDetailType;
        
        this.schemaList = schemas;
        this.schemaSetted = this.schemaList.length > 0;
        this.schemaMap = this.makeSchemaMap(this.schemaList);
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
export default SchemaConfig


