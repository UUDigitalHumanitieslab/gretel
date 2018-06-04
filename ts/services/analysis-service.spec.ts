import { AnalysisService } from './analysis-service';

describe("Analysis Service", () => {
    let analysisService: AnalysisService;
    beforeEach(() => {
        analysisService = new AnalysisService();
    });

    it('Works', () => {
        let result = analysisService.getFlatTable(
            [{
                componentName: 'TEST',
                fileName: 'Test-1.xml',
                highlightedSentence: '<strong>Hallo lieve mensen dit is een testzin .</strong>',
                metadata: { 'meta1': 'hallo' },
                nodeXml: `<node>
    <node>
      <node>
        <node lemma="hallo" pos="tag"/>
        <node>
          <node lemma="lief" pos="adj" />
          <node lemma="mens" pos="noun" />
        </node>
      </node>
      <node>
        <node lemma="dit" pos="det" />
        <node lemma="zijn" pos="verb" />
        <node>
          <node lemma="een" pos="det" />
          <node lemma="test_zin" pos="noun" />
        </node>
      </node>
    </node>
    <node lemma="." pos="punct" />
  </node>`,
                sentenceId: 'Test-1.xml-endPos=all+match=1',
                variables: { '$node1': { lemma: undefined, pos: undefined } },
                viewUrl: 'showTree.php'
            }],
            ['$node1'],
            ['meta1']);
        expect(result).toEqual([
            ['meta1', 'pos_node1', 'lem_node1'],
            ['hallo', '(none)', '(none)']
        ]);
    });

    it('Deals with differing sentence lengths', () => {
        let result = analysisService.getFlatTable(
            [
                generateResult(3),
                generateResult(3),
                generateResult(4),
                generateResult(1)
            ],
            ['$node1'],
            ['meta1'],
        );
        expect(result).toEqual([
            ['meta1', 'pos_node1', 'lem_node1'],
            ['hallo', 'test', 'test'],
            ['hallo', 'test', 'test'],
            ['hallo', 'test', 'test'],
            ['hallo', 'test', 'test'],
        ]);
    });

    function generateResult(count: number) {
        return {
            componentName: 'TEST',
            fileName: 'Test-1.xml',
            highlightedSentence: 'Lorem ipsum',
            metadata: { 'meta1': 'hallo' },
            nodeXml: generateNodeXml(count),
            sentenceId: 'Test-1.xml-endPos=all+match=1',
            variables: { '$node1': { lemma: 'test', pos: 'test' } },
            viewUrl: 'showTree.php'
        }
    }

    function generateNodeXml(count: number) {
        return `<node>${new Array(count + 1).join('<node lemma="word" pos="verb" />')}</node>`
    }
});
