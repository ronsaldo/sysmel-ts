import * as testScanner from "./test_scanner.js"
import * as testParser from "./test_parser.js"
import * as testHIR from "./test_hir.js"

testScanner.runTests();
testParser.runTests();
testHIR.runTests();
