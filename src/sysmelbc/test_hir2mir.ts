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
}
