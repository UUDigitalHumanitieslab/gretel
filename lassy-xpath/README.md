## Angular 2+

(Only tested in Angular 5)

```typescript
import { LassyXPathModule } from 'lassy-xpath/ng';

@NgModule({
    imports: [LassyXPathModule]
})
export class AppModule {}
```

```typescript
import { MacroService, XPathExtractinatorService, ValueEvent } from 'lassy-xpath/ng';


@Component()
export class ExampleComponent {
    constructor(
        macroService: MacroService,
        private extractinator: XPathExtractinatorService) {
        // set the macros to use in the editor
        macroService.loadDefault();
    }

    inputChanged(event: ValueEvent) {
        this.valid = !event.error;
        this.value = event.xpath;
        console.log(this.extractinator.extract(event.xpath));
    }
}
```

```html
<lx-editor [value]="value" (onChange)="inputChanged($event)" autofocus="true"></lx-editor>
```

Use the `LassyXPathParserService` for parsing/validating a LassyXPath.

## JQuery

```scss
@import 'lassy-xpath/scss/xpath-editor';
```

```typescript
import 'lassy-xpath/jquery';

let $xpathEditor = $('.xpath-editor');
$xpathEditor.xpathEditor({
    macrosUrl: $xpathEditor.data('macros-url')
});

let $xpathVariables = $('.xpath-variables');
$xpathVariables.xpathVariables({
    formName: $xpathVariables.data('name'),
    source: $xpathVariables.data('source'),
});
```
