import { ElementRef, Directive, AfterContentChecked, OnDestroy } from '@angular/core';
import { TitleService } from './services/_index';

@Directive({
    selector: '[grtSubtitle]'
})
export class SubtitleDirective implements AfterContentChecked, OnDestroy {
    constructor(private element: ElementRef<HTMLHeadingElement>, private titleService: TitleService) {
    }

    ngAfterContentChecked(): void {
        this.titleService.set(
            'subtitle',
            this.element.nativeElement.textContent.trim());
    }

    ngOnDestroy(): void {
        this.titleService.set('subtitle', undefined);
    }
}
