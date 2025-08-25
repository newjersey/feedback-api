import {
  ComprehendClient,
  DetectPiiEntitiesCommand
} from '@aws-sdk/client-comprehend';
import { mockClient } from 'aws-sdk-client-mock';
import { redactPii } from './pii-redaction';

const MOCK_COMPREHEND_CLIENT = mockClient(ComprehendClient);

describe('redactPii function', () => {
  beforeEach(() => {
    MOCK_COMPREHEND_CLIENT.reset();
  });

  it('should throw an error if the Pii entities are undefined', () => {
    MOCK_COMPREHEND_CLIENT.on(DetectPiiEntitiesCommand).resolvesOnce({
      Entities: undefined
    });

    expect(
      redactPii(
        'testInput',
        MOCK_COMPREHEND_CLIENT as unknown as ComprehendClient
      )
    ).rejects.toThrow(
      'Failed to redact PII with AWS Comprehend: Pii entities are undefined'
    );
  });

  it("should throw an error if a Pii entity's BeginOffset is undefined", () => {
    MOCK_COMPREHEND_CLIENT.on(DetectPiiEntitiesCommand).resolvesOnce({
      Entities: [
        { BeginOffset: 0, EndOffset: 1 },
        { BeginOffset: undefined, EndOffset: 2 }
      ]
    });

    expect(
      redactPii(
        'testInput',
        MOCK_COMPREHEND_CLIENT as unknown as ComprehendClient
      )
    ).rejects.toThrow(
      "Failed to redact PII with AWS Comprehend: Entity's BeginOffset is undefined."
    );
  });

  it("should throw an error if a Pii entity's EndOffset is undefined", () => {
    MOCK_COMPREHEND_CLIENT.on(DetectPiiEntitiesCommand).resolvesOnce({
      Entities: [
        { BeginOffset: 0, EndOffset: 1 },
        { BeginOffset: 1, EndOffset: undefined }
      ]
    });

    expect(
      redactPii(
        'testInput',
        MOCK_COMPREHEND_CLIENT as unknown as ComprehendClient
      )
    ).rejects.toThrow(
      "Failed to redact PII with AWS Comprehend: Entity's EndOffset is undefined"
    );
  });
});
