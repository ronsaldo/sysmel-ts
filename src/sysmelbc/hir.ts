import {AbstractSourcePosition, getOrMakeEmptySourcePosition, SourceCode} from "./source_code.js"
import * as parseTree from "./parsetree.js"

export abstract class HIRValue {
    sourcePosition: AbstractSourcePosition;

    constructor(sourcePosition: AbstractSourcePosition) {
        this.sourcePosition = sourcePosition;
    }

    abstract getType(): HIRType;

    evaluateAsBoolean(): boolean {
        throw new Error(this.sourcePosition.formatMessage('Not a boolean value'))
    }

    evaluateAsInteger(): number {
        throw new Error(this.sourcePosition.formatMessage('Not an integer value'))
    }

    evaluateAsFloat(): number {
        throw new Error(this.sourcePosition.formatMessage('Not a float value'))
    }

    evaluateAsNumber(): number {
        throw new Error(this.sourcePosition.formatMessage('Not a numerical value'))
    }

    evaluateAsSymbol(): string {
        throw new Error(this.sourcePosition.formatMessage('Not a symbol value'))
    }

    isType(): boolean {
        return false;
    }

    isDependentFunctionType(): boolean {
        return false;
    }

    isSimpleFunctionType(): boolean {
        return false;
    }

    isNominalType(): boolean {
        return false;
    }

    isDynamicType(): boolean {
        return false;
    }

    isPrimitiveType() : boolean {
        return false;
    }

    isUndefinedType(): boolean {
        return false;
    }

    isUniverseType(): boolean {
        return false;
    }

    isVoidType() : boolean {
        return false;
    }

    isDerivedType() : boolean {
        return false;
    }

    isPointerLikeType() : boolean {
        return false;
    }

    isPointerType() : boolean {
        return false;
    }

    isReferenceType() : boolean {
        return false;
    }

    isMutableValueBoxType() : boolean {
        return false;
    }

    isMutableValueBox() : boolean {
        return false;
    }

    isPointerLikeValue() : boolean {
        return false;
    }

    isPointerValue() : boolean {
        return false;
    }

    isReferenceValue() : boolean {
        return false;
    }

    isAssociationType() : boolean {
        return false;
    }

    isTupleType() : boolean {
        return false;
    }

    isConstant() : boolean {
        return false;
    }

    isConstantLiteralValue() : boolean {
        return false;
    }

    isConstantLiteralIntegerValue() : boolean {
        return false;
    }

    isConstantLiteralFloatValue() : boolean {
        return false;
    }

    isConstantLiteralBooleanValue() : boolean {
        return false;
    }

    isConstantLiteralCharacterValue() : boolean {
        return false;
    }

    isConstantLiteralStringValue() : boolean {
        return false;
    }

    isConstantLiteralSymbolValue() : boolean {
        return false;
    }

    isConstantLiteralVoidValue() : boolean {
        return false;
    }

    isConstantLiteralNilValue() : boolean {
        return false;
    }

    isConstantLiteralUndefinedValue() : boolean {
        return false;
    }
    
    isConstantLiteralParseTree() : boolean {
        return false;
    }

    isConstantAssociation() : boolean {
        return false;
    }

    isConstantTuple() : boolean {
        return false;
    }

    isFunctionLocalValue() : boolean {
        return false;
    }

    isArgument() : boolean {
        return false;
    }

    isCapture() : boolean {
        return false;
    }

    isBasicBlock() : boolean {
        return false;
    }

    isInstruction() : boolean {
        return false;
    }

    isPhiInstruction() : boolean {
        return false;
    }

    isTerminatorInstruction() : boolean {
        return false;
    }

    getValueInEvaluationContext(context: HIRFunctionActivationContext): HIRValue {
        return this;
    }

    evaluateWithArgumentsAndResultTypeAt(callArguments: HIRValue[], resultType: HIRType, callSourcePosition: AbstractSourcePosition): HIRValue {
        throw new Error(callSourcePosition.formatMessage('Called value is non functional.'));
    }

    storeValueAtIndex(valueToStore: HIRValue, index: number): void {
        throw new Error(this.sourcePosition.formatMessage('Invalid value for storing a field.'));
    }

    loadValueAtIndex(index: number): HIRValue {
        throw new Error(this.sourcePosition.formatMessage('Invalid value for loading a field.'));
    }

    storeValue(valueToStore: HIRValue): void {
        throw new Error(this.sourcePosition.formatMessage('Invalid value for storing a pointer or reference.'));
    }

    loadValue(): HIRValue {
        throw new Error(this.sourcePosition.formatMessage('Invalid value for loading a pointer or reference.'));
    }

    analyzeAndEvaluateIdentifierReferenceNode(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeIdentifierReferenceNode) : HIRValue {
        return this;
    }

    analyzeAndEvaluateApplicationNode(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeApplicationNode, functional: HIRValue) {
        throw new Error(node.sourcePosition.formatMessage('Non-functional value cannot be applied.'))
    }

    analyzeAndEvaluateAssignment(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeAssignmentNode) : HIRValue {
        throw new Error(node.sourcePosition.formatMessage('Value does not support assignment.'))
    }

    analyzeAndEvaluateMessageSendNode(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue) : HIRValue {
        let selfType = this.getType();
        return selfType.analyzeAndEvaluateMessageSendNodeOnType(evaluator, node, receiver)
    }
    
}

export class HIRType extends HIRValue {
    coreTypes: HIRCoreTypes;

    constructor(coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(sourcePosition);
        this.coreTypes = coreTypes;
    }

    getName() : string | null {
        return null;
    }

    toString(): string {
        let name = this.getName();
        if(!name)
            return '<AnonType>';
        return name;
    }

    getOrCreateDefaultValue(): HIRValue {
        throw new Error(this.sourcePosition.formatMessage(`Type ${this.toString()} does not have a default value.`));
    }

    getType(): HIRType {
        return this.coreTypes.getUniverseAtLevel(0);
    }

    isType(): boolean {
        return true;
    }

    isSatisfiedByValue(value: HIRValue) {
        return this.isSatisfiedByType(value.getType())
    }

    isSatisfiedByType(subtype: HIRValue) {
        return this === subtype;
    }

    analyzeAndEvaluateMessageSendNodeOnType(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue) : HIRValue {
        let selector = evaluator.visitSymbolNode(node.selector);

        // FIXME: remove this hack
        if(selector == 'yourself')
            return receiver;

        let foundMethod = this.lookupSelector(selector);
        if(!foundMethod)
            throw new Error(node.sourcePosition.formatMessage(`type '${this.toString()}' does not have method with selector #${selector}.`))

        return foundMethod.analyzeAndEvaluateMessageSendNode(evaluator, node, receiver)
    }

    evaluateAndTypecheckArguments(evaluator: AnalysisAndEvaluationPass, callArguments: parseTree.ParseTreeNode[], sourcePosition: AbstractSourcePosition): [HIRValue[], HIRType] {
        throw new Error(sourcePosition.formatMessage('Receiver type is non-functional.'))
    }

    lookupSelector(selector: string) : HIRValue | null {
        return null;
    }
}

export class HIRNominalType extends HIRType {
    name: string | null;
    methodDictionary: Record<string, HIRValue> = {}

    constructor(name:string | null, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(coreTypes, sourcePosition);
        this.name = name;
    }

    getName() : string | null {
        return this.name;
    }

    isNominalType(): boolean {
        return true;
    }

    addPrimitiveMethod(method: HIRPrimitiveFunction) {
        this.withSelectorAddMethod(method.selector, method)
    }

    withSelectorAddMethod(selector: string, method: HIRValue) {
        this.methodDictionary[selector] = method;
    }

    lookupSelector(selector: string): HIRValue | null {
        if (selector in this.methodDictionary)
            return this.methodDictionary[selector] as HIRValue;
        return null;
    }

    toString(): string {
        if (!this.name)
            return '<AnonimousType>';
        return this.name;
    }
}

export class HIRDynamicType extends HIRType {
    name: string;

    constructor(name:string, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(coreTypes, sourcePosition);
        this.name = name;
    }

    getName() : string | null {
        return this.name;
    }

    isDynamicType(): boolean {
        return true;
    }

    toString(): string {
        return this.name;
    }
}

export class HIRPrimitiveType extends HIRNominalType {
    size: number;
    alignment: number;

    constructor(name:string, size: number, alignment: number, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(name, coreTypes, sourcePosition);
        this.name = name;
        this.size = size
        this.alignment = alignment;
    }

    isPrimitiveType(): boolean {
        return true;
    }
}

export class HIRUndefinedType extends HIRType {
    name: string;

    constructor(name:string, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(coreTypes, sourcePosition);
        this.name = name;
    }

    getName() : string | null {
        return this.name;
    }

    isUndefinedType(): boolean {
        return true;
    }

    toString(): string {
        return this.name;
    }
}

export class HIRVoidType extends HIRType {
    name: string;

    constructor(name:string, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(coreTypes, sourcePosition);
        this.name = name;
    }

    getName() : string | null {
        return this.name;
    }

    isVoidType(): boolean {
        return true;
    }

    toString(): string {
        return this.name;
    }
}

export class HIRUniverseType extends HIRType {
    level: number;

    constructor(level: number, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(coreTypes, sourcePosition);
        this.level = level
    }

    getName() : string | null {
        if (this.level == 0) {
            return 'Type'
        }
        return null;
    }

    isUniverseType(): boolean {
        return true;
    }

