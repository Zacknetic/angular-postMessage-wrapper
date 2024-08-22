export interface TextDataPayload {
  text: string;
}

export enum MessageType {
  OpenKeyboard = 'OPEN_KEYBOARD',
  SendTextData = 'SEND_TEXT_DATA',
  Error = 'ERROR',
}

export interface MessageEventPayload<T> {
  type: MessageType;
  payload: T;
  requestId: string;
}

export interface ErrorPayload {
  message: string;
  name: string;
  stack?: string;
}
