import SpreadsheetConfig from "./SpreadConfig";


class SheetConfig extends SpreadsheetConfig{
    // lowest = 1
    DEFAULT_RECORDING_START_ROW = 1
    DEFAULT_COLUMN_NAME_SIZE = 1
    DATA_STARTING_ROW = this.DEFAULT_RECORDING_START_ROW + this.DEFAULT_COLUMN_NAME_SIZE
    // 따로 config 파일에서 사용하거나, default를 사용하거나
    
}

export default SheetConfig