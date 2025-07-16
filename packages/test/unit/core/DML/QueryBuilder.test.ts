import QueryBuilder from 'spreadsheet-orm/src/core/DML/QueryBuilder';
import SelectBuilder from 'spreadsheet-orm/src/core/DML/implements/SelectBuilder';
import InsertBuilder from 'spreadsheet-orm/src/core/DML/implements/InsertBuilder';
import UpdateBuilder from 'spreadsheet-orm/src/core/DML/implements/UpdateBuilder';
import DeleteBuilder from 'spreadsheet-orm/src/core/DML/implements/DeleteBuilder';
import { mockOptionsWithSchemas } from '@fixtures/configs';
import Configs from 'spreadsheet-orm/src/config/Configs';
import { testSchemas } from '@fixtures/schemas';

describe('QueryBuilder', () => {
  let queryBuilder: QueryBuilder<typeof testSchemas>;

  beforeEach(() => {
    const configs = new Configs(mockOptionsWithSchemas);
    queryBuilder = new QueryBuilder(configs);
  });

  it('should create a SelectBuilder instance', () => {
    const selectBuilder = queryBuilder.select();
    expect(selectBuilder).toBeInstanceOf(SelectBuilder);
  });

  it('should create an InsertBuilder instance', () => {
    const insertBuilder = queryBuilder.insert(['value1', 'value2']);
    expect(insertBuilder).toBeInstanceOf(InsertBuilder);
  });

  it('should create an UpdateBuilder instance', () => {
    const updateBuilder = queryBuilder.update(['value1', 'value2']);
    expect(updateBuilder).toBeInstanceOf(UpdateBuilder);
  });

  it('should create a DeleteBuilder instance', () => {
    const deleteBuilder = queryBuilder.delete();
    expect(deleteBuilder).toBeInstanceOf(DeleteBuilder);
  });
});
