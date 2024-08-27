import { BaseMessage, RequestMessage, ResponseMessage, SupportedFunctions, MessageMap, MessageHandler } from './post-message-types';
import { PostMessageError, isPostMessageError, reconstructError } from './post-message-errors';

export class PostMessageWrapper {
  private handlers: Map<string, MessageHandler<any>> = new Map();
  private pendingRequests: Map<string, { resolve: (value: any) => void; reject: (reason: PostMessageError) => void }> = new Map();

  constructor(
    private target: Window,
    private targetOrigin: string
  ) {
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  private handleMessage(event: MessageEvent) {
    console.log('Received message:', event.data);

    const message = event.data as BaseMessage;
    if (message.isResponse) {
      console.log('Received message response:', message);

      const pendingRequest = this.pendingRequests.get(message.messageId);
      if (pendingRequest) {
        const responseMessage = message as ResponseMessage;
        if (responseMessage.success) {
          pendingRequest.resolve(responseMessage.state);
        } else {
          const error = responseMessage.error ? reconstructError(responseMessage.error) : new PostMessageError('Unknown error');
          pendingRequest.reject(error);
        }
        this.pendingRequests.delete(message.messageId);
      }
    } else {
      const handler = this.handlers.get(message.functionName);
      if (handler) {
        const requestMessage = message as RequestMessage;

        handler(requestMessage)
          .then(result => {
            this.sendResponse(message.messageId, message.functionName, true, result);
          })
          .catch(error => {
            this.sendResponse(message.messageId, message.functionName, false, undefined, error);
          });
      }
    }
  }

  private sendResponse(messageId: string, functionName: string, success: boolean, state?: any, error?: Error) {
    console.log('Sending response, error:', error);
    const response: ResponseMessage = {
      messageId,
      functionName,
      isResponse: true,
      success,
      state,
      error: isPostMessageError(error) ? error : new PostMessageError(error?.message || 'Unknown error'),
    };
    this.target.postMessage(response, this.targetOrigin);
  }

  addListener<T extends SupportedFunctions>(
    functionName: T,
    handler: (request: RequestMessage<MessageMap[T]['request']>) => Promise<MessageMap[T]['response']>
  ): void {
    this.handlers.set(functionName, handler as MessageHandler<any>);
  }

  sendRequest<T extends SupportedFunctions>(functionName: T, payload: MessageMap[T]['request']): Promise<MessageMap[T]['response']> {
    return new Promise((resolve, reject) => {
      const messageId = this.generateId();
      const request: RequestMessage = {
        messageId,
        functionName,
        isResponse: false,
        payload,
      };

      this.pendingRequests.set(messageId, { resolve, reject });
      console.log('Sending request:', request);
      this.target.postMessage(request, this.targetOrigin);

      setTimeout(() => {
        if (this.pendingRequests.has(messageId)) {
          this.pendingRequests.delete(messageId);
          reject(new PostMessageError('Request timed out'));
        }
      }, 30000);
    });
  }

  destroy() {
    window.removeEventListener('message', this.handleMessage);
    this.handlers.clear();
    this.pendingRequests.clear();
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}