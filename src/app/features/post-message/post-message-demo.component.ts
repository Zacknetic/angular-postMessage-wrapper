// post-message-demo.component.ts

import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { PostMessageWrapper } from '../../lib/postMessage/post-message-wrapper';
import { CommonModule, NgFor, NgIf, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MessageMap } from '../../lib/models/post-message-types';
import { OnScreenKeyboardComponent } from '../keyboard/keyboard.component';

interface ChatMessage {
  direction: 'to' | 'from';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-post-message-demo',
  standalone: true,
  imports: [NgFor, NgIf, CommonModule, DatePipe, MatButtonModule, MatIconModule, MatInputModule, MatCardModule, MatFormFieldModule, MatCheckboxModule, FormsModule, ReactiveFormsModule, MatTooltipModule, MatListModule, MatDividerModule, OnScreenKeyboardComponent],
  templateUrl: './post-message-demo.component.html',
  styleUrl: './post-message-demo.component.scss',
})
export class PostMessageDemoComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatMessagesContainer') private chatMessagesContainer!: ElementRef;
  @ViewChild('logMessagesContainer') private logMessagesContainer!: ElementRef;

  protected isParent: boolean = !window.opener;
  #wrapper: PostMessageWrapper | null = null;
  volume: number = 50;

  get postWrapper(): PostMessageWrapper {
    if (!this.#wrapper) throw new Error('Wrapper not initialized');
    return this.#wrapper;
  }

  set postWrapper(wrapper: PostMessageWrapper | null) {
    this.#wrapper = wrapper;
  }

  private childWindow: Window | null = null;
  log: string[] = [];
  chatMessages: ChatMessage[] = [];
  isKeyboardOpen: boolean = false;
  isOtherKeyboardOpen: boolean = false;
  stringData: string = '';

  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    if (window.opener) this.createWrapper(4200);
    else this.createWrapper(4201);
  }

  ngOnDestroy() {
    this.destroyWrapper();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.chatMessagesContainer.nativeElement.scrollTop = this.chatMessagesContainer.nativeElement.scrollHeight;
      this.logMessagesContainer.nativeElement.scrollTop = this.logMessagesContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  private addToLog(message: string) {
    this.ngZone.run(() => {
      this.log.push(`${new Date().toISOString()}: ${message}`);
    });
  }

  private addToChatMessages(direction: 'to' | 'from', content: string) {
    this.ngZone.run(() => {
      this.chatMessages.push({
        direction,
        content,
        timestamp: new Date(),
      });
    });
  }

  createWrapper(port: number) {
    this.destroyWrapper();

    if (this.isParent) this.childWindow = window.open(`http://localhost:${port}`, 'childWindow', 'width=800,height=600');

    const target = this.isParent ? this.childWindow : window.opener;
    this.postWrapper = new PostMessageWrapper(target, `http://localhost:${port}`);
    this.addToLog(`Created listener for port ${port} as ${this.isParent ? 'parent' : 'child'}`);
    this.setupListeners();
  }

  private setupListeners() {
    this.addToLog('Setting up listeners...');

    this.postWrapper.addListener('openKeyboard', async request => {
      this.isKeyboardOpen = request.payload.openKeyboard;
      await this.openKeyboard(request.payload.openKeyboard).catch(error => {
        this.addToLog(`Failed to change keyboard state: ${error.message}`);
        throw error;
      });
      this.addToLog(`Keyboard state successfully changed to ${this.isKeyboardOpen}, reporting back...`);
      return { isKeyboardOpen: this.isKeyboardOpen };
    });

    this.postWrapper.addListener(`sendChat`, async request => {
      this.addToChatMessages('from', `Received: ${request.payload.stringData}`);
      const chatHasThisMessage = this.chatMessages.some(message => message.content === `Received: ${request.payload.stringData}`);
      return { isChatSent: chatHasThisMessage };
    });

    this.postWrapper.addListener(`startCall`, async request => {
      const callHasStarted = true;
      this.addToLog(`Call started: ${callHasStarted}`);
      return { isCallJoined: callHasStarted };
    });

    this.postWrapper.addListener(`endCall`, async () => {
      return { isCallEnded: true };
    });

    this.postWrapper.addListener(`shareScreen`, async request => {
      this.addToLog(`Screen sharing ${request.payload.shareScreen ? 'enabled' : 'disabled'}`);
      return { isScreenShared: request.payload.shareScreen };
    });

    this.postWrapper.addListener(`setVolume`, async request => {
      this.volume += request.payload.changeAmount;
      this.addToLog(`Volume ${request.payload.changeAmount > 0 ? 'increased' : 'decreased'} by ${Math.abs(request.payload.changeAmount)} to ${this.volume}`);
      return { currentVolume: this.volume };
    });

    this.postWrapper.addListener('scanDocument', async request => {
      this.addToLog(`Document scanning ${request.payload.openScanner ? 'enabled' : 'disabled'}`);
      return { isDocumentScanned: request.payload.openScanner };
    });
  }

  /**
   * Example usage of try-catch block to handle errors.
   */
  async handleOpenKeyboard() {
    this.addToLog("Toggling the other's keyboard...");
    try {
      const response = await this.postWrapper.sendRequest('openKeyboard', { openKeyboard: !this.isOtherKeyboardOpen });
      this.isOtherKeyboardOpen = response.isKeyboardOpen;
      this.addToLog(`ATTENTION - KEYBOARD STATE HAS FINALLY ${response.isKeyboardOpen ? 'OPENED' : 'CLOSED'}`);
    } catch (error) {
      console.log(error);
      this.addToLog(`Request failed: ${error}`);
    }
  }

  /**
   * Example usage of .then() and .catch() to handle errors instead of try-catch block.
   *
   * Please note: After defining the 'sendChat' listener in the setupListeners() method, the request object must be correctly typed.
   * @param event
   */
  handleSendStringData(event?: any): void {
    if (event && event.target && (event.target as HTMLElement).tagName !== 'INPUT' && event.type !== 'click') {
      return; // Only proceed if the event originated from an input element or a click event
    }
    if (!this.stringData.trim()) return;
    this.addToLog('Sending string data...');
    this.postWrapper
      .sendRequest('sendChat', { stringData: this.stringData })
      .then(response => {
        this.addToLog(`String data successfully arrived: ${response.isChatSent}`);
        this.onSend();
      })
      .catch(error => {
        console.log(error);
        this.addToLog(`Request failed: ${error.message}`);
      });
  }

  /**
   * Example usage of MessageMap['startCall']['request'], simplifying the argument type.
   * @param data
   */
  handleStartCall(data: MessageMap['startCall']['request']) {
    this.addToLog('Requesting to start call...');
    this.postWrapper
      .sendRequest('startCall', data)
      .then(response => {
        this.addToLog(`Call started: ${response.isCallJoined} in room ${data.roomId}`);
      })
      .catch(error => {
        console.log(error);
        this.addToLog(`Request failed: ${error.message}`);
      });
  }

  handleEndCall() {
    this.addToLog('Requesting to end call...');
    this.postWrapper
      .sendRequest('endCall', {})
      .then(response => {
        this.addToLog(`Call ended: ${response.isCallEnded}`);
      })
      .catch(error => {
        console.log(error);
        this.addToLog(`Request failed: ${error.message}`);
      });
  }

  handleShareScreen() {
    this.addToLog('Requesting to share screen...');
    this.postWrapper
      .sendRequest('shareScreen', { shareScreen: true })
      .then(response => {
        this.addToLog(`Screen shared: ${response.isScreenShared}`);
      })
      .catch(error => {
        console.log(error);
        this.addToLog(`Request failed: ${error.message}`);
      });
  }

  handleScanDocument() {
    this.addToLog('Requesting to scan document...');
    this.postWrapper
      .sendRequest('scanDocument', { openScanner: true })
      .then(response => {
        this.addToLog(`Document scanned: ${response.isDocumentScanned}`);
      })
      .catch(error => {
        console.log(error);
        this.addToLog(`Request failed: ${error.message}`);
      });
  }

  handleSetVolume(changeAmount: number) {
    this.addToLog('Requesting to set volume...');
    this.postWrapper
      .sendRequest('setVolume', { changeAmount })
      .then(response => {
        this.addToLog(`Volume set: ${response.currentVolume}`);
      })
      .catch(error => {
        console.log(error);
        this.addToLog(`Request failed: ${error.message}`);
      });
  }

  // Perhaps a more elegant way to handle this in the wrapper exists.
  private destroyWrapper() {
    if (this.#wrapper !== null) {
      this.#wrapper.destroy();
      this.postWrapper = null;
    }
    this.childWindow?.close();
    this.childWindow = null;
  }

  private async openKeyboard(state: boolean) {
    // throw new Error(`Expected: Keyboard state. Received: A bowl of petunias.`);
    const waitTime = this.isKeyboardOpen ? 5000 : 500;
    return new Promise<boolean>((resolve, reject) => {
      setTimeout(() => {
        resolve(state);
      }, waitTime);
    });
  }

  onSend() {
    this.addToChatMessages('to', `Sent: ${this.stringData}`);
    this.stringData = ''; // Clear the input after sending
  }

  onKeyPress(key: string) {
    if (key === 'Backspace') {
      this.stringData = this.stringData.slice(0, -1);
    } else if (key === '\n') {
      this.handleSendStringData();
    } else {
      this.stringData += key;
    }
  }
}
