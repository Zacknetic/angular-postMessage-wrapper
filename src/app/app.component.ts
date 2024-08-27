import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SenderComponent } from './features/sender/sender.component';
import { ListenerComponent } from './features/listener/listener.component';
import { PostMessageDemoComponent } from './features/combined/post-message-demo.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SenderComponent, ListenerComponent, PostMessageDemoComponent ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'angular-postMessage-wrapper';
}
