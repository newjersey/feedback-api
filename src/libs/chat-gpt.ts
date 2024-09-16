import {
  OpenAIClient,
  AzureKeyCredential,
  ChatRequestMessage
} from '@azure/openai';

const ENDPOINT = process.env['AZURE_OPENAI_ENDPOINT'];
const API_KEY = process.env['AZURE_OPENAI_KEY'];
const API_VERSION = '2023-07-01-preview';
const PARAMETERS = {
  maxTokens: 2000,
  temperature: 0.3,
  frequencyPenalty: 0,
  presencePenalty: 0,
  n: 1
};
const DEPLOYMENT_ID = 'gpt-35-turbo-16k';
const MAX_TOKENS_INPUT_OUTPUT = 16384;
const CHARACTERS_PER_TOKEN = 4;
const COMMENT_SLICE_VALUE = 50

function reduceCommentToNotExceedTokenLimit(comments: string[]): string[] {
  const availableInputTokens = MAX_TOKENS_INPUT_OUTPUT - PARAMETERS.maxTokens;
  const totalCommentCharacters = comments.join(' ').length;
  const estimatedTokensForComments =
    totalCommentCharacters / CHARACTERS_PER_TOKEN;
  if (estimatedTokensForComments <= availableInputTokens) {
    return comments;
  } else {
    let currentlyUsedTokens = 0;
    let currentlyJoinedString = '';
    for (let i = comments.length - 1; i >= 0; i--) {
      currentlyJoinedString += `${comments[i]} `;
      currentlyUsedTokens = currentlyJoinedString.length / CHARACTERS_PER_TOKEN;
      if (currentlyUsedTokens > availableInputTokens) {
        return comments.slice(i + 1);
      }
    }
  }
}

function generatePrompt(
  comments: string[],
  promptCustomText: string
): ChatRequestMessage[] {
  const systemContent = `You are an assistant designed to find the most common themes in a large dataset of free text. Users will send a list of comments ${promptCustomText}, where each line represents one comment. You will find the 10 most common themes in the data, and for each theme, you will include a theme title, theme description, and 3 real comments (actually in the dataset, not generated) that fit the given theme. Your output will be in the following structured valid JSON format: {"themes":[{"title":"title 1","description":"description 1","actualComments":["real comment 1","real comment 2","real comment 3"]},{"title":"title 2","description":"description 2","actualComments":["real comment 1","real comment 2","real comment 3"]}, ...]}. Make sure that the 3 comments are in the user-provided list of comments, not generated. Make sure the output is in valid JSON format, and do not add trailing commas.`;
  const userContent = '---\n' + comments.join('\n') + '---';
  const prompt: ChatRequestMessage[] = [
    {
      role: 'system',
      content: systemContent
    },
    { role: 'user', content: userContent }
  ];
  return prompt;
}

export async function getSummary(comments: string[], promptCustomText: string) {
  if (comments.length === 0) {
    return {
      dataSummary: 'No data found',
      commentCount: 0
    };
  }
  const client = new OpenAIClient(ENDPOINT, new AzureKeyCredential(API_KEY), {
    apiVersion: API_VERSION
  });

  comments = reduceCommentToNotExceedTokenLimit(comments);
  let prompt = generatePrompt(comments, promptCustomText);
  const maxRetries = 5;
  let retries = 0;
  let lastError: Error | null = null;
  let summaryGenerated = false;
  let resultData = {
    dataSummary: 'No data found',
    commentCount: 0
  };

  while (comments.length > 0 && retries < maxRetries) {
    try {
      const result = await client.getChatCompletions(
        DEPLOYMENT_ID,
        prompt,
        PARAMETERS
      );
      resultData = {
        dataSummary: result.choices[0].message.content,
        commentCount: comments.length
      };
      summaryGenerated = true;
      break;
    } catch (e) {
      if (e.message.includes("This model's maximum context length")) {
        comments = comments.slice(COMMENT_SLICE_VALUE);
        prompt = generatePrompt(comments, promptCustomText);
        retries += 1;
        lastError = e;
      } else {
        throw Error(
          `Azure OpenAI getChatCompletions failed with error: ${e.message}`
        );
      }
    }
  }
  if (!summaryGenerated && lastError) {
    throw Error(
      `Azure OpenAI getChatCompletions failed after ${maxRetries} retries with error: ${lastError.message}`
    );
  }
  return resultData;
}
