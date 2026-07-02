import {AbstractSourcePosition, getOrMakeEmptySourcePosition} from "./source_code.js"
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

    isConstant() : boolean {
        return false
    }

    isConstantLiteralValue() : boolean {
        return false
    }

    isConstantLiteralIntegerValue() : boolean {
        return false
    }

    isConstantLiteralFloatValue() : boolean {
        return false
    }

    isConstantLiteralBooleanValue() : boolean {
        return false
    }

    isConstantLiteralCharacterValue() : boolean {
        return false
    }

    isConstantLiteralStringValue() : boolean {
        return false
    }

    isConstantLiteralSymbolValue() : boolean {
        return false
    }

    isConstantLiteralVoidValue() : boolean {
        return false
    }

    isConstantLiteralNilValue() : boolean {
        return false
    }

    isConstantLiteralParseTree() : boolean {
        return false
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

    getType(): HIRType {
        return this.coreTypes.getUniverseAtLevel(0);
    }

    isType(): boolean {
        return true;
    }
}

export class HIRNominalType extends HIRType {
    name: string | null;

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

    isConstantLiteralCharacterValue() : boolean {
        return true
    }

    toString(): string {
        return 'constantLiteralCharacter ' + this.value;
    }
}

export class isConstantLiteralStringValue extends HIRConstantLiteralValue {
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

export class isConstantLiteralSymbolValue extends HIRConstantLiteralValue {
    value: string;

    constructor(value:string, type: HIRType, sourcePosition: AbstractSourcePosition) {
        super(type, sourcePosition);
        this.value = value;
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

    setCallArgumentsAndCaptures(argumentValues: HIRValue[], captureValues: HIRValue[]) {
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

}

export class HIREmptyEnvironment extends HIREnvironment{

}

export class HIRCoreTypes {
    pointerSize = 8;
    pointerAlignment = 8;
    coreTypeList: HIRType[] = [];
    coreValueList: [string, HIRValue][] = [];
    universeLevels: Record<number, HIRUniverseType> = {};

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

    voidValue: HIRConstantLiteralVoidValue = new HIRConstantLiteralVoidValue(this.voidType, getOrMakeEmptySourcePosition());
    falseValue: HIRConstantLiteralBooleanValue = new HIRConstantLiteralBooleanValue(false, this.boolean8Type, getOrMakeEmptySourcePosition());
    trueValue: HIRConstantLiteralBooleanValue = new HIRConstantLiteralBooleanValue(true, this.boolean8Type, getOrMakeEmptySourcePosition());
    nilValue: HIRConstantLiteralVoidValue = new HIRConstantLiteralNilValue(this.undefinedType, getOrMakeEmptySourcePosition());
    
    constructor() {
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

        this.coreValueList.push(['void',  this.voidValue]);
        this.coreValueList.push(['false', this.falseValue]);
        this.coreValueList.push(['true',  this.trueValue]);
        this.coreValueList.push(['nil',   this.nilValue]);
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

    addSymbolWithBinding(symbol: string, binding: HIRValue) {
        this.children.push(binding);
        this.publicSymbolTable[symbol] = binding;
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
}