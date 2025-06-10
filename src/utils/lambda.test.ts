import middy from '@middy/core';
import middyJsonBodyParser from '@middy/http-json-body-parser';
import { middyfy } from './lambda';

jest.mock('@middy/core', () => {
  const use = jest.fn().mockImplementation(() => 'middyfied handler');
  return jest.fn().mockImplementation(() => ({ use }));
});
jest.mock('@middy/http-json-body-parser');

const MOCK_MIDDY = middy as jest.MockedFunction<typeof middy>;

describe('middyfy', () => {
  it('should wrap handler with middy, apply JSON body parser, and return middy instance', () => {
    const handler = jest.fn();
    const middyfiedHandler = middyfy(handler);
    expect(middy).toHaveBeenCalledWith(handler);
    const mockMiddyInstance = MOCK_MIDDY.mock.results[0].value;
    expect(mockMiddyInstance.use).toHaveBeenCalledWith(middyJsonBodyParser());
    expect(middyfiedHandler).toBe('middyfied handler');
  });
});
