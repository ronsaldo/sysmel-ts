import * as parseTree from "./parsetree.js"
import * as parser from "./parser.js"
import * as assert from 'assert';

function parseSourceStringWithoutErrors(sourceString: string): parseTree.ParseTreeNode {
    return parser.parseSourceString(sourceString)
}

export function runTests() {
    console.log('TODO test_parser')
}
