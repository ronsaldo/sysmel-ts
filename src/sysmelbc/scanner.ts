import { resourceUsage } from "node:process";

export const enum TokenKind
{
    EndOfSource,
    Error,

    Character, Float, Identifier, Nat, Keyword, MultiKeyword, Operator, LowPrecedenceOperator, String, Symbol,
    LeftParent, RightParent, LeftBracket, RightBracket, LeftCurlyBracket, RightCurlyBracket,
    LessThan, GreaterThan, Star, Question, Bang,
    Colon, ColonColon, Bar,
    Assignment, Semicolon, Comma, Dot, Ellipsis,
    Quote, QuasiQuote, QuasiUnquote, Splice,
    ByteArrayStart, DictionaryStart, LiteralArrayStart,
}

export class SourceCode {
    text: string;
    name: string;
    directory: string
    
    constructor(text: string, name: string, directory: string) {
        this.text = text;
        this.name = name;
        this.directory = directory;
    }
}

export class SourcePosition {
    sourceCode: SourceCode;
    startIndex: number;
    endIndex: number;

    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;

    constructor(sourceCode: SourceCode,
        startIndex: number, endIndex: number,
        startLine: number, startColumn: number,
        endLine: number, endColumn: number) {

        this.sourceCode = sourceCode;
        this.startIndex = startIndex;
        this.endIndex = endIndex;

        this.startLine = startLine;
        this.startColumn = startColumn;
        this.endLine = endLine;
        this.endColumn = endColumn;
    }
}

export class Token {
    kind: TokenKind;
    sourcePosition: SourcePosition;
    errorMessage: string | null;

    constructor(kind: TokenKind, sourcePosition: SourcePosition, errorMessage: string | null){
        this.kind = kind;
        this.sourcePosition = sourcePosition;
        this.errorMessage = errorMessage;
    }
}

class ScannerState {
    sourceCode: SourceCode;
    position: number = 0
    line: number = 1
    column: number = 1
    isPreviousCR: boolean = false

    constructor(sourceCode: SourceCode){
        this.sourceCode = sourceCode;
    }

    clone() : ScannerState {
        let cloned = new ScannerState(this.sourceCode);
        cloned.position = this.position;
        cloned.line = this.line;
        cloned.column = this.column;
        cloned.isPreviousCR = this.isPreviousCR;
        return cloned
    }

    restore(oldState: ScannerState) : void {
        this.position = oldState.position;
        this.line = oldState.line;
        this.column = oldState.column;
        this.isPreviousCR = oldState.isPreviousCR;
    }

    atEnd() : boolean {
        return this.position >= this.sourceCode.text.length
    }

    peek(peekOffset: number) : number {
        const peekPosition = this.position + peekOffset;
        if (peekPosition < this.sourceCode.text.length)
        {
            let codePoint = this.sourceCode.text.codePointAt(peekPosition);
            if(!codePoint)
                return -1
            else
                return codePoint;
        }
        else
            return -1;
    }

    advance() : void {
        if (this.position >= this.sourceCode.text.length)
            throw new Error("ScannerState advance past end");

        const c = this.sourceCode.text.codePointAt(this.position);
        this.position += 1;
        if (c === 13){ // CR
            this.line += 1;
            this.column = 1;
            this.isPreviousCR = true;
        } else if(c === 10) {  // LF
            if(!this.isPreviousCR) {
                this.line += 1;
                this.column = 1;
            }
            this.isPreviousCR = false
        } else if (c === 9)  { // TAB
            this.column = (this.column + 4) % 4 * 4 +1;
            this.isPreviousCR = false;
        } else {
            this.isPreviousCR = false;
        }
    }

    advanceCount(count: number) {
        for(let i = 0; i < count; ++i)
            this.advance();
    }

    makeToken(kind: TokenKind) {
        const sourcePosition = new SourcePosition(this.sourceCode, this.position, this.position, this.line, this.column, this.line, this.column);
        return new Token(kind, sourcePosition, null);
    }

    makeTokenStartingFrom(kind: TokenKind, startingState: ScannerState) {
        const sourcePosition = new SourcePosition(this.sourceCode, startingState.position, this.position, startingState.line, startingState.column, this.line, this.column);
        return new Token(kind, sourcePosition, null);
    }

