import { XPathExtractinator, PathVariable } from './xpath-extractinator';
import { XPathModels } from './parser/xpath-models';

describe("XPath Extractinator",
    () => {
        let extractinator: XPathExtractinator;

        beforeEach(() => {
            extractinator = new XPathExtractinator();
        })

        it("Ignores empty input", () => {
            expectExtract('', [], false, false);
        });

        it("Ignores malformed input", () => {
            let parseError: XPathModels.ParseError | null = null;
            let result: PathVariable[] | null = null;
            try {
                result = extractinator.extract('//node[');
            }
            catch (error) {
                if (error instanceof XPathModels.ParseError) {
                    parseError = error;
                }
            }

            expect(result).toBeFalsy('No results should be returned if the input is malformed!');
            expect(parseError).toBeTruthy('No ParseError was thrown!');
        });

        it("Extracts root", () => {
            // the root is implicit and called $node; it shouldn't be returned as extracted
            expectExtract('//node', [], false);
        });

        it("Ignores parent's attributes", () => {
            expectExtract('//node[@pt="vnw"]', []);
        });

        it("Extracts child", () => {
            expectExtract('//node[node]', [{ name: '$node1', path: '$node/node', location: location(7) }]);
        });

        it("Extracts child with attributes", () => {
            expectExtract('//node[node[@pt="vnw" and @rel="su"]]',
                [{ name: '$node1', path: '$node/node[@pt = "vnw" and @rel = "su"]', location: location(7) }]);
        });

        it("Extracts multiple children", () => {
            expectExtract(
                '//node[@cat="smain" and node and node[@cat="np"]]',
                [{ name: '$node1', path: '$node/node', location: location(24) },
                { name: '$node2', path: '$node/node[@cat = "np"]', location: location(33) }]);
        });

        it("Extracts sub-children", () => {
            expectExtract(
                '//node[node[node and node[@pt="lid"]]]',
                [{ name: '$node1', path: '$node/node[node and node[@pt = "lid"]]', location: location(7) },
                { name: '$node2', path: '$node1/node', location: location(12) },
                { name: '$node3', path: '$node1/node[@pt = "lid"]', location: location(21) }]);
        });

        it("Extracts union", () => {
            expectExtract(
                '//node[node[@pt = "lid"] | node[@pt="vnw" and number(@begin) > 5]]',
                [{ name: '$node1', path: '$node/node[@pt = "lid"]', location: location(7) },
                { name: '$node2', path: '$node/node[@pt = "vnw" and number(@begin) > 5]', location: location(27) }]);
        });

        let location = (column: number, line: number = 1, length: number = 4) => {
            return {
                line,
                firstColumn: column,
                lastColumn: column + length
            };
        }

        let expectExtract = (xpath: string, expected: PathVariable[], checkOrdered = true, hasRoot = true) => {
            let rootNode = { name: '$node', path: '*', location: location(2) };
            let result = extractinator.extract(xpath);
            expect(result).toEqual(hasRoot ? [rootNode].concat(expected) : expected, xpath);
            let subPath = xpath.substring('//node['.length, xpath.length - 1);

            if (checkOrdered) {
                xpath = `//node[@cat="smain" and not(.//node[position() < last()][number(@begin) > number(following-sibling::node/@begin)]) and ${subPath}]`;
                let orderedResult = extractinator.extract(xpath);
                expect(orderedResult).toEqual((hasRoot ? [rootNode] : []).concat(expected.map(variable => {
                    return {
                        name: variable.name,
                        path: variable.path,
                        location: location(variable.location.firstColumn + 112)
                    };
                })), xpath);
            }
        }
    });