import { TestBed } from '@angular/core/testing';

import { NgSignalUtilsService } from './ng-signal-utils.service';

describe('NgSignalUtilsService', () => {
  let service: NgSignalUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgSignalUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
