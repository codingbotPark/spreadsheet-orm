import { google, sheets_v4 } from 'googleapis';
import { mockOptionsWithSchemas } from '@fixtures/configs';
import createSpreadsheetClient from 'spreadsheet-orm';
import { GaxiosResponse } from 'gaxios';

// jest.mock를 통해 얻은 모킹된 google 객체를 가져옵니다.
const mockedGoogleApis = google as jest.Mocked<typeof google>;

describe('SchemaManager - Integration', () => {
  let client: ReturnType<typeof createSpreadsheetClient>;

  beforeEach(() => {
    // 모든 테스트 전에 모킹된 함수들을 초기화합니다.
    jest.clearAllMocks();
    client = createSpreadsheetClient(mockOptionsWithSchemas);
  });

  it('should create missing sheets when sync({ mode: "strict" }) is called', async () => {
    // API 응답 모킹: getSpreadInfo가 'posts' 시트만 반환하도록 설정 (users는 없다고 가정)
    const mockGetResponse = {
      data: {
        sheets: [{ properties: { title: 'posts' } }],
      },
    } as GaxiosResponse<sheets_v4.Schema$Spreadsheet>;

    (mockedGoogleApis.sheets('v4').spreadsheets.get as jest.Mock).mockResolvedValueOnce(mockGetResponse);

    // batchUpdate API가 성공적으로 응답했다고 모킹
    (mockedGoogleApis.sheets('v4').spreadsheets.batchUpdate as jest.Mock).mockResolvedValueOnce({ status: 200 });

    const result = await client.schemaManager.sync({ mode: 'strict' });

    // 검증: batchUpdate가 'users' 시트를 추가하는 요청으로 호출되었는지 확인
    const batchUpdateCalls = (mockedGoogleApis.sheets('v4').spreadsheets.batchUpdate as jest.Mock).mock.calls;
    expect(batchUpdateCalls).toHaveLength(1);
    expect(batchUpdateCalls[0][0].requestBody.requests[0].addSheet.properties.title).toBe('users');

    // 검증: 결과 객체가 생성된 시트를 올바르게 보고하는지 확인
    expect(result.created).toContain('users');
    expect(result.skipped).toEqual([]);
  });

  it('should skip creating sheets on "ignore" strategy', async () => {
    // onMissingSchema 전략을 'ignore'로 변경하여 클라이언트 생성
    const ignoreClient = createSpreadsheetClient({ ...mockOptionsWithSchemas, onMissingSchema: 'ignore' });

    // API 응답 모킹: 시트가 하나도 없다고 가정
    const mockGetResponse = {
      data: { sheets: [] },
    } as unknown as GaxiosResponse<sheets_v4.Schema$Spreadsheet>;
    (mockedGoogleApis.sheets('v4').spreadsheets.get as jest.Mock).mockResolvedValueOnce(mockGetResponse);

    const result = await ignoreClient.schemaManager.sync({ mode: 'strict' });

    // 검증: batchUpdate (시트 생성)가 호출되지 않았는지 확인
    expect(mockedGoogleApis.sheets('v4').spreadsheets.batchUpdate).not.toHaveBeenCalled();

    // 검증: 결과 객체가 모든 시트를 skip했다고 보고하는지 확인
    expect(result.skipped).toContain('users');
    expect(result.skipped).toContain('posts');
    expect(result.created).toEqual([]);
  });
});
