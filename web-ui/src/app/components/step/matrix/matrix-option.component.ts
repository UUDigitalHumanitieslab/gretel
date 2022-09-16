import { Component, Input } from '@angular/core';
import { IconDefinition, faEquals, faNotEqual, faCheck } from '@fortawesome/free-solid-svg-icons';

import { animations } from '../../../animations';
import { FilterValue, MatrixOption } from '../../../models/matrix';


@Component({
    animations,
    selector: 'grt-matrix-option',
    templateUrl: './matrix-option.component.html',
    styleUrls: ['./matrix-option.component.scss']
})
export class MatrixOptionComponent {
    @Input()
    value: boolean | FilterValue;

    @Input()
    option: MatrixOption;

    @Input()
    dependent: boolean;

    @Input()
    disabled: boolean;

    get iconDefinition(): IconDefinition {
        if (!this.option || this.dependent) {
            return undefined;
        }

        if (this.option.type === 'default') {
            switch (this.value) {
                case 'include':
                    return faEquals;

                case 'exclude':
                    return faNotEqual;

                default:
                    return undefined;
            }
        }

        return this.value ? faCheck : undefined;
    }

    get iconColor() {
        if (!this.dependent && this.option) {
            switch (this.value) {
                case 'include':
                case true:
                    return 'is-primary';
                case undefined:
                    return 'is-warning';
                default:
                    return this.option.type == 'bool' ? '' : 'is-danger';
            }
        }

        return '';
    }

    get iconText() {
        if (!this.option) {
            return '';
        }

        const value = this.dependent ? undefined : this.value;
        switch (value) {
            case undefined:
                return 'any';

            case true:
                return 'yes';

            case false:
                return 'no';

            default:
                return value;
        }
    }

    get iconDescription() {
        if (this.dependent) {
            return undefined;
        }

        if (this.option) {
            if (this.option.type == 'bool') {
                // yes/no doesn't require explanation
                return undefined;
            }

            const value = this.dependent ? undefined : this.value;
            const label = this.option.label.toLowerCase();
            switch (value) {
                case 'include':
                case true:
                    return `require this ${label}`;
                case undefined:
                    return `any ${label} will match`;
                default:
                    return `exclude this ${label}`;
            }
        }

        return undefined;
    }
}
