import {SourceCode, SourcePosition} from "./source_code.js"
import * as scanner from "./scanner.js"
import * as parseTree from "./parsetree.js"
import { off } from "cluster";
import { error } from "console";

class ParserState {
    tokens: scanner.Token[];
    position: number = 0;

    constructor(tokens: scanner.Token[]) {
        this.tokens = tokens;
    }

    atEnd(): boolean {
        return this.position >= this.tokens.length;
    }

    memento(): number {
        return this.position;
    }

    restore(memento: number) {
        this.position = memento;
    }

    peekKind(offset: number) : scanner.TokenKind {
        let peekPosition = this.position + offset;
        if (peekPosition < this.tokens.length) {
            let token = this.tokens[peekPosition];
            if(!token)
                throw new Error("Expected a valid token.");
            return token.kind;
        }

        return scanner.TokenKind.EndOfSource;
    }

    peek(offset: number) : scanner.Token | null {
        let peekPosition = this.position + offset;
        if (peekPosition < this.tokens.length) {
            let token = this.tokens[peekPosition];
            if(!token) return null;
            return token
        }

        return null
    }

    advance(): void {
        if (this.position >= this.tokens.length)
            throw new Error("Cannot advance beyond the limit.")

        this.position += 1
    }

    next() : scanner.Token {
        let token = this.tokens[this.position];
        if(!token)
            throw new Error("Cannot advance beyond the limit.")
        return token
    }

    expectAddingErrorToNode(expectedKind: scanner.TokenKind, node: parseTree.ParseTreeNode) : parseTree.ParseTreeNode {
        if (this.peekKind(0) === expectedKind) {
            this.advance();
            return node;
        }

        let errorPosition = this.currentSourcePosition();
        let errorNode = new parseTree.ParseTreeParseErrorNode(errorPosition, 'Expected a tokend of kind ' + expectedKind);
        return new parseTree.ParseTreeSequenceNode(node.sourcePosition, [node, errorNode])
    }

    currentSourcePosition() : SourcePosition {
        if (this.position < this.tokens.length) {
            let token = this.tokens[this.position];
            if(!token)
                throw new Error('Expected a valid token');
            return token.sourcePosition;
        }

        let lastToken = this.tokens[this.tokens.length - 1]
        if(!lastToken)
            throw new Error('Expected at least a single valid token');
        return lastToken.sourcePosition;
    }
}

/*
class ParserState:
    def currentSourcePosition(self) -> SourcePosition:
        if self.position < len(self.tokens):
            return self.tokens[self.position].sourcePosition

        assert self.tokens[-1].kind == TokenKind.END_OF_SOURCE 
        return self.tokens[-1].sourcePosition

    def previousSourcePosition(self) -> SourcePosition:
        assert self.position > 0
        return self.tokens[self.position - 1].sourcePosition

    def sourcePositionFrom(self, startingPosition: int) -> SourcePosition:
        assert startingPosition < len(self.tokens)
        startSourcePosition = self.tokens[startingPosition].sourcePosition
        if self.position > 0:
            endSourcePosition = self.previousSourcePosition()
            return startSourcePosition.to(endSourcePosition)
        else:
            endSourcePosition = self.currentSourcePosition()
            return startSourcePosition.until(endSourcePosition)
    
    def advanceWithExpectedError(self, message: str):
        if self.peekKind() == TokenKind.ERROR:
            errorToken = self.next()
            return self, ParseTreeErrorNode(errorToken.sourcePosition, errorToken.errorMessage)
        elif self.atEnd():
            return self, ParseTreeErrorNode(self.currentSourcePosition(), message)
        else:
            errorPosition = self.currentSourcePosition()
            self.advance()
            return self, ParseTreeErrorNode(errorPosition, message)
*/

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
