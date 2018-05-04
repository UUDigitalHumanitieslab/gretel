export interface Treebank {
    id: number;
    title: string;
    userId?: number;
    email?: string;
    uploaded?: Date;
    processed?: Date;
    isPublic?: boolean;
}

// Do not know a proper name: any suggestions?
export interface TreebankInfo {
    databaseId: string,
    component: string,
    sentenceCount: number,
    wordCount: number
}
