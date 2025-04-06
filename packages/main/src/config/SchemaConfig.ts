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

    DEFAULT_MISSING_STRATEGY:MissingSchemaStrategy = 'create'

    constructor(options:SchemaConfigOptions){
       this.checkSchemaFormat(options)
       this.definedSchema = options.schemas
       this.missingSchemaStrategy = options.onMissingSchema ?? this.DEFAULT_MISSING_STRATEGY
    }

    private checkSchemaFormat(options:SchemaConfigOptions){}
}

export default SchemaConfig