import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiltersComponent } from './filters.component';
import {FilterService} from './filter.service';
import {HttpClientModule} from "@angular/common/http";
import { TextComponent } from './text/text.component';
import { IntComponent } from './int/int.component';
import { DateComponent } from './date/date.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { FilterComponent } from './filter/filter.component';
import { MatSliderModule} from '@angular/material/slider';
import {FormsModule} from "@angular/forms";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatDatepickerModule} from '@angular/material/datepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  MatFormFieldModule, MatInputModule, MatNativeDateModule, MatOptionModule,
  MatSelectModule
} from "@angular/material";
@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    MatInputModule,
    FormsModule,
    BrowserAnimationsModule,
    MatSliderModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    NgSelectModule
  ],
  declarations: [FiltersComponent, TextComponent, IntComponent, DateComponent, DropdownComponent, FilterComponent],
  providers: [FilterService],
  exports: [FiltersComponent]
})
export class FiltersModule { }
