import * as AwsSdkMockMatchers from 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { getSsmParam } from './awsUtils';

expect.extend(AwsSdkMockMatchers);
const MOCK_SSM_CLIENT = mockClient(SSMClient);

describe('getSsmParam function', () => {
  const paramName = 'paramName';

  beforeEach(() => {
    MOCK_SSM_CLIENT.reset();
  });

  it('Throws an error if getting SSM parameter fails', async () => {
    MOCK_SSM_CLIENT.on(GetParameterCommand).rejects('Retrieving failed');

    await expect(
      getSsmParam(MOCK_SSM_CLIENT as unknown as SSMClient, paramName)
    ).rejects.toThrow(/Failed to retrieve parameter.*Retrieving failed/i);
  });

  it('Returns the parameter value if parameter is successfully retrieved from SSM', async () => {
    MOCK_SSM_CLIENT.on(GetParameterCommand).resolves({
      Parameter: {
        Value: 'paramValue'
      }
    });

    const result = await getSsmParam(
      MOCK_SSM_CLIENT as unknown as SSMClient,
      'paramName'
    );

    expect(result).toEqual('paramValue');
  });

  it('Throws an error if the data object is empty', async () => {
    MOCK_SSM_CLIENT.on(GetParameterCommand).resolves({});

    await expect(
      getSsmParam(MOCK_SSM_CLIENT as unknown as SSMClient, paramName)
    ).rejects.toThrow(
      expect.objectContaining({
        message: expect.stringContaining(
          `Parameter with name ${paramName} does not exist`
        )
      })
    );
  });

  it('Throws an error if the value of the parameter is null', async () => {
    MOCK_SSM_CLIENT.on(GetParameterCommand).resolves({
      Parameter: {
        Value: null as unknown as string | undefined
      }
    });

    await expect(
      getSsmParam(MOCK_SSM_CLIENT as unknown as SSMClient, paramName)
    ).rejects.toThrow(
      expect.objectContaining({
        message: expect.stringContaining(
          `Parameter with name ${paramName} does not exist`
        )
      })
    );
  });

  it('Throws an error if the value of the parameter is empty', async () => {
    MOCK_SSM_CLIENT.on(GetParameterCommand).resolves({
      Parameter: {
        Value: ''
      }
    });

    await expect(
      getSsmParam(MOCK_SSM_CLIENT as unknown as SSMClient, paramName)
    ).rejects.toThrow(
      expect.objectContaining({
        message: expect.stringContaining(
          `Parameter with name ${paramName} does not exist`
        )
      })
    );
  });
});
