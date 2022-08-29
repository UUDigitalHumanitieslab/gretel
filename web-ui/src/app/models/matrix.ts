type FilterKey = 'rel' | 'word' | 'lemma' | 'pos' | 'postag';
type BoolKey = 'cs' | 'na';

export type MatrixOptionKey = FilterKey | BoolKey;
export type FilterValue = 'include' | 'exclude' | undefined;

type MatrixOptionInfo = {
    key: MatrixOptionKey
    label: string;
    description: string;
    dependent_on?: MatrixOptionKey;
    advanced: boolean;
    exclusive: boolean;
}

type MatrixFilterOption = {
    type: 'default';
    default: FilterValue
} & MatrixOptionInfo;


type MatrixBoolOption = {
    type: 'bool'
    default: boolean;
} & MatrixOptionInfo;

export type MatrixOption = {
} & (MatrixFilterOption | MatrixBoolOption);

type Keyless<T> = {
    [Property in keyof T as Exclude<Property, "key">]: T[Property]
};

export const optionsLookup: Record<FilterKey, Keyless<MatrixFilterOption>> &
    Record<BoolKey, Keyless<MatrixBoolOption>> = {
    'rel':
    {
        label: 'Relation',
        description: 'The exact word form (also known as token).',
        advanced: false,
        exclusive: false,
        type: 'default',
        default: 'include'
    },
    'word': {
        label: 'Word',
        description: 'The exact word form (also known as token).',
        advanced: false,
        exclusive: false,
        type: 'default',
        default: 'include'
    },
    'cs': {
        label: 'Word (case-sensitive)',
        description: 'The word form must match exactly, including the casing.',
        dependent_on: 'word',
        advanced: true,
        exclusive: false,
        type: 'bool',
        default: false
    },
    'lemma': {
        label: 'Lemma',
        description: `Word form that generalizes over inflected forms.
        For example: gaan is the lemma of ga, gaat, gaan, ging, gingen, and gegaan.`,
        advanced: false,
        exclusive: false,
        type: 'default',
        default: undefined
    },
    'pos': {
        label: 'Word class',
        description: `Short Dutch part-of-speech tag.
        The different tags are:
        n (noun), ww (verb), adj (adjective), lid (article), vnw (pronoun),
        vg (conjunction), bw (adverb), tw (numeral), vz (preposition),
        tsw (interjection), spec (special token), and let (punctuation).`,
        advanced: false,
        exclusive: false,
        type: 'default',
        default: 'include'
    },
    'postag': {
        label: 'Detailed word class',
        description: 'Long part-of-speech tag. For example: N(soort,mv,basis), WW(pv,tgw,ev), VNW(pers,pron,nomin,vol,2v,ev).',
        advanced: true,
        exclusive: false,
        type: 'default',
        default: undefined
    },
    'na': {
        label: 'Optional',
        description: `The word will be ignored in the search instruction.
        It may be included in the results, but it is not required that it is present.`,
        advanced: false,
        exclusive: true,
        type: 'bool',
        default: false
    }
};

export type TokenAttributes = Record<FilterKey, FilterValue> & Record<BoolKey, boolean>;
export type TokenDependents = Record<MatrixOptionKey, boolean>;

export const matrixOptions: MatrixOption[] = Object.entries(optionsLookup).map(([key, value]) => ({
    key: <MatrixOptionKey>key,
    ...value
}));
export const DefaultTokenAttributes: TokenAttributes = Object.assign(
    {},
    ...matrixOptions.map(option => ({ [option.key]: option.default })));

export class Matrix {
    static default(length: number) {
        return new Matrix(
            Array(length).fill(undefined).map(() => ({
                ...DefaultTokenAttributes
            })));
    }

    private constructor(public attributes: TokenAttributes[]) {
    }

    /**
     * If the passed option has dependencies, make sure those are set
     */
    private setDependents(
        tokenIndex: number,
        key: MatrixOptionKey,
        sourceKey: MatrixOptionKey): void {
        const option = optionsLookup[key];
        if (option.dependent_on) {
            let dependency = optionsLookup[option.dependent_on];

            switch (this.attributes[tokenIndex][option.dependent_on]) {
                case undefined:
                case false:
                    this.set(
                        tokenIndex,
                        option.dependent_on,
                        dependency.type === 'default' ? 'include' : true,
                        sourceKey);
                    break;
            }
        }
    }

    /**
     * If this option is exclusive: unset everything else
     */
    private setExclusive(
        tokenIndex: number,
        key: MatrixOptionKey,
        sourceKey: MatrixOptionKey): void {
        if (!optionsLookup[key].exclusive) {
            // this option is not exclusive
            return;
        }

        // unset all the other options
        for (let option of matrixOptions) {
            if (option.key !== key) {
                this.set(
                    tokenIndex,
                    option.key,
                    option.type === 'default' ? undefined : false,
                    sourceKey);
            }
        }
    }

    /**
     * If the set option is exclusive:
     * reset everything else to default values
     */
    private unsetExclusive(
        tokenIndex: number,
        key: MatrixOptionKey,
        sourceKey: MatrixOptionKey): void {
        if (!optionsLookup[key].exclusive || key !== sourceKey) {
            // this option is not exclusive
            return;
        }

        // reset all the other options to their defaults
        for (let option of matrixOptions) {
            if (option.key !== key) {
                this.set(
                    tokenIndex,
                    option.key,
                    DefaultTokenAttributes[option.key],
                    sourceKey);
            }
        }

        return;
    }

