import { NgModule } from '@angular/core';
import { HttpClientModule } from "@angular/common/http";
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgSelectModule } from "@ng-select/ng-select";
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
import { StepButtonsComponent } from './pages/multi-step-page/step-buttons.component';
import { XpathSearchComponent } from './pages/xpath-search/xpath-search.component';
import { DistributionListComponent } from './components/step/distribution-list/distribution-list.component';
import { XpathInputComponent } from './components/step/xpath-input/xpath-input.component';
import { BreadcrumbBarComponent } from './components/breadcrumb-bar/breadcrumb-bar.component';
import { SelectTreebanksComponent } from "./components/step/select-treebanks/select-treebanks.component";
import { SubTreebanksComponent } from "./components/step/select-treebanks/sub-treebanks.component";
import { ResultsComponent } from './components/step/results/results.component';
import { PaperCiteComponent } from "./components/page-components/paper-cite/paper-cite.component";
import { AdressComponent } from "./components/page-components/adress/adress.component";
import { FooterComponent } from "./components/page-components/footer/footer.component";
import { BodyHeaderComponent } from "./components/page-components/body-header/body-header.component";
import { NavigationComponent } from "./components/page-components/header/navigation/navigation.component";
import { HeaderComponent } from "./components/page-components/header/header.component";
import { FooterNavigationComponent } from "./components/page-components/footer/footer-navigation/footer-navigation.component";
import { Header3Component } from "./components/page-components/header-3/header-3.component";
import { GretelWebsiteLinkComponent } from "./components/page-components/gretel-website-link/gretel-website-link.component";

import {
    AlpinoService,
    AnalysisService,
    ConfigurationService,
    DownloadService,
    LinkService,
    ResultsService,
    TreebankService,
    XmlParseService
} from "./services/_index";
import { AnalysisComponent } from './components/analysis/analysis.component';
import { TreeVisualizerComponent } from "./components/tree-visualizer/tree-visualizer.component";
import { XPathEditorComponent } from "./components/xpath/editor/xpath-editor.component";
import { XPathViewerComponent } from "./components/xpath/viewer/xpath-viewer.component";
import { FiltersModule } from "./components/filters/filters.module";
import { ExampleBasedSearchComponent } from './pages/example-based-search/example-based-search.component';
import { SentenceInputComponent } from './components/step/sentence-input/sentence-input.component';
import { ParseComponent } from './components/step/parse/parse.component';
import { MatrixComponent } from './components/step/matrix/matrix.component';
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { FormatNumberPipe } from './format-number.pipe';

export const declarations: any[] = [
    AppComponent,
    AnalysisComponent,
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
    FormatNumberPipe,
    XpathSearchComponent,
    Header3Component,
    XpathInputComponent,
    BreadcrumbBarComponent,
    SelectTreebanksComponent,
    ResultsComponent,
    SubTreebanksComponent,
    DistributionListComponent,
    TreeVisualizerComponent,
    ExampleBasedSearchComponent,
    SentenceInputComponent,
    StepButtonsComponent,
    ParseComponent,
    MatrixComponent,
    XPathEditorComponent,
    XPathViewerComponent];

export const imports: any[] = [
    BrowserModule,
    BrowserAnimationsModule,
    FiltersModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    RouterModule,
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
    AnalysisService,
    LinkService,
    ResultsService,
    XmlParseService,
    TreebankService,
    ConfigurationService,
    DownloadService,
];

@NgModule({
    declarations,
    imports,
    providers,
    bootstrap: [AppComponent],
})
export class AppModule {
}
