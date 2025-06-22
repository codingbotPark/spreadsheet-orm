import applyMixins from "@src/types/mixin";
import AndAble from "../AndAble";
import WhereAble, { DataWithRowType, ConditionParamTypes } from "../WhereAble";
import BaseBuilder from "../BaseBuilder";
import QueryStoreAble, { BasicQueryQueueType } from "../QueryStore";
import Schema from "@src/core/DDL/implements/Schema";
import AndAbleQueryStore from "./AndAbleQueryStore";
import { QueryBuilderConfig } from "@src/types/configPicks";
import { BuilderConstructor } from "@src/types/BuilderCtorParamType";

export interface WhereAbleQueueType extends ConditionParamTypes, BasicQueryQueueType{}

// mixin class
interface WhereableAndQueryStore
<T extends Schema[], 
NextClass extends QueryStoreAble<T, QueryQueueType> ,
ReturnCtor extends BuilderConstructor<T, NextClass>, 
QueryQueueType extends WhereAbleQueueType = WhereAbleQueueType,
> extends AndAbleQueryStore<T, NextClass, ReturnCtor, QueryQueueType>, WhereAble<T>{}

abstract class WhereableAndQueryStore
<T extends Schema[], 
NextClass extends QueryStoreAble<T, QueryQueueType>,
ReturnCtor extends BuilderConstructor<T, NextClass>,
QueryQueueType extends WhereAbleQueueType = WhereAbleQueueType>
extends BaseBuilder<T>{

    protected inheritState(target:NextClass){
        target['sheetName'] = this.sheetName
        target['queryQueue'] = this.queryQueue
    }

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


}
applyMixins(WhereableAndQueryStore, [AndAbleQueryStore, WhereAble])

export default WhereableAndQueryStore