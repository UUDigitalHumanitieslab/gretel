import { Injectable } from '@angular/core';
import { flatMap, materialize, map } from 'rxjs/operators';

import { FilterValue, SearchResults, ResultsService } from './results.service';
import { TreebankService } from './treebank.service';
import { TreebankSelection } from '../treebank';

@Injectable({ providedIn: 'root' })
export class ResultsStreamService {
    constructor(private resultsService: ResultsService, private treebankService: TreebankService) {
    }

    stream(xpath: string,
        selection: TreebankSelection,
        filterValues: FilterValue[],
        retrieveContext: boolean) {
        // create a request for each treebank
        return selection.corpora.map(({ provider, corpus }) => {
            // create the basic request, without error handling
            const base = this.resultsService.getAllResults(
                xpath,
                provider,
                corpus.name,
                corpus.components,
                retrieveContext,
                false,
                filterValues,
                []
            );

            return base.pipe(
                // expand hits with the corpus and provider
                // (so we can use this later in the interface)
                // This mapping is skipped if the query returns an error
                flatMap(async (result: SearchResults) => {
                    const treebank = this.treebankService.treebanks.value.data[provider][corpus.name];
                    const componentDetails = await treebank.details.components();
                    return {
                        ...result,
                        hits: result.hits.map(hit => ({
                            ...hit,
                            provider,
                            corpus,
                            componentDisplayName: componentDetails[hit.component].title
                        }))
                    };
                }),

                // (This will run even if base receives an error)
                // Capture errors and send them on as a regular events
                // This is required because this only one stream in a set of multiple result streams
                // that will eventually be merged together
                // and we don't want that merged stream to abort when one of them throws an error
                materialize(),

                // We've already attached the provider and corpus to the results,
                // but if an error happens, or we're done requesting results,
                // that message doesn't contain that info yet, so attach it
                map(result => ({
                    result,
                    provider,
                    corpus
                })),
            );
        });
    }
}
