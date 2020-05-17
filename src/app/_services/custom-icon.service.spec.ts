import { TestBed, inject } from '@angular/core/testing';

import { CustomIconService } from './custom-icon.service';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

describe('CustomIconService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [CustomIconService],
    imports: [MatIconModule]
  }));

  it('should be created', inject([MatIconRegistry, DomSanitizer, CustomIconService], (service: CustomIconService) => {
    expect(service).toBeTruthy();
  }));
});
