import { sheets_v4 } from "googleapis";

class QueryBuilder {
    private range: string = ""; // A1:D10 같은 범위를 설정
    private conditions: { column: string; value: string | number }[] = [];
    private limitRows: number | null = null;
    private spreadsheetId: string | null = null;

    constructor(private spreadsheetAPI: sheets_v4.Sheets) {}

    /**
     * 스프레드시트 ID 설정
     */
    from(spreadsheetId: string, range: string): QueryBuilder {
        this.spreadsheetId = spreadsheetId;
        this.range = range;
        return this;
    }

    /**
     * 조건 추가
     */
    where(column: string, value: string | number): QueryBuilder {
        this.conditions.push({ column, value });
        return this;
    }

    /**
     * 조회할 행의 제한 설정
     */
    limit(rows: number): QueryBuilder {
        this.limitRows = rows;
        return this;
    }

    /**
     * 쿼리를 실행하여 데이터를 가져옴
     */
    async execute(): Promise<any[]> {
        if (!this.spreadsheetId || !this.range) {
            throw new Error("Spreadsheet ID and range must be specified before executing a query.");
        }

        try {
            // Google Sheets API를 사용하여 데이터 가져오기
            const response = await this.spreadsheetAPI.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: this.range,
            });

            let data = response.data.values || [];

            // where 조건 필터링
            if (this.conditions.length > 0) {
                data = data.filter((row) => {
                    return this.conditions.every(({ column, value }) => {
                        const columnIndex = this.getColumnIndex(column);
                        return row[columnIndex] === value;
                    });
                });
            }

            // limit 적용
            if (this.limitRows !== null) {
                data = data.slice(0, this.limitRows);
            }

            return data;
        } catch (error) {
            throw new Error(`Error executing query: ${error}`);
        }
    }

    /**
     * 열 이름(A, B, C 등)을 인덱스로 변환
     */
    private getColumnIndex(column: string): number {
        return column.toUpperCase().charCodeAt(0) - "A".charCodeAt(0);
    }
}

export default QueryBuilder;