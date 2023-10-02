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

    let redactedText = input;
    response.Entities.forEach((pii) => {
      const redactedString = input.substring(pii.BeginOffset, pii.EndOffset);
      redactedText = redactedText.replace(redactedString, `[${pii.Type}]`);
    });

    return redactedText;
  } catch (e) {
    const message = e instanceof Error ? e.message : 'No further details';
    throw new Error(`Failed to redact PII with AWS Comprehend: ${message}`);
  }
};
