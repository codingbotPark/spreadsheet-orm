import { sheets_v4 } from "googleapis";
import  ConditionChainQueryBuilder, { ConditionQueueType } from "../abstracts/mixins/ConditionChainQueryBuilder";
import SpreadsheetConfig from "config/SpreadsheetConfig";
import { InputValueType } from "core/DDL/SchemaManager";

interface UpdateQueueType extends ConditionQueueType{
    updateValues:InputValueType
}

class UpdateBuilder<T extends {sheetName?:string}> extends ConditionChainQueryBuilder<typeof UpdateBuilder>{
    protected sheetName?: T["sheetName"];
    queryQueue: UpdateQueueType[] = [];

    protected createQueryForQueue(this:UpdateBuilder<T & {sheetName:string}>): UpdateQueueType {
        return {
            ...this.getCurrentCondition(),
            sheetName:this.sheetName,
            updateValues:this.updateValues
        }
    }

    from(sheetName: string) {
        this.sheetName = sheetName;
        const instance = new UpdateBuilder<T & {sheetName:string}>(this.config, this.updateValues)
        Object.assign(instance, this)
        return instance; // Ensure method chaining
    }

    async execute(this: UpdateBuilder<T & {sheetName:string}>) {
        const conditionedBatchValues = await this.getChainConditionedData()

        const updateDataArr = conditionedBatchValues.map((conditionedBatchValue, idx) => {
            const {updateValues, sheetName} = this.queryQueue[idx]
            const ranges = conditionedBatchValue.flatMap((data) => {
                const row = data.at(0) as number
                // make range for one each rows(that filtered with condition)
                return this.composeRange (sheetName as string, {startRow:row, endRow:row})  
            })
            // make arr because conditioned Datas are not one(1 updateValue per N conditionedData )
            return this.makeUpdateDataArr(ranges, updateValues)
        }).flat()

        const response = await this.config.spreadsheetAPI.spreadsheets.values.batchUpdateByDataFilter({
            spreadsheetId:this.config.spreadsheetID,
            requestBody:{
                data:updateDataArr,
                valueInputOption:"RAW"
            }
        })


        if (response.status !== 200) throw Error("error")
        return response.data.totalUpdatedRows
    }
    
    constructor(config:SpreadsheetConfig, private updateValues:InputValueType){
        super(config)
    }

    // and 를 위해 수정 필요
    private makeUpdateDataArr(ranges:string[], values:InputValueType):sheets_v4.Schema$DataFilterValueRange[]{

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

export default UpdateBuilder
