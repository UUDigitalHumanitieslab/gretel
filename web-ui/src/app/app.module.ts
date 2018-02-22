import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { ParseSentenceComponent } from './components/parse-sentence/parse-sentence.component';
import {AlpinoService} from "./services/alpino.service";
import { HttpClientModule } from "@angular/common/http";


@NgModule({
  declarations: [
    AppComponent,
    ParseSentenceComponent,

  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [
    AlpinoService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
