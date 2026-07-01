import * as scanner from "./scanner.js"
import * as assert from 'assert';

function scanTokenKinds(sourceString: string): scanner.TokenKind[] {
    let scannedTokens = scanner.scanSourceString(sourceString);
    return scannedTokens.map((token: scanner.Token) : scanner.TokenKind => token.kind);
}

export function runTests() {
    // Empty source code
    assert.deepStrictEqual(scanTokenKinds(''), [scanner.TokenKind.EndOfSource]);

    // Single line comment
    assert.deepStrictEqual(scanTokenKinds('## A comment'), [scanner.TokenKind.EndOfSource]);

    // Multi line comment
    assert.deepStrictEqual(scanTokenKinds('#* A comment *#'), [scanner.TokenKind.EndOfSource]);

    // Incomplete multi line comment
    assert.deepStrictEqual(scanTokenKinds('#* A comment'), [scanner.TokenKind.Error, scanner.TokenKind.EndOfSource]);

    // Identifier
    assert.deepStrictEqual(scanTokenKinds('helloIdentifier'), [scanner.TokenKind.Identifier, scanner.TokenKind.EndOfSource]);

    // Keyword
    assert.deepStrictEqual(scanTokenKinds('keyword:'), [scanner.TokenKind.Keyword, scanner.TokenKind.EndOfSource]);

    // Multi-Keyword
    assert.deepStrictEqual(scanTokenKinds('keyword:with:'), [scanner.TokenKind.MultiKeyword, scanner.TokenKind.EndOfSource]);

    // Integer
    assert.deepStrictEqual(scanTokenKinds('1234'), [scanner.TokenKind.Nat, scanner.TokenKind.EndOfSource]);
    assert.deepStrictEqual(scanTokenKinds('-1234'), [scanner.TokenKind.Nat, scanner.TokenKind.EndOfSource]);
    assert.deepStrictEqual(scanTokenKinds('2r01010'), [scanner.TokenKind.Nat, scanner.TokenKind.EndOfSource]);
    assert.deepStrictEqual(scanTokenKinds('16rC0DE'), [scanner.TokenKind.Nat, scanner.TokenKind.EndOfSource]);

    // Float
    assert.deepStrictEqual(scanTokenKinds('42.5'), [scanner.TokenKind.Float, scanner.TokenKind.EndOfSource]);
    assert.deepStrictEqual(scanTokenKinds('42.5e+12'), [scanner.TokenKind.Float, scanner.TokenKind.EndOfSource]);
    assert.deepStrictEqual(scanTokenKinds('42.5E+12'), [scanner.TokenKind.Float, scanner.TokenKind.EndOfSource]);
    assert.deepStrictEqual(scanTokenKinds('42.5e-12'), [scanner.TokenKind.Float, scanner.TokenKind.EndOfSource]);
    assert.deepStrictEqual(scanTokenKinds('42.5E-12'), [scanner.TokenKind.Float, scanner.TokenKind.EndOfSource]);

    // Symbol
    assert.deepStrictEqual(scanTokenKinds('#symbol'), [scanner.TokenKind.Symbol, scanner.TokenKind.EndOfSource]);

    // Keyword symbol
    assert.deepStrictEqual(scanTokenKinds('#keyword:'), [scanner.TokenKind.Symbol, scanner.TokenKind.EndOfSource]);

    // Operator symbol
    assert.deepStrictEqual(scanTokenKinds('#<'), [scanner.TokenKind.Symbol, scanner.TokenKind.EndOfSource]);
    assert.deepStrictEqual(scanTokenKinds('#|'), [scanner.TokenKind.Symbol, scanner.TokenKind.EndOfSource]);
    assert.deepStrictEqual(scanTokenKinds('#+'), [scanner.TokenKind.Symbol, scanner.TokenKind.EndOfSource]);

    // String symbol
    assert.deepStrictEqual(scanTokenKinds('#"Hello Symbol"'), [scanner.TokenKind.Symbol, scanner.TokenKind.EndOfSource]);

    // Incomplete string symbol
    assert.deepStrictEqual(scanTokenKinds('#"Hello Symbol'), [scanner.TokenKind.Error, scanner.TokenKind.EndOfSource]);

    // Hash puncutations
    assert.deepStrictEqual(scanTokenKinds('#['), [scanner.TokenKind.ByteArrayStart, scanner.TokenKind.EndOfSource]);
    assert.deepStrictEqual(scanTokenKinds('#{'), [scanner.TokenKind.DictionaryStart, scanner.TokenKind.EndOfSource]);
    assert.deepStrictEqual(scanTokenKinds('#('), [scanner.TokenKind.LiteralArrayStart, scanner.TokenKind.EndOfSource]);

    // Strings
    assert.deepStrictEqual(scanTokenKinds('"My String"'), [scanner.TokenKind.String, scanner.TokenKind.EndOfSource]);

    // Incomplete string
    assert.deepStrictEqual(scanTokenKinds('"My String'), [scanner.TokenKind.Error, scanner.TokenKind.EndOfSource]);

    // Character
    assert.deepStrictEqual(scanTokenKinds("'a'"), [scanner.TokenKind.Character, scanner.TokenKind.EndOfSource]);
    assert.deepStrictEqual(scanTokenKinds("'$'"), [scanner.TokenKind.Character, scanner.TokenKind.EndOfSource]);

    // Incomplete Character
    assert.deepStrictEqual(scanTokenKinds("'a"), [scanner.TokenKind.Error, scanner.TokenKind.EndOfSource]);

    // Punctuation
    assert.deepStrictEqual(scanTokenKinds("( )"), [scanner.TokenKind.LeftParent, scanner.TokenKind.RightParent, scanner.TokenKind.EndOfSource]);
    assert.deepStrictEqual(scanTokenKinds("[ ]"), [scanner.TokenKind.LeftBracket, scanner.TokenKind.RightBracket, scanner.TokenKind.EndOfSource]);
    assert.deepStrictEqual(scanTokenKinds("{ }"), [scanner.TokenKind.LeftCurlyBracket, scanner.TokenKind.RightCurlyBracket, scanner.TokenKind.EndOfSource]);
    assert.deepStrictEqual(scanTokenKinds(". ... ; : |"), [scanner.TokenKind.Dot, scanner.TokenKind.Ellipsis, scanner.TokenKind.Semicolon, scanner.TokenKind.Colon, scanner.TokenKind.Bar, scanner.TokenKind.EndOfSource]);
    assert.deepStrictEqual(scanTokenKinds("` `' `` `, `@"), [scanner.TokenKind.Backtick, scanner.TokenKind.Quote, scanner.TokenKind.QuasiQuote, scanner.TokenKind.QuasiUnquote, scanner.TokenKind.Splice, scanner.TokenKind.EndOfSource]);
    assert.deepStrictEqual(scanTokenKinds("< >"), [scanner.TokenKind.LessThan, scanner.TokenKind.GreaterThan, scanner.TokenKind.EndOfSource]);
    assert.deepStrictEqual(scanTokenKinds("? * !"), [scanner.TokenKind.Question, scanner.TokenKind.Star, scanner.TokenKind.Bang, scanner.TokenKind.EndOfSource]);

    // Operator
    assert.deepStrictEqual(scanTokenKinds("+"), [scanner.TokenKind.Operator, scanner.TokenKind.EndOfSource]);
    assert.deepStrictEqual(scanTokenKinds("-"), [scanner.TokenKind.Operator, scanner.TokenKind.EndOfSource]);

    // Low precedence operator
    assert.deepStrictEqual(scanTokenKinds("::+"), [scanner.TokenKind.LowPrecedenceOperator, scanner.TokenKind.EndOfSource]);
    assert.deepStrictEqual(scanTokenKinds("::-"), [scanner.TokenKind.LowPrecedenceOperator, scanner.TokenKind.EndOfSource]);
}
