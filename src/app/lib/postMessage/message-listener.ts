import { MessageBase } from './message-base';
import { MessageType, TextDataPayload } from '../models/message-types';

export class MessageListener extends MessageBase {
  listenForOpenKeyboard(process: () => { message: string }) {
    return this.listenAndRespond<void, { message: string; acknowledged: boolean }>(
      MessageType.OpenKeyboard,
      () => {
        const response = process();
        return { ...response, acknowledged: true };
      },
      (error) => console.error('Error handling OpenKeyboard:', error)
    );
  }

  listenForSendTextData(process: (text: string) => { result: string }) {
    return this.listenAndRespond<TextDataPayload, { result: string; acknowledged: boolean }>(
      MessageType.SendTextData,
      (payload) => {
        if (payload) {
          const response = process(payload.text);
          return { ...response, acknowledged: true };
        }
        throw new Error('Payload is undefined');
      },
      (error) => console.error('Error handling SendTextData:', error)
    );
  }
}
