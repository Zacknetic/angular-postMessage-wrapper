import { AppConfigService } from '../../services/app-config.service';
import { MessageType, MessageEventPayload, ErrorPayload } from '../models/message-types';

export class MessageBase {
  protected pendingRequests = new Map<string, (event: MessageEvent) => void>();

  constructor(
    protected targetWindow: Window, // The target window to send messages to
    private appConfigService: AppConfigService // Service to provide dynamic origin
  ) {}

  /**
   * Sends a message to the target window with the specified type and payload.
   * The message is associated with a unique requestId.
   */
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

    const targetOrigin = this.appConfigService.getTargetOrigin(); // Get the dynamic origin
    console.log(`Sending message to ${targetOrigin}`, message);

    if (this.targetWindow) {
      this.targetWindow.postMessage(message, targetOrigin);
    } else {
      console.error('Target window is not defined.');
    }
  }

  /**
   * Sends a message and waits for the corresponding response or acknowledgment.
   * The requestId is used to match the response with the request.
   */
  async sendMessageAndWaitForResponse<T, R>(
    type: MessageType,
    payload?: T
  ): Promise<R> {
    const requestId = generateRequestId();

    return new Promise<R>((resolve, reject) => {
      this.pendingRequests.set(requestId, (event: MessageEvent) => {
        console.log(`Received message: ${event.data.type}, requestId: ${event.data.requestId}`);
        
        if (event.data.type === MessageType.Error) {
          reject(new Error(event.data.payload.message));
        } else if (
          event.data.type === type &&
          event.data.payload &&
          event.data.payload.acknowledged === true &&
          event.data.requestId === requestId
        ) {
          resolve(event.data.payload as R);
          this.pendingRequests.delete(requestId); // Only remove after resolving
        }
      });

      this.postMessage(type, payload, requestId);
      console.log("waiting for response", requestId);
    });
  }

  /**
   * Listens for a specific type of message, processes the payload, and sends a response.
   * The requestId is used to ensure the response is correctly matched.
   */
  listenAndRespond<T, R>(
    type: MessageType,
    processPayload: (payload: T | undefined) => R,
    handleError?: (error: any) => void
  ) {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin === this.appConfigService.getTargetOrigin() && event.data.type === type) {
        const requestId = event.data.requestId;

        // Avoid responding to the acknowledgment of this listener
        if (event.data.payload && (event.data.payload as any).acknowledged) {
          return;
        }

        try {
          const response = processPayload(event.data.payload as T);
          this.sendAcknowledgment(type, requestId, response, event.origin); // Pass event.origin as target origin
        } catch (error) {
          if (handleError) handleError(error);
          this.sendError(type, error, requestId, event.origin); // Pass event.origin as target origin
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Return an object to allow stopping the listener
    return {
      stop: () => {
        window.removeEventListener('message', handleMessage);
      }
    };
  }

  /**
   * Sends an acknowledgment back to the sender after processing the message.
   * Includes an 'acknowledged' flag to differentiate the response.
   */
  protected sendAcknowledgment<R>(type: MessageType, requestId: string, response: R, targetOrigin: string) {
    const payload: R = {
      ...response,
      acknowledged: true, // Include an "acknowledged" flag to differentiate responses
    } as R;

    console.log(`Sending acknowledgment for type: ${type}, requestId: ${requestId} to ${targetOrigin}`);

    if (this.targetWindow) {
      this.targetWindow.postMessage(payload, targetOrigin);
    } else {
      console.error('Target window is not defined.');
    }
  }

  /**
   * Sends an error response back to the sender if processing the message fails.
   */
  protected sendError(type: MessageType, error: any, requestId: string, targetOrigin: string) {
    const payload: ErrorPayload = {
      message: error.message || 'Unknown error',
      name: error.name || 'Error',
      stack: error.stack,
    };

    console.log(`Sending error for type: ${type}, requestId: ${requestId} to ${targetOrigin}`);

    if (this.targetWindow) {
      this.targetWindow.postMessage(payload, targetOrigin);
    } else {
      console.error('Target window is not defined.');
    }
  }
}

/**
 * Utility function to generate a unique request ID.
 */
function generateRequestId(idLength = 8, randomString = ''): string {
  randomString += Math.random().toString(20).substring(2, idLength);
  if (randomString.length > idLength) return randomString.slice(0, idLength);
  return generateRequestId(idLength, randomString);
}
