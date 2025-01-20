import { sheets_v4 } from "googleapis";
import ConditionChainQueryBuilder from "../abstracts/ConditionChainQueryBuilder";


class UpdateBuilder extends ConditionChainQueryBuilder<Promise<sheets_v4.Schema$UpdateValuesResponse[]>>{

    and(){
        return this
    }

    execute(): sheets_v4.Schema$UpdateValuesResponse {

    }
    
}

export default UpdateBuilder
