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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should use the expected arguments and return a string response', async () => {
    const testPrompt = 'test prompt';
    const systemContent = `You are an assistant designed to find the most common themes in a large dataset of free text. Users will send a list of comments${testPrompt}, where each line represents one comment. You will find the 10 most common themes in the data, and for each theme, you will include a theme title, theme description, and 3 real comments (actually in the dataset, not generated) that fit the given theme. Your output will be in the following structured valid JSON format: {"themes":[{"title":"title 1","description":"description 1","actualComments":["real comment 1","real comment 2","real comment 3"]},{"title":"title 2","description":"description 2","actualComments":["real comment 1","real comment 2","real comment 3"]}, ...]}. Make sure that the 3 comments are in the user-provided list of comments, not generated. Make sure the output is in valid JSON format, and do not add trailing commas.`;
    const deployment_id = 'gpt-35-turbo-16k';
    const prompt = [
      { role: 'system', content: systemContent },
      { role: 'user', content: userContent }
    ];
    const result = await getSummary(comments, testPrompt);
    expect(MOCK_CHAT_COMPLETIONS).toHaveBeenCalledTimes(1);
    const mockChatCompletionsArgs = MOCK_CHAT_COMPLETIONS.mock.calls[0];
    expect(Array.isArray(mockChatCompletionsArgs)).toBe(true);
    expect(mockChatCompletionsArgs[0]).toBe(deployment_id);
    expect(mockChatCompletionsArgs[1][0]).toMatchObject(prompt[0]);
    expect(mockChatCompletionsArgs[1][1]).toMatchObject(prompt[1]);
    expect(result).toBe('mocked response');
  });

  it('should return "{}" and not call OpenAIClient when there are no comments', async () => {
    const comments = [];
    const pageURL = 'https://uistatus.dol.state.nj.us/';
    const result = await getSummary(comments, pageURL);
    expect(OpenAIClient).toHaveBeenCalledTimes(0);
    expect(result).toBe('{}');
  });

  describe('getSummary with a different prompts prompts', () => {
    const cases = ['test prompt', ''];
    it.each(cases)(
      'should correctly include the prompt in the system content',
      async (prompt) => {
        const systemContent = `You are an assistant designed to find the most common themes in a large dataset of free text. Users will send a list of comments${prompt}, where each line represents one comment. You will find the 10 most common themes in the data, and for each theme, you will include a theme title, theme description, and 3 real comments (actually in the dataset, not generated) that fit the given theme. Your output will be in the following structured valid JSON format: {"themes":[{"title":"title 1","description":"description 1","actualComments":["real comment 1","real comment 2","real comment 3"]},{"title":"title 2","description":"description 2","actualComments":["real comment 1","real comment 2","real comment 3"]}, ...]}. Make sure that the 3 comments are in the user-provided list of comments, not generated. Make sure the output is in valid JSON format, and do not add trailing commas.`;
        await getSummary(comments, prompt);
        expect(MOCK_CHAT_COMPLETIONS.mock.calls[0][1][0].content).toEqual(
          systemContent
        );
      }
    );
  });

  it('should throw an error on failure', async () => {
    const testErrorMessage = 'Test Error';
    (OpenAIClient as jest.Mock).mockImplementation(() => ({
      getChatCompletions: jest
        .fn()
        .mockRejectedValue(new Error(testErrorMessage))
    }));
    const expectedErrorMessage = `Azure OpenAI getChatCompletions failed with error: ${testErrorMessage}`;
    const pageURL = 'https://www.nj.gov/labor/myleavebenefits/';
    await expect(getSummary(comments, pageURL)).rejects.toThrow(
      expectedErrorMessage
    );
  });
});
