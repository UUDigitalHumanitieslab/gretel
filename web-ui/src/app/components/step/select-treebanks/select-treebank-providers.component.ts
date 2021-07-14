import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';

import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { animations } from '../../../animations';
import { GlobalStateExampleBased, StepType } from '../../../pages/multi-step-page/steps';
import { Treebank, TreebankSelection } from '../../../treebank';
import { StateService, TreebankService, TreebankSelectionService } from '../../../services/_index';
import { StepDirective } from '../step.directive';

export type UserProvider = { id: number, name: string, color: string };

@Component({
    animations,
    selector: 'grt-select-treebank-providers',
    templateUrl: './select-treebank-providers.component.html',
    styleUrls: ['./select-treebank-providers.component.scss']
})
export class SelectTreebankProvidersComponent {
    /**
     * Show the dropdown menu
     */
    active = false;

    @Input()
    preConfigured: boolean;

    @Input()
    users: UserProvider[];

    @Output()
    preConfiguredChange = new EventEmitter<boolean>(false);

    @Output()
    usersSelected = new EventEmitter<number[]>();

    constructor(private eRef: ElementRef) { }
    
    @HostListener('document:click', ['$event'])
    clickOutside(event: Event) {
        if (this.active && !this.eRef.nativeElement.contains(event.target)) {
            this.active = false;
        }
    }
}