    toString(): string {
        if (this.level == 0) {
            return 'Type'
        }
        return 'Type@' + this.level;
    }
}

export class HIRDerivedType extends HIRType {
    baseType: HIRType;

    constructor(baseType: HIRType, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(coreTypes, sourcePosition);
        this.baseType = baseType;
    }

    isDerivedType(): boolean {
        return true;
    }
}

export class HIRPointerLikeType extends HIRDerivedType {
    constructor(baseType: HIRType, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(baseType, coreTypes, sourcePosition);
    }

    isPointerLikeType(): boolean {
        return true;
    }
}

export class HIRPointerType extends HIRPointerLikeType {
    constructor(baseType: HIRType, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(baseType, coreTypes, sourcePosition);
    }

    isPointerType(): boolean {
        return true;
    }

    toString(): string {
        return this.baseType.toString() + ' pointer';
    }
}

export class HIRReferenceType extends HIRPointerLikeType {
    constructor(baseType: HIRType, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(baseType, coreTypes, sourcePosition);
    }

    isReferenceType(): boolean {
        return true;
    }

    analyzeAndEvaluateMessageSendNode(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue): HIRValue {
        return this.baseType.analyzeAndEvaluateMessageSendNode(evaluator, node, receiver);
    }

    lookupSelector(selector: string): HIRValue | null {
        return this.baseType.lookupSelector(selector)
    }

    toString(): string {
        return this.baseType.toString() + ' ref';
    }
}

export class HIRMutableValueBoxType extends HIRPointerLikeType {
    constructor(baseType: HIRType, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(baseType, coreTypes, sourcePosition);
    }

    isMutableValueBoxType(): boolean {
        return true;
    }
}

/*
    isTupleType() : boolean {
        return false;
    }
*/

export class HIRAssociationType extends HIRType {
    keyType: HIRType;
    valueType: HIRType;

    constructor(keyType: HIRType, valueType: HIRType, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(coreTypes, sourcePosition);
        this.keyType = keyType;
        this.valueType = valueType;
    }

    isAssociationType(): boolean {
        return true;
    }
}

export class HIRTupleType extends HIRType {
    elements: HIRType[];

    constructor(elements: HIRType[], coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(coreTypes, sourcePosition);
        this.elements = elements;
    }

    isTupleType(): boolean {
        return true;
    }
}

export class HIRDependentFunctionType extends HIRType {
    functionArguments: HIRArgument[];
    resultType: HIRType;

    constructor(functionArguments: HIRArgument[], resultType: HIRType, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(coreTypes, sourcePosition);
        this.functionArguments = functionArguments;
        this.resultType = resultType;
    }

    canSimplifiy(): boolean {
        return true;
    }

    asSimplifiedType() : HIRType {
        if (!this.canSimplifiy())
            return this;

        let argumentTypes: HIRType[] = [];
        for(let i = 0; i < this.functionArguments.length; ++i) {
            let argument = this.functionArguments[i];
            if(!argument)
                throw new Error("Expected an argument.");

            argumentTypes.push(argument.getType());
        }

        return new HIRSimpleFunctionType(argumentTypes, this.resultType, this.coreTypes, this.sourcePosition);
    }

    isDependentFunctionType(): boolean {
        return true;
    }
}

export class HIRSimpleFunctionType extends HIRType {
    argumentTypes: HIRType[];
    resultType: HIRType;

    constructor(argumentTypes: HIRType[], resultType: HIRType, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(coreTypes, sourcePosition);
        this.argumentTypes = argumentTypes;
        this.resultType = resultType;
    }

    isSimpleFunctionType(): boolean {
        return true;
    }

    evaluateAndTypecheckArguments(evaluator: AnalysisAndEvaluationPass, callArguments: parseTree.ParseTreeNode[], sourcePosition: AbstractSourcePosition): [HIRValue[], HIRType] {
        if(callArguments.length !== this.argumentTypes.length) {
            throw new Error(sourcePosition.formatMessage(`Expected ${this.argumentTypes.length.toString()} arguments instead of ${callArguments.length.toString()}.`))
        }

        let typecheckedArguments: HIRValue[] = [];
        for(let i = 0; i < callArguments.length; ++i) {
            let callArgument = callArguments[i];
            let expectedType = this.argumentTypes[i];
            if(!callArgument || !expectedType)
                throw new Error('Expected a valid argument.');

            let typecheckedArgument = evaluator.visitNodeWithExpectedType(callArgument, expectedType);
            typecheckedArguments.push(typecheckedArgument)
        }
        return [typecheckedArguments, this.resultType];
    }
}

export abstract class HIRConstant extends HIRValue {
    constructor(sourcePosition: AbstractSourcePosition) {
        super(sourcePosition);
    }

    isConstantValue() : boolean {
        return true
    }
}

export abstract class HIRConstantLiteralValue extends HIRValue {
    type: HIRType;

    constructor(type: HIRType, sourcePosition: AbstractSourcePosition) {
        super(sourcePosition);
        this.type = type;
    }

    getType(): HIRType {
        return this.type;
    }

    isConstantLiteralValue() : boolean {
        return true
    }
}

export class HIRConstantLiteralIntegerValue extends HIRConstantLiteralValue {
    value: number;

    constructor(value:number, type: HIRType, sourcePosition: AbstractSourcePosition) {
        super(type, sourcePosition);
        this.value = value;
    }

    evaluateAsInteger(): number {
        return this.value;
    }

    evaluateAsNumber(): number {
        return this.value;
    }

    isConstantLiteralIntegerValue() : boolean {
        return true
    }

    toString(): string {
        return 'constantLiteralInteger ' + this.value;
    }
}

export class HIRConstantLiteralFloatValue extends HIRConstantLiteralValue {
    value: number;

    constructor(value:number, type: HIRType, sourcePosition: AbstractSourcePosition) {
        super(type, sourcePosition);
        this.value = value;
    }
    
    evaluateAsFloat(): number {
        return this.value;
    }

    evaluateAsNumber(): number {
        return this.value;
    }

    isConstantLiteralFloatValue() : boolean {
        return true
    }
    
    toString(): string {
        return 'constantLiteralFloat ' + this.value;
    }

}

export class HIRConstantLiteralBooleanValue extends HIRConstantLiteralValue {
    value: boolean;

    constructor(value: boolean, type: HIRType, sourcePosition: AbstractSourcePosition) {
        super(type, sourcePosition);
        this.value = value;
    }

    evaluateAsBoolean(): boolean {
        return this.value;
    }

    isConstantLiteralBooleanValue() : boolean {
        return true
    }

    toString(): string {
        return 'constantLiteralBoolean ' + this.value;
    }
}

export class HIRConstantLiteralCharacterValue extends HIRConstantLiteralValue {
    value: number;

    constructor(value:number, type: HIRType, sourcePosition: AbstractSourcePosition) {
        super(type, sourcePosition);
        this.value = value;
    }
    
    evaluateAsInteger(): number {
        return this.value;
    }

    evaluateAsNumber(): number {
        return this.value;
    }

    isConstantLiteralCharacterValue() : boolean {
        return true
    }

    toString(): string {
        return 'constantLiteralCharacter ' + this.value;
    }
}

export class HIRConstantLiteralStringValue extends HIRConstantLiteralValue {
    value: string;

    constructor(value:string, type: HIRType, sourcePosition: AbstractSourcePosition) {
        super(type, sourcePosition);
        this.value = value;
    }

    isConstantLiteralStringValue() : boolean {
        return true
    }

    toString(): string {
        return 'constantLiteralString ' + this.value;
    }
}

export class HIRConstantLiteralSymbolValue extends HIRConstantLiteralValue {
    value: string;

    constructor(value:string, type: HIRType, sourcePosition: AbstractSourcePosition) {
        super(type, sourcePosition);
        this.value = value;
    }

    evaluateAsSymbol(): string {
        return this.value;
    }

    isConstantLiteralSymbolValue() : boolean {
        return true
    }

    toString(): string {
        return 'constantLiteralSymbol ' + this.value;
    }
}

export class HIRConstantLiteralVoidValue extends HIRConstantLiteralValue {
    constructor(type: HIRType, sourcePosition: AbstractSourcePosition) {
        super(type, sourcePosition);
    }

    isConstantLiteralVoidValue() : boolean {
        return true
    }

    toString(): string {
        return 'constantLiteralVoid';
    }
}

export class HIRConstantLiteralNilValue extends HIRConstantLiteralValue {
    constructor(type: HIRType, sourcePosition: AbstractSourcePosition) {
        super(type, sourcePosition);
    }

    isConstantLiteralNilValue() : boolean {
        return true
    }


    toString(): string {
        return 'constantLiteralNil';
    }
}

export class HIRConstantLiteralUndefinedValue extends HIRConstantLiteralValue {
    constructor(type: HIRType, sourcePosition: AbstractSourcePosition) {
        super(type, sourcePosition);
    }

    isConstantLiteralUndefinedValue() : boolean {
        return true
    }


    toString(): string {
        return 'constantLiteralUndefined';
    }
}

export class HIRConstantLiteralParseTree extends HIRConstantLiteralValue {
    value: parseTree.ParseTreeNode;

    constructor(value: parseTree.ParseTreeNode, type: HIRType, sourcePosition: AbstractSourcePosition) {
        super(type, sourcePosition);
        this.value = value;
    }

    isConstantLiteralParseTree(): boolean {
        return true;
    }

    toString(): string {
        return 'constantLiteralParseTree';
    }
}

