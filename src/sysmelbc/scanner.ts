export const enum TokenKind
{
    EndOfSource,
    Error,

    Character, Float, IDENTIFIER, Nat, Keyword, MultiKeyword, Operator, LowPrecedenceOperator, String, Symbol,
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

export function scanSourceCode(sourceCode: SourceCode): Token[] {
    let endOfSourcePosition = new SourcePosition(sourceCode, 0, 0, 0, 0, 0, 0);
    return [new Token(TokenKind.EndOfSource, endOfSourcePosition, null)]
}

export function scanSourceString(sourceString: string): Token[] {
    return scanSourceCode(new SourceCode(sourceString, '<str>', ''))
}