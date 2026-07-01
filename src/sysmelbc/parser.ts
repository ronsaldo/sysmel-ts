import {SourceCode, SourcePosition} from "./source_code.js"
import * as scanner from "./scanner.js"
import * as parseTree from "./parsetree.js"
import { off } from "cluster";
import { error } from "console";
import { start } from "repl";

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
        this.position += 1;
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

    previousSourcePosition() : SourcePosition {
        if (this.position == 0)
            throw new Error("Expected a position of at least 1.");

        let token = this.tokens[this.position - 1];
        if(!token)
            throw new Error("Expected a valid token.");
        return token.sourcePosition;
    }

    sourcePositionFrom(startingPosition: number) : SourcePosition {
        if (startingPosition >= this.tokens.length)
            throw new Error("Expected a valid starting position.");
        
        let startSourcePositionToken = this.tokens[startingPosition];
        if(!startSourcePositionToken)
            throw new Error("Expected a valid starting position token.");
        
        let startSourcePosition = startSourcePositionToken.sourcePosition;
        if(this.position > 0) {
            let endSourcePosition = this.previousSourcePosition();
            return startSourcePosition.to(endSourcePosition);
        } else {
            let endSourcePosition = this.currentSourcePosition();
            return startSourcePosition.until(endSourcePosition);

        }
    }

    advanceWithExpectedError(message: string) : parseTree.ParseTreeNode {
        if (this.peekKind(0) == scanner.TokenKind.Error) {
            let errorToken = this.next();
            let errorMessage = errorToken.errorMessage ? errorToken.errorMessage : 'No error message';
            return new parseTree.ParseTreeParseErrorNode(errorToken.sourcePosition, errorMessage);
        } else if (this.atEnd()) {
            return new parseTree.ParseTreeParseErrorNode(this.currentSourcePosition(), message);
        } else {
            let errorPosition = this.currentSourcePosition();
            this.advance();
            return new parseTree.ParseTreeParseErrorNode(errorPosition, message);
        }
    }
}

function parseCEscapedString(str: string) : string {
    let result = '';
    for(let i = 0; i < str.length; ++i) {
        let c = str[i];
        if (c == '\\') {
            ++i;
            c = str[i];
            switch(c)
            {
            case 'n': c = '\n'; break;
            case 'r': c = '\r'; break;
            case 't': c = '\t'; break;
            default: break;
            }
        }

        result += c;
    }
    return result;
}

function parseIntegerConstant(constant: string): number {
    let radixIndex = constant.indexOf('r');
    if (radixIndex < 0)
        radixIndex = constant.indexOf('R');
    if (radixIndex >= 0)
    {
        let radix = constant.substring(0, radixIndex);
        let number = constant.substring(radixIndex + 1);
        return parseInt(number, parseInt(radix));
    }
    else
    {
        return parseInt(constant);
    }
}

function parseLiteralInteger(state: ParserState) : parseTree.ParseTreeNode {
    let token = state.next();
    if (token.kind !== scanner.TokenKind.Nat)
        throw new Error('Expected an integer literal.');

    return new parseTree.ParseTreeLiteralIntegerNode(token.sourcePosition, parseIntegerConstant(token.getValue()))
}

function parseLiteralFloat(state: ParserState) : parseTree.ParseTreeNode {
    let token = state.next();
    if (token.kind !== scanner.TokenKind.Float)
        throw new Error('Expected a float literal.');

    return new parseTree.ParseTreeLiteralFloatNode(token.sourcePosition, parseFloat(token.getValue()))
}

function parseLiteralString(state: ParserState) : parseTree.ParseTreeNode {
    let token = state.next();
    if (token.kind !== scanner.TokenKind.String)
        throw new Error('Expected a string literal.');
    
    let stringValue = token.getValue();
    stringValue = stringValue.substring(1, stringValue.length - 1);
    stringValue = parseCEscapedString(stringValue);

    return new parseTree.ParseTreeLiteralStringNode(token.sourcePosition, stringValue)
}

