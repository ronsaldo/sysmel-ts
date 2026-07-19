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
        let value = evaluateTopLevelFunctionSourceString('42i32');
        assert.ok(value.isConstantLiteralIntegerValue());
        assert.strictEqual((value as hir.HIRConstantLiteralIntegerValue).value, 42);
        assert.strictEqual(value.getType(), context.coreTypes.int32Type);
        tearDown();
    }
    
    // Package symbols
    {
        setUp();
        let topLevelResult = evaluateTopLevelFunctionSourceString('false')
        assert.ok(topLevelResult.isConstantLiteralBooleanValue())
        assert.ok(!(topLevelResult as hir.HIRConstantLiteralBooleanValue).value)

        topLevelResult = evaluateTopLevelFunctionSourceString('true')
        assert.ok(topLevelResult.isConstantLiteralBooleanValue())
        assert.ok((topLevelResult as hir.HIRConstantLiteralBooleanValue).value)

        topLevelResult = evaluateTopLevelFunctionSourceString('void')
        assert.ok(topLevelResult.isConstantLiteralVoidValue())

        topLevelResult = evaluateTopLevelFunctionSourceString('nil')
        assert.ok(topLevelResult.isConstantLiteralNilValue())
        tearDown();
    }

    // let with macro
    {
        setUp();
        let topLevelResult = evaluateTopLevelFunctionSourceString('let: #x with: 42')
        assert.ok(topLevelResult.isConstantLiteralIntegerValue())
        assert.strictEqual((topLevelResult as hir.HIRConstantLiteralIntegerValue).value, 42);

        topLevelResult = evaluateTopLevelFunctionSourceString('let: #x with: 42. x')
        assert.ok(topLevelResult.isConstantLiteralIntegerValue())
        assert.strictEqual((topLevelResult as hir.HIRConstantLiteralIntegerValue).value, 42);
        tearDown();
    }
    
    // let mutable with macro
    {
        setUp();
        let topLevelResult = evaluateTopLevelFunctionSourceString('let: #x mutableWith: 42');
        assert.ok(topLevelResult.isConstantLiteralIntegerValue());
        assert.strictEqual((topLevelResult as hir.HIRConstantLiteralIntegerValue).value, 42);

        topLevelResult = evaluateTopLevelFunctionSourceString('let: #x mutableWith: 42. x := 5. x')
        assert.ok(topLevelResult.isConstantLiteralIntegerValue())
        assert.strictEqual((topLevelResult as hir.HIRConstantLiteralIntegerValue).value, 5);
        tearDown();
    }

    // let metabuilder
    {
        setUp();
        let topLevelResult = evaluateTopLevelFunctionSourceString('let x := 42')
        assert.ok(topLevelResult.isConstantLiteralIntegerValue())
        assert.strictEqual((topLevelResult as hir.HIRConstantLiteralIntegerValue).value, 42);

        topLevelResult = evaluateTopLevelFunctionSourceString('let x := 42. x')
        assert.ok(topLevelResult.isConstantLiteralIntegerValue())
        assert.strictEqual((topLevelResult as hir.HIRConstantLiteralIntegerValue).value, 42);
        tearDown();
    }

    // let mutable metabuilder
    {
        setUp();
        let topLevelResult = evaluateTopLevelFunctionSourceString('let x mutable := 42')
        assert.ok(topLevelResult.isConstantLiteralIntegerValue())
        assert.strictEqual((topLevelResult as hir.HIRConstantLiteralIntegerValue).value, 42);

        topLevelResult = evaluateTopLevelFunctionSourceString('let x mutable := 42. x := 5. x')
        assert.ok(topLevelResult.isConstantLiteralIntegerValue())
        assert.strictEqual((topLevelResult as hir.HIRConstantLiteralIntegerValue).value, 5);
        tearDown();
    }

    // Message send
    {
        setUp();
        let value = evaluateTopLevelFunctionSourceString('42 negated')
        assert.ok(value.isConstantLiteralIntegerValue())
        assert.strictEqual((value as hir.HIRConstantLiteralIntegerValue).value, -42);
        tearDown();
    }

    // Message send 2
    {
        setUp();
        let value = evaluateTopLevelFunctionSourceString('1 + 2')
        assert.ok(value.isConstantLiteralIntegerValue())
        assert.strictEqual((value as hir.HIRConstantLiteralIntegerValue).value, 3);

        value = evaluateTopLevelFunctionSourceString('1 - 2')
        assert.ok(value.isConstantLiteralIntegerValue())
        assert.strictEqual((value as hir.HIRConstantLiteralIntegerValue).value, -1);

        value = evaluateTopLevelFunctionSourceString('2 * 3')
        assert.ok(value.isConstantLiteralIntegerValue())
        assert.strictEqual((value as hir.HIRConstantLiteralIntegerValue).value, 6);

        value = evaluateTopLevelFunctionSourceString('6 // 3')
        assert.ok(value.isConstantLiteralIntegerValue())
        assert.strictEqual((value as hir.HIRConstantLiteralIntegerValue).value, 2);

        value = evaluateTopLevelFunctionSourceString('5 // 3')
        assert.ok(value.isConstantLiteralIntegerValue())
        assert.strictEqual((value as hir.HIRConstantLiteralIntegerValue).value, 1);

        value = evaluateTopLevelFunctionSourceString('5 % 3')
        assert.ok(value.isConstantLiteralIntegerValue())
        assert.strictEqual((value as hir.HIRConstantLiteralIntegerValue).value, 2);

        value = evaluateTopLevelFunctionSourceString('2 = 2')
        assert.ok(value.isConstantLiteralBooleanValue())
        assert.strictEqual(value.evaluateAsBoolean(), true);

        value = evaluateTopLevelFunctionSourceString('2 ~= 2')
        assert.ok(value.isConstantLiteralBooleanValue())
        assert.strictEqual(value.evaluateAsBoolean(), false);

        value = evaluateTopLevelFunctionSourceString('1 < 2')
        assert.ok(value.isConstantLiteralBooleanValue())
        assert.strictEqual(value.evaluateAsBoolean(), true);

        value = evaluateTopLevelFunctionSourceString('1 <= 2')
        assert.ok(value.isConstantLiteralBooleanValue())
        assert.strictEqual(value.evaluateAsBoolean(), true);

        value = evaluateTopLevelFunctionSourceString('1 > 2')
        assert.ok(value.isConstantLiteralBooleanValue())
        assert.strictEqual(value.evaluateAsBoolean(), false);

        value = evaluateTopLevelFunctionSourceString('1 >= 2')
        assert.ok(value.isConstantLiteralBooleanValue())
        assert.strictEqual(value.evaluateAsBoolean(), false);
        tearDown();
    }

    // Message send 3
    {
        setUp();
        let value = evaluateTopLevelFunctionSourceString('42.0 negated');
        assert.ok(value.isConstantLiteralFloatValue());
        assert.strictEqual((value as hir.HIRConstantLiteralFloatValue).value, -42);

        value = evaluateTopLevelFunctionSourceString('9.0 sqrt');
        assert.ok(value.isConstantLiteralFloatValue());
        assert.strictEqual((value as hir.HIRConstantLiteralFloatValue).value, 3);

        value = evaluateTopLevelFunctionSourceString('1.0 + 2.0');
        assert.ok(value.isConstantLiteralFloatValue());
        assert.strictEqual((value as hir.HIRConstantLiteralFloatValue).value, 3);

        value = evaluateTopLevelFunctionSourceString('1.0 - 2.0');
        assert.ok(value.isConstantLiteralFloatValue());
        assert.strictEqual((value as hir.HIRConstantLiteralFloatValue).value, -1);

        value = evaluateTopLevelFunctionSourceString('2.0 * 3.0');
        assert.ok(value.isConstantLiteralFloatValue());
        assert.strictEqual((value as hir.HIRConstantLiteralFloatValue).value, 6);

        value = evaluateTopLevelFunctionSourceString('6.0 / 3.0');
        assert.ok(value.isConstantLiteralFloatValue());
        assert.strictEqual((value as hir.HIRConstantLiteralFloatValue).value, 2);

        value = evaluateTopLevelFunctionSourceString('2.0 = 2.0');
        assert.ok(value.isConstantLiteralBooleanValue());
        assert.strictEqual(value.evaluateAsBoolean(), true);

        value = evaluateTopLevelFunctionSourceString('2.0 ~= 2.0');
        assert.ok(value.isConstantLiteralBooleanValue());
        assert.strictEqual(value.evaluateAsBoolean(), false);

        value = evaluateTopLevelFunctionSourceString('1.0 < 2.0');
        assert.ok(value.isConstantLiteralBooleanValue());
        assert.strictEqual(value.evaluateAsBoolean(), true);

        value = evaluateTopLevelFunctionSourceString('1.0 <= 2.0');
        assert.ok(value.isConstantLiteralBooleanValue());
        assert.strictEqual(value.evaluateAsBoolean(), true);

        value = evaluateTopLevelFunctionSourceString('1.0 > 2.0');
        assert.ok(value.isConstantLiteralBooleanValue());
        assert.strictEqual(value.evaluateAsBoolean(), false);

        value = evaluateTopLevelFunctionSourceString('1.0 >= 2.0');
        assert.ok(value.isConstantLiteralBooleanValue());
        assert.strictEqual(value.evaluateAsBoolean(), false);
        tearDown();
    }

    // Message send cascade
    {
        setUp();
        let value = evaluateTopLevelFunctionSourceString('1.0 + 2.0; yourself');
        assert.ok(value.isConstantLiteralFloatValue());
        assert.strictEqual((value as hir.HIRConstantLiteralFloatValue).value, 1.0);
        tearDown();
    }

    // If then else
    {
        setUp();
        let topLevelResult = evaluateTopLevelFunctionSourceString('if: true then: 1 else: 2');
        assert.ok(topLevelResult.isConstantLiteralIntegerValue());
        assert.strictEqual((topLevelResult as hir.HIRConstantLiteralIntegerValue).value, 1);

        topLevelResult = evaluateTopLevelFunctionSourceString('if: false then: 1 else: 2');
        assert.ok(topLevelResult.isConstantLiteralIntegerValue());
        assert.strictEqual((topLevelResult as hir.HIRConstantLiteralIntegerValue).value, 2);

        topLevelResult = evaluateTopLevelFunctionSourceString('if: false then: 1');
        assert.ok(topLevelResult.isConstantLiteralVoidValue());

        topLevelResult = evaluateTopLevelFunctionSourceString('if: true then: 1');
        assert.ok(topLevelResult.isConstantLiteralVoidValue());

        tearDown();
    }

    // While do macro
    {
        let topLevelResult = evaluateTopLevelFunctionSourceString('while: false do: {}');
        assert.ok(topLevelResult.isConstantLiteralVoidValue());
    }
}