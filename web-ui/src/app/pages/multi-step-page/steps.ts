import { AlpinoService, FilterValues } from '../../services/_index';

/**
 * Contains all the steps that are used in the xpath search
 */


/**
 * Info that needs to be in a treebank selection
 */
interface TreebankSelection {
    corpus: string;
    components: string[];
}

/**
 * All the information the xpath-search component should keep track of
 */
interface GlobalState {
    currentStep: Step<this>;
    /**
     * Include context in results (the preceding and following sentence)
     */
    retrieveContext: boolean;
    selectedTreebanks: TreebankSelection;
    xpath: string;
    filterValues: FilterValues;
    valid: boolean;
    // Question: should this even be in this state?
    loading: boolean;
    inputSentence?: string;
}

interface GlobalStateExampleBased extends GlobalState {
    isCustomXPath: boolean;
    exampleXml: string;
    subTreeXml: string;
    tokens: string[];
    attributes: string[];
    /**
     * Ignores properties of the dominating node
     */
    ignoreTopNode: boolean;
    /**
     * Respect word order
     */
    respectOrder: boolean;
}

/**
 * A step has a number and a function that performs the necessary actions when entering a step
 */
abstract class Step<T> {
    constructor(public number: number) {
    }

    // Makes sure the step is entered correctly
    abstract enterStep(state: T): Promise<T>;
    abstract leaveStep(state: T): T;
}

class SentenceInputStep<T extends GlobalState> extends Step<T> {
    async enterStep(state: T) {
        state.currentStep = this;
        state.valid = state.inputSentence && state.inputSentence.length > 0;
        return state;
    }

    leaveStep(state: T) {
        return state;
    }
}

class MatrixStep extends Step<GlobalStateExampleBased> {
    constructor(number: number, private alpinoService: AlpinoService) {
        super(number);
    }

    async enterStep(state: GlobalStateExampleBased) {
        state.currentStep = this;
        state.tokens = this.alpinoService.tokenize(state.inputSentence).split(' ');
        state.attributes = state.tokens.map(() => 'pos'); // default value
        return this.updateMatrix(state);
    }

    leaveStep(state: GlobalStateExampleBased) {
        return state;
    }

    async updateMatrix(state: GlobalStateExampleBased) {
        state.loading = true;
        if (!state.isCustomXPath) {
            const generated = await this.alpinoService.generateXPath(
                state.exampleXml,
                state.tokens,
                state.attributes,
                state.ignoreTopNode,
                state.respectOrder);
            state.subTreeXml = generated.subTree;
            state.xpath = generated.xpath;
            state.valid = true;
        }
        // TODO: validate custom XPATH!
        state.loading = false;
        return state;
    }
}

class ParseStep extends Step<GlobalStateExampleBased> {
    constructor(number: number, private alpinoService: AlpinoService) {
        super(number);
    }

    async enterStep(state: GlobalStateExampleBased) {
        state.loading = true;
        state.currentStep = this;

        const xml = await this.alpinoService.parseSentence(state.inputSentence);
        state.exampleXml = xml;
        state.loading = false;
        state.valid = true;
        return state;
    }

    leaveStep(state: GlobalStateExampleBased) {
        return state;
    }
}

class XpathInputStep<T extends GlobalState> extends Step<T> {
    constructor(number: number) {
        super(number);
    }

    async enterStep(state: T) {
        state.currentStep = this;
        state.valid = true;
        return state;
    }

    leaveStep(state: T) {
        return state;
    }
}

class AnalysisStep<T extends GlobalState> extends Step<T> {
    constructor(number: number) {
        super(number);
    }

    /**
     * Gets the results before going the next state.
     * @param state
     * @returns
     */
    async enterStep(state: T) {
        state.currentStep = this;
        return state;
    }

    /**
     * Makes sure the stream is ended
     * @param state
     * @returns {GlobalState}
     */
    leaveStep(state: T): T {
        state.loading = false;
        return state;
    }
}

class ResultStep<T extends GlobalState> extends Step<T> {
    constructor(number: number) {
        super(number);
    }

    /**
     * Gets the results before going the next state.
     * @param state
     * @returns
     */
    async enterStep(state: T) {
        state.currentStep = this;
        state.valid = true;
        return state;
    }

    /**
     * Makes sure the stream is ended
     * @param state
     * @returns {T}
     */
    leaveStep(state: T): T {
        state.loading = false;
        return state;
    }
}

class SelectTreebankStep<T extends GlobalState> extends Step<T> {
    constructor(public number: number) {
        super(number);
    }

    /**
     * Must first do a pre treebank step
     * @param state
     * @returns the updates state
     */
    async enterStep(state: T) {
        state.currentStep = this;
        state.selectedTreebanks = {
            corpus: state.selectedTreebanks ? state.selectedTreebanks.corpus : undefined,
            components: state.selectedTreebanks ? state.selectedTreebanks.components : undefined
        };
        state.valid = state.selectedTreebanks.corpus !== undefined &&
            state.selectedTreebanks.components !== undefined &&
            state.selectedTreebanks.components.length > 0;

        return state;
    }

    leaveStep(state: T) {
        return state;
    }
}

export {
    TreebankSelection,
    GlobalState,
    GlobalStateExampleBased,
    Step,
    AnalysisStep,
    XpathInputStep,
    SelectTreebankStep,
    ResultStep,
    SentenceInputStep,
    ParseStep,
    MatrixStep
};