export class HIRConstantAssociation extends HIRConstant {
    key: HIRValue;
    value: HIRValue;
    type: HIRType;

    constructor(key: HIRValue, value: HIRValue, type: HIRType, sourcePosition: AbstractSourcePosition) {
        super(sourcePosition);
        this.key = key;
        this.value = value;
        this.type = type;
    }

    getType(): HIRType {
        return this.type;
    }

    isConstantAssociation(): boolean {
        return true;
    }

    toString(): string {
        return `association ${this.key.toString()} `;
    }
}

export class HIRConstantTuple extends HIRConstant {
    elements: HIRValue[];
    type: HIRType;

    constructor(elements: HIRValue[], type: HIRType, sourcePosition: AbstractSourcePosition) {
        super(sourcePosition);
        this.elements = elements;
        this.type = type;
    }

    getType(): HIRType {
        return this.type;
    }

    isConstantTuple(): boolean {
        return true;
    }

    toString(): string {
        return `tuple ${this.elements.toString()} `;
    }
}

export class HIRMacroContext extends HIRValue {
    coreTypes: HIRCoreTypes;

    constructor(coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(sourcePosition);
        this.coreTypes = coreTypes;
    }

    getType(): HIRType {
        return this.coreTypes.macroContextType;
    }
}

export class HIRPrimitiveMacro extends HIRConstant {
    name: string;
    type: HIRType;
    primitiveFunction: any;

    constructor(name: string, type: HIRType, primitiveFunction: any, sourcePosition: AbstractSourcePosition) {
        super(sourcePosition);
        this.name = name;
        this.type = type;
        this.primitiveFunction = primitiveFunction;
    }

    getType(): HIRType {
        return this.type;
    }

    analyzeAndEvaluateMessageSendNode(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue): HIRValue {
        throw new Error('TODO: HIRPrimitiveMacro analyzeAndEvaluateMessageSendNode')
    }

    analyzeAndEvaluateApplicationNode(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeApplicationNode, functional: HIRValue) {
        let macroContext = new HIRMacroContext(evaluator.evaluationContext.context.coreTypes, node.sourcePosition);
        let expandedMacro = this.primitiveFunction(macroContext, ...node.applicationArguments) as parseTree.ParseTreeNode;
        return evaluator.visitNode(expandedMacro);
    }
}

export class HIRPrimitiveFunction extends HIRConstant {
    selector: string;
    name: string;
    type: HIRType;
    primitiveFunction: any;
    isCompileTime: boolean;
    isPure: boolean;

    constructor(selector: string, name: string, type: HIRType, primitiveFunction: any, isCompileTime: boolean, isPure: boolean, sourcePosition: AbstractSourcePosition) {
        super(sourcePosition);
        this.selector = selector;
        this.name = name;
        this.type = type;
        this.primitiveFunction = primitiveFunction;
        this.isCompileTime = isCompileTime;
        this.isPure = isPure;
    }

    getType(): HIRType {
        return this.type;
    }

    analyzeAndEvaluateMessageSendNode(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue): HIRValue {
        let receiverNode = new parseTree.ParseTreeLiteralValueNode(node.sourcePosition, receiver);
        let allArguments: parseTree.ParseTreeNode[] = [receiverNode];
        allArguments.push(...node.sendArguments);
        let [typecheckedArguments, resultType] = this.type.evaluateAndTypecheckArguments(evaluator, allArguments, node.sourcePosition);
        return this.primitiveFunction(...typecheckedArguments, resultType, node.sourcePosition)
    }

    analyzeAndEvaluateApplicationNode(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeApplicationNode, functional: HIRValue) {
        throw new Error('TODO: HIRPrimitiveFunction analyzeAndEvaluateApplicationNode')
    }
}

export class HIRMutableValueBox extends HIRValue {
    type: HIRType;
    value: HIRValue;

    constructor(type: HIRType, value: HIRValue, sourcePosition: AbstractSourcePosition) {
        super(sourcePosition);
        this.type = type;
        this.value = value;
    }

    getType(): HIRType {
        return this.type;
    }

    storeValueAtIndex(valueToStore: HIRValue, index: number): void {
        if (index !== 0)
            throw new Error(this.sourcePosition.formatMessage('Invalid field index for storing in a mutable value box'));
        this.value = valueToStore;
    }

    loadValueAtIndex(index: number): HIRValue {
        if (index !== 0)
            throw new Error(this.sourcePosition.formatMessage('Invalid field index for loading from a mutable value box'));

        return this.value;
    }
}

export class HIRPointerLikeValue extends HIRValue {
    type: HIRType;
    storage: HIRValue;
    index: number;

    constructor(type: HIRType, storage: HIRValue, index: number, sourcePosition: AbstractSourcePosition) {
        super(sourcePosition);
        this.type = type;
        this.storage = storage;
        this.index = index;
    }

    getType(): HIRType {
        return this.type;
    }

    isPointerLikeValue(): boolean {
        return true;
    }

    storeValue(valueToStore: HIRValue): void {
        return this.storage.storeValueAtIndex(valueToStore, this.index);
    }

    loadValue(): HIRValue {
        return this.storage.loadValueAtIndex(this.index);
    }
}

export class HIRPointerValue extends HIRPointerLikeValue {
    isPointerValue(): boolean {
        return true;
    }
}

export class HIRReferenceValue extends HIRPointerLikeValue {
    isReferenceValue(): boolean {
        return true;
    }

    analyzeAndEvaluateAssignment(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeAssignmentNode) : HIRValue {
        this.storeValue(evaluator.visitNodeWithExpectedType(node.value, (this.type as HIRPointerLikeType).baseType))
        return this;
    }
}

export class HIRFunction extends HIRConstant {
    name: string | null;
    dependentFunctionType: HIRDependentFunctionType;
    simplifiedType: HIRType;
    captures: HIRCapture[] = [];

    firstBasicBlock: HIRBasicBlock | null = null;
    lastBasicBlock: HIRBasicBlock | null = null;
    enumeratedInstructions: HIRFunctionLocalValue[] | null = null; 

    constructor(name: string | null, dependentFunctionType: HIRDependentFunctionType, sourcePosition: AbstractSourcePosition) {
        super(sourcePosition);
        this.name = name;
        this.dependentFunctionType = dependentFunctionType;
        this.simplifiedType = dependentFunctionType.asSimplifiedType();
    }

    getType(): HIRType {
        return this.simplifiedType;
    }

    addBasicBlock(basicBlock: HIRBasicBlock): void {
        if(this.lastBasicBlock === null) {
            this.firstBasicBlock = this.lastBasicBlock = basicBlock;
        } else {
            basicBlock.previousBasicBlock = this.lastBasicBlock;
            this.lastBasicBlock.nextBasicBlock = basicBlock;
            this.lastBasicBlock = basicBlock;
        }
    }

    enumerateInstructions(): HIRFunctionLocalValue[] {
        if(this.enumeratedInstructions !== null)
            return this.enumeratedInstructions;

        let instructions: HIRFunctionLocalValue[] = [];
        this.enumeratedInstructions = instructions;

        function addLocalValue(localValue: HIRFunctionLocalValue): void {
            localValue.index = instructions.length;
            instructions.push(localValue);
        }

        // Arguments.
        for(let i = 0; i < this.dependentFunctionType.functionArguments.length; ++i) {
            let argument = this.dependentFunctionType.functionArguments[i];
            if(!argument)
                throw new Error('Expected an argument value');
            addLocalValue(argument);
        }

        // Captures
        for(let i = 0; i < this.captures.length; ++i) {
            let capture = this.captures[i];
            if(!capture)
                throw new Error('Expected a capture value value');
            addLocalValue(capture);
        }

        // Basic blocks
        let basicBlock = this.firstBasicBlock;
        while(basicBlock) {
            addLocalValue(basicBlock);
            let instruction = basicBlock.firstInstruction;

            // Instructions
            while(instruction) {
                addLocalValue(instruction);
                instruction = instruction.nextInstruction;
            }

            basicBlock = basicBlock.nextBasicBlock;
        }

        return instructions;
    }

    toString(): string {
        if (this.name)
            return 'HIRFunction ' + this.name;
        else
            return '<anonymous function>';
    }

    fullPrintString(): string {
        this.enumerateInstructions();
        let result = "HIRFunction ";
        if (this.name)
            result += this.name;
        result += " {\n"

        for(let i = 0; i < this.dependentFunctionType.functionArguments.length; ++i) {
            let argument = this.dependentFunctionType.functionArguments[i];
            if(!argument)
                throw new Error('Expected a valid argument');
            result += argument.fullPrintString();
            result += '\n';
        }

        let basicBlock = this.firstBasicBlock;
        while(basicBlock)
        {
            result += basicBlock.fullPrintString();
            basicBlock = basicBlock.nextBasicBlock;
        }

        result += '}'
        return result
    }

    evaluateWithArgumentsAndCaptures(callArguments: HIRValue[], captures: HIRValue[]): HIRValue {
        let instructions = this.enumerateInstructions();
        let activationContext = new HIRFunctionActivationContext(instructions, this.dependentFunctionType.coreTypes, this.sourcePosition);
        activationContext.setCallArgumentsAndCaptures(callArguments, captures);
        return activationContext.evaluateInstructions();
    }

    evaluateWithArguments(callArguments: HIRValue[]): HIRValue {
        return this.evaluateWithArgumentsAndCaptures(callArguments, []);
    }