function parseLiteralCharacter(state: ParserState) : parseTree.ParseTreeNode {
    let token = state.next();
    if (token.kind !== scanner.TokenKind.Character)
        throw new Error('Expected a character literal.');
    
    let stringValue = token.getValue();
    stringValue = stringValue.substring(1, stringValue.length - 1);
    stringValue = parseCEscapedString(stringValue);
    let character = stringValue.codePointAt(0)
    if (!character)
        return new parseTree.ParseTreeParseErrorNode(token.sourcePosition, 'Empty character literal.');

    return new parseTree.ParseTreeLiteralCharacterNode(token.sourcePosition, character);
}

function parseLiteralSymbol(state: ParserState) : parseTree.ParseTreeNode {
    let token = state.next();
    if (token.kind !== scanner.TokenKind.Symbol)
        throw new Error('Expected a symbol literal.');
    
    let symbolValue = token.getValue();
    symbolValue = symbolValue.substring(1);
    if (symbolValue.startsWith('"')) {
        symbolValue = symbolValue.substring(1, symbolValue.length - 1);
        symbolValue = parseCEscapedString(symbolValue);
    }

    return new parseTree.ParseTreeLiteralSymbolNode(token.sourcePosition, symbolValue);
}

function parseLiteral(state: ParserState) : parseTree.ParseTreeNode {
    switch(state.peekKind(0))
    {
    case scanner.TokenKind.Nat:       return parseLiteralInteger(state);
    case scanner.TokenKind.Float:     return parseLiteralFloat(state);
    case scanner.TokenKind.String:    return parseLiteralString(state);
    case scanner.TokenKind.Character: return parseLiteralCharacter(state);
    case scanner.TokenKind.Symbol:    return parseLiteralSymbol(state);
    default:
        return state.advanceWithExpectedError('Expected a literal.');
    }
}

function parseIdentifierReference(state: ParserState) : parseTree.ParseTreeNode {
    let token = state.next();
    if (token.kind !== scanner.TokenKind.Identifier)
        throw new Error('Expected an identifer.');

    return new parseTree.ParseTreeIdentifierReferenceNode(token.sourcePosition, token.getValue());
}

function isBinaryExpressionOperator(kind: scanner.TokenKind): boolean {
    switch(kind)
    {
    case scanner.TokenKind.Operator:
    case scanner.TokenKind.Star:
    case scanner.TokenKind.LessThan:
    case scanner.TokenKind.GreaterThan:
    case scanner.TokenKind.Bar:
        return true;
    default:
        return false;
    }
}

function parseParenthesis(state: ParserState) : parseTree.ParseTreeNode {
    let startingPosition = state.position;
    // (
    if (state.peekKind(0) !== scanner.TokenKind.LeftParent)
        throw new Error('Expected a left parenthesis.');
    state.advance();

    // Operator identifier.
    if(isBinaryExpressionOperator(state.peekKind(0)) && state.peekKind(1) == scanner.TokenKind.RightParent) {
        let token = state.next();
        state.advance();
        return new parseTree.ParseTreeIdentifierReferenceNode(token.sourcePosition, token.getValue());
    }

    // Empty tuple
    if (state.peekKind(0) == scanner.TokenKind.RightParent) {
        state.advance();
        return new parseTree.ParseTreeTupleNode(state.sourcePositionFrom(startingPosition), []);
    }

    // Expression list
    let expression = parseSequenceUntilEndOrDelimiter(state, scanner.TokenKind.RightParent);

    // )
    expression = state.expectAddingErrorToNode(scanner.TokenKind.RightParent, expression);
    return expression;
}

function parseTerm(state: ParserState) : parseTree.ParseTreeNode {
    switch(state.peekKind(0))
    {
    case scanner.TokenKind.Identifier: return parseIdentifierReference(state);
    case scanner.TokenKind.LeftParent: return parseParenthesis(state);
    default:
        return parseLiteral(state)
    }
}

function parseChainExpression(state: ParserState) : parseTree.ParseTreeNode {
    return parseTerm(state);
}

