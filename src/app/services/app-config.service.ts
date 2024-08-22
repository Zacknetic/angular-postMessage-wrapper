import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private targetOrigin: string = '';
  private childWindow: Window | null = null;
  constructor() {
    this.setOrigin();
  }

  private setOrigin() {
    // Determine the origin dynamically based on environment or port
    const port = window.location.port; // Get the current port
    const protocol = window.location.protocol; // http or https
    const host = window.location.hostname; // localhost or a specific hostname

    // Dynamically set the target origin
    if (port === '4200') {
      this.targetOrigin = `${protocol}//${host}:4201`; // Set target for instance on port 4201
    } else if (port === '4201') {
      this.targetOrigin = `${protocol}//${host}:4200`; // Set target for instance on port 4200
    } else {
      // Default or fallback origin
      this.targetOrigin = `${protocol}//${host}:4200`;
    }
  }

  getTargetOrigin(): string {
    return this.targetOrigin;
  }
}
