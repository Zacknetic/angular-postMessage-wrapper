import { Component } from '@angular/core';
import { MessageType } from '../../lib/models/message-types';
import { MessageSender } from '../../lib/postMessage/message-sender';
import { AppConfigService } from '../../services/app-config.service';

@Component({
  selector: 'app-sender',
  standalone: true,
  template: `
    <button (click)="openKeyboard()">Open Keyboard</button>
    <button (click)="sendText()">Send Text</button>
    <button (click)="openChildWindow()">Open Child Window</button>
  `,
})
export class SenderComponent {
  private messageSender: MessageSender | null = null;
  constructor(private appConfigService: AppConfigService) {}

  openChildWindow() {
    // Open the child window and reference it for message sending
    const childWindow = window.open('http://localhost:4201', 'childWindow', 'width=800,height=600');
    if (childWindow) {
      this.messageSender = new MessageSender(childWindow, this.appConfigService);
    } else {
      console.error('Failed to open child window.');
    }
  }

  async sendText() {
    if (!this.messageSender) {
      console.error('MessageSender not initialized. Open the child window first.');
      return;
    }

    try {
      const response = await this.messageSender.sendMessageAndWaitForResponse<{ text: string }, { result: string }>(
        MessageType.SendTextData,
        { text: 'Hello from Parent Window' }
      );
      console.log('Received acknowledgment:', response.result);
    } catch (error) {
      console.error('Error sending text data:', error);
    }
  }

  async openKeyboard() {
    if (!this.messageSender) {
      console.error('MessageSender not initialized. Open the child window first.');
      return;
    }

    try {
      const response = await this.messageSender.sendMessageAndWaitForResponse<void, { message: string }>(
        MessageType.OpenKeyboard
      );
      console.log('Received acknowledgment:', response.message);
    } catch (error) {
      console.error('Error opening keyboard:', error);
    }
  }
}