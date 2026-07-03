import * as parseTree from "./parsetree.js"
import * as parser from "./parser.js"
import * as hir from "./hir.js"
import {AnalysisAndEvaluationPass} from "./analysisAndEvaluation.js"
import * as assert from 'assert';

let context: hir.HIRContext = new hir.HIRContext();

function evaluateTopLevelSourceString(sourceString: string): hir.HIRValue {
    let ast = parser.parseSourceString(sourceString)
    assert.ok(new parseTree.ParseTreeParseErrorVisitor().checkAndPrintErrors(ast));

    let evaluationContext = context.createTopLevelEvaluationContext(ast.sourcePosition.sourceCode);
    let result = new AnalysisAndEvaluationPass(evaluationContext).visitNode(ast);
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

    // Literal integer
    {
        setUp();
        let value = evaluateTopLevelSourceString('42');
        assert.ok(value.isConstantLiteralIntegerValue());
        assert.strictEqual((value as hir.HIRConstantLiteralIntegerValue).value, 42);
    }
}