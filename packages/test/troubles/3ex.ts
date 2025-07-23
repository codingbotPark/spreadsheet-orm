// @ts-nocheck
for (const fieldName in schema.fields) {
    const field = schema.fields[fieldName];
    if (field.dataType === 'date' && field.timestampAtCreated) {
        const columnIndex = field.columnOrder - 1; // columnOrder는 1부터 시작, 배열 인덱스는 0부터 시작
        const now = new Date();
        newRow[columnIndex] = SpreadConfig.jsDateToSheetsSerial(now);
    }
}