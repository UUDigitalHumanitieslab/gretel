import { NgModule } from '@angular/core';
import { HttpClientModule } from "@angular/common/http";
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgSelectModule } from "@ng-select/ng-select";
import { AngularFontAwesomeModule } from "angular-font-awesome";
import { DialogModule } from "primeng/dialog";
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { TableModule } from "primeng/table";
import { LassyXPathModule } from 'lassy-xpath/ng';
import { ClipboardModule } from 'ngx-clipboard'

import { AppComponent } from './app.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { HomeContentComponent } from './pages/home-page/home-content/home-content.component';
import { AppRoutingModule } from "./app-routing/app-routing.module";
import { DocumentationComponent } from './pages/documentation/documentation.component';
import { DocumentationContentComponent } from './pages/documentation/documentation-content/documentation-content.component';
import { XpathSearchComponent } from './pages/xpath-search/xpath-search.component';
import { StepComponent } from './components/step/step.component';
import { DistributionListComponent } from './components/step/distribution-list/distribution-list.component';
import { XpathInputComponent } from './components/step/xpath-input/xpath-input.component';
import { BreadcrumbBarComponent } from './components/breadcrumb-bar/breadcrumb-bar.component';
import { SelectTreebanksComponent } from "./components/step/select-treebanks/select-treebanks.component";
import { ResultsComponent } from './components/step/results/results.component';
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

import {
    AlpinoService,
    ConfigurationService,
    DownloadService,
    LinkService,
    ResultsService,
    TreebankService,
    XmlParseService,
    XpathSearchService
} from "./services/_index";
import { TreeVisualizerComponent } from "./components/tree-visualizer/tree-visualizer.component";
import { FiltersModule } from "./components/filters/filters.module";

export const declarations: any[] = [
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
    DistributionListComponent,
    TreeVisualizerComponent];

export const imports: any[] = [
    BrowserModule,
    BrowserAnimationsModule,
    FiltersModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    TableModule,
    FormsModule,
    LassyXPathModule,
    DialogModule,
    MessageModule,
    MessagesModule,
    NgSelectModule,
    ClipboardModule,
];

export const providers: any[] = [
    AlpinoService,
    XpathSearchService,
    LinkService,
    ResultsService,
    XmlParseService,
    TreebankService,
    ConfigurationService,
    DownloadService
];

@NgModule({
    declarations,
    imports,
    providers,
    bootstrap: [AppComponent]
})
export class AppModule {
}