    evaluateWithArgumentsAndResultTypeAt(callArguments: HIRValue[], resultType: HIRType, callSourcePosition: AbstractSourcePosition): HIRValue {
        return this.evaluateWithArguments(callArguments)
    }
}

export class HIRFunctionActivationContext {
    instructions: HIRFunctionLocalValue[];
    instructionValues: HIRValue[];
    coreTypes: HIRCoreTypes;
    sourcePosition: AbstractSourcePosition;
    instructionPC: number = 0;
    pc: number = 0;
    returnValue: HIRValue | null = null;

    constructor(instructions: HIRFunctionLocalValue[], coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        this.instructions = instructions;
        this.coreTypes = coreTypes;
        this.sourcePosition = sourcePosition;
        this.instructionValues = new Array(instructions.length).fill(coreTypes.voidValue);
    }

    atPCSetValue(valuePC: number, value: HIRValue): void {
        this.instructionValues[valuePC] = value;
    }

    setCallArgumentsAndCaptures(argumentValues: HIRValue[], captureValues: HIRValue[]): void {
        // Arguments
        for(let i = 0; i < argumentValues.length; ++i) {
            let argument = argumentValues[i];
            if(!argument)
                throw new Error('Expected an argument.');

            this.instructionValues[i] = argument;
        }

        // Captures
        for(let i = 0; i < captureValues.length; ++i) {
            let capture = captureValues[i];
            if(!capture)
                throw new Error('Expected an argument.');

            this.instructionValues[argumentValues.length + i] = capture;
        }

        // Set initial PC
        this.pc = argumentValues.length + captureValues.length;
    }

    setCurrentInstructionValue(valueToSet: HIRValue): void {
        this.instructionValues[this.instructionPC] = valueToSet;
    }

    evaluateInstructions(): HIRValue {
        let instructionCount = this.instructions.length;
        while (this.pc < instructionCount) {
            // Fetch the instruction
            this.instructionPC = this.pc;
            this.pc = this.pc + 1;
            let instruction = this.instructions[this.instructionPC];
            if(!instruction)
                throw new Error('Expected a valid instruction.');

            // Evaluate the instruction
            instruction.evaluateInActivationContext(this);

            if(this.returnValue !== null) {
                return this.returnValue
            }
        }
        throw new Error('Reached the end of a function instructions');
    }

}

export abstract class HIRFunctionLocalValue extends HIRValue {
    type: HIRType;
    name: string | null;
    index: number = -1;

    constructor(type: HIRType, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(sourcePosition);
        this.type = type;
        this.name = name;
    }

    getType(): HIRType {
        return this.type;
    }

    toString():string {
        if(!this.name)
            return '$' + this.index;
        return `$${this.index}|${this.name}`;
    }

    abstract evaluateInActivationContext(context: HIRFunctionActivationContext) : void;

    getValueInEvaluationContext(context: HIRFunctionActivationContext): HIRValue {
        let value = context.instructionValues[this.index];
        if(!value)
            throw new Error('Expected a function local value.');
        return value;
    }

}

export class HIRArgument extends HIRFunctionLocalValue {
    isSelf: boolean = false;

    constructor(type: HIRType, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(type, name, sourcePosition);
    }

    isArgument(): boolean {
        return true;
    }

    fullPrintString():string {
        return this.toString() + ' argument';
    }

    evaluateInActivationContext(context: HIRFunctionActivationContext) : void {
        // Nothing is required here
    }

}

export class HIRCapture extends HIRFunctionLocalValue {
    constructor(type: HIRType, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(type, name, sourcePosition);
    }

    isCapture(): boolean {
        return true;
    }

    fullPrintString():string {
        return this.toString() + ' capture';
    }

    evaluateInActivationContext(context: HIRFunctionActivationContext) : void {
        // Nothing is required here
    }
}

export class HIRBasicBlock extends HIRFunctionLocalValue {
    previousBasicBlock: HIRBasicBlock | null = null;
    nextBasicBlock: HIRBasicBlock | null = null;

    firstInstruction: HIRInstruction | null = null;
    lastInstruction: HIRInstruction | null = null;

    constructor(type: HIRType, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(type, name, sourcePosition);
    }

    addInstruction(instruction: HIRInstruction) : void {
        if(this.lastInstruction === null) {
            this.firstInstruction = this.lastInstruction = instruction;
        } else {
            instruction.previousInstruction = this.lastInstruction;
            this.lastInstruction.nextInstruction = instruction;
            this.lastInstruction = instruction;
        }
    }

    fullPrintString(): string {
        let result = this.toString() + ':';
        let instruction = this.firstInstruction;
        while(instruction) {
            result += '\n    ';
            result += instruction.fullPrintString();
            instruction = instruction.nextInstruction;
        }

        result += '\n';
        return result
    }

    evaluateInActivationContext(context: HIRFunctionActivationContext) : void {
        // Nothing is required here
    }
}

export abstract class HIRInstruction extends HIRFunctionLocalValue {
    previousInstruction: HIRInstruction | null = null;
    nextInstruction: HIRInstruction | null = null;

    constructor(type: HIRType, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(type, name, sourcePosition);
    }

    abstract fullPrintString(): string;
}

export class HIRAllocaInstruction extends HIRInstruction  {
    valueType: HIRType;
    valueBoxType: HIRType;

    constructor(valueType: HIRType, valueBoxType: HIRType, type: HIRType, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(type, name, sourcePosition);
        this.valueType = valueType;
        this.valueBoxType = valueBoxType;
    }

    fullPrintString(): string {
        return `${this.toString()} := alloca ${this.valueType.toString()} as ${this.type.toString()}`
    }

    evaluateInActivationContext(context: HIRFunctionActivationContext) : void {
        let initialValue = new HIRConstantLiteralUndefinedValue(this.valueType, this.sourcePosition);
        let valueBox = new HIRMutableValueBox(this.valueBoxType, initialValue, this.sourcePosition);
        if (this.type.isReferenceType()) {
            let allocaValue = new HIRReferenceValue(this.type, valueBox, 0, this.sourcePosition);
            context.setCurrentInstructionValue(allocaValue);
        } else {
            let allocaValue = new HIRPointerValue(this.type, valueBox, 0, this.sourcePosition);
            context.setCurrentInstructionValue(allocaValue);
        }
    }
}

export class HIRBranchInstruction extends HIRInstruction  {
    destination: HIRBasicBlock;

    constructor(destination: HIRBasicBlock, type: HIRType, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(type, name, sourcePosition);
        this.destination = destination
    }

    isTerminatorInstruction(): boolean {
        return true;
    }

    fullPrintString(): string {
        return 'branch ' + this.destination.toString()
    }

    evaluateInActivationContext(context: HIRFunctionActivationContext) : void {
        context.pc = this.destination.index;
    }
}

export class HIRConditionalBranchInstruction extends HIRInstruction  {
    condition: HIRValue;
    trueDestination: HIRBasicBlock;
    falseDestination: HIRBasicBlock;

    constructor(condition: HIRValue, trueDestination: HIRBasicBlock, falseDestination: HIRBasicBlock, type: HIRType, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(type, name, sourcePosition);
        this.condition = condition;
        this.trueDestination = trueDestination;
        this.falseDestination = falseDestination;
    }

    isTerminatorInstruction(): boolean {
        return true;
    }

    fullPrintString(): string {
        return 'conditinalBranch ' + this.condition.toString()
            + ' ifTrue: ' + this.trueDestination.toString()
            + ' ifFalse: ' + this.falseDestination.toString();
    }

    evaluateInActivationContext(context: HIRFunctionActivationContext) : void {
        let condition = this.condition.getValueInEvaluationContext(context);
        if(condition.evaluateAsBoolean())
            context.pc = this.trueDestination.index;
        else 
            context.pc = this.falseDestination.index;
    }
}

export class HIRCallInstruction extends HIRInstruction  {
    functional: HIRValue;
    callArguments: HIRValue[];
    
    constructor(functional: HIRValue, callArguments: HIRValue[], type: HIRType, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(type, name, sourcePosition);
        this.functional = functional;
        this.callArguments = callArguments;
    }

    fullPrintString(): string {
        return `${this.toString()} := call ${this.functional.toString()} with ${this.callArguments.toString()}`
    }

    evaluateInActivationContext(context: HIRFunctionActivationContext) : void {
        let functional = this.functional.getValueInEvaluationContext(context);
        let callArguments = this.callArguments.map((value: HIRValue) : HIRValue => value.getValueInEvaluationContext(context));
        let result = functional.evaluateWithArgumentsAndResultTypeAt(callArguments, this.type, this.sourcePosition);
        context.setCurrentInstructionValue(result);
    }

}


export class HIRLoadInstruction extends HIRInstruction  {
    storage: HIRValue;

    constructor(storage: HIRValue, type: HIRType, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(type, name, sourcePosition);
        this.storage = storage;
    }

    fullPrintString(): string {
        return `${this.toString()} := load ${this.storage.toString()} as ${this.type.toString()}`
    }

    evaluateInActivationContext(context: HIRFunctionActivationContext) : void {
        let storageValue = this.storage.getValueInEvaluationContext(context);
        context.setCurrentInstructionValue(storageValue.loadValue());
    }
}

export class HIRStoreInstruction extends HIRInstruction  {
    storage: HIRValue;
    valueToStore: HIRValue;

    constructor(type: HIRType, storage: HIRValue, valueToStore: HIRValue, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(type, name, sourcePosition);
        this.storage = storage;
        this.valueToStore = valueToStore;
    }

