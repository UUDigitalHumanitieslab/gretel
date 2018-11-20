import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'formatNumber'
})
export class FormatNumberPipe implements PipeTransform {
    transform(value: string | number): string {
        if (typeof value === 'undefined') {
            return undefined;
        }

        const numbersPattern = /[\d\\.]+/g;
        const stringValue = value.toString();
        const result = numbersPattern.exec(stringValue);
        if (result && result.length) {
            const start = result.index;
            const length = result[0].length;
            return stringValue.substr(0, start) +
                this.format(stringValue.substr(start, length)) +
                stringValue.substr(start + length);
        } else {
            return stringValue;
        }
    }

    private format(value: string) {
        return parseFloat(value).toLocaleString();
    }
}
