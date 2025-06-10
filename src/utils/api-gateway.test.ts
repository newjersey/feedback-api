import { formatJSONResponse, formatErrorResponse } from './api-gateway';

describe('formatJSONResponse', () => {
  it.each([
    [{ message: 'Success' }, '{"message":"Success"}'],
    [{}, '{}']
  ])(
    'should return a 200 status code and the correct response body for %j',
    (responseBody, expectedBody) => {
      const formattedResponse = formatJSONResponse(responseBody);
      expect(formattedResponse).toEqual({
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: expectedBody
      });
    }
  );
});

describe('formatErrorResponse', () => {
  it.each([
    [{ error: 'Something went wrong' }, '{"error":"Something went wrong"}'],
    [{}, '{}']
  ])(
    'should return a 500 status code and the correct response body for %j',
    (responseBody, expectedBody) => {
      const formattedResponse = formatErrorResponse(responseBody);
      expect(formattedResponse).toEqual({
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: expectedBody
      });
    }
  );
});
