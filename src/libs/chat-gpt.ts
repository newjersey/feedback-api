import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

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

export async function getSummary(comments: string[], pageURL: string) {
  const client = new OpenAIClient(ENDPOINT, new AzureKeyCredential(API_KEY), {
    apiVersion: API_VERSION
  });

  const programName = pageURL.includes('uistatus')
    ? 'Unemployment Insurance'
    : pageURL.includes('myleavebenefits')
    ? 'Temporary Disability Insurance and Family Leave Insurance'
    : '';

  const systemContent = `You are an assistant designed to find the most frequently recurring themes from a large dataset of free text. Users will paste in a list of comments written by residents of New Jersey about their experience applying for ${programName} benefits, where each line represents one comment. You will find the 10 most common themes in the data, and for each theme, you will generate a title, description, and include only 3 actual comments from the data that fit the given theme. Your output will be in the following structured valid JSON format: {"themes":[{"title":"title 1","description":"description 1","actualComments":["actual comment 1","actual comment 2","actual comment 3"]},{"title":"title 2","description":"description 2","actualComments":["actual comment 1","actual comment 2","actual comment 3"]}, ...]}. Make sure that the output is in valid JSON format, and do not add trailing commas.`;
  const userContent = '---\n' + comments.join('\n') + '---';
  const prompt = [
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
