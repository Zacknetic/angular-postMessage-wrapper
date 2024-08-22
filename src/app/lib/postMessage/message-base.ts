import { MessageType, MessageEventPayload } from '../models/message-types';

export class MessageBase {
  protected pendingRequests = new Map<string, (event: MessageEvent) => void>();

  constructor(protected targetWindow: Window, protected targetOrigin: string) {}

  protected postMessage<T>(
    type: MessageType,
    payload: T | undefined,
    requestId: string
  ) {
    const message: MessageEventPayload<T | undefined> = {
      type,
      payload,
      requestId,
    };
    this.targetWindow.postMessage(message, this.targetOrigin);
  }

  async sendMessage<T>(type: MessageType, payload?: T): Promise<void> {
    const requestId = generateRequestId();

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(requestId, (event: MessageEvent) => {
        if (event.data.type === MessageType.Error) {
          reject(new Error(event.data.payload.message));
        } else if (event.data.type === type) {
          resolve();
        }
        this.pendingRequests.delete(requestId);
      });

      this.postMessage(type, payload, requestId);
    });
  }

  async listenForMessage<T>(type: MessageType): Promise<T> {
    return new Promise<T>((resolve) => {
      const handleMessage = (event: MessageEvent) => {
        if (event.origin === this.targetOrigin && event.data.type === type) {
          window.removeEventListener('message', handleMessage); // Clean up listener
          resolve(event.data.payload as T);
        }
      };

      window.addEventListener('message', handleMessage);
    });
  }
}

function generateRequestId(idLength = 8, randomString = ''): string {
  randomString += Math.random().toString(20).substring(2, idLength);
  if (randomString.length > idLength) return randomString.slice(0, idLength);
  return generateRequestId(idLength, randomString);
}
