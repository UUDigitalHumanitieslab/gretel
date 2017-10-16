export type Highlighter = {
    new(): Highlighter,
    $rules: { [state: string]: HighlightState[] },
    getRules(): { [state: string]: HighlightState[] }
}

export type HighlightState = {
    token?: string | string[] | ((value: string) => string),
    regex: string | RegExp,
    next?:  string,
    nextState?:  string,
    onMatch?:  ((val: string, state: string, stack: string[]) => string)
} | {
    defaultToken: string
}
