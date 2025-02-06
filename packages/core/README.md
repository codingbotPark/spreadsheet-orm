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
Errors may occur while working with the Google Sheets API. Here's how to handle them:

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
      // Handle specific error cases
    }
    throw error;
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

## Contributing
Contributions are welcome! Open an issue or submit a pull request.

## License
This project is licensed under the MIT License.