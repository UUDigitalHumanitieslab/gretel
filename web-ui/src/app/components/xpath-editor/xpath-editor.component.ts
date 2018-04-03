import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { LassyXPathParserService } from 'lassy-xpath/ng';

@Component({
    selector: 'app-xpath-editor',
    templateUrl: './xpath-editor.component.html',
    styleUrls: ['./xpath-editor.component.scss']
})
export class XpathEditorComponent implements OnInit {
    @Input()
    public xpath: string = `//node[@cat="smain"
    and node[@rel="su" and @pt="vnw"]
    and node[@rel="hd" and @pt="ww"]
    and node[@rel="predc" and @cat="np"
    and node[@rel="det" and @pt="lid"]
    and node[@rel="hd" and @pt="n"]]]`;

    public messages: string[];

    constructor(private lassyXPathService: LassyXPathParserService) {
    }

    doTextareaValueChange(ev) {
        this.xpath = ev.target.value;
        let parsed = this.lassyXPathService.parse(this.xpath);
        let messages: string[] = [];
        if (parsed.error) {
            messages.push(parsed.error.message);
        } else if (parsed.warnings && parsed.warnings.length) {
            messages.push(...parsed.warnings.map(warning => warning.message));
        }

        if (messages.length) {
            this.messages = messages;
        } else {
            this.messages = ["Everything is OK!"];
        }
    }

    ngOnInit() {

    }
}
