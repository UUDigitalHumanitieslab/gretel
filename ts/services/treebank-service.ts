export class TreebankService {
    // TODO: have a configuration available for getting this kind of URLs from
    constructor(private api: string){
    }

    public getMetadata(corpus: string): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            $.get(this.api + '/treebank/metadata/' + corpus, (data: [{ field: string }]) => {
                resolve(data.map(item => item.field));
            });
        });
    }
}
