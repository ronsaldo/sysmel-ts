import { HIRArgument } from "./hir.js";
import {SourceCode, AbstractSourcePosition, SourcePosition} from "./source_code.js"

export abstract class ParseTreeVisitor {
    abstract visitErrorNode(node: ParseTreeErrorNode): any;
    abstract visitParseErrorNode(node: ParseTreeParseErrorNode): any;
    abstract visitRuntimeErrorNode(node: ParseTreeRuntimeErrorNode): any;
    abstract visitAssertNode(node: ParseTreeAssertNode): any;

    abstract visitApplicationNode(node: ParseTreeApplicationNode): any;
    abstract visitAssignmentNode(node: ParseTreeAssignmentNode): any;
    abstract visitAssociationNode(node: ParseTreeAssociationNode): any;
    abstract visitBinaryExpressionSequenceNode(node: ParseTreeBinaryExpressionSequenceNode): any;
    abstract visitDictionaryNode(node: ParseTreeDictionaryNode): any;

    abstract visitIdentifierReferenceNode(node: ParseTreeIdentifierReferenceNode): any;

    abstract visitArgumentDefinitionNode(node: ParseTreeArgumentDefinitionNode): any;
    abstract visitFunctionTypeNode(node: ParseTreeFunctionTypeNode): any;
    abstract visitFunctionNode(node: ParseTreeFunctionNode): any;

    abstract visitLexicalBlockNode(node: ParseTreeLexicalBlockNode): any;

    abstract visitLiteralCharacterNode(node: ParseTreeLiteralCharacterNode): any;
    abstract visitLiteralFloatNode(node: ParseTreeLiteralFloatNode): any;
    abstract visitLiteralIntegerNode(node: ParseTreeLiteralIntegerNode): any;
    abstract visitLiteralStringNode(node: ParseTreeLiteralStringNode): any;
    abstract visitLiteralSymbolNode(node: ParseTreeLiteralSymbolNode): any;
    abstract visitLiteralValueNode(node: ParseTreeLiteralValueNode): any;

    abstract visitCascadedMessageNode(node: ParseTreeCascadedMessageNode): any;
    abstract visitMessageCascadeNode(node: ParseTreeMessageCascadeNode): any;
    abstract visitMessageSendNode(node: ParseTreeMessageSendNode): any;

    abstract visitSequenceNode(node: ParseTreeSequenceNode): any;
    abstract visitTupleNode(node: ParseTreeTupleNode): any;

    abstract visitQuoteNode(node: ParseTreeQuoteNode): any;
    abstract visitQuasiQuoteNode(node: ParseTreeQuasiQuoteNode): any;
    abstract visitQuasiUnquoteNode(node: ParseTreeQuasiUnquoteNode): any;
    abstract visitSpliceNode(node: ParseTreeSpliceNode): any;

    abstract visitVariableDefinitionNode(node: ParseTreeVariableDefinitionNode): any;
    abstract visitIfSelectionNode(node: ParseTreeIfSelectionNode): any;
    abstract visitSwitchSelectionNode(node: ParseTreeSwitchSelectionNode): any;
    abstract visitReturnNode(node: ParseTreeReturnNode): any;
    abstract visitWhileDoNode(node: ParseTreeWhileDoNode): any;
    abstract visitDoWhileNode(node: ParseTreeDoWhileNode): any;

    abstract visitEnumDefinitionNode(node: ParseTreeEnumDefinitionNode): any;
    abstract visitFieldDefinitionNode(node: ParseTreeFieldDefinitionNode): any;
    abstract visitClassDefinitionNode(node: ParseTreeClassDefinitionNode): any;

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
    sourcePosition: AbstractSourcePosition;
    constructor(sourcePosition: AbstractSourcePosition) {
        this.sourcePosition = sourcePosition
    }

    abstract accept(visitor: ParseTreeVisitor): any;

    isErrorNode(): boolean {
        return false;
    }

    isParseErrorNode(): boolean {
        return false;
    }

    isRuntimeErrorNode(): boolean {
        return false;
    }

