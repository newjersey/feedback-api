import middy from '@middy/core';
import middyJsonBodyParser from '@middy/http-json-body-parser';
import { middyfy } from './lambda';

jest.mock('@middy/core', () => {
  return jest.fn().mockImplementation(() => {
    return { use: jest.fn() };
  });
});

jest.mock('@middy/http-json-body-parser');

const mockJsonBodyParser = middyJsonBodyParser as jest.Mock;
const mockMiddy = middy as jest.Mocked<typeof middy>;

describe('middyfy', () => {
  it('should wrap handler with middy and applies the JSON body parser', () => {
    const handler = jest.fn();
    middyfy(handler);
    expect(mockMiddy).toHaveBeenCalledWith(handler);
    expect(mockMiddy).toHaveBeenCalledTimes(1);
    expect(mockJsonBodyParser).toHaveBeenCalledTimes(1);
  });
});
