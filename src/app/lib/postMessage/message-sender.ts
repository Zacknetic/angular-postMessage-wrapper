// message-sender.ts

import { MessageBase } from './message-base';
import { MessageType, TextDataPayload } from '../models/message-types';

export class MessageSender extends MessageBase {
  async openKeyboard(): Promise<void> {
    return this.sendMessageAndWaitForResponse<void, void>(MessageType.OpenKeyboard);
  }

  async sendTextData(text: string): Promise<void> {
    if (!text) {
      throw new Error('Text data cannot be empty');
    }
    const payload: TextDataPayload = { text };
    return this.sendMessageAndWaitForResponse<TextDataPayload, void>(MessageType.SendTextData, payload);
  }
}
