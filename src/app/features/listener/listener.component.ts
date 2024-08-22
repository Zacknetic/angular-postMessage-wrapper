import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageListener } from '../../lib/postMessage/message-listener';
import { AppConfigService } from '../../services/app-config.service';

@Component({
  selector: 'app-listener',
  standalone: true,
  template: `
    <p>{{ message }}</p>
  `,
})
export class ListenerComponent implements OnInit, OnDestroy {
  message: string | null = null;
  private messageListener: MessageListener;
  private openKeyboardSubscription: any;
  private sendTextDataSubscription: any;

   constructor(private appConfigService: AppConfigService) {
    // Use window.parent as the sender is the parent window
    this.messageListener = new MessageListener(window.parent, this.appConfigService);
  }

  ngOnInit() {
    this.openKeyboardSubscription = this.messageListener.listenForOpenKeyboard(() => {
      console.log('Processing OpenKeyboard message');
      this.message = 'Keyboard Opened';
      return { message: 'Keyboard opened successfully' };
    });

    this.sendTextDataSubscription = this.messageListener.listenForSendTextData((text: string) => {
      console.log('Processing SendTextData message:', text);
      this.message = text;
      return { result: `Received and processed: ${text}` };
    });
  }

  ngOnDestroy() {
    this.openKeyboardSubscription.stop();
    this.sendTextDataSubscription.stop();
  }
}
