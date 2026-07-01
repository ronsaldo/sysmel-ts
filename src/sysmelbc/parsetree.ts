import {SourceCode, SourcePosition} from "./source_code.js"

export abstract class ParseTreeVisitor {
    abstract visitErrorNode(node: ParseTreeErrorNode): any;
    abstract visitParseErrorNode(node: ParseTreeParseErrorNode): any;

    abstract visitApplicationNode(node: ParseTreeApplicationNode): any;
    abstract visitAssignmentNode(node: ParseTreeAssignmentNode): any;
    abstract visitAssociationNode(node: ParseTreeAssociationNode): any;
    abstract visitBinaryExpressionSequenceNode(node: ParseTreeBinaryExpressionSequenceNode): any;

    abstract visitIdentifierReferenceNode(node: ParseTreeIdentifierReferenceNode): any;

    abstract visitLexicalBlockNode(node: ParseTreeLexicalBlockNode): any;

    abstract visitLiteralCharacterNode(node: ParseTreeLiteralCharacterNode): any;
    abstract visitLiteralFloatNode(node: ParseTreeLiteralFloatNode): any;
    abstract visitLiteralIntegerNode(node: ParseTreeLiteralIntegerNode): any;
    abstract visitLiteralStringNode(node: ParseTreeLiteralStringNode): any;
    abstract visitLiteralSymbolNode(node: ParseTreeLiteralSymbolNode): any;
    abstract visitLiteralValueNode(node: ParseTreeLiteralValueNode): any;

    abstract visitCascadeMessageNode(node: ParseTreeCascadedMessageNode): any;
    abstract visitMessageCascadeNode(node: ParseTreeMessageCascadeNode): any;
    abstract visitMessageSendNode(node: ParseTreeMessageSendNode): any;

    abstract visitSequenceNode(node: ParseTreeSequenceNode): any;
    abstract visitTupleNode(node: ParseTreeTupleNode): any;

    abstract visitQuoteNode(node: ParseTreeQuoteNode): any;
    abstract visitQuasiQuoteNode(node: ParseTreeQuasiQuoteNode): any;
    abstract visitQuasiUnquoteNode(node: ParseTreeQuasiUnquoteNode): any;
    abstract visitSpliceNode(node: ParseTreeSpliceNode): any;

    visitNode(node: ParseTreeNode) : any {
        return node.accept(this)
    }
    visitOptionalNode(node: ParseTreeNode | null) {
        if (!node)
            return null;

        return this.visitNode(node)
    }
    visitNodes(nodes: ParseTreeNode[]) {
        for(let i = 0; i < nodes.length; ++i)
        {
            let node = nodes[i];
            if (node)
                this.visitNode(node)
        }
    }
};

export abstract class ParseTreeNode {
    sourcePosition: SourcePosition;
    constructor(sourcePosition: SourcePosition) {
        this.sourcePosition = sourcePosition
    }

    abstract accept(visitor: ParseTreeVisitor): any;

    isErrorNode(): boolean {
        return false;
    }

    isParseErrorNode(): boolean {
        return false;
    }

    isApplicationNode(): boolean {
        return false;
    }

    isAssignmentNode(): boolean {
        return false;
    }

    isAssociationNode(): boolean {
        return false;
    }

    isBinaryExpressionSequenceNode(): boolean {
        return false;
    }

    isIdentifierReferenceNode(): boolean {
        return false;
    }

    isLexicalBlockNode(): boolean {
        return false;
    }

    isLiteralNode(): boolean {
        return false;
    }

    isLiteralCharacterNode(): boolean {
        return false;
    }

    isLiteralFloatNode(): boolean {
        return false;
    }

    isLiteralIntegerNode(): boolean {
        return false;
    }

    isLiteralStringNode(): boolean {
        return false;
    }

    isLiteralSymbolNode(): boolean {
        return false;
    }

    isLiteralValueNode(): boolean {
        return false;
    }

    isCascadeMessageNode(): boolean {
        return false;
    }

    isMessageCascadeNode(): boolean {
        return false;
    }

    isMessageSendNode(): boolean {
        return false;
    }

    isSequenceNode(): boolean {
        return false;
    }

    isTupleNode(): boolean {
        return false;
    }

    isQuoteNode(): boolean {
        return false;
    }

    isQuasiQuoteNode(): boolean {
        return false;
    }

    isQuasiUnquoteNode(): boolean {
        return false;
    }

    isSpliceNode(): boolean {
        return false;
    }

    asMessageSendCascadeReceiverAndFirstMessage(): [ParseTreeNode, ParseTreeNode | null] {
        return [this, null]
    }
}

export class ParseTreeErrorNode extends ParseTreeNode{
    errorMessage: string;
    constructor(sourcePosition: SourcePosition, errorMessage: string) {
        super(sourcePosition);
        this.errorMessage = errorMessage;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitErrorNode(this);
    }

