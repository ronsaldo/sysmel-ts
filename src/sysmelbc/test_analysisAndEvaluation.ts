import * as parseTree from "./parsetree.js"
import * as parser from "./parser.js"
import * as hir from "./hir.js"
import * as assert from 'assert';
import { getOrMakeEmptySourcePosition } from "./source_code.js";

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

function tearDown() {
    context.finishPendingAnalysis();
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

    // Literal int32
    {
        setUp();
        let value = evaluateTopLevelSourceString('42i32');
        assert.ok(value.isConstantLiteralIntegerValue());
        assert.strictEqual((value as hir.HIRConstantLiteralIntegerValue).value, 42);
        assert.strictEqual(value.getType(), context.coreTypes.int32Type);
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

    // let metabuilder
    {
        let topLevelResult = evaluateTopLevelSourceString('let x := 42')
        assert.ok(topLevelResult.isConstantLiteralIntegerValue())
        assert.strictEqual((topLevelResult as hir.HIRConstantLiteralIntegerValue).value, 42);

        topLevelResult = evaluateTopLevelSourceString('let x := 42. x')
        assert.ok(topLevelResult.isConstantLiteralIntegerValue())
        assert.strictEqual((topLevelResult as hir.HIRConstantLiteralIntegerValue).value, 42);
    }

    // let mutable metabuilder
    {
        let topLevelResult = evaluateTopLevelSourceString('let x mutable := 42')
        assert.ok(topLevelResult.isConstantLiteralIntegerValue())
        assert.strictEqual((topLevelResult as hir.HIRConstantLiteralIntegerValue).value, 42);

        topLevelResult = evaluateTopLevelSourceString('let x mutable := 42. x := 5. x')
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
        let value = evaluateTopLevelSourceString('1 + 2')
        assert.ok(value.isConstantLiteralIntegerValue())
        assert.strictEqual((value as hir.HIRConstantLiteralIntegerValue).value, 3);

        value = evaluateTopLevelSourceString('1 - 2')
        assert.ok(value.isConstantLiteralIntegerValue())
        assert.strictEqual((value as hir.HIRConstantLiteralIntegerValue).value, -1);

        value = evaluateTopLevelSourceString('2 * 3')
        assert.ok(value.isConstantLiteralIntegerValue())
        assert.strictEqual((value as hir.HIRConstantLiteralIntegerValue).value, 6);

        value = evaluateTopLevelSourceString('6 // 3')
        assert.ok(value.isConstantLiteralIntegerValue())
        assert.strictEqual((value as hir.HIRConstantLiteralIntegerValue).value, 2);

        value = evaluateTopLevelSourceString('5 // 3')
        assert.ok(value.isConstantLiteralIntegerValue())
        assert.strictEqual((value as hir.HIRConstantLiteralIntegerValue).value, 1);

        value = evaluateTopLevelSourceString('5 % 3')
        assert.ok(value.isConstantLiteralIntegerValue())
        assert.strictEqual((value as hir.HIRConstantLiteralIntegerValue).value, 2);

        value = evaluateTopLevelSourceString('2 = 2')
        assert.ok(value.isConstantLiteralBooleanValue())
        assert.strictEqual(value.evaluateAsBoolean(), true);

        value = evaluateTopLevelSourceString('2 ~= 2')
        assert.ok(value.isConstantLiteralBooleanValue())
        assert.strictEqual(value.evaluateAsBoolean(), false);

        value = evaluateTopLevelSourceString('1 < 2')
        assert.ok(value.isConstantLiteralBooleanValue())
        assert.strictEqual(value.evaluateAsBoolean(), true);

        value = evaluateTopLevelSourceString('1 <= 2')
        assert.ok(value.isConstantLiteralBooleanValue())
        assert.strictEqual(value.evaluateAsBoolean(), true);

        value = evaluateTopLevelSourceString('1 > 2')
        assert.ok(value.isConstantLiteralBooleanValue())
        assert.strictEqual(value.evaluateAsBoolean(), false);

        value = evaluateTopLevelSourceString('1 >= 2')
        assert.ok(value.isConstantLiteralBooleanValue())
        assert.strictEqual(value.evaluateAsBoolean(), false);
    }

    // Message send 3
    {
        let value = evaluateTopLevelSourceString('42.0 negated')
        assert.ok(value.isConstantLiteralFloatValue())
        assert.strictEqual((value as hir.HIRConstantLiteralFloatValue).value, -42);

        value = evaluateTopLevelSourceString('9.0 sqrt')
        assert.ok(value.isConstantLiteralFloatValue())
        assert.strictEqual((value as hir.HIRConstantLiteralFloatValue).value, 3);

        value = evaluateTopLevelSourceString('1.0 + 2.0')
        assert.ok(value.isConstantLiteralFloatValue())
        assert.strictEqual((value as hir.HIRConstantLiteralFloatValue).value, 3);

        value = evaluateTopLevelSourceString('1.0 - 2.0')
        assert.ok(value.isConstantLiteralFloatValue())
        assert.strictEqual((value as hir.HIRConstantLiteralFloatValue).value, -1);

        value = evaluateTopLevelSourceString('2.0 * 3.0')
        assert.ok(value.isConstantLiteralFloatValue())
        assert.strictEqual((value as hir.HIRConstantLiteralFloatValue).value, 6);

        value = evaluateTopLevelSourceString('6.0 / 3.0')
        assert.ok(value.isConstantLiteralFloatValue())
        assert.strictEqual((value as hir.HIRConstantLiteralFloatValue).value, 2);

        value = evaluateTopLevelSourceString('2.0 = 2.0')
        assert.ok(value.isConstantLiteralBooleanValue())
        assert.strictEqual(value.evaluateAsBoolean(), true);

        value = evaluateTopLevelSourceString('2.0 ~= 2.0')
        assert.ok(value.isConstantLiteralBooleanValue())
        assert.strictEqual(value.evaluateAsBoolean(), false);

        value = evaluateTopLevelSourceString('1.0 < 2.0')
        assert.ok(value.isConstantLiteralBooleanValue())
        assert.strictEqual(value.evaluateAsBoolean(), true);

        value = evaluateTopLevelSourceString('1.0 <= 2.0')
        assert.ok(value.isConstantLiteralBooleanValue())
        assert.strictEqual(value.evaluateAsBoolean(), true);

        value = evaluateTopLevelSourceString('1.0 > 2.0')
        assert.ok(value.isConstantLiteralBooleanValue())
        assert.strictEqual(value.evaluateAsBoolean(), false);

        value = evaluateTopLevelSourceString('1.0 >= 2.0')
        assert.ok(value.isConstantLiteralBooleanValue())
        assert.strictEqual(value.evaluateAsBoolean(), false);
    }

    // Message send cascade
    {
        let value = evaluateTopLevelSourceString('1.0 + 2.0; yourself')
        assert.ok(value.isConstantLiteralFloatValue())
        assert.strictEqual((value as hir.HIRConstantLiteralFloatValue).value, 1.0);
    }

    // Function type
    {
        let value = evaluateTopLevelSourceString('{:(Integer)x :: Integer}');
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
        let functionValue = evaluateTopLevelSourceString('{:(Integer)x :: Integer | x}');
        assert.ok(functionValue.isFunction())
        let result = functionValue.evaluateWithArguments([new hir.HIRConstantLiteralIntegerValue(42, context.coreTypes.integerType, getOrMakeEmptySourcePosition())]);
        assert.ok(result.isConstantLiteralIntegerValue());
        assert.strictEqual(result.evaluateAsInteger(), 42);

        functionValue = evaluateTopLevelSourceString('{:(Integer)x :: Integer | x negated}');
        assert.ok(functionValue.isFunction())
        result = functionValue.evaluateWithArguments([new hir.HIRConstantLiteralIntegerValue(42, context.coreTypes.integerType, getOrMakeEmptySourcePosition())]);
        assert.ok(result.isConstantLiteralIntegerValue());
        assert.strictEqual(result.evaluateAsInteger(), -42);

        tearDown();
    }

    // Function metabuilder
    {
        setUp();

        let functionValue = evaluateTopLevelSourceString('function two() => Integer := 2');
        assert.ok(functionValue.isFunction())
        let result = functionValue.evaluateWithArguments([]);
        assert.ok(result.isConstantLiteralIntegerValue());
        assert.strictEqual(result.evaluateAsInteger(), 2);

        tearDown();
    }

    // Twice function
    {
        setUp();

        let functionValue = evaluateTopLevelSourceString('function twice(v: Integer) => Integer := v + v.');
        assert.ok(functionValue.isFunction())
        let result = functionValue.evaluateWithArguments([new hir.HIRConstantLiteralIntegerValue(42, context.coreTypes.integerType, getOrMakeEmptySourcePosition())])
        assert.ok(result.isConstantLiteralIntegerValue());
        assert.strictEqual(result.evaluateAsInteger(), 84);

        tearDown();
    }

    // Sum integer function
    {
        setUp();

        let functionValue = evaluateTopLevelSourceString('function sumInteger(a: Integer. b: Integer) => Integer := a + b.');
        assert.ok(functionValue.isFunction())
        let result = functionValue.evaluateWithArguments([
            new hir.HIRConstantLiteralIntegerValue(42, context.coreTypes.integerType, getOrMakeEmptySourcePosition()),
            new hir.HIRConstantLiteralIntegerValue(4, context.coreTypes.integerType, getOrMakeEmptySourcePosition()),])
        assert.ok(result.isConstantLiteralIntegerValue());
        assert.strictEqual(result.evaluateAsInteger(), 46);

        tearDown();
    }

    // public Sum integer function
    {
        setUp();

        let functionValue = evaluateTopLevelSourceString('public function sumInteger(a: Integer. b: Integer) => Integer := a + b.');
        assert.ok(functionValue.isFunction())
        let result = functionValue.evaluateWithArguments([
            new hir.HIRConstantLiteralIntegerValue(42, context.coreTypes.integerType, getOrMakeEmptySourcePosition()),
            new hir.HIRConstantLiteralIntegerValue(4, context.coreTypes.integerType, getOrMakeEmptySourcePosition()),])
        assert.ok(result.isConstantLiteralIntegerValue());
        assert.strictEqual(result.evaluateAsInteger(), 46);

        assert.strictEqual(functionValue, context.corePackage.lookSymbolRecursivelyOrNone('sumInteger'));

        tearDown();
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

    // Simple function type
    {
        let simpleFunctionTypeValue = evaluateTopLevelSourceString('(Integer) => Integer');
        assert.ok(simpleFunctionTypeValue.isSimpleFunctionType());
        let simpleFunctionType = simpleFunctionTypeValue as hir.HIRSimpleFunctionType;
        assert.strictEqual(simpleFunctionType.argumentTypes.length, 1);
        assert.strictEqual(simpleFunctionType.argumentTypes[0], context.coreTypes.integerType);
        assert.strictEqual(simpleFunctionType.resultType, context.coreTypes.integerType);

        simpleFunctionTypeValue = evaluateTopLevelSourceString('(Integer, Integer) => Integer');
        assert.ok(simpleFunctionTypeValue.isSimpleFunctionType());
        simpleFunctionType = simpleFunctionTypeValue as hir.HIRSimpleFunctionType;
        assert.strictEqual(simpleFunctionType.argumentTypes.length, 2);
        assert.strictEqual(simpleFunctionType.argumentTypes[0], context.coreTypes.integerType);
        assert.strictEqual(simpleFunctionType.argumentTypes[1], context.coreTypes.integerType);
        assert.strictEqual(simpleFunctionType.resultType, context.coreTypes.integerType);
    }

    // Runtime error
    {
        assert.throws(() => evaluateTopLevelSourceString('error: "Test Error"'))
    }

    // Assertion
    {
        evaluateTopLevelSourceString('assert: true');
        assert.throws(() => evaluateTopLevelSourceString('assert: false'))
    }

    // Boolean not
    {
        let value = evaluateTopLevelSourceString("false not")
        assert.ok(value.isConstantLiteralBooleanValue());
        assert.ok(value.evaluateAsBoolean());

        value = evaluateTopLevelSourceString("true not")
        assert.ok(value.isConstantLiteralBooleanValue());
        assert.ok(!value.evaluateAsBoolean());
    }

    // Boolean and
    {
        let value = evaluateTopLevelSourceString("false && false")
        assert.ok(value.isConstantLiteralBooleanValue());
        assert.ok(!value.evaluateAsBoolean());

        value = evaluateTopLevelSourceString("false && true")
        assert.ok(value.isConstantLiteralBooleanValue());
        assert.ok(!value.evaluateAsBoolean());

        value = evaluateTopLevelSourceString("true && false")
        assert.ok(value.isConstantLiteralBooleanValue());
        assert.ok(!value.evaluateAsBoolean());

        value = evaluateTopLevelSourceString("true && true")
        assert.ok(value.isConstantLiteralBooleanValue());
        assert.ok(value.evaluateAsBoolean());
    }

    // Boolean or
    {
        let value = evaluateTopLevelSourceString("false || false")
        assert.ok(value.isConstantLiteralBooleanValue());
        assert.ok(!value.evaluateAsBoolean());

        value = evaluateTopLevelSourceString("false || true")
        assert.ok(value.isConstantLiteralBooleanValue());
        assert.ok(value.evaluateAsBoolean());

        value = evaluateTopLevelSourceString("true || false")
        assert.ok(value.isConstantLiteralBooleanValue());
        assert.ok(value.evaluateAsBoolean());

        value = evaluateTopLevelSourceString("true || true")
        assert.ok(value.isConstantLiteralBooleanValue());
        assert.ok(value.evaluateAsBoolean());
    }

    // String size
    {
        let value = evaluateTopLevelSourceString('"Hello World" size')
        assert.ok(value.isConstantLiteralIntegerValue());
        assert.strictEqual(value.evaluateAsInteger(), 11);

        value = evaluateTopLevelSourceString('"Hello World" at: 1sz')
        assert.ok(value.isConstantLiteralCharacterValue());
        assert.strictEqual(value.evaluateAsInteger(), 101);
    }

    // Enum
    {
        let value = evaluateTopLevelSourceString('enum MyEnum baseType: Integer values: #{First: 1. Second: 2. Third:}')
        assert.ok(value.isEnumType());

        let enumType = value as hir.HIREnumType;
        assert.strictEqual(3, enumType.values.length);

        let enumValue = enumType.values[0] as hir.HIRConstantEnum;
        assert.strictEqual('First', enumValue.name);
        assert.strictEqual(1, enumValue.value.evaluateAsInteger());

        enumValue = enumType.values[1] as hir.HIRConstantEnum;
        assert.strictEqual('Second', enumValue.name);
        assert.strictEqual(2, enumValue.value.evaluateAsInteger());

        enumValue = enumType.values[2] as hir.HIRConstantEnum;
        assert.strictEqual('Third', enumValue.name);
        assert.strictEqual(3, enumValue.value.evaluateAsInteger());
    }

    // Enum access
    {
        let value = evaluateTopLevelSourceString('enum MyEnum baseType: Integer values: #{First: 1. Second: 2. Third:}. MyEnum First')
        assert.ok(value.isConstantEnum());

        let enumValue = value as hir.HIRConstantEnum;
        assert.strictEqual('First', enumValue.name);
        assert.strictEqual(1, enumValue.value.evaluateAsInteger());
    }

    // Enum value access
    {
        let value = evaluateTopLevelSourceString('enum MyEnum baseType: Integer values: #{First: 1. Second: 2. Third:}. MyEnum First value')
        assert.ok(value.isConstantLiteralIntegerValue());
        assert.strictEqual(1, value.evaluateAsInteger());
    }

    // Enum make value
    {
        let value = evaluateTopLevelSourceString('enum MyEnum baseType: Integer values: #{First: 1. Second: 2. Third:}. MyEnum value: 2')
        assert.ok(value.isConstantEnum());

        let enumValue = value as hir.HIRConstantEnum;
        assert.strictEqual(null, enumValue.name);
        assert.strictEqual(2, enumValue.value.evaluateAsInteger());
    }

    // Enum function access
    {
        let value = evaluateTopLevelSourceString('enum MyEnum baseType: Integer values: #{First: 1. Second: 2. Third:}. {:: MyEnum | MyEnum First} ()')
        assert.ok(value.isConstantEnum());
 
        let enumValue = value as hir.HIRConstantEnum;
        assert.strictEqual('First', enumValue.name);
        assert.strictEqual(1, enumValue.value.evaluateAsInteger());
    }

    // Enum function value access
    {
        let value = evaluateTopLevelSourceString('enum MyEnum baseType: Integer values: #{First: 1. Second: 2. Third:}. {:(MyEnum)e :: Integer | e value} (MyEnum Second)')
        assert.ok(value.isConstantLiteralIntegerValue());
        assert.strictEqual(2, value.evaluateAsInteger());
    }

    // Enum function make value access
    {
        let value = evaluateTopLevelSourceString('enum MyEnum baseType: Integer values: #{First: 1. Second: 2. Third:}. {:(Integer)x :: MyEnum | MyEnum value: x} (2)')
        assert.ok(value.isConstantEnum());

        let enumConstant = value as hir.HIRConstantEnum;
        assert.strictEqual(2, enumConstant.value.evaluateAsInteger());
    }

    // Class accesses
    {
        let classClass = evaluateTopLevelSourceString('Class');
        assert.ok(classClass.isClass());

        let value = evaluateTopLevelSourceString('ProtoObject');
        assert.ok(value.isClass());

        let clazz = value as hir.HIRClass;
        assert.ok(clazz.metaClass.isMetaclass());

        let metaClass = clazz.metaClass as hir.HIRMetaclass;
        assert.ok(metaClass.superclass === classClass);
        assert.ok(metaClass.metaclassType?.isClass());
    }

    // Empty class
    {
        setUp();
        
        let result = evaluateTopLevelSourceString('class MyClass definition: {}');
        assert.ok(result.isClass());
        
        let behavior = result as hir.HIRBehavior; 
        assert.strictEqual(0, behavior.getInstanceSize());
        assert.strictEqual(1, behavior.getInstanceAlignment());

        tearDown();
    }

    // Empty class instantiation
    {
        setUp();
        
        let result = evaluateTopLevelSourceString('class MyClass definition: {}. MyClass()');
        assert.ok(result.isObjectValue());

        tearDown();
    }

    // Class with field
    {
        setUp();
        
        let result = evaluateTopLevelSourceString('class MyClass definition: {public field f => Integer}');
        assert.ok(result.isClass());
        
        let behavior = result as hir.HIRBehavior; 
        assert.strictEqual(8, behavior.getInstanceSize());
        assert.strictEqual(8, behavior.getInstanceAlignment());

        tearDown();
    }

    // Instantiate class with field
    {
        setUp();
        
        let result = evaluateTopLevelSourceString('class MyClass definition: {public field f => Integer}. MyClass(42)');
        assert.ok(result.isObjectValue());
        
        let object = result as hir.HIRObjectValue; 
        assert.strictEqual(1, object.fields.length);
        
        let field = object.fields[0] as hir.HIRValue;
        assert.ok(field.isConstantLiteralIntegerValue())
        assert.strictEqual(42, field.evaluateAsInteger());

        tearDown();
    }

    // Instantiate class with field access
    {
        setUp();
        
        let result = evaluateTopLevelSourceString('class MyClass definition: {public field first => Integer. public field second => Integer}. MyClass(1. 2) second');
        assert.ok(result.isConstantLiteralIntegerValue);
        assert.strictEqual(2, result.evaluateAsInteger());

        tearDown();
    }

    // Instantiate class with field access
    {
        setUp();
        
        let result = evaluateTopLevelSourceString('class MyClass definition: {public field first => Integer. public field second => Integer}. MyClass(1. 2) second: 42; second');
        assert.ok(result.isConstantLiteralIntegerValue);
        assert.strictEqual(42, result.evaluateAsInteger());

        tearDown();
    }

    // Empty class with method
    {
        setUp();
        
        let result = evaluateTopLevelSourceString('class MyClass definition: {method getInteger ::=> Integer := 42}. MyClass() getInteger');
        assert.ok(result.isConstantLiteralIntegerValue);
        assert.strictEqual(42, result.evaluateAsInteger());

        tearDown();
    }

    // Test pair explicit
    {
        setUp();
        
        let result = evaluateTopLevelSourceString(`
            class MyClass definition: {
                public field first => Integer.
                public field second => Integer.

                method setSecond: (value: Integer) ::=> Void := {self second: value . void}.
                method sumExplicit => Integer := self first + self second.
            }. MyClass(1. 2) setSecond: 5; sumExplicit`);
        assert.ok(result.isConstantLiteralIntegerValue);
        assert.strictEqual(6, result.evaluateAsInteger());

        tearDown();
    }


    // Test pair implicit
    {
        setUp();
        
        let result = evaluateTopLevelSourceString(`
            class MyClass definition: {
                public field first => Integer.
                public field second => Integer.

                method setSecond: (value: Integer) ::=> Void := {second := value . void}.
                method sumExplicit => Integer := first + second.
            }. MyClass(1. 2) setSecond: 5; sumExplicit`);
        assert.ok(result.isConstantLiteralIntegerValue());
        assert.strictEqual(6, result.evaluateAsInteger());

        tearDown();
    }

    // Test make class
    {
        setUp();
        
        let result = evaluateTopLevelSourceString(`
            class TestPair definition: {
                public field first type: Integer.
                public field second type: Integer.
            }.
                                            
            { :: TestPair | TestPair()}()

       `);
        assert.ok(result.isObjectValue());

        tearDown();
    }

    // Test make class 2
    {
        setUp();
        
        let result = evaluateTopLevelSourceString(`
            class TestPair definition: {
                public field first type: Integer.
                public field second type: Integer.
            }.
                                            
            { :: TestPair | TestPair(1. 2)}()

       `);
        assert.ok(result.isObjectValue());

        tearDown();
    }
}