    /**
     * If another option is exclusive, unset that
     */
    private unsetOtherExclusive(
        tokenIndex: number,
        key: MatrixOptionKey,
        sourceKey: MatrixOptionKey): void {
        for (let option of matrixOptions) {
            if (option.key !== key && option.exclusive) {
                this.set(
                    tokenIndex,
                    option.key,
                    option.type === 'default' ? undefined : false,
                    sourceKey);
            }
        }
    }
    /**
     * If nothing else is set, then 'not applicable' should be set
     */
    private autoNa(
        tokenIndex: number,
        key: MatrixOptionKey,
        sourceKey: MatrixOptionKey): void {
        if (key !== sourceKey || key === 'na') {
            // check once after all other changes are applied
            return;
        }

        for (let option of matrixOptions) {
            if (option.key !== key && option.key !== 'na') {
                switch (this.attributes[tokenIndex][option.key]) {
                    case 'include':
                    case 'exclude':
                    case true:
                        // another option has been set!
                        return;
                }
            }
        }

        this.set(
            tokenIndex,
            'na',
            true,
            sourceKey);
    }

    /**
     * If this option is unset and another option dependent, unset that
     */
    private unsetDependent(
        tokenIndex: number,
        key: MatrixOptionKey,
        sourceKey: MatrixOptionKey): void {
        for (let option of matrixOptions) {
            if (option.dependent_on === key) {
                this.set(
                    tokenIndex,
                    option.key,
                    option.type === 'default' ? undefined : false,
                    sourceKey);
            }
        }

        return;
    }

    info(): {
        advanced: boolean,
        dependents: TokenDependents[]
    } {
        let advanced = false;
        let dependents = this.attributes.map((attributes) => {
            const result = {
                rel: false,
                word: false,
                lemma: false,
                pos: false,
                cs: false,
                postag: false,
                na: false
            };
            let exclusive: MatrixOptionKey;
            for (let option of matrixOptions) {
                if (option.dependent_on) {
                    switch (attributes[option.dependent_on]) {
                        case undefined:
                        case false:
                            result[option.key] = true;
                            break;
                    }
                }

                if (option.exclusive) {
                    switch (attributes[option.key]) {
                        case 'include':
                        case 'exclude':
                        case true:
                            exclusive = option.key;
                            break;
                    }
                }

                advanced ||= option.advanced && attributes[option.key] !== DefaultTokenAttributes[option.key];
            }

            if (exclusive) {
                for (let option of matrixOptions) {
                    if (option.key !== exclusive) {
                        result[option.key] = true;
                    }
                }
            }

            return result;
        });

        return {
            advanced,
            dependents
        };
    }

    setMultiple(attributes: TokenAttributes[]): boolean {
        let changed = false;
        for (let tokenIndex = 0; tokenIndex < attributes.length; tokenIndex++) {
            for (let [key, value] of Object.entries(attributes[tokenIndex])) {
                changed = this.set(tokenIndex, key as MatrixOptionKey, value) || changed;
            }
        }
        return changed;
    }

    set<T extends MatrixOptionKey>(tokenIndex: number, key: T, value: TokenAttributes[T], sourceKey: T = undefined): boolean {
        if (sourceKey === undefined) {
            sourceKey = key;
        }

        if (this.attributes[tokenIndex][key] === value) {
            return false;
        } else {
            this.attributes[tokenIndex][key] = value;
            if (value === true || value === 'include' || value === 'exclude') {
                this.setDependents(tokenIndex, key, sourceKey);
                this.setExclusive(tokenIndex, key, sourceKey);
                this.unsetOtherExclusive(tokenIndex, key, sourceKey);
            } else {
                this.unsetDependent(tokenIndex, key, sourceKey);
                this.unsetExclusive(tokenIndex, key, sourceKey);
                this.autoNa(tokenIndex, key, sourceKey);
            }

            return true;
        }
    }

    rotate<T extends MatrixOptionKey>(tokenIndex: number, key: T): TokenAttributes[T] {
        const mod = (optionValues: any[]): TokenAttributes[T] => {
            const current = this.attributes[tokenIndex][key];

            const index = optionValues.indexOf(current) + 1;
            return optionValues[index % optionValues.length];
        }

        let updated: TokenAttributes[T];

        switch (key) {
            case 'cs':
            case 'na':
                updated = mod([true, false]);
                break;

            case 'lemma':
            case 'pos':
            case 'postag':
            case 'rel':
            case 'word':
                updated = mod(['include', 'exclude', undefined]);
                break;
        }

        this.set(tokenIndex, key, updated);

        return updated;
    }

    /**
     * Rotate all the values in this row. If they differ, the first one
     * is used to set the rest.
     */
    rotateRow<T extends MatrixOptionKey>(key: T): void {
        const value = this.rotate(0, key);
        for (let tokenIndex = 1; tokenIndex < this.attributes.length; tokenIndex++) {
            this.set(tokenIndex, key, value);
        }
    }
}
