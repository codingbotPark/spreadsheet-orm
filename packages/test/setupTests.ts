import { jest } from '@jest/globals';

// googleapis를 모킹합니다。
jest.mock('googleapis', () => {
  const mockSheets = {
    spreadsheets: {
      get: jest.fn(),
      batchUpdate: jest.fn(),
      values: {
        get: jest.fn(),
        batchGetByDataFilter: jest.fn(),
        append: jest.fn(),
        batchUpdateByDataFilter: jest.fn(),
        batchClearByDataFilter: jest.fn(),
      },
    },
  };

  return {
    google: {
      sheets: jest.fn(() => mockSheets),
    },
  };
});

