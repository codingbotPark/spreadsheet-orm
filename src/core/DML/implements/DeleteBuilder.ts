import { sheets_v4 } from "googleapis";
import ConditionChainQueryBuilder, { ConditionQueueType } from "../abstracts/mixins/ConditionChainQueryBuilder";
import assertNotNull from "interface/assertType";


class DeleteBuilder<T extends {sheetName?:string}> extends ConditionChainQueryBuilder{
    protected sheetName?: T["sheetName"];
    queryQueue:ConditionQueueType[] = [];

    protected createQueryForQueue(): ConditionQueueType {
        assertNotNull(this.sheetName)
        return {
            sheetName:this.sheetName,
            filterFN:this.filterFN,
        }
    }
    
    async execute(this:DeleteBuilder<T & {sheetName:string}>): Promise<string[]> {
        assertNotNull(this.sheetName)

        const indexedConditionData = this.getConditionData()
        const deleteDataRangeArr = (await indexedConditionData).map((deleteQueueData, idx) => {
            const deleteValues = this.queryQueue[idx]
            const ranges = deleteQueueData.flatMap((data) => {
                const row = data.at(0) as number
                return this.compseRange (this.sheetName as string, {startRow:row, endRow:row})
            })
            return this.makeDeleteDataArr(ranges)
        }).flat()

        const response = await this.config.spreadsheetAPI.spreadsheets.values.batchClearByDataFilter({
            spreadsheetId:this.config.spreadsheetID,
            requestBody:{
                dataFilters:deleteDataRangeArr
            }
        })

        const result = response.data.clearedRanges
        if (!result) throw Error("error")

        return result

    }

    private async getConditionData(this:DeleteBuilder<T & {sheetName:string}>){

        this.addQueryToQueue(this.createQueryForQueue())
        
        const specifiedRange = this.compseRange(this.sheetName as string, this.config.DATA_STARTING_ROW)

        const response = await this.config.spreadsheetAPI.spreadsheets.values.batchGetByDataFilter({
            spreadsheetId:this.config.spreadsheetID,
            requestBody:{
                dataFilters:[
                    {
                        a1Range:specifiedRange,
                    }
                ]
            }
        })

        const result = response.data.valueRanges
        if (!result) throw Error("error")
            // extract values only
        const extractedValues = this.extractValuesFromMatch(result)
        // process where
        const conditionedExtractedValues = this.chainConditioning(extractedValues)
        return conditionedExtractedValues
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

}

export default DeleteBuilder