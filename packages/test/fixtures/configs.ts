import { ClinetOptions } from 'spreadsheet-orm/config/Configs';
import { testSchemas } from './schemas';

export const mockCredentials = {
  email: 'test-client@fake-domain.com',
  privateKey: '-----BEGIN FAKE PRIVATE KEY-----\nFAKE_KEY\n-----END FAKE PRIVATE KEY-----\n',
  spreadsheetID: 'fake-spreadsheet-id-for-tests',
};

export const mockOptionsWithSchemas: ClinetOptions<typeof testSchemas> = {
  ...mockCredentials,
  schemas: testSchemas,
};

