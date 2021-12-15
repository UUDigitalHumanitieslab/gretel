import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfirmationService } from 'primeng/api';

import { ValueEvent } from 'lassy-xpath';

import { StateService, TokenAttributes } from '../../../services/_index';
import { StepDirective } from '../step.directive';
import { StepType, GlobalStateExampleBased, DefaultTokenAttributes } from '../../../pages/multi-step-page/steps';
import { NotificationService } from '../../../services/notification.service';
import { animations } from '../../../animations';
import { Option, options } from './matrix-option.component';

const optionsLookup = Object.assign(
    {},
    ...options.map(option => ({ [option.value]: option }))) as { [key: string]: Option };

@Component({
    animations,
    selector: 'grt-matrix',
    templateUrl: './matrix.component.html',
    styleUrls: ['./matrix.component.scss']
})
export class MatrixComponent extends StepDirective<GlobalStateExampleBased> implements OnInit, OnDestroy {
    private warningId: number;
    private subscriptions: Subscription[];
    public stepType = StepType.Matrix;

    private set attributes(tokens: TokenAttributes[]) {
        let alwaysAdvanced = false;
        for (let token of tokens) {
            if (token != null) {
                for (let [key, value] of Object.entries(token)) {
                    var option = optionsLookup[key];
                    if (option.advanced) {
                        if (value !== DefaultTokenAttributes[key]) {
                            this.showAdvanced = true;
                            alwaysAdvanced = true;
                        }
                    }
                }
            }
        }

        this.alwaysAdvanced = alwaysAdvanced;

        if (this.tokenValues &&
            tokens.length === this.tokenValues.length) {
            // only update the values, but prevent the whole array
            // from being re-rendered
            for (let i = 0; i < tokens.length; i++) {
                Object.assign(this.tokenValues[i], tokens[i]);
            }
        } else {
            this.tokenValues = tokens;
        }
    }

    private get attributes() {
        return this.tokenValues;
    }

    public set tokens(values: string[]) {
        const indexedTokens = values.map((value, index) => ({ value, index }));
        if (this.indexedTokens &&
            indexedTokens.length === this.indexedTokens.length) {
            // only update the values, but prevent the whole array
            // from being re-rendered
            for (let i = 0; i < indexedTokens.length; i++) {
                Object.assign(this.indexedTokens[i], indexedTokens[i]);
            }
        } else {
            this.indexedTokens = indexedTokens;
        }
        this.filename = values.filter(t => t.match(/[^'"-:!?,\.]/)).join('-').toLowerCase() + '.xml';
    }

    public get tokens() {
        return this.indexedTokens.map(t => t.value);
    }

    public subTreeXml: string;
    public xpath: string;
    public isCustomXPath: boolean;
    public respectOrder: boolean;
    public retrieveContext: boolean;
    public ignoreTopNode: boolean;

    @Output()
    public changeValue = new EventEmitter<MatrixSettings>();

    public filename: string;
    public subTreeDisplay = 'inline';
    public warning: boolean;

    public indexedTokens: { value: string, index: number }[];
    public showAdvanced: boolean;
    /**
     * If an advanced option has been selected, the toggle will be disabled.
     */
    public alwaysAdvanced: boolean;

    public tokenValues: TokenAttributes[];

    public options = options;

    private originalXPath: string;

    constructor(stateService: StateService<GlobalStateExampleBased>,
        private confirmationService: ConfirmationService,
        private notificationService: NotificationService) {
        super(stateService);
        this.subscriptions = [
            this.state$.subscribe(state => {
                this.attributes = state.attributes;
                this.ignoreTopNode = state.ignoreTopNode;
                this.isCustomXPath = state.isCustomXPath;
                this.respectOrder = state.respectOrder;
                this.retrieveContext = state.retrieveContext;
                this.subTreeXml = state.subTreeXml;
                this.tokens = state.tokens;
                this.xpath = state.xpath;
            })
        ];
    }

    public setTokenPart(tokenIndex: number, part: Option) {
        if (this.isCustomXPath) {
            this.warningId = this.notificationService.add('It is not possible to use the matrix when using custom xpath.');
            return;
        }

        var updated = this.rotateValue(tokenIndex, part);

        this.emitChange({
            attributes: updated
        });
    }

    private emitChange(settings: Partial<MatrixSettings> = {}) {
        if (settings.customXPath == null) {
            this.valid = true;
        }
        this.changeValue.next(Object.assign({
            attributes: this.tokenValues,
            retrieveContext: this.retrieveContext,
            customXPath: settings.customXPath || null,
            respectOrder: this.respectOrder,
            tokens: [...this.tokens],
            ignoreTopNode: this.ignoreTopNode
        }, settings));
        this.updateValidity();
    }

    public toggleSetting(key: 'retrieveContext' | 'respectOrder' | 'ignoreTopNode') {
        this.emitChange({ [key]: !this[key] });
    }

    public changeCustomXpath(valueEvent: ValueEvent) {
        this.valid = !valueEvent.error && !!valueEvent.xpath;
        if (!!valueEvent.xpath) {
            this.emitChange({ customXPath: valueEvent.xpath });
        }
    }

    public editXPath() {
        this.originalXPath = this.xpath;
        this.emitChange({ customXPath: this.xpath });
    }

    public resetXPath() {
        const reset = () => {
            this.valid = true;
            this.emitChange();
            this.notificationService.cancel(this.warningId);
        };
        if (this.xpath === this.originalXPath) {
            reset();
        } else {
            this.confirmationService.confirm({
                message: 'Are you sure you want to reset your custom XPath query?',
                accept: reset
            });
        }
    }

    private updateValidity() {
        this.changeValid.emit(this.valid);
    }

    public getWarningMessage() {
        this.warning = true;
    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngOnDestroy() {
        this.notificationService.cancel(this.warningId);
        this.subscriptions.forEach(s => s.unsubscribe());
        super.ngOnDestroy();
    }

    private rotateValue(tokenIndex: number, option: Option): TokenAttributes[] {
        var value = (this.tokenValues[tokenIndex][option.value] ??
            optionsLookup[option.value]);
        var options: any[];

        switch (option.type) {
            case 'default':
                options = ['include', 'exclude', undefined];
                break;

            case 'bool':
                options = [true, false];
                break;
        }

        var index = options.indexOf(value) + 1;
        var update = options[index % options.length];

        return [
            ...this.tokenValues.slice(0, tokenIndex),
            {
                ...this.tokenValues[tokenIndex],
                [option.value]: update
            },
            ...this.tokenValues.slice(tokenIndex + 1)
        ];
    }
}

export interface MatrixSettings {
    attributes: TokenAttributes[];
    customXPath: string;
    retrieveContext: boolean;
    respectOrder: boolean;
    tokens: string[];
    ignoreTopNode: boolean;
}
