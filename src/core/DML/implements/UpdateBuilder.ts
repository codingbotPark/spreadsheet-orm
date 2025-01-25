import { sheets_v4 } from "googleapis";
import ConditionChainQueryBuilder from "../abstracts/ConditionChainQueryBuilder";
import SpreadsheetConfig from "config/SpreadsheetConfig";
import { DataTypes } from "core/DDL/SchemaManager";
import assertNotNull from "interface/assertType";

export type UpdateValueType = DataTypes[] | {[key:string]:DataTypes}

class UpdateBuilder extends ConditionChainQueryBuilder<Promise<sheets_v4.Schema$UpdateValuesByDataFilterResponse[]>>{

    from(sheetName: string): this {
        this.sheetName = sheetName;
        return this; // Ensure method chaining
    }

    async execute(): sheets_v4.Schema$UpdateValuesByDataFilterResponse {
        assertNotNull(this.sheetName)
        
    }
    
    constructor(config:SpreadsheetConfig, private updateValues:UpdateValueType){
        super(config)
    }
}

export default UpdateBuilder
