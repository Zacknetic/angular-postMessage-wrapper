import { PostMessageError } from './post-message-errors';

export type MessageHandler<T extends BaseMessage> = (message: T) => Promise<any>;

export interface BaseMessage {
  messageId: string;
  functionName: string;
  isResponse: boolean;
}

export interface RequestMessage<T = unknown> extends BaseMessage {
  isResponse: false;
  payload: T;
}

export interface ResponseMessage<T = unknown> extends BaseMessage {
  isResponse: true;
  success: boolean;
  error?: PostMessageError;
  state?: T;
}

export type SupportedFunctions = 'openKeyboard' | 'sendChat' | 'startCall' | 'endCall' | 'shareScreen' | 'setVolume' | 'getVolume' | 'scanDocument';

export type MessageMap = {
  openKeyboard: {
    request: { openKeyboard: boolean };
    response: { isKeyboardOpen: boolean };
  };
  sendChat: {
    request: { stringData: string };
    response: { isChatSent: boolean };
  };
  startCall: {
    request: { roomId: string; zoomToken: string };
    response: { isCallJoined: boolean };
  };
  endCall: {
    request: {};
    response: { isCallEnded: boolean };
  };
  shareScreen: {
    request: { shareScreen: boolean };
    response: { isScreenShared: boolean };
  };
  setVolume: {
    request: { changeAmount: number };
    response: { currentVolume: number };
  };
  getVolume: {
    request: {};
    response: { volume: number };
  };
  scanDocument: {
    request: { openScanner: boolean };
    response: { isDocumentScanned: boolean };
  };
};
