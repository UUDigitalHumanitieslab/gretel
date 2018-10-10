import { Component, EventEmitter, Input, OnChanges, Output, SimpleChange } from "@angular/core";
import { DownloadService, ResultsService, TreebankCount, TreebankService } from "../../../services/_index";

@Component({
    selector: 'grt-distribution-list',
    templateUrl: './distribution-list.component.html',
    styleUrls: ['./distribution-list.component.scss']
})
export class DistributionListComponent implements OnChanges {
    @Input()
    public corpus: string;

    @Input()
    public components: string[];

    @Input()
    public xpath: string;

    @Output()
    public onHidingComponents = new EventEmitter<string[]>();

    public totalSelected: boolean = true;
    public loading: boolean = true;
    public counts: Count[];
    public totalHits: number;
    public totalSentences: number;

    private componentProperties: Promise<{ [name: string]: { databaseId: string, sentenceCount: number } }> = Promise.resolve({});

    constructor(private downloadService: DownloadService,
        private resultsService: ResultsService,
        private treebankService: TreebankService) {
    }

    public async ngOnChanges(changes: TypedChanges) {
        if (this.corpus == undefined || this.xpath == undefined || this.components == undefined) {
            return;
        }
        let redoCounts = false;

        // check that we have all the mappings available
        if (changes.corpus && (changes.corpus.firstChange || changes.corpus.currentValue != changes.corpus.previousValue)) {
            redoCounts = true;
            this.componentProperties = this.treebankService.getComponentGroups(this.corpus)
                .then(componentGroups => {
                    let properties = {};
                    for (let componentGroup of componentGroups.groups)
                        for (let variant of componentGroups.variants) {
                            let component = componentGroup.components[variant];
                            properties[component.component] = {
                                databaseId: component.databaseId,
                                sentenceCount: component.sentenceCount
                            };
                        }
                    return properties;
                });
        }

        if (changes.xpath && (changes.xpath.firstChange || changes.xpath.currentValue != changes.xpath.previousValue)) {
            redoCounts = true;
        }

        if (!redoCounts) {
            // check that the components have changed
            redoCounts = changes.components && (changes.components.firstChange || changes.components.currentValue != changes.components.previousValue);
        }

        if (redoCounts) {
            // the selected components could change before the promise is resolved
            this.loading = true;
            let components: string[] = [].concat(this.components);
            let [componentProperties, treebankCounts] = await Promise.all([
                this.componentProperties, this.resultsService.treebankCounts(this.xpath, this.corpus, components)
            ]);
            let componentDatabaseIds: { [componentName: string]: string } = {};
            let totalHits = 0;
            let totalSentences = 0;

            // combine the properties of the components (total number of sentences) with the number of hits
            // in the associated databases
            let counts = components.map(component => {
                let hits = treebankCounts.find(c => c.databaseId == componentProperties[component].databaseId).count;
                let sentences = componentProperties[component].sentenceCount;
                totalHits += hits;
                totalSentences += sentences;
                return {
                    component,
                    databaseId: componentProperties[component].databaseId,
                    hits,
                    selected: true,
                    sentences
                }
            });

            // Restore the selection made by the user (if any), assume the list of components is the same
            // and has the same order. Allows for differences.
            if (this.counts !== undefined) {
                for (let i = 0; i < counts.length; i++) {
                    let count = counts[i];
                    for (let j = i; j < this.counts.length + i; j++) {
                        let existingCount = this.counts[j % this.counts.length];
                        if (count.databaseId == existingCount.databaseId) {
                            count.selected = existingCount.selected;
                        }
                    }
                }
            }

            this.counts = counts;
            this.totalHits = totalHits;
            this.totalSentences = totalSentences;

            this.loading = false;
        }
    }

    public toggleComponent(count: Count) {
        count.selected = !count.selected;
        if (!count.selected) {
            this.totalSelected = false;
        } else if (this.counts.find(x => !x.selected) === undefined) {
            this.totalSelected = true;
        }
        this.emitHiddenComponents();
    }

    public toggleAllComponents() {
        this.totalSelected = !this.totalSelected;
        for (let count of this.counts) {
            count.selected = this.totalSelected;
        }
        this.emitHiddenComponents();
    }

    public download() {
        this.downloadService.downloadDistributionList(this.counts);
    }

    private emitHiddenComponents() {
        this.onHidingComponents.emit(this.counts.filter(c => !c.selected).map(c => c.databaseId));
    }
}
type TypedChanges = {
    [propName in keyof DistributionListComponent]: SimpleChange;
}
type Count = {
    component: string,
    databaseId: string,
    hits: number,
    selected: boolean,
    sentences: number
}
