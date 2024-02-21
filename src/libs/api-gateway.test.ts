import { formatJSONResponse, formatErrorResponse } from './api-gateway';

describe('formatJSONResponse', () => {
  it('should return a 200 status code and the correct response body', () => {
    const response = { message: 'Success' };
    const formattedResponse = formatJSONResponse(response);
    expect(formattedResponse).toEqual({
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(response)
    });
  });
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
      body: JSON.stringify(response)
    });
  });
});
