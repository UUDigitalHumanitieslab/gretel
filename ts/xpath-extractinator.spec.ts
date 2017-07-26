import { XPathExtractinator } from './xpath-extractinator';

describe("XPath Extractinator",
    () => {
        it("Works", () => {
            let extractinator = new XPathExtractinator();
            let result = extractinator.extract('//node');
            console.log(result);
            expect(result).toBeTruthy();
        });
    });