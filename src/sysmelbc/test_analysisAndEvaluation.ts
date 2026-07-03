import * as parseTree from "./parsetree.js"
import * as parser from "./parser.js"
import * as hir from "./hir.js"
import * as assert from 'assert';

let context: hir.HIRContext = new hir.HIRContext();

function evaluateTopLevelSourceString(sourceString: string): hir.HIRValue {
    let ast = parser.parseSourceString(sourceString)
    assert.ok(new parseTree.ParseTreeParseErrorVisitor().checkAndPrintErrors(ast));

    let evaluationContext = context.createTopLevelEvaluationContext(ast.sourcePosition.getSourceCode());
    let result = new hir.AnalysisAndEvaluationPass(evaluationContext).visitNode(ast);
    return result as hir.HIRValue;
}

function setUp() {
    context = new hir.HIRContext();
}

export function runTests() {
    // Empty
    {
        setUp();
        let value = evaluateTopLevelSourceString('');
        assert.ok(value.isConstantLiteralVoidValue());
    }

    // Sequence
    {
        setUp();
        let value = evaluateTopLevelSourceString('5 . 42');
        assert.ok(value.isConstantLiteralIntegerValue());
        assert.strictEqual((value as hir.HIRConstantLiteralIntegerValue).value, 42);
    }

    // Lexical block
    {
        setUp();
        let value = evaluateTopLevelSourceString('{42}');
        assert.ok(value.isConstantLiteralIntegerValue());
        assert.strictEqual((value as hir.HIRConstantLiteralIntegerValue).value, 42);
    }
    
    // Literal integer
    {
        setUp();
        let value = evaluateTopLevelSourceString('42');
        assert.ok(value.isConstantLiteralIntegerValue());
        assert.strictEqual((value as hir.HIRConstantLiteralIntegerValue).value, 42);
    }

    // Literal float
    {
        setUp();
        let value = evaluateTopLevelSourceString('42.5');
        assert.ok(value.isConstantLiteralFloatValue());
        assert.strictEqual((value as hir.HIRConstantLiteralFloatValue).value, 42.5);
    }

    // Literal character
    {
        setUp();
        let value = evaluateTopLevelSourceString("'A'");
        assert.ok(value.isConstantLiteralCharacterValue());
        assert.strictEqual((value as hir.HIRConstantLiteralCharacterValue).value, 65);
    }

    // Literal string
    {
        setUp();
        let value = evaluateTopLevelSourceString('"Hello World"');
        assert.ok(value.isConstantLiteralStringValue());
        assert.strictEqual((value as hir.HIRConstantLiteralStringValue).value, 'Hello World');
    }

    // Literal symbol
    {
        setUp();
        let value = evaluateTopLevelSourceString('#hello');
        assert.ok(value.isConstantLiteralSymbolValue());
        assert.strictEqual((value as hir.HIRConstantLiteralSymbolValue).value, 'hello');
    }

    // Package symbols
    {
        let topLevelResult = evaluateTopLevelSourceString('false')
        assert.ok(topLevelResult.isConstantLiteralBooleanValue())
        assert.ok(!(topLevelResult as hir.HIRConstantLiteralBooleanValue).value)

        topLevelResult = evaluateTopLevelSourceString('true')
        assert.ok(topLevelResult.isConstantLiteralBooleanValue())
        assert.ok((topLevelResult as hir.HIRConstantLiteralBooleanValue).value)

        topLevelResult = evaluateTopLevelSourceString('void')
        assert.ok(topLevelResult.isConstantLiteralVoidValue())

        topLevelResult = evaluateTopLevelSourceString('nil')
        assert.ok(topLevelResult.isConstantLiteralNilValue())
    }

    // let with macro
    {
        let topLevelResult = evaluateTopLevelSourceString('let: #x with: 42')
        assert.ok(topLevelResult.isConstantLiteralIntegerValue())
        assert.strictEqual((topLevelResult as hir.HIRConstantLiteralIntegerValue).value, 42);

        topLevelResult = evaluateTopLevelSourceString('let: #x with: 42. x')
        assert.ok(topLevelResult.isConstantLiteralIntegerValue())
        assert.strictEqual((topLevelResult as hir.HIRConstantLiteralIntegerValue).value, 42);
    }

    // If then else
    {
        let topLevelResult = evaluateTopLevelSourceString('if: true then: 1 else: 2')
        assert.ok(topLevelResult.isConstantLiteralIntegerValue());
        assert.strictEqual((topLevelResult as hir.HIRConstantLiteralIntegerValue).value, 1);

        topLevelResult = evaluateTopLevelSourceString('if: false then: 1 else: 2')
        assert.ok(topLevelResult.isConstantLiteralIntegerValue());
        assert.strictEqual((topLevelResult as hir.HIRConstantLiteralIntegerValue).value, 2);
    }

}