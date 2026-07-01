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

    // Literal integer
    {
        let node = parseSourceStringWithoutErrors('42')
        assert.ok(node.isLiteralIntegerNode())
        assert.strictEqual((node as parseTree.ParseTreeLiteralIntegerNode).value, 42)

        node = parseSourceStringWithoutErrors('2r1010')
        assert.ok(node.isLiteralIntegerNode())
        assert.strictEqual((node as parseTree.ParseTreeLiteralIntegerNode).value, 10)

        node = parseSourceStringWithoutErrors('16rC0DE')
        assert.ok(node.isLiteralIntegerNode())
        assert.strictEqual((node as parseTree.ParseTreeLiteralIntegerNode).value, 49374)
    }

    // Literal float
    {
        let node = parseSourceStringWithoutErrors('42.5')
        assert.ok(node.isLiteralFloatNode())
        assert.strictEqual((node as parseTree.ParseTreeLiteralFloatNode).value, 42.5)

        node = parseSourceStringWithoutErrors('42.5e3')
        assert.ok(node.isLiteralFloatNode())
        assert.strictEqual((node as parseTree.ParseTreeLiteralFloatNode).value, 42.5e3)
    }

}

