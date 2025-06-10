export type Rating = {
  pageURL: string;
  rating: boolean;
}

export type Comment = {
  comment: string,
  feedbackId?: number,
  pageURL?: string,
  rating?: boolean
}

export type Email = {
  email: string;
  feedbackId: number;
}

export type FeedbackResponse = {
  statusCode: FeedbackResponseStatusCodes;
  headers: {
    'Access-Control-Allow-Origin': '*';
    'Access-Control-Allow-Credentials': true;
  };
  body: string;
};

export enum FeedbackResponseStatusCodes {
  Success = 200,
  Error = 500
}