# Spreadsheet ORM

[![NPM Version](https://img.shields.io/npm/v/spreadsheet-orm.svg)](https://www.npmjs.com/package/spreadsheet-orm)
[![NPM Downloads](https://img.shields.io/npm/dm/spreadsheet-orm.svg)](https://www.npmjs.com/package/spreadsheet-orm)
[![Build Status](https://github.com/codingbotPark/spreadsheet-orm/actions/workflows/node.js.yml/badge.svg)](https://github.com/codingbotPark/spreadsheet-orm/actions/workflows/node.js.yml)
[![License](https://img.shields.io/npm/l/spreadsheet-orm.svg)](https://github.com/codingbotPark/spreadsheet-orm/blob/main/LICENSE)

**Spreadsheet ORM** is a powerful, modern, and type-safe Object-Relational Mapping (ORM) library for using Google Spreadsheets as a database. Move beyond simple row/column manipulation and leverage database-like features such as schema management, migrations, and a fluent query builder.

## Key Features

- **Type-Safe Schema Definition**: Define your table structures in TypeScript, and enjoy full type safety and autocompletion.
- **Powerful Query Builder**: A fluent, chainable API for `SELECT`, `INSERT`, `UPDATE`, and `DELETE` operations.
- **Schema Synchronization**: Keep your spreadsheet structure in sync with your code definitions, similar to database migrations.
- **Automatic Type Inference**: Automatically infer TypeScript types from your defined schemas for full end-to-end type safety.
- **Modern API**: Built with TypeScript and ES Modules, providing a clean and intuitive developer experience.

## Installation

```bash
# Using Yarn
yarn add spreadsheet-orm

# Using NPM
npm install spreadsheet-orm
```

## Quick Start

### 1. Credentials

First, you need Google Service Account credentials. For a detailed, step-by-step guide on how to get them, please see our [**Credentials Guide**](./GUIDE_CREDENTIALS.md).

### 2. Core Concepts

The workflow revolves around three main steps:
1.  **Define Schemas**: Use `defineTable` to describe your tables (sheets).
2.  **Initialize Client**: Create a client instance with your credentials and schemas.
3.  **Sync & Query**: Use the `schemaManager` to sync your schemas and the `queryBuilder` to interact with data.

### 3. Example

Here is a complete example of how to get started.

```typescript
import { 
  createSpreadsheetClient, 
  defineTable, 
  fieldBuilder,
  type InferTableType
} from "spreadsheet-orm";

// It's recommended to load credentials securely, e.g., from environment variables
import credentials from "./your-google-credentials.json";

// --- Step 1: Define Your Schemas ---

const Users = defineTable("Users", {
  id: fieldBuilder.string().default("UUID()").build(), // Set a default value
  name: fieldBuilder.string().build(),
  email: fieldBuilder.string().build(),
  age: fieldBuilder.number().optional().build(), // This field can be empty
  createdAt: fieldBuilder.date().default(new Date()).build(),
});

const Posts = defineTable("Posts", (field) => ({
  id: field.string().build(),
  title: field.string().build(),
  content: field.string().build(),
  // Create a "foreign key" relationship to the Users table
  authorId: field.reference(Users, "id").build(), 
}));


// --- Step 2: Automatically Infer Types from Schemas ---

type User = InferTableType<typeof Users.fields>;
type Post = InferTableType<typeof Posts.fields>;

// Now you have full type safety!
// const newUser: User = { id: "1", name: "Jane Doe", email: "jane@example.com" };


// --- Step 3: Initialize the Client ---

const client = createSpreadsheetClient({
  // Credentials
  email: credentials.client_email,
  privateKey: credentials.private_key,
  spreadsheetID: "YOUR_SPREADSHEET_ID_HERE",

  // Schemas
  schemas: [Users, Posts],
  
  // (Optional) Strategy for handling sheets that exist in code but not in the spreadsheet
  onMissingSchema: "create", // 'create', 'ignore', or 'error'
});


// --- Step 4: Sync Schemas & Run Queries ---

async function main() {
  // Sync schemas with the spreadsheet (like a database migration)
  // 'smart' mode will create missing sheets and fix column order without losing data.
  console.log("Syncing schemas...");
  await client.schemaManager.sync({ mode: "smart" });
  console.log("Sync complete!");

  // Use the query builder for CRUD operations
  console.log("Inserting new users...");
  await client.queryBuilder
    .insert(["1", "John Doe", "john@example.com", 30]).into("Users")
    .and(["2", "Jane Smith", "jane@example.com"]).into("Users") // Chain inserts with and()
    .execute();
  
  console.log("Fetching users...");
  const allUsers = await client.queryBuilder.select().from("Users").execute();
  console.log("All Users:", allUsers);

  console.log("Fetching users older than 25...");
  const filteredUsers = await client.queryBuilder
    .select(["name", "email"])
    .from("Users")
    .where((row) => {
      const ageIndex = Users.orderedColumns.indexOf("age");
      // row[0] is the row index, so data columns start at row[1]
      return Number(row[ageIndex + 1]) > 25; 
    })
    .execute();
  console.log("Filtered Users:", filteredUsers);
}

main().catch(console.error);
```

## API Reference

### Schema Definition (`defineTable`)

Use `defineTable` to define the structure of a sheet. The second argument is an object where each value is a `fieldBuilder` chain ending with `.build()`.

-   `defineTable(sheetName, fields, [columnOrder])`

The `fieldBuilder` provides methods for each data type:
-   `string()`
-   `number()`
-   `boolean()`
-   `date()`
-   `reference(schema, fieldName)`: Creates a link to another table's field.

Each field builder can be chained with modifiers before calling `.build()`:
-   `.optional()`: Marks the field as optional.
-   `.default(value)`: Provides a default value for new entries if the schema is synced.

### Schema Management (`client.schemaManager`)

The `schemaManager` ensures your spreadsheet structure matches your code definitions.

-   `sync({ mode })`: Synchronizes the schemas.
    -   `mode: 'strict'`: Throws an error if there are any discrepancies.
    -   `mode: 'smart'`: (Recommended) Creates missing sheets and re-orders columns of existing sheets without data loss.
    -   `mode: 'force'`: Overwrites existing sheets that don't match the schema, potentially causing data loss.
    -   `mode: 'clean'`: Wipes all data and writes only the schema headers.

### Query Builder (`client.queryBuilder`)

The query builder provides a fluent API for data manipulation.

-   **SELECT**:
    ```typescript
    // Select all columns
    await client.queryBuilder.select().from("Users").execute();

    // Select specific columns and apply a filter
    await client.queryBuilder
      .select(["name", "email"])
      .from("Users")
      .where(row => Number(row[3]) > 30) // filter by age (assuming age is the 3rd column)
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
      .where(row => row[1] === "3") // where id is "3"
      .execute();
    ```

-   **DELETE**:
    ```typescript
    await client.queryBuilder
      .delete()
      .from("Users")
      .where(row => row[2] === "peter.jr@example.com") // where email matches
      .execute();
    ```

-   **Chaining Queries (`and`)**:
    You can chain multiple operations into a single batch request for better performance.
    ```typescript
    await client.queryBuilder
      .insert(["4", "Alice", "alice@example.com"]).into("Users")
      .and()
      .insert(["p1", "My First Post", "...", "4"]).into("Posts")
      .execute();
    ```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License.