import {SourceCode, SourcePosition} from "./source_code.js"

export abstract class ParseTreeVisitor {
    abstract visitErrorNode(node: ParseTreeErrorNode): any;
    abstract visitParseErrorNode(node: ParseTreeParseErrorNode): any;

    abstract visitLiteralCharacterNode(node: ParseTreeLiteralCharacterNode): any;
    abstract visitLiteralFloatNode(node: ParseTreeLiteralFloatNode): any;
    abstract visitLiteralIntegerNode(node: ParseTreeLiteralIntegerNode): any;
    abstract visitLiteralStringNode(node: ParseTreeLiteralStringNode): any;
    abstract visitLiteralSymbolNode(node: ParseTreeLiteralSymbolNode): any;
    abstract visitLiteralValueNode(node: ParseTreeLiteralValueNode): any;

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