import { Component } from '@angular/core';

@Component({
    selector: 'grt-node-properties-button',
    templateUrl: './node-properties-button.component.html',
    styleUrls: ['./node-properties-button.component.scss']
})
export class NodePropertiesButtonComponent {
    visible = false;

    constructor() {
    }

    toggle() {
        this.visible = !this.visible;
    }
}
