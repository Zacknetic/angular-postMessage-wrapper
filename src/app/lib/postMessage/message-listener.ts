import { MessageBase } from './message-base';
import { MessageType, TextDataPayload } from '../models/message-types';

export class MessageListener extends MessageBase {
  async onOpenKeyboard(): Promise<void> {
    return this.listenForMessage<void>(MessageType.OpenKeyboard);
  }

  async onSendTextData(): Promise<string> {
    const payload = await this.listenForMessage<TextDataPayload>(MessageType.SendTextData);
    return payload.text;
  }
}
