import { sheets_v4 } from "googleapis";
import { GaxiosPromise } from "gaxios";
import ConditionBuilder from "../abstracts/ConditionBuilder";
import ChainQueryBuilder from "../abstracts/ChainQueryBuilder";
import ConditionChainQueryBuilder from "../abstracts/ConditionChainQueryBuilder";
import SpreadsheetConfig from "config/SpreadsheetConfig";

const columnDummy:{
    name:string,
    column:string
}[] = [
    {
        name:"name",
        column:"A"
    },{
        name:"class",
        column:"B"
    }
]

class SelectBuilder extends ConditionChainQueryBuilder<Promise<sheets_v4.Schema$MatchedValueRange[]>>{
    constructor(config:SpreadsheetConfig, protected targetColumn:string[]){
        super(config)
    }

    
    async execute(){
        

        const response = await this.config.spreadsheetAPI.spreadsheets.values.batchGetByDataFilter({
            spreadsheetId:this.config.spreadsheetID,
            requestBody:{
                dataFilters:[
                    {
                        
                    }
                ]
            }
        })

        const result = response.data.valueRanges
        if (!result) throw Error("error")

        // return result
        return result
    }

    from(sheetName:string){
        this.sheetName = sheetName
    }
    

}

export default SelectBuilder