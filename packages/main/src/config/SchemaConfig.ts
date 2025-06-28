import Schema from "@src/core/DDL/implements/Schema"

type MissingSchemaStrategy = 'create' | 'ignore' | 'error'

export interface SchemaConfigOptions<T extends Schema[]> {
    schemas?: T,
    onMissingSchema?: MissingSchemaStrategy
}

// type ExtractSchemaName<S> = S extends Schema<infer Name, any> ? Name : never;
// type ExtractSchemaFields<S> = S extends Schema<any, infer Fields> ? Fields : never;

// type SchemaMap<T extends readonly Schema[]> = {
//   [K in T[number] as ExtractSchemaName<K>]: ExtractSchemaFields<K>
// };

export type SchemaMap<T extends Schema[]> = {
    [K in T[number]['sheetName']]: Extract<T[number], { sheetName: K }>
}

// export type SchemaMap<T extends readonly Schema[]> = {[S in T[number] as S['sheetName']]: S}
// export type SchemaMap<T extends readonly Schema[], Name extends T[number]['sheetName']> = Record<Name, T>
// export type SchemaMap<T extends readonly Schema[], Name extends T[number]['sheetName']> = {[K in T[number] as K['sheetName']] : K}
// export type SchemaMap<T extends Schema[]> = {[K in T[number]['sheetName']]:Extract<T[number],{sheetName:K}>}


// for default Schema
class SchemaConfig<T extends Schema[]>{
    readonly schemaList?: T;
    readonly schemaMap?: SchemaMap<T>;

    missingSchemaStrategy:MissingSchemaStrategy // for specific option for schema
    readonly DEFAULT_MISSING_STRATEGY: MissingSchemaStrategy = 'create'

    isSchemaSetted(): this is SettedSchemaConfig<T>{
        const schemaMapSetted = (this.schemaMap && !!Object.keys(this.schemaMap).length) ?? false
        const schemaListSetted = (this.schemaList && !!this.schemaList.length) ?? false
        return schemaListSetted && schemaMapSetted
    }

    constructor(options: SchemaConfigOptions<T>) {
    // constructor(schemas: L extends Schema[]) {
        this.schemaList = options.schemas
        this.schemaMap = options.schemas && this.makeSchemaMap(options.schemas)
        this.missingSchemaStrategy = options.onMissingSchema ?? this.DEFAULT_MISSING_STRATEGY
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

export interface SettedSchemaConfig<T extends Schema[]> extends SchemaConfig<T> {
    schemaList: T;
    schemaMap: SchemaMap<T>;
  }

