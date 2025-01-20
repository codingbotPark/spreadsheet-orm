import { sheets_v4 } from "googleapis";
import ConditionalBuilder from "../abstracts/ConditionBuilder";


class DeleteBuilder extends ConditionalBuilder<sheets_v4.Schema$ClearValuesResponse>{
    execute(): sheets_v4.Schema$ClearValuesResponse {
        
    }

}

export default DeleteBuilder