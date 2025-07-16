import applyMixins from "@src/types/mixin";
import WhereAble, { DataWithRowType, ConditionParamTypes } from "../WhereAble";
import BaseBuilder from "../BaseBuilder";
import QueryStoreAble, { BasicQueryQueueType } from "../QueryStore";
import Schema from "@src/core/DDL/implements/Schema";
import AndAbleQueryStore from "./AndAbleQueryStore";
import { QueryBuilderConfig } from "@src/types/configPicks";
import { BuilderConstructor } from "@src/types/BuilderCtorTypes";

export interface WhereAbleQueueType extends ConditionParamTypes, BasicQueryQueueType{}

// mixin class
interface WhereableAndQueryStore
<T extends Schema[], 
NextClassInstance extends QueryStoreAble<T, WhereAbleQueueType> ,
QueryQueueType extends WhereAbleQueueType = WhereAbleQueueType,
> extends AndAbleQueryStore<T, NextClassInstance, WhereAbleQueueType>, WhereAble<T>{}

abstract class WhereableAndQueryStore
<T extends Schema[], 
NextClassInstance extends QueryStoreAble<T, WhereAbleQueueType>,
QueryQueueType extends WhereAbleQueueType = WhereAbleQueueType>
extends BaseBuilder<T>{
    
    protected chainConditioning(data:string[][][]):DataWithRowType[][]{
        return data.map((rangeData, idx) => {
            const filterParam = this.queryQueue[idx]
            const indexedRangeData = this.indexingBatchData(rangeData)
            const result = this.conditioning(indexedRangeData, filterParam)
            return result
        })
    }

    protected async getChainConditionedData():Promise<DataWithRowType[][]>{
        this.saveCurrentQueryToQueue()
        const specifiedRanges = this.queryQueue.map((query) => this.config.sheet.composeRange(query.sheetName as string, this.config.sheet.DATA_STARTING_ROW)) // get all data related with sheet
        const dataFilters = this.makeDataFilters(specifiedRanges) // make datafilter for matching google apis
        const batchDatas = await this.fetchBatchData(this.config.spread.ID, dataFilters)
        const batchValues = this.extractValuesFromMatch(batchDatas)
        const indexedBatchValues = batchValues.map((batchValue) => this.indexingBatchData(batchValue))
        const conditionedBatchValues = indexedBatchValues.map((indexedBatchValue, idx) => this.conditioning(indexedBatchValue, this.queryQueue[idx]))
        return conditionedBatchValues
    }

    constructor(
        config:QueryBuilderConfig<T>,
        protected nextClassConstructor:BuilderConstructor<T, NextClassInstance>,
    ){
        super(config)
    }


}
applyMixins(WhereableAndQueryStore, [AndAbleQueryStore, WhereAble])

export default WhereableAndQueryStore