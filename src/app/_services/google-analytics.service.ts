import { Injectable } from '@angular/core';

declare var gtag;

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {

  constructor() { }

  sendEvent(action: string, category: string, label: string, value?: number) {
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value
    });
  }
}
