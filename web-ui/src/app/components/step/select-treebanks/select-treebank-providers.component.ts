import { Component, Input, Output, EventEmitter, HostListener, ElementRef, OnChanges, OnDestroy } from '@angular/core';
import { User, UserService } from '../../../services/user.service';

import { animations } from '../../../animations';
import { comparatorGenerator } from '../../util';
import { Subscription } from 'rxjs';

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
export class SelectTreebankProvidersComponent implements OnChanges, OnDestroy {
    /**
     * Show the dropdown menu
     */
    active = false;

    allUsersSelected = true;

    onlyMine = false;

    showOnlyMine = false;

    usersSelection: { [id: number]: boolean } = {};

    selectionText: string;

    user: User;

    subscriptions: Subscription[];

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

    constructor(private elementRef: ElementRef, private userService: UserService) {
        this.subscriptions = [this.userService.user$.subscribe(user => {
            this.user = user;
            this.checkShowOnlyMine();
        })];
    }

    ngOnChanges(): void {
        this.checkUserSelections();
        this.checkShowOnlyMine();
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    @HostListener('document:click', ['$event'])
    clickOutside(event: Event) {
        if (this.active && !this.elementRef.nativeElement.contains(event.target)) {
            this.active = false;
        }
    }

    togglePreConfigured(set: boolean = undefined) {
        if (set == undefined || set !== this.preConfigured) {
            this.preConfiguredChange.emit(set == undefined ? !this.preConfigured : set);
        }
    }

    toggleOnlyMine() {
        if (this.onlyMine) {
            this.onlyMine = false;
            this.togglePreConfigured(true);
            this.selectedUserIdsChange.emit(this.users.map(user => user.id));
        } else {
            this.onlyMine = true;
            this.togglePreConfigured(false);
            this.selectedUserIdsChange.emit([this.user.id]);
        }
    }

    checkShowOnlyMine() {
        this.showOnlyMine = this.users && this.user && !!this.users.find(user => user.id === this.user.id);
    }

    checkUserSelections() {
        let allUsersSelected = true;
        let updatedSelections: SelectTreebankProvidersComponent['usersSelection'] = {};

        for (let user of this.users) {
            let selected = !!this.selectedUserIds.find(selected => selected == user.id);
            if (!selected) {
                allUsersSelected = false;
            }
            updatedSelections[user.id] = selected;
        }

        this.allUsersSelected = allUsersSelected;
        this.usersSelection = updatedSelections;

        this.updateSelectionStatus();
    }

    toggleUserSelections(toggleAll = false) {
        let allUsersSelected = true;
        let updatedSelections: SelectTreebankProvidersComponent['usersSelection'] = {};
        let selectedUserIds: number[] = [];

        for (let user of this.users) {
            const updatedSelection = toggleAll ? this.allUsersSelected : this.usersSelection[user.id];
            updatedSelections[user.id] = updatedSelection;
            if (!updatedSelection) {
                allUsersSelected = false;
            } else {
                selectedUserIds.push(user.id);
            }
        }

        this.allUsersSelected = allUsersSelected;
        this.usersSelection = updatedSelections;

        this.selectedUserIdsChange.emit(selectedUserIds);

        if (!this.showUserTagsTriggered) {
            if (!this.allUsersSelected && selectedUserIds.length) {
                this.showUserTagsTriggered = true;
                this.showUserTags.next();
            }
        }
    }

    updateSelectionStatus() {
        this.updateOnlyMine();
        this.updateSelectionText();
    }

    /**
     * Check whether only the user's treebanks are selected to be shown
     */
    updateOnlyMine() {
        if (this.preConfigured) {
            this.onlyMine = false;
            return;
        }

        this.onlyMine = this.user &&
            this.selectedUserIds.length === 1 &&
            this.selectedUserIds[0] == this.user.id;
    }

    updateSelectionText() {
        const usersText: () => [boolean, string] = () => {
            const userNames: string[] = [];
            for (let user of this.users.sort((a, b) => comparatorGenerator(a, b, value => value.name))) {
                if (this.selectedUserIds.indexOf(user.id) >= 0) {
                    userNames.push(user.name);
                }
            }

            switch (userNames.length) {
                case 0:
                    return [false, 'no users'];
                case 1:
                    return [false, userNames[0]];
                case 2:
                case 3:
                    return [true, userNames.slice(0, -1).join(', ') + ` and ${userNames.slice(-1)}`];
                default:
                    return [false, `${userNames.length} users`];
            }
        };

        if (this.onlyMine) {
            this.selectionText = 'Only mine';
        } else if (this.preConfigured && this.allUsersSelected) {
            this.selectionText = 'All treebanks';
        } else if (this.preConfigured) {
            if (this.selectedUserIds.length) {
                let [conjunction, description] = usersText();
                this.selectionText = `Pre-configured${(conjunction ? ', ' : ' and ') + description}`;
            } else {
                this.selectionText = 'Pre-configured';
            }
        } else if (!this.preConfigured) {
            if (this.allUsersSelected) {
                this.selectionText = 'User uploaded';
            } else if (this.selectedUserIds.length) {
                this.selectionText = usersText()[1];
            } else {
                this.selectionText = 'Only selected';
            }
        }
    }
}