    fullPrintString(): string {
        return `store ${this.valueToStore.toString()} in ${this.storage.toString()}`
    }

    evaluateInActivationContext(context: HIRFunctionActivationContext) : void {
        let storageValue = this.storage.getValueInEvaluationContext(context)
        let valueToStoreValue = this.valueToStore.getValueInEvaluationContext(context)
        storageValue.storeValue(valueToStoreValue);
    }
}

export class HIRPhiInstruction extends HIRInstruction  {
    constructor(type: HIRType, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(type, name, sourcePosition)
    }

    isPhiInstruction(): boolean {
        return true;
    }

    fullPrintString(): string {
        return this.toString() + ' := phi ' + this.type.toString();
    }

    evaluateInActivationContext(context: HIRFunctionActivationContext) : void {
        // Nothing is required here.
    }
}

export class HIRPhiSourceInstruction extends HIRInstruction  {
    targetPhi: HIRPhiInstruction;
    sourceValue: HIRValue;

    constructor(targetPhi: HIRPhiInstruction, sourceValue: HIRValue, type: HIRType, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(type, name, sourcePosition);
        this.targetPhi = targetPhi;
        this.sourceValue = sourceValue;
    }

    fullPrintString(): string {
        return `phi: ${this.targetPhi.toString()} source: ${this.sourceValue.toString()}`;
    }

    evaluateInActivationContext(context: HIRFunctionActivationContext) : void {
        let sourceEvaluatedValue = this.sourceValue.getValueInEvaluationContext(context);
        context.atPCSetValue(this.targetPhi.index, sourceEvaluatedValue);
    }
}


export class HIRReturnInstruction extends HIRInstruction  {
    valueToReturn: HIRValue;

    constructor(valueToReturn: HIRValue, type: HIRType, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(type, name, sourcePosition);
        this.valueToReturn = valueToReturn
    }

    isTerminatorInstruction(): boolean {
        return true;
    }

    fullPrintString(): string {
        return 'return ' + this.valueToReturn.toString()
    }

    evaluateInActivationContext(context: HIRFunctionActivationContext) : void {
        let value = this.valueToReturn.getValueInEvaluationContext(context);
        context.returnValue = value;
    }
}

export class HIRUnreachableInstruction extends HIRInstruction  {
    constructor(type: HIRType, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(type, name, sourcePosition)
    }

    isTerminatorInstruction(): boolean {
        return true;
    }

    fullPrintString(): string {
        return 'unreachable'
    }

    evaluateInActivationContext(context: HIRFunctionActivationContext) : void {
        throw new Error(this.sourcePosition.toString() + ': Reached unreachable instruction')
    }
}

export class HIREvaluationContext {
    context: HIRContext;
    environment: HIRLexicalEnvironment;

    constructor(context: HIRContext, environment: HIRLexicalEnvironment) {
        this.context = context;
        this.environment = environment;
    }

    clone() : HIREvaluationContext {
        return new HIREvaluationContext(this.context, this.environment);
    }
}

export class HIRBuilder {
    hirFunction: HIRFunction;
    context: HIRContext;
    basicBlock: HIRBasicBlock;
    allocaBuilder: HIRBuilder | null = null;
    environment: HIREnvironment;

    constructor(hirFunction: HIRFunction, context: HIRContext, basicBlock: HIRBasicBlock, environment: HIREnvironment) {
        this.hirFunction = hirFunction;
        this.context = context;
        this.basicBlock = basicBlock;
        this.environment = environment;
    }

    addInstruction(instruction: HIRInstruction): void {
        this.basicBlock.addInstruction(instruction);
    }

    isLastTerminator(): boolean {
        let lastInstruction = this.basicBlock.lastInstruction;
        if(!lastInstruction)
            return false;
        return lastInstruction.isTerminatorInstruction();
    }

    alloca(valueType: HIRType, referenceType: HIRType, sourcePosition: AbstractSourcePosition): HIRAllocaInstruction {
        let valueBoxType = this.context.getOrCreateMutableValueBoxType(valueType);
        let instruction = new HIRAllocaInstruction(valueType, valueBoxType, referenceType, null, sourcePosition);
        this.addInstruction(instruction);
        return instruction;
    }

    branch(destination: HIRBasicBlock, sourcePosition: AbstractSourcePosition): HIRBranchInstruction {
        let instruction = new HIRBranchInstruction(destination, this.context.coreTypes.voidType, null, sourcePosition);
        this.addInstruction(instruction);
        return instruction;
    }

    conditionalBranch(condition: HIRValue, trueDestination: HIRBasicBlock, falseDestination: HIRBasicBlock, sourcePosition: AbstractSourcePosition): HIRConditionalBranchInstruction {
        let instruction = new HIRConditionalBranchInstruction(condition, trueDestination, falseDestination, this.context.coreTypes.voidType, null, sourcePosition);
        this.addInstruction(instruction);
        return instruction;
    }

    call(functional: HIRValue, callArguments: HIRValue[], resultType: HIRType, sourcePosition: AbstractSourcePosition): HIRCallInstruction {
        let instruction = new HIRCallInstruction(functional, callArguments, resultType, null, sourcePosition);
        this.addInstruction(instruction);
        // TODO: Simplify the call if possible.
        return instruction;
    }

    load(type: HIRType, storage: HIRValue, sourcePosition: AbstractSourcePosition): HIRLoadInstruction {
        let instruction = new HIRLoadInstruction(storage, type, null, sourcePosition);
        this.addInstruction(instruction);
        return instruction;
    }

    store(storage: HIRValue, valueToStore: HIRValue, sourcePosition: AbstractSourcePosition): HIRStoreInstruction {
        let instruction = new HIRStoreInstruction(this.context.coreTypes.voidType, storage, valueToStore, null, sourcePosition);
        this.addInstruction(instruction);
        return instruction;
    }

    phi(type: HIRType, sourcePosition: AbstractSourcePosition) : HIRPhiInstruction {
        let instruction = new HIRPhiInstruction(type, null, sourcePosition);
        this.addInstruction(instruction);
        return instruction;
    }

    phiSource(targetPhi: HIRPhiInstruction, sourceValue: HIRValue, sourcePosition: AbstractSourcePosition) : HIRPhiSourceInstruction {
        let instruction = new HIRPhiSourceInstruction(targetPhi, sourceValue, this.context.coreTypes.voidType, null, sourcePosition);
        this.addInstruction(instruction);
        return instruction;
    }

    returnValue(valueToReturn: HIRValue, sourcePosition: AbstractSourcePosition): HIRReturnInstruction {
        let instruction = new HIRReturnInstruction(valueToReturn, this.context.coreTypes.voidType, null, sourcePosition);
        this.addInstruction(instruction);
        return instruction;
    }

    returnVoid(sourcePosition: AbstractSourcePosition): HIRReturnInstruction {
        return this.returnValue(this.context.coreTypes.voidValue, sourcePosition);
    }

    unreachable(sourcePosition: AbstractSourcePosition): HIRUnreachableInstruction {
        let instruction = new HIRUnreachableInstruction(this.context.coreTypes.voidType, null, sourcePosition);
        this.addInstruction(instruction);
        return instruction;
    }
}

export abstract class HIREnvironment {
    abstract lookSymbolRecursively(symbol: string): HIRValue | null;
}

export class HIREmptyEnvironment extends HIREnvironment {
    lookSymbolRecursively(symbol: string): HIRValue | null {
        return null;
    }
}

export class HIRPackageEnvironment extends HIREnvironment {
    packageValue: HIRPackage;
    parent: HIREnvironment;

    constructor(packageValue: HIRPackage, parent: HIREnvironment) {
        super();
        this.packageValue = packageValue;
        this.parent = parent;
    }


    lookSymbolRecursively(symbol: string): HIRValue | null {
        let packageSymbolBinding = this.packageValue.lookSymbolRecursivelyOrNone(symbol);
        if(packageSymbolBinding)
            return packageSymbolBinding;

        return this.parent.lookSymbolRecursively(symbol);
    }

}

export class HIRLexicalEnvironment extends HIREnvironment {
    parent: HIREnvironment;
    symbolTable: Record<string, HIRValue> = {};
    
    constructor(parent: HIREnvironment) {
        super();
        this.parent = parent;
    }

    setSymbolBinding(symbol: string, binding: HIRValue) {
        this.symbolTable[symbol] = binding;
    }

    setNewSymbolBinding(symbol: string, binding: HIRValue, sourcePosition: AbstractSourcePosition) {
        if(symbol in this.symbolTable)
            throw new Error(sourcePosition.formatMessage(`a binding for ${symbol} already exists.`))
        return this.setSymbolBinding(symbol, binding);
    }

    lookSymbolRecursively(symbol: string): HIRValue | null {
        if (symbol in this.symbolTable) {
            let binding = this.symbolTable[symbol];
            return binding as HIRValue;
        }

        return this.parent.lookSymbolRecursively(symbol);
    }
}

export class HIRCoreTypes {
    pointerSize = 8;
    pointerAlignment = 8;
    coreTypeList: HIRType[] = [];
    coreValueList: [string, HIRValue][] = [];
    corePrimitiveMacros: HIRPrimitiveMacro[] = [];
    universeLevels: Record<number, HIRUniverseType> = {};