    makeErrorTokenStartingFrom(errorMessage: string, startingState: ScannerState) {
        const sourcePosition = new SourcePosition(this.sourceCode, startingState.position, this.position, startingState.line, startingState.column, this.line, this.column);
        return new Token(TokenKind.Error, sourcePosition, errorMessage);
    }
}

function isDigit(c: number) : boolean {
    return (48 <= c && c <= 57);
}

function isIdentifierStart(c: number) : boolean {
    return (65 <= c && c <= 90) ||
        (97 <= c && c <= 122) ||
        95 == c;
}

function isIdentifierMiddle(c: number) : boolean {
    return isIdentifierStart(c) || isDigit(c);
}

function isOperatorCharacter(c: number) : boolean {
    let operatorSet = '+-/\\*~<>=@%|&?!^';
    for (let i = 0; i < operatorSet.length; ++i)
    {
        let char = operatorSet.codePointAt(i);
        if (char == c)
            return true;
    }

    return false;
}

function skipWhite(state: ScannerState) : Token | null {
    let hasSeenComment = true;
    while (hasSeenComment)
    {
        hasSeenComment = false;

        // Skip the white spaces.
        while(!state.atEnd() && state.peek(0) <= 32)
            state.advance();

        if (state.peek(0) === 35) // '#'
        {
            if (state.peek(1) === 35) // '#'
            {
                // Single line comment.
                state.advanceCount(2);
                while(!state.atEnd())
                {
                    let c = state.peek(0);
                    if (c === 10 || c == 13) {
                        break;
                    }

                    state.advance();
                }
                hasSeenComment = true;
            }
            else if(state.peek(1) === 42) // '*'
            {
                // Multi-line comment.
                let commentInitialState = state.clone();
                state.advanceCount(2);
                let hasCommentEnd = false;

                while (!state.atEnd())
                {
                    hasCommentEnd = (state.peek(0) === /***/ 42) && (state.peek(1) === /*#*/ 35);
                    if (hasCommentEnd)
                    {
                        state.advanceCount(2);
                        break;
                    }

                    state.advance();
                }

                if (!hasCommentEnd)
                    return state.makeErrorTokenStartingFrom('Incomplete multiline comment.', commentInitialState);

                hasSeenComment = true;
            }
        }

    }
    return null
}

function scanAdvanceKeyword(state: ScannerState) : boolean {
    if (!isIdentifierStart(state.peek(0)))
        return false;

    let initialState = state.clone();
    while(isIdentifierMiddle(state.peek(0)))
        state.advance();

    if (state.peek(0) !== /*:*/ 58)
    {
        state.restore(initialState);
        return false;
    }

    state.advance();
    return true;
}

