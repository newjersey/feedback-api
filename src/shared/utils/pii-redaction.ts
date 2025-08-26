import {
  DetectPiiEntitiesCommand,
  type ComprehendClient
} from '@aws-sdk/client-comprehend';

export const redactPii = async (
  input: string,
  comprehendClient: ComprehendClient
) => {
  try {
    const command = new DetectPiiEntitiesCommand({
      Text: input,
      LanguageCode: 'en'
    });
    const response = await comprehendClient.send(command);

    const sortedEntities = [...response.Entities].sort((a, b) => {
      if (a.BeginOffset < b.BeginOffset) {
        return -1;
      }
      if (a.BeginOffset > b.BeginOffset) {
        return 1;
      }
      return 0;
    });

    let result = input;
    sortedEntities.forEach((pii) => {
      const stringToRedact = input.substring(pii.BeginOffset, pii.EndOffset);
      result = result.replace(stringToRedact, `[${pii.Type}]`);
    });

    return result;
  } catch (e) {
    const message = e instanceof Error ? e.message : 'No further details';
    throw new Error(`Failed to redact PII with AWS Comprehend: ${message}`);
  }
};
