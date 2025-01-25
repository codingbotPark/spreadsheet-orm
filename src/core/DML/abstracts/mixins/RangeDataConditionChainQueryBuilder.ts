import applyMixins from "interface/mixin";
import RangeDataProcessor from "../RangeDataProcessor";
import ConditionChainQueryBuilder from "./ConditionChainQueryBuilder";


interface RangeDataConditionChainQueryBuilder<ExecuteReturn> extends ConditionChainQueryBuilder<ExecuteReturn>, RangeDataProcessor{}

abstract class RangeDataConditionChainQueryBuilder<ExecuteReturn> extends ConditionChainQueryBuilder<ExecuteReturn>{}
applyMixins(RangeDataConditionChainQueryBuilder, [ConditionChainQueryBuilder, RangeDataProcessor])

export default RangeDataConditionChainQueryBuilder