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

    // Low precedence binary operator.
    {
        let node = parseSourceStringWithoutErrors('1 ::+ 2');
        assert.ok(node.isMessageSendNode());

        let sendNode = node as parseTree.ParseTreeMessageSendNode;
        assert.ok(sendNode.receiver.isLiteralIntegerNode());
        assert.ok(sendNode.selector.isLiteralSymbolNode());
        assert.strictEqual(sendNode.sendArguments.length, 1);
        assert.ok(sendNode.sendArguments[0]?.isLiteralIntegerNode());
    }

    // Association
    {
        let node = parseSourceStringWithoutErrors('1 : 2');
        assert.ok(node.isAssociationNode());

        let assocNode = node as parseTree.ParseTreeAssociationNode;
        assert.ok(assocNode.key.isLiteralIntegerNode());
        assert.ok(assocNode.value.isLiteralIntegerNode());
    }

    // Binary expression.sequence
    {
        let node = parseSourceStringWithoutErrors('1 + 2');
        assert.ok(node.isBinaryExpressionSequenceNode());

        let binarySequence = node as parseTree.ParseTreeBinaryExpressionSequenceNode;
        assert.strictEqual(binarySequence.operands.length, 3);
        assert.ok(binarySequence.operands[0]?.isLiteralIntegerNode());
        assert.ok(binarySequence.operands[1]?.isLiteralSymbolNode());
        assert.ok(binarySequence.operands[2]?.isLiteralIntegerNode());
    }

    // Binary expression.sequence
    {
        let node = parseSourceStringWithoutErrors('1 + 2 * 3');
        assert.ok(node.isBinaryExpressionSequenceNode());

        let binarySequence = node as parseTree.ParseTreeBinaryExpressionSequenceNode;
        assert.strictEqual(binarySequence.operands.length, 5);
        assert.ok(binarySequence.operands[0]?.isLiteralIntegerNode());
        assert.ok(binarySequence.operands[1]?.isLiteralSymbolNode());
        assert.ok(binarySequence.operands[2]?.isLiteralIntegerNode());
        assert.ok(binarySequence.operands[3]?.isLiteralSymbolNode());
        assert.ok(binarySequence.operands[4]?.isLiteralIntegerNode());
    }

    // Quote
    {
        let node = parseSourceStringWithoutErrors("`'42");
        assert.ok(node.isQuoteNode());

        let quoteNode = node as parseTree.ParseTreeQuoteNode;
        assert.ok(quoteNode.expression.isLiteralIntegerNode());
        assert.strictEqual((quoteNode.expression as parseTree.ParseTreeLiteralIntegerNode).value, 42);
    }

    // QuasiQuote
    {
        let node = parseSourceStringWithoutErrors("``42");
        assert.ok(node.isQuasiQuoteNode());

        let quoteNode = node as parseTree.ParseTreeQuasiQuoteNode;
        assert.ok(quoteNode.expression.isLiteralIntegerNode());
        assert.strictEqual((quoteNode.expression as parseTree.ParseTreeLiteralIntegerNode).value, 42);
    }

    // QuasiUnquote
    {
        let node = parseSourceStringWithoutErrors("`,42");
        assert.ok(node.isQuasiUnquoteNode());

        let unquoteNode = node as parseTree.ParseTreeQuasiUnquoteNode;
        assert.ok(unquoteNode.expression.isLiteralIntegerNode());
        assert.strictEqual((unquoteNode.expression as parseTree.ParseTreeLiteralIntegerNode).value, 42);
    }

    // Splice
    {
        let node = parseSourceStringWithoutErrors("`@42");
        assert.ok(node.isSpliceNode());

        let spliceNode = node as parseTree.ParseTreeSpliceNode;
        assert.ok(spliceNode.expression.isLiteralIntegerNode());
        assert.strictEqual((spliceNode.expression as parseTree.ParseTreeLiteralIntegerNode).value, 42);
    }

}

