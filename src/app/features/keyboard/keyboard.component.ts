import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-on-screen-keyboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div [@slideUpDown]="isVisible ? 'visible' : 'hidden'" class="keyboard-container">
      <div class="keyboard-row" *ngFor="let row of currentLayout">
        <ng-container *ngFor="let key of row">
          <button mat-raised-button 
                  [ngClass]="{
                    'wide-key': key === 'Space',
                    'medium-key': key === 'Return' || key === 'Shift' || key === '123' || key === 'ABC',  
                    'shift-key': key === 'Shift',
                    'active': isShiftActive && key === 'Shift'
                  }"
                  (click)="onKeyPress(key)">
            <ng-container [ngSwitch]="key">
              <mat-icon *ngSwitchCase="'Backspace'">backspace</mat-icon>
              <mat-icon *ngSwitchCase="'Shift'">arrow_upward</mat-icon>
              <mat-icon *ngSwitchCase="'123'">dialpad</mat-icon>
              <mat-icon *ngSwitchCase="'ABC'">keyboard</mat-icon>
              <mat-icon *ngSwitchCase="'#+='">#+=</mat-icon>
              <mat-icon *ngSwitchCase="'Return'">keyboard_return</mat-icon>
              <span *ngSwitchDefault>{{isShiftActive ? key.toUpperCase() : key.toLowerCase()}}</span>
            </ng-container>
          </button>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .keyboard-container {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: #d1d4db;
      padding: 5px;
      border-top: 1px solid #ccc;
    }
    .keyboard-row {
      display: flex;
      justify-content: center;
      margin-bottom: 5px;
    }
    button {
      margin: 0 2px;
      min-width: 30px;
      height: 40px;
      border-radius: 5px;
      font-size: 16px;
      background-color: #ffffff;
      color: #000000;
    }
    .wide-key {
      flex-grow: 1;
      max-width: 200px;
    }
    .medium-key {
      min-width: 60px;
    }
    .shift-key, .active {
      background-color: #007aff;
      color: #ffffff;
    }
  `],
  animations: [
    trigger('slideUpDown', [
      state('hidden', style({
        transform: 'translateY(100%)',
      })),
      state('visible', style({
        transform: 'translateY(0)',
      })),
      transition('hidden => visible', animate('5000ms ease-in')),
      transition('visible => hidden', animate('500ms ease-out')),
    ]),
  ],
})
export class OnScreenKeyboardComponent {
  @Input() isVisible: boolean = false;
  @Output() keyPress = new EventEmitter<string>();

  isShiftActive: boolean = false;
  currentLayoutType: 'main' | 'numbers' | 'symbols' = 'main';

  mainLayout = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace'],
    ['123', ',', 'Space', '.', 'Return']
  ];

  numberLayout = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
    ['#+=', '.', ',', '?', '!', "'", 'Backspace'],
    ['ABC', 'Space', 'Return']
  ];

  symbolLayout = [
    ['[', ']', '{', '}', '#', '%', '^', '*', '+', '='],
    ['_', '\\', '|', '~', '<', '>', '€', '£', '¥', '•'],
    ['123', '.', ',', '?', '!', "'", 'Backspace'],
    ['ABC', 'Space', 'Return']
  ];
  isShiftLocked: any;

  get currentLayout(): string[][] {
    switch (this.currentLayoutType) {
      case 'numbers':
        return this.numberLayout;
      case 'symbols':
        return this.symbolLayout;
      default:
        return this.mainLayout;
    }
  }

  onKeyPress(key: string) {
    switch (key) {
      case 'Shift':
        this.isShiftActive = !this.isShiftActive;
        break;
      case '123':
        this.currentLayoutType = 'numbers';
        break;
      case '#+=':
        this.currentLayoutType = 'symbols';
        break;
      case 'ABC':
        this.currentLayoutType = 'main';
        break;
      case 'Space':
        this.keyPress.emit(' ');
        break;
      case 'Return':
        this.keyPress.emit('\n');
        break;
      case 'Backspace':
        this.keyPress.emit('Backspace');
        break;
      default:
        const emittedKey = this.isShiftActive ? key.toUpperCase() : key.toLowerCase();
        this.keyPress.emit(emittedKey);
        if (this.isShiftActive && !this.isShiftLocked) {
          this.isShiftActive = false;
        }
    }
  }

  toggleShiftLock() {
    this.isShiftActive = !this.isShiftActive;
  }
}