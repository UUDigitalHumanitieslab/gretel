import { Component, Input, OnChanges, SimpleChange } from "@angular/core";
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

    public loading: boolean = true;
    public counts: {
        component: string,
        hits: number,
        sentences: number
    }[];
    public totalHits: number;
    public totalSentences: number;

    private componentProperties: Promise<{ [name: string]: { databaseId: string, sentenceCount: number } }> = Promise.resolve({});

    constructor(private downloadService: DownloadService,
        private resultsService: ResultsService,
        private treebankService: TreebankService) {
    }

    public async ngOnChanges(changes: TypedChanges) {
        let redoCounts = false;
        // check that we have all the mappings available
        if (changes.corpus.firstChange || changes.corpus.currentValue != changes.corpus.previousValue) {
            redoCounts = true;
            this.componentProperties = this.treebankService.getSubTreebanks({ title: this.corpus })
                .then(subTreebanks => {
                    let properties = {};
                    for (let component of subTreebanks) {
                        properties[component.component] = {
                            databaseId: component.databaseId,
                            sentenceCount: component.sentenceCount
                        };
                    }
                    return properties;
                });
        }

        if (changes.xpath.firstChange || changes.xpath.currentValue != changes.xpath.previousValue) {
            redoCounts = true;
        }

        if (!redoCounts) {
            // check that the components have changed
            redoCounts = changes.components.firstChange || changes.components.currentValue != changes.components.previousValue;
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
                    hits,
                    sentences
                }
            });

            this.counts = counts;
            this.totalHits = totalHits;
            this.totalSentences = totalSentences;

            this.loading = false;
        }
    }

    public download() {
        this.downloadService.downloadDistributionList(this.counts);
    }
}
type TypedChanges = {
    [propName in keyof DistributionListComponent]: SimpleChange;
}
