import { XPathExtractinator, PathVariable } from './xpath-extractinator';

describe("XPath Extractinator",
    () => {
        let extractinator: XPathExtractinator;

        beforeEach(() => {
            extractinator = new XPathExtractinator();
        })

        it("Extracts root", () => {
            // the root is implicit and called $node; it shouldn't be returned as extracted
            expectExtract('//node', [], false);
        });

        it("Ignores parent's attributes", () => {
            expectExtract('//node[@pt="vnw"]', []);
        });

        it("Extracts child", () => {
            expectExtract('//node[node]', [{ name: '$node1', path: '$node/node' }]);
        });

        it("Extracts child with attributes", () => {
            expectExtract('//node[node[@pt="vnw" and @rel="su"]]', [{ name: '$node1', path: '$node/node[@pt = "vnw" and @rel = "su"]' }]);
        });

        it("Extracts multiple children", () => {
            expectExtract(
                '//node[@cat="smain" and node and node[@cat="np"]]',
                [{ name: '$node1', path: '$node/node' },
                { name: '$node2', path: '$node/node[@cat = "np"]' }]);
        });

        it("Extracts sub-children", () => {
            expectExtract(
                '//node[node[node and node[@pt="lid"]]]',
                [{ name: '$node1', path: '$node/node[node and node[@pt = "lid"]]' },
                { name: '$node2', path: '$node1/node' },
                { name: '$node3', path: '$node1/node[@pt = "lid"]' }]);
        });

        it("Extracts union", () => {
            expectExtract(
                '//node[node[@pt = "lid"] | node[@pt="vnw" and number(@begin) > 5]]',
                [{ name: '$node1', path: '$node/node[@pt = "lid"]' },
                { name: '$node2', path: '$node/node[@pt = "vnw" and number(@begin) > 5]' }]);
        });

        let expectExtract = (xpath: string, expected: PathVariable[], checkOrdered: boolean = true) => {
            let result = extractinator.extract(xpath);
            expect(result).toEqual(expected, xpath);
            let subPath = xpath.substring('//node['.length, xpath.length - 1);

            if (checkOrdered) {
                xpath = `//node[@cat="smain" and not(.//node[position() < last()][number(@begin) > number(following-sibling::node/@begin)]) and ${subPath}]`;
                let orderedResult = extractinator.extract(xpath);
                expect(orderedResult).toEqual(expected, xpath);
            }
        }
    });