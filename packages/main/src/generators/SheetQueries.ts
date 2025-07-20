import { sheets_v4 } from "googleapis";

export class SheetQueries {
  static addSheet(title:string):sheets_v4.Schema$Request{
    return { addSheet: { properties: { title }}}
  }

  static deleteSheet(sheetId: number):sheets_v4.Schema$Request {
    return { deleteSheet: { sheetId } };
  }

  static clearSheet(sheetId:number):sheets_v4.Schema$Request{
    return {
        updateCells: {
        range: {
            sheetId,
        },
        fields: '*' // 모든 필드 삭제 (값 + 포맷 포함)
        }
    }
  }

  static repeatTypedCell(
    sheetId:number, 
    type:"number" | "date", 
    range:Omit<sheets_v4.Schema$GridRange, "sheetId"> = {endRowIndex:1000000})
    :sheets_v4.Schema$Request{
    const numberFormat = {
        "number":{
            type:"NUMBER"
        },
        "date":{
            type:"DATE_TIME",
            pattern: "yyyy-mm-dd hh:mm:ss"
        }
    }

    return {
        repeatCell:{
            range:{
                sheetId,
                ...range,
            },
            cell:{
                userEnteredFormat: {
                    numberFormat:numberFormat[type]
                }
            },
            fields:"userEnteredFormat.numberFormat"
        }
    }
  }


}