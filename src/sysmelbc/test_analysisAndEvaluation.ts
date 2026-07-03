import * as parseTree from "./parsetree.js"
import * as parser from "./parser.js"
import * as hir from "./hir.js"
import * as assert from 'assert';

let context: hir.HIRContext = new hir.HIRContext();

function evaluateTopLevelSourceString(sourceString: string): hir.HIRValue {
    let ast = parser.parseSourceString(sourceString)
    assert.ok(new parseTree.ParseTreeParseErrorVisitor().checkAndPrintErrors(ast));

    let evaluationContext = context.createTopLevelEvaluationContext(ast.sourcePosition.getSourceCode());
    let result = new hir.AnalysisAndEvaluationPass(evaluationContext).visitDecayedNode(ast);
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


    // let mutable with macro
    {
        let topLevelResult = evaluateTopLevelSourceString('let: #x mutableWith: 42')
        assert.ok(topLevelResult.isConstantLiteralIntegerValue())
        assert.strictEqual((topLevelResult as hir.HIRConstantLiteralIntegerValue).value, 42);

        topLevelResult = evaluateTopLevelSourceString('let: #x mutableWith: 42. x := 5. x')
        assert.ok(topLevelResult.isConstantLiteralIntegerValue())
        assert.strictEqual((topLevelResult as hir.HIRConstantLiteralIntegerValue).value, 5);
    }

    // Message send
    {
        let value = evaluateTopLevelSourceString('42 negated')
        assert.ok(value.isConstantLiteralIntegerValue())
        assert.strictEqual((value as hir.HIRConstantLiteralIntegerValue).value, -42);
    }

    // Message send 2
    {
        //let value = evaluateTopLevelSourceString('1 + 2')
        //assert.ok(value.isConstantLiteralIntegerValue())
        //assert.strictEqual((value as hir.HIRConstantLiteralIntegerValue).value, 3);
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

    // While do macro
    {
        let topLevelResult = evaluateTopLevelSourceString('while: false do: {}')
        assert.ok(topLevelResult.isConstantLiteralVoidValue());
    }

    // While do continue with macro
    {
        let topLevelResult = evaluateTopLevelSourceString('while: false do: {} continueWith: ()')
        assert.ok(topLevelResult.isConstantLiteralVoidValue());
    }

    // Do while macro
    {
        let topLevelResult = evaluateTopLevelSourceString('do: {} while: false')
        assert.ok(topLevelResult.isConstantLiteralVoidValue());
    }

    // Do continue with while macro
    {
        let topLevelResult = evaluateTopLevelSourceString('do: {} continueWith: () while: false')
        assert.ok(topLevelResult.isConstantLiteralVoidValue());
    }

    // Association type
    {
        let value = evaluateTopLevelSourceString('Symbol : Integer')
        assert.ok(value.isAssociationType());

        let assocType = value as hir.HIRAssociationType;
        assert.strictEqual(assocType.keyType, context.coreTypes.symbolType);
        assert.strictEqual(assocType.valueType, context.coreTypes.integerType);
    }

    // Association value
    {
        let value = evaluateTopLevelSourceString('#first : 1')
        assert.ok(value.isConstantAssociation());

        let assoc = value as hir.HIRConstantAssociation;
        assert.ok(assoc.key.isConstantLiteralSymbolValue());
        assert.strictEqual((assoc.key as hir.HIRConstantLiteralSymbolValue).value, 'first');

        assert.ok(assoc.value.isConstantLiteralIntegerValue());
        assert.strictEqual((assoc.value as hir.HIRConstantLiteralIntegerValue).value, 1);

        let assocType = value.getType() as hir.HIRAssociationType;
        assert.strictEqual(assocType.keyType, context.coreTypes.symbolType);
        assert.strictEqual(assocType.valueType, context.coreTypes.integerType);
    }

    // Tuple type
    {
        let value = evaluateTopLevelSourceString('Integer, Float, Character')
        assert.ok(value.isTupleType());

        let tupleType = value as hir.HIRTupleType;
        assert.strictEqual(tupleType.elements.length, 3);
        assert.strictEqual(tupleType.elements[0], context.coreTypes.integerType);
        assert.strictEqual(tupleType.elements[1], context.coreTypes.floatType);
        assert.strictEqual(tupleType.elements[2], context.coreTypes.characterType);
    }
   
    // Tuple
    {
        let value = evaluateTopLevelSourceString("1, 2.5, 'A'")
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
    }
}