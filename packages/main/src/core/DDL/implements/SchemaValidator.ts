import { sheets_v4 } from "googleapis";
import { SchemaManagerConfig } from "@src/types/configPicks";
import Schema from "./Schema";

// This type is tightly coupled with the validation process.
export type SchemaStableReport = {
   stable:boolean, 
   fieldsStatus:(string | null | false)[],
   fixable?:boolean,
   unknownHeaders?: string[], // 스키마에 정의되지 않은 헤더 목록
   fixRequest:{
      dataSetting:sheets_v4.Schema$Request[],
      columnMoving:sheets_v4.Schema$Request[],
      headerSetting:sheets_v4.Schema$Request[],
   },
   schema:Schema
}

export class SchemaValidator<T extends Schema[]> {
   private report: SchemaStableReport;
   private workingHeaders: string[];
   private evaluableRows: string[][];

   constructor(
      private schema: Schema,
      private sheetId: number,
      data: string[][],
      private config: SchemaManagerConfig<T>
   ) {
      this.report = this._initializeReport();
      const headers = data.at(0) ?? [];
      this.workingHeaders = [...headers];
      this.evaluableRows = this.removeNonEvaluableRows(data.slice(this.config.sheet.DEFAULT_COLUMN_NAME_SIZE));
   }

   public validate(): SchemaStableReport {

      this.schema.orderedColumns.forEach((definedField, targetIdx) => {
         this._validateField(definedField, targetIdx);
      });

      this._addHeaderCreationRequests();


      const isEmtpySchema = this.report.fieldsStatus.every(s => s === null);
      if (isEmtpySchema) {
         this.report.stable = true;
         this._markReportAsFixable(); // Ensure it's marked as fixable
      }

      return this.report;
   }

   private isColumnEntirelyEmpty(rows: string[][], columnIdx: number) {
      // 해당 인덱스가 존재하지 않으면 true (빈 것으로 간주)
      if (rows.length > 0 && columnIdx >= rows[0].length) return true;
      return rows.every((row) => (row[columnIdx] ?? "").trim() === "");
   }

   private removeNonEvaluableRows(rows: string[][]): string[][] {
      const reversedIndex = [...rows].reverse().findIndex(row => row.some(cell => (cell ?? "").trim() !== ""));
      const lastIndex = reversedIndex === -1 ? 0 : rows.length - reversedIndex;
      return rows.slice(0, lastIndex);
   }

   private _initializeReport(): SchemaStableReport {
      return {
         stable: true,
         fixable: undefined,
         fieldsStatus: Array(this.schema.orderedColumns.length).fill(true),
         unknownHeaders: [],
         fixRequest: { dataSetting: [], columnMoving: [], headerSetting: [] },
         schema: this.schema
      };
   }

   private _markReportAsFixable() {
      if (this.report.fixable === undefined) {
         this.report.fixable = true;
      }
   }

   private _validateField(definedField: string, targetIdx: number) {
      const actualFieldIdx = this.workingHeaders.indexOf(definedField);

      if (actualFieldIdx < 0) {
         this._handleMissingField(targetIdx);
      } else {
         this._handleExistingField(definedField, targetIdx, actualFieldIdx);
      }
   }

   private _handleMissingField(targetIdx: number) {
      this.report.stable = false;
      // 헤더가 위치해야 할 컬럼에 데이터가 있는지 정밀하게 확인합니다.
      if (!this.isColumnEntirelyEmpty(this.evaluableRows, targetIdx)) {
         // 데이터가 있다면, 수정 불가능 상태로 만듭니다.
         this.report.fixable = false;
         this.report.fieldsStatus[targetIdx] = false;
      } else {
         // 데이터가 없다면, 헤더를 추가할 수 있는 상태로 표시합니다.
         this.report.fieldsStatus[targetIdx] = null; 
      }
   }

   private _handleExistingField(definedField: string, targetIdx: number, actualFieldIdx: number) {
      this._validateFieldData(definedField, targetIdx, actualFieldIdx);
      this._validateFieldPosition(targetIdx, actualFieldIdx);
   }

