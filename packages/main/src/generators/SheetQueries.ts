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

  static setNumberTypedCell(
    type:"number" | "date", 
    range:sheets_v4.Schema$GridRange)
    :sheets_v4.Schema$Request{
    const numberFormat = {
        "number":{
            type:"NUMBER",
        },
        "date":{
            type:"DATE_TIME",
        }
    }
    return {
        repeatCell:{
            range:{
              startRowIndex:2,
              endRowIndex:1000000,
              ...range
            },
            cell:{
                userEnteredFormat: {
                    numberFormat:numberFormat[type],
                }
            },
            fields:"userEnteredFormat.numberFormat"
        }
    }
  }


}