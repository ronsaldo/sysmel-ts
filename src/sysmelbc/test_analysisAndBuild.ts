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

    // Function type
    {
        let value = evaluateTopLevelFunctionSourceString('{:(Integer)x :: Integer}');
        assert.ok(value.isDependentFunctionType());
        
        let functionType = value as hir.HIRDependentFunctionType;
        assert.strictEqual(functionType.functionArguments.length, 1);

        let argument = functionType.functionArguments[0] as hir.HIRArgument;
        assert.strictEqual(argument.name, 'x');
        assert.strictEqual(argument.type, context.coreTypes.integerType);
        assert.strictEqual(functionType.resultType, context.coreTypes.integerType);

        let simplifiedType = functionType.asSimplifiedType();
        assert.ok(simplifiedType.isSimpleFunctionType());
        
        let simplifiedFunctionType = simplifiedType as hir.HIRSimpleFunctionType;
        assert.strictEqual(simplifiedFunctionType.argumentTypes.length, 1);
        assert.strictEqual(simplifiedFunctionType.argumentTypes[0], context.coreTypes.integerType);
        assert.strictEqual(simplifiedFunctionType.resultType, context.coreTypes.integerType);
    }

    // Function
    {
        setUp();
        let functionValue = evaluateTopLevelFunctionSourceString('{:(Integer)x :: Integer | x}');
        assert.ok(functionValue.isFunction())
        let result = functionValue.evaluateWithArguments([new hir.HIRConstantLiteralIntegerValue(42, context.coreTypes.integerType, getOrMakeEmptySourcePosition())]);
        assert.ok(result.isConstantLiteralIntegerValue());
        assert.strictEqual(result.evaluateAsInteger(), 42);

        functionValue = evaluateTopLevelFunctionSourceString('{:(Integer)x :: Integer | x negated}');
        assert.ok(functionValue.isFunction())
        result = functionValue.evaluateWithArguments([new hir.HIRConstantLiteralIntegerValue(42, context.coreTypes.integerType, getOrMakeEmptySourcePosition())]);
        assert.ok(result.isConstantLiteralIntegerValue());
        assert.strictEqual(result.evaluateAsInteger(), -42);

        tearDown();
    }

    // Function capture
    {
        setUp();

        let closureValue = evaluateTopLevelFunctionSourceString('let x mutable := 42. {:: Integer | x := x + 1 }') as hir.HIRFunctionClosure;
        assert.ok(closureValue.isFunctionClosure());
        //console.log(closureValue.hirFunction.fullPrintString());
        
        let result = closureValue.evaluateWithArguments([]);
        assert.ok(result.isConstantLiteralIntegerValue());
        assert.strictEqual(result.evaluateAsInteger(), 43);

        result = closureValue.evaluateWithArguments([]);
        assert.ok(result.isConstantLiteralIntegerValue());
        assert.strictEqual(result.evaluateAsInteger(), 44);

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
        setUp();
        let topLevelResult = evaluateTopLevelFunctionSourceString('while: false do: {}');
        assert.ok(topLevelResult.isConstantLiteralVoidValue());
        tearDown();
    }

    // While do continue with macro
    {
        setUp();
        let topLevelResult = evaluateTopLevelFunctionSourceString('while: false do: {} continueWith: {}')
        assert.ok(topLevelResult.isConstantLiteralVoidValue());
        tearDown();
    }

    // Do while macro
    {
        setUp();
        let topLevelResult = evaluateTopLevelFunctionSourceString('do: {} while: false')
        assert.ok(topLevelResult.isConstantLiteralVoidValue());
        tearDown();
    }

    // Do continue with while macro
    {
        setUp();
        let topLevelResult = evaluateTopLevelFunctionSourceString('do: {} continueWith: {} while: false')
        assert.ok(topLevelResult.isConstantLiteralVoidValue());
        tearDown();
    }

    // Return
    {
        setUp();
        let topLevelResult = evaluateTopLevelFunctionSourceString('return: 42. 45')
        assert.ok(topLevelResult.isConstantLiteralIntegerValue());
        assert.strictEqual((topLevelResult as hir.HIRConstantLiteralIntegerValue).value, 42);
        tearDown();
    }

    // Association type
    {
        setUp();
        let value = evaluateTopLevelFunctionSourceString('Symbol : Integer')
        assert.ok(value.isAssociationType());

        let assocType = value as hir.HIRAssociationType;
        assert.strictEqual(assocType.keyType, context.coreTypes.symbolType);
        assert.strictEqual(assocType.valueType, context.coreTypes.integerType);
        tearDown();
    }

    // Association value
    {
        setUp();
        let value = evaluateTopLevelFunctionSourceString('#first : 1')
        assert.ok(value.isConstantAssociation());

        let assoc = value as hir.HIRConstantAssociation;
        assert.ok(assoc.key.isConstantLiteralSymbolValue());
        assert.strictEqual((assoc.key as hir.HIRConstantLiteralSymbolValue).value, 'first');

        assert.ok(assoc.value.isConstantLiteralIntegerValue());
        assert.strictEqual((assoc.value as hir.HIRConstantLiteralIntegerValue).value, 1);

        let assocType = value.getType() as hir.HIRAssociationType;
        assert.strictEqual(assocType.keyType, context.coreTypes.symbolType);
        assert.strictEqual(assocType.valueType, context.coreTypes.integerType);
        tearDown();
    }

    // Tuple type
    {
        setUp();
        let value = evaluateTopLevelFunctionSourceString('Integer, Float, Character')
        assert.ok(value.isTupleType());

        let tupleType = value as hir.HIRTupleType;
        assert.strictEqual(tupleType.elements.length, 3);
        assert.strictEqual(tupleType.elements[0], context.coreTypes.integerType);
        assert.strictEqual(tupleType.elements[1], context.coreTypes.floatType);
        assert.strictEqual(tupleType.elements[2], context.coreTypes.characterType);
        tearDown();
    }

    // Tuple
    {
        setUp();
        let value = evaluateTopLevelFunctionSourceString("1, 2.5, 'A'")
        assert.ok(value.isConstantTuple());

        let tuple = value as hir.HIRConstantTuple;
        assert.ok(tuple.elements[0]?.isConstantLiteralIntegerValue());
        assert.strictEqual((tuple.elements[0] as hir.HIRConstantLiteralIntegerValue).value, 1);

        assert.ok(tuple.elements[1]?.isConstantLiteralFloatValue());
        assert.strictEqual((tuple.elements[1] as hir.HIRConstantLiteralFloatValue).value, 2.5);

        assert.ok(tuple.elements[2]?.isConstantLiteralCharacterValue());
        assert.strictEqual((tuple.elements[2] as hir.HIRConstantLiteralCharacterValue).value, 65);

        let tupleType = value.getType() as hir.HIRTupleType;
        assert.strictEqual(tupleType.elements.length, 3);
        assert.strictEqual(tupleType.elements[0], context.coreTypes.integerType);
        assert.strictEqual(tupleType.elements[1], context.coreTypes.floatType);
        assert.strictEqual(tupleType.elements[2], context.coreTypes.characterType);
        tearDown();
    }

    // Simple function type
    {
        setUp();
        let simpleFunctionTypeValue = evaluateTopLevelFunctionSourceString('(Integer) => Integer');
        assert.ok(simpleFunctionTypeValue.isSimpleFunctionType());
        let simpleFunctionType = simpleFunctionTypeValue as hir.HIRSimpleFunctionType;
        assert.strictEqual(simpleFunctionType.argumentTypes.length, 1);
        assert.strictEqual(simpleFunctionType.argumentTypes[0], context.coreTypes.integerType);
        assert.strictEqual(simpleFunctionType.resultType, context.coreTypes.integerType);

        simpleFunctionTypeValue = evaluateTopLevelFunctionSourceString('(Integer, Integer) => Integer');
        assert.ok(simpleFunctionTypeValue.isSimpleFunctionType());
        simpleFunctionType = simpleFunctionTypeValue as hir.HIRSimpleFunctionType;
        assert.strictEqual(simpleFunctionType.argumentTypes.length, 2);
        assert.strictEqual(simpleFunctionType.argumentTypes[0], context.coreTypes.integerType);
        assert.strictEqual(simpleFunctionType.argumentTypes[1], context.coreTypes.integerType);
        assert.strictEqual(simpleFunctionType.resultType, context.coreTypes.integerType);
        tearDown();
    }

    // Runtime error
    {
        setUp();
        assert.throws(() => evaluateTopLevelFunctionSourceString('error: "Test Error"'))
        tearDown();
    }

    // Assertion
    {
        setUp();
        evaluateTopLevelFunctionSourceString('assert: true');
        assert.throws(() => evaluateTopLevelFunctionSourceString('assert: false'))
        tearDown();
    }

    // Boolean not
    {
        setUp();
        let value = evaluateTopLevelFunctionSourceString("false not")
        assert.ok(value.isConstantLiteralBooleanValue());
        assert.ok(value.evaluateAsBoolean());

        value = evaluateTopLevelFunctionSourceString("true not")
        assert.ok(value.isConstantLiteralBooleanValue());
        assert.ok(!value.evaluateAsBoolean());
        tearDown();
    }

    // Boolean and
    {
        setUp();
        let value = evaluateTopLevelFunctionSourceString("false && false")
        assert.ok(value.isConstantLiteralBooleanValue());
        assert.ok(!value.evaluateAsBoolean());

        value = evaluateTopLevelFunctionSourceString("false && true")
        assert.ok(value.isConstantLiteralBooleanValue());
        assert.ok(!value.evaluateAsBoolean());

        value = evaluateTopLevelFunctionSourceString("true && false")
        assert.ok(value.isConstantLiteralBooleanValue());
        assert.ok(!value.evaluateAsBoolean());

        value = evaluateTopLevelFunctionSourceString("true && true")
        assert.ok(value.isConstantLiteralBooleanValue());
        assert.ok(value.evaluateAsBoolean());
        tearDown();
    }

    // Boolean or
    {
        setUp();
        let value = evaluateTopLevelFunctionSourceString("false || false")
        assert.ok(value.isConstantLiteralBooleanValue());
        assert.ok(!value.evaluateAsBoolean());

        value = evaluateTopLevelFunctionSourceString("false || true")
        assert.ok(value.isConstantLiteralBooleanValue());
        assert.ok(value.evaluateAsBoolean());

        value = evaluateTopLevelFunctionSourceString("true || false")
        assert.ok(value.isConstantLiteralBooleanValue());
        assert.ok(value.evaluateAsBoolean());

        value = evaluateTopLevelFunctionSourceString("true || true")
        assert.ok(value.isConstantLiteralBooleanValue());
        assert.ok(value.evaluateAsBoolean());
        tearDown();
    }
}