import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class FilterService {

  constructor(private http: HttpClient) {
  }


  filters = [
    {
      field: 'Text (checkbox)',
      dateType: 'text',
      filterType: 'checkbox',
    },
    {
      field: 'Date',
      dataType: 'date',
      filterType: 'range',
      min_value: new Date('1993-05-13'),
      max_value: new Date('1993-05-15'),
    },
    {
      field: 'Int',
      dateType: 'int',
      filterType: 'slider',
      min_value: 1,
      max_value: 50,

    },
    {
      field: 'Text (DropDown)',
      dateType: 'text',
      filterType: 'dropdown',
      options: this.generate_filter_options(40)

    }
  ];


  getExampleFilters() {
    return this.filters;
  }

  private generate_filter_options(number_of_options: number): string[] {
    const options = [];
    for (let i = 0; i < number_of_options; i++) {
      options.push(`${i}`);
    }
    return options;
  }


}
