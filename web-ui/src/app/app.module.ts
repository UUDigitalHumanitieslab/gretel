import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { NgSelectModule } from '@ng-select/ng-select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TableModule } from 'primeng/table';
import { LassyXPathModule } from 'lassy-xpath';
import { ClipboardModule } from 'ngx-clipboard';

import { AppComponent } from './app.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { HomeContentComponent } from './pages/home-page/home-content/home-content.component';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { DocumentationComponent } from './pages/documentation/documentation.component';
import { DocumentationContentComponent } from './pages/documentation/documentation-content/documentation-content.component';
import { StepButtonsComponent } from './pages/multi-step-page/step-buttons.component';
import { XpathSearchComponent } from './pages/xpath-search/xpath-search.component';
import { XpathInputComponent } from './components/step/xpath-input/xpath-input.component';
import { BreadcrumbBarComponent } from './components/breadcrumb-bar/breadcrumb-bar.component';
import { SelectTreebanksComponent } from './components/step/select-treebanks/select-treebanks.component';
import { SubTreebanksComponent } from './components/step/select-treebanks/sub-treebanks.component';
import { ResultsComponent } from './components/step/results/results.component';
import { PaperCiteComponent } from './components/page-components/paper-cite/paper-cite.component';
import { AdressComponent } from './components/page-components/adress/adress.component';
import { FooterComponent } from './components/page-components/footer/footer.component';
import { BodyHeaderComponent } from './components/page-components/body-header/body-header.component';
import { NavigationComponent } from './components/page-components/header/navigation/navigation.component';
import { HeaderComponent } from './components/page-components/header/header.component';
import { Header3Component } from './components/page-components/header-3/header-3.component';
import { GretelWebsiteLinkComponent } from './components/page-components/gretel-website-link/gretel-website-link.component';
import { BalloonDirective } from './balloon.directive';
import { SubtitleDirective } from './subtitle.directive';

import {
    AlpinoService,
    AnalysisService,
    ConfigurationService,
    DownloadService,
    LinkService,
    ResultsService,
    TreebankService,
    ParseService
} from './services/_index';
import { AnalysisComponent } from './components/step/analysis/analysis.component';
import { TreeVisualizerComponent } from './components/tree-visualizer/tree-visualizer.component';
import { ExternalTreeVisualizerComponent } from './components/tree-visualizer/external-tree-visualizer.component';
import { XPathEditorComponent } from './components/xpath/editor/xpath-editor.component';
import { XPathViewerComponent } from './components/xpath/viewer/xpath-viewer.component';
import { FiltersModule } from './modules/filters/filters.module';
import { ExampleBasedSearchComponent } from './pages/example-based-search/example-based-search.component';
import { SentenceInputComponent } from './components/step/sentence-input/sentence-input.component';
import { ParseComponent } from './components/step/parse/parse.component';
import { MatrixComponent } from './components/step/matrix/matrix.component';
import { DistributionListComponent } from './components/step/results/distribution-list.component';
import { FormatNumberPipe } from './format-number.pipe';
import { FiltersByXPathComponent } from './components/step/results/filters-by-xpath.component';
import { DownloadResultsComponent } from './components/step/results/download-results.component';
import { NodePropertiesButtonComponent } from './components/step/results/node-properties-button.component';
import { NodePropertiesComponent } from './components/node-properties/node-properties.component';
import { NodePropertiesEditorComponent } from './components/node-properties/node-properties-editor.component';

export const declarations: any[] = [
    AdressComponent,
    AnalysisComponent,
    AppComponent,
    BalloonDirective,
    BodyHeaderComponent,
    BreadcrumbBarComponent,
    DistributionListComponent,
    DocumentationComponent,
    DocumentationContentComponent,
    DownloadResultsComponent,
    ExampleBasedSearchComponent,
    ExternalTreeVisualizerComponent,
    FiltersByXPathComponent,
    FooterComponent,
    FormatNumberPipe,
    GretelWebsiteLinkComponent,
    Header3Component,
    HeaderComponent,
    HomeContentComponent,
    HomePageComponent,
    MatrixComponent,
    NavigationComponent,
    NodePropertiesButtonComponent,
    NodePropertiesComponent,
    NodePropertiesEditorComponent,
    PaperCiteComponent,
    ParseComponent,
    ResultsComponent,
    SelectTreebanksComponent,
    SentenceInputComponent,
    StepButtonsComponent,
    SubtitleDirective,
    SubTreebanksComponent,
    TreeVisualizerComponent,
    XPathEditorComponent,
    XpathInputComponent,
    XpathSearchComponent,
    XPathViewerComponent
];

export const imports: any[] = [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    ClipboardModule,
    ConfirmDialogModule,
    DialogModule,
    FiltersModule,
    FormsModule,
    HttpClientModule,
    LassyXPathModule,
    MessageModule,
    MessagesModule,
    NgSelectModule,
    OverlayPanelModule,
    RouterModule,
    TableModule,
];

export const providers: any[] = [
    AlpinoService,
    AnalysisService,
    ConfigurationService,
    ConfirmationService,
    DownloadService,
    LinkService,
    ResultsService,
    TreebankService,
    ParseService,
];

@NgModule({
    declarations,
    imports,
    providers,
    bootstrap: [AppComponent]
})
export class AppModule {
}
