import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

type TitleLevel = 'app' | 'title' | 'subtitle';

@Injectable({ providedIn: 'root' })
export class TitleService {
    private readonly order: TitleLevel[] = ['subtitle', 'title', 'app'];

    private messages: { [level in TitleLevel]: string } = {
        app: undefined,
        title: undefined,
        subtitle: undefined
    };

    constructor(private title: Title) {
        this.messages['app'] = this.title.getTitle();
    }

    set(level: TitleLevel, message: string) {
        const levelIndex = this.order.indexOf(level);
        for (let i = 0; i < levelIndex; i++) {
            // clear lower messages
            this.messages[this.order[i]] = undefined;
        }
        this.messages[level] = message;
        return this.show();
    }

    private show() {
        const title = this.order.map((level) => this.messages[level]).filter(message => !!message).join(' - ');
        this.title.setTitle(title);
        return title;
    }
}