    characterType: HIRNominalType = new HIRNominalType('Character', this, getOrMakeEmptySourcePosition());
    integerType: HIRNominalType = new HIRNominalType('Integer', this, getOrMakeEmptySourcePosition());
    floatType: HIRNominalType = new HIRNominalType('Float', this, getOrMakeEmptySourcePosition());
    stringType: HIRNominalType = new HIRNominalType('String', this, getOrMakeEmptySourcePosition());
    symbolType: HIRNominalType = new HIRNominalType('Symbol', this, getOrMakeEmptySourcePosition());
    parseTreeType: HIRNominalType = new HIRNominalType('ParseTree', this, getOrMakeEmptySourcePosition());

    boolean8Type: HIRPrimitiveType = new HIRPrimitiveType('Boolean8', 1, 1, this, getOrMakeEmptySourcePosition());

    char8Type:  HIRPrimitiveType = new HIRPrimitiveType('Char8' , 1, 1, this, getOrMakeEmptySourcePosition());
    char16Type: HIRPrimitiveType = new HIRPrimitiveType('Char16', 2, 2, this, getOrMakeEmptySourcePosition());
    char32Type: HIRPrimitiveType = new HIRPrimitiveType('Char32', 4, 4, this, getOrMakeEmptySourcePosition());

    int8Type:  HIRPrimitiveType = new HIRPrimitiveType('Int8' , 1, 1, this, getOrMakeEmptySourcePosition());
    int16Type: HIRPrimitiveType = new HIRPrimitiveType('Int16', 2, 2, this, getOrMakeEmptySourcePosition());
    int32Type: HIRPrimitiveType = new HIRPrimitiveType('Int32', 4, 4, this, getOrMakeEmptySourcePosition());
    int64Type: HIRPrimitiveType = new HIRPrimitiveType('Int64', 8, 8, this, getOrMakeEmptySourcePosition());

    uint8Type:  HIRPrimitiveType = new HIRPrimitiveType('UInt8' , 1, 1, this, getOrMakeEmptySourcePosition());
    uint16Type: HIRPrimitiveType = new HIRPrimitiveType('UInt16', 2, 2, this, getOrMakeEmptySourcePosition());
    uint32Type: HIRPrimitiveType = new HIRPrimitiveType('UInt32', 4, 4, this, getOrMakeEmptySourcePosition());
    uint64Type: HIRPrimitiveType = new HIRPrimitiveType('UInt64', 8, 8, this, getOrMakeEmptySourcePosition());

    float32Type: HIRPrimitiveType = new HIRPrimitiveType('Float32', 4, 4, this, getOrMakeEmptySourcePosition());
    float64Type: HIRPrimitiveType = new HIRPrimitiveType('Float64', 8, 8, this, getOrMakeEmptySourcePosition());

    dynamicType: HIRDynamicType     = new HIRDynamicType('Dynamic', this, getOrMakeEmptySourcePosition());
    undefinedType: HIRUndefinedType = new HIRUndefinedType('Undefined', this, getOrMakeEmptySourcePosition());
    voidType: HIRVoidType           = new HIRVoidType('Void', this, getOrMakeEmptySourcePosition());

    packageType: HIRNominalType = new HIRNominalType('Package', this, getOrMakeEmptySourcePosition());
    basicBlockType: HIRNominalType = new HIRNominalType('BasicBlock', this, getOrMakeEmptySourcePosition());
    macroContextType: HIRNominalType = new HIRNominalType('MacroContext', this, getOrMakeEmptySourcePosition());
    primitiveMacroType: HIRNominalType = new HIRNominalType('PrimitiveMacro', this, getOrMakeEmptySourcePosition());

    voidValue: HIRConstantLiteralVoidValue = new HIRConstantLiteralVoidValue(this.voidType, getOrMakeEmptySourcePosition());
    falseValue: HIRConstantLiteralBooleanValue = new HIRConstantLiteralBooleanValue(false, this.boolean8Type, getOrMakeEmptySourcePosition());
    trueValue: HIRConstantLiteralBooleanValue = new HIRConstantLiteralBooleanValue(true, this.boolean8Type, getOrMakeEmptySourcePosition());
    nilValue: HIRConstantLiteralVoidValue = new HIRConstantLiteralNilValue(this.undefinedType, getOrMakeEmptySourcePosition());
    
    constructor() {
        this.coreTypeList.push(this.characterType);
        this.coreTypeList.push(this.integerType);
        this.coreTypeList.push(this.floatType);
        this.coreTypeList.push(this.stringType);
        this.coreTypeList.push(this.symbolType);

        this.coreTypeList.push(this.boolean8Type);

        this.coreTypeList.push(this.char8Type);
        this.coreTypeList.push(this.char16Type);
        this.coreTypeList.push(this.char32Type);

        this.coreTypeList.push(this.int8Type);
        this.coreTypeList.push(this.int16Type);
        this.coreTypeList.push(this.int32Type);
        this.coreTypeList.push(this.int64Type);

        this.coreTypeList.push(this.uint8Type);
        this.coreTypeList.push(this.uint16Type);
        this.coreTypeList.push(this.uint32Type);
        this.coreTypeList.push(this.uint64Type);

        this.coreTypeList.push(this.float32Type);
        this.coreTypeList.push(this.float64Type);

        this.coreTypeList.push(this.dynamicType);
        this.coreTypeList.push(this.undefinedType);
        this.coreTypeList.push(this.voidType);

        this.coreTypeList.push(this.packageType);
        this.coreTypeList.push(this.basicBlockType);
        this.coreTypeList.push(this.macroContextType);
        this.coreTypeList.push(this.primitiveMacroType);

        this.coreValueList.push(['void',  this.voidValue]);
        this.coreValueList.push(['false', this.falseValue]);
        this.coreValueList.push(['true',  this.trueValue]);
        this.coreValueList.push(['nil',   this.nilValue]);

        this.createCorePrimitiveMacros();
        this.createCorePrimitiveFunctions();
    }

    createCorePrimitiveMacros() {
        function letWith(macroContext: HIRMacroContext, nameExpression: parseTree.ParseTreeNode, initialValue: parseTree.ParseTreeNode): parseTree.ParseTreeNode {
            return new parseTree.ParseTreeVariableDefinitionNode(macroContext.sourcePosition, nameExpression, null, initialValue, false);
        }
        function letMutableWith(macroContext: HIRMacroContext, nameExpression: parseTree.ParseTreeNode, initialValue: parseTree.ParseTreeNode): parseTree.ParseTreeNode {
            return new parseTree.ParseTreeVariableDefinitionNode(macroContext.sourcePosition, nameExpression, null, initialValue, true);
        }

        function ifThenElse(macroContext: HIRMacroContext, conditionExpression: parseTree.ParseTreeNode, trueExpression: parseTree.ParseTreeNode, falseExpresion: parseTree.ParseTreeNode): parseTree.ParseTreeNode {
            return new parseTree.ParseTreeIfSelectionNode(macroContext.sourcePosition, conditionExpression, trueExpression, falseExpresion);
        }
        function ifThen(macroContext: HIRMacroContext, conditionExpression: parseTree.ParseTreeNode, trueExpression: parseTree.ParseTreeNode): parseTree.ParseTreeNode {
            return new parseTree.ParseTreeIfSelectionNode(macroContext.sourcePosition, conditionExpression, trueExpression, null);
        }

        function whileDo(macroContext: HIRMacroContext, conditionExpression: parseTree.ParseTreeNode, bodyExpression: parseTree.ParseTreeNode): parseTree.ParseTreeNode {
            return new parseTree.ParseTreeWhileDoNode(macroContext.sourcePosition, conditionExpression, bodyExpression, null);
        }
        function whileDoContinueWith(macroContext: HIRMacroContext, conditionExpression: parseTree.ParseTreeNode, bodyExpression: parseTree.ParseTreeNode, continueExpression: parseTree.ParseTreeNode): parseTree.ParseTreeNode {
            return new parseTree.ParseTreeWhileDoNode(macroContext.sourcePosition, conditionExpression, bodyExpression, continueExpression);
        }

        function doWhile(macroContext: HIRMacroContext, bodyExpression: parseTree.ParseTreeNode, conditionExpression: parseTree.ParseTreeNode): parseTree.ParseTreeNode {
            return new parseTree.ParseTreeDoWhileNode(macroContext.sourcePosition,bodyExpression, null, conditionExpression);
        }
        function doContinueWithWhile(macroContext: HIRMacroContext, bodyExpression: parseTree.ParseTreeNode, continueExpression: parseTree.ParseTreeNode, conditionExpression: parseTree.ParseTreeNode): parseTree.ParseTreeNode {
            return new parseTree.ParseTreeDoWhileNode(macroContext.sourcePosition,bodyExpression, continueExpression, conditionExpression);
        }

        function returnWithValue(macroContext: HIRMacroContext, valueExpression: parseTree.ParseTreeNode): parseTree.ParseTreeNode {
            return new parseTree.ParseTreeReturnNode(macroContext.sourcePosition, valueExpression);
        }

        this.corePrimitiveMacros = [
            new HIRPrimitiveMacro('let:with:', this.primitiveMacroType, letWith, getOrMakeEmptySourcePosition()),
            new HIRPrimitiveMacro('let:mutableWith:', this.primitiveMacroType, letMutableWith, getOrMakeEmptySourcePosition()),

            new HIRPrimitiveMacro('if:then:else:', this.primitiveMacroType, ifThenElse, getOrMakeEmptySourcePosition()),
            new HIRPrimitiveMacro('if:then:', this.primitiveMacroType, ifThen, getOrMakeEmptySourcePosition()),

            new HIRPrimitiveMacro('while:do:', this.primitiveMacroType, whileDo, getOrMakeEmptySourcePosition()),
            new HIRPrimitiveMacro('while:do:continueWith:', this.primitiveMacroType, whileDoContinueWith, getOrMakeEmptySourcePosition()),

            new HIRPrimitiveMacro('do:while:', this.primitiveMacroType, doWhile, getOrMakeEmptySourcePosition()),
            new HIRPrimitiveMacro('do:continueWith:while:', this.primitiveMacroType, doContinueWithWhile, getOrMakeEmptySourcePosition()),

            new HIRPrimitiveMacro('return:', this.primitiveMacroType, returnWithValue, getOrMakeEmptySourcePosition()),
        ]
    }
    
