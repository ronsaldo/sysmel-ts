import * as testScanner from "./test_scanner.js"
import * as testParser from "./test_parser.js"
import * as testHIR from "./test_hir.js"
import * as testAnalysisAndEvaluation from "./test_analysisAndEvaluation.js"

testScanner.runTests();
testParser.runTests();
testHIR.runTests();
testAnalysisAndEvaluation.runTests();
