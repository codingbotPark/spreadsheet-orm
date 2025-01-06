export class SpreadsheetModel {
  static init(attributes: ModelAttributes, options: ModelOptions) {
    // 모델 초기화 - Sequelize와 유사한 인터페이스
    this.attributes = attributes;
    this.sheetName = options.tableName || this.name;
  }

  static async sync() {
    // 스프레드시트에 필요한 시트와 헤더 생성
  }
} 