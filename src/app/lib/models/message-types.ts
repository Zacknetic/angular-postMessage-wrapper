export enum MessageType {
  OpenKeyboard = 'OPEN_KEYBOARD',
  SendTextData = 'SEND_TEXT_DATA',
  Error = 'ERROR',
}

export interface TextDataPayload {
  text: string;
}

export interface ErrorPayload {
  message: string;
  name: string;
  stack?: string;
}

export interface MessageEventPayload<T> {
  type: MessageType;
  payload: T;
  requestId: string;
}
