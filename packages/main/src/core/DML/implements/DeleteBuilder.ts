import { sheets_v4 } from "googleapis";
import ConditionChainQueryBuilder, { ConditionQueueType } from "../abstracts/mixins/ConditionChainQueryBuilder";
import assertNotNull from "@src/types/assertType";
import SpreadsheetConfig from "@src/config/SpreadConfig";
import { QueryConfig } from "@src/types/\bconfigPicks";


// class DeleteBuilder<T extends {sheetName?:string}> extends ConditionChainQueryBuilder<DeleteBuilderCtorParamType>{
class DeleteBuilder<T extends {sheetName?:string}> extends ConditionChainQueryBuilder<typeof DeleteBuilder>{
    protected sheetName?: T["sheetName"];
    queryQueue:ConditionQueueType[] = [];

    protected createQueryForQueue(): ConditionQueueType {
        assertNotNull(this.sheetName)
        return {
            sheetName:this.sheetName,
            filterFN:this.filterFN,
        }
    }
    
    async execute(this:DeleteBuilder<T & {sheetName:string}>) {
        const conditionedBatchValues = await this.getChainConditionedData()

        const deleteDataArr = conditionedBatchValues.map((conditionedBatchValue,idx) => {
            const {sheetName} = this.queryQueue[idx]
            const ranges = conditionedBatchValue.flatMap((data) => {
            const row = data.at(0) as number
                return this.composeRange (sheetName as string, {startRow:row, endRow:row})
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

    from(sheetName: string){
        this.sheetName = sheetName;
        const instance = new DeleteBuilder<T & {sheetName:string}>(this.config)
        Object.assign(instance,this)
        return instance; // Ensure method chaining
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

    constructor(config:QueryConfig){
        super(config)
    }

}

export default DeleteBuilder