export type Rating = {
  pageURL: string;
  rating: boolean;
};

export type Comment = {
  comment: string;
  feedbackId?: number;
  pageURL?: string;
  rating?: boolean;
};

export type Email = {
  email: string;
  feedbackId: number;
};

export type FeedbackRecord = {
  date: number;
  pageUrl: string;
  rating: boolean;
  comment?: string;
};

export type FeedbackResponse = {
  statusCode: FeedbackResponseStatusCodes;
  headers: {
    'Access-Control-Allow-Origin': '*';
    'Access-Control-Allow-Credentials': true;
  };
  body: string;
};

export type FeedbackBody = {
  message: string;
  feedbackId?: number;
};

export enum FeedbackResponseStatusCodes {
  Success = 200,
  Error = 500
}

export enum Feedback {
  PageURL,
  Rating,
  Comment,
  Email,
  Timestamp
}
