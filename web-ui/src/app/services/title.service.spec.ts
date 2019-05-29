import { inject } from '@angular/core/testing';
import { TitleService } from './title.service';
import { commonTestBed } from '../common-test-bed';

describe('TitleService', () => {
    beforeEach(() => {
        const testBed = commonTestBed();
        testBed.testingModule.compileComponents();
    });

    it('should be created', inject([TitleService], (titleService: TitleService) => {
        expect(titleService.set('app', 'Test App')).toEqual('Test App');
        expect(titleService.set('title', 'Test Title')).toEqual('Test Title - Test App');
        expect(titleService.set('subtitle', 'Sub')).toEqual('Sub - Test Title - Test App');
        expect(titleService.set('title', 'Other Title')).toEqual('Other Title - Test App');
    }));
});
