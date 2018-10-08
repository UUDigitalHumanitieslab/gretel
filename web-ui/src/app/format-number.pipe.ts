import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'formatNumber'
})
export class FormatNumberPipe implements PipeTransform {
    transform(value: string | number): string {
        if (typeof value == 'undefined') {
            return undefined;
        }

        let numbersPattern = /[\d\\.]+/g;
        let stringValue = value.toString();
        let result = numbersPattern.exec(stringValue);
        if (result.length) {
            let start = result.index;
            let length = result[0].length;
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
