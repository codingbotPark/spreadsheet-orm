import { SchemaType } from "@src/core/DDL/defineTable"

type MissingSchemaStrategy = 'create' | 'ignore' | 'error'
export interface SchemaConfigOptions{
    schemas:SchemaType[],
    onMissingSchema?:MissingSchemaStrategy
}

// for default Schema
class SchemaConfig{
    definedSchema:SchemaType[]
    missingSchemaStrategy:MissingSchemaStrategy

    constructor(options:SchemaConfigOptions){
       this.checkFormat(options)
       this.definedSchema = options.schemas
       this.missingSchemaStrategy = options.onMissingSchema ?? 'create'
    }

    private checkFormat(options:SchemaConfigOptions){}
}

export default SchemaConfig