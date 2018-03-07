import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';


import {AppComponent} from './app.component';
import {ParseSentenceComponent} from './components/parse-sentence/parse-sentence.component';
import {AlpinoService} from "./services/alpino.service";
import {HttpClientModule} from "@angular/common/http";
import {HomePageComponent} from './pages/home-page/home-page.component';
import {HeaderComponent} from './components/header/header.component';
import {LogoComponent} from './components/header/logo/logo.component';
import {NavigationComponent} from './components/header/navigation/navigation.component';
import {BodyHeaderComponent} from './components/body-header/body-header.component';
import {FooterComponent} from './components/footer/footer.component';
import {HomeContentComponent} from './pages/home-page/home-content/home-content.component';
import {FaListComponent} from './components/fa-list/fa-list.component';
import {AdressComponent} from './components/adress/adress.component';
import {PaperCiteComponent} from './components/paper-cite/paper-cite.component';
import {AppRoutingModule} from "./app-routing/app-routing.module";
import {DocumentationComponent} from './pages/documentation/documentation.component';
import { GretelWebsiteLinkComponent } from './components/gretel-website-link/gretel-website-link.component';
import { DocumentationContentComponent } from './pages/documentation/documentation-content/documentation-content.component';


@NgModule({
  declarations: [
    AppComponent,
    ParseSentenceComponent,
    HomePageComponent,
    HeaderComponent,
    LogoComponent,
    NavigationComponent,
    BodyHeaderComponent,
    FooterComponent,
    HomeContentComponent,
    FaListComponent,
    AdressComponent,
    PaperCiteComponent,
    DocumentationComponent,
    GretelWebsiteLinkComponent,
    DocumentationContentComponent,

  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    AlpinoService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