    isErrorNode(): boolean {
        return true;
    }
}

export class ParseTreeParseErrorNode extends ParseTreeErrorNode{

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitParseErrorNode(this);
    }

    isParseErrorNode(): boolean {
        return true;
    }
}

export class ParseTreeApplicationNode extends ParseTreeNode {
    functional: ParseTreeNode;
    applicationArguments: ParseTreeNode[];
    
    constructor(sourcePosition: SourcePosition, functional: ParseTreeNode, applicationArguments: ParseTreeNode[]) {
        super(sourcePosition);
        this.functional = functional;
        this.applicationArguments = applicationArguments;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitApplicationNode(this);
    }

    isApplicationNode(): boolean {
        return true;
    }
}

export class ParseTreeAssignmentNode extends ParseTreeNode {
    store: ParseTreeNode;
    value: ParseTreeNode;

    constructor(sourcePosition: SourcePosition, store: ParseTreeNode, value: ParseTreeNode) {
        super(sourcePosition);
        this.store = store;
        this.value = value;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitAssignmentNode(this);
    }

    isAssignmentNode(): boolean {
        return true;
    }
}

export class ParseTreeAssociationNode extends ParseTreeNode {
    key: ParseTreeNode;
    value: ParseTreeNode;

    constructor(sourcePosition: SourcePosition, key: ParseTreeNode, value: ParseTreeNode) {
        super(sourcePosition);
        this.key = key;
        this.value = value;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitAssociationNode
    }

    isAssociationNode(): boolean {
        return true;
    }
}

export class ParseTreeBinaryExpressionSequenceNode extends ParseTreeNode {
    operands: ParseTreeNode[];

    constructor(sourcePosition: SourcePosition, operands: ParseTreeNode[]) {
        super(sourcePosition);
        this.operands = operands;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitBinaryExpressionSequenceNode(this);
    }

    isBinaryExpressionSequenceNode(): boolean {
        return true;
    }

    asMessageSendCascadeReceiverAndFirstMessage(): [ParseTreeNode, ParseTreeNode | null] {
        if (this.operands.length < 3)
            throw new Error('Expected at least 3 binary expression operands');
        
        if (this.operands.length === 3) {
            return [this.operands[0] as ParseTreeNode, new ParseTreeCascadedMessageNode(this.sourcePosition, this.operands[1] as ParseTreeNode, [this.operands[2] as ParseTreeNode])];
        }

        let binarySequenceOperands = this.operands.slice(0, this.operands.length - 2);
        let cascadeSelector = this.operands[this.operands.length - 2] as ParseTreeNode;
        let cascadeArgument = this.operands[this.operands.length - 1] as ParseTreeNode;

        return [new ParseTreeBinaryExpressionSequenceNode(this.sourcePosition, binarySequenceOperands),
            new ParseTreeCascadedMessageNode(this.sourcePosition, cascadeSelector, [cascadeArgument])
        ];
    }
}

export class ParseTreeIdentifierReferenceNode extends ParseTreeNode {
    symbol: string;

    constructor(sourcePosition: SourcePosition, symbol: string) {
        super(sourcePosition);
        this.symbol = symbol;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitIdentifierReferenceNode(this)
    }
    
    isIdentifierReferenceNode(): boolean {
        return true;
    }
}

export class ParseTreeLexicalBlockNode extends ParseTreeNode {
    body: ParseTreeNode;
    
    constructor(sourcePosition: SourcePosition, body: ParseTreeNode) {
        super(sourcePosition);
        this.body = body;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitLexicalBlockNode(this)
    }
    
    isLexicalBlockNode(): boolean {
        return true;
    }
}

export abstract class ParseTreeLiteralNode extends ParseTreeNode {
    isLiteralNode(): boolean {
        return true;
    }
}

export class ParseTreeLiteralCharacterNode extends ParseTreeNode {
    value: number;

    constructor(sourcePosition: SourcePosition, value: number) {
        super(sourcePosition);
        this.value = value;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitLiteralCharacterNode(this)
    }
    
    isLiteralCharacterNode(): boolean {
        return true;
    }
}

export class ParseTreeLiteralFloatNode extends ParseTreeNode {
    value: number;

    constructor(sourcePosition: SourcePosition, value: number) {
        super(sourcePosition);
        this.value = value;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitLiteralFloatNode(this)
    }
    
    isLiteralFloatNode(): boolean {
        return true;
    }
}

export class ParseTreeLiteralIntegerNode extends ParseTreeNode {
    value: number;

    constructor(sourcePosition: SourcePosition, value: number) {
        super(sourcePosition);
        this.value = value;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitLiteralIntegerNode(this)
    }
    
    isLiteralIntegerNode(): boolean {
        return true;
    }
}

export class ParseTreeLiteralStringNode extends ParseTreeNode {
    value: string;