   private _validateFieldData(definedField: string, targetIdx: number, actualFieldIdx: number) {
      const fieldDefinition = this.schema.fields[definedField];
      // required인 값 중 빈 값이 있을 때
      if (fieldDefinition.optional === false && !this.isColumnEntirelyEmpty(this.evaluableRows, actualFieldIdx)) {
         this.report.fixable = false;
         this.report.stable = false;
         this.report.fieldsStatus[targetIdx] = false;
      }
      // 기본값이 설정되어있지만 빈 값이 있을 때
      if (fieldDefinition.default !== undefined && !this.isColumnEntirelyEmpty(this.evaluableRows, actualFieldIdx)) {
         this._markReportAsFixable();
         const request = this._createDefaultValueUpdateRequest(definedField, actualFieldIdx);
         this.report.fixRequest.dataSetting.push(request);
      }
   }

   private _createDefaultValueUpdateRequest(definedField: string, actualFieldIdx: number): sheets_v4.Schema$Request {
      const columnDataRowsForm: sheets_v4.Schema$RowData[] = this.evaluableRows.map((row) => {
         let value = row[actualFieldIdx];
         if ((value ?? "").trim() === "") {
            value = (this.schema.fields[definedField].default)?.toString() ?? "";
         }
         return { values: [{ userEnteredValue: { stringValue: value } }] };
      });

      const startRowIndex = this.config.sheet.DATA_STARTING_ROW - 1;
      const columnIndex = this.config.sheet.columnToNumber(this.config.sheet.DEFAULT_RECORDING_START_COLUMN) - 1 + actualFieldIdx;

      return {
         updateCells: {
            range: {
               sheetId: this.sheetId,
               startRowIndex,
               endRowIndex: startRowIndex + columnDataRowsForm.length,
               startColumnIndex: columnIndex,
               endColumnIndex: columnIndex + 1
            },
            rows: columnDataRowsForm,
            fields: "userEnteredValue"
         }
      };
   }

   private _validateFieldPosition(targetIdx: number, actualFieldIdx: number) {
      if (actualFieldIdx !== targetIdx && this.report.fieldsStatus[targetIdx]) {
         this._markReportAsFixable();
         const request = this._createColumnMoveRequest(targetIdx, actualFieldIdx);
         this.report.fixRequest.columnMoving.push(request);

         const [moved] = this.workingHeaders.splice(actualFieldIdx, 1);
         this.workingHeaders.splice(targetIdx, 0, moved);
      }
   }

   private _createColumnMoveRequest(targetIdx: number, actualFieldIdx: number): sheets_v4.Schema$Request {
      const ColumnRecordingIndex = this.config.sheet.columnToNumber(this.config.sheet.DEFAULT_RECORDING_START_COLUMN) - 1;
      return {
         moveDimension: {
            source: {
               sheetId: this.sheetId,
               dimension: 'COLUMNS',
               startIndex: ColumnRecordingIndex + actualFieldIdx,
               endIndex: ColumnRecordingIndex + actualFieldIdx + 1
            },
            destinationIndex: ColumnRecordingIndex + targetIdx
         }
      };
   }

   private _addHeaderCreationRequests() {
      this.report.fieldsStatus.forEach((status, targetIdx) => {
         if (status === null && (this.workingHeaders.at(targetIdx) ?? "").trim() === "") {
            this._markReportAsFixable();
            const request = this._createHeaderUpdateRequest(targetIdx);
            this.report.fixRequest.headerSetting.push(request);
         }
      });
   }

   private _createHeaderUpdateRequest(targetIdx: number): sheets_v4.Schema$Request {
      const columnIdx = this.config.sheet.columnToNumber(this.config.sheet.DEFAULT_RECORDING_START_COLUMN) - 1;
      return {
         updateCells: {
            range: {
               sheetId: this.sheetId,
               startRowIndex: this.config.sheet.DEFAULT_RECORDING_START_ROW - 1,
               endRowIndex: this.config.sheet.DEFAULT_RECORDING_START_ROW,
               startColumnIndex: columnIdx + targetIdx,
               endColumnIndex: columnIdx + targetIdx + 1
            },
            rows: [{ values: [{ userEnteredValue: { stringValue: this.schema.orderedColumns[targetIdx] } }] }],
            fields: "userEnteredValue"
         }
      };
   }
}
