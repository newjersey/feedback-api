import {
  OpenAIClient,
  AzureKeyCredential,
  ChatRequestMessage
} from '@azure/openai';

import { SHEET_CONFIGS } from '../constants';

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

export async function getSummary(
  comments: string[],
  sheet,
  sheetTabName: string
) {
  if (comments.length === 0) {
    return '{}';
  }
  const client = new OpenAIClient(ENDPOINT, new AzureKeyCredential(API_KEY), {
    apiVersion: API_VERSION
  });
  const promptText = SHEET_CONFIGS[sheet].urls[sheetTabName]?.prompt || '';
  const systemContent = `You are an assistant designed to find the most common themes in a large dataset of free text. Users will send a list of comments written by residents of New Jersey about their experience ${promptText}, where each line represents one comment. You will find the 10 most common themes in the data, and for each theme, you will include a theme title, theme description, and 3 real comments (actually in the dataset, not generated) that fit the given theme. Your output will be in the following structured valid JSON format: {"themes":[{"title":"title 1","description":"description 1","actualComments":["real comment 1","real comment 2","real comment 3"]},{"title":"title 2","description":"description 2","actualComments":["real comment 1","real comment 2","real comment 3"]}, ...]}. Make sure that the 3 comments are in the user-provided list of comments, not generated. Make sure the output is in valid JSON format, and do not add trailing commas.`;
  const userContent = '---\n' + comments.join('\n') + '---';
  const prompt: ChatRequestMessage[] = [
    {
      role: 'system',
      content: systemContent
    },
    { role: 'user', content: userContent }
  ];

  try {
    const result = await client.getChatCompletions(
      DEPLOYMENT_ID,
      prompt,
      PARAMETERS
    );
    return result.choices[0].message.content;
  } catch (e) {
    throw Error(
      `Azure OpenAI getChatCompletions failed with error: ${e.message}`
    );
  }
}
