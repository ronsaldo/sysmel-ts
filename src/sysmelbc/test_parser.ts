import * as parseTree from "./parsetree.js"
import * as parser from "./parser.js"
import * as assert from 'assert';

function parseSourceStringWithoutErrors(sourceString: string): parseTree.ParseTreeNode {
    return parser.parseSourceString(sourceString)
}

export function runTests() {
    // Empty
    {
        let ast = parseSourceStringWithoutErrors('');
        assert.ok(ast.isSequenceNode());
        assert.strictEqual((ast as parseTree.ParseTreeSequenceNode).elements.length, 0);
    }

}
