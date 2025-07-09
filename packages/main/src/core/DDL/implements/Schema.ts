import { FieldsType } from "../defineTable";

class Schema<Name extends string = string, T extends FieldsType = FieldsType>{
    // starting position 및 missing Startegy 개별 설정 가능하게해야함
    constructor(
        public sheetName:Name,
        public fields:T,
        public orderedColumns: (keyof T)[]
    ){}
}

export default Schema