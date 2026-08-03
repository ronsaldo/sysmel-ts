import {AbstractSourcePosition, getOrMakeEmptySourcePosition, SourceCode} from "./source_code.js"
import * as parseTree from "./parsetree.js"

function alignedTo(offset: number, alignment: number): number {
    return (offset + alignment - 1) & (-alignment)
}

export abstract class HIRVisitor {
    abstract visitType(type: HIRType): any;
    abstract visitNominalType(type: HIRNominalType): any;
    abstract visitDynamicType(type: HIRDynamicType): any;
    abstract visitPrimitiveType(type: HIRPrimitiveType): any;
    abstract visitUndefinedType(type: HIRUndefinedType): any;
    abstract visitVoidType(type: HIRVoidType): any;
    abstract visitControlFlowEscapeType(type: HIRControlFlowEscapeType): any;
    abstract visitUniverseType(type: HIRUniverseType): any;
    abstract visitDerivedType(type: HIRDerivedType): any;
    abstract visitPointerLikeType(type: HIRPointerLikeType): any;
    abstract visitPointerType(type: HIRPointerType): any;
    abstract visitReferenceType(type: HIRReferenceType): any;
    abstract visitMutableValueBoxType(type: HIRMutableValueBoxType): any;
    abstract visitAssociationType(type: HIRAssociationType): any;
    abstract visitDictionaryType(type: HIRDictionaryType): any;
    abstract visitTupleType(type: HIRTupleType): any;
    abstract visitDependentFunctionType(type: HIRDependentFunctionType): any;
    abstract visitSimpleFunctionType(type: HIRSimpleFunctionType): any;

    abstract visitEnumType(type: HIREnumType): any;

    abstract visitField(field: HIRField): any;
    abstract visitClass(field: HIRClass): any;
    abstract visitMetaclass(field: HIRMetaclass): any;

    abstract visitConstantLiteralIntegerValue(constant: HIRConstantLiteralIntegerValue): any;
    abstract visitConstantLiteralFloatValue(constant: HIRConstantLiteralFloatValue): any;
    abstract visitConstantLiteralBooleanValue(constant: HIRConstantLiteralBooleanValue): any;
    abstract visitConstantLiteralCharacterValue(constant: HIRConstantLiteralCharacterValue): any;
    abstract visitConstantLiteralStringValue(constant: HIRConstantLiteralStringValue): any;
    abstract visitConstantLiteralSymbolValue(constant: HIRConstantLiteralSymbolValue): any;
    abstract visitConstantLiteralVoidValue(constant: HIRConstantLiteralVoidValue): any;
    abstract visitConstantLiteralNilValue(constant: HIRConstantLiteralNilValue): any;
    abstract visitConstantLiteralUndefinedValue(constant: HIRConstantLiteralUndefinedValue): any;
    abstract visitConstantLiteralParseTree(constant: HIRConstantLiteralParseTree): any;
    
    abstract visitConstantAssociation(type: HIRConstantAssociation): any;
    abstract visitConstantDictionary(type: HIRConstantDictionary): any;
    abstract visitConstantTuple(type: HIRConstantTuple): any;
    abstract visitConstantEnum(type: HIRConstantEnum): any;
    abstract visitObjectValue(type: HIRObjectValue): any;

    abstract visitMacroContext(context: HIRMacroContext): any;
    abstract visitPrimitiveMacro(macro: HIRPrimitiveMacro): any;
    abstract visitPrimitiveFunction(primitiveFunction: HIRPrimitiveFunction): any;
    abstract visitMutableValueBox(valueBox: HIRMutableValueBox): any;
    abstract visitPointerLikeValue(pointerLike: HIRPointerLikeValue): any;
    abstract visitPointerValue(pointer: HIRPointerValue): any;
    abstract visitReferenceValue(reference: HIRReferenceValue): any;
    abstract visitFunction(hirFunction: HIRFunction): any;
    abstract visitFunctionClosure(closure: HIRFunctionClosure): any;

    abstract visitArgument(argument: HIRArgument): any;
    abstract visitCapture(capture: HIRCapture): any;
    abstract visitBasicBlock(basicBlock: HIRBasicBlock): any;

    abstract visitAllocaInstruction(instruction: HIRAllocaInstruction): any;
    abstract visitBranchInstruction(instruction: HIRBranchInstruction): any;
    abstract visitConditionalBranchInstruction(instruction: HIRConditionalBranchInstruction): any;
    abstract visitCallInstruction(instruction: HIRCallInstruction): any;
    abstract visitEnumBoxValueInstruction(instruction: HIREnumBoxValueInstruction): any;
    abstract visitEnumUnboxValueInstruction(instruction: HIREnumUnboxValueInstruction): any;
    abstract visitLoadInstruction(instruction: HIRLoadInstruction): any;
    abstract visitStoreInstruction(instruction: HIRStoreInstruction): any;
    abstract visitMakeAssociationInstruction(instruction: HIRMakeAssociationInstruction): any;
    abstract visitMakeClosureInstruction(instruction: HIRMakeClosureInstruction): any;
    abstract visitMakeTupleInstruction(instruction: HIRMakeTupleInstruction): any;
    abstract visitPhiInstruction(instruction: HIRPhiInstruction): any;
    abstract visitPhiSourceInstruction(instruction: HIRPhiSourceInstruction): any;
    abstract visitReturnInstruction(instruction: HIRReturnInstruction): any;
    abstract visitAssertConditionInstruction(instruction: HIRAssertConditionInstruction): any;
    abstract visitRuntimeErrorInstruction(instruction: HIRRuntimeErrorInstruction): any;
    abstract visitUnreachableInstruction(instruction: HIRUnreachableInstruction): any;

    abstract visitMetaBuilderFactory(factory: HIRMetaBuilderFactory): any;
    abstract visitMetaBuilder(metaBuilder: HIRMetaBuilder): any;
    abstract visitPackage(hirPackage: HIRPackage): any;
    
}

export abstract class HIRValue {
    sourcePosition: AbstractSourcePosition;

    constructor(sourcePosition: AbstractSourcePosition) {
        this.sourcePosition = sourcePosition;
    }

    abstract getType(): HIRType;
    abstract accept(visitor: HIRVisitor): any;

    addAnonymousElement(element: HIRValue): void {
        throw new Error(this.sourcePosition.formatMessage('Program entity owner does not support anonymous members.'))
    }

    addPublicNamedElement(name: string, binding: HIRValue, sourcePosition: AbstractSourcePosition): void {
        throw new Error(sourcePosition.formatMessage('Program entity owner does not support public members.'))
    }

    withSelectorAddMethod(name:string, method: HIRValue): void {
        throw new Error(method.sourcePosition.formatMessage('Program entity owner does not support methods.'))
    }

    addField(field: HIRField): void {
        throw new Error(field.sourcePosition.formatMessage('Program entity owner does not support fields.'))
    }

    ensureAnalysis(): void {
        // By default do nothing.
    }

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

    evaluateAsString(): string {
        throw new Error(this.sourcePosition.formatMessage('Not a string value'))
    }

    evaluateAsSymbol(): string {
        throw new Error(this.sourcePosition.formatMessage('Not a symbol value'))
    }

