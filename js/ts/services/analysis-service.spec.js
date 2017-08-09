define(["require", "exports", "./analysis-service"], function (require, exports, analysis_service_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    describe("Analysis Service", function () {
        var analysisService;
        beforeEach(function () {
            analysisService = new analysis_service_1.AnalysisService();
        });
        it('Works', function () {
            var result = analysisService.getFlatTable([{
                    componentName: 'TEST',
                    fileName: 'Test-1.xml',
                    highlightedSentence: '<strong>Hallo lieve mensen dit is een testzin .</strong>',
                    metadata: { 'meta1': 'hallo' },
                    nodeXml: "<node>\n    <node>\n      <node>\n        <node lemma=\"hallo\" pos=\"tag\"/>\n        <node>\n          <node lemma=\"lief\" pos=\"adj\" />\n          <node lemma=\"mens\" pos=\"noun\" />\n        </node>\n      </node>\n      <node>\n        <node lemma=\"dit\" pos=\"det\" />\n        <node lemma=\"zijn\" pos=\"verb\" />\n        <node>\n          <node lemma=\"een\" pos=\"det\" />\n          <node lemma=\"test_zin\" pos=\"noun\" />\n        </node>\n      </node>\n    </node>\n    <node lemma=\".\" pos=\"punct\" />\n  </node>",
                    sentenceId: 'Test-1.xml-endPos=all+match=1',
                    variables: { '$node1': { lemma: undefined, pos: undefined } },
                    viewUrl: 'showTree.php'
                }], ['$node1'], ['meta1']);
            expect(result).toEqual([
                ['meta1',
                    'pos1', 'pos2', 'pos3', 'pos4', 'pos5', 'pos6', 'pos7', 'pos8',
                    'lem1', 'lem2', 'lem3', 'lem4', 'lem5', 'lem6', 'lem7', 'lem8',
                    'pos_node1', 'lem_node1'],
                ['hallo',
                    'tag', 'adj', 'noun', 'det', 'verb', 'det', 'noun', 'punct',
                    'hallo', 'lief', 'mens', 'dit', 'zijn', 'een', 'test_zin', '.',
                    '(none)', '(none)']
            ]);
        });
        it('Deals with differing sentence lengths', function () {
            var result = analysisService.getFlatTable([
                generateResult(3),
                generateResult(3),
                generateResult(4),
                generateResult(1)
            ], ['$node1'], ['meta1']);
            expect(result).toEqual([
                ['meta1', 'pos1', 'pos2', 'pos3', 'pos4', 'lem1', 'lem2', 'lem3', 'lem4', 'pos_node1', 'lem_node1'],
                ['hallo',
                    'verb', 'verb', 'verb', '(none)',
                    'word', 'word', 'word', '(none)',
                    'test', 'test'],
                ['hallo',
                    'verb', 'verb', 'verb', '(none)',
                    'word', 'word', 'word', '(none)',
                    'test', 'test'],
                ['hallo',
                    'verb', 'verb', 'verb', 'verb',
                    'word', 'word', 'word', 'word',
                    'test', 'test'],
                ['hallo',
                    'verb', '(none)', '(none)', '(none)',
                    'word', '(none)', '(none)', '(none)',
                    'test', 'test'],
            ]);
        });
        function generateResult(count) {
            return {
                componentName: 'TEST',
                fileName: 'Test-1.xml',
                highlightedSentence: 'Lorem ipsum',
                metadata: { 'meta1': 'hallo' },
                nodeXml: generateNodeXml(count),
                sentenceId: 'Test-1.xml-endPos=all+match=1',
                variables: { '$node1': { lemma: 'test', pos: 'test' } },
                viewUrl: 'showTree.php'
            };
        }
        function generateNodeXml(count) {
            return "<node>" + new Array(count + 1).join('<node lemma="word" pos="verb" />') + "</node>";
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5hbHlzaXMtc2VydmljZS5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdHMvc2VydmljZXMvYW5hbHlzaXMtc2VydmljZS5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBRUEsUUFBUSxDQUFDLGtCQUFrQixFQUFFO1FBQ3pCLElBQUksZUFBZ0MsQ0FBQztRQUNyQyxVQUFVLENBQUM7WUFDUCxlQUFlLEdBQUcsSUFBSSxrQ0FBZSxFQUFFLENBQUM7UUFDNUMsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsT0FBTyxFQUFFO1lBQ1IsSUFBSSxNQUFNLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FDckMsQ0FBQztvQkFDRyxhQUFhLEVBQUUsTUFBTTtvQkFDckIsUUFBUSxFQUFFLFlBQVk7b0JBQ3RCLG1CQUFtQixFQUFFLDBEQUEwRDtvQkFDL0UsUUFBUSxFQUFFLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRTtvQkFDOUIsT0FBTyxFQUFFLHdoQkFtQmY7b0JBQ00sVUFBVSxFQUFFLCtCQUErQjtvQkFDM0MsU0FBUyxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLEVBQUU7b0JBQzdELE9BQU8sRUFBRSxjQUFjO2lCQUMxQixDQUFDLEVBQ0YsQ0FBQyxRQUFRLENBQUMsRUFDVixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDZixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDO2dCQUNuQixDQUFDLE9BQU87b0JBQ0osTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU07b0JBQzlELE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNO29CQUM5RCxXQUFXLEVB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