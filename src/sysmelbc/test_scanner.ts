import * as scanner from "./scanner.js"
import * as assert from 'assert';

function scanTokenKinds(sourceString: string): scanner.TokenKind[] {
    let scannedTokens = scanner.scanSourceString(sourceString);
    return scannedTokens.map((token: scanner.Token) : scanner.TokenKind => token.kind);
}

export function runTests() {
    // Empty source code
    assert.deepStrictEqual(scanTokenKinds(''), [scanner.TokenKind.EndOfSource])

    // Multi line comment
    assert.deepStrictEqual(scanTokenKinds('#* A comment *#'), [scanner.TokenKind.EndOfSource])

    // Incomplete multi line comment
    assert.deepStrictEqual(scanTokenKinds('#* A comment'), [scanner.TokenKind.Error, scanner.TokenKind.EndOfSource])

/*
    def testString(self):
        self.assertEqual(self.scanTokenKinds('"My String"'), [TokenKind.STRING, TokenKind.END_OF_SOURCE])

    def testIncompleteString(self):
        self.assertEqual(self.scanTokenKinds('"My String'), [TokenKind.ERROR, TokenKind.END_OF_SOURCE])

    def testIdentifier(self):
        self.assertEqual(self.scanTokenKinds("helloIdentifier"), [TokenKind.IDENTIFIER, TokenKind.END_OF_SOURCE])

    def testSymbol(self):
        self.assertEqual(self.scanTokenKinds("#symbol"), [TokenKind.SYMBOL, TokenKind.END_OF_SOURCE])

    def testKeyword(self):
        self.assertEqual(self.scanTokenKinds("keyword:"), [TokenKind.KEYWORD, TokenKind.END_OF_SOURCE])

    def testMultiKeyword(self):
        self.assertEqual(self.scanTokenKinds("keyword:with:"), [TokenKind.MULTI_KEYWORD, TokenKind.END_OF_SOURCE])

    def testKeywordSymbol(self):
        self.assertEqual(self.scanTokenKinds("#keyword:"), [TokenKind.SYMBOL, TokenKind.END_OF_SOURCE])

    def testOperatorSymbol(self):
        self.assertEqual(self.scanTokenKinds("#<"), [TokenKind.SYMBOL, TokenKind.END_OF_SOURCE])
        self.assertEqual(self.scanTokenKinds("#|"), [TokenKind.SYMBOL, TokenKind.END_OF_SOURCE])
        self.assertEqual(self.scanTokenKinds("#+"), [TokenKind.SYMBOL, TokenKind.END_OF_SOURCE])

    def testStringSymbol(self):
        self.assertEqual(self.scanTokenKinds('#"Hello Symbol"'), [TokenKind.SYMBOL, TokenKind.END_OF_SOURCE])

    def testInteger(self):
        self.assertEqual(self.scanTokenKinds("1234"), [TokenKind.NAT, TokenKind.END_OF_SOURCE])
        self.assertEqual(self.scanTokenKinds("-1234"), [TokenKind.NAT, TokenKind.END_OF_SOURCE])
        self.assertEqual(self.scanTokenKinds("2r01010"), [TokenKind.NAT, TokenKind.END_OF_SOURCE])
        self.assertEqual(self.scanTokenKinds("16rC0DE"), [TokenKind.NAT, TokenKind.END_OF_SOURCE])

    def testCharacter(self):
        self.assertEqual(self.scanTokenKinds("'a'"), [TokenKind.CHARACTER, TokenKind.END_OF_SOURCE])
        self.assertEqual(self.scanTokenKinds("'$'"), [TokenKind.CHARACTER, TokenKind.END_OF_SOURCE])

    def testFloat(self):
        self.assertEqual(self.scanTokenKinds("42.5"), [TokenKind.FLOAT, TokenKind.END_OF_SOURCE])
        self.assertEqual(self.scanTokenKinds("42.5e+12"), [TokenKind.FLOAT, TokenKind.END_OF_SOURCE])
        self.assertEqual(self.scanTokenKinds("42.5E+12"), [TokenKind.FLOAT, TokenKind.END_OF_SOURCE])
        self.assertEqual(self.scanTokenKinds("42.5e-12"), [TokenKind.FLOAT, TokenKind.END_OF_SOURCE])
        self.assertEqual(self.scanTokenKinds("42.5E-12"), [TokenKind.FLOAT, TokenKind.END_OF_SOURCE])

    def testPunctuations(self):
        self.assertEqual(self.scanTokenKinds("( )"), [TokenKind.LEFT_PARENT, TokenKind.RIGHT_PARENT, TokenKind.END_OF_SOURCE])
        self.assertEqual(self.scanTokenKinds("[ ]"), [TokenKind.LEFT_BRACKET, TokenKind.RIGHT_BRACKET, TokenKind.END_OF_SOURCE])
        self.assertEqual(self.scanTokenKinds("{ }"), [TokenKind.LEFT_CURLY_BRACKET, TokenKind.RIGHT_CURLY_BRACKET, TokenKind.END_OF_SOURCE])
        self.assertEqual(self.scanTokenKinds(". ... ; : |"), [TokenKind.DOT, TokenKind.ELLIPSIS, TokenKind.SEMICOLON, TokenKind.COLON, TokenKind.BAR, TokenKind.END_OF_SOURCE])
        self.assertEqual(self.scanTokenKinds("< >"), [TokenKind.LESS_THAN, TokenKind.GREATER_THAN, TokenKind.END_OF_SOURCE])
        self.assertEqual(self.scanTokenKinds("`' `` `, `@"), [TokenKind.QUOTE, TokenKind.QUASI_QUOTE, TokenKind.QUASI_UNQUOTE, TokenKind.SPLICE, TokenKind.END_OF_SOURCE])
        self.assertEqual(self.scanTokenKinds("? * !"), [TokenKind.QUESTION, TokenKind.STAR, TokenKind.BANG, TokenKind.END_OF_SOURCE])

    def testOperator(self):
        self.assertEqual(self.scanTokenKinds("+"), [TokenKind.OPERATOR, TokenKind.END_OF_SOURCE])
        self.assertEqual(self.scanTokenKinds("-"), [TokenKind.OPERATOR, TokenKind.END_OF_SOURCE])

    def testLowPrecedenceOperator(self):
        self.assertEqual(self.scanTokenKinds("::+"), [TokenKind.LOW_PRECEDENCE_OPERATOR, TokenKind.END_OF_SOURCE])
        self.assertEqual(self.scanTokenKinds("::-"), [TokenKind.LOW_PRECEDENCE_OPERATOR, TokenKind.END_OF_SOURCE])

*/
}
