export class FuzzyNumber {
    public value = 0;
    public unknown = false;
    constructor(value: number | '?') {
        if (value == '?') {
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
            if (this.value == 0) {
                return '?'
            } else {
                return '≥ ' + this.value;
            }
        } else {
            return this.value.toString();
        }
    }
}

export interface Treebank {
    id?: number;
    name: string;
    /**
     * The user-friendly title to use, uploaded treebanks have the same
     * value here as the treebank's name.
     */
    title?: string;
    description?: string;
    userId?: number;
    email?: string;
    /**
     * When this has been uploaded, or false if this treebank is
     * specified in the configuration.
     */
    uploaded?: Date | false;
    processed?: Date;
    isPublic?: boolean;
    /** The backend this corpus resides in */
    provider: string;
    /* Is this treebank selected for searching */
    selected: boolean;
}

export interface ComponentGroup {
    key: string,
    components: { [variant: string]: TreebankComponent },
    description?: string,
    sentenceCount: FuzzyNumber,
    wordCount: FuzzyNumber
}

/**
 * Component of a treebank.
 */
export interface SubTreebank {
	/** The componentGroup */
    group: string,
    variant: string,
    id: string,
    /** Pass to the server as part of the "components" parameter */
    server_id: string,
    title: string,
    sentenceCount: number | '?',
    wordCount: number | '?'
    selected: boolean;
}

export interface TreebankMetadata {
    field: string,
    type: 'text' | 'int' | 'date',
    facet: 'checkbox' | 'slider' | 'range' | 'dropdown',
    show: boolean,
    minValue?: number | Date,
    maxValue?: number | Date
}
