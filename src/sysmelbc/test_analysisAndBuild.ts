import * as parseTree from "./parsetree.js"
import * as parser from "./parser.js"
import * as hir from "./hir.js"
import * as assert from 'assert';
import { getOrMakeEmptySourcePosition } from "./source_code.js";

let context: hir.HIRContext = new hir.HIRContext();

function buildTopLevelSourceString(sourceString: string): hir.HIRFunction {
    let ast = parser.parseSourceString(sourceString)
    assert.ok(new parseTree.ParseTreeParseErrorVisitor().checkAndPrintErrors(ast));

    let builder = context.createTopLevelFunctionBuilder(getOrMakeEmptySourcePosition());
    let result = new hir.AnalysisAndBuildPass(builder).visitDecayedNode(ast);
    if (!builder.isLastTerminator()) {
        builder.hirFunction.dependentFunctionType.resultType = result.getType();
        builder.returnValue(result, getOrMakeEmptySourcePosition())
    }

    builder.finishBuilding(getOrMakeEmptySourcePosition());
    return builder.hirFunction;
}

function printTopLevelFunctionSourceString(sourceString: string): void {
    let topLevelFunction = buildTopLevelSourceString(sourceString);
    console.log(topLevelFunction.fullPrintString())
}

function evaluateTopLevelFunctionSourceString(sourceString: string): hir.HIRValue {
    let topLevelFunction = buildTopLevelSourceString(sourceString);
    return topLevelFunction.evaluateWithArguments([]);
}

function setUp() {
    context = new hir.HIRContext();
}

function tearDown() {
    context.finishPendingAnalysis();
}

export function runTests() {
    // Test empty top level
    {
        setUp();
        let result = evaluateTopLevelFunctionSourceString('');
        assert.ok(result.isConstantLiteralVoidValue());
        tearDown();
    }

    // Sequence
    {
        setUp();
        let value = evaluateTopLevelFunctionSourceString('5 . 42');
        assert.ok(value.isConstantLiteralIntegerValue());
        assert.strictEqual((value as hir.HIRConstantLiteralIntegerValue).value, 42);
        tearDown();
    }

    // Lexical block
    {
        setUp();
        let value = evaluateTopLevelFunctionSourceString('{42}');
        assert.ok(value.isConstantLiteralIntegerValue());
        assert.strictEqual((value as hir.HIRConstantLiteralIntegerValue).value, 42);
        tearDown();
    }

    // Literal integer
    {
        setUp();
        let value = evaluateTopLevelFunctionSourceString('42');
        assert.ok(value.isConstantLiteralIntegerValue());
        assert.strictEqual((value as hir.HIRConstantLiteralIntegerValue).value, 42);
        tearDown();
    }

    // Literal float
    {
        setUp();
        let value = evaluateTopLevelFunctionSourceString('42.5');
        assert.ok(value.isConstantLiteralFloatValue());
        assert.strictEqual((value as hir.HIRConstantLiteralFloatValue).value, 42.5);
        tearDown();
    }

    // Literal character
    {
        setUp();
        let value = evaluateTopLevelFunctionSourceString("'A'");
        assert.ok(value.isConstantLiteralCharacterValue());
        assert.strictEqual((value as hir.HIRConstantLiteralCharacterValue).value, 65);
        tearDown();
    }

    // Literal string
    {
        setUp();
        let value = evaluateTopLevelFunctionSourceString('"Hello World"');
        assert.ok(value.isConstantLiteralStringValue());
        assert.strictEqual((value as hir.HIRConstantLiteralStringValue).value, 'Hello World');
        tearDown();
    }

    // Literal symbol
    {
        setUp();
        let value = evaluateTopLevelFunctionSourceString('#hello');
        assert.ok(value.isConstantLiteralSymbolValue());
        assert.strictEqual((value as hir.HIRConstantLiteralSymbolValue).value, 'hello');
        tearDown();
    }

    // Literal int32
    {
        setUp();
        printTopLevelFunctionSourceString('42i32');
        let value = evaluateTopLevelFunctionSourceString('42i32');
        assert.ok(value.isConstantLiteralIntegerValue());
        assert.strictEqual((value as hir.HIRConstantLiteralIntegerValue).value, 42);
        assert.strictEqual(value.getType(), context.coreTypes.int32Type);
        tearDown();
    }
    

}