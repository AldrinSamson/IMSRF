import { Injectable, TemplateRef } from '@angular/core';

@Injectable()
export class AlertService {

  toasts: any[] = [];

  showToaster(textOrTpl: string | TemplateRef<any>, options: any = {}) {
    this.toasts.push({ textOrTpl, ...options });
  }

  remove(toast) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }
}
