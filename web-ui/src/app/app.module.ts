import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { LassyXPathModule } from 'lassy-xpath/ng';

import { AppComponent } from './app.component';
import { AlpinoService } from "./services/alpino.service";
import { HttpClientModule } from "@angular/common/http";
import { HomePageComponent } from './pages/home-page/home-page.component';
import { HomeContentComponent } from './pages/home-page/home-content/home-content.component';
import { AppRoutingModule } from "./app-routing/app-routing.module";
import { DocumentationComponent } from './pages/documentation/documentation.component';
import { DocumentationContentComponent } from './pages/documentation/documentation-content/documentation-content.component';
import { XpathSearchComponent } from './pages/xpath-search/xpath-search.component';
import { XpathSearchService } from "./xpath-search.service";
import { LinkService } from "./services/link.service";
import { ResultsService } from './services/results.service';
import { XmlParseService } from './services/xml-parse.service';
import { StepComponent } from './components/step/step.component';
import { XpathInputComponent } from './components/step/xpath-input/xpath-input.component';
import { BreadcrumbBarComponent } from './components/breadcrumb-bar/breadcrumb-bar.component';
import { SelectTreebanksComponent } from "./components/step/select-treebanks/select-treebanks.component";
import { DownloadService } from "./services/download.service";
import { TreebankService } from "./services/treebank.service";
import { TableModule } from "primeng/table";
import { CookieService } from "angular2-cookie/core";
import { SessionService } from "./services/session.service";
import { ResultsComponent } from './components/step/results/results.component';
import { DialogModule } from "primeng/dialog";
import { ConfigurationService } from "./services/configuration.service";
import { PaperCiteComponent } from "./components/page-components/paper-cite/paper-cite.component";
import { AdressComponent } from "./components/page-components/adress/adress.component";
import { FooterComponent } from "./components/page-components/footer/footer.component";
import { BodyHeaderComponent } from "./components/page-components/body-header/body-header.component";
import { NavigationComponent } from "./components/page-components/header/navigation/navigation.component";
import { HeaderComponent } from "./components/page-components/header/header.component";
import { FooterNavigationComponent } from "./components/page-components/footer/footer-navigation/footer-navigation.component";
import { Header3Component } from "./components/page-components/header-3/header-3.component";
import { SelectableTable } from "./components/tables/selectable-table/selectable-table.component";
import { GretelWebsiteLinkComponent } from "./components/page-components/gretel-website-link/gretel-website-link.component";
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgSelectModule } from "@ng-select/ng-select";
import { AngularFontAwesomeModule } from "angular-font-awesome";
@NgModule({
    declarations: [
        AppComponent,
        HomePageComponent,
        HeaderComponent,
        NavigationComponent,
        BodyHeaderComponent,
        FooterComponent,
        HomeContentComponent,
        AdressComponent,
        PaperCiteComponent,
        DocumentationComponent,
        GretelWebsiteLinkComponent,
        DocumentationContentComponent,
        FooterNavigationComponent,
        XpathSearchComponent,
        Header3Component,
        StepComponent,
        XpathInputComponent,
        BreadcrumbBarComponent,
        SelectTreebanksComponent,
        ResultsComponent,
        SelectableTable,

    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        TableModule,
        FormsModule,
        LassyXPathModule,
        DialogModule,
        MessageModule,
        MessagesModule,
        BrowserAnimationsModule,
        NgSelectModule,
    ],
    providers: [
        AlpinoService,
        XpathSearchService,
        LinkService,
        ResultsService,
        XmlParseService,
        TreebankService,
        CookieService,
        SessionService,
        ConfigurationService,
        DownloadService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
