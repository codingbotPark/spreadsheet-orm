import {Configs} from 'spreadsheet-orm';
import { userSchema, postSchema, testSchemas } from '@fixtures/schemas';
import { mockOptionsWithSchemas } from '@fixtures/configs';

describe('Configs Class', () => {
  it('should initialize SpreadConfig, SheetConfig, and SchemaConfig correctly', () => {
    const configs = new Configs<typeof testSchemas>(mockOptionsWithSchemas);

    // 1. SpreadConfig 확인
    expect(configs.spread).toBeDefined();
    expect(configs.spread.ID).toBe(mockOptionsWithSchemas.spreadsheetID);

    // 2. SheetConfig 확인 (기본값 확인)
    expect(configs.sheet).toBeDefined();
    expect(configs.sheet.DEFAULT_RECORDING_START_ROW).toBe(1);

    // 3. SchemaConfig 확인
    expect(configs.schema).toBeDefined();
    expect(configs.schema.schemaList).toHaveLength(2);
    expect(configs.schema.schemaMap.users).toBe(userSchema);
    expect(configs.schema.schemaMap.posts).toBe(postSchema);
  });

  it('should throw an error for invalid email format', () => {
    expect(() => {
      new Configs({ ...mockOptionsWithSchemas, email: 'invalid-email' });
    }).toThrow('Invalid email format');
  });
});
