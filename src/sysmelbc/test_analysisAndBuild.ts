import * as parseTree from "./parsetree.js"
import * as parser from "./parser.js"
import * as hir from "./hir.js"
import * as assert from 'assert';
import { getOrMakeEmptySourcePosition } from "./source_code.js";

let context: hir.HIRContext = new hir.HIRContext();

function buildTopLevelSourceString(sourceString: string): hir.HIRValue {
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
}