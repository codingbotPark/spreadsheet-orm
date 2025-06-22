import { sheets_v4 } from "googleapis";
import { QueryBuilderConfig } from "@src/types/configPicks";
import { DataTypes } from "@src/core/DDL/abstracts/BaseFieldBuilder";
import QueryStore from "../abstracts/QueryStore";
import WhereableAndQueryStore, { WhereAbleQueueType } from "../abstracts/mixins/WhereableAndQueryStore";
import Schema from "@src/core/DDL/implements/Schema";

export type UpdateValueType = DataTypes[] | {[key:string]:DataTypes}
interface UpdateQueryQueueType extends WhereAbleQueueType{
    updateValues:UpdateValueType
}

class UpdateBuilder<T extends Schema[]> extends QueryStore<T, UpdateQueryQueueType>{
    from(sheetName: string) {
        return new SettedUpdateBuilder(this.config, this.updateValues, sheetName)
    }
    
    constructor(config:QueryBuilderConfig<T>, private updateValues:UpdateValueType){
        super(config)
    }
}

export default UpdateBuilder

class SettedUpdateBuilder<T extends Schema[]>
extends WhereableAndQueryStore<T, UpdateBuilder<T>, UpdateQueryQueueType>{
    constructor(config:QueryBuilderConfig<T>, private updateValues:UpdateValueType, sheetName:T[number]['sheetName']){
        super(config)
    }

    async execute() {
        const conditionedBatchValues = await this.getChainConditionedData()

        const updateDataArr = conditionedBatchValues.map((conditionedBatchValue, idx) => {
            const {updateValues, sheetName} = this.queryQueue[idx]
            const ranges = conditionedBatchValue.flatMap((data) => {
                const row = data.at(0) as number
                // make range for one each rows(that filtered with condition)
                return this.config.sheet.composeRange(sheetName as string, {startRow:row, endRow:row})  
            })
            // make arr because conditioned Datas are not one(1 updateValue per N conditionedData )
            return this.makeUpdateDataArr(ranges, updateValues)
        }).flat()

        const response = await this.config.spread.API.spreadsheets.values.batchUpdateByDataFilter({
            spreadsheetId:this.config.spread.ID,
            requestBody:{
                data:updateDataArr,
                valueInputOption:"RAW"
            }
        })


        if (response.status !== 200) throw Error("error")
        return response.data.totalUpdatedRows
    }

    protected createQueryForQueue(): UpdateQueryQueueType {
        return {
            ...this.getCurrentCondition(),
            sheetName:this.sheetName,
            updateValues:this.updateValues
        }
    }


    // and 를 위해 수정 필요
    private makeUpdateDataArr(ranges:string[], values:UpdateValueType):sheets_v4.Schema$DataFilterValueRange[]{

        if (Array.isArray(values)){
            return ranges.reduce((updateDataArr:sheets_v4.Schema$DataFilterValueRange[] ,range) => {
                updateDataArr.push({
                    dataFilter:{
                        a1Range:range,
                    },
                    majorDimension:"ROWS",
                    values:[values]
                })
                return updateDataArr
            }, [])
        }

        // 객체일 땐, matchColumnWithDefine 을 DDL과 추가하기
        return []
    }

}