function scanNextToken(state: ScannerState) : Token {
    // Skip the whitespaces and comments.
    let whiteErrorToken = skipWhite(state);
    if (whiteErrorToken !== null)
        return whiteErrorToken

    if (state.atEnd()) {
        return state.makeToken(TokenKind.EndOfSource);
    }

    // Initial state and peek first char.
    let initialState = state.clone();
    let c = state.peek(0);

    // Identifiers, keywords and multi-keywords
    if(isIdentifierStart(c))
    {
        state.advance();
        while (isIdentifierMiddle(state.peek(0)))
            state.advance();

        if (state.peek(0) === /*:*/ 58)
        {
            state.advance();
            let isMultiKeyword = false;
            let hasAdvanced = true;
            while (hasAdvanced)
            {
                hasAdvanced = scanAdvanceKeyword(state);
                isMultiKeyword = isMultiKeyword || hasAdvanced;
            }

            if (isMultiKeyword)
                return state.makeTokenStartingFrom(TokenKind.MultiKeyword, initialState);
            else
                return state.makeTokenStartingFrom(TokenKind.Keyword, initialState);
        }

        return state.makeTokenStartingFrom(TokenKind.Identifier, initialState);
    }

    // Numbers
    if(isDigit(c) || (c === /*-*/45 && isDigit(state.peek(1))))
    {
        state.advance();
        while(isDigit(state.peek(0)))
            state.advance();

        // Parse the radix.
        if (state.peek(0) === /* R */ 82 || state.peek(0) === /* r */ 114)
        {
            state.advance();
            while(isIdentifierMiddle(state.peek(0)))
                state.advance();

            return state.makeTokenStartingFrom(TokenKind.Nat, initialState)
        }

        // Decimal point
        if(state.peek(0) === /*.*/ 46 && isDigit(state.peek(1)))
        {
            state.advanceCount(2);
            while(isDigit(state.peek(0)))
                state.advance();

            if(state.peek(0) === /*E*/69 || state.peek(0) === /*E*/101)
            {
                if(isDigit(state.peek(1)) ||
                    ((state.peek(1) === /*+*/43 || state.peek(1) === /*-*/45) && isDigit(state.peek(2)))
                )
                {
                    state.advanceCount(2);
                    while (isDigit(state.peek(0)))
                        state.advance();
                }
            }

            return state.makeTokenStartingFrom(TokenKind.Float, initialState)
        }

        return state.makeTokenStartingFrom(TokenKind.Nat, initialState)
    }

    // Symbols
    if(c === /*#*/35) {
        let c1 = state.peek(1);
        if (isIdentifierStart(c1))
        {
            state.advanceCount(2);
            while (isIdentifierMiddle(state.peek(0)))
                state.advance();

            if (state.peek(0) === /*:*/ 58)
            {
                state.advance();
                let hasAdvanced = true;
                while (hasAdvanced)
                    hasAdvanced = scanAdvanceKeyword(state);

                return state.makeTokenStartingFrom(TokenKind.Symbol, initialState);
            }

            return state.makeTokenStartingFrom(TokenKind.Symbol, initialState);
        } else if(isOperatorCharacter(c1)) {
            state.advanceCount(2);
            while(isOperatorCharacter(state.peek(0)))
                state.advance();
            return state.makeTokenStartingFrom(TokenKind.Symbol, initialState);
        } else if(c1 === /*"*/34) {
            state.advanceCount(2);
            while(!state.atEnd() && state.peek(0) !== /*"*/34) {
                if (state.peek(0) === /*\*/ 92 && state.peek(1) >= 0)
                    state.advanceCount(2);
                else
                    state.advance();
            }

            if (state.peek(0) != /*"*/ 34)
                return state.makeErrorTokenStartingFrom("Incomplete symbol string literal", initialState);

            state.advance();
            return state.makeTokenStartingFrom(TokenKind.Symbol, initialState);
        } else if(c1 === /* [ */91) {
            state.advanceCount(2);
            return state.makeTokenStartingFrom(TokenKind.ByteArrayStart, initialState);
        } else if(c1 === /* { */123) {
            state.advanceCount(2);
            return state.makeTokenStartingFrom(TokenKind.DictionaryStart, initialState);
        } else if(c1 === /* ( */40) {
            state.advanceCount(2);
            return state.makeTokenStartingFrom(TokenKind.LiteralArrayStart, initialState);
        }
    }

    // String literals
    if(c == /*"*/34)
    {
        state.advance();
        while(!state.atEnd() && state.peek(0) !== /*"*/34) {
            if (state.peek(0) === /*\*/ 92 && state.peek(1) >= 0)
                state.advanceCount(2);
            else
                state.advance();
        }

        if (state.peek(0) != /*"*/ 34)
            return state.makeErrorTokenStartingFrom("Incomplete string literal", initialState);

        state.advance();
        return state.makeTokenStartingFrom(TokenKind.String, initialState);
    }

    // Character literals
    if(c == /*'*/39)
    {
        state.advance();
        while(!state.atEnd() && state.peek(0) !== /*"*/39) {
            if (state.peek(0) === /*\*/ 92 && state.peek(1) >= 0)
                state.advanceCount(2);
            else
                state.advance();
        }

        if (state.peek(0) != /*'*/ 39)
            return state.makeErrorTokenStartingFrom("Incomplete character literal", initialState);

        state.advance();
        return state.makeTokenStartingFrom(TokenKind.Character, initialState);
    }

    // Unrecognized token.
    state.advance();
    let errorToken = state.makeErrorTokenStartingFrom("Unexpected character.", initialState)
    return errorToken
}

export function scanSourceCode(sourceCode: SourceCode): Token[] {
    let scannerState = new ScannerState(sourceCode)
    let tokens: Token[] = [];
    while (true)
    {
        let token = scanNextToken(scannerState);
        tokens.push(token);
        if (token.kind === TokenKind.EndOfSource)
            break;
    }

    return tokens;
}

export function scanSourceString(sourceString: string): Token[] {
    return scanSourceCode(new SourceCode(sourceString, '<str>', ''))
}