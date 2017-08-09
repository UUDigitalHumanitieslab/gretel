// https://github.com/nicolaskruchten/pivottable/issues/281
// PivotTable Typescript definition file

interface PivotOptions {
    /**
     * array of attribute names to use as rows, defaults to []
     */
    rows?: string[];

    /**
     * array of attribute names for use as columns, defaults to []
     */
    cols?: string[];

    /**
     * constructor for an object which will aggregate results per cell, defaults to count()
     */
    aggregator?: any;

    /**
     * function to generate output from pivot data structure (defaults to simple table)
     */
    renderer?: any;

    /**
     * object to define derived attributes, defaults to {}
     */
    derivedAttributes?: any;

    /**
     * function called on each record, returns false if the record is to be excluded from the input before rendering or true otherwise, (defaults to returning true for all records)
     */
    filter?: any;

    /**
     * object passed through to renderer as options
     */
    rendererOptions?: any;

    /**
     * locale-specific strings for error messages
     */
    localeStrings?: any;
}

declare type PivotAggregator<T> = (data: any, rowKey: any, colKey: any) => {
    push: (record) => void,
    value: () => T,
    format: (x: T) => string
}

interface PivotUiOptions {
    /**
     * dictionary of rendering functions, defaulting with various table renderers 
     */
    renderers?: any;

    /**
     * dictionary of generators for aggregation functions in dropdown, defaulting to common aggregators
     */
    aggregators?: { [name: string]: PivotAggregator<any> };

    /**
     * array of strings, attribute names to prepopulate in row area, default is []
     */
    rows?: string[];

    /**
     * array of strings, attribute names to prepopulate in cols area, default is []
     */
    cols?: string[];

    /**
     * array of strings, attribute names to prepopulate in vals area, default is []
     */
    vals?: string[];

    /**
     * string, aggregator to prepopulate in dropdown (key to aggregators object), default is first key in aggregators
     */
    aggregatorName?: string;

    renderer: any,

    /**
     * string, renderer to prepopulate in radio button (key to renderers object), default is first key in renderers
     */
    rendererName?: string;

    /**
     * object, defines derived attributes, default is {}
     */
    derivedAttributes?: any;

    /**
     * function called on each record, returns false if the record is to be excluded from the input before rendering or true otherwise, (defaults to returning true for all records)
     */
    filter?: any;

    /**
     * object, defaults to {}, keys are attribute names and values are arrays of attribute values which denote records to exclude from rendering (used to prepopulate the filter menus that appear on double-click)
     */
    exclusions?: any;

    /**
    * array of strings, defaults to [], contains attribute names to omit from the UI
    */
    hiddenAttributes?: string[];

    /**
     * integer, defaults to 50, maximum number of values to list in the double-click menu
     */
    menuLimit?: number;

    /**
     * object, defaults to null, passed through to renderer as options
     */
    rendererOptions?: any;

    /**
     * function, called upon renderer refresh with an object representing the current UI settings
     */
    onRefresh?: (options: PivotUiOptions) => void;

    /**
     * object, defaults to English strings - locale-specific strings for UI display
     */
    localeStrings?: any;

    /**
     * boolean, defaults to false, controls whether or not unused attributes are kept sorted in the UI
     */
    autoSortUnusedAttrs?: boolean;

    /**
     * boolean, defaults to false, controls whether or not unused attributes are shown vertically instead of the default which is horizontally
     */
    unusedAttrsVertical?: boolean;

}

interface PivotUtilities {
    aggregatorTemplates: {
        average: PivotAggregator<any>,
        count: PivotAggregator<any>,
        countUnique: PivotAggregator<any>,
        extremes: PivotAggregator<any>,
        first: PivotAggregator<any>,
        fractionOf: PivotAggregator<any>,
        last: PivotAggregator<any>,
        listUnique: PivotAggregator<any>,
        max: PivotAggregator<any>,
        median: PivotAggregator<any>,
        min: PivotAggregator<any>,
        quantile: PivotAggregator<any>,
        runningStat: PivotAggregator<any>,
        stdev: PivotAggregator<any>,
        sum: PivotAggregator<any>,
        sumOverSum: PivotAggregator<any>,
        sumOverSumBound80: PivotAggregator<any>,
        uniques: PivotAggregator<any>,
        'var': PivotAggregator<any>
    }
    aggregators: {
        '80% Lower Bound': PivotAggregator<any>,
        '80% Upper Bound': PivotAggregator<any>,
        'Average': PivotAggregator<any>,
        'Count': PivotAggregator<any>,
        'Count Unique Values': PivotAggregator<any>,
        'Count as Fraction of Columns': PivotAggregator<any>,
        'Count as Fraction of Rows': PivotAggregator<any>,
        'Count as Fraction of Total': PivotAggregator<any>,
        'First': PivotAggregator<any>,
        'Integer Sum': PivotAggregator<any>,
        'Last': PivotAggregator<any>,
        'List Unique Values': PivotAggregator<any>,
        'Maximum': PivotAggregator<any>,
        'Median': PivotAggregator<any>,
        'Minimum': PivotAggregator<any>,
        'Sample Standard Deviation': PivotAggregator<any>,
        'Sample Variance': PivotAggregator<any>,
        'Sum': PivotAggregator<any>,
        'Sum as Fraction of Columns': PivotAggregator<any>,
        'Sum as Fraction of Rows': PivotAggregator<any>,
        'Sum as Fraction of Total': PivotAggregator<any>,
        'Sum over Sum': PivotAggregator<any>
    },
    renderers: {
        [name: string]: any
    },
    derivers: any,
    locales: any,
    naturalSort: any,
    numberFormat: any,
    sortAs: any,
    PivotData: any
}

interface JQueryPivot {
    /**
     * Renders pivot table
     * @param data Data to use for pivot
     * @param options Pivot options
     */
    pivot(data: any[], options?: PivotOptions): JQuery;

    /**
     * Renders interactive pivot table
     * @param data Data to use for pivot
     * @param options PivotUI options
     * @param overwrite Whether to overwrite state with supplied options when calling pivotUI repeatedly
     * @param locale String defaulting to 'en' which controls the default locale
     */
    pivotUI(data: any[], options?: PivotUiOptions, overwrite?: boolean, locale?: string): JQuery;

    pivotUtilities: PivotUtilities;
}
interface JQuery extends JQueryPivot { }
interface JQueryStatic extends JQueryPivot { }

// require js module support

declare var PivotTable: any;
declare module "pivottable" {
    export = PivotTable;
} 