    constructor(sourcePosition: SourcePosition, value: string) {
        super(sourcePosition);
        this.value = value;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitLiteralStringNode(this)
    }
    
    isLiteralStringNode(): boolean {
        return true;
    }
}

export class ParseTreeLiteralSymbolNode extends ParseTreeNode {
    value: string;

    constructor(sourcePosition: SourcePosition, value: string) {
        super(sourcePosition);
        this.value = value;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitLiteralSymbolNode(this)
    }
    
    isLiteralSymbolNode(): boolean {
        return true;
    }
}

export class ParseTreeLiteralValueNode extends ParseTreeNode {
    value: any;

    constructor(sourcePosition: SourcePosition, value: any) {
        super(sourcePosition);
        this.value = value;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitLiteralValueNode(this)
    }
    
    isLiteralValueNode(): boolean {
        return true;
    }
}

export class ParseTreeCascadedMessageNode extends ParseTreeNode {
    selector: ParseTreeNode;
    sendArguments: ParseTreeNode[];

    constructor(sourcePosition: SourcePosition, selector: ParseTreeNode, sendArguments: ParseTreeNode[]) {
        super(sourcePosition);
        this.selector = selector;
        this.sendArguments = sendArguments;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitCascadeMessageNode(this)
    }
    
    isCascadeMessageNode(): boolean {
        return true;
    }
}

export class ParseTreeMessageCascadeNode extends ParseTreeNode {
    receiver: ParseTreeNode;
    cascadedMessages: ParseTreeNode[];

    constructor(sourcePosition: SourcePosition, receiver: ParseTreeNode, cascadedMessages: ParseTreeNode[]) {
        super(sourcePosition);
        this.receiver = receiver;
        this.cascadedMessages = cascadedMessages;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitMessageCascadeNode(this);
    }
    
    isCascadeMessageNode(): boolean {
        return true;
    }
}

export class ParseTreeMessageSendNode extends ParseTreeNode {
    receiver: ParseTreeNode;
    selector: ParseTreeNode;
    sendArguments: ParseTreeNode[];

    constructor(sourcePosition: SourcePosition, receiver: ParseTreeNode, selector: ParseTreeNode, sendArguments: ParseTreeNode[]) {
        super(sourcePosition);
        this.receiver = receiver;
        this.selector = selector;
        this.sendArguments = sendArguments;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitMessageSendNode(this)
    }
    
    isMessageSendNode(): boolean {
        return true;
    }

    asMessageSendCascadeReceiverAndFirstMessage(): [ParseTreeNode, ParseTreeNode | null] {
        return [this.receiver, new ParseTreeCascadedMessageNode(this.sourcePosition, this.selector, this.sendArguments)];
    }
}

export class ParseTreeSequenceNode extends ParseTreeNode {
    elements: ParseTreeNode[];

    constructor(sourcePosition: SourcePosition, elements: ParseTreeNode[]) {
        super(sourcePosition);
        this.elements = elements;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitSequenceNode(this)
    }
    
    isSequenceNode(): boolean {
        return true;
    }
}

export class ParseTreeTupleNode extends ParseTreeNode {
    elements: ParseTreeNode[];

    constructor(sourcePosition: SourcePosition, elements: ParseTreeNode[]) {
        super(sourcePosition);
        this.elements = elements;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitTupleNode(this)
    }
    
    isTupleNode(): boolean {
        return true;
    }
}

export class ParseTreeQuoteNode extends ParseTreeNode {
    expression: ParseTreeNode;

    constructor(sourcePosition: SourcePosition, expression: ParseTreeNode) {
        super(sourcePosition);
        this.expression = expression;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitQuoteNode(this)
    }
    
    isQuoteNode(): boolean {
        return true;
    }
}

export class ParseTreeQuasiQuoteNode extends ParseTreeNode {
    expression: ParseTreeNode;

    constructor(sourcePosition: SourcePosition, expression: ParseTreeNode) {
        super(sourcePosition);
        this.expression = expression;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitQuasiQuoteNode(this)
    }
    
    isQuasiQuoteNode(): boolean {
        return true;
    }
}

export class ParseTreeQuasiUnquoteNode extends ParseTreeNode {
    expression: ParseTreeNode;

    constructor(sourcePosition: SourcePosition, expression: ParseTreeNode) {
        super(sourcePosition);
        this.expression = expression;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitQuasiUnquoteNode(this);
    }
    
    isQuasiUnquoteNode(): boolean {
        return true;
    }
}


export class ParseTreeSpliceNode extends ParseTreeNode {
    expression: ParseTreeNode;

    constructor(sourcePosition: SourcePosition, expression: ParseTreeNode) {
        super(sourcePosition);
        this.expression = expression;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitSpliceNode(this)
    }
    
    isSpliceNode(): boolean {
        return true;
    }
}

