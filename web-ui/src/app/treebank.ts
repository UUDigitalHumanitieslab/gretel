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
}

/**
 * Component of a treebank.
 */
export interface SubTreebank {
    databaseId: string,
    component: string,
    description?: string,
    sentenceCount: number | '?',
    wordCount: number | '?'
}

export interface TreebankMetadata {
    field: string,
    type: 'text' | 'int' | 'date',
    facet: 'checkbox' | 'slider' | 'range' | 'dropdown',
    show: boolean,
    minValue?: number | Date,
    maxValue?: number | Date
}
