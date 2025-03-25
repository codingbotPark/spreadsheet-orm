# spreadsheet-orm

## Overview
`spreadsheet-orm` is an Object-Relational Mapping (ORM) library designed for using Google Spreadsheets as a database. It provides a query builder and schema management features for spreadsheet data.

## Features
- **Google Sheets API Integration**: Seamlessly connects and interacts with Google Sheets.
- **Schema Management**: Defines and manages the schema of spreadsheets.
- **Query Builder**: Builds and executes queries for spreadsheet data.

## Installation
To install the package, use Yarn:
```bash
yarn add spreadsheet-orm
```

## Usage

### Connection
```typescript
import createSpreadsheetClient,{ Credentials } from "spreadsheet-orm"
import credentials from "./yourGoogleCredentials.json"

const connectionParameters:Credentials = credentials
const spreadsheetClient = createSpreadsheetClient({
    email:connectionParameters.client_email,
    privateKey:connectionParameters.private_key,
    spreadsheetID:connectionParameters.spreadsheetID
})
```
### Query Operations

#### Select
```typescript
// Select all data from sheet
const results = await spreadsheetClient.queryBuilder.select().from('Users').execute();

// Select with condition
const filtered = await spreadsheetClient.queryBuilder.select(['name', 'class']).from('Users').where(row => row[1] === 'John').execute();

// Chain multiple selects
const multiSelect = await spreadsheetClient.queryBuilder
.select(['name']).from('Users').where(row => row[1] === 'John')
.and(['class']).from('Students').where(row => row[2] === 'A')
.execute();
```

#### Insert
```typescript
// Insert single row
const result = await spreadsheetClient.queryBuilder.insert(['John', 'A', '25']).into('Users').execute();

// Chain multiple inserts
const multiInsert = await spreadsheetClient.queryBuilder.
insert(['John', 'A', '25']).into('Users')
.and(['Jane', 'B', '23']).into('Users')
.execute();
```

#### Update
```typescript
// Update with condition
const updated = await spreadsheetClient.queryBuilder.update(['John Doe', 'A+', '26']).from('Users').where(row => row[1] === 'John').execute();
```

#### Delete
```typescript
// Delete with condition
const deleted = await spreadsheetClient.queryBuilder.delete().from('Users').where(row => row[1] === 'John').execute();
```

## Error Handling

The library provides specific error handling for various scenarios:

### Spreadsheet Access Errors
```typescript
try {
  const spreadsheetClient = new SpreadsheetClient({
    email: "invalid@email.com",
    privateKey: "invalid-key",
    spreadsheetID: "invalid-id"
  });
} catch (error) {
  if (error.message.includes("Invalid email format")) {
    // Handle invalid email configuration
  }
  // Handle other configuration errors
}
```

### Query Execution Errors
```typescript
try {
  const result = await spreadsheetClient.queryBuilder.select(['name']).from('NonExistentSheet').execute();
} catch (error) {
  if (error.message.includes("cannot find spreadsheet")) {
    // Handle invalid spreadsheet ID
  } else if (error.message.includes("forbidden spreadsheet")) {
    // Handle permission issues
  } else {
    // Handle other API errors
  }
}
```

## Development
### Scripts
- **Build**: Compiles TypeScript files.
  ```bash
  yarn build
  ```
- **Start**: Runs the application.
  ```bash
  yarn start
  ```
- **Development**: Starts the application in development mode with hot reloading.
  ```bash
  yarn dev
  ```