    createCorePrimitiveFunctions() {
        this.createIntegerPrimitiveFunctions(this.integerType);
        this.createIntegerPrimitiveFunctions(this.int32Type);
        this.createIntegerPrimitiveFunctions(this.uint32Type);
        this.createIntegerPrimitiveFunctions(this.int64Type);
        this.createIntegerPrimitiveFunctions(this.uint64Type);
    }

    createIntegerPrimitiveFunctions(integerType: HIRNominalType) {
        function integerNegated(operand: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralIntegerValue(-operand.evaluateAsInteger(), resultType, sourcePosition)
        }

        let primitivePrefix = integerType.toString() + "::";
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('negated', primitivePrefix + 'negated', this.getOrCreateSimpleFunctionType([integerType], integerType), integerNegated, true, true, getOrMakeEmptySourcePosition()))
    }

    getOrCreateSimpleFunctionType(argumentTypes: HIRType[], resultType: HIRType) : HIRSimpleFunctionType {
        return new HIRSimpleFunctionType(argumentTypes, resultType, this, getOrMakeEmptySourcePosition());
    }

    getUniverseAtLevel(level: number): HIRUniverseType {
        let universe = this.universeLevels[level];
        if (universe)
            return universe

        universe = new HIRUniverseType(level, this, getOrMakeEmptySourcePosition());
        this.universeLevels[level] = universe;
        return universe;
    }
}

export class HIRPackage extends HIRValue {
    coreTypes: HIRCoreTypes;
    children: HIRValue[] = []
    publicSymbolTable: Record<string, HIRValue> = {};

    constructor(coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(sourcePosition);
        this.coreTypes = coreTypes;
    }

    getType(): HIRType {
        return this.coreTypes.packageType;
    }

    addCoreTypeMembers(): void {
        this.addCoreTypeListMembers();
        this.addCoreTypeValueList();
        this.addCorePrimitiveMacros();
    }

    addCoreTypeListMembers(): void {
        for(let i = 0; i < this.coreTypes.coreTypeList.length; ++i)
        {
            let coreType = this.coreTypes.coreTypeList[i];
            let typeName = coreType?.getName();
            if(typeName && coreType) {
                this.addSymbolWithBinding(typeName, coreType);
            }
        }
    }

    addCoreTypeValueList(): void {
        for(let i = 0; i < this.coreTypes.coreValueList.length; ++i)
        {
            let coreValueTuple = this.coreTypes.coreValueList[i];
            if(!coreValueTuple) continue;

            let [name, coreValue] = coreValueTuple;
            this.addSymbolWithBinding(name, coreValue)
        }
    }

    addCorePrimitiveMacros(): void {
        for(let i = 0; i < this.coreTypes.corePrimitiveMacros.length; ++i) {
            let corePrimitiveMacro = this.coreTypes.corePrimitiveMacros[i];
            if(!corePrimitiveMacro) continue;

            this.addSymbolWithBinding(corePrimitiveMacro.name, corePrimitiveMacro);
        }
    }

    addSymbolWithBinding(symbol: string, binding: HIRValue) {
        this.children.push(binding);
        this.publicSymbolTable[symbol] = binding;
    }

    lookSymbolRecursivelyOrNone(symbol: string): HIRValue | null {
        if (symbol in this.publicSymbolTable)
            return this.publicSymbolTable[symbol] as HIRValue;
        return null;
    }
}

export class HIRContext {
    coreTypes: HIRCoreTypes;
    corePackage: HIRPackage;
    currentPackage: HIRPackage;

    constructor() {
        this.coreTypes = new HIRCoreTypes();
        this.corePackage = new HIRPackage(this.coreTypes, getOrMakeEmptySourcePosition());
        this.currentPackage = this.corePackage;
        this.corePackage.addCoreTypeMembers();
    }

    createTopLevelEnvironment(sourceCode: SourceCode | null): HIRLexicalEnvironment {
        let packageEnvironment = new HIRPackageEnvironment(this.currentPackage, new HIREmptyEnvironment());
        let lexicalEnvironment = new HIRLexicalEnvironment(packageEnvironment);

        if(sourceCode) {
            if(sourceCode.directory) {
                lexicalEnvironment.setSymbolBinding('__FileDir__', new HIRConstantLiteralStringValue(sourceCode.directory, this.coreTypes.stringType, getOrMakeEmptySourcePosition()));
            }
            if(sourceCode.name) {
                lexicalEnvironment.setSymbolBinding('__FileName__', new HIRConstantLiteralStringValue(sourceCode.name, this.coreTypes.stringType, getOrMakeEmptySourcePosition()));
            }
        }

        return lexicalEnvironment;
    }

    createTopLevelEvaluationContext(sourceCode: SourceCode | null): HIREvaluationContext {
        return new HIREvaluationContext(this, this.createTopLevelEnvironment(sourceCode));
    }

    getOrCreateAssociationType(keyType: HIRType, valueType: HIRType) {
        return new HIRAssociationType(keyType, valueType, this.coreTypes, getOrMakeEmptySourcePosition())
    }

    getOrCreateTupleType(elements: HIRType[]) {
        return new HIRTupleType(elements, this.coreTypes, getOrMakeEmptySourcePosition())
    }

    getOrCreatePointerType(baseType: HIRType) : HIRPointerType {
        return new HIRPointerType(baseType, this.coreTypes, getOrMakeEmptySourcePosition());
    }

    getOrCreateReferenceType(baseType: HIRType) : HIRPointerType {
        return new HIRReferenceType(baseType, this.coreTypes, getOrMakeEmptySourcePosition());
    }

    getOrCreateMutableValueBoxType(baseType: HIRType) : HIRPointerType {
        return new HIRMutableValueBoxType(baseType, this.coreTypes, getOrMakeEmptySourcePosition());
    }

}

export class AnalysisAndEvaluationPass extends parseTree.ParseTreeVisitor {
    evaluationContext: HIREvaluationContext;

    constructor(evaluationContext: HIREvaluationContext) {
        super();
        this.evaluationContext = evaluationContext;
    }

    visitDecayedNode(node: parseTree.ParseTreeNode) : HIRValue {
        let value = this.visitNode(node) as HIRValue;
        if (value.isReferenceValue())
            return value.loadValue();
        return value;
    }

    visitNodeExpectingType(node: parseTree.ParseTreeNode) : HIRType {
        let value = this.visitDecayedNode(node);
        if(!value.isType())
            throw new Error(node.sourcePosition.formatMessage('Expected a type expression.'));
        return value as HIRType;
    }

    visitNodeWithExpectedType(node: parseTree.ParseTreeNode, expectedType: HIRType | null) : HIRValue {
        let value = this.visitDecayedNode(node);
        // TODO: check the type.
        if(expectedType && !expectedType.isSatisfiedByValue(value))
            throw new Error(node.sourcePosition.formatMessage(`Expected a value whose type is ${expectedType.toString()}`));

        return value;
    }

    visitBooleanNode(node: parseTree.ParseTreeNode) : boolean {
        let evaluatedValue = this.visitNodeWithExpectedType(node, this.evaluationContext.context.coreTypes.boolean8Type);
        return evaluatedValue.evaluateAsBoolean();
    }

    visitSymbolNode(node: parseTree.ParseTreeNode) : string {
        let evaluatedValue = this.visitNodeWithExpectedType(node, this.evaluationContext.context.coreTypes.symbolType);
        return evaluatedValue.evaluateAsSymbol();
    }
        
    visitOptionalSymbolNode(node: parseTree.ParseTreeNode | null) : string | null {
        if(!node)
            return null;
        return this.visitSymbolNode(node);
    }

    visitErrorNode(node: parseTree.ParseTreeErrorNode): any {
        throw new Error(node.sourcePosition.formatMessage(node.errorMessage));
    }

    visitParseErrorNode(node: parseTree.ParseTreeParseErrorNode): any {
        throw new Error(node.sourcePosition.formatMessage(node.errorMessage));
    }

    visitApplicationNode(node: parseTree.ParseTreeApplicationNode): any {
        let functional = this.visitDecayedNode(node.functional);
        return functional.analyzeAndEvaluateApplicationNode(this, node, functional)
    }

    visitAssignmentNode(node: parseTree.ParseTreeAssignmentNode): any {
        let storeValue = this.visitNode(node.store) as HIRValue;
        return storeValue.analyzeAndEvaluateAssignment(this, node)
    }

