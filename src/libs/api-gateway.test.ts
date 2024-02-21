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
  it('should return a 500 status code and the correct response body', () => {
    const response = { error: 'Something went wrong' };
    const formattedResponse = formatErrorResponse(response);
    expect(formattedResponse).toEqual({
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: '{"error":"Something went wrong"}'
    });
  });
});