    plusOne(): HIRValue {
        throw new Error(this.sourcePosition.formatMessage('Not a numerical value.'))
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

    isControlFlowEscapeType() : boolean {
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

    isDictionaryType() : boolean {
        return false;
    }

    isTupleType() : boolean {
        return false;
    }

    isEnumType(): boolean {
        return false;
    }

    isField(): boolean {
        return false;
    }

    isBehavior(): boolean {
        return false;
    }

    isClass(): boolean {
        return false;
    }

    isMetaclass(): boolean {
        return false;
    }

    isConstantValue() : boolean {
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

    isConstantDictionary() : boolean {
        return false;
    }

    isConstantEnum() : boolean {
        return false;
    }

    isConstantTuple() : boolean {
        return false;
    }

    isObjectValue(): boolean {
        return true;
    }

    isCompileTimeFunction(): boolean {
        return false;
    }

    isPrimitiveFunction(): boolean {
        return false;
    }

    isFunction() : boolean {
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

    evaluateWithArguments(callArguments: HIRValue[]): HIRValue {
        throw new Error(this.sourcePosition.formatMessage('Called value is non functional.'));
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

    analyzeAndBuildIdentifierReferenceNode(evaluator: AnalysisAndBuildPass, node: parseTree.ParseTreeIdentifierReferenceNode) : HIRValue {
        return this;
    }

    analyzeAndEvaluateApplicationNode(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeApplicationNode, functional: HIRValue): HIRValue {
        throw new Error(node.sourcePosition.formatMessage('Non-functional value cannot be applied.'))
    }

    analyzeAndBuildApplicationNode(analyzer: AnalysisAndBuildPass, node: parseTree.ParseTreeApplicationNode, functional: HIRValue): HIRValue {
        let selfType = this.getType();
        return selfType.analyzeAndBuildApplicationNodeOnType(analyzer, node, functional)
    }

    analyzeAndEvaluateAssignment(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeAssignmentNode) : HIRValue {
        throw new Error(node.sourcePosition.formatMessage('Value does not support assignment.'))
    }

    analyzeAndBuildAssignment(analyzer: AnalysisAndBuildPass, node: parseTree.ParseTreeAssignmentNode) : HIRValue {
        let selfType = this.getType();
        if (!selfType.isReferenceType())
            throw new Error(node.sourcePosition.formatMessage('Storage type does not support assignments.'))

        let baseType = (selfType as HIRReferenceType).baseType;
        let valueToStore = analyzer.visitNodeWithExpectedType(node.value, baseType);
        analyzer.builder.store(this, valueToStore, node.sourcePosition);
        return this;
    }

    analyzeAndEvaluateMessageSendNode(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue) : HIRValue {
        let selfType = this.getType();
        return selfType.analyzeAndEvaluateMessageSendNodeOnType(evaluator, node, receiver)
    }

    analyzeAndBuildMessageSendNode(builder: AnalysisAndBuildPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue) : HIRValue {
        let selfType = this.getType();
        return selfType.analyzeAndBuildMessageSendNodeOnType(builder, node, receiver)
    }

    asArrowArguments(): HIRType[] {
        throw new Error(this.sourcePosition.formatMessage('Not a valid type for the arrow arguments'));
    }
    
}

export class HIRType extends HIRValue {
    coreTypes: HIRCoreTypes;

    constructor(coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(sourcePosition);
        this.coreTypes = coreTypes;
    }

    accept(visitor: HIRVisitor): any {
        return visitor.visitType(this);
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

    analyzeAndBuildApplicationNodeOnType(analyzer: AnalysisAndBuildPass, node: parseTree.ParseTreeApplicationNode, functional: HIRValue): HIRValue {
        throw new Error('Non-functional value cannot be applied.')
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

    analyzeAndBuildMessageSendNodeOnType(buildPass: AnalysisAndBuildPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue) : HIRValue {
        let selector = buildPass.evaluateSymbolNode(node.selector);

        // FIXME: remove this hack
        if(selector == 'yourself')
            return receiver;

        let foundMethod = this.lookupSelector(selector);
        if(!foundMethod)
            throw new Error(node.sourcePosition.formatMessage(`type '${this.toString()}' does not have method with selector #${selector}.`))

        return foundMethod.analyzeAndBuildMessageSendNode(buildPass, node, receiver)
    }

    evaluateAndTypecheckArguments(evaluator: AnalysisAndEvaluationPass, callArguments: parseTree.ParseTreeNode[], sourcePosition: AbstractSourcePosition): [HIRValue[], HIRType] {
        throw new Error(sourcePosition.formatMessage('Receiver type is non-functional.'))
    }

    analyzeBuildAndTypecheckArguments(buildPass: AnalysisAndBuildPass, callArguments: parseTree.ParseTreeNode[], sourcePosition: AbstractSourcePosition): [HIRValue[], HIRType] {
        throw new Error(sourcePosition.formatMessage('Receiver type is non-functional.'))
    }

    lookupSelector(selector: string) : HIRValue | null {
        return null;
    }

    asArrowArguments(): HIRType[] {
        return [this];
    }

    getValueAlignment(): number {
        return this.coreTypes.pointerAlignment
    }

    getValueSize(): number {
        return this.coreTypes.pointerSize
    }
}

export class HIRPendingDefinitionBody {
    evaluationContext: HIREvaluationContext;
    definitionBody: parseTree.ParseTreeNode;

    constructor(evaluationContext: HIREvaluationContext, definitionBody: parseTree.ParseTreeNode) {
        this.evaluationContext = evaluationContext;
        this.definitionBody = definitionBody;
    }

    evaluateForOwner(owner: HIRValue) {
        let bodyContext = this.evaluationContext.clone();
        bodyContext.environment = new HIRLexicalEnvironment(new HIROwnerEnvironment(this.evaluationContext.environment, owner));
        return new AnalysisAndEvaluationPass(bodyContext).visitDecayedNode(this.definitionBody);
    }
}

export class HIRNominalType extends HIRType {
    name: string | null;
    methodDictionary: Record<string, HIRValue> = {}
    defaultValue: HIRConstant | null = null;
    pendingDefinitionBodies: HIRPendingDefinitionBody[] = [];

    constructor(name:string | null, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(coreTypes, sourcePosition);
        this.name = name;
    }

    accept(visitor: HIRVisitor): any {
        return visitor.visitNominalType(this);
    }

    addPendingDefinitionBody(evaluationContext: HIREvaluationContext, definitionBody: parseTree.ParseTreeNode) {
        this.pendingDefinitionBodies.push(new HIRPendingDefinitionBody(evaluationContext, definitionBody));
    }

    ensureAnalysis(): void {
        super.ensureAnalysis();
        while(this.pendingDefinitionBodies.length !== 0) {
            let toAnalyze = this.pendingDefinitionBodies;
            this.pendingDefinitionBodies = [];

            for(let i = 0; i < toAnalyze.length; ++i) {
                let body = toAnalyze[i];
                if(!body)
                    throw new Error('Expected a pending body to analyze.');
                body.evaluateForOwner(this);
            }
        }
    }

    getName() : string | null {
        return this.name;
    }

    getOrCreateDefaultValue() : HIRConstant {
        if(!this.defaultValue)
            throw new Error(this.sourcePosition.formatMessage(`Nominal type ${this.name} does not have a default value.`))
        return this.defaultValue;
    } 

    isNominalType(): boolean {
        return true;
    }

    addPrimitiveMethod(method: HIRPrimitiveFunction) {
        this.withSelectorAddMethod(method.selector, method);
    }

    addPrimitiveMacro(macro: HIRPrimitiveMacro) {
        this.withSelectorAddMethod(macro.name, macro);
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

export class HIREnumType extends HIRType {
    name: string | null;
    baseType: HIRType;
    values: HIRConstantEnum[] = [];
    valueTable: Record<string, HIRConstantEnum> = {}

    constructor(name: string|null, baseType: HIRType, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(coreTypes, sourcePosition)
        this.name = name;
        this.baseType = baseType;
    }

    accept(visitor: HIRVisitor) {
        return visitor.visitEnumType(this);
    }

    addElementAt(element: HIRConstantEnum, sourcePosition: AbstractSourcePosition) : void {
        if(!element.name)
            return;

        if(element.name in this.valueTable)
            throw new Error(sourcePosition.formatMessage(`enum has duplicated definitions for symbol #${element.name}`));

        this.values.push(element);
        this.valueTable[element.name] = element;
    }

    isEnumType(): boolean {
        return true;   
    }

    analyzeAndEvaluateMessageSendNode(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue): HIRValue {
        let selector = evaluator.visitSymbolNode(node.selector);
        if(selector in this.valueTable) {
            return this.valueTable[selector] as HIRValue
        }

        if(selector === 'value:') {
            let valueArgument = node.sendArguments[0];
            if(!valueArgument)
                throw new Error('Expected a single argument for enum #value:');

            let value = evaluator.visitNodeWithExpectedType(valueArgument, this.baseType);
            return new HIRConstantEnum(null, value, this, node.sourcePosition);
        }

        return super.analyzeAndEvaluateMessageSendNode(evaluator, node, receiver);
    }

    analyzeAndEvaluateMessageSendNodeOnType(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue): HIRValue {
        let selector = evaluator.visitSymbolNode(node.selector);
        if(selector === 'value') {
            if(!receiver.isConstantEnum())
                throw new Error('Expected a constant enum for extracting its value.')
            
            let constantEnum = receiver as HIRConstantEnum;
            return constantEnum.value;
        }
        
        return super.analyzeAndEvaluateMessageSendNodeOnType(evaluator, node, receiver);
    }

    analyzeAndBuildMessageSendNode(builder: AnalysisAndBuildPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue): HIRValue {
        let selector = builder.evaluateSymbolNode(node.selector);
        if(selector in this.valueTable) {
            return this.valueTable[selector] as HIRValue
        }

        if(selector === 'value:') {
            let valueArgument = node.sendArguments[0];
            if(!valueArgument)
                throw new Error('Expected a single argument for enum #value:');

            let value = builder.visitNodeWithExpectedType(valueArgument, this.baseType);
            return builder.builder.enumBoxValue(value, this, node.sourcePosition);
        }

        return super.analyzeAndBuildMessageSendNode(builder, node, receiver);
    }

    analyzeAndBuildMessageSendNodeOnType(buildPass: AnalysisAndBuildPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue): HIRValue {
        let selector = buildPass.evaluateSymbolNode(node.selector);
        if(selector === 'value') {
            return buildPass.builder.enumUnboxValue(receiver, this.baseType, node.sourcePosition)
        }
        
        return super.analyzeAndBuildMessageSendNodeOnType(buildPass, node, receiver);
    }

    toString(): string {
        if(this.name)
            return this.name;
        return super.toString();
    }
}

export class HIRField extends HIRValue {
    name: string | null;
    fieldType: HIRType;
    isPublic: boolean;
    coreTypes: HIRCoreTypes;
    offset: number = -1;
    size: number = -1;
    index: number = -1;
    owner: HIRValue | null = null;

    constructor(name: string | null, fieldType: HIRType, isPublic: boolean, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(sourcePosition)
        this.name = name;
        this.fieldType = fieldType;
        this.isPublic = isPublic;
        this.coreTypes = coreTypes;
    }

    accept(visitor: HIRVisitor) {
        return visitor.visitField(this);
    }

    getType(): HIRType {
        return this.coreTypes.fieldType;
    }

    isField(): boolean {
        return true;
    }

    analyzeAndEvaluateMessageSendNode(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue): HIRValue {
        if(node.sendArguments.length === 0) {
            return receiver.loadValueAtIndex(this.index);
        } else if(node.sendArguments.length === 1) {
            let newValue = evaluator.visitNodeWithExpectedType(node.sendArguments[0] as parseTree.ParseTreeNode, this.fieldType);
            receiver.storeValueAtIndex(newValue, this.index);
            return newValue;
        }

        return super.analyzeAndEvaluateMessageSendNode(evaluator, node, receiver);
    }

}

export abstract class HIRBehavior extends HIRNominalType {
    superclass: HIRBehavior | null;
    fields: HIRField[] = [];
    fieldTable: Record<string, HIRField> = {}
    allFields: HIRField[] = [];
    publicFields: Record<string, HIRField> = {}
    instanceSize: number = -1;
    instanceAlignment: number = -1
    totalFieldCount: number = -1;

    constructor(name: string|null, superclass: HIRBehavior | null, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(name, coreTypes, sourcePosition)
        this.superclass = superclass;
    }

    isBehavior(): boolean {
        return true;
    }

    getSupertype(): HIRType | null {
        return this.superclass
    }

    ensureLayout(): void {
        this.ensureAnalysis();
        if(this.instanceSize >= 0)
            return;

        this.instanceSize = 0;
        this.instanceAlignment = 1;
        this.totalFieldCount = 0;
        this.allFields = []

        if(this.superclass) {
            this.superclass.ensureLayout();

            this.instanceSize = this.superclass.instanceSize
            this.instanceAlignment = this.superclass.instanceAlignment
            this.totalFieldCount = this.superclass.totalFieldCount
            this.allFields.push(...this.superclass.allFields);
        }
        this.allFields.push(...this.fields);

        for(let i = 0; i < this.fields.length; ++i) {
            let field = this.fields[i] as HIRField;
            field.index = this.totalFieldCount;
            
            let fieldAlignment = field.fieldType.getValueAlignment();
            let fieldSize = field.fieldType.getValueSize();

            this.instanceSize = alignedTo(this.instanceSize, fieldAlignment);
            field.offset = this.instanceSize;
            this.instanceSize += fieldSize;

            this.instanceAlignment = Math.max(this.instanceAlignment, fieldAlignment)
            ++this.totalFieldCount;
        }

        this.instanceSize = alignedTo(this.instanceSize, this.instanceAlignment)
    }

    addField(field: HIRField): void {
        this.fields.push(field);
        this.invalidateLayout();
        field.owner = this;

        if(field.name) {
            this.fieldTable[field.name] = field;

            if(field.isPublic) {
                this.publicFields[field.name] = field;
                this.publicFields[field.name + ':'] = field;
            }
        }
    }

    invalidateLayout() {
        this.instanceSize = -1;
        this.instanceAlignment = -1;
    }

    getInstanceSize(): number {
        this.ensureLayout();
        return this.instanceSize;
    }

    getInstanceAlignment(): number {
        this.ensureLayout();
        return this.instanceAlignment;
    }

    lookupSelector(selector: string): HIRValue | null {
        if (selector in this.methodDictionary)
            return this.methodDictionary[selector] as HIRValue;
        if (selector in this.publicFields)
            return this.publicFields[selector] as HIRValue;
        if(this.superclass)
            return this.superclass.lookupSelector(selector);
        return null;
    }

}

export class HIRClass extends HIRBehavior {
    metaClass: HIRMetaclass;
    constructor(name: string|null, metaClass: HIRMetaclass, superclass: HIRBehavior | null, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(name, superclass, coreTypes, sourcePosition);
        this.metaClass = metaClass;
    }

    accept(visitor: HIRVisitor) {
        return visitor.visitClass(this);
    }

    isClass(): boolean {
        return true;
    }
    
    getType(): HIRType {
        return this.metaClass;
    }

    analyzeAndEvaluateApplicationNode(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeApplicationNode, functional: HIRValue): HIRValue {
        this.ensureLayout()

        if(node.applicationArguments.length > this.allFields.length)
            throw new Error(node.sourcePosition.formatMessage(`class construction can have at most ${this.allFields.length.toString()} arguments.`));

        let objectFields: HIRValue[] = [];
        for(let i = 0; i < this.allFields.length; ++i) {
            let field = this.allFields[i] as HIRField;
            if(i < node.applicationArguments.length) {
                let fieldArgument = node.applicationArguments[i];
                if(!fieldArgument)
                    throw new Error('Expected a field argument.');
                let fieldValue = evaluator.visitNodeWithExpectedType(fieldArgument, field.fieldType)
                objectFields.push(fieldValue);
            } else {
                let fieldValue = field.fieldType.getOrCreateDefaultValue();
                objectFields.push(fieldValue);
            }
        }

        let objectValue = new HIRObjectValue(this, objectFields, node.sourcePosition);
        let initializeMethod = this.lookupSelector('initialize');
        if(initializeMethod) {
            throw new Error('TODO: HIRClass initialize');
        }

        return objectValue;
    }
}

export class HIRMetaclass extends HIRBehavior {
    metaclassType: HIRClass | null;
    thisClass: HIRClass | null = null;

    constructor(metaclassType: HIRClass | null, superclass: HIRBehavior | null, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(null, superclass, coreTypes, sourcePosition);
        this.metaclassType = metaclassType;
    }

    accept(visitor: HIRVisitor) {
        return visitor.visitMetaclass(this);
    }

    isMetaclass(): boolean {
        return true;
    }

    getType(): HIRType {
        if(!this.metaclassType)
            throw new Error(this.sourcePosition.formatMessage(`${this.toString()} has incomplete meta-hierarchy.`))
        return this.metaclassType;
    }

    toString(): string {
        if(this.thisClass)
            return this.thisClass.toString() + ' class';
        return '<anon metaclass>';
    }

    analyzeAndEvaluateMessageSendNodeOnType(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue): HIRValue {
        let selector = evaluator.visitSymbolNode(node.selector);

        // FIXME: Remove this hack by using a method dictionary
        if(selector === '=>') {
            let functionArguments = receiver.asArrowArguments();
            let resultType = evaluator.visitNodeExpectingType(node.sendArguments[0] as parseTree.ParseTreeNode);
            return this.coreTypes.getOrCreateSimpleFunctionType(functionArguments, resultType);
        }

        return super.analyzeAndEvaluateMessageSendNodeOnType(evaluator, node, receiver);
    }

    analyzeAndBuildMessageSendNodeOnType(buildPass: AnalysisAndBuildPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue): HIRValue {
        let selector = buildPass.evaluateSymbolNode(node.selector);

        // FIXME: Remove this hack by using a method dictionary
        if(selector === '=>') {
            let functionArguments = receiver.asArrowArguments();
            let resultType = buildPass.visitNodeExpectingType(node.sendArguments[0] as parseTree.ParseTreeNode);
            return this.coreTypes.getOrCreateSimpleFunctionType(functionArguments, resultType);
        }
        return super.analyzeAndBuildMessageSendNodeOnType(buildPass, node, receiver);
    }
}

export class HIRDynamicType extends HIRType {
    name: string;

    constructor(name:string, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(coreTypes, sourcePosition);
        this.name = name;
    }

    accept(visitor: HIRVisitor): any {
        return visitor.visitDynamicType(this);
    }

    getName() : string | null {
        return this.name;
    }

    isDynamicType(): boolean {
        return true;
    }

    isSatisfiedByType(subtype: HIRValue) {
        return true
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

    accept(visitor: HIRVisitor): any {
        return visitor.visitPrimitiveType(this);
    }

    isPrimitiveType(): boolean {
        return true;
    }

    getValueAlignment(): number {
        return this.alignment;
    }

    getValueSize(): number {
        return this.size;
    }
}

export class HIRUndefinedType extends HIRType {
    name: string;

    constructor(name:string, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(coreTypes, sourcePosition);
        this.name = name;
    }

    accept(visitor: HIRVisitor): any {
        return visitor.visitUndefinedType(this)
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

    accept(visitor: HIRVisitor): any {
        return visitor.visitVoidType(this);
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

export class HIRControlFlowEscapeType extends HIRType {
    name: string;

    constructor(name:string, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(coreTypes, sourcePosition);
        this.name = name;
    }

    accept(visitor: HIRVisitor): any {
        return visitor.visitControlFlowEscapeType(this);
    }

    getName() : string | null {
        return this.name;
    }

    isControlFlowEscapeType(): boolean {
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

    accept(visitor: HIRVisitor): any {
        return visitor.visitUniverseType(this)
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

    analyzeAndEvaluateMessageSendNodeOnType(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue): HIRValue {
        let selector = evaluator.visitSymbolNode(node.selector);

        // FIXME: Remove this hack by using a method dictionary
        if(selector === '=>') {
            let functionArguments = receiver.asArrowArguments();
            let resultType = evaluator.visitNodeExpectingType(node.sendArguments[0] as parseTree.ParseTreeNode);
            return this.coreTypes.getOrCreateSimpleFunctionType(functionArguments, resultType);
        }
        else if(selector === 'pointer') {
            if(!receiver.isType())
                throw new Error('Expected a receiver type');
            return this.coreTypes.getOrCreatePointerType(receiver as HIRType)
        }
        else if(selector === 'ref') {
            if(!receiver.isType())
                throw new Error('Expected a receiver type');
            return this.coreTypes.getOrCreateReferenceType(receiver as HIRType)
        }
        else if(selector === 'mutableValueBox') {
            if(!receiver.isType())
                throw new Error('Expected a receiver type');
            return this.coreTypes.getOrCreateMutableValueBoxType(receiver as HIRType)
        }

        return super.analyzeAndEvaluateMessageSendNodeOnType(evaluator, node, receiver);
    }

    analyzeAndBuildMessageSendNodeOnType(buildPass: AnalysisAndBuildPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue): HIRValue {
        let selector = buildPass.evaluateSymbolNode(node.selector);

        // FIXME: Remove this hack by using a method dictionary
        if(selector === '=>') {
            let functionArguments = receiver.asArrowArguments();
            let resultType = buildPass.visitNodeExpectingType(node.sendArguments[0] as parseTree.ParseTreeNode);
            return this.coreTypes.getOrCreateSimpleFunctionType(functionArguments, resultType);
        }
        else if(selector === 'pointer') {
            if(!receiver.isType())
                throw new Error('Expected a receiver type');
            return this.coreTypes.getOrCreatePointerType(receiver as HIRType)
        }
        else if(selector === 'ref') {
            if(!receiver.isType())
                throw new Error('Expected a receiver type');
            return this.coreTypes.getOrCreateReferenceType(receiver as HIRType)
        }
        else if(selector === 'mutableValueBox') {
            if(!receiver.isType())
                throw new Error('Expected a receiver type');
            return this.coreTypes.getOrCreateMutableValueBoxType(receiver as HIRType)
        }

        return super.analyzeAndBuildMessageSendNodeOnType(buildPass, node, receiver);
    }
}

export class HIRDerivedType extends HIRType {
    baseType: HIRType;

    constructor(baseType: HIRType, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(coreTypes, sourcePosition);
        this.baseType = baseType;
    }

    accept(visitor: HIRVisitor): any {
        return visitor.visitDerivedType(this);
    }

    isDerivedType(): boolean {
        return true;
    }
}

export class HIRPointerLikeType extends HIRDerivedType {
    constructor(baseType: HIRType, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(baseType, coreTypes, sourcePosition);
    }

    accept(visitor: HIRVisitor): any {
        return visitor.visitPointerLikeType(this);
    }

    isPointerLikeType(): boolean {
        return true;
    }
}

export class HIRPointerType extends HIRPointerLikeType {
    constructor(baseType: HIRType, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(baseType, coreTypes, sourcePosition);
    }

    accept(visitor: HIRVisitor): any {
        return visitor.visitPointerType(this);
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

    accept(visitor: HIRVisitor): any {
        return visitor.visitReferenceType(this);
    }

    isReferenceType(): boolean {
        return true;
    }

    analyzeAndEvaluateMessageSendNode(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue): HIRValue {
        return this.baseType.analyzeAndEvaluateMessageSendNode(evaluator, node, receiver);
    }

    analyzeAndBuildMessageSendNode(builder: AnalysisAndBuildPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue): HIRValue {
        return this.baseType.analyzeAndBuildMessageSendNode(builder, node, receiver);
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

    accept(visitor: HIRVisitor): any {
        return visitor.visitMutableValueBoxType(this);
    }

    isMutableValueBoxType(): boolean {
        return true;
    }


    toString(): string {
        return this.baseType.toString() + ' mutableValueBox';
    }
}

export class HIRAssociationType extends HIRType {
    keyType: HIRType;
    valueType: HIRType;

    constructor(keyType: HIRType, valueType: HIRType, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(coreTypes, sourcePosition);
        this.keyType = keyType;
        this.valueType = valueType;
    }

    accept(visitor: HIRVisitor): any {
        return visitor.visitAssociationType(this);
    }

    isAssociationType(): boolean {
        return true;
    }
}

export class HIRDictionaryType extends HIRType {
    associationType: HIRAssociationType;

    constructor(associationType: HIRAssociationType, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(coreTypes, sourcePosition);
        this.associationType = associationType
    }

    accept(visitor: HIRVisitor): any {
        return visitor.visitDictionaryType(this);
    }

    isDictioanryType(): boolean {
        return true;
    }
}

export class HIRTupleType extends HIRType {
    elements: HIRType[];

    constructor(elements: HIRType[], coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(coreTypes, sourcePosition);
        this.elements = elements;
    }

    accept(visitor: HIRVisitor): any {
        return visitor.visitTupleType(this);
    }

    isTupleType(): boolean {
        return true;
    }

    asArrowArguments(): HIRType[] {
        return this.elements;
    }

    toString(): string {
        let string = '(';
        for(let i = 0; i < this.elements.length; ++i) {
            let element = this.elements[i];
            if(!element)
                throw new Error('Expected an element type.');
            if(i > 0)
                string += ', ';
            string += element.toString();
        }
        string += ')';
        return string;
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

    accept(visitor: HIRVisitor) {
        return visitor.visitDependentFunctionType(this);
    }

    canSimplifiy(): boolean {
        return true;
    }

    copyWithImplicitArgument(implicitArgument: HIRArgument) : HIRDependentFunctionType {
        return new HIRDependentFunctionType([implicitArgument].concat(this.functionArguments), this.resultType, this.coreTypes, this.sourcePosition);
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

    accept(visitor: HIRVisitor): any {
        return visitor.visitSimpleFunctionType(this);
    }

    isSimpleFunctionType(): boolean {
        return true;
    }

    toString(): string {
        let string = '(';
        for(let i = 0; i < this.argumentTypes.length; ++i) {
            let argument = this.argumentTypes[i];
            if(!argument)
                throw new Error('Expected an argument type.');
            if(i > 0)
                string += ', ';
            string += argument.toString();
        }
        string += ') => ';
        string += this.resultType.toString();
        return string;
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

    analyzeBuildAndTypecheckArguments(buildPass: AnalysisAndBuildPass, callArguments: parseTree.ParseTreeNode[], sourcePosition: AbstractSourcePosition): [HIRValue[], HIRType] {
        if(callArguments.length !== this.argumentTypes.length) {
            throw new Error(sourcePosition.formatMessage(`Expected ${this.argumentTypes.length.toString()} arguments instead of ${callArguments.length.toString()}.`))
        }

        let typecheckedArguments: HIRValue[] = [];
        for(let i = 0; i < callArguments.length; ++i) {
            let callArgument = callArguments[i];
            let expectedType = this.argumentTypes[i];
            if(!callArgument || !expectedType)
                throw new Error('Expected a valid argument.');

            let typecheckedArgument = buildPass.visitNodeWithExpectedType(callArgument, expectedType);
            typecheckedArguments.push(typecheckedArgument)
        }

        return [typecheckedArguments, this.resultType];
    }

    analyzeAndBuildApplicationNodeOnType(analyzer: AnalysisAndBuildPass, node: parseTree.ParseTreeApplicationNode, functional: HIRValue): HIRValue {
        let [typecheckedArguments, resultType] = this.analyzeBuildAndTypecheckArguments(analyzer, node.applicationArguments, node.sourcePosition);
        return analyzer.builder.call(functional, typecheckedArguments, resultType, node.sourcePosition);
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

export abstract class HIRConstantLiteralValue extends HIRConstant {
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

    accept(visitor: HIRVisitor): any {
        return visitor.visitConstantLiteralIntegerValue(this);
    }

    evaluateAsInteger(): number {
        return this.value;
    }

    evaluateAsNumber(): number {
        return this.value;
    }

    plusOne(): HIRValue {
        return new HIRConstantLiteralIntegerValue(this.value + 1, this.type, this.sourcePosition);
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

    accept(visitor: HIRVisitor) {
        return visitor.visitConstantLiteralFloatValue(this);
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

    accept(visitor: HIRVisitor): any {
        return visitor.visitConstantLiteralBooleanValue(this);
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

    accept(visitor: HIRVisitor) {
        return visitor.visitConstantLiteralCharacterValue(this);
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

    accept(visitor: HIRVisitor): any {
        return visitor.visitConstantLiteralStringValue(this);
    }

    evaluateAsString(): string {
        return this.value;
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

    accept(visitor: HIRVisitor): any {
        return visitor.visitConstantLiteralSymbolValue(this);
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

    accept(visitor: HIRVisitor) {
        return visitor.visitConstantLiteralVoidValue(this);
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

    accept(visitor: HIRVisitor) {
        return visitor.visitConstantLiteralNilValue(this);
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

    accept(visitor: HIRVisitor): any {
        return visitor.visitConstantLiteralUndefinedValue(this);
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

    accept(visitor: HIRVisitor): any {
        return visitor.visitConstantLiteralParseTree(this);
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

    accept(visitor: HIRVisitor): any {
        return visitor.visitConstantAssociation(this);
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

export class HIRConstantDictionary extends HIRConstant {
    associations: HIRConstantAssociation[];
    dictionaryType: HIRDictionaryType;

    constructor(associations: HIRConstantAssociation[], dictionaryType: HIRDictionaryType, sourcePosition: AbstractSourcePosition) {
        super(sourcePosition);

        this.associations = associations;
        this.dictionaryType = dictionaryType;
    }

    accept(visitor: HIRVisitor) {
        return visitor.visitConstantDictionary(this);
    }

    getType(): HIRType {
        return this.dictionaryType;
    }

    isConstantDictionary(): boolean {
        return true;
    }

};

export class HIRConstantTuple extends HIRConstant {
    elements: HIRValue[];
    type: HIRType;

    constructor(elements: HIRValue[], type: HIRType, sourcePosition: AbstractSourcePosition) {
        super(sourcePosition);
        this.elements = elements;
        this.type = type;
    }

    accept(visitor: HIRVisitor): any {
        return visitor.visitConstantTuple(this);
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

export class HIRConstantEnum extends HIRConstant {
    name: string | null;
    value: HIRConstant;
    type: HIREnumType;

    constructor(name: string | null, value: HIRConstant, type: HIREnumType, sourcePosition: AbstractSourcePosition) {
        super(sourcePosition);
        this.name = name;
        this.value = value;
        this.type = type;
    }

    accept(visitor: HIRVisitor) {
        return visitor.visitConstantEnum(this);
    }

    isConstantEnum(): boolean {
        return true;
    }

    getType(): HIRType {
        return this.type;
    }

    toString(): string {
        if(!this.name)
            `enumValue(${this.value.toString()})`
        return `enumValue(${this.name}: ${this.value.toString()})`
    }
    
}

export class HIRObjectValue extends HIRValue {
    type: HIRBehavior;
    fields: HIRValue[];

    constructor(type: HIRBehavior, fields: HIRValue[], sourcePosition: AbstractSourcePosition) {
        super(sourcePosition);
        this.type = type;
        this.fields = fields;
    }

    accept(visitor: HIRVisitor) {
        return visitor.visitObjectValue(this);
    }

    getType(): HIRType {
        return this.type;
    }

    isObjectValue(): boolean {
        return true;
    }

    storeValueAtIndex(valueToStore: HIRValue, index: number): void {
        if (index >= this.fields.length)
            throw new Error(this.sourcePosition.formatMessage('Invalid field index for storing in an object value'));
        this.fields[index] = valueToStore;
    }

    loadValueAtIndex(index: number): HIRValue {
        if (index >= this.fields.length)
            throw new Error(this.sourcePosition.formatMessage('Invalid field index for loading from an object value'));

        return this.fields[index] as HIRValue;
    }
}

export class HIRMacroContext extends HIRValue {
    coreTypes: HIRCoreTypes;

    constructor(coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(sourcePosition);
        this.coreTypes = coreTypes;
    }

    accept(visitor: HIRVisitor): any {
        return visitor.visitMacroContext(this);
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

    accept(visitor: HIRVisitor) {
        return visitor.visitPrimitiveMacro(this);
    }

    getType(): HIRType {
        return this.type;
    }

    analyzeAndEvaluateMessageSendNode(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue): HIRValue {
        let macroContext = new HIRMacroContext(evaluator.evaluationContext.context.coreTypes, node.sourcePosition);
        let receiverNode = new parseTree.ParseTreeLiteralValueNode(node.sourcePosition, receiver);
        let expandedMacro = this.primitiveFunction(macroContext, receiverNode, ...node.sendArguments);
        return evaluator.visitNode(expandedMacro);
    }

    analyzeAndBuildMessageSendNode(builder: AnalysisAndBuildPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue): HIRValue {
        let macroContext = new HIRMacroContext(builder.builder.context.coreTypes, node.sourcePosition);
        let receiverNode = new parseTree.ParseTreeLiteralValueNode(node.sourcePosition, receiver);
        let expandedMacro = this.primitiveFunction(macroContext, receiverNode, ...node.sendArguments);
        return builder.visitNode(expandedMacro);
    }

    analyzeAndEvaluateApplicationNode(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeApplicationNode, functional: HIRValue): HIRValue {
        let macroContext = new HIRMacroContext(evaluator.evaluationContext.context.coreTypes, node.sourcePosition);
        let expandedMacro = this.primitiveFunction(macroContext, ...node.applicationArguments) as parseTree.ParseTreeNode;
        return evaluator.visitNode(expandedMacro);
    }

    analyzeAndBuildApplicationNode(analyzer: AnalysisAndBuildPass, node: parseTree.ParseTreeApplicationNode, functional: HIRValue): HIRValue {
        let macroContext = new HIRMacroContext(analyzer.builder.context.coreTypes, node.sourcePosition);
        let expandedMacro = this.primitiveFunction(macroContext, ...node.applicationArguments) as parseTree.ParseTreeNode;
        return analyzer.visitNode(expandedMacro);        
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

    accept(visitor: HIRVisitor) {
        return visitor.visitPrimitiveFunction(this);
    }

    isPrimitiveFunction() {
        return true;
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

    analyzeAndBuildMessageSendNode(buildPass: AnalysisAndBuildPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue): HIRValue {
        let receiverNode = new parseTree.ParseTreeLiteralValueNode(node.sourcePosition, receiver);
        let allArguments: parseTree.ParseTreeNode[] = [receiverNode];
        allArguments.push(...node.sendArguments);
        let [typecheckedArguments, resultType] = this.type.analyzeBuildAndTypecheckArguments(buildPass, allArguments, node.sourcePosition);
        return buildPass.builder.call(this, typecheckedArguments, resultType, node.sourcePosition);
    }

    analyzeAndEvaluateApplicationNode(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeApplicationNode, functional: HIRValue): HIRValue {
        let [typecheckedArguments, resultType] = this.type.evaluateAndTypecheckArguments(evaluator, node.applicationArguments, node.sourcePosition);
        return this.primitiveFunction(...typecheckedArguments, resultType, node.sourcePosition)
    }

    analyzeAndBuildApplicationNode(analyzer: AnalysisAndBuildPass, node: parseTree.ParseTreeApplicationNode, functional: HIRValue): HIRValue {
        throw new Error('TODO: HIRPrimitiveFunction analyzeAndBuildApplicationNode')
    }

    evaluateWithArgumentsAndResultTypeAt(callArguments: HIRValue[], resultType: HIRType, callSourcePosition: AbstractSourcePosition): HIRValue {
        return this.primitiveFunction(...callArguments, resultType, callSourcePosition);
    }

    isCompileTimeFunction(): boolean {
        return this.isCompileTime
    }

    toString(): string {
        return this.name
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

    accept(visitor: HIRVisitor): any {
        return visitor.visitMutableValueBox(this);
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

    accept(visitor: HIRVisitor) {
        return visitor.visitPointerLikeValue(this);
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

    accept(visitor: HIRVisitor) {
        return visitor.visitPointerValue(this);
    }
}

export class HIRReferenceValue extends HIRPointerLikeValue {
    isReferenceValue(): boolean {
        return true;
    }

    accept(visitor: HIRVisitor) {
        return visitor.visitReferenceValue(this);
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

    definitionBody: parseTree.ParseTreeNode | null = null;
    definitionContext: HIRContext | null = null;
    definitionEnvironment: HIRLexicalEnvironment | null = null;

    firstBasicBlock: HIRBasicBlock | null = null;
    lastBasicBlock: HIRBasicBlock | null = null;
    enumeratedInstructions: HIRFunctionLocalValue[] | null = null; 

    constructor(name: string | null, dependentFunctionType: HIRDependentFunctionType, sourcePosition: AbstractSourcePosition) {
        super(sourcePosition);
        this.name = name;
        this.dependentFunctionType = dependentFunctionType;
        this.simplifiedType = dependentFunctionType.asSimplifiedType();
    }

    accept(visitor: HIRVisitor) {
        return visitor.visitFunction(this);
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

    ensureAnalysis(): void {
        if(this.firstBasicBlock)
            return;

        // Function environment arguments
        let selfArgument: HIRArgument | null = null;
        if(this.dependentFunctionType.functionArguments.length >= 1) {
            let firstArgument = this.dependentFunctionType.functionArguments[0] as HIRArgument;
            if(firstArgument.isSelf)
                selfArgument = firstArgument;
        }

        let context = this.definitionContext as HIRContext;
        let functionEnvironment = new HIRFunctionAnalysisEnvironment(this.definitionEnvironment as HIREnvironment, this.dependentFunctionType.resultType, selfArgument, context);
        for(let i = 0; i < this.dependentFunctionType.functionArguments.length; ++i) {
            let functionArgument = this.dependentFunctionType.functionArguments[i] as HIRArgument;
            if (functionArgument.name) {
                functionEnvironment.setNewSymbolBinding(functionArgument.name, functionArgument, functionArgument.sourcePosition);
            }
        }

        // Body environment
        let bodyEnvironment = new HIRLexicalEnvironment(functionEnvironment);

        // Alloca block
        let allocaBlock = new HIRBasicBlock(context.coreTypes.basicBlockType, 'alloca', this.sourcePosition);
        this.addBasicBlock(allocaBlock);
        let allocaBuilder = new HIRBuilder(this, context, allocaBlock, bodyEnvironment);

        // Entry block
        let entryBlock = new HIRBasicBlock(context.coreTypes.basicBlockType, 'entry', this.sourcePosition);
        this.addBasicBlock(entryBlock);
        let builder = new HIRBuilder(this, context, entryBlock, bodyEnvironment);
        builder.allocaBuilder = allocaBuilder
        builder.entryBasicBlock = entryBlock;

        // Build the body
        let result = new AnalysisAndBuildPass(builder).visitNodeWithExpectedType(this.definitionBody as parseTree.ParseTreeNode, this.dependentFunctionType.resultType);
        if(!builder.isLastTerminator())
            builder.returnValue(result, this.sourcePosition);

        // Finish building
        builder.finishBuilding(this.sourcePosition);

        this.captures = functionEnvironment.captureList;
    }

    enumerateInstructions(): HIRFunctionLocalValue[] {
        if(this.enumeratedInstructions !== null)
            return this.enumeratedInstructions;

        this.ensureAnalysis();
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
        this.ensureAnalysis();
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

        for(let i = 0; i < this.captures.length; ++i) {
            let capture = this.captures[i];
            if(!capture)
                throw new Error('Expected a capture value value');
            result += capture.fullPrintString();
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

    analyzeAndEvaluateApplicationNode(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeApplicationNode, functional: HIRValue): HIRValue {
        let [typecheckedArguments, resultType] = this.getType().evaluateAndTypecheckArguments(evaluator, node.applicationArguments, node.sourcePosition);
        return this.evaluateWithArgumentsAndResultTypeAt(typecheckedArguments, resultType, node.sourcePosition)
    }

    analyzeAndEvaluateMessageSendNode(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue): HIRValue {
        let receiverNode = new parseTree.ParseTreeLiteralValueNode(node.sourcePosition, receiver);
        let allArguments: parseTree.ParseTreeNode[] = [receiverNode];
        allArguments.push(...node.sendArguments);
        let [typecheckedArguments, resultType] = this.getType().evaluateAndTypecheckArguments(evaluator, allArguments, node.sourcePosition);
        return this.evaluateWithArgumentsAndResultTypeAt(typecheckedArguments, resultType, node.sourcePosition)
    }

    isFunction(): boolean {
        return true;
    }
}

export class HIRFunctionClosure extends HIRConstant {
    hirFunction: HIRFunction;
    captureVector: HIRValue[];
    constructor(hirFunction: HIRFunction, captureVector: HIRValue[], sourcePosition: AbstractSourcePosition) {
        super(sourcePosition);
        this.hirFunction = hirFunction;
        this.captureVector = captureVector;
    }

    accept(visitor: HIRVisitor) {
        return visitor.visitFunctionClosure(this);
    }

    getType(): HIRType {
        return this.hirFunction.simplifiedType;
    }

    evaluateWithArguments(callArguments: HIRValue[]): HIRValue {
        return this.hirFunction.evaluateWithArgumentsAndCaptures(callArguments, this.captureVector);
    }

    evaluateWithArgumentsAndResultTypeAt(callArguments: HIRValue[], resultType: HIRType, callSourcePosition: AbstractSourcePosition): HIRValue {
        return this.evaluateWithArguments(callArguments)
    }

    isFunctionClosure(): boolean {
        return true;
    }

    toString(): string {
        return 'HIRFunctionClosure ' + this.hirFunction.toString();
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

    isFunctionLocalValue(): boolean {
        return true;
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

    accept(visitor: HIRVisitor): any {
        return visitor.visitArgument(this);
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
    sourceValue: HIRValue;

    constructor(sourceValue: HIRValue, type: HIRType, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(type, name, sourcePosition);
        this.sourceValue = sourceValue;
    }

    accept(visitor: HIRVisitor): any {
        return visitor.visitCapture(this);
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

    accept(visitor: HIRVisitor): any {
        return visitor.visitBasicBlock(this)
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

    simplifyWithBuilder(builder: HIRBuilder) : HIRValue {
        return this;
    }
}

export class HIRAllocaInstruction extends HIRInstruction  {
    valueType: HIRType;
    valueBoxType: HIRType;

    constructor(valueType: HIRType, valueBoxType: HIRType, type: HIRType, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(type, name, sourcePosition);
        this.valueType = valueType;
        this.valueBoxType = valueBoxType;
    }

    accept(visitor: HIRVisitor): any {
        return visitor.visitAllocaInstruction(this);
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

    accept(visitor: HIRVisitor): any {
        return visitor.visitBranchInstruction(this);
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

    accept(visitor: HIRVisitor): any {
        return visitor.visitConditionalBranchInstruction(this);
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

    accept(visitor: HIRVisitor) {
        return visitor.visitCallInstruction(this);
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

    canSimplify(): boolean {
        //console.log('this.functional.isCompileTimeFunction()', this.functional.isCompileTimeFunction());
        if(!this.functional.isCompileTimeFunction())
            return false;

        for(let i = 0; i < this.callArguments.length; ++i) {
            let argument = this.callArguments[i];
            if(!argument)
                throw new Error('Expected an argument');
            
            //console.log('argument', argument.isConstantValue(), argument);
            if(!argument.isConstantValue())
                return false;
        }
   
        return true;
    }

    simplifyWithBuilder(builder: HIRBuilder) : HIRValue {
        if(!this.canSimplify())
            return this;

        return this.functional.evaluateWithArgumentsAndResultTypeAt(this.callArguments, this.type, this.sourcePosition);
    }
}

export class HIREnumBoxValueInstruction extends HIRInstruction {
    value: HIRValue;

    constructor(value: HIRValue, type: HIRType, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(type, name, sourcePosition);
        this.value = value;
    }

    accept(visitor: HIRVisitor) {
        return visitor.visitEnumBoxValueInstruction(this);
    }

    fullPrintString(): string {
        return `${this.toString()} := enumBox ${this.value.toString()} as ${this.type.toString()}`
    }

    evaluateInActivationContext(context: HIRFunctionActivationContext): void {
        let enumValue = this.value.getValueInEvaluationContext(context);
        if(!enumValue.isConstantValue())
            throw new Error('Expected a constant value.');
        context.setCurrentInstructionValue(new HIRConstantEnum(null, enumValue as HIRConstant,this.type as HIREnumType, this.sourcePosition));
    }
};

export class HIREnumUnboxValueInstruction extends HIRInstruction {
    value: HIRValue;

    constructor(value: HIRValue, type: HIRType, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(type, name, sourcePosition);
        this.value = value;
    }

    accept(visitor: HIRVisitor) {
        return visitor.visitEnumBoxValueInstruction(this);
    }

    fullPrintString(): string {
        return `${this.toString()} := enumUnbox ${this.value.toString()} as ${this.type.toString()}`
    }

    evaluateInActivationContext(context: HIRFunctionActivationContext): void {
        let enumValue = this.value.getValueInEvaluationContext(context);
        if(!enumValue.isConstantEnum())
            throw new Error('Expected an enum value.');
        
        let enumConstant = enumValue as HIRConstantEnum;
        context.setCurrentInstructionValue(enumConstant.value);
    }
};

export class HIRLoadInstruction extends HIRInstruction  {
    storage: HIRValue;

    constructor(storage: HIRValue, type: HIRType, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(type, name, sourcePosition);
        this.storage = storage;
    }

    accept(visitor: HIRVisitor): any {
        return visitor.visitLoadInstruction(this);
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

    accept(visitor: HIRVisitor): any {
        return visitor.visitStoreInstruction(this);
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

export class HIRMakeAssociationInstruction extends HIRInstruction  {
    key: HIRValue;
    value: HIRValue;

    constructor(key: HIRValue, value: HIRValue, type: HIRType, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(type, name, sourcePosition);
        this.key = key;
        this.value = value;
    }

    accept(visitor: HIRVisitor): any {
        return visitor.visitMakeAssociationInstruction(this);
    }

    fullPrintString(): string {
        return `${this.toString()} := makeAssocation ${this.key.toString()} with ${this.value.toString()}`
    }

    evaluateInActivationContext(context: HIRFunctionActivationContext) : void {
        let keyValue = this.key.getValueInEvaluationContext(context);
        let valueValue = this.value.getValueInEvaluationContext(context);
        let association = new HIRConstantAssociation(keyValue, valueValue, this.type, this.sourcePosition);
        context.setCurrentInstructionValue(association);
    }
}

export class HIRMakeTupleInstruction extends HIRInstruction  {
    elements: HIRValue[];

    constructor(elements: HIRValue[], type: HIRType, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(type, name, sourcePosition);
        this.elements = elements;
    }

    accept(visitor: HIRVisitor): any {
        return visitor.visitMakeTupleInstruction(this);
    }

    fullPrintString(): string {
        return `${this.toString()} := makeTuple ${this.elements.toString()}`
    }

    evaluateInActivationContext(context: HIRFunctionActivationContext) : void {
        let tupleElements = this.elements.map((value: HIRValue) : HIRValue => value.getValueInEvaluationContext(context));
        let tuple = new HIRConstantTuple(tupleElements, this.type, this.sourcePosition);
        context.setCurrentInstructionValue(tuple);
    }
}

export class HIRMakeClosureInstruction extends HIRInstruction  {
    hirFunction: HIRFunction;
    captureVector: HIRValue[];

    constructor(hirFunction: HIRFunction, captureVector: HIRValue[], type: HIRType, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(type, name, sourcePosition);
        this.hirFunction = hirFunction;
        this.captureVector = captureVector;
    }

    accept(visitor: HIRVisitor): any {
        return visitor.visitMakeClosureInstruction(this);
    }

    fullPrintString(): string {
        return `${this.toString()} := makeClosure ${this.hirFunction.toString()} captures ${this.captureVector.toString()}`
    }

    evaluateInActivationContext(context: HIRFunctionActivationContext) : void {
        let captureVector = this.captureVector.map((value: HIRValue) : HIRValue => value.getValueInEvaluationContext(context));
        let closure = new HIRFunctionClosure(this.hirFunction, captureVector, this.sourcePosition);
        context.setCurrentInstructionValue(closure);
    }
}

export class HIRPhiInstruction extends HIRInstruction  {
    constructor(type: HIRType, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(type, name, sourcePosition)
    }

    accept(visitor: HIRVisitor): any {
        return visitor.visitPhiInstruction(this);
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

    accept(visitor: HIRVisitor) {
        return visitor.visitPhiSourceInstruction(this);
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

    accept(visitor: HIRVisitor) {
        return visitor.visitReturnInstruction(this);
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

export class HIRAssertConditionInstruction extends HIRInstruction  {
    condition: HIRValue;
    message: HIRValue;

    constructor(condition: HIRValue, message: HIRValue, type: HIRType, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(type, name, sourcePosition);
        this.condition = condition;
        this.message = message;
    }

    accept(visitor: HIRVisitor): any {
        return visitor.visitAssertConditionInstruction(this);
    }

    fullPrintString(): string {
        return 'assert ' + this.condition.toString() + ' ' + this.message.toString()
    }

    evaluateInActivationContext(context: HIRFunctionActivationContext) : void {
        let condition = this.condition.getValueInEvaluationContext(context);
        if(!condition.evaluateAsBoolean())
        {
            let message = this.message.getValueInEvaluationContext(context) as HIRConstantLiteralStringValue;
            throw new Error(this.sourcePosition.formatMessage(message.value))
        }
    }
}

export class HIRRuntimeErrorInstruction extends HIRInstruction  {
    errorMessage: HIRValue;

    constructor(errorMessage: HIRValue, type: HIRType, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(type, name, sourcePosition);
        this.errorMessage = errorMessage
    }

    accept(visitor: HIRVisitor) : any {
        return visitor.visitRuntimeErrorInstruction(this);
    }

    isTerminatorInstruction(): boolean {
        return true;
    }

    fullPrintString(): string {
        return 'runtimeError ' + this.errorMessage.toString()
    }

    evaluateInActivationContext(context: HIRFunctionActivationContext) : void {
        let errorMessage = this.errorMessage.getValueInEvaluationContext(context) as HIRConstantLiteralStringValue;
        throw new Error(this.sourcePosition.formatMessage(errorMessage.value))
    }
}

export class HIRUnreachableInstruction extends HIRInstruction  {
    constructor(type: HIRType, name: string | null, sourcePosition: AbstractSourcePosition) {
        super(type, name, sourcePosition)
    }

    accept(visitor: HIRVisitor): any {
        return visitor.visitUnreachableInstruction(this);
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
    entryBasicBlock: HIRBasicBlock | null = null;
    environment: HIRLexicalEnvironment;

    constructor(hirFunction: HIRFunction, context: HIRContext, basicBlock: HIRBasicBlock, environment: HIRLexicalEnvironment) {
        this.hirFunction = hirFunction;
        this.context = context;
        this.basicBlock = basicBlock;
        this.environment = environment;
    }

    addInstruction(instruction: HIRInstruction): void {
        this.basicBlock.addInstruction(instruction);
    }

    copyWithBasicBlock(basicBlock: HIRBasicBlock): HIRBuilder {
        let builder = new HIRBuilder(this.hirFunction, this.context, basicBlock, this.environment);
        builder.allocaBuilder = this.allocaBuilder;
        return builder;
    }

    isLastTerminator(): boolean {
        let lastInstruction = this.basicBlock.lastInstruction;
        if(!lastInstruction)
            return false;
        return lastInstruction.isTerminatorInstruction();
    }

    finishBuilding(sourcePosition: AbstractSourcePosition): void {
        if (this.allocaBuilder && this.entryBasicBlock) {
            this.allocaBuilder.branch(this.entryBasicBlock, sourcePosition)
        }
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

    call(functional: HIRValue, callArguments: HIRValue[], resultType: HIRType, sourcePosition: AbstractSourcePosition): HIRValue {
        let instruction = new HIRCallInstruction(functional, callArguments, resultType, null, sourcePosition);
        let simplified = instruction.simplifyWithBuilder(this);
        if(instruction === simplified)
            this.addInstruction(instruction);
        return simplified;
    }

    enumBoxValue(value: HIRValue, type: HIRType, sourcePosition: AbstractSourcePosition) : HIREnumBoxValueInstruction {
        let instruction = new HIREnumBoxValueInstruction(value, type, null, sourcePosition);
        this.addInstruction(instruction);
        return instruction;
    }

    enumUnboxValue(value: HIRValue, type: HIRType, sourcePosition: AbstractSourcePosition) : HIREnumBoxValueInstruction {
        let instruction = new HIREnumUnboxValueInstruction(value, type, null, sourcePosition);
        this.addInstruction(instruction);
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

    makeAssociation(key: HIRValue, value: HIRValue, type: HIRType, sourcePosition: AbstractSourcePosition): HIRMakeAssociationInstruction {
        let instruction = new HIRMakeAssociationInstruction(key, value, type, null, sourcePosition);
        this.addInstruction(instruction);
        return instruction;
    }

    makeTuple(elements: HIRValue[], type: HIRType, sourcePosition: AbstractSourcePosition): HIRMakeTupleInstruction {
        let instruction = new HIRMakeTupleInstruction(elements, type, null, sourcePosition);
        this.addInstruction(instruction);
        return instruction;
    }

    makeClosure(hirFunction: HIRFunction, captureVector: HIRValue[], sourcePosition: AbstractSourcePosition): HIRMakeClosureInstruction {
        let instruction = new HIRMakeClosureInstruction(hirFunction, captureVector, hirFunction.simplifiedType, null, sourcePosition);
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

    assertCondition(condition: HIRValue, message: HIRValue, sourcePosition: AbstractSourcePosition): HIRAssertConditionInstruction {
        let instruction = new HIRAssertConditionInstruction(condition, message, this.context.coreTypes.controlFlowEscapeType, null, sourcePosition);
        this.addInstruction(instruction);
        return instruction;
    }

    runtimeError(errorMessage: HIRValue, sourcePosition: AbstractSourcePosition): HIRRuntimeErrorInstruction {
        let instruction = new HIRRuntimeErrorInstruction(errorMessage, this.context.coreTypes.controlFlowEscapeType, null, sourcePosition);
        this.addInstruction(instruction);
        return instruction;
    }

    unreachable(sourcePosition: AbstractSourcePosition): HIRUnreachableInstruction {
        let instruction = new HIRUnreachableInstruction(this.context.coreTypes.voidType, null, sourcePosition);
        this.addInstruction(instruction);
        return instruction;
    }
}

export abstract class HIREnvironment {
    abstract lookSymbolRecursively(symbol: string): HIRValue | null;
    abstract lookReturnTypeRecursively(): HIRType | null;
    abstract lookupProgramEntityOwner(): HIRValue | null
}

export class HIREmptyEnvironment extends HIREnvironment {
    lookSymbolRecursively(symbol: string): HIRValue | null {
        return null;
    }

    lookReturnTypeRecursively(): HIRType | null {
        return null;
    }

    lookupProgramEntityOwner(): HIRValue | null {
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

    lookReturnTypeRecursively(): HIRType | null {
        return this.parent.lookReturnTypeRecursively();
    }

    lookupProgramEntityOwner(): HIRValue | null {
        return this.packageValue;
    }
}

export class HIROwnerEnvironment extends HIREnvironment {
    parent: HIREnvironment;
    owner: HIRValue;

    constructor(parent: HIREnvironment, owner: HIRValue) {
        super();
        this.parent = parent;
        this.owner = owner;
    }

    lookSymbolRecursively(symbol: string): HIRValue | null {
        return this.parent.lookSymbolRecursively(symbol);
    }

    lookReturnTypeRecursively(): HIRType | null {
        return this.parent.lookReturnTypeRecursively()
    }

    lookupProgramEntityOwner(): HIRValue | null {
        return this.owner;
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

    lookReturnTypeRecursively(): HIRType | null {
        return this.parent.lookReturnTypeRecursively();
    }
    
    lookupProgramEntityOwner(): HIRValue | null {
        return this.parent.lookupProgramEntityOwner();
    }
}

export class HIRDependentFunctionTypeAnalysisEnvironment extends HIRLexicalEnvironment {

}

export class HIRFunctionAnalysisEnvironment extends HIRLexicalEnvironment {
    returnType: HIRType;
    receiverValue: HIRValue | null;
    context: HIRContext;
    captureTable: Record<string, HIRCapture> = {}
    captureList: HIRCapture[] = [];

    constructor(parent: HIREnvironment, returnType: HIRType, receiverValue: HIRValue | null, context: HIRContext) {
        super(parent);
        this.returnType = returnType;
        this.receiverValue = receiverValue;
        this.context = context;
    }

    lookReturnTypeRecursively(): HIRType | null {
        return this.returnType;
    }

    lookSymbolRecursively(symbol: string): HIRValue | null {
        if (symbol in this.symbolTable) {
            let binding = this.symbolTable[symbol];
            return binding as HIRValue;
        }

        // Captures
        if(symbol in this.captureTable) {
            return this.captureTable[symbol] as HIRValue;
        }

        let parentBinding = this.parent.lookSymbolRecursively(symbol);
        if(parentBinding) {
            if(parentBinding.isFunctionLocalValue()) {
                let capture = new HIRCapture(parentBinding, parentBinding.getType(), symbol, parentBinding.sourcePosition);
                this.captureTable[symbol] = capture;
                this.captureList.push(capture);
                return capture;
            }
        }

        return parentBinding;
    }
}

export class HIRMetaBuilderFactory extends HIRValue {
    clazz: any;
    coreTypes: HIRCoreTypes;

    constructor(clazz: any, coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(sourcePosition);
        this.clazz = clazz;
        this.coreTypes = coreTypes;
    }

    accept(visitor: HIRVisitor): any {
        return visitor.visitMetaBuilderFactory(this);
    }

    getType(): HIRType {
        return this.coreTypes.metaBuilderFactoryType;
    }
    
    analyzeAndEvaluateIdentifierReferenceNode(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeIdentifierReferenceNode) : HIRValue {
        return new this.clazz(this.coreTypes, node.sourcePosition)
    }

    analyzeAndBuildIdentifierReferenceNode(evaluator: AnalysisAndBuildPass, node: parseTree.ParseTreeIdentifierReferenceNode): HIRValue {
        return new this.clazz(this.coreTypes, node.sourcePosition)
    }
}

export class HIRMetaBuilder extends HIRValue {
    coreTypes: HIRCoreTypes;

    constructor(coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(sourcePosition);
        this.coreTypes = coreTypes;
    }

    accept(visitor: HIRVisitor): any {
        return visitor.visitMetaBuilder(this);
    }

    getType(): HIRType {
        return this.coreTypes.metaBuilderType;
    }

    supportsSelector(selector: string): boolean {
        return false;
    }
    
    expandAndEvaluateMessage(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeMessageSendNode, selector: string, receiver: HIRValue) : HIRValue {
        return this;
    }

    expandAndBuildMessage(builder: AnalysisAndBuildPass, node: parseTree.ParseTreeMessageSendNode, selector: string, receiver: HIRValue) : HIRValue {
        return this;
    }

    analyzeAndEvaluateMessageSendNode(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue): HIRValue {
        let selectorValue = evaluator.visitSymbolNode(node.selector);
        if(this.supportsSelector(selectorValue)) {
            return this.expandAndEvaluateMessage(evaluator, node, selectorValue, receiver);
        }
        return super.analyzeAndEvaluateMessageSendNode(evaluator, node, receiver);
    }

    analyzeAndBuildMessageSendNode(builder: AnalysisAndBuildPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue): HIRValue {
        let selectorValue = builder.evaluateSymbolNode(node.selector)
        if(this.supportsSelector(selectorValue)) {
            return this.expandAndBuildMessage(builder, node, selectorValue, receiver);
        }

        return super.analyzeAndBuildMessageSendNode(builder, node, receiver)
    }
}

export class HIRNamedMetaBuilder extends HIRMetaBuilder {
    nameExpression: parseTree.ParseTreeNode | null = null;

    analyzeAndEvaluateMessageSendNode(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue): HIRValue {
        if (!this.nameExpression && node.sendArguments.length == 0){
            this.nameExpression = node.selector;
            return this;
        }
        return super.analyzeAndEvaluateMessageSendNode(evaluator, node, receiver)
    }

    analyzeAndBuildMessageSendNode(builder: AnalysisAndBuildPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue): HIRValue {
        if (!this.nameExpression && node.sendArguments.length == 0){
            this.nameExpression = node.selector;
            return this;
        }

        return super.analyzeAndBuildMessageSendNode(builder, node, receiver)
    }
}

export class HIRLetMetaBuilder extends HIRNamedMetaBuilder {
    isMutable: boolean = false;
    typeExpression: parseTree.ParseTreeNode | null = null;

    supportsSelector(selector: string): boolean {
        return selector == 'mutable' || selector =='type:';
    }

    expandAndEvaluateMessage(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeMessageSendNode, selector: string, receiver: HIRValue): HIRValue {
        if(selector == 'mutable') {
            this.isMutable = true;
        } else if (selector == 'type:') {
            this.typeExpression = node.sendArguments[0] as parseTree.ParseTreeNode;
        }
        return this;
    }

    expandAndBuildMessage(builder: AnalysisAndBuildPass, node: parseTree.ParseTreeMessageSendNode, selector: string, receiver: HIRValue): HIRValue {
        if(selector == 'mutable') {
            this.isMutable = true;
        } else if (selector == 'type:') {
            this.typeExpression = node.sendArguments[0] as parseTree.ParseTreeNode;
        }
        return this;
    }

    analyzeAndEvaluateAssignment(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeAssignmentNode): HIRValue {
        let variableDefinition = new parseTree.ParseTreeVariableDefinitionNode(node.sourcePosition, this.nameExpression, this.typeExpression, node.value, this.isMutable);
        return evaluator.visitNode(variableDefinition)
    }

    analyzeAndBuildAssignment(analyzer: AnalysisAndBuildPass, node: parseTree.ParseTreeAssignmentNode): HIRValue {
        let variableDefinition = new parseTree.ParseTreeVariableDefinitionNode(node.sourcePosition, this.nameExpression, this.typeExpression, node.value, this.isMutable);
        return analyzer.visitNode(variableDefinition);
    }
}

export class HIRMethodMetaBuilder extends HIRMetaBuilder {
    selectorExpression: parseTree.ParseTreeNode | null = null;
    argumentDefinitions: parseTree.ParseTreeArgumentDefinitionNode[] = [];
    resultTypeExpression: parseTree.ParseTreeNode | null = null;
    isPublic: boolean = false;

    supportsSelector(selector: string): boolean {
        return selector === '=>';
    }

    expandAndEvaluateMessage(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeMessageSendNode, selector: string, receiver: HIRValue): HIRValue {
        if(selector === '=>')
            this.resultTypeExpression = node.sendArguments[0] as parseTree.ParseTreeNode;
        return this;
    }

    analyzeAndEvaluateMessageSendNode(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeMessageSendNode, receiver: HIRValue): HIRValue {
        if(!this.selectorExpression) {
            this.selectorExpression = node.selector;
            this.argumentDefinitions = node.sendArguments.map((argumentNode: parseTree.ParseTreeNode): parseTree.ParseTreeArgumentDefinitionNode => argumentNode.parseAsArgumentDefinition());
            return this;
        }

        return super.analyzeAndEvaluateMessageSendNode(evaluator, node, receiver);
    }

    makeFunctionType(): parseTree.ParseTreeFunctionTypeNode {
        return new parseTree.ParseTreeFunctionTypeNode(this.sourcePosition, this.argumentDefinitions, this.resultTypeExpression);
    }

    analyzeAndEvaluateAssignment(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeAssignmentNode): HIRValue {
        let functionNode = new parseTree.ParseTreeFunctionNode(node.sourcePosition, this.selectorExpression, this.makeFunctionType(), node.value, this.isPublic, true);
        return evaluator.visitNode(functionNode);
    }
}

export class HIRClassMetaBuilder extends HIRNamedMetaBuilder {
    superclassExpression: parseTree.ParseTreeNode | null = null;
    isPublic: boolean = false;

    supportsSelector(selector: string): boolean {
        return (selector === 'superclass:') || (selector === 'definition:') || (selector === 'superclass:definition:')
    }

    expandAndEvaluateMessage(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeMessageSendNode, selector: string, receiver: HIRValue): HIRValue {
        if(selector === 'superclass:') {
            this.superclassExpression = node.sendArguments[0] as parseTree.ParseTreeNode;
            return this;
        } else if(selector === 'definition:') {
            let definitionBody = node.sendArguments[0] as parseTree.ParseTreeNode;
            let classNode = new parseTree.ParseTreeClassDefinitionNode(node.sourcePosition, this.nameExpression, this.superclassExpression, definitionBody, this.isPublic);
            return evaluator.visitNode(classNode);
        } else if(selector === 'superclass:definition:') {
            this.superclassExpression = node.sendArguments[0] as parseTree.ParseTreeNode;
            let definitionBody = node.sendArguments[1] as parseTree.ParseTreeNode;
            let classNode = new parseTree.ParseTreeClassDefinitionNode(node.sourcePosition, this.nameExpression, this.superclassExpression, definitionBody, this.isPublic);
            return evaluator.visitNode(classNode);
        }
        return super.expandAndEvaluateMessage(evaluator, node, selector, receiver);
    }
}

export class HIREnumMetaBuilder extends HIRNamedMetaBuilder {
    isPublic: boolean = false;

    supportsSelector(selector: string): boolean {
        return selector === 'baseType:values:'
    }

    expandAndEvaluateMessage(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeMessageSendNode, selector: string, receiver: HIRValue): HIRValue {
        if(selector === 'baseType:values:') {
            let baseType = node.sendArguments[0];
            let values = node.sendArguments[1];
            if(!baseType || !values)
                throw new Error('Expected parse tree nodes');
            let enumNode = new parseTree.ParseTreeEnumDefinitionNode(node.sourcePosition, this.nameExpression, baseType, values, this.isPublic);
            return evaluator.visitNode(enumNode);
        }

        return super.expandAndEvaluateMessage(evaluator, node, selector, receiver);
    }
}

export class HIRFieldMetaBuilder extends HIRNamedMetaBuilder {
    typeExpression: parseTree.ParseTreeNode | null = null;
    isPublic: boolean = false;

    supportsSelector(selector: string): boolean {
        return (selector === '=>') || (selector === 'type:')
    }

    expandAndEvaluateMessage(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeMessageSendNode, selector: string, receiver: HIRValue): HIRValue {
        if((selector === '=>') || (selector === 'type:')) {
            this.typeExpression = node.sendArguments[0] as parseTree.ParseTreeNode as parseTree.ParseTreeNode;
            let fieldExpression = new parseTree.ParseTreeFieldDefinitionNode(node.sourcePosition, this.nameExpression, this.typeExpression, this.isPublic);
            return evaluator.visitNode(fieldExpression);
        }
            
        return super.expandAndEvaluateMessage(evaluator, node, selector, receiver);
    }
}

export class HIRFunctionMetaBuilder extends HIRNamedMetaBuilder {
    argumentDefinitions: parseTree.ParseTreeArgumentDefinitionNode[] = [];
    resultTypeExpression: parseTree.ParseTreeNode | null = null;
    isPublic: boolean = false;

    supportsSelector(selector: string): boolean {
        return selector === '=>'
    }

    expandAndEvaluateMessage(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeMessageSendNode, selector: string, receiver: HIRValue): HIRValue {
        if(selector === '=>')
            this.resultTypeExpression = node.sendArguments[0] as parseTree.ParseTreeNode;
        return this;
    }

    analyzeAndEvaluateApplicationNode(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeApplicationNode, functional: HIRValue): HIRValue {
        this.argumentDefinitions = node.applicationArguments.map((argumentNode: parseTree.ParseTreeNode): parseTree.ParseTreeArgumentDefinitionNode => argumentNode.parseAsArgumentDefinition());
        return this;
    }

    makeFunctionType(): parseTree.ParseTreeFunctionTypeNode {
        return new parseTree.ParseTreeFunctionTypeNode(this.sourcePosition, this.argumentDefinitions, this.resultTypeExpression);
    }

    analyzeAndEvaluateAssignment(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeAssignmentNode): HIRValue {
        let functionNode = new parseTree.ParseTreeFunctionNode(node.sourcePosition, this.nameExpression, this.makeFunctionType(), node.value, this.isPublic, false);
        return evaluator.visitNode(functionNode);
    }
}

export class HIRPublicMetaBuilder extends HIRMetaBuilder {
    supportsSelector(selector: string): boolean {
        return (selector === 'class') || (selector === 'field') || (selector === 'function') || (selector === 'enum') || (selector === 'method')
    }

    expandAndEvaluateMessage(evaluator: AnalysisAndEvaluationPass, node: parseTree.ParseTreeMessageSendNode, selector: string, receiver: HIRValue): HIRValue {
        if(selector === 'class') {
            let classMetabuilder = new HIRClassMetaBuilder(this.coreTypes, this.sourcePosition);
            classMetabuilder.isPublic = true;
            return classMetabuilder;
        } else if(selector === 'field') {
            let fieldMetabuilder = new HIRFieldMetaBuilder(this.coreTypes, this.sourcePosition);
            fieldMetabuilder.isPublic = true;
            return fieldMetabuilder;
        } else if(selector === 'function') {
            let functionMetabuilder = new HIRFunctionMetaBuilder(this.coreTypes, this.sourcePosition);
            functionMetabuilder.isPublic = true;
            return functionMetabuilder;
        } else if(selector === 'enum') {
            let enumMetabuilder = new HIREnumMetaBuilder(this.coreTypes, this.sourcePosition);
            enumMetabuilder.isPublic = true;
            return enumMetabuilder;
        } else if(selector === 'method') {
            let methodMetabuilder = new HIRMethodMetaBuilder(this.coreTypes, this.sourcePosition);
            methodMetabuilder.isPublic = true;
            return methodMetabuilder;
        }
        return this;
    }
}

export class HIRCoreTypes {
    pointerSize = 8;
    pointerAlignment = 8;
    coreTypeList: HIRType[] = [];
    coreValueList: [string, HIRValue][] = [];
    corePrimitiveMacros: HIRPrimitiveMacro[] = [];
    universeLevels: Record<number, HIRUniverseType> = {};

    protoObjectClass: HIRClass | null = null;
    objectClass: HIRClass | null = null;
    behaviorClass: HIRClass | null = null;
    classClass: HIRClass | null = null;
    metaclassClass: HIRClass | null = null;

    magnitudeClass: HIRClass;
    numberClass: HIRClass;

    characterType: HIRClass;
    integerType: HIRClass;
    floatType: HIRClass;
    booleanType: HIRClass;
    falseClass: HIRClass;
    trueClass: HIRClass;

    collectionClass: HIRClass;
    sequenceableCollectionClass: HIRClass;
    arrayedCollectionClass: HIRClass;

    stringType: HIRClass;
    symbolType: HIRClass;
    parseTreeType: HIRClass;

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

    sizeType: HIRPrimitiveType;
    intPointerType: HIRPrimitiveType;
    uintPointerType: HIRPrimitiveType;

    dynamicType: HIRDynamicType     = new HIRDynamicType('Dynamic', this, getOrMakeEmptySourcePosition());
    undefinedType: HIRUndefinedType = new HIRUndefinedType('Undefined', this, getOrMakeEmptySourcePosition());
    voidType: HIRVoidType           = new HIRVoidType('Void', this, getOrMakeEmptySourcePosition());
    controlFlowEscapeType: HIRControlFlowEscapeType  = new HIRControlFlowEscapeType('ControlFlowEscape', this, getOrMakeEmptySourcePosition());

    dynamicAssociationType: HIRAssociationType = new HIRAssociationType(this.dynamicType, this.dynamicType, this, getOrMakeEmptySourcePosition());
    dynamicDictionaryType: HIRDictionaryType = new HIRDictionaryType(this.dynamicAssociationType, this, getOrMakeEmptySourcePosition());

    packageType: HIRNominalType = new HIRNominalType('Package', this, getOrMakeEmptySourcePosition());
    basicBlockType: HIRNominalType = new HIRNominalType('BasicBlock', this, getOrMakeEmptySourcePosition());
    fieldType: HIRNominalType = new HIRNominalType('Field', this, getOrMakeEmptySourcePosition());
    macroContextType: HIRNominalType = new HIRNominalType('MacroContext', this, getOrMakeEmptySourcePosition());
    primitiveMacroType: HIRNominalType = new HIRNominalType('PrimitiveMacro', this, getOrMakeEmptySourcePosition());
    metaBuilderFactoryType: HIRNominalType = new HIRNominalType('MetaBuilderFactory', this, getOrMakeEmptySourcePosition());
    metaBuilderType: HIRNominalType = new HIRNominalType('MetaBuilder', this, getOrMakeEmptySourcePosition());

    voidValue: HIRConstantLiteralVoidValue = new HIRConstantLiteralVoidValue(this.voidType, getOrMakeEmptySourcePosition());
    falseValue: HIRConstantLiteralBooleanValue = new HIRConstantLiteralBooleanValue(false, this.boolean8Type, getOrMakeEmptySourcePosition());
    trueValue: HIRConstantLiteralBooleanValue = new HIRConstantLiteralBooleanValue(true, this.boolean8Type, getOrMakeEmptySourcePosition());
    nilValue: HIRConstantLiteralVoidValue = new HIRConstantLiteralNilValue(this.undefinedType, getOrMakeEmptySourcePosition());
    
    constructor() {
        this.createCoreClassDefinitions();
        this.magnitudeClass = this.makeCoreClassDefinition('Magnitude', this.objectClass, [], []);
        this.numberClass = this.makeCoreClassDefinition('Number', this.magnitudeClass, [], []);

        this.collectionClass = this.makeCoreClassDefinition('Collection', this.numberClass, [], []);
        this.sequenceableCollectionClass = this.makeCoreClassDefinition('SequenceableCollection', this.collectionClass, [], []);
        this.arrayedCollectionClass = this.makeCoreClassDefinition('ArrayedCollection', this.sequenceableCollectionClass, [], []);

        this.characterType = this.makeCoreClassDefinition('Character', this.magnitudeClass, [], []);
        this.integerType = this.makeCoreClassDefinition('Integer', this.numberClass, [], []);
        this.floatType = this.makeCoreClassDefinition('Float', this.numberClass, [], []);
        this.booleanType = this.makeCoreClassDefinition('Boolean', this.objectClass, [], []);
        this.falseClass = this.makeCoreClassDefinition('False', this.booleanType, [], []);
        this.trueClass = this.makeCoreClassDefinition('True', this.booleanType, [], []);

        this.stringType = this.makeCoreClassDefinition('String', this.arrayedCollectionClass, [], []);
        this.symbolType = this.makeCoreClassDefinition('Symbol', this.arrayedCollectionClass, [], []);
        this.parseTreeType = this.makeCoreClassDefinition('ParseTree', this.objectClass, [], []);

        this.characterType.defaultValue = new HIRConstantLiteralCharacterValue(0, this.characterType, getOrMakeEmptySourcePosition())
        this.integerType.defaultValue = new HIRConstantLiteralIntegerValue(0, this.integerType, getOrMakeEmptySourcePosition())
        this.floatType.defaultValue = new HIRConstantLiteralFloatValue(0.0, this.floatType, getOrMakeEmptySourcePosition())

        this.char8Type.defaultValue  = new HIRConstantLiteralCharacterValue(0, this.char8Type, getOrMakeEmptySourcePosition())
        this.char16Type.defaultValue = new HIRConstantLiteralCharacterValue(0, this.char16Type, getOrMakeEmptySourcePosition())
        this.char32Type.defaultValue = new HIRConstantLiteralCharacterValue(0, this.char32Type, getOrMakeEmptySourcePosition())

        this.int8Type.defaultValue  = new HIRConstantLiteralIntegerValue(0, this.int8Type, getOrMakeEmptySourcePosition())
        this.int16Type.defaultValue = new HIRConstantLiteralIntegerValue(0, this.int16Type, getOrMakeEmptySourcePosition())
        this.int32Type.defaultValue = new HIRConstantLiteralIntegerValue(0, this.int32Type, getOrMakeEmptySourcePosition())
        this.int64Type.defaultValue = new HIRConstantLiteralIntegerValue(0, this.int64Type, getOrMakeEmptySourcePosition())

        this.uint8Type.defaultValue  = new HIRConstantLiteralIntegerValue(0, this.uint8Type, getOrMakeEmptySourcePosition())
        this.uint16Type.defaultValue = new HIRConstantLiteralIntegerValue(0, this.uint16Type, getOrMakeEmptySourcePosition())
        this.uint32Type.defaultValue = new HIRConstantLiteralIntegerValue(0, this.uint32Type, getOrMakeEmptySourcePosition())
        this.uint64Type.defaultValue = new HIRConstantLiteralIntegerValue(0, this.uint64Type, getOrMakeEmptySourcePosition())

        this.float32Type.defaultValue = new HIRConstantLiteralFloatValue(0.0, this.float32Type, getOrMakeEmptySourcePosition())
        this.float64Type.defaultValue = new HIRConstantLiteralFloatValue(0.0, this.float64Type, getOrMakeEmptySourcePosition())

        this.coreTypeList.push(this.protoObjectClass as HIRType);
        this.coreTypeList.push(this.objectClass as HIRType);
        this.coreTypeList.push(this.behaviorClass as HIRType);
        this.coreTypeList.push(this.classClass as HIRType);
        this.coreTypeList.push(this.metaclassClass as HIRType);

        this.coreTypeList.push(this.magnitudeClass);
        this.coreTypeList.push(this.numberClass);

        this.coreTypeList.push(this.collectionClass);
        this.coreTypeList.push(this.sequenceableCollectionClass);
        this.coreTypeList.push(this.arrayedCollectionClass);

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
        this.coreTypeList.push(this.metaBuilderFactoryType);
        this.coreTypeList.push(this.metaBuilderType);

        this.coreValueList.push(['void',  this.voidValue]);
        this.coreValueList.push(['false', this.falseValue]);
        this.coreValueList.push(['true',  this.trueValue]);
        this.coreValueList.push(['nil',   this.nilValue]);

        if(this.pointerSize == 4) {
            this.sizeType        = this.uint32Type;
            this.intPointerType  = this.int32Type;
            this.uintPointerType = this.uint32Type;
        } else {
            this.sizeType        = this.uint64Type;
            this.intPointerType  = this.int64Type;
            this.uintPointerType = this.uint64Type;
        }

        this.coreValueList.push(['Size',  this.sizeType]);
        this.coreValueList.push(['IntPointer', this.intPointerType]);
        this.coreValueList.push(['UIntPointer', this.uintPointerType]);

        this.createCorePrimitiveMacros();
        this.createCorePrimitiveMetaBuilders();
        this.createCorePrimitiveFunctions();
    }
    createCoreClassDefinitions() {
        this.protoObjectClass = this.makeCoreClassDefinition('ProtoObject', null, [], []);
        this.objectClass = this.makeCoreClassDefinition('Object', this.protoObjectClass, [], []);
        this.behaviorClass = this.makeCoreClassDefinition('Behavior', this.objectClass, [], []);
        this.classClass = this.makeCoreClassDefinition('Class', this.behaviorClass, [], []);
        this.metaclassClass = this.makeCoreClassDefinition('Metaclass', this.behaviorClass, [], []);

        // Short circuit.
        this.protoObjectClass.metaClass.superclass = this.classClass;

        this.fixupMetaclassTypes(this.protoObjectClass);
        this.fixupMetaclassTypes(this.objectClass);
        this.fixupMetaclassTypes(this.behaviorClass);
        this.fixupMetaclassTypes(this.classClass);
        this.fixupMetaclassTypes(this.metaclassClass);
    }

    fixupMetaclassTypes(typeToFixup: HIRClass) {
        let metaClass = typeToFixup.metaClass;
        metaClass.metaclassType = this.metaclassClass;
    }

    makeCoreClassDefinition(name: string, superclass: HIRBehavior | null, fields: HIRField[], metaFields: HIRField[]): HIRClass {
        let metaClassSuper: HIRBehavior | null = null;
        if(superclass)
            metaClassSuper = superclass.getType() as HIRBehavior;
        let metaclass = new HIRMetaclass(this.metaclassClass, metaClassSuper, this, getOrMakeEmptySourcePosition());

        let clazz = new HIRClass(name, metaclass, superclass, this, getOrMakeEmptySourcePosition());
        metaclass.thisClass = clazz;
        return clazz;
    }

    getSizeType() {
        if (this.pointerSize === 4) {
            return this.uint32Type;
        } else {
            return this.uint64Type;
        }
    }

    getUIntPointerType() {
        if (this.pointerSize === 4) {
            return this.uint32Type;
        } else {
            return this.uint64Type;
        }
    }

    getIntPointerType() {
        if (this.pointerSize === 4) {
            return this.int32Type;
        } else {
            return this.int64Type;
        }
    }

    createCorePrimitiveMacros() {
        function error(macroContext: HIRMacroContext, errorMessage: parseTree.ParseTreeNode): parseTree.ParseTreeNode {
            return new parseTree.ParseTreeRuntimeErrorNode(macroContext.sourcePosition, errorMessage);
        }
        function assertExpression(macroContext: HIRMacroContext, condition: parseTree.ParseTreeNode): parseTree.ParseTreeNode {
            return new parseTree.ParseTreeAssertNode(macroContext.sourcePosition, condition);
        }

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
            new HIRPrimitiveMacro('error:', this.primitiveMacroType, error, getOrMakeEmptySourcePosition()),
            new HIRPrimitiveMacro('assert:', this.primitiveMacroType, assertExpression, getOrMakeEmptySourcePosition()),

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

    createCorePrimitiveMetaBuilders() {
        this.coreValueList.push(['class', new HIRMetaBuilderFactory(HIRClassMetaBuilder, this, getOrMakeEmptySourcePosition())]);
        this.coreValueList.push(['enum', new HIRMetaBuilderFactory(HIREnumMetaBuilder, this, getOrMakeEmptySourcePosition())]);
        this.coreValueList.push(['field', new HIRMetaBuilderFactory(HIRFieldMetaBuilder, this, getOrMakeEmptySourcePosition())]);
        this.coreValueList.push(['function', new HIRMetaBuilderFactory(HIRFunctionMetaBuilder, this, getOrMakeEmptySourcePosition())]);
        this.coreValueList.push(['let', new HIRMetaBuilderFactory(HIRLetMetaBuilder, this, getOrMakeEmptySourcePosition())]);
        this.coreValueList.push(['method', new HIRMetaBuilderFactory(HIRMethodMetaBuilder, this, getOrMakeEmptySourcePosition())]);
        this.coreValueList.push(['public', new HIRMetaBuilderFactory(HIRPublicMetaBuilder, this, getOrMakeEmptySourcePosition())]);
    }
    
    createCorePrimitiveFunctions() {
        this.createGlobalPrimitiveFunctions();
        this.createBooleanPrimitiveFunctions();
        this.createStringPrimitiveFunctions();

        this.createIntegerPrimitiveFunctions(this.integerType, true);
        this.createIntegerPrimitiveFunctions(this.int32Type,  true);
        this.createIntegerPrimitiveFunctions(this.uint32Type, false);
        this.createIntegerPrimitiveFunctions(this.int64Type,  true);
        this.createIntegerPrimitiveFunctions(this.uint64Type, false);

        this.createFloatPrimitiveFunctions(this.floatType);
        this.createFloatPrimitiveFunctions(this.float32Type);
        this.createFloatPrimitiveFunctions(this.float64Type);

        this.createNumericalPrimitiveConversionMethods(this.characterType);
        this.createNumericalPrimitiveConversionMethods(this.floatType);
        this.createNumericalPrimitiveConversionMethods(this.integerType);
    }

    createGlobalPrimitiveFunctions() {
        let voidValue = this.voidValue;
        function printPrimitive(value: HIRValue) {
            process.stdout.write(value.toString());
            return voidValue;
        }
        function printLinePrimitive(value: HIRValue) {
            process.stdout.write(value.toString());
            process.stdout.write('\n');
            return voidValue;
        }
        function writePrimitive(value: HIRValue) {
            process.stdout.write(value.evaluateAsString());
            return voidValue;
        }
        function writeLinePrimitive(value: HIRValue) {
            process.stdout.write(value.evaluateAsString());
            process.stdout.write('\n');
            return voidValue;
        }

        this.coreValueList.push(['print', new HIRPrimitiveFunction('print', 'IO::print', this.getOrCreateSimpleFunctionType([this.dynamicType], this.voidType), printPrimitive, false, false, getOrMakeEmptySourcePosition())]);
        this.coreValueList.push(['printLine', new HIRPrimitiveFunction('printLine', 'IO::printLine', this.getOrCreateSimpleFunctionType([this.dynamicType], this.voidType), printLinePrimitive, false, false, getOrMakeEmptySourcePosition())]);
        this.coreValueList.push(['write', new HIRPrimitiveFunction('write', 'IO::write', this.getOrCreateSimpleFunctionType([this.stringType], this.voidType), writePrimitive, false, false, getOrMakeEmptySourcePosition())]);
        this.coreValueList.push(['writeLine', new HIRPrimitiveFunction('writeLine', 'IO::writeLine', this.getOrCreateSimpleFunctionType([this.stringType], this.voidType), writeLinePrimitive, false, false, getOrMakeEmptySourcePosition())]);
    }

    createBooleanPrimitiveFunctions() {
        let falseValue = this.falseValue;
        let trueValue = this.trueValue;

        function booleanNot(operand: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralBooleanValue(!operand.evaluateAsBoolean(), resultType, sourcePosition);
        }

        function booleanAnd(macroContext: HIRMacroContext, left: parseTree.ParseTreeNode, right: parseTree.ParseTreeNode): parseTree.ParseTreeNode {
            return new parseTree.ParseTreeIfSelectionNode(macroContext.sourcePosition, left, right, new parseTree.ParseTreeLiteralValueNode(macroContext.sourcePosition, falseValue))
        }
        function booleanOr(macroContext: HIRMacroContext, left: parseTree.ParseTreeNode, right: parseTree.ParseTreeNode): parseTree.ParseTreeNode {
            return new parseTree.ParseTreeIfSelectionNode(macroContext.sourcePosition, left, new parseTree.ParseTreeLiteralValueNode(macroContext.sourcePosition, trueValue), right)
        }


        let primitivePrefix = this.boolean8Type.toString() + "::";
        this.boolean8Type.addPrimitiveMethod(new HIRPrimitiveFunction('not', primitivePrefix + 'not', this.getOrCreateSimpleFunctionType([this.boolean8Type], this.boolean8Type), booleanNot, true, true, getOrMakeEmptySourcePosition()))
        this.boolean8Type.addPrimitiveMacro(new HIRPrimitiveMacro('&&', this.primitiveMacroType, booleanAnd, getOrMakeEmptySourcePosition()))
        this.boolean8Type.addPrimitiveMacro(new HIRPrimitiveMacro('||', this.primitiveMacroType, booleanOr, getOrMakeEmptySourcePosition()))
    }

    createStringPrimitiveFunctions() {
        let primitivePrefix = this.stringType.toString() + "::";

        function stringAt(string: HIRValue, index: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            let stringValue = string.evaluateAsString();
            let indexValue = index.evaluateAsInteger();
            if(indexValue >= stringValue.length)
                throw new Error('String #at: index is out of bounds');
            
            return new HIRConstantLiteralCharacterValue(stringValue.codePointAt(indexValue) as number, resultType, sourcePosition);
        }

        function stringSize(string: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralIntegerValue(string.evaluateAsString().length, resultType, sourcePosition);
        }

        function stringAsSymbol(string: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralSymbolValue(string.evaluateAsString(), resultType, sourcePosition);
        }

        this.stringType.addPrimitiveMethod(new HIRPrimitiveFunction('at:', primitivePrefix + 'at:', this.getOrCreateSimpleFunctionType([this.stringType, this.getSizeType()], this.char8Type), stringAt, true, true, getOrMakeEmptySourcePosition()));
        this.stringType.addPrimitiveMethod(new HIRPrimitiveFunction('size', primitivePrefix + 'size', this.getOrCreateSimpleFunctionType([this.stringType], this.getSizeType()), stringSize, true, true, getOrMakeEmptySourcePosition()));
        this.stringType.addPrimitiveMethod(new HIRPrimitiveFunction('asSymbol', primitivePrefix + 'asSymbol', this.getOrCreateSimpleFunctionType([this.stringType], this.symbolType), stringAsSymbol, true, true, getOrMakeEmptySourcePosition()));
    }

    createIntegerPrimitiveFunctions(integerType: HIRNominalType, isSigned: boolean) {
        function integerNegated(operand: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralIntegerValue(-operand.evaluateAsInteger(), resultType, sourcePosition)
        }
        function integerBitInvert(operand: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralIntegerValue(~operand.evaluateAsInteger(), resultType, sourcePosition)
        }

        function integerAdd(left: HIRValue, right: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralIntegerValue(left.evaluateAsInteger() + right.evaluateAsInteger(), resultType, sourcePosition)
        }
        function integerSub(left: HIRValue, right: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralIntegerValue(left.evaluateAsInteger() - right.evaluateAsInteger(), resultType, sourcePosition)
        }
        function integerMul(left: HIRValue, right: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralIntegerValue(left.evaluateAsInteger() * right.evaluateAsInteger(), resultType, sourcePosition)
        }
        function integerDiv(left: HIRValue, right: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralIntegerValue(~~(left.evaluateAsInteger() / right.evaluateAsInteger()), resultType, sourcePosition)
        }
        function integerMod(left: HIRValue, right: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralIntegerValue(left.evaluateAsInteger() % right.evaluateAsInteger(), resultType, sourcePosition)
        }

        function integerBitAnd(left: HIRValue, right: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralIntegerValue(left.evaluateAsInteger() & right.evaluateAsInteger(), resultType, sourcePosition)
        }
        function integerBitOr(left: HIRValue, right: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralIntegerValue(left.evaluateAsInteger() | right.evaluateAsInteger(), resultType, sourcePosition)
        }
        function integerBitXor(left: HIRValue, right: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralIntegerValue(left.evaluateAsInteger() ^ right.evaluateAsInteger(), resultType, sourcePosition)
        }
        function integerShifLeft(left: HIRValue, right: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralIntegerValue(left.evaluateAsInteger() << right.evaluateAsInteger(), resultType, sourcePosition)
        }
        function integerShifRight(left: HIRValue, right: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            if(isSigned)
                return new HIRConstantLiteralIntegerValue(left.evaluateAsInteger() >> right.evaluateAsInteger(), resultType, sourcePosition)
            else
                return new HIRConstantLiteralIntegerValue(left.evaluateAsInteger() >>> right.evaluateAsInteger(), resultType, sourcePosition)
        }

        function integerEquals(left: HIRValue, right: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralBooleanValue(left.evaluateAsInteger() === right.evaluateAsInteger(), resultType, sourcePosition)
        }
        function integerNotEquals(left: HIRValue, right: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralBooleanValue(left.evaluateAsInteger() !== right.evaluateAsInteger(), resultType, sourcePosition)
        }
        function integerLessThan(left: HIRValue, right: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralBooleanValue(left.evaluateAsInteger() < right.evaluateAsInteger(), resultType, sourcePosition)
        }
        function integerLessOrEquals(left: HIRValue, right: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralBooleanValue(left.evaluateAsInteger() <= right.evaluateAsInteger(), resultType, sourcePosition)
        }
        function integerGreaterThan(left: HIRValue, right: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralBooleanValue(left.evaluateAsInteger() > right.evaluateAsInteger(), resultType, sourcePosition)
        }
        function integerGreaterOrEquals(left: HIRValue, right: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralBooleanValue(left.evaluateAsInteger() >= right.evaluateAsInteger(), resultType, sourcePosition)
        }
        function asPrimitiveChar(value: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) 
        {
            return new HIRConstantLiteralCharacterValue(value.evaluateAsInteger(), resultType, sourcePosition);
        }

        function asPrimitiveInt(value: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralIntegerValue(value.evaluateAsInteger(), resultType, sourcePosition);
        }

        function asPrimitiveFloat(value: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralFloatValue(value.evaluateAsInteger(), resultType, sourcePosition);
        }

        let primitivePrefix = integerType.toString() + "::";
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('negated',   primitivePrefix + 'negated',   this.getOrCreateSimpleFunctionType([integerType], integerType), integerNegated, true, true, getOrMakeEmptySourcePosition()))
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('bitInvert', primitivePrefix + 'bitInvert', this.getOrCreateSimpleFunctionType([integerType], integerType), integerBitInvert, true, true, getOrMakeEmptySourcePosition()))

        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('+',  primitivePrefix + '+',  this.getOrCreateSimpleFunctionType([integerType, integerType], integerType), integerAdd, true, true, getOrMakeEmptySourcePosition()))
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('-',  primitivePrefix + '-',  this.getOrCreateSimpleFunctionType([integerType, integerType], integerType), integerSub, true, true, getOrMakeEmptySourcePosition()))
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('*',  primitivePrefix + '*',  this.getOrCreateSimpleFunctionType([integerType, integerType], integerType), integerMul, true, true, getOrMakeEmptySourcePosition()))
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('//', primitivePrefix + '//', this.getOrCreateSimpleFunctionType([integerType, integerType], integerType), integerDiv, true, true, getOrMakeEmptySourcePosition()))
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('%',  primitivePrefix + '%',  this.getOrCreateSimpleFunctionType([integerType, integerType], integerType), integerMod, true, true, getOrMakeEmptySourcePosition()))

        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('&',  primitivePrefix + '&',  this.getOrCreateSimpleFunctionType([integerType, integerType], integerType), integerBitAnd,    true, true, getOrMakeEmptySourcePosition()))
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('|',  primitivePrefix + '|',  this.getOrCreateSimpleFunctionType([integerType, integerType], integerType), integerBitOr,     true, true, getOrMakeEmptySourcePosition()))
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('^',  primitivePrefix + '^',  this.getOrCreateSimpleFunctionType([integerType, integerType], integerType), integerBitXor,    true, true, getOrMakeEmptySourcePosition()))
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('<<', primitivePrefix + '<<', this.getOrCreateSimpleFunctionType([integerType, integerType], integerType), integerShifLeft,  true, true, getOrMakeEmptySourcePosition()))
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('>>', primitivePrefix + '>>', this.getOrCreateSimpleFunctionType([integerType, integerType], integerType), integerShifRight, true, true, getOrMakeEmptySourcePosition()))

        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('=',  primitivePrefix + '=',  this.getOrCreateSimpleFunctionType([integerType, integerType], this.boolean8Type), integerEquals,          true, true, getOrMakeEmptySourcePosition()))
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('~=', primitivePrefix + '~=', this.getOrCreateSimpleFunctionType([integerType, integerType], this.boolean8Type), integerNotEquals,       true, true, getOrMakeEmptySourcePosition()))
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('<',  primitivePrefix + '<',  this.getOrCreateSimpleFunctionType([integerType, integerType], this.boolean8Type), integerLessThan,        true, true, getOrMakeEmptySourcePosition()))
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('<=', primitivePrefix + '<=', this.getOrCreateSimpleFunctionType([integerType, integerType], this.boolean8Type), integerLessOrEquals,    true, true, getOrMakeEmptySourcePosition()))
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('>',  primitivePrefix + '>',  this.getOrCreateSimpleFunctionType([integerType, integerType], this.boolean8Type), integerGreaterThan,     true, true, getOrMakeEmptySourcePosition()))
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('>=', primitivePrefix + '>=', this.getOrCreateSimpleFunctionType([integerType, integerType], this.boolean8Type), integerGreaterOrEquals, true, true, getOrMakeEmptySourcePosition()))

        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('asCharacter',  primitivePrefix + 'asCharacter', this.getOrCreateSimpleFunctionType([integerType, integerType], this.characterType),  asPrimitiveChar, true, true, getOrMakeEmptySourcePosition()))
        
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('asChar8',  primitivePrefix + 'asChar8',  this.getOrCreateSimpleFunctionType([integerType, integerType], this.char8Type),  asPrimitiveChar, true, true, getOrMakeEmptySourcePosition()))
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('asChar16', primitivePrefix + 'asChar16', this.getOrCreateSimpleFunctionType([integerType, integerType], this.char16Type), asPrimitiveChar, true, true, getOrMakeEmptySourcePosition()))
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('asChar32', primitivePrefix + 'asChar32', this.getOrCreateSimpleFunctionType([integerType, integerType], this.char32Type), asPrimitiveChar, true, true, getOrMakeEmptySourcePosition()))

        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('asInt8',  primitivePrefix + 'asInt8',  this.getOrCreateSimpleFunctionType([integerType, integerType], this.int8Type),  asPrimitiveInt, true, true, getOrMakeEmptySourcePosition()))
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('asInt16', primitivePrefix + 'asInt16', this.getOrCreateSimpleFunctionType([integerType, integerType], this.int16Type), asPrimitiveInt, true, true, getOrMakeEmptySourcePosition()))
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('asInt32', primitivePrefix + 'asInt32', this.getOrCreateSimpleFunctionType([integerType, integerType], this.int32Type), asPrimitiveInt, true, true, getOrMakeEmptySourcePosition()))
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('asInt64', primitivePrefix + 'asInt64', this.getOrCreateSimpleFunctionType([integerType, integerType], this.int64Type), asPrimitiveInt, true, true, getOrMakeEmptySourcePosition()))

        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('asUInt8',  primitivePrefix + 'asUInt8',  this.getOrCreateSimpleFunctionType([integerType, integerType], this.uint8Type),  asPrimitiveInt, true, true, getOrMakeEmptySourcePosition()))
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('asUInt16', primitivePrefix + 'asUInt16', this.getOrCreateSimpleFunctionType([integerType, integerType], this.uint16Type), asPrimitiveInt, true, true, getOrMakeEmptySourcePosition()))
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('asUInt32', primitivePrefix + 'asUInt32', this.getOrCreateSimpleFunctionType([integerType, integerType], this.uint32Type), asPrimitiveInt, true, true, getOrMakeEmptySourcePosition()))
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('asUInt64', primitivePrefix + 'asUInt64', this.getOrCreateSimpleFunctionType([integerType, integerType], this.uint64Type), asPrimitiveInt, true, true, getOrMakeEmptySourcePosition()))

        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('asFloat',   primitivePrefix + 'asFloat',   this.getOrCreateSimpleFunctionType([integerType, integerType], this.floatType),   asPrimitiveFloat, true, true, getOrMakeEmptySourcePosition()))
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('asFloat32', primitivePrefix + 'asFloat32', this.getOrCreateSimpleFunctionType([integerType, integerType], this.float32Type), asPrimitiveFloat, true, true, getOrMakeEmptySourcePosition()))
        integerType.addPrimitiveMethod(new HIRPrimitiveFunction('asFloat64', primitivePrefix + 'asFloat64', this.getOrCreateSimpleFunctionType([integerType, integerType], this.float64Type), asPrimitiveFloat, true, true, getOrMakeEmptySourcePosition()))
    }

    createFloatPrimitiveFunctions(floatType: HIRNominalType) {
        function floatNegated(operand: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralFloatValue(-operand.evaluateAsFloat(), resultType, sourcePosition)
        }
        function floatSqrt(operand: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralFloatValue(Math.sqrt(operand.evaluateAsFloat()), resultType, sourcePosition)
        }

        function floatAdd(left: HIRValue, right: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralFloatValue(left.evaluateAsFloat() + right.evaluateAsFloat(), resultType, sourcePosition)
        }
        function floatSub(left: HIRValue, right: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralFloatValue(left.evaluateAsFloat() - right.evaluateAsFloat(), resultType, sourcePosition)
        }
        function floatMul(left: HIRValue, right: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralFloatValue(left.evaluateAsFloat() * right.evaluateAsFloat(), resultType, sourcePosition)
        }
        function floatDiv(left: HIRValue, right: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralFloatValue(~~(left.evaluateAsFloat() / right.evaluateAsFloat()), resultType, sourcePosition)
        }

        function floatEquals(left: HIRValue, right: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralBooleanValue(left.evaluateAsFloat() === right.evaluateAsFloat(), resultType, sourcePosition)
        }
        function floatNotEquals(left: HIRValue, right: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralBooleanValue(left.evaluateAsFloat() !== right.evaluateAsFloat(), resultType, sourcePosition)
        }
        function floatLessThan(left: HIRValue, right: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralBooleanValue(left.evaluateAsFloat() < right.evaluateAsFloat(), resultType, sourcePosition)
        }
        function floatLessOrEquals(left: HIRValue, right: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralBooleanValue(left.evaluateAsFloat() <= right.evaluateAsFloat(), resultType, sourcePosition)
        }
        function floatGreaterThan(left: HIRValue, right: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralBooleanValue(left.evaluateAsFloat() > right.evaluateAsFloat(), resultType, sourcePosition)
        }
        function floatGreaterOrEquals(left: HIRValue, right: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralBooleanValue(left.evaluateAsFloat() >= right.evaluateAsFloat(), resultType, sourcePosition)
        }

        function asPrimitiveChar(value: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralCharacterValue(~~value.evaluateAsFloat(), resultType, sourcePosition);
        }

        function asPrimitiveInt(value: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralIntegerValue(~~value.evaluateAsFloat(), resultType, sourcePosition);
        }

        function asPrimitiveFloat(value: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralFloatValue(value.evaluateAsFloat(), resultType, sourcePosition);
        }

        let primitivePrefix = floatType.toString() + "::";
        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('negated',   primitivePrefix + 'negated',   this.getOrCreateSimpleFunctionType([floatType], floatType), floatNegated, true, true, getOrMakeEmptySourcePosition()))
        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('sqrt', primitivePrefix + 'sqrt', this.getOrCreateSimpleFunctionType([floatType], floatType), floatSqrt, true, true, getOrMakeEmptySourcePosition()))

        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('+', primitivePrefix + '+',  this.getOrCreateSimpleFunctionType([floatType, floatType], floatType), floatAdd, true, true, getOrMakeEmptySourcePosition()))
        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('-', primitivePrefix + '-',  this.getOrCreateSimpleFunctionType([floatType, floatType], floatType), floatSub, true, true, getOrMakeEmptySourcePosition()))
        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('*', primitivePrefix + '*',  this.getOrCreateSimpleFunctionType([floatType, floatType], floatType), floatMul, true, true, getOrMakeEmptySourcePosition()))
        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('/', primitivePrefix + '/', this.getOrCreateSimpleFunctionType([floatType, floatType], floatType), floatDiv, true, true, getOrMakeEmptySourcePosition()))

        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('=',  primitivePrefix + '=',  this.getOrCreateSimpleFunctionType([floatType, floatType], this.boolean8Type), floatEquals,          true, true, getOrMakeEmptySourcePosition()))
        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('~=', primitivePrefix + '~=', this.getOrCreateSimpleFunctionType([floatType, floatType], this.boolean8Type), floatNotEquals,       true, true, getOrMakeEmptySourcePosition()))
        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('<',  primitivePrefix + '<',  this.getOrCreateSimpleFunctionType([floatType, floatType], this.boolean8Type), floatLessThan,        true, true, getOrMakeEmptySourcePosition()))
        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('<=', primitivePrefix + '<=', this.getOrCreateSimpleFunctionType([floatType, floatType], this.boolean8Type), floatLessOrEquals,    true, true, getOrMakeEmptySourcePosition()))
        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('>',  primitivePrefix + '>',  this.getOrCreateSimpleFunctionType([floatType, floatType], this.boolean8Type), floatGreaterThan,     true, true, getOrMakeEmptySourcePosition()))
        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('>=', primitivePrefix + '>=', this.getOrCreateSimpleFunctionType([floatType, floatType], this.boolean8Type), floatGreaterOrEquals, true, true, getOrMakeEmptySourcePosition()))

        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('asCharacter',  primitivePrefix + 'asCharacter', this.getOrCreateSimpleFunctionType([floatType, floatType], this.characterType),  asPrimitiveInt, true, true, getOrMakeEmptySourcePosition()))
        
        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('asChar8',  primitivePrefix + 'asChar8',  this.getOrCreateSimpleFunctionType([floatType, floatType], this.char8Type),  asPrimitiveChar, true, true, getOrMakeEmptySourcePosition()))
        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('asChar16', primitivePrefix + 'asChar16', this.getOrCreateSimpleFunctionType([floatType, floatType], this.char16Type), asPrimitiveChar, true, true, getOrMakeEmptySourcePosition()))
        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('asChar32', primitivePrefix + 'asChar32', this.getOrCreateSimpleFunctionType([floatType, floatType], this.char32Type), asPrimitiveChar, true, true, getOrMakeEmptySourcePosition()))

        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('asInt8',  primitivePrefix + 'asInt8',  this.getOrCreateSimpleFunctionType([floatType, floatType], this.int8Type),  asPrimitiveInt, true, true, getOrMakeEmptySourcePosition()))
        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('asInt16', primitivePrefix + 'asInt16', this.getOrCreateSimpleFunctionType([floatType, floatType], this.int16Type), asPrimitiveInt, true, true, getOrMakeEmptySourcePosition()))
        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('asInt32', primitivePrefix + 'asInt32', this.getOrCreateSimpleFunctionType([floatType, floatType], this.int32Type), asPrimitiveInt, true, true, getOrMakeEmptySourcePosition()))
        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('asInt64', primitivePrefix + 'asInt64', this.getOrCreateSimpleFunctionType([floatType, floatType], this.int64Type), asPrimitiveInt, true, true, getOrMakeEmptySourcePosition()))

        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('asUInt8',  primitivePrefix + 'asUInt8',  this.getOrCreateSimpleFunctionType([floatType, floatType], this.uint8Type),  asPrimitiveInt, true, true, getOrMakeEmptySourcePosition()))
        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('asUInt16', primitivePrefix + 'asUInt16', this.getOrCreateSimpleFunctionType([floatType, floatType], this.uint16Type), asPrimitiveInt, true, true, getOrMakeEmptySourcePosition()))
        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('asUInt32', primitivePrefix + 'asUInt32', this.getOrCreateSimpleFunctionType([floatType, floatType], this.uint32Type), asPrimitiveInt, true, true, getOrMakeEmptySourcePosition()))
        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('asUInt64', primitivePrefix + 'asUInt64', this.getOrCreateSimpleFunctionType([floatType, floatType], this.uint64Type), asPrimitiveInt, true, true, getOrMakeEmptySourcePosition()))

        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('asFloat',   primitivePrefix + 'asFloat',   this.getOrCreateSimpleFunctionType([floatType, floatType], this.floatType),   asPrimitiveFloat, true, true, getOrMakeEmptySourcePosition()))
        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('asFloat32', primitivePrefix + 'asFloat32', this.getOrCreateSimpleFunctionType([floatType, floatType], this.float32Type), asPrimitiveFloat, true, true, getOrMakeEmptySourcePosition()))
        floatType.addPrimitiveMethod(new HIRPrimitiveFunction('asFloat64', primitivePrefix + 'asFloat64', this.getOrCreateSimpleFunctionType([floatType, floatType], this.float64Type), asPrimitiveFloat, true, true, getOrMakeEmptySourcePosition()))
    }

    createNumericalPrimitiveConversionMethods(numericalType: HIRNominalType) {
        function asPrimitiveCharacter(value: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralCharacterValue(~~value.evaluateAsNumber(), resultType, sourcePosition);
        }
        function asPrimitiveFloat(value: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralFloatValue(value.evaluateAsNumber(), resultType, sourcePosition);
        }
        function asPrimitiveInteger(value: HIRValue, resultType: HIRType, sourcePosition: AbstractSourcePosition) {
            return new HIRConstantLiteralIntegerValue(~~value.evaluateAsNumber(), resultType, sourcePosition);
        }

        let primitivePrefix = numericalType.toString() + "::";
        numericalType.addPrimitiveMethod(new HIRPrimitiveFunction('i8',  primitivePrefix + 'i8',  this.getOrCreateSimpleFunctionType([numericalType], this.int8Type),  asPrimitiveInteger, true, true, getOrMakeEmptySourcePosition()))
        numericalType.addPrimitiveMethod(new HIRPrimitiveFunction('i16', primitivePrefix + 'i16', this.getOrCreateSimpleFunctionType([numericalType], this.int16Type), asPrimitiveInteger, true, true, getOrMakeEmptySourcePosition()))
        numericalType.addPrimitiveMethod(new HIRPrimitiveFunction('i32', primitivePrefix + 'i32', this.getOrCreateSimpleFunctionType([numericalType], this.int32Type), asPrimitiveInteger, true, true, getOrMakeEmptySourcePosition()))
        numericalType.addPrimitiveMethod(new HIRPrimitiveFunction('i64', primitivePrefix + 'i64', this.getOrCreateSimpleFunctionType([numericalType], this.int64Type), asPrimitiveInteger, true, true, getOrMakeEmptySourcePosition()))

        numericalType.addPrimitiveMethod(new HIRPrimitiveFunction('u8',  primitivePrefix + 'u8',  this.getOrCreateSimpleFunctionType([numericalType], this.uint8Type),  asPrimitiveInteger, true, true, getOrMakeEmptySourcePosition()))
        numericalType.addPrimitiveMethod(new HIRPrimitiveFunction('u16', primitivePrefix + 'u16', this.getOrCreateSimpleFunctionType([numericalType], this.uint16Type), asPrimitiveInteger, true, true, getOrMakeEmptySourcePosition()))
        numericalType.addPrimitiveMethod(new HIRPrimitiveFunction('u32', primitivePrefix + 'u32', this.getOrCreateSimpleFunctionType([numericalType], this.uint32Type), asPrimitiveInteger, true, true, getOrMakeEmptySourcePosition()))
        numericalType.addPrimitiveMethod(new HIRPrimitiveFunction('u64', primitivePrefix + 'u64', this.getOrCreateSimpleFunctionType([numericalType], this.uint64Type), asPrimitiveInteger, true, true, getOrMakeEmptySourcePosition()))

        numericalType.addPrimitiveMethod(new HIRPrimitiveFunction('c8',  primitivePrefix + 'c8',  this.getOrCreateSimpleFunctionType([numericalType], this.char8Type),  asPrimitiveCharacter, true, true, getOrMakeEmptySourcePosition()))
        numericalType.addPrimitiveMethod(new HIRPrimitiveFunction('c16', primitivePrefix + 'c16', this.getOrCreateSimpleFunctionType([numericalType], this.char16Type), asPrimitiveCharacter, true, true, getOrMakeEmptySourcePosition()))
        numericalType.addPrimitiveMethod(new HIRPrimitiveFunction('c32', primitivePrefix + 'c32', this.getOrCreateSimpleFunctionType([numericalType], this.char32Type), asPrimitiveCharacter, true, true, getOrMakeEmptySourcePosition()))

        numericalType.addPrimitiveMethod(new HIRPrimitiveFunction('f32', primitivePrefix + 'f32', this.getOrCreateSimpleFunctionType([numericalType], this.float32Type), asPrimitiveFloat, true, true, getOrMakeEmptySourcePosition()))
        numericalType.addPrimitiveMethod(new HIRPrimitiveFunction('f64', primitivePrefix + 'f64', this.getOrCreateSimpleFunctionType([numericalType], this.float64Type), asPrimitiveFloat, true, true, getOrMakeEmptySourcePosition()))

        numericalType.addPrimitiveMethod(new HIRPrimitiveFunction('sz', primitivePrefix + 'sz', this.getOrCreateSimpleFunctionType([numericalType], this.getSizeType()), asPrimitiveInteger, true, true, getOrMakeEmptySourcePosition()))
        numericalType.addPrimitiveMethod(new HIRPrimitiveFunction('iptr', primitivePrefix + 'iptr', this.getOrCreateSimpleFunctionType([numericalType], this.getIntPointerType()), asPrimitiveInteger, true, true, getOrMakeEmptySourcePosition()))
        numericalType.addPrimitiveMethod(new HIRPrimitiveFunction('uptr', primitivePrefix + 'uptr', this.getOrCreateSimpleFunctionType([numericalType], this.getUIntPointerType()), asPrimitiveInteger, true, true, getOrMakeEmptySourcePosition()))

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

    getOrCreateAssociationType(keyType: HIRType, valueType: HIRType) {
        return new HIRAssociationType(keyType, valueType, this, getOrMakeEmptySourcePosition())
    }

    getOrCreateTupleType(elements: HIRType[]) {
        return new HIRTupleType(elements, this, getOrMakeEmptySourcePosition())
    }

    getOrCreatePointerType(baseType: HIRType) : HIRPointerType {
        return new HIRPointerType(baseType, this, getOrMakeEmptySourcePosition());
    }

    getOrCreateReferenceType(baseType: HIRType) : HIRPointerType {
        return new HIRReferenceType(baseType, this, getOrMakeEmptySourcePosition());
    }

    getOrCreateMutableValueBoxType(baseType: HIRType) : HIRPointerType {
        return new HIRMutableValueBoxType(baseType, this, getOrMakeEmptySourcePosition());
    }
}

export class HIRPackage extends HIRValue {
    name: string | null = null;
    coreTypes: HIRCoreTypes;
    children: HIRValue[] = []
    publicSymbolTable: Record<string, HIRValue> = {};
    pendingAnalysisList: HIRValue[] = [];
    usedPackages: HIRPackage[] = [];

    constructor(coreTypes: HIRCoreTypes, sourcePosition: AbstractSourcePosition) {
        super(sourcePosition);
        this.coreTypes = coreTypes;
    }

    accept(visitor: HIRVisitor) {
        return visitor.visitPackage(this);
    }

    getType(): HIRType {
        return this.coreTypes.packageType;
    }

    addEntityWithPendingAnalysis(entity: HIRValue) {
        this.pendingAnalysisList.push(entity);
    }
    
    finishPendingAnalysis() {
        while(this.pendingAnalysisList.length !== 0) {
            let toAnalyze = this.pendingAnalysisList;
            this.pendingAnalysisList = [];
            for (let i = 0; i < toAnalyze.length; ++i) {
                let entity = toAnalyze[i] as HIRValue;
                entity.ensureAnalysis();
            }
        }
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

    addPublicNamedElement(name: string, binding: HIRValue, sourcePosition: AbstractSourcePosition): void {
        if(name in this.publicSymbolTable)
            throw Error(sourcePosition.formatMessage(`There is already a public binding for #${name}`));
        this.addSymbolWithBinding(name, binding);
    }

    lookSymbolRecursivelyOrNone(symbol: string): HIRValue | null {
        if (symbol in this.publicSymbolTable)
            return this.publicSymbolTable[symbol] as HIRValue;
        for(let i = 0; i < this.usedPackages.length; ++i) {
            let usedPackage = this.usedPackages[this.usedPackages.length - i - 1];
            if (!usedPackage)
                throw new Error('Expected a package.');

            let exportedSymbol = usedPackage.lookSymbolRecursivelyOrNone(symbol);
            if(exportedSymbol)
                return exportedSymbol;
        }

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
        this.corePackage.name = '__CorePrimitives__';
        this.currentPackage = this.corePackage;
        this.corePackage.addCoreTypeMembers();
    }

    newPackage(): HIRPackage {
        let newPackage = new HIRPackage(this.coreTypes, getOrMakeEmptySourcePosition());
        newPackage.usedPackages.push(this.corePackage);
        this.currentPackage = newPackage;
        return newPackage;
    }

    addEntityWithPendingAnalysis(entity: HIRValue) {
        this.currentPackage.addEntityWithPendingAnalysis(entity);
    }

    finishPendingAnalysis() {
        this.currentPackage.finishPendingAnalysis();
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

    createTopLevelFunctionBuilder(sourcePosition: AbstractSourcePosition) : HIRBuilder {
        let dependentFunctionType = new HIRDependentFunctionType([], this.coreTypes.dynamicType, this.coreTypes, sourcePosition);
        let topLevelFunction = new HIRFunction(null, dependentFunctionType, sourcePosition);
        let topLevelEnvironment = this.createTopLevelEnvironment(null);

        // Alloca
        let allocaBlock = new HIRBasicBlock(this.coreTypes.basicBlockType, 'alloca', sourcePosition);
        topLevelFunction.addBasicBlock(allocaBlock);
        let allocaBuilder = new HIRBuilder(topLevelFunction, this, allocaBlock, topLevelEnvironment);

        // Entry block
        let entryBlock = new HIRBasicBlock(this.coreTypes.basicBlockType, 'entry', sourcePosition);
        topLevelFunction.addBasicBlock(entryBlock);
        let builder = new HIRBuilder(topLevelFunction, this, entryBlock, topLevelEnvironment);
        builder.allocaBuilder = allocaBuilder;
        builder.entryBasicBlock = entryBlock;

        return builder;
    }

    getOrCreateAssociationType(keyType: HIRType, valueType: HIRType) {
        return this.coreTypes.getOrCreateAssociationType(keyType, valueType);
    }

    getOrCreateTupleType(elements: HIRType[]) {
        return this.coreTypes.getOrCreateTupleType(elements);
    }

    getOrCreatePointerType(baseType: HIRType) : HIRPointerType {
        return this.coreTypes.getOrCreatePointerType(baseType)
    }

    getOrCreateReferenceType(baseType: HIRType) : HIRPointerType {
        return this.coreTypes.getOrCreateReferenceType(baseType)
    }

    getOrCreateMutableValueBoxType(baseType: HIRType) : HIRPointerType {
        return this.coreTypes.getOrCreateMutableValueBoxType(baseType)
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

    visitStringNode(node: parseTree.ParseTreeNode) : string {
        let evaluatedValue = this.visitNodeWithExpectedType(node, this.evaluationContext.context.coreTypes.stringType);
        return evaluatedValue.evaluateAsString();
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

    visitRuntimeErrorNode(node: parseTree.ParseTreeRuntimeErrorNode): any {
        let errorMessage = this.visitStringNode(node.errorMessage);
        throw new Error(node.sourcePosition.formatMessage(errorMessage));
    }

    visitAssertNode(node: parseTree.ParseTreeAssertNode): any {
        if(!this.visitBooleanNode(node.condition))
            throw new Error(node.sourcePosition.formatMessage(`Assertion failure: ${node.condition.sourcePosition.getValue()}`));
        return this.evaluationContext.context.coreTypes.voidValue;
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
        let expandedMessageSend = node.expandAsMessageSends();
        return this.visitNode(expandedMessageSend)
    }

    visitDictionaryNode(node: parseTree.ParseTreeDictionaryNode): any {
        let associations: HIRConstantAssociation[] = [];
        for(let i = 0; i < node.elements.length; ++i) {
            let associationExpression = node.elements[i];
            if(!associationExpression)
                throw new Error('Expected an expression');

            let association = this.visitDecayedNode(associationExpression);
            if(!association.isConstantAssociation()) {
                throw new Error('Expected an association.');
            }
            associations.push(association as HIRConstantAssociation);
        }
        let dictionaryType = this.evaluationContext.context.coreTypes.dynamicDictionaryType;
        return new HIRConstantDictionary(associations, dictionaryType, node.sourcePosition)
    }
    
    visitIdentifierReferenceNode(node: parseTree.ParseTreeIdentifierReferenceNode): any {
        let bindingOrNull = this.evaluationContext.environment.lookSymbolRecursively(node.symbol);
        if(!bindingOrNull)
            throw new Error(node.sourcePosition.formatMessage(`#${node.symbol} identifier is not found.`))

        return bindingOrNull.analyzeAndEvaluateIdentifierReferenceNode(this, node)
    }

    visitArgumentDefinitionNode(node: parseTree.ParseTreeArgumentDefinitionNode): any {
        let argumentType: HIRType = this.evaluationContext.context.coreTypes.dynamicType;
        if (node.typeExpression)
            argumentType = this.visitNodeExpectingType(node.typeExpression);

        let argument = new HIRArgument(argumentType, node.name, node.sourcePosition);
        argument.isSelf = node.isSelf;
        return argument;
    }

    visitFunctionTypeNode(node: parseTree.ParseTreeFunctionTypeNode): any {
        let oldEnvironment = this.evaluationContext.environment;
        let analysisEnvironment = new HIRDependentFunctionTypeAnalysisEnvironment(oldEnvironment);
        this.evaluationContext.environment = analysisEnvironment;

        let argumentDefinitions: HIRArgument[] = [];
        for(let i = 0; i < node.argumentDefinitions.length; ++i) {
            let argument = this.visitNode(node.argumentDefinitions[i] as parseTree.ParseTreeNode);
            argumentDefinitions.push(argument);
        }

        let resultType: HIRType = this.evaluationContext.context.coreTypes.dynamicType;
        if(node.resultTypeExpression) {
            resultType = this.visitNodeExpectingType(node.resultTypeExpression);
        }

        // TODO: Do we need to add back the captures?
        let functionType = new HIRDependentFunctionType(argumentDefinitions, resultType, this.evaluationContext.context.coreTypes, node.sourcePosition);
        this.evaluationContext.environment = oldEnvironment;
        return functionType;
    }

    visitFunctionNode(node: parseTree.ParseTreeFunctionNode): any {
        let name = this.visitOptionalSymbolNode(node.nameExpression);
        let dependentFunctionType = this.visitNode(node.functionType) as HIRDependentFunctionType;

        let owner = this.evaluationContext.environment.lookupProgramEntityOwner();
        if(node.isMethod) {
            if(!owner)
                throw new Error('Expected an owner for the method.');

            if(owner.isType()) {
                let selfArgument = new HIRArgument(owner as HIRType, 'self', node.sourcePosition);
                selfArgument.isSelf = true;
                dependentFunctionType = dependentFunctionType.copyWithImplicitArgument(selfArgument);
            }
        }

        let hirFunction = new HIRFunction(name, dependentFunctionType, node.sourcePosition);
        hirFunction.definitionBody = node.body;
        hirFunction.definitionContext = this.evaluationContext.context;
        hirFunction.definitionEnvironment = this.evaluationContext.environment;
        this.evaluationContext.context.addEntityWithPendingAnalysis(hirFunction);

        if(name) {
            this.evaluationContext.environment.setNewSymbolBinding(name, hirFunction, node.sourcePosition);
            // TODO: add method and public functions
            if(node.isMethod) {
                if(!owner)
                    throw new Error('Expected an owner for the method')
                owner.withSelectorAddMethod(name, hirFunction);
            } else if(node.isPublic) { 
                if(!owner)
                    throw Error(node.sourcePosition.formatMessage('Location does not have a program entity owner.'))
                owner.addPublicNamedElement(name, hirFunction, node.sourcePosition)
            }
        }
        return hirFunction;
    }

    visitLexicalBlockNode(node: parseTree.ParseTreeLexicalBlockNode): any {
        let childEnvironment = new HIRLexicalEnvironment(this.evaluationContext.environment);
        let oldEnvironment = this.evaluationContext.environment;

        this.evaluationContext.environment = childEnvironment;
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
        throw new Error('Invalid location for a cascaded message send node.');
    }

    visitMessageCascadeNode(node: parseTree.ParseTreeMessageCascadeNode): any {
        let resultValue = this.visitNode(node.receiver) as HIRValue;
        let receiverNodeValue = new parseTree.ParseTreeLiteralValueNode(node.receiver.sourcePosition, resultValue);

        for(let i = 0; i < node.cascadedMessages.length; ++i) {
            let cascadedMessage = node.cascadedMessages[i];
            if(!cascadedMessage)
                throw new Error("Expected a valid cascaded message.");

            let expandedMessage = cascadedMessage.asMessageSendWithReceiver(receiverNodeValue);
            resultValue = this.visitNode(expandedMessage);
        }

        return resultValue;
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
        throw new Error(node.sourcePosition.formatMessage('TODO: visitSwitchSelectionNode.'));
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

    visitEnumDefinitionNode(node: parseTree.ParseTreeEnumDefinitionNode) {
        let name = this.visitOptionalSymbolNode(node.nameExpression)
        let baseType: HIRType = this.evaluationContext.context.coreTypes.dynamicType;
        if (node.baseTypeExpression)
            baseType = this.visitNodeExpectingType(node.baseTypeExpression)

        let enumType = new HIREnumType(name, baseType, this.evaluationContext.context.coreTypes, node.sourcePosition)
        if(name) {
            this.evaluationContext.environment.setNewSymbolBinding(name, enumType, node.sourcePosition);
            if(node.isPublic) {
                let owner = this.evaluationContext.environment.lookupProgramEntityOwner();
                if(!owner)
                    throw new Error(node.sourcePosition.formatMessage('Expected a program entity owner.'));
                owner.addPublicNamedElement(name, enumType, node.sourcePosition);
            }
        }

        let valuesValue = this.visitDecayedNode(node.valuesExpression);
        if(!valuesValue.isConstantDictionary())
            throw new Error(node.sourcePosition.formatMessage('Expected a dictionary with the enum values.'));

        let valuesDictionary = valuesValue as HIRConstantDictionary;
        let nextImplicitValue = baseType.getOrCreateDefaultValue();
        for(let i = 0; i < valuesDictionary.associations.length; ++i) {
            let association = valuesDictionary.associations[i];
            if(!association)
                throw new Error('Expected an association.');

            if(!association.key.isConstantLiteralSymbolValue())
                throw new Error(association.sourcePosition.formatMessage('Expected symbols for the association names.'));

            let associationName = association.key.evaluateAsSymbol();
            let associationValue = nextImplicitValue;
            if(association.value && !association.value.isConstantLiteralNilValue()) {
                if(!baseType.isSatisfiedByValue(association.value))
                    throw new Error(association.sourcePosition.formatMessage(`association elements must be of type ${baseType.toString()}.`))
                associationValue = association.value;
            }

            let constantEnum = new HIRConstantEnum(associationName, associationValue, enumType, association.sourcePosition)
            enumType.addElementAt(constantEnum, association.sourcePosition);

            nextImplicitValue = associationValue.plusOne()
        }
        
        //
        return enumType;
    }

    visitFieldDefinitionNode(node: parseTree.ParseTreeFieldDefinitionNode) {
        let name = this.visitOptionalSymbolNode(node.nameExpression);
        let type: HIRType = this.evaluationContext.context.coreTypes.dynamicType;
        if(node.typeExpression)
            type = this.visitNodeExpectingType(node.typeExpression);

        let owner = this.evaluationContext.environment.lookupProgramEntityOwner();
        if(!owner)
            throw new Error(node.sourcePosition.formatMessage('Field is being defined outside an owner scope.'));
        
        let field = new HIRField(name, type, node.isPublic, this.evaluationContext.context.coreTypes, node.sourcePosition);
        owner.addField(field);
        return field;
    }

    visitClassDefinitionNode(node: parseTree.ParseTreeClassDefinitionNode) {
        let name = this.visitOptionalSymbolNode(node.nameExpression);
        let superclass: HIRClass | null = null;
        if(node.superclassExpression) {
            let superclassValue = this.visitDecayedNode(node.superclassExpression);
            if(!superclassValue.isClass())
                throw new Error(node.sourcePosition.formatMessage('A class superclass must be another class.'))
            superclass = superclassValue as HIRClass;
        } else {
            superclass = this.evaluationContext.context.coreTypes.objectClass;
        }

        // Make the metaclass
        let metaclassSuper: HIRBehavior | null = null;
        if(superclass)
            metaclassSuper = superclass.metaClass;

        let metaclass = new HIRMetaclass(this.evaluationContext.context.coreTypes.metaclassClass, metaclassSuper, this.evaluationContext.context.coreTypes, node.sourcePosition)

        // Make the class
        let clazz = new HIRClass(name, metaclass, superclass, this.evaluationContext.context.coreTypes, node.sourcePosition);
        metaclass.thisClass = clazz;

        // Pending analysis.
        this.evaluationContext.context.addEntityWithPendingAnalysis(metaclass);
        this.evaluationContext.context.addEntityWithPendingAnalysis(clazz);

        if(name) {
            this.evaluationContext.environment.setNewSymbolBinding(name, clazz, node.sourcePosition);
        }
        if(node.isPublic) {
            let owner = this.evaluationContext.environment.lookupProgramEntityOwner();
            if(!owner)
                throw new Error('Expected an entity owner.');
            
            if(!name)
                owner.addAnonymousElement(clazz);
            else
                owner.addPublicNamedElement(name, clazz, node.sourcePosition);
        }
        if(node.definitionBody)
            clazz.addPendingDefinitionBody(this.evaluationContext, node.definitionBody)
        return clazz;
    }
}

export class AnalysisAndBuildPass extends parseTree.ParseTreeVisitor {
    builder: HIRBuilder;

    constructor(builder: HIRBuilder) {
        super();
        this.builder = builder;
    }

    visitDecayedNode(node: parseTree.ParseTreeNode) : HIRValue {
        let value = this.visitNode(node) as HIRValue;
        let valueType = value.getType();

        if (valueType.isReferenceType())
            return this.builder.load((valueType as HIRPointerLikeType).baseType, value, node.sourcePosition);
        return value;
    }
    castValueToExpectedType(value: HIRValue, expectedType: HIRType | null, sourcePosition: AbstractSourcePosition): HIRValue {
        if(!expectedType)
            return value;

        if(!expectedType.isSatisfiedByValue(value))
            throw new Error(sourcePosition.formatMessage(`expected a value of type ${expectedType.toString()} instead of "${value.getType().toString()}".`))
        return value;
    }

    evaluateSymbolNode(symbolNode: parseTree.ParseTreeNode) : string {
        let symbolValue = this.visitDecayedNode(symbolNode);
        if (!symbolValue.isConstantLiteralSymbolValue()) {
            throw new Error(symbolNode.sourcePosition.formatMessage('Expected a symbol value.'));
        }
        return symbolValue.evaluateAsSymbol();
    }

    evaluateOptionalSymbolNode(node: parseTree.ParseTreeNode | null) : string | null {
        if(!node)
            return null;
        return this.evaluateSymbolNode(node);
    }

    visitNodeExpectingType(node: parseTree.ParseTreeNode) : HIRType {
        let value = this.visitDecayedNode(node);
        if(!value.isType())
            throw new Error(node.sourcePosition.formatMessage('Expected a type expression.'));
        return value as HIRType;
    }

    visitNodeWithExpectedType(node: parseTree.ParseTreeNode, expectedType: HIRType | null) : HIRValue {
        let value = this.visitDecayedNode(node);
        return this.castValueToExpectedType(value, expectedType, node.sourcePosition);
    }

    visitBooleanCondition(node: parseTree.ParseTreeNode) : HIRValue {
        return this.visitNodeWithExpectedType(node, this.builder.context.coreTypes.boolean8Type);
    }

    visitErrorNode(node: parseTree.ParseTreeErrorNode): any {
        throw new Error(node.sourcePosition.formatMessage(node.errorMessage));
    }
    visitParseErrorNode(node: parseTree.ParseTreeParseErrorNode): any {
        throw new Error(node.sourcePosition.formatMessage(node.errorMessage));
    }
    visitRuntimeErrorNode(node: parseTree.ParseTreeRuntimeErrorNode): any {
        let message = this.visitNodeWithExpectedType(node.errorMessage, this.builder.context.coreTypes.stringType);
        return this.builder.runtimeError(message, node.sourcePosition);
    }
    visitAssertNode(node: parseTree.ParseTreeAssertNode): any {
        let condition = this.visitBooleanCondition(node.condition);
        let message = new HIRConstantLiteralStringValue(node.sourcePosition.getValue(), this.builder.context.coreTypes.stringType, node.sourcePosition);
        this.builder.assertCondition(condition, message, node.sourcePosition);
        return this.builder.context.coreTypes.voidValue;
    }

    visitApplicationNode(node: parseTree.ParseTreeApplicationNode): any {
        let functional = this.visitDecayedNode(node.functional);
        return functional.analyzeAndBuildApplicationNode(this, node, functional);
    }

    visitAssignmentNode(node: parseTree.ParseTreeAssignmentNode): any {
        let storeValue = this.visitNode(node.store);
        return storeValue.analyzeAndBuildAssignment(this, node);
    }
    visitAssociationNode(node: parseTree.ParseTreeAssociationNode): any {
        let key = this.visitDecayedNode(node.key);
        let value: HIRValue = this.builder.context.coreTypes.nilValue;
        if(node.value)
            value = this.visitDecayedNode(node.value);

        if(key.isType() && value.isType()) {
            return this.builder.context.getOrCreateAssociationType(key as HIRType, value as HIRType);
        }

        let keyType = key.getType();
        let valueType = value.getType();
        let associationType = this.builder.context.getOrCreateAssociationType(keyType, valueType);
        return this.builder.makeAssociation(key, value, associationType, node.sourcePosition)
    }
    
    visitBinaryExpressionSequenceNode(node: parseTree.ParseTreeBinaryExpressionSequenceNode): any {
        let expandedMessageSend = node.expandAsMessageSends();
        return this.visitNode(expandedMessageSend)
    }

    visitDictionaryNode(node: parseTree.ParseTreeDictionaryNode): any {
        throw new Error('visitDictionaryNode')
    }

    visitIdentifierReferenceNode(node: parseTree.ParseTreeIdentifierReferenceNode): any {
        let bindingOrNull = this.builder.environment.lookSymbolRecursively(node.symbol);
        if(!bindingOrNull)
            throw new Error(node.sourcePosition.formatMessage(`#${node.symbol} identifier is not found.`))

        return bindingOrNull.analyzeAndBuildIdentifierReferenceNode(this, node)
    }

    visitArgumentDefinitionNode(node: parseTree.ParseTreeArgumentDefinitionNode): any {
        let argumentType: HIRType = this.builder.context.coreTypes.dynamicType;
        if (node.typeExpression)
            argumentType = this.visitNodeExpectingType(node.typeExpression);

        let argument = new HIRArgument(argumentType, node.name, node.sourcePosition);
        argument.isSelf = node.isSelf;
        return argument;
    }

    visitFunctionTypeNode(node: parseTree.ParseTreeFunctionTypeNode): any {
        let oldEnvironment = this.builder.environment;
        let analysisEnvironment = new HIRDependentFunctionTypeAnalysisEnvironment(oldEnvironment);
        this.builder.environment = analysisEnvironment;

        let argumentDefinitions: HIRArgument[] = [];
        for(let i = 0; i < node.argumentDefinitions.length; ++i) {
            let argument = this.visitNode(node.argumentDefinitions[i] as parseTree.ParseTreeNode);
            argumentDefinitions.push(argument);
        }

        let resultType: HIRType = this.builder.context.coreTypes.dynamicType;
        if(node.resultTypeExpression) {
            resultType = this.visitNodeExpectingType(node.resultTypeExpression);
        }

        // TODO: Do we need to add back the captures?
        let functionType = new HIRDependentFunctionType(argumentDefinitions, resultType, this.builder.context.coreTypes, node.sourcePosition);
        this.builder.environment = oldEnvironment;
        return functionType;
    }

    visitFunctionNode(node: parseTree.ParseTreeFunctionNode): any {
        let name = this.evaluateOptionalSymbolNode(node.nameExpression);
        let dependentFunctionType = this.visitNode(node.functionType) as HIRDependentFunctionType;

        let hirFunction = new HIRFunction(name, dependentFunctionType, node.sourcePosition);
        hirFunction.definitionBody = node.body;
        hirFunction.definitionContext = this.builder.context;
        hirFunction.definitionEnvironment = this.builder.environment;
        hirFunction.ensureAnalysis();

        let functionValue: HIRValue = hirFunction;
        if(hirFunction.captures.length !== 0) {
            let captureSources = hirFunction.captures.map((value: HIRCapture) : HIRValue => value.sourceValue);
            let closure = this.builder.makeClosure(hirFunction, captureSources, node.sourcePosition);
            functionValue = closure;
        }

        if(name) {
            this.builder.environment.setNewSymbolBinding(name, functionValue, node.sourcePosition);
        }

        return functionValue;
    }

    visitLexicalBlockNode(node: parseTree.ParseTreeLexicalBlockNode): any {
        let childEnvironment = new HIRLexicalEnvironment(this.builder.environment);
        let oldEnvironment = this.builder.environment;

        this.builder.environment = childEnvironment;
        
        let result = this.visitNode(node.body);

        this.builder.environment = oldEnvironment;

        return result;
    }

    visitLiteralCharacterNode(node: parseTree.ParseTreeLiteralCharacterNode): any {
        return new HIRConstantLiteralCharacterValue(node.value, this.builder.context.coreTypes.characterType, node.sourcePosition);
    }

    visitLiteralFloatNode(node: parseTree.ParseTreeLiteralFloatNode): any {
        return new HIRConstantLiteralFloatValue(node.value, this.builder.context.coreTypes.floatType, node.sourcePosition);
    }

    visitLiteralIntegerNode(node: parseTree.ParseTreeLiteralIntegerNode): any {
        return new HIRConstantLiteralIntegerValue(node.value, this.builder.context.coreTypes.integerType, node.sourcePosition);
    }

    visitLiteralStringNode(node: parseTree.ParseTreeLiteralStringNode): any {
        return new HIRConstantLiteralStringValue(node.value, this.builder.context.coreTypes.stringType, node.sourcePosition);
    }

    visitLiteralSymbolNode(node: parseTree.ParseTreeLiteralSymbolNode): any {
        return new HIRConstantLiteralSymbolValue(node.value, this.builder.context.coreTypes.symbolType, node.sourcePosition);
    }

    visitLiteralValueNode(node: parseTree.ParseTreeLiteralValueNode): any {
        return node.value as HIRValue;
    }

    visitCascadedMessageNode(node: parseTree.ParseTreeCascadedMessageNode): any {
        throw new Error('visitCascadedMessageNode')
    }
    visitMessageCascadeNode(node: parseTree.ParseTreeMessageCascadeNode): any {
        let resultValue = this.visitNode(node.receiver) as HIRValue;
        let receiverNodeValue = new parseTree.ParseTreeLiteralValueNode(node.receiver.sourcePosition, resultValue);

        for(let i = 0; i < node.cascadedMessages.length; ++i) {
            let cascadedMessage = node.cascadedMessages[i];
            if(!cascadedMessage)
                throw new Error("Expected a valid cascaded message.");

            let expandedMessage = cascadedMessage.asMessageSendWithReceiver(receiverNodeValue);
            resultValue = this.visitNode(expandedMessage);
        }

        return resultValue;
    }

    visitMessageSendNode(node: parseTree.ParseTreeMessageSendNode): any {
        let receiver = this.visitNode(node.receiver) as HIRValue;
        return receiver.analyzeAndBuildMessageSendNode(this, node, receiver);
    }

    visitSequenceNode(node: parseTree.ParseTreeSequenceNode): any {
        let result: HIRValue = this.builder.context.coreTypes.voidValue;
        for(let i = 0; i < node.elements.length; ++i) {
            result = this.visitNode(node.elements[i] as parseTree.ParseTreeNode) as HIRValue
        }
        return result;
    }

    visitTupleNode(node: parseTree.ParseTreeTupleNode): any {
        // The empty tuple is void.
        if(node.elements.length == 0)
            return this.builder.context.coreTypes.voidValue;

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
            return this.builder.context.getOrCreateTupleType(tupleElements as HIRType[]);
        }

        let tupleType = this.builder.context.getOrCreateTupleType(tupleTypes);
        return this.builder.makeTuple(tupleElements, tupleType, node.sourcePosition);
    }

    visitQuoteNode(node: parseTree.ParseTreeQuoteNode): any {
        throw new Error('visitQuoteNode')
    }
    visitQuasiQuoteNode(node: parseTree.ParseTreeQuasiQuoteNode): any {
        throw new Error('visitQuasiQuoteNode')
    }
    visitQuasiUnquoteNode(node: parseTree.ParseTreeQuasiUnquoteNode): any {
        throw new Error('visitQuasiUnquoteNode')
    }
    visitSpliceNode(node: parseTree.ParseTreeSpliceNode): any {
        throw new Error('visitSpliceNode')
    }

    visitVariableDefinitionNode(node: parseTree.ParseTreeVariableDefinitionNode): any {
        let name = this.evaluateOptionalSymbolNode(node.nameExpression);
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

            let referenceType = this.builder.context.getOrCreateReferenceType(valueType);
            let alloca = this.builder.allocaBuilder?.alloca(valueType, referenceType, node.sourcePosition);
            if(!alloca)
                throw new Error('Expected an alloca builder');
            this.builder.store(alloca, initialValue, node.sourcePosition);

            if(name)
                this.builder.environment.setNewSymbolBinding(name, alloca, node.sourcePosition);
            return alloca;
        } else {
            if(name)
                this.builder.environment.setNewSymbolBinding(name, initialValue, node.sourcePosition);
            return initialValue;
        }
    }

    visitIfSelectionNode(node: parseTree.ParseTreeIfSelectionNode): any {
        let trueDestination = new HIRBasicBlock(this.builder.context.coreTypes.basicBlockType, 'ifTrue', node.sourcePosition);
        let falseDestination = new HIRBasicBlock(this.builder.context.coreTypes.basicBlockType, 'ifFalse', node.sourcePosition);
        let mergeDestination = new HIRBasicBlock(this.builder.context.coreTypes.basicBlockType, 'ifMerge', node.sourcePosition);

        let conditionValue = this.visitBooleanCondition(node.condition);
        this.builder.conditionalBranch(conditionValue, trueDestination, falseDestination, node.sourcePosition);

        // True destination
        this.builder.hirFunction.addBasicBlock(trueDestination);
        let trueBuildPass = new AnalysisAndBuildPass(this.builder.copyWithBasicBlock(trueDestination));
        let trueResult : HIRValue | null = null;
        if(node.trueExpression)
            trueResult = trueBuildPass.visitDecayedNode(node.trueExpression);

        // False destination/
        this.builder.hirFunction.addBasicBlock(falseDestination);
        let falseBuildPass = new AnalysisAndBuildPass(this.builder.copyWithBasicBlock(falseDestination));
        let falseResult : HIRValue | null = null;
        if(node.falseExpression)
            falseResult = falseBuildPass.visitDecayedNode(node.falseExpression);

        // Merge
        this.builder.hirFunction.addBasicBlock(mergeDestination);
        this.builder.basicBlock = mergeDestination;

        let mergedResult = this.builder.context.coreTypes.voidValue;
        if(trueResult && falseResult) {
            let trueType = trueResult.getType();
            let falseType = falseResult.getType();
            if(!trueType.isVoidType() && trueType === falseType) {
                let phiNode = this.builder.phi(trueType, node.sourcePosition);
                trueBuildPass.builder.phiSource(phiNode, trueResult, node.sourcePosition);
                falseBuildPass.builder.phiSource(phiNode, falseResult, node.sourcePosition);
                mergedResult = phiNode;
            }

        }

        trueBuildPass.builder.branch(mergeDestination, node.sourcePosition);
        falseBuildPass.builder.branch(mergeDestination, node.sourcePosition);

        return mergedResult;
    }

    visitSwitchSelectionNode(node: parseTree.ParseTreeSwitchSelectionNode): any {
        throw new Error('visitSwitchSelectionNode')
    }
    visitReturnNode(node: parseTree.ParseTreeReturnNode): any {
        let returnType = this.builder.environment.lookReturnTypeRecursively();
        let resultValue = this.visitNodeWithExpectedType(node.valueExpression, returnType);
        this.builder.returnValue(resultValue, node.sourcePosition);
        return this.builder.context.coreTypes.controlFlowEscapeType;
    }
    
    visitWhileDoNode(node: parseTree.ParseTreeWhileDoNode): any {
        let loopHeader = new HIRBasicBlock(this.builder.context.coreTypes.basicBlockType, "loopHeader", node.sourcePosition)
        let loopBody = new HIRBasicBlock(this.builder.context.coreTypes.basicBlockType, "loopBody", node.sourcePosition)
        let loopContinueWith = new HIRBasicBlock(this.builder.context.coreTypes.basicBlockType, "loopContinueWith", node.sourcePosition)
        let loopMerge = new HIRBasicBlock(this.builder.context.coreTypes.basicBlockType, "loopMerge", node.sourcePosition)

        // Loop header.
        this.builder.branch(loopHeader, node.sourcePosition);
        this.builder.basicBlock = loopHeader;
        this.builder.hirFunction.addBasicBlock(loopHeader);

        let conditionValue = this.visitBooleanCondition(node.condition);
        this.builder.conditionalBranch(conditionValue, loopBody, loopMerge, node.sourcePosition);

        // Loop body.
        this.builder.basicBlock = loopBody;
        this.builder.hirFunction.addBasicBlock(loopBody);

        if(node.bodyExpression)
            this.visitNode(node.bodyExpression);

        if(!this.builder.isLastTerminator())
            this.builder.branch(loopContinueWith, node.sourcePosition);

        // Loop continue with
        this.builder.basicBlock = loopContinueWith;
        this.builder.hirFunction.addBasicBlock(loopContinueWith);

        if(node.continueExpression)
            this.visitNode(node.continueExpression);

        if(!this.builder.isLastTerminator())
            this.builder.branch(loopHeader, node.sourcePosition);

        // Loop merge.
        this.builder.basicBlock = loopMerge;
        this.builder.hirFunction.addBasicBlock(loopMerge);
        return this.builder.context.coreTypes.voidValue;
    }

    visitDoWhileNode(node: parseTree.ParseTreeDoWhileNode): any {
        let loopHeader = new HIRBasicBlock(this.builder.context.coreTypes.basicBlockType, "loopHeader", node.sourcePosition)
        let loopContinueWith = new HIRBasicBlock(this.builder.context.coreTypes.basicBlockType, "loopContinueWith", node.sourcePosition)
        let loopCondition = new HIRBasicBlock(this.builder.context.coreTypes.basicBlockType, "loopCondition", node.sourcePosition)
        let loopMerge = new HIRBasicBlock(this.builder.context.coreTypes.basicBlockType, "loopMerge", node.sourcePosition)

        this.builder.branch(loopHeader, node.sourcePosition);

        // Loop header
        this.builder.basicBlock = loopHeader;
        this.builder.hirFunction.addBasicBlock(loopHeader);

        if(node.bodyExpression)
            this.visitNode(node.bodyExpression);

        if(!this.builder.isLastTerminator())
            this.builder.branch(loopContinueWith, node.sourcePosition)

        // Loop continue with.
        this.builder.basicBlock = loopContinueWith;
        this.builder.hirFunction.addBasicBlock(loopContinueWith);

        if(node.continueExpression)
            this.visitNode(node.continueExpression);

        if(!this.builder.isLastTerminator())
            this.builder.branch(loopCondition, node.sourcePosition);

        // Loop condition
        this.builder.basicBlock = loopCondition;
        this.builder.hirFunction.addBasicBlock(loopCondition);

        let conditionValue = this.visitBooleanCondition(node.condition);
        this.builder.conditionalBranch(conditionValue, loopHeader, loopMerge, node.sourcePosition);

        // Loop merge
        this.builder.basicBlock = loopMerge;
        this.builder.hirFunction.addBasicBlock(loopMerge)

        return this.builder.context.coreTypes.voidValue;
    }

    visitEnumDefinitionNode(node: parseTree.ParseTreeEnumDefinitionNode) {
        throw new Error('TODO: visitEnumDefinitionNode')
    }
    
    visitFieldDefinitionNode(node: parseTree.ParseTreeFieldDefinitionNode) {
        throw new Error('TODO: visitFieldDefinitionNode');
    }

    visitClassDefinitionNode(node: parseTree.ParseTreeClassDefinitionNode) {
        throw new Error('TODO: visitClassDefinitionNode')
    }

}