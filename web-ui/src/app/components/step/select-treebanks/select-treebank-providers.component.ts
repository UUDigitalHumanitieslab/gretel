import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';

import { animations } from '../../../animations';
import { comparatorGenerator, OnTypedChanges, TypedChanges } from '../../util';

export type UserProvider = {
    id: number,
    name: string,
    color: string
};

@Component({
    animations,
    selector: 'grt-select-treebank-providers',
    templateUrl: './select-treebank-providers.component.html',
    styleUrls: ['./select-treebank-providers.component.scss']
})
export class SelectTreebankProvidersComponent implements OnTypedChanges<SelectTreebankProvidersComponent> {
    /**
     * Show the dropdown menu
     */
    active = false;

    allUsersSelected = true;

    usersSelection: { [id: number]: boolean };

    selectionText: string;

    @Input()
    preConfigured: boolean;

    @Input()
    users: UserProvider[];

    @Input()
    selectedUserIds: number[];

    @Output()
    preConfiguredChange = new EventEmitter<boolean>(false);

    @Output()
    selectedUserIdsChange = new EventEmitter<number[]>();

    /**
     * Show the user tags if the user selection changed,
     * triggered only one time, at most
     */
    @Output()
    showUserTags = new EventEmitter();

    private showUserTagsTriggered = false;

    constructor(private eRef: ElementRef) { }

    ngOnChanges(changes: TypedChanges<SelectTreebankProvidersComponent>): void {
        this.checkUserSelections(false, false);
    }

    @HostListener('document:click', ['$event'])
    clickOutside(event: Event) {
        if (this.active && !this.eRef.nativeElement.contains(event.target)) {
            this.active = false;
        }
    }

    checkUserSelections(toggleAll = false, emit = true) {
        let allUsersSelected = true;
        let updatedSelections: SelectTreebankProvidersComponent['usersSelection'] = {};
        let forAll = toggleAll ? this.allUsersSelected : undefined;
        let selectedUserIds: number[] = [];

        for (let user of this.users) {
            const updatedSelection = forAll ?? this.usersSelection[user.id] ?? true;
            updatedSelections[user.id] = updatedSelection;
            if (!updatedSelection) {
                allUsersSelected = false;
            } else {
                selectedUserIds.push(user.id);
            }
        }

        this.allUsersSelected = allUsersSelected;
        this.usersSelection = updatedSelections;

        if (emit) {
            this.selectedUserIdsChange.emit(selectedUserIds);

            if (!this.showUserTagsTriggered) {
                if (!this.allUsersSelected && selectedUserIds.length) {
                    this.showUserTagsTriggered = true;
                    this.showUserTags.next();
                }
            }
        }

        this.updateSelectionText();
    }

    updateSelectionText() {
        const usersText = () => {
            const userNames: string[] = [];
            for (let user of this.users.sort((a, b) => comparatorGenerator(a, b, value => value.name))) {
                console.log(user);
                console.log(this.selectedUserIds);
                if (this.selectedUserIds.indexOf(user.id) >= 0) {
                    userNames.push(user.name);
                }
            }

            switch (userNames.length) {
                case 0:
                    return 'no users';
                case 1:
                    return userNames[0];
                default:
                    return userNames.slice(0, -1).join(', ') + ` and ${userNames.slice(-1)}`;
            }
        };

        if (this.preConfigured && this.allUsersSelected) {
            this.selectionText = 'All treebanks';
        } else if (this.preConfigured) {
            if (this.selectedUserIds.length) {
                this.selectionText = `Configured treebanks and ${usersText()}`;
            } else {
                this.selectionText = 'Pre-configured treebanks';
            }
        } else if (!this.preConfigured) {
            if (this.allUsersSelected) {
                this.selectionText = 'User uploaded treebanks';
            } else if (this.selectedUserIds.length) {
                this.selectionText = usersText();
            } else {
                this.selectionText = 'Only selected treebanks';
            }
        }
    }
}
