import { sheets_v4 } from "googleapis";
import assertNotNull from "@src/types/assertType";
import { QueryBuilderConfig } from "@src/types/configPicks";
import Schema from "@src/core/DDL/implements/Schema";
import QueryStore from "../abstracts/QueryStore";
import WhereableAndQueryStore, { WhereAbleQueueType } from "../abstracts/mixins/WhereableAndQueryStore";


// class DeleteBuilder<T extends {sheetName?:string}> extends ConditionChainQueryBuilder<DeleteBuilderCtorParamType>{
class DeleteBuilder<T extends Schema[]> extends QueryStore<T, WhereAbleQueueType>{
    from(sheetName: T[number]['sheetName']){
        return new SettedDeleteBuilder(this.config, sheetName, this.queryQueue)
    }

    constructor(config:QueryBuilderConfig<T>){
        super(config)
    }
}

export default DeleteBuilder


class SettedDeleteBuilder<T extends Schema[]> extends WhereableAndQueryStore<T, DeleteBuilder<T>>{
    constructor(config:QueryBuilderConfig<T>, protected sheetName:T[number]['sheetName'], queryQueue:WhereAbleQueueType[]){
        super(config, DeleteBuilder, queryQueue)
    }

    protected createQueryForQueue(): WhereAbleQueueType {
        assertNotNull(this.sheetName)
        return {
            sheetName:this.sheetName,
            filterFN:this.filterFN,
        }
    }


    async execute() {
        const conditionedBatchValues = await this.getChainConditionedData()

        const deleteDataArr = conditionedBatchValues.map((conditionedBatchValue,idx) => {
            const {sheetName} = this.queryQueue[idx]
            const ranges = conditionedBatchValue.flatMap((data) => {
            const row = data.at(0) as number
                return this.config.sheet.composeRange(sheetName as string, {startRow:row, endRow:row})
            })
            return this.makeDeleteDataArr(ranges)
        }).flat()
        const response = await this.config.spread.API.spreadsheets.values.batchClearByDataFilter({
            spreadsheetId:this.config.spread.ID,
            requestBody:{
                dataFilters: deleteDataArr
            }
        })

        if (response.status !== 200) throw Error("error")
        return response.data.clearedRanges

    }
    

    // and 를 위해 수정 필요
    private makeDeleteDataArr(ranges:string[]){
        return ranges.reduce((deleteDataArr:sheets_v4.Schema$DataFilter[], range) => {
            deleteDataArr.push({
                a1Range:range
            })
            return deleteDataArr
        }, [])
    }
}