    visitAssociationNode(node: parseTree.ParseTreeAssociationNode): any {
        let key = this.visitDecayedNode(node.key);
        let value: HIRValue = this.evaluationContext.context.coreTypes.nilValue;
        if(node.value)
            value = this.visitDecayedNode(node.value);

        if(key.isType() && value.isType()) {
            return this.evaluationContext.context.getOrCreateAssociationType(key as HIRType, value as HIRType);
        }

        let keyType = key.getType();
        let valueType = value.getType();
        let associationType = this.evaluationContext.context.getOrCreateAssociationType(keyType, valueType);
        return new HIRConstantAssociation(key, value, associationType, node.sourcePosition);
    }

    visitBinaryExpressionSequenceNode(node: parseTree.ParseTreeBinaryExpressionSequenceNode): any {
        throw new Error('TODO ParseTreeBinaryExpressionSequenceNode AnalysisAndEvaluationPass');
    }

    visitDictionaryNode(node: parseTree.ParseTreeDictionaryNode): any {
        throw new Error('TODO ParseTreeDictionaryNode AnalysisAndEvaluationPass');
    }
    
    visitIdentifierReferenceNode(node: parseTree.ParseTreeIdentifierReferenceNode): any {
        let bindingOrNull = this.evaluationContext.environment.lookSymbolRecursively(node.symbol);
        if(!bindingOrNull)
            throw new Error(node.sourcePosition.formatMessage(`${node.symbol} identifier is not found.`))

        return bindingOrNull.analyzeAndEvaluateIdentifierReferenceNode(this, node)
    }

    visitArgumentDefinitionNode(node: parseTree.ParseTreeArgumentDefinitionNode): any {
        throw new Error('TODO ParseTreeArgumentDefinitionNode AnalysisAndEvaluationPass');
    }

    visitFunctionTypeNode(node: parseTree.ParseTreeFunctionTypeNode): any {
        throw new Error('TODO ParseTreeFunctionTypeNode AnalysisAndEvaluationPass');
    }

    visitFunctionNode(node: parseTree.ParseTreeFunctionNode): any {
        throw new Error('TODO ParseTreeFunctionNode AnalysisAndEvaluationPass');
    }

    visitLexicalBlockNode(node: parseTree.ParseTreeLexicalBlockNode): any {
        let childEnvironment = new HIRLexicalEnvironment(this.evaluationContext.environment);
        let oldEnvironment = this.evaluationContext.environment;

        let result = this.visitNode(node.body) as HIRValue;

        this.evaluationContext.environment = oldEnvironment;
        
        return result;
    }

    visitLiteralCharacterNode(node: parseTree.ParseTreeLiteralCharacterNode): any {
        return new HIRConstantLiteralCharacterValue(node.value, this.evaluationContext.context.coreTypes.characterType, node.sourcePosition);
    }

    visitLiteralFloatNode(node: parseTree.ParseTreeLiteralFloatNode): any {
        return new HIRConstantLiteralFloatValue(node.value, this.evaluationContext.context.coreTypes.floatType, node.sourcePosition);
    }

    visitLiteralIntegerNode(node: parseTree.ParseTreeLiteralIntegerNode): any {
        return new HIRConstantLiteralIntegerValue(node.value, this.evaluationContext.context.coreTypes.integerType, node.sourcePosition);
    }

    visitLiteralStringNode(node: parseTree.ParseTreeLiteralStringNode): any {
        return new HIRConstantLiteralStringValue(node.value, this.evaluationContext.context.coreTypes.stringType, node.sourcePosition);
    }

    visitLiteralSymbolNode(node: parseTree.ParseTreeLiteralSymbolNode): any {
        return new HIRConstantLiteralSymbolValue(node.value, this.evaluationContext.context.coreTypes.symbolType, node.sourcePosition);
    }

    visitLiteralValueNode(node: parseTree.ParseTreeLiteralValueNode): any {
        return node.value as HIRValue;
    }

    visitCascadedMessageNode(node: parseTree.ParseTreeCascadedMessageNode): any {
        throw new Error('TODO visitCascadedMessageNode AnalysisAndEvaluationPass');
    }

    visitMessageCascadeNode(node: parseTree.ParseTreeMessageCascadeNode): any {
        throw new Error('TODO visitMessageCascadeNode AnalysisAndEvaluationPass');
    }

    visitMessageSendNode(node: parseTree.ParseTreeMessageSendNode): any {
        let receiver = this.visitNode(node.receiver) as HIRValue;
        return receiver.analyzeAndEvaluateMessageSendNode(this, node, receiver)
    }

    visitSequenceNode(node: parseTree.ParseTreeSequenceNode): any {
        let result: HIRValue = this.evaluationContext.context.coreTypes.voidValue;
        for(let i = 0; i < node.elements.length; ++i) {
            result = this.visitNode(node.elements[i] as parseTree.ParseTreeNode) as HIRValue;
        }

        return result
    }

    visitTupleNode(node: parseTree.ParseTreeTupleNode): any {
        // The empty tuple is void.
        if(node.elements.length == 0)
            return this.evaluationContext.context.coreTypes.voidValue;

        let tupleElements: HIRValue[] = [];
        let tupleTypes: HIRType[] = [];
        let hasOnlyTypes: boolean = true;
        for(let i = 0; i < node.elements.length; ++i) {
            let elementNode = node.elements[i];
            if(!elementNode)
                throw new Error('Expected an element node.');

            let elementValue = this.visitDecayedNode(elementNode);
            tupleElements.push(elementValue);
            tupleTypes.push(elementValue.getType());
            if(!elementValue.isType())
                hasOnlyTypes = false;

        }

        if(hasOnlyTypes) {
            return this.evaluationContext.context.getOrCreateTupleType(tupleElements as HIRType[]);
        }

        let tupleType = this.evaluationContext.context.getOrCreateTupleType(tupleTypes);
        return new HIRConstantTuple(tupleElements, tupleType, node.sourcePosition);
    }

    visitQuoteNode(node: parseTree.ParseTreeQuoteNode): any {
        return new HIRConstantLiteralParseTree(node.expression, this.evaluationContext.context.coreTypes.parseTreeType, node.sourcePosition);
    }

    visitQuasiQuoteNode(node: parseTree.ParseTreeQuasiQuoteNode): any {
        throw new Error('TODO visitQuasiQuoteNode AnalysisAndEvaluationPass');
    }

    visitQuasiUnquoteNode(node: parseTree.ParseTreeQuasiUnquoteNode): any {
        throw new Error(node.sourcePosition.formatMessage('Invalid location for a quasi-unquote.'));
    }

    visitSpliceNode(node: parseTree.ParseTreeSpliceNode): any {
        throw new Error(node.sourcePosition.formatMessage('Invalid location for a splice.'));
    }

    visitVariableDefinitionNode(node: parseTree.ParseTreeVariableDefinitionNode): any {
        let name = this.visitOptionalSymbolNode(node.nameExpression);
        
        let typeValue: HIRType | null = null;
        if (node.typeExpression)
            typeValue = this.visitNodeExpectingType(node.typeExpression);

        let initialValue: HIRValue | null = null;
        if (node.initialValue) {
            initialValue = this.visitNodeWithExpectedType(node.initialValue, typeValue);
        }
        
        if(!initialValue) {
            if(!typeValue)
                throw new Error(node.sourcePosition.formatMessage('At least a type or an initial value must be specified.'));
            initialValue = typeValue.getOrCreateDefaultValue();
        }
        if (node.isMutable) {
            let valueType = typeValue;
            if(!valueType)
                valueType = initialValue.getType();

            let valueBoxType = this.evaluationContext.context.getOrCreateMutableValueBoxType(valueType);
            let valueBox = new HIRMutableValueBox(valueBoxType, initialValue, node.sourcePosition);

            let referenceType = this.evaluationContext.context.getOrCreateReferenceType(valueType);
            let reference = new HIRReferenceValue(referenceType, valueBox, 0, node.sourcePosition);

            if(name)
                this.evaluationContext.environment.setNewSymbolBinding(name, reference, node.sourcePosition);

            return reference;
        } else {
            if(name)
                this.evaluationContext.environment.setNewSymbolBinding(name, initialValue, node.sourcePosition);
            return initialValue;
        }
    }

    visitIfSelectionNode(node: parseTree.ParseTreeIfSelectionNode): any {
        let condition = this.visitBooleanNode(node.condition);
        if (condition) {
            if(node.trueExpression)
                return this.visitNode(node.trueExpression);
            else
                return this.evaluationContext.context.coreTypes.voidValue;
        } else {
            if(node.falseExpression)
                return this.visitNode(node.falseExpression);
            else
                return this.evaluationContext.context.coreTypes.voidValue;
        }
    }

    visitSwitchSelectionNode(node: parseTree.ParseTreeSwitchSelectionNode): any {
        throw new Error(node.sourcePosition.formatMessage('visitSwitchSelectionNode.'));
    }

    visitReturnNode(node: parseTree.ParseTreeReturnNode): any {
        throw new Error(node.sourcePosition.formatMessage('Invalid location for a return expression.'));
    }

    visitWhileDoNode(node: parseTree.ParseTreeWhileDoNode): any {
        while(this.visitBooleanNode(node.condition)) {
            this.visitOptionalNode(node.bodyExpression)
            this.visitOptionalNode(node.continueExpression)
        }

        return this.evaluationContext.context.coreTypes.voidValue;
    }

    visitDoWhileNode(node: parseTree.ParseTreeDoWhileNode): any {
        do {
            this.visitOptionalNode(node.bodyExpression)
            this.visitOptionalNode(node.continueExpression)
        } while(this.visitBooleanNode(node.condition));

        return this.evaluationContext.context.coreTypes.voidValue;
    }

}
