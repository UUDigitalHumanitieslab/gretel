export class FuzzyNumber {
    public value = 0;
    public unknown = false;
    constructor(value: number | '?') {
        if (value === '?') {
            this.unknown = true;
        } else {
            this.value = value;
        }
    }

    /**
     * Adds a value to this number and modifies this instance.
     * @param value
     */
    public add(value: number | '?') {
        if (value == '?') {
            this.unknown = true;
        } else {
            this.value += value;
        }
    }

    public toString() {
        if (this.unknown) {
            if (this.value === 0) {
                return '?';
            } else {
                return '≥ ' + this.value.toString();
            }
        } else {
            return this.value.toString();
        }
    }

    public toLocaleString() {
        if (this.unknown) {
            if (this.value === 0) {
                return '?';
            } else {
                return '≥ ' + this.value.toLocaleString();
            }
        } else {
            return this.value.toLocaleString();
        }
    }
}

export interface Treebank {
    /** The backend this corpus resides in */
    provider: string;
    /** Id of this treebank */
    id: string;
    /**
     * The user-friendly title to use, uploaded treebanks have the same
     * value here as the treebank's name.
     */
    displayName: string;
    description?: string;
    /** Can the user search in multiple components simultaneously for this treebank */
    multiOption: boolean;
    /** Might be false for user-uploaded corpora */
    isPublic: boolean;

    // The following options only exist for user-uploaded treebanks
    userId?: number;
    email?: string;
    /** When this has been uploaded */
    uploaded?: Date;
    processed?: Date;

    /* Is this treebank selected for searching, this is a bit of clientside state */
    selected: boolean;
}

export interface ComponentGroup {
    key: string;
    components: { [variant: string]: string };
    description?: string;
    sentenceCount: FuzzyNumber;
    wordCount: FuzzyNumber;
}

/**
 * Component of a treebank.
 */
export interface TreebankComponent {
    /** Serverside id  */
    id: string;
    /** Friendly name */
    title: string;
    sentenceCount: number | '?';
    wordCount: number | '?';
    selected: boolean;
    description: string;
    disabled: boolean;

    /** The ComponentGroup */
    group?: string;
    /** The Variant */
    variant?: string;
}

export interface TreebankMetadata {
    field: string;
    type: 'text' | 'int' | 'date';
    facet: 'checkbox' | 'slider' | 'range' | 'dropdown';
    show: boolean;
    minValue?: number | Date;
    maxValue?: number | Date;
}