function parseLowPrecedenceExpression(state: ParserState) : parseTree.ParseTreeNode {
    let startPosition = state.position;
    let receiver = parseChainExpression(state);
    while(state.peekKind(0) == scanner.TokenKind.LowPrecedenceOperator) {
        let operatorToken = state.next();
        let operatorSelector = operatorToken.getValue().substring(2);

        let selectorNode = new parseTree.ParseTreeLiteralSymbolNode(operatorToken.sourcePosition, operatorSelector);
        let argument = parseChainExpression(state);

        receiver = new parseTree.ParseTreeMessageSendNode(state.sourcePositionFrom(startPosition), receiver, selectorNode, [argument]);
    }
    return receiver;
}

function parseAssignmentExpression(state: ParserState) : parseTree.ParseTreeNode {
    let startPosition = state.position;
    let assignedStore = parseLowPrecedenceExpression(state);

    if (state.peekKind(0) === scanner.TokenKind.Assignment) {
        let operatorToken = state.next();
        let assignedValue = parseAssignmentExpression(state);
        return new parseTree.ParseTreeAssignmentNode(state.sourcePositionFrom(startPosition), assignedStore, assignedValue);
    } else {
        return assignedStore
    }
}

function parseCommaExpression(state: ParserState) : parseTree.ParseTreeNode {
    let startPosition = state.position;
    let element = parseAssignmentExpression(state);
    if (state.peekKind(0) !== scanner.TokenKind.Comma)
        return element;

    let elements: parseTree.ParseTreeNode[] = [];
    elements.push(element);

    while (state.peekKind(0) === scanner.TokenKind.Comma)
    {
        state.advance();
        let memento = state.memento();
        element = parseAssignmentExpression(state);
        if (element.isParseErrorNode()) {
            state.restore(memento);
            break
        }

        elements.push(element);
    }

    return new parseTree.ParseTreeTupleNode(state.sourcePositionFrom(startPosition), elements);
}

function parseExpression(state: ParserState) : parseTree.ParseTreeNode {
    return parseCommaExpression(state);
}

function parseExpressionListUntilEndOrDelimiter(state: ParserState, delimiter: scanner.TokenKind) : parseTree.ParseTreeNode[] {
    let elements : parseTree.ParseTreeNode[] =  [];

    // Chop the initial dots.
    while(state.peekKind(0) == scanner.TokenKind.Dot)
        state.advance();

    // Parse the next expression
    let expectsExpression = true;
    while (!state.atEnd() && state.peekKind(0) != delimiter) {
        if (!expectsExpression) {
            elements.push(new parseTree.ParseTreeErrorNode(state.currentSourcePosition(), "Expected a dot before the expression."));
        }

        let expression = parseExpression(state);
        elements.push(expression);

        // Chop the next dot sequence
        expectsExpression = false;
        while(state.peekKind(0) == scanner.TokenKind.Dot) {
            expectsExpression = true;
            state.advance();
        }
    }


    return elements;
}

function parseSequenceUntilEndOrDelimiter(state: ParserState, delimiter: scanner.TokenKind) : parseTree.ParseTreeNode {
    let initialPosition = state.position;
    let elements = parseExpressionListUntilEndOrDelimiter(state, delimiter);
    if(elements.length == 1)
    {
        let firstElement = elements[0];
        if(!firstElement)
            throw new Error('Expected a valid element.');
        return firstElement;
    }
    
    return new parseTree.ParseTreeSequenceNode(state.sourcePositionFrom(initialPosition), elements);
}

function parseTopLevelExpression(state: ParserState) : parseTree.ParseTreeNode {
    return parseSequenceUntilEndOrDelimiter(state, scanner.TokenKind.EndOfSource)
}

export function parseScannedTokens(tokens: scanner.Token[]) : parseTree.ParseTreeNode {
    let parserState = new ParserState(tokens);
    return parseTopLevelExpression(parserState)
}

export function parseSourceCode(sourceCode: SourceCode) : parseTree.ParseTreeNode {
    let tokens = scanner.scanSourceCode(sourceCode);
    return parseScannedTokens(tokens)
}

export function parseSourceString(sourceString: string) : parseTree.ParseTreeNode {
    return parseSourceCode(new SourceCode(sourceString, "<string>", ""))
}
