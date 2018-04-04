import { NgModule } from '@angular/core';

import { XPathEditorComponent } from './components/_ng';
import { LassyXPathParserService, MacroService, XPathExtractinatorService } from './services/_ng';

const declarations = [XPathEditorComponent];
@NgModule({
    declarations,
    exports: declarations,
    providers: [
        LassyXPathParserService,
        MacroService,
        XPathExtractinatorService
    ]
})
export class LassyXPathModule {
}
