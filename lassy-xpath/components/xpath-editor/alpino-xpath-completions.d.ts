export declare type FunctionCompletion = {
    meta: string;
    hasArguments: boolean;
};
export declare let functionCompletions: {
    [name: string]: FunctionCompletion;
};
export declare let pathCompletions: {
    value: string;
    meta: string;
    score: number;
}[];
