import { sheets_v4 } from "googleapis";
import  { ConditionQueueType } from "../abstracts/mixins/ConditionChainQueryBuilder";
import SpreadsheetConfig from "config/SpreadsheetConfig";
import { DataTypes } from "core/DDL/SchemaManager";
import assertNotNull from "interface/assertType";
import RangeDataConditionChainQueryBuilder from "../abstracts/mixins/RangeDataConditionChainQueryBuilder";

export type UpdateValueType = DataTypes[] | {[key:string]:DataTypes}

class UpdateBuilder extends RangeDataConditionChainQueryBuilder<Promise<sheets_v4.Schema$UpdateValuesByDataFilterResponse[]>>{
    queryQueue: ConditionQueueType[] = [];

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
