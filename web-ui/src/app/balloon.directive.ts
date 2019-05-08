import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

/**
 * Directive for showing styled tooltip balloons.
*/
@Directive({
    selector: '[grtBalloon]'
})
export class BalloonDirective implements OnChanges {
    @Input('grtBalloon')
    public text: string;

    @Input('grtBalloonPosition')
    public position: 'up' | "left" | "right" | "down" | "up-left" | "up-right" | 'down-left' | 'down-right' = 'down';

    @Input('grtBalloonLength')
    public length: 'small' | 'medium' | 'large' | 'fit';

    /**
     * Show or hide the balloon, or show it on hover.
     */
    @Input('grtBalloonVisible')
    public visible: boolean | undefined;

    constructor(private el: ElementRef) {
    }

    ngOnChanges() {
        const element: HTMLElement = this.el.nativeElement;
        if (!this.text) {
            element.removeAttribute('data-balloon');
        } else {
            if (this.visible) {
                element.setAttribute('data-balloon-visible', '');
            } else {
                element.removeAttribute('data-balloon-visible');
            }

            if (this.visible === false) {
                element.removeAttribute('data-balloon');
                element.removeAttribute('data-balloon-pos');
                element.removeAttribute('data-balloon-length');
            } else {
                element.setAttribute('data-balloon', this.text);
                element.setAttribute('data-balloon-pos', this.position);
                element.setAttribute('data-balloon-length', this.length);
            }
        }
    }
}
