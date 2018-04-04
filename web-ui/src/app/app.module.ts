import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {AlpinoService} from "./services/alpino.service";
import {HttpClientModule} from "@angular/common/http";
import {HomePageComponent} from './pages/home-page/home-page.component';
import {HeaderComponent} from './components/page-components/header/header.component';
import {NavigationComponent} from './components/page-components/header/navigation/navigation.component';
import {BodyHeaderComponent} from './components/page-components/body-header/body-header.component';
import {FooterComponent} from './components/page-components/footer/footer.component';
import {HomeContentComponent} from './pages/home-page/home-content/home-content.component';
import {AdressComponent} from './components/page-components/adress/adress.component';
import {PaperCiteComponent} from './components/page-components/paper-cite/paper-cite.component';
import {AppRoutingModule} from "./app-routing/app-routing.module";
import {DocumentationComponent} from './pages/documentation/documentation.component';
import {GretelWebsiteLinkComponent} from './components/page-components/gretel-website-link/gretel-website-link.component';
import {DocumentationContentComponent} from './pages/documentation/documentation-content/documentation-content.component';
import {FooterNavigationComponent} from './components/page-components/footer/footer-navigation/footer-navigation.component';
import {XpathSearchComponent} from './pages/xpath-search/xpath-search.component';
import {Header3Component} from './components/page-components/header-3/header-3.component';
import {XpathEditorComponent} from './components/xpath-editor/xpath-editor.component';
import {XpathSearchService} from "./xpath-search.service";
import {LinkService} from "./services/link.service";
import {StepComponent} from './components/step/step.component';
import {XpathInputComponent} from './components/step/xpath-input/xpath-input.component';
import {BreadcrumbBarComponent} from './components/breadcrumb-bar/breadcrumb-bar.component';
import {SelectTreebanksComponent} from "./components/step/select-treebanks/select-treebanks.component";
import {TreebankService} from "./services/treebank.service";
import {TableModule} from "primeng/table";
import {DialogModule} from "primeng/dialog";
import {CookieService} from "angular2-cookie/core";
import {SessionService} from "./services/session.service";
import {ResultsComponent} from './components/step/results/results.component';
import {ResultService} from "./services/result.service";
import {ConfigurationService} from "./services/configuration.service";
import {SelectableTable} from "./components/tables/selectable-table/selectable-table.component";


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
        XpathEditorComponent,
        StepComponent,
        XpathInputComponent,
        BreadcrumbBarComponent,
        SelectTreebanksComponent,
        ResultsComponent,
        SelectableTable
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        TableModule,
        DialogModule

    ],
    providers: [
        AlpinoService,
        XpathSearchService,
        LinkService,
        TreebankService,
        CookieService,
        SessionService,
        ResultService,
        ConfigurationService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
