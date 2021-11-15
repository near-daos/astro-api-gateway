export interface Token {
  token: string;
}
export interface Topic {
  topic: string;
}
export interface Condition {
  condition: string;
}

export type MessagingOptions = Token | Topic | Condition;

export interface Notification {
  title: string;
  body: string;
  imageUrl: string;
}
