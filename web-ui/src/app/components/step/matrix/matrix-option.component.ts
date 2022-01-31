import { Component, Input } from '@angular/core';
import { DefaultTokenAttributes } from '../../../pages/multi-step-page/steps';

import { animations } from '../../../animations';
import { AttributeType, TokenAttributes } from '../../../services/_index';

export type Option = {
    type: 'bool' | 'default';
    label: string;
    description: string;
    value: AttributeType;
    dependent_on?: AttributeType;
    advanced: boolean;
    exclusive: boolean;
}

export const options: Option[] = [
    {
        label: 'Relation',
        description: 'The exact word form (also known as token).',
        value: 'rel',
        advanced: false,
        exclusive: false,
        type: 'default'
    },
    {
        label: 'Word',
        description: 'The exact word form (also known as token).',
        value: 'token',
        advanced: false,
        exclusive: false,
        type: 'default'
    },
    {
        label: 'Word (case-sensitive)',
        description: 'The word form must match exactly, including the casing.',
        dependent_on: 'token',
        value: 'cs',
        advanced: true,
        exclusive: false,
        type: 'bool'
    },
    {
        label: 'Lemma',
        description: `Word form that generalizes over inflected forms.
        For example: gaan is the lemma of ga, gaat, gaan, ging, gingen, and gegaan.`,
        value: 'lemma',
        advanced: false,
        exclusive: false,
        type: 'default'
    },
    {
        label: 'Word class',
        description: `Short Dutch part-of-speech tag.
        The different tags are:
        n (noun), ww (verb), adj (adjective), lid (article), vnw (pronoun),
        vg (conjunction), bw (adverb), tw (numeral), vz (preposition),
        tsw (interjection), spec (special token), and let (punctuation).`,
        value: 'pos',
        advanced: false,
        exclusive: false,
        type: 'default'
    },
    {
        label: 'Detailed word class',
        description: 'Long part-of-speech tag. For example: N(soort,mv,basis), WW(pv,tgw,ev), VNW(pers,pron,nomin,vol,2v,ev).',
        value: 'postag',
        advanced: true,
        exclusive: false,
        type: 'default'
    },
    {
        label: 'Optional',
        description: `The word will be ignored in the search instruction.
        It may be included in the results, but it is not required that it is present.`,
        value: 'na',
        advanced: false,
        exclusive: true,
        type: 'bool'
    }];

@Component({
    animations,
    selector: 'grt-matrix-option',
    templateUrl: './matrix-option.component.html',
    styleUrls: ['./matrix-option.component.scss']
})
export class MatrixOptionComponent {
    @Input()
    attributes: TokenAttributes;

    @Input()
    option: Option;

    get iconClass() {
        if (!this.option || !this.attributes) {
            return '';
        }

        if (this.option.type === 'default') {
            switch (this.attributes[this.option.value]) {
                case 'include':
                    return 'fa-equals';

                case 'exclude':
                    return 'fa-not-equal';

                default:
                    return '';
            }
        }

        return this.attributes[this.option.value] ?
            'fa-check' : '';
    }

    get iconColor() {
        if (this.option && this.attributes) {
            const key = this.option.value;
            const value = this.attributes[key];
            if (value !== DefaultTokenAttributes[key]) {
                switch (value) {
                    case 'include':
                    case true:
                        return 'is-primary';
                    case undefined:
                        return 'is-warning';
                    default:
                        return 'is-danger';
                }
            }
        }

        return 'is-light';
    }

    get iconText() {
        if (!this.option || !this.attributes) {
            return '';
        }

        const value = this.attributes[this.option.value];
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
}
