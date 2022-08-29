interface FilterBase {
    field: string;
    options: string[];
}

export interface DateFilter extends FilterBase {
    filterType: 'range';
    dataType: 'date';
    minValue: Date;
    maxValue: Date;
}

export interface TextFilter extends FilterBase {
    filterType: 'checkbox' | 'dropdown';
    dataType: 'text';
}

export interface IntFilter extends FilterBase {
    filterType: 'slider';
    dataType: 'int';
    minValue: number;
    maxValue: number;
}

export type Filter = DateFilter | TextFilter | IntFilter;
