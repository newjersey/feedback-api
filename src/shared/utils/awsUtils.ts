import {
  GetParameterCommandInput,
  GetParameterCommand,
  SSMClient
} from '@aws-sdk/client-ssm';

export const getSsmParam = async (
  ssm: SSMClient,
  name: string
): Promise<string> => {
  try {
    const params: GetParameterCommandInput = {
      Name: name,
      WithDecryption: true
    };

    const command = new GetParameterCommand(params);
    const data = await ssm.send(command);

    const result = data?.Parameter?.Value;

    if (result == null || result.length === 0) {
      throw new Error(
        `Parameter with name ${name} does not exist in the SSM parameter store.`
      );
    }

    return result;
  } catch (err) {
    throw new Error(
      `Failed to retrieve parameter ${name} from SSM parameter store - ${
        err instanceof Error ? err.message : 'Unknown error occurred'
      }`
    );
  }
};
