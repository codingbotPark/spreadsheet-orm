# Spreadsheet ORM (한국어)

[![NPM Version](https://img.shields.io/npm/v/spreadsheet-orm.svg)](https://www.npmjs.com/package/spreadsheet-orm)
[![NPM Downloads](https://img.shields.io/npm/dm/spreadsheet-orm.svg)](https://www.npmjs.com/package/spreadsheet-orm)
[![Build Status](https://github.com/codingbotPark/spreadsheet-orm/actions/workflows/node.js.yml/badge.svg)](https://github.com/codingbotPark/spreadsheet-orm/actions/workflows/node.js.yml)
[![License](https://img.shields.io/npm/l/spreadsheet-orm.svg)](https://github.com/codingbotPark/spreadsheet-orm/blob/main/LICENSE)

**Spreadsheet ORM**은 Google 스프레드시트를 데이터베이스처럼 사용할 수 있도록 설계된 강력하고 현대적인 타입-세이프(type-safe) ORM(객체-관계 매핑) 라이브러리입니다. 단순한 행/열 조작을 넘어, 스키마 관리, 마이그레이션, 유창한(fluent) 쿼리 빌더와 같은 데이터베이스 수준의 기능을 활용해 보세요.

## 주요 특징

- **타입-세이프 스키마 정의**: TypeScript로 테이블 구조를 정의하고, 완벽한 타입 안정성과 자동완성 기능을 누리세요.
- **강력한 쿼리 빌더**: `SELECT`, `INSERT`, `UPDATE`, `DELETE` 작업을 위한 유창하고 연쇄적인(chainable) API를 제공합니다.
- **스키마 동기화**: 데이터베이스 마이그레이션처럼, 코드에 정의된 스키마와 실제 스프레드시트 구조를 항상 동기화된 상태로 유지합니다.
- **자동 타입 추론**: 정의된 스키마로부터 TypeScript 타입을 자동으로 추론하여, 개발 전 과정에서 완벽한 타입 안정성을 보장합니다.
- **모던 API**: TypeScript와 ES 모듈로 구축되어 깔끔하고 직관적인 개발 경험을 제공합니다.

## 설치하기

```bash
# Yarn 사용 시
yarn add spreadsheet-orm

# NPM 사용 시
npm install spreadsheet-orm
```

## 빠른 시작

### 1. 인증 정보 (Credentials)

먼저 Google 서비스 계정 인증 정보가 필요합니다. 인증 정보를 발급받는 자세한 단계별 안내는 [**인증 정보 발급 가이드**](./GUIDE_CREDENTIALS.md)를 참고해 주세요.

### 2. 핵심 개념

전체 작업 흐름은 다음 세 단계로 이루어집니다:
1.  **스키마 정의**: `defineTable` 함수를 사용하여 테이블(시트)의 구조를 정의합니다.
2.  **클라이언트 초기화**: 인증 정보와 스키마를 사용하여 클라이언트 인스턴스를 생성합니다.
3.  **동기화 및 쿼리**: `schemaManager`로 스키마를 동기화하고, `queryBuilder`로 데이터를 조작합니다.

### 3. 전체 예제

다음은 시작을 위한 전체 예제 코드입니다.

```typescript
import { 
  createSpreadsheetClient, 
  defineTable, 
  fieldBuilder,
  type InferTableType
} from "spreadsheet-orm";

// 인증 정보는 환경 변수 등 안전한 방법으로 불러오는 것을 권장합니다.
import credentials from "./your-google-credentials.json";

// --- 1단계: 스키마 정의하기 ---

const Users = defineTable("Users", {
  id: fieldBuilder.string().default("UUID()").build(), // 기본값 설정
  name: fieldBuilder.string().build(),
  email: fieldBuilder.string().build(),
  age: fieldBuilder.number().optional().build(), // optional: 비워둘 수 있는 필드
  createdAt: fieldBuilder.date().default(new Date()).build(),
});

const Posts = defineTable("Posts", (field) => ({
  id: field.string().build(),
  title: field.string().build(),
  content: field.string().build(),
  // Users 테이블의 id 필드를 참조하는 "외래 키" 관계 생성
  authorId: field.reference(Users, "id").build(), 
}));


// --- 2단계: 스키마로부터 타입 자동 추론하기 ---

type User = InferTableType<typeof Users.fields>;
type Post = InferTableType<typeof Posts.fields>;

// 이제 완벽한 타입 안정성을 가집니다!
// const newUser: User = { id: "1", name: "Jane Doe", email: "jane@example.com" };


// --- 3단계: 클라이언트 초기화하기 ---

const client = createSpreadsheetClient({
  // 인증 정보
  email: credentials.client_email,
  privateKey: credentials.private_key,
  spreadsheetID: "YOUR_SPREADSHEET_ID_HERE",

  // 스키마 목록
  schemas: [Users, Posts],
  
  // (선택) 코드에는 있지만 실제 시트가 없을 때의 처리 전략
  onMissingSchema: "create", // 'create'(생성), 'ignore'(무시), 'error'(오류) 중 선택
});


// --- 4단계: 스키마 동기화 및 쿼리 실행하기 ---

async function main() {
  // 스키마를 실제 스프레드시트와 동기화합니다 (데이터베이스 마이그레이션과 유사).
  // 'smart' 모드는 데이터 손실 없이 없는 시트를 생성하고 컬럼 순서를 바로잡습니다.
  console.log("스키마 동기화를 시작합니다...");
  await client.schemaManager.sync({ mode: "smart" });
  console.log("동기화 완료!");

  // 쿼리 빌더를 사용하여 CRUD 작업 수행
  console.log("새로운 사용자를 추가합니다...");
  await client.query()
    .insert(["1", "John Doe", "john@example.com", 30]).into("Users")
    .and(["2", "Jane Smith", "jane@example.com"]).into("Users") // and()로 insert 연결
    .execute();
  
  console.log("사용자 목록을 조회합니다...");
  const allUsers = await client.query().select().from("Users").execute();
  console.log("모든 사용자:", allUsers);

  console.log("25세 이상인 사용자를 조회합니다...");
  const filteredUsers = await client.query()
    .select(["name", "email"])
    .from("Users")
    .where((row) => {
      const ageIndex = Users.orderedColumns.indexOf("age");
      // row[0]은 행 번호 인덱스이므로, 데이터 컬럼은 row[1]부터 시작합니다.
      return Number(row[ageIndex + 1]) > 25; 
    })
    .execute();
  console.log("필터링된 사용자:", filteredUsers);
}

main().catch(console.error);
```

## API 레퍼런스

### 스키마 정의 (`defineTable`)

`defineTable`을 사용하여 시트의 구조를 정의합니다. 두 번째 인자로는 각 값이 `.build()`로 끝나는 `fieldBuilder` 체인인 객체를 전달합니다.

-   `defineTable(sheetName, fields, [columnOrder])`

`fieldBuilder`는 각 데이터 타입에 맞는 메소드를 제공합니다:
-   `string()`
-   `number()`
-   `boolean()`
-   `date()`
-   `reference(schema, fieldName)`: 다른 테이블 필드와의 연결(참조)을 생성합니다.

각 필드 빌더는 `.build()`를 호출하기 전에 다음과 같은 수정자를 연결할 수 있습니다:
-   `.optional()`: 필드를 선택적으로(비워둘 수 있도록) 만듭니다.
-   `.default(value)`: 스키마 동기화 시 새로운 항목에 대한 기본값을 제공합니다.

### 스키마 관리 (`client.schemaManager`)

`schemaManager`는 코드에 정의된 내용과 실제 스프레드시트 구조가 일치하도록 보장합니다.

-   `sync({ mode })`: 스키마를 동기화합니다.
    -   `mode: 'strict'`: 불일치하는 부분이 있으면 오류를 발생시킵니다.
    -   `mode: 'smart'`: (권장) 데이터 손실 없이, 없는 시트를 생성하고 기존 시트의 컬럼 순서를 바로잡습니다.
    -   `mode: 'force'`: 스키마와 일치하지 않는 기존 시트를 덮어쓰므로 데이터가 손실될 수 있습니다.
    -   `mode: 'clean'`: 모든 데이터를 지우고 스키마 헤더만 새로 씁니다.

### 쿼리 빌더 (`client.queryBuilder`)

`client.queryBuilder` 메소드는 `SELECT`, `INSERT`, `UPDATE`, `DELETE` 작업을 위한 유창한 쿼리 빌더에 접근할 수 있도록 합니다. SQL과 유사한 직접 쿼리 기능(`client.query("SELECT ...")`)은 현재 구현되지 않은 플레이스홀더임을 참고해 주세요.

쿼리 빌더는 데이터 조작을 위한 유창한(fluent) API를 제공합니다.

-   **SELECT**:
    ```typescript
    // 모든 컬럼 선택
    await client.queryBuilder.select().from("Users").execute();

    // 특정 컬럼 선택 및 필터 적용
    await client.queryBuilder
      .select(["name", "email"])
      .from("Users")
      .where(row => Number(row[3]) > 30) // age(3번째 컬럼이라 가정)로 필터링
      .execute();
    ```

-   **INSERT**:
    ```typescript
    const newRow = ["3", "Peter Jones", "peter@example.com", 42];
    await client.queryBuilder.insert(newRow).into("Users").execute();
    ```

-   **UPDATE**:
    ```typescript
    const updatedData = ["Peter Jones Jr.", "peter.jr@example.com", 43];
    await client.queryBuilder
      .update(updatedData)
      .from("Users")
      .where(row => row[1] === "3") // id가 "3"인 행 대상
      .execute();
    ```

-   **DELETE**:
    ```typescript
    await client.queryBuilder
      .delete()
      .from("Users")
      .where(row => row[2] === "peter.jr@example.com") // 이메일이 일치하는 행 대상
      .execute();
    ```

-   **쿼리 연결 (`and`)**:
    여러 작업을 하나의 배치(batch) 요청으로 연결하여 성능을 향상시킬 수 있습니다.
    ```typescript
    await client.queryBuilder
      .insert(["4", "Alice", "alice@example.com"]).into("Users")
      .and()
      .insert(["p1", "My First Post", "...", "4"]).into("Posts")
      .execute();
    ```

쿼리 빌더는 데이터 조작을 위한 유창한(fluent) API를 제공합니다.

-   **SELECT**:
    ```typescript
    // 모든 컬럼 선택
    await client.query().select().from("Users").execute();

    // 특정 컬럼 선택 및 필터 적용
    await client.query()
      .select(["name", "email"])
      .from("Users")
      .where(row => Number(row[3]) > 30) // age(3번째 컬럼이라 가정)로 필터링
      .execute();
    ```

-   **INSERT**:
    ```typescript
    const newRow = ["3", "Peter Jones", "peter@example.com", 42];
    await client.query().insert(newRow).into("Users").execute();
    ```

-   **UPDATE**:
    ```typescript
    const updatedData = ["Peter Jones Jr.", "peter.jr@example.com", 43];
    await client.query()
      .update(updatedData)
      .from("Users")
      .where(row => row[1] === "3") // id가 "3"인 행 대상
      .execute();
    ```

-   **DELETE**:
    ```typescript
    await client.query()
      .delete()
      .from("Users")
      .where(row => row[2] === "peter.jr@example.com") // 이메일이 일치하는 행 대상
      .execute();
    ```

-   **쿼리 연결 (`and`)**:
    여러 작업을 하나의 배치(batch) 요청으로 연결하여 성능을 향상시킬 수 있습니다.
    ```typescript
    await client.query()
      .insert(["4", "Alice", "alice@example.com"]).into("Users")
      .and()
      .insert(["p1", "My First Post", "...", "4"]).into("Posts")
      .execute();
    ```

## 기여하기

언제나 기여를 환영합니다! 편하게 Pull Request를 보내주시거나 이슈를 등록해주세요.

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.
