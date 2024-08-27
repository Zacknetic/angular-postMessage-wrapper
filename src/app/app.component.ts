import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PostMessageDemoComponent } from './features/post-message/post-message-demo.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PostMessageDemoComponent ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
}
