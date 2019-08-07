import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSliderModule } from '@angular/material/slider';

import { NgSelectModule } from '@ng-select/ng-select';

import { FiltersComponent } from './filters.component';
import { TextComponent } from './text/text.component';
import { IntComponent } from './int/int.component';
import { DateComponent } from './date/date.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CheckboxModule } from 'primeng/checkbox';
import { SliderModule } from 'primeng/slider';

export const
    imports: any[] = [
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
        NgSelectModule,
        CheckboxModule,
        SliderModule
    ],
    declarations: any[] = [
        FiltersComponent,
        TextComponent,
        IntComponent,
        DateComponent,
        DropdownComponent
    ],
    providers: any[] = [];

@NgModule({
    imports,
    declarations,
    providers,
    exports: [FiltersComponent]
})
export class FiltersModule { }
