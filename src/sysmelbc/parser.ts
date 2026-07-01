import {SourceCode, SourcePosition} from "./source_code.js"
import * as scanner from "./scanner.js"
import * as parseTree from "./parsetree.js"

export function parseScannedTokens(tokens: scanner.Token[]) : parseTree.ParseTreeNode {
    let firstToken = tokens[0]
    if(!firstToken)
        throw new Error("Expected at least a single token.");
    return new parseTree.ParseTreeErrorNode(firstToken.sourcePosition, 'Parser is unimplemented.');
}

export function parseSourceCode(sourceCode: SourceCode) : parseTree.ParseTreeNode {
    let tokens = scanner.scanSourceCode(sourceCode);
    return parseScannedTokens(tokens)
}

export function parseSourceString(sourceString: string) : parseTree.ParseTreeNode {
    return parseSourceCode(new SourceCode(sourceString, "<string>", ""))
}
