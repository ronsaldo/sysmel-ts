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

    // Assignment
    {
        let node = parseSourceStringWithoutErrors('a := 42');
        assert.ok(node.isAssignmentNode());

        let assignmentNode = node as parseTree.ParseTreeAssignmentNode;
        assert.ok(assignmentNode.store.isIdentifierReferenceNode());
        assert.ok(assignmentNode.value.isLiteralIntegerNode());
    }

    // Literal integer
    {
        let node = parseSourceStringWithoutErrors('42');
        assert.ok(node.isLiteralIntegerNode());
        assert.strictEqual((node as parseTree.ParseTreeLiteralIntegerNode).value, 42);

        node = parseSourceStringWithoutErrors('2r1010');
        assert.ok(node.isLiteralIntegerNode());
        assert.strictEqual((node as parseTree.ParseTreeLiteralIntegerNode).value, 10);

        node = parseSourceStringWithoutErrors('16rC0DE');
        assert.ok(node.isLiteralIntegerNode());
        assert.strictEqual((node as parseTree.ParseTreeLiteralIntegerNode).value, 49374);
    }

    // Literal float
    {
        let node = parseSourceStringWithoutErrors('42.5');
        assert.ok(node.isLiteralFloatNode());
        assert.strictEqual((node as parseTree.ParseTreeLiteralFloatNode).value, 42.5);

        node = parseSourceStringWithoutErrors('42.5e3');
        assert.ok(node.isLiteralFloatNode());
        assert.strictEqual((node as parseTree.ParseTreeLiteralFloatNode).value, 42.5e3);
    }

    // Lieral character
    {
        let node = parseSourceStringWithoutErrors("'A'");
        assert.ok(node.isLiteralCharacterNode());
        assert.strictEqual((node as parseTree.ParseTreeLiteralCharacterNode).value, 65);
    }

    // Literal string
    {
        let node = parseSourceStringWithoutErrors('"Hello World"');
        assert.ok(node.isLiteralStringNode());
        assert.strictEqual((node as parseTree.ParseTreeLiteralStringNode).value, 'Hello World');

        node = parseSourceStringWithoutErrors('"Hello \\"World\\""');
        assert.ok(node.isLiteralStringNode());
        assert.strictEqual((node as parseTree.ParseTreeLiteralStringNode).value, 'Hello "World"');
    }

    // Literal symbol identifier
    {
        let node = parseSourceStringWithoutErrors('#symbol');
        assert.ok(node.isLiteralSymbolNode());
        assert.strictEqual((node as parseTree.ParseTreeLiteralSymbolNode).value, 'symbol');
    }

    // Literal symbol keyword
    {
        let node = parseSourceStringWithoutErrors('#keyword:');
        assert.ok(node.isLiteralSymbolNode());
        assert.strictEqual((node as parseTree.ParseTreeLiteralSymbolNode).value, 'keyword:');

        node = parseSourceStringWithoutErrors('#keyword:with:');
        assert.ok(node.isLiteralSymbolNode());
        assert.strictEqual((node as parseTree.ParseTreeLiteralSymbolNode).value, 'keyword:with:');
    }

    // Literal symbol string
    {
        let node = parseSourceStringWithoutErrors('#"Hello World"')
        assert.ok(node.isLiteralSymbolNode());
        assert.strictEqual((node as parseTree.ParseTreeLiteralSymbolNode).value, 'Hello World');

        node = parseSourceStringWithoutErrors('#"Hello \\"World\\""');
        assert.ok(node.isLiteralSymbolNode());
        assert.strictEqual((node as parseTree.ParseTreeLiteralSymbolNode).value, 'Hello "World"');
    }


    // Identifier reference
    {
        let ast = parseSourceStringWithoutErrors('identifier');
        assert.ok(ast.isIdentifierReferenceNode());
        assert.strictEqual((ast as parseTree.ParseTreeIdentifierReferenceNode).symbol, 'identifier');
    }

    // Parenthesis
    {
        let node = parseSourceStringWithoutErrors('(42)');
        assert.ok(node.isLiteralIntegerNode());
        assert.strictEqual((node as parseTree.ParseTreeLiteralIntegerNode).value, 42);
    }

    // Parenthesis operator
    {
        let node = parseSourceStringWithoutErrors('(+)');
        assert.ok(node.isIdentifierReferenceNode());
        assert.strictEqual((node as parseTree.ParseTreeIdentifierReferenceNode).symbol, '+');
    }

    // Empty tuple
    {
        let node = parseSourceStringWithoutErrors('()');
        assert.ok(node.isTupleNode());
        assert.strictEqual((node as parseTree.ParseTreeTupleNode).elements.length, 0);
    }

    // Tuple
    {
        let node = parseSourceStringWithoutErrors('4, 2');
        assert.ok(node.isTupleNode());

        let elements = (node as parseTree.ParseTreeTupleNode).elements;
        assert.strictEqual(elements.length, 2);

        assert.ok(elements[0]?.isLiteralIntegerNode());
        assert.strictEqual((elements[0] as parseTree.ParseTreeLiteralIntegerNode).value, 4);

        assert.ok(elements[1]?.isLiteralIntegerNode());
        assert.strictEqual((elements[1] as parseTree.ParseTreeLiteralIntegerNode).value, 2);
    }

}

