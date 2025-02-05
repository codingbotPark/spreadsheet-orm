# spreadsheet-orm

## Overview
`spreadsheet-orm`은 Google 스프레드시트를 데이터베이스로 사용하는 데 설계된 Object-Relational Mapping (ORM) 라이브러리입니다. 스프레드시트 데이터에 대한 쿼리 빌더와 스키마 관리 기능을 제공합니다.

## Features
- **Google Sheets API Integration**: Google 시트와 원활하게 연결하고 상호작용합니다.
- **Schema Management**: 스프레드시트 스키마를 정의하고 관리합니다.
- **Query Builder**: 스프레드시트 데이터에 대한 쿼리를 구축하고 실행합니다.

## Installation
패키지를 설치하려면 Yarn을 사용하세요:
```bash
yarn add spreadsheet-orm
```

## Usage
### Basic Setup

```typescript
import { ConnectionConfig } from 'spreadsheet-orm';
const config = new ConnectionConfig({
  spreadsheetID: 'your-spreadsheet-id',
  email: 'your-email@example.com',
  privateKey: 'your-private-key',
});
const connection = new BaseConnection({ config });
```

### Error Handling
Google Sheets API를 작업하는 동안 오류가 발생할 수 있습니다. 이를 처리하는 방법은 다음과 같습니다:

```typescript
private async checkValidSpreadsheetID(spreadsheetID: string) {
  try {
    const response = await this.spreadsheetAPI.spreadsheets.get({
      spreadsheetId: spreadsheetID,
    });
    return response.data;
  } catch (error: unknown) {
    if ((error as GaxiosError).response) {
      const err = error as GaxiosError;
      const statusCode = err.response?.status;
      const errorMessage = err.response?.data?.error?.message;
      // 특정 오류 케이스를 처리하세요
    }
    throw error;
  }
}
```

## Development
### Scripts
- **Build**: TypeScript 파일을 컴파일합니다.
  ```bash
  yarn build
  ```
- **Start**: 애플리케이션을 실행합니다.
  ```bash
  yarn start
  ```
- **Development**: 핫 리로딩과 함께 개발 모드에서 애플리케이션을 시작합니다.
  ```bash
  yarn dev
  ```

## Contributing
기여가 환영합니다! 문제를 열거나 풀 리퀘스트를 제출하세요.

## License
이 프로젝트는 MIT 라이선스에 따라 라이선스가 부여되었습니다.