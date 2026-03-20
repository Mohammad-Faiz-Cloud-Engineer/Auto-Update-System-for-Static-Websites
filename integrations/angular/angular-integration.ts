/**
 * Angular Integration Example
 * Auto-Update System for Angular Applications
 */

import { Injectable, Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Auto-Update Service
 */
@Injectable({
  providedIn: 'root'
})
export class AutoUpdateService implements OnDestroy {
  private updateAvailableSubject = new BehaviorSubject<boolean>(false);
  private currentVersionSubject = new BehaviorSubject<string | null>(null);
  private newVersionSubject = new BehaviorSubject<string | null>(null);
  private isEnabledSubject = new BehaviorSubject<boolean>(true);

  public updateAvailable$: Observable<boolean> = this.updateAvailableSubject.asObservable();
  public currentVersion$: Observable<string | null> = this.currentVersionSubject.asObservable();
  public newVersion$: Observable<string | null> = this.newVersionSubject.asObservable();
  public isEnabled$: Observable<boolean> = this.isEnabledSubject.asObservable();

  constructor() {
    this.initAutoUpdate();
  }

  private initAutoUpdate(): void {
    if (!(window as any).AutoUpdate) {
      console.error('AutoUpdate not loaded');
      return;
    }

    (window as any).AutoUpdate.init({
      manifestUrl: '/version-manifest.json',
      checkInterval: 30000,
      forceUpdate: false,
      showNotification: false,
      debug: false,
      rolloutPercentage: 1.0, // 100% rollout
      
      onUpdateAvailable: (newVersion: string, oldVersion: string) => {
        this.updateAvailableSubject.next(true);
        this.currentVersionSubject.next(oldVersion);
        this.newVersionSubject.next(newVersion);
      },
      
      onUpdateComplete: (version: string) => {
        this.updateAvailableSubject.next(false);
        this.currentVersionSubject.next(version);
      },
      
      onError: (error: Error) => {
        console.error('Auto-update error:', error);
      }
    });

    // Get initial version
    const version = (window as any).AutoUpdate.getVersion();
    this.currentVersionSubject.next(version);
  }

  public checkNow(): void {
    if ((window as any).AutoUpdate) {
      (window as any).AutoUpdate.checkNow();
    }
  }

  public applyUpdate(): void {
    if ((window as any).AutoUpdate) {
      (window as any).AutoUpdate.applyUpdate();
    }
  }

  public enable(): void {
    if ((window as any).AutoUpdate) {
      (window as any).AutoUpdate.enable();
      this.isEnabledSubject.next(true);
    }
  }

  public disable(): void {
    if ((window as any).AutoUpdate) {
      (window as any).AutoUpdate.disable();
      this.isEnabledSubject.next(false);
    }
  }

  ngOnDestroy(): void {
    if ((window as any).AutoUpdate) {
      (window as any).AutoUpdate.destroy();
    }
  }
}

/**
 * Update Notification Component
 */
@Component({
  selector: 'app-update-notification',
  template: `
    <div class="update-notification" *ngIf="showNotification">
      <div class="update-content">
        <div class="update-icon">🔄</div>
        <div class="update-text">
          <strong>New version available!</strong>
          <p>Version {{ newVersion }} is ready to install.</p>
        </div>
        <div class="update-actions">
          <button (click)="applyUpdate()" class="btn-primary">
            Update Now
          </button>
          <button (click)="dismiss()" class="btn-secondary">
            Later
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .update-notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      padding: 20px;
      max-width: 420px;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        transform: translateY(100px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .update-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .update-icon {
      font-size: 48px;
    }

    .update-text strong {
      display: block;
      font-size: 16px;
      margin-bottom: 4px;
    }

    .update-text p {
      font-size: 14px;
      color: #666;
      margin: 0;
    }

    .update-actions {
      display: flex;
      gap: 12px;
    }

    .btn-primary,
    .btn-secondary {
      flex: 1;
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }
  `]
})
export class UpdateNotificationComponent implements OnInit {
  showNotification = false;
  newVersion: string | null = null;

  constructor(private autoUpdateService: AutoUpdateService) {}

  ngOnInit(): void {
    this.autoUpdateService.updateAvailable$.subscribe(available => {
      this.showNotification = available;
    });

    this.autoUpdateService.newVersion$.subscribe(version => {
      this.newVersion = version;
    });
  }

  applyUpdate(): void {
    this.showNotification = false;
    this.autoUpdateService.applyUpdate();
  }

  dismiss(): void {
    this.showNotification = false;
  }
}

/**
 * App Component Example
 */
@Component({
  selector: 'app-root',
  template: `
    <div class="app">
      <header>
        <h1>My Angular App</h1>
        <div class="version">Version: {{ currentVersion$ | async }}</div>
        <button (click)="checkForUpdates()">Check for Updates</button>
      </header>

      <main>
        <router-outlet></router-outlet>
      </main>

      <app-update-notification></app-update-notification>
    </div>
  `,
  styles: [`
    .app {
      min-height: 100vh;
    }

    header {
      padding: 20px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 20px;
    }

    h1 {
      margin: 0;
      font-size: 24px;
    }

    .version {
      color: #6b7280;
      font-size: 14px;
    }

    button {
      padding: 8px 16px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }

    button:hover {
      background: #2563eb;
    }
  `]
})
export class AppComponent implements OnInit {
  currentVersion$: Observable<string | null>;

  constructor(public autoUpdateService: AutoUpdateService) {
    this.currentVersion$ = this.autoUpdateService.currentVersion$;
  }

  ngOnInit(): void {
    // Component initialization
  }

  checkForUpdates(): void {
    this.autoUpdateService.checkForUpdates();
  }
}

/**
 * App Module
 */
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,
    UpdateNotificationComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([])
  ],
  providers: [AutoUpdateService],
  bootstrap: [AppComponent]
})
export class AppModule { }

/**
 * Usage in index.html:
 * 
 * <!doctype html>
 * <html lang="en">
 * <head>
 *   <meta charset="utf-8">
 *   <title>My Angular App</title>
 *   <base href="/">
 *   <meta name="viewport" content="width=device-width, initial-scale=1">
 *   <script src="/auto-update.js"></script>
 * </head>
 * <body>
 *   <app-root></app-root>
 * </body>
 * </html>
 */
