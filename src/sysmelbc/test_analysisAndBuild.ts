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
}