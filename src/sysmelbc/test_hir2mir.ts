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

export function runTests() {
    // Empty
    {
        setUp();
        evaluateTopLevelSourceString("");
        let mirPackage = compilePackageToMir();
        assert.ok(mirPackage.elementTable.length == 0);
        tearDown();
    }
}
