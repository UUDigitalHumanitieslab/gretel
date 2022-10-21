import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SentenceCollectionComponent } from './sentence-collection.component';

describe('SentenceCollectionComponent', () => {
    let component: SentenceCollectionComponent;
    let fixture: ComponentFixture<SentenceCollectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SentenceCollectionComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SentenceCollectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should exclude sentences that do not contain the filter string', () => {
        component.sentences = [
            {id: 1, text:'first'},
            {id: 2, text:'second'},
            {id: 3, text:'third'},
        ];
        component.filterString = 'con';
        expect(component.sentences).toEqual([{id: 2, text:'second'}]);
    });
});
