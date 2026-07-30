import {getOrMakeEmptySourcePosition} from "./source_code.js"
import * as parseTree from "./parsetree.js"
import * as parser from "./parser.js"
import * as hir from "./hir.js"
import * as mir from "./mir.js"
import * as hir2mir from "./hir2mir.js"
import * as assert from 'assert'


let hirContext = new hir.HIRContext();
let hirPackage = hirContext.newPackage();
let mirContext = new mir.MirContext(8);
let mirPackage = new mir.MirPackage(mirContext, 'Test');

function setUp() {
    hirContext = new hir.HIRContext();
    hirPackage = hirContext.newPackage();
    hirPackage.name = 'Test'

    mirContext = new mir.MirContext(8);
    mirPackage = new mir.MirPackage(mirContext, 'Test');
}

function tearDown() {
    hirContext.finishPendingAnalysis();
}

function evaluateTopLevelSourceString(sourceString: string): hir.HIRValue {
    let ast = parser.parseSourceString(sourceString)
    assert.ok(new parseTree.ParseTreeParseErrorVisitor().checkAndPrintErrors(ast));

    let evaluationContext = hirContext.createTopLevelEvaluationContext(ast.sourcePosition.getSourceCode());
    let result = new hir.AnalysisAndEvaluationPass(evaluationContext).visitDecayedNode(ast);
    return result as hir.HIRValue;
}

function compilePackageToMir(): mir.MirPackage {
    hirContext.finishPendingAnalysis();
    mirPackage = new hir2mir.HirPackage2Mir(hirContext, mirContext).translateHirPackage2Mir(hirPackage);
    return mirPackage;
}

function compileFunctionToMir(sourceString: string): mir.MirFunction {
    let hirFunction = evaluateTopLevelSourceString(sourceString);
    assert.ok(hirFunction.isFunction());
    let mirPackage = compilePackageToMir();
    return mirPackage.translatedFunctionMap.get(hirFunction as hir.HIRFunction) as mir.MirFunction
}

export function runTests() {
    // Empty
    {
        setUp();
        evaluateTopLevelSourceString("");
        let mirPackage = compilePackageToMir();
        assert.ok(mirPackage.elementTable.length == 0);
        tearDown();
    }

    // Integer identity function
    {
        setUp();
        let mirFunction = compileFunctionToMir("public function identity(value: Integer) => Integer := value");
        let result = mirFunction.evaluateWithArguments([42]);
        assert.strictEqual(result, 42);
        tearDown();
    }

    // Boolean false constant
    {
        setUp();
        let mirFunction = compileFunctionToMir("public function constant() => Boolean8 := false");
        let result = mirFunction.evaluateWithArguments([]);
        assert.strictEqual(result, false);
        tearDown();
    }

    // Boolean true constant
    {
        setUp();
        let mirFunction = compileFunctionToMir("public function constant() => Boolean8 := true");
        let result = mirFunction.evaluateWithArguments([]);
        assert.strictEqual(result, true);
        tearDown();
    }

    // Boolean not
    {
        setUp();
        let mirFunction = compileFunctionToMir("public function not(v: Boolean8) => Boolean8 := v not");

        assert.strictEqual(mirFunction.evaluateWithArguments([false]), true);
        assert.strictEqual(mirFunction.evaluateWithArguments([true]), false);

        tearDown();
    }

    // Boolean and
    {
        setUp();
        let mirFunction = compileFunctionToMir("public function and(a: Boolean8. b: Boolean8) => Boolean8 := a && b");

        assert.strictEqual(mirFunction.evaluateWithArguments([false, false]), false);
        assert.strictEqual(mirFunction.evaluateWithArguments([false, true]), false);
        assert.strictEqual(mirFunction.evaluateWithArguments([true, false]), false);
        assert.strictEqual(mirFunction.evaluateWithArguments([true, true]), true);

        tearDown();
    }

    // Boolean or
    {
        setUp();
        let mirFunction = compileFunctionToMir("public function or(a: Boolean8. b: Boolean8) => Boolean8 := a || b");

        assert.strictEqual(mirFunction.evaluateWithArguments([false, false]), false);
        assert.strictEqual(mirFunction.evaluateWithArguments([false, true]), true);
        assert.strictEqual(mirFunction.evaluateWithArguments([true, false]), true);
        assert.strictEqual(mirFunction.evaluateWithArguments([true, true]), true);

        tearDown();
    }


    // Integer constant
    {
        setUp();
        let mirFunction = compileFunctionToMir("public function constant() => Integer := 42");
        let result = mirFunction.evaluateWithArguments([]);
        assert.strictEqual(result, 42);
        tearDown();
    }
    // Character constant
    {
        setUp();
        let mirFunction = compileFunctionToMir("public function constant() => Character := 'A'");
        let result = mirFunction.evaluateWithArguments([]);
        assert.strictEqual(result, 65);
        tearDown();
    }
    // Float constant
    {
        setUp();
        let mirFunction = compileFunctionToMir("public function constant() => Float := 42.5");
        let result = mirFunction.evaluateWithArguments([]);
        assert.strictEqual(result, 42.5);
        tearDown();
    }

    // Float32 constant
    {
        setUp();
        let mirFunction = compileFunctionToMir("public function constant() => Float32 := 42.5f32");
        let result = mirFunction.evaluateWithArguments([]);
        assert.strictEqual(result, 42.5);
        tearDown();
    }

    // Int32 identity function
    {
        setUp();
        let mirFunction = compileFunctionToMir("public function identity(value: Int32) => Int32 := value");
        let result = mirFunction.evaluateWithArguments([42]);
        assert.strictEqual(result, 42);
        tearDown();
    }

    // Int32 sum function
    {
        setUp();
        let mirFunction = compileFunctionToMir("public function sum(a: Int32. b: Int32) => Int32 := a + b");
        let result = mirFunction.evaluateWithArguments([1, 2]);
        assert.strictEqual(result, 3);
        tearDown();
    }

    // Int32 min function
    {
        setUp();

        let mirFunction = compileFunctionToMir("public function min(a: Int32. b: Int32) => Int32 := (if: a < b then: a else: b)");
        
        let result = mirFunction.evaluateWithArguments([1, 2]);
        assert.strictEqual(result, 1);
        
        result = mirFunction.evaluateWithArguments([2, 1]);
        assert.strictEqual(result, 1);

        tearDown();
    }

    // Int32 call sum function
    {
        setUp();

        let mirFunction = compileFunctionToMir("function sum(a: Int32. b: Int32) => Int32 := a + b. public function callSum() => Int32 := sum(1i32. 2i32).");
        
        let result = mirFunction.evaluateWithArguments([1, 2]);
        assert.strictEqual(result, 3);
        
        result = mirFunction.evaluateWithArguments([2, 1]);
        assert.strictEqual(result, 3);

        tearDown();
    }
}
