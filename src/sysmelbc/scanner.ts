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