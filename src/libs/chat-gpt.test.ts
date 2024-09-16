import { getSummary } from './chat-gpt';
import { OpenAIClient } from '@azure/openai';

const MOCK_CHAT_COMPLETIONS = jest.fn().mockImplementation(() => ({
  choices: [{ message: { content: 'mocked response' } }]
}));

jest.mock('@azure/openai', () => {
  const originalModule = jest.requireActual('@azure/openai');
  return {
    ...originalModule,
    OpenAIClient: jest.fn().mockImplementation(() => ({
      getChatCompletions: MOCK_CHAT_COMPLETIONS
    }))
  };
});

describe('getSummary', () => {
  const comments = ['Test Comment 1', 'Test Comment 2'];
  const userContent = `---\nTest Comment 1\nTest Comment 2---`;
  const testPromptCustomization = 'test prompt';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should use the expected arguments and return the expected response', async () => {
    const systemContent = `You are an assistant designed to find the most common themes in a large dataset of free text. Users will send a list of comments ${testPromptCustomization}, where each line represents one comment. You will find the 10 most common themes in the data, and for each theme, you will include a theme title, theme description, and 3 real comments (actually in the dataset, not generated) that fit the given theme. Your output will be in the following structured valid JSON format: {"themes":[{"title":"title 1","description":"description 1","actualComments":["real comment 1","real comment 2","real comment 3"]},{"title":"title 2","description":"description 2","actualComments":["real comment 1","real comment 2","real comment 3"]}, ...]}. Make sure that the 3 comments are in the user-provided list of comments, not generated. Make sure the output is in valid JSON format, and do not add trailing commas.`;
    const deployment_id = 'gpt-35-turbo-16k';
    const prompt = [
      { role: 'system', content: systemContent },
      { role: 'user', content: userContent }
    ];
    const result = await getSummary(comments, testPromptCustomization);
    expect(MOCK_CHAT_COMPLETIONS).toHaveBeenCalledTimes(1);
    const mockChatCompletionsArgs = MOCK_CHAT_COMPLETIONS.mock.calls[0];
    expect(Array.isArray(mockChatCompletionsArgs)).toBe(true);
    expect(mockChatCompletionsArgs[0]).toBe(deployment_id);
    expect(mockChatCompletionsArgs[1][0]).toMatchObject(prompt[0]);
    expect(mockChatCompletionsArgs[1][1]).toMatchObject(prompt[1]);
    expect(result).toStrictEqual({
      commentCount: 2,
      dataSummary: 'mocked response'
    });
  });

  it('should return an object showing no summary from 0 comments and not call OpenAIClient when comments are an empty array', async () => {
    const comments = [];
    const result = await getSummary(comments, testPromptCustomization);
    expect(OpenAIClient).toHaveBeenCalledTimes(0);
    expect(result).toStrictEqual({
      commentCount: 0,
      dataSummary: 'No data found'
    });
  });

  it('should reduce number comments if content in comments is estimated to exceed token limit', async () => {
    const comments = new Array(10000).fill(
      'This is an example comment that a has been submitted by a user as feedback' // comment length = 74 char
    );
    // example comment array that will exceed the token limit check in reduceCommentToNotExceedTokenLimit
    // comments array joined as a string will total 10000 * (74 char + 1 space char) = 75000 characters
    // estimated character limit for input is 57536 (14384 available tokens * 4 characters per token)
    // 57536 % 75 characters (comment + ' ') = 767 comments that can be included in the input

    const expectedReducedCommentLength = 767;
    MOCK_CHAT_COMPLETIONS.mockResolvedValueOnce({
      choices: [{ message: { content: 'Mock summary' } }]
    });
    const result = await getSummary(comments, testPromptCustomization);
    expect(result).toEqual({
      dataSummary: 'Mock summary',
      commentCount: expectedReducedCommentLength
    });
  });

  describe('getSummary should correctly utilize different prompt customizations', () => {
    const cases = [testPromptCustomization, 'a different prompt'];
    it.each(cases)(
      'should correctly include the prompt in the system content',
      async (prompt) => {
        const systemContent = `You are an assistant designed to find the most common themes in a large dataset of free text. Users will send a list of comments ${prompt}, where each line represents one comment. You will find the 10 most common themes in the data, and for each theme, you will include a theme title, theme description, and 3 real comments (actually in the dataset, not generated) that fit the given theme. Your output will be in the following structured valid JSON format: {"themes":[{"title":"title 1","description":"description 1","actualComments":["real comment 1","real comment 2","real comment 3"]},{"title":"title 2","description":"description 2","actualComments":["real comment 1","real comment 2","real comment 3"]}, ...]}. Make sure that the 3 comments are in the user-provided list of comments, not generated. Make sure the output is in valid JSON format, and do not add trailing commas.`;
        await getSummary(comments, prompt);
        expect(MOCK_CHAT_COMPLETIONS.mock.calls[0][1][0].content).toEqual(
          systemContent
        );
      }
    );
  });

  it('should retry if the context length is exceeded and error is thrown with message rearding max content', async () => {
    const comments = new Array(100).fill('This is a comment');
    MOCK_CHAT_COMPLETIONS.mockRejectedValueOnce({
      message: "This model's maximum context length"
    });
    MOCK_CHAT_COMPLETIONS.mockResolvedValueOnce({
      choices: [{ message: { content: 'Mock summary after retry' } }]
    });

    const result = await getSummary(comments, testPromptCustomization);
    expect(result).toEqual({
      dataSummary: 'Mock summary after retry',
      commentCount: comments.length - 50
    });
    expect(MOCK_CHAT_COMPLETIONS).toHaveBeenCalledTimes(2);
  });

  it('should retry if the context length is exceeded and only retry the max amount of times and finally throw error if context length is still exceeding limit', async () => {
    const comments = new Array(1000).fill('This is a comment');
    const maxContextErrorMessage = `This model's maximum context length`;
    const maxRetries = 5;
    for (let i = 0; i < maxRetries; i++) {
      MOCK_CHAT_COMPLETIONS.mockRejectedValueOnce({
        message: maxContextErrorMessage
      });
    }
    await expect(getSummary(comments, testPromptCustomization)).rejects.toThrow(
      `Azure OpenAI getChatCompletions failed after ${maxRetries} retries with error: ${maxContextErrorMessage}`
    );
    expect(MOCK_CHAT_COMPLETIONS).toHaveBeenCalledTimes(maxRetries);
  });

  it('should throw an error when other non-context length errors occur', async () => {
    const testErrorMessage = 'Test Error';
    (OpenAIClient as jest.Mock).mockImplementation(() => ({
      getChatCompletions: jest
        .fn()
        .mockRejectedValue(new Error(testErrorMessage))
    }));
    const expectedErrorMessage = `Azure OpenAI getChatCompletions failed with error: ${testErrorMessage}`;
    await expect(getSummary(comments, testPromptCustomization)).rejects.toThrow(
      expectedErrorMessage
    );
  });
});