    isAssertNode(): boolean {
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

    isDictionaryNode(): boolean {
        return false;
    }

    isIdentifierReferenceNode(): boolean {
        return false;
    }

    isArgumentDefinitionNode(): boolean {
        return false;
    }
    
    isFunctionTypeNode(): boolean {
        return false;
    }

    isFunctionNode(): boolean {
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

    isVariableDefinitionNode(): boolean {
        return false;
    }

    isIfSelectionNode(): boolean {
        return false;
    }

    isSwitchSelectionNode(): boolean {
        return false;
    }

    isReturnNode(): boolean {
        return false;
    }

    isWhileDoNode(): boolean {
        return false;
    }

    isDoWhileNode(): boolean {
        return false;
    }

    isEnumDefinitionNode(): boolean {
        return false;
    }

    isFieldDefinitionNode() {
        return false;
    }

    isClassDefinitionNode(): boolean {
        return false;
    }

    asMessageSendWithReceiver(receiver: ParseTreeNode) : ParseTreeNode {
        return this;
    }

    asMessageSendCascadeReceiverAndFirstMessage(): [ParseTreeNode, ParseTreeNode | null] {
        return [this, null]
    }

    parseAsArgumentDefinition(): ParseTreeArgumentDefinitionNode {
        throw new Error(this.sourcePosition.formatMessage('Parse tree is not a valid argument definition.'))
    }
}

export class ParseTreeErrorNode extends ParseTreeNode{
    errorMessage: string;
    constructor(sourcePosition: AbstractSourcePosition, errorMessage: string) {
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

export class ParseTreeRuntimeErrorNode extends ParseTreeNode {
    errorMessage: ParseTreeNode;
    constructor(sourcePosition: AbstractSourcePosition, errorMessage: ParseTreeNode) {
        super(sourcePosition);
        this.errorMessage = errorMessage;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitRuntimeErrorNode(this);
    }

    isRuntimeErrorNode(): boolean {
        return true;
    }
}

export class ParseTreeAssertNode extends ParseTreeNode {
    condition: ParseTreeNode;

    constructor(sourcePosition: AbstractSourcePosition, condition: ParseTreeNode) {
        super(sourcePosition);
        this.condition = condition

    }
    accept(visitor: ParseTreeVisitor) {
        return visitor.visitAssertNode(this)
    }

    isAssertNode(): boolean {
        return true;
    }
}

export class ParseTreeApplicationNode extends ParseTreeNode {
    functional: ParseTreeNode;
    applicationArguments: ParseTreeNode[];
    
    constructor(sourcePosition: AbstractSourcePosition, functional: ParseTreeNode, applicationArguments: ParseTreeNode[]) {
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

    parseAsArgumentDefinition(): ParseTreeArgumentDefinitionNode {
        if (!this.functional.isIdentifierReferenceNode() || this.applicationArguments.length != 1)
            throw new Error(this.sourcePosition.formatMessage('Expected an argument definition expression.'));
        
        let identifier = this.functional as ParseTreeIdentifierReferenceNode;
        let name = identifier.symbol;
        if(name.endsWith(':'))
            name = name.substring(0, name.length - 1);

        let typeExpression = this.applicationArguments[0];
        if(!typeExpression)
            throw new Error(this.sourcePosition.formatMessage('Expected a type expression.'));

        return new ParseTreeArgumentDefinitionNode(this.sourcePosition, name, typeExpression, false)
    }
}

export class ParseTreeAssignmentNode extends ParseTreeNode {
    store: ParseTreeNode;
    value: ParseTreeNode;

    constructor(sourcePosition: AbstractSourcePosition, store: ParseTreeNode, value: ParseTreeNode) {
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
    value: ParseTreeNode | null;

    constructor(sourcePosition: AbstractSourcePosition, key: ParseTreeNode, value: ParseTreeNode | null) {
        super(sourcePosition);
        this.key = key;
        this.value = value;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitAssociationNode(this)
    }

    isAssociationNode(): boolean {
        return true;
    }
}

export class ParseTreeDictionaryNode extends ParseTreeNode {
    elements: ParseTreeNode[];

    constructor(sourcePosition: AbstractSourcePosition, elements: ParseTreeNode[]) {
        super(sourcePosition);
        this.elements = elements;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitDictionaryNode(this);
    }

    isDictionaryNode(): boolean {
        return true;
    }
}

export class ParseTreeBinaryExpressionSequenceNode extends ParseTreeNode {
    operands: ParseTreeNode[];

    constructor(sourcePosition: AbstractSourcePosition, operands: ParseTreeNode[]) {
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
    
    expandAsMessageSends(): ParseTreeNode {
        let previous = this.operands[0] as ParseTreeNode;
        for(let i = 1; i < this.operands.length; i += 2) {
            let operator = this.operands[i];
            let operand = this.operands[i + 1];
            if(!operator || !operand)
                throw new Error('Expected a valid operand.');
            previous = new ParseTreeMessageSendNode(
                (operator.sourcePosition as SourcePosition).until(operand.sourcePosition as SourcePosition),
                previous, operator, [operand]
            );
        }

        return previous;
    }
}

export class ParseTreeIdentifierReferenceNode extends ParseTreeNode {
    symbol: string;

    constructor(sourcePosition: AbstractSourcePosition, symbol: string) {
        super(sourcePosition);
        this.symbol = symbol;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitIdentifierReferenceNode(this)
    }
    
    isIdentifierReferenceNode(): boolean {
        return true;
    }

    parseAsArgumentDefinition(): ParseTreeArgumentDefinitionNode {
        return new ParseTreeArgumentDefinitionNode(this.sourcePosition, this.symbol, null, false);
    }
}

export class ParseTreeArgumentDefinitionNode extends ParseTreeNode {
    name: string | null;
    typeExpression: ParseTreeNode | null;
    isSelf: boolean;

    constructor(sourcePosition: AbstractSourcePosition, name: string | null, typeExpression: ParseTreeNode | null, isSelf: boolean = false) {
        super(sourcePosition);
        this.name = name;
        this.typeExpression = typeExpression;
        this.isSelf = isSelf;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitArgumentDefinitionNode(this);
    }
    
    isArgumentDefinitionNode(): boolean {
        return true;
    }
}

export class ParseTreeFunctionTypeNode extends ParseTreeNode {
    argumentDefinitions: ParseTreeArgumentDefinitionNode[];
    resultTypeExpression: ParseTreeNode | null;

    constructor(sourcePosition: AbstractSourcePosition, argumentDefinitions: ParseTreeArgumentDefinitionNode[], resultTypeExpression: ParseTreeNode | null) {
        super(sourcePosition);
        this.argumentDefinitions = argumentDefinitions;
        this.resultTypeExpression = resultTypeExpression;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitFunctionTypeNode(this);
    }
    
    isFunctionTypeNode(): boolean {
        return true;
    }
}

export class ParseTreeFunctionNode extends ParseTreeNode {
    nameExpression: ParseTreeNode | null;
    functionType: ParseTreeFunctionTypeNode;
    body: ParseTreeNode;
    isPublic: boolean;
    isMethod: boolean;

    constructor(sourcePosition: AbstractSourcePosition,
        nameExpression: ParseTreeNode | null, functionType: ParseTreeFunctionTypeNode,
        body: ParseTreeNode, isPublic: boolean, isMethod: boolean) {
        super(sourcePosition);
        this.nameExpression = nameExpression;
        this.functionType = functionType;
        this.body = body;
        this.isPublic = isPublic;
        this.isMethod = isMethod;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitFunctionNode(this);
    }
    
    isFunctionNode(): boolean {
        return true;
    }
}


export class ParseTreeLexicalBlockNode extends ParseTreeNode {
    body: ParseTreeNode;
    
    constructor(sourcePosition: AbstractSourcePosition, body: ParseTreeNode) {
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

    constructor(sourcePosition: AbstractSourcePosition, value: number) {
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

    constructor(sourcePosition: AbstractSourcePosition, value: number) {
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

    constructor(sourcePosition: AbstractSourcePosition, value: number) {
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

    constructor(sourcePosition: AbstractSourcePosition, value: string) {
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

    constructor(sourcePosition: AbstractSourcePosition, value: string) {
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

    constructor(sourcePosition: AbstractSourcePosition, value: any) {
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

    constructor(sourcePosition: AbstractSourcePosition, selector: ParseTreeNode, sendArguments: ParseTreeNode[]) {
        super(sourcePosition);
        this.selector = selector;
        this.sendArguments = sendArguments;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitCascadedMessageNode(this)
    }
    
    isCascadeMessageNode(): boolean {
        return true;
    }

    asMessageSendWithReceiver(receiver: ParseTreeNode) : ParseTreeNode {
        return new ParseTreeMessageSendNode(this.sourcePosition, receiver, this.selector, this.sendArguments);
    }

}

export class ParseTreeMessageCascadeNode extends ParseTreeNode {
    receiver: ParseTreeNode;
    cascadedMessages: ParseTreeNode[];

    constructor(sourcePosition: AbstractSourcePosition, receiver: ParseTreeNode, cascadedMessages: ParseTreeNode[]) {
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

    constructor(sourcePosition: AbstractSourcePosition, receiver: ParseTreeNode, selector: ParseTreeNode, sendArguments: ParseTreeNode[]) {
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

    constructor(sourcePosition: AbstractSourcePosition, elements: ParseTreeNode[]) {
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

    constructor(sourcePosition: AbstractSourcePosition, elements: ParseTreeNode[]) {
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

    constructor(sourcePosition: AbstractSourcePosition, expression: ParseTreeNode) {
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

    constructor(sourcePosition: AbstractSourcePosition, expression: ParseTreeNode) {
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

    constructor(sourcePosition: AbstractSourcePosition, expression: ParseTreeNode) {
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

    constructor(sourcePosition: AbstractSourcePosition, expression: ParseTreeNode) {
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

export class ParseTreeVariableDefinitionNode extends ParseTreeNode {
    nameExpression: ParseTreeNode | null;
    typeExpression: ParseTreeNode | null;
    initialValue: ParseTreeNode | null;
    isMutable: boolean;

    constructor(sourcePosition: AbstractSourcePosition, nameExpression: ParseTreeNode | null, typeExpression: ParseTreeNode | null, initialValue: ParseTreeNode | null, isMutable: boolean) {
        super(sourcePosition);
        this.nameExpression = nameExpression;
        this.typeExpression = typeExpression;
        this.initialValue = initialValue;
        this.isMutable = isMutable;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitVariableDefinitionNode(this)
    }
    
    isVariableDefinitionNode(): boolean {
        return true;
    }
}

export class ParseTreeIfSelectionNode extends ParseTreeNode {
    condition: ParseTreeNode;
    trueExpression: ParseTreeNode | null;
    falseExpression: ParseTreeNode | null;

    constructor(sourcePosition: AbstractSourcePosition, condition: ParseTreeNode, trueExpression: ParseTreeNode | null, falseExpression: ParseTreeNode | null) {
        super(sourcePosition);
        this.condition = condition;
        this.trueExpression = trueExpression;
        this.falseExpression = falseExpression;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitIfSelectionNode(this)
    }
    
    isIfSelectionNode(): boolean {
        return true;
    }
}

export class ParseTreeSwitchSelectionNode extends ParseTreeNode {
    valueExpression: ParseTreeNode;
    cases: ParseTreeNode;

    constructor(sourcePosition: AbstractSourcePosition, valueExpression: ParseTreeNode, cases: ParseTreeNode) {
        super(sourcePosition);
        this.valueExpression = valueExpression;
        this.cases = cases;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitSwitchSelectionNode(this);
    }
    
    isSwitchSelectionNode(): boolean {
        return true;
    }
}

export class ParseTreeReturnNode extends ParseTreeNode {
    valueExpression: ParseTreeNode;

    constructor(sourcePosition: AbstractSourcePosition, valueExpression: ParseTreeNode) {
        super(sourcePosition);
        this.valueExpression = valueExpression;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitReturnNode(this);
    }
    
    isReturnNode(): boolean {
        return true;
    }
}

export class ParseTreeWhileDoNode extends ParseTreeNode {
    condition: ParseTreeNode;
    bodyExpression: ParseTreeNode;
    continueExpression: ParseTreeNode | null;

    constructor(sourcePosition: AbstractSourcePosition, condition: ParseTreeNode, bodyExpression: ParseTreeNode, continueExpression: ParseTreeNode | null) {
        super(sourcePosition);
        this.condition = condition;
        this.bodyExpression = bodyExpression;
        this.continueExpression = continueExpression;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitWhileDoNode(this);
    }
    
    isWhileDoNode(): boolean {
        return true;
    }
}

export class ParseTreeDoWhileNode extends ParseTreeNode {
    bodyExpression: ParseTreeNode;
    continueExpression: ParseTreeNode | null;
    condition: ParseTreeNode;

    constructor(sourcePosition: AbstractSourcePosition, bodyExpression: ParseTreeNode, continueExpression: ParseTreeNode | null, condition: ParseTreeNode) {
        super(sourcePosition);
        this.bodyExpression = bodyExpression;
        this.continueExpression = continueExpression;
        this.condition = condition;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitDoWhileNode(this);
    }
    
    isDoWhileNode(): boolean {
        return true;
    }
}

export class ParseTreeEnumDefinitionNode extends ParseTreeNode {
    nameExpression: ParseTreeNode | null;
    baseTypeExpression: ParseTreeNode;
    valuesExpression: ParseTreeNode;
    isPublic: boolean;

    constructor(sourcePosition: AbstractSourcePosition, nameExpression: ParseTreeNode | null, baseTypeExpression: ParseTreeNode, valuesExpression: ParseTreeNode, isPublic: boolean)
    {
        super(sourcePosition);

        this.nameExpression = nameExpression;
        this.baseTypeExpression = baseTypeExpression;
        this.valuesExpression = valuesExpression;
        this.isPublic = isPublic;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitEnumDefinitionNode(this);
    }

    isEnumDefinitionNode(): boolean {
        return true;
    }
}

export class ParseTreeFieldDefinitionNode extends ParseTreeNode {
    nameExpression: ParseTreeNode | null;
    typeExpression: ParseTreeNode | null;
    isPublic: boolean;

    constructor(sourcePosition: AbstractSourcePosition, nameExpression: ParseTreeNode | null, typeExpression: ParseTreeNode | null, isPublic: boolean) {
        super(sourcePosition);
        this.nameExpression = nameExpression;
        this.typeExpression = typeExpression;
        this.isPublic = isPublic;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitFieldDefinitionNode(this);
    }

    isFieldDefinitionNode() {
        return true;
    }
}

export class ParseTreeClassDefinitionNode extends ParseTreeNode {
    nameExpression: ParseTreeNode | null;
    superclassExpression: ParseTreeNode | null;
    definitionBody: ParseTreeNode | null;
    isPublic: boolean;

    constructor(sourcePosition: AbstractSourcePosition, nameExpression: ParseTreeNode | null, superclassExpression: ParseTreeNode | null, definitionBody: ParseTreeNode, isPublic: boolean)
    {
        super(sourcePosition);

        this.nameExpression = nameExpression;
        this.superclassExpression = superclassExpression;
        this.definitionBody = definitionBody;
        this.isPublic = isPublic;
    }

    accept(visitor: ParseTreeVisitor) {
        return visitor.visitClassDefinitionNode(this);
    }

    isClassDefinitionNode(): boolean {
        return true;
    }
}

export class ParseTreeSequentialVisitor extends ParseTreeVisitor {
    visitErrorNode(node: ParseTreeErrorNode): any {
    }

    visitParseErrorNode(node: ParseTreeParseErrorNode): any {
    }

    visitRuntimeErrorNode(node: ParseTreeRuntimeErrorNode): any {
        this.visitNode(node.errorMessage);
    }

    visitAssertNode(node: ParseTreeAssertNode): any {
        this.visitNode(node.condition);
    }

    visitApplicationNode(node: ParseTreeApplicationNode): any {
        this.visitNode(node.functional);
        this.visitNodes(node.applicationArguments);
    }

    visitAssignmentNode(node: ParseTreeAssignmentNode): any {
        this.visitNode(node.store);
        this.visitNode(node.value);
    }

    visitAssociationNode(node: ParseTreeAssociationNode): any {
        this.visitNode(node.key);
        this.visitOptionalNode(node.value);
    }

    visitBinaryExpressionSequenceNode(node: ParseTreeBinaryExpressionSequenceNode): any {
        this.visitNodes(node.operands);
    }

    visitDictionaryNode(node: ParseTreeDictionaryNode): any {
        this.visitNodes(node.elements);
    }

    visitIdentifierReferenceNode(node: ParseTreeIdentifierReferenceNode): any {
    }

    visitArgumentDefinitionNode(node: ParseTreeArgumentDefinitionNode): any {
        this.visitOptionalNode(node.typeExpression);
    }

    visitFunctionTypeNode(node: ParseTreeFunctionTypeNode): any {
        this.visitNodes(node.argumentDefinitions);
        this.visitOptionalNode(node.resultTypeExpression);
    }

    visitFunctionNode(node: ParseTreeFunctionNode): any {
        this.visitNode(node.functionType);
        this.visitNode(node.body);
    }

    visitLexicalBlockNode(node: ParseTreeLexicalBlockNode): any {
        this.visitNode(node.body);
    }

    visitLiteralCharacterNode(node: ParseTreeLiteralCharacterNode): any {
    }
    visitLiteralFloatNode(node: ParseTreeLiteralFloatNode): any {
    }
    visitLiteralIntegerNode(node: ParseTreeLiteralIntegerNode): any {
    }
    visitLiteralStringNode(node: ParseTreeLiteralStringNode): any {
    }
    visitLiteralSymbolNode(node: ParseTreeLiteralSymbolNode): any {
    }
    visitLiteralValueNode(node: ParseTreeLiteralValueNode): any {
    }

    visitCascadedMessageNode(node: ParseTreeCascadedMessageNode): any {
        this.visitNode(node.selector);
        this.visitNodes(node.sendArguments);
    }

    visitMessageCascadeNode(node: ParseTreeMessageCascadeNode): any {
        this.visitNode(node.receiver);
        this.visitNodes(node.cascadedMessages);
    }

    visitMessageSendNode(node: ParseTreeMessageSendNode): any {
        this.visitNode(node.receiver);
        this.visitNode(node.selector);
        this.visitNodes(node.sendArguments);
    }

    visitSequenceNode(node: ParseTreeSequenceNode): any {
        this.visitNodes(node.elements);
    }
    
    visitTupleNode(node: ParseTreeTupleNode): any {
        this.visitNodes(node.elements);
    }

    visitQuoteNode(node: ParseTreeQuoteNode): any {
        this.visitNode(node.expression);
    }

    visitQuasiQuoteNode(node: ParseTreeQuasiQuoteNode): any {
        this.visitNode(node.expression);
    }

    visitQuasiUnquoteNode(node: ParseTreeQuasiUnquoteNode): any {
        this.visitNode(node.expression);
    }

    visitSpliceNode(node: ParseTreeSpliceNode): any {
        this.visitNode(node.expression);
    }

    visitVariableDefinitionNode(node: ParseTreeVariableDefinitionNode): any {
        this.visitOptionalNode(node.nameExpression);
        this.visitOptionalNode(node.typeExpression);
        this.visitOptionalNode(node.initialValue);
    }

    visitIfSelectionNode(node: ParseTreeIfSelectionNode): any {
        this.visitNode(node.condition);
        this.visitOptionalNode(node.trueExpression);
        this.visitOptionalNode(node.falseExpression);
    }

    visitSwitchSelectionNode(node: ParseTreeSwitchSelectionNode): any {
        this.visitNode(node.valueExpression);
        this.visitNode(node.cases);
    }

    visitReturnNode(node: ParseTreeReturnNode): any {
        this.visitNode(node.valueExpression);
    }

    visitWhileDoNode(node: ParseTreeWhileDoNode): any {
        this.visitNode(node.condition);
        this.visitNode(node.bodyExpression);
        this.visitOptionalNode(node.continueExpression);

    }

    visitDoWhileNode(node: ParseTreeDoWhileNode): any {
        this.visitNode(node.bodyExpression);
        this.visitOptionalNode(node.continueExpression);
        this.visitNode(node.condition);
    }

    visitEnumDefinitionNode(node: ParseTreeEnumDefinitionNode) {
        this.visitOptionalNode(node.nameExpression);
        this.visitNode(node.baseTypeExpression);
        this.visitNode(node.valuesExpression);
    }

    visitFieldDefinitionNode(node: ParseTreeFieldDefinitionNode) {
        this.visitOptionalNode(node.nameExpression);
        this.visitOptionalNode(node.typeExpression);
    }

    visitClassDefinitionNode(node: ParseTreeClassDefinitionNode) {
        this.visitOptionalNode(node.nameExpression);
        this.visitOptionalNode(node.superclassExpression);
        this.visitOptionalNode(node.definitionBody);
    }
}

export class ParseTreeParseErrorVisitor extends ParseTreeSequentialVisitor {
    errorNodes: ParseTreeParseErrorNode[];

    constructor() {
        super();
        this.errorNodes = []
    }

    visitErrorNode(node: ParseTreeErrorNode) {
        this.errorNodes.push(node);
    }

    checkAndPrintErrors(node: ParseTreeNode) {
        this.visitNode(node);
        for (let i = 0; i < this.errorNodes.length; ++i) {
            let errorNode = this.errorNodes[i] as ParseTreeParseErrorNode;
            console.log(errorNode.sourcePosition.toString() + ': ' + errorNode.errorMessage)
        }

        return this.errorNodes.length == 0;
    }
}