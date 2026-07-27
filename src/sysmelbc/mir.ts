import {AbstractSourcePosition, getOrMakeEmptySourcePosition} from "./source_code.js"
import * as hir from "./hir.js"
import * as assert from 'assert'

export enum MirOpcode
{
    Nop,
    
    // Function arguments
    ArgumentInt32, ArgumentInt64, ArgumentPointer, ArgumentGCPointer, ArgumentFloat32, ArgumentFloat64,

    // Function callouts
    BeginCall,
    CallArgumentInt32, CallArgumentInt64, CallArgumentPointer, CallArgumentGCPointer, CallArgumentFloat32, CallArgumentFloat64,
    CallInt32Result, CallInt64Result, CallPointerResult, CallGCPointerResult, CallVoidResult, CallFloat32Result, CallFloat64Result,

    // Memory allocation
    GCAllocate,

    // Load and store
    LoadUInt8, LoadUInt16, LoadUInt32, LoadUInt64,
    LoadInt8, LoadInt16, LoadInt32, LoadInt64,
    LoadPointer, LoadGCPointer, LoadFloat32, LoadFloat64,

    StoreInt8, StoreInt16, StoreInt32, StoreInt64,
    StorePointer, StoreGCPointer, StoreFloat32, StoreFloat64,

    // Phi
    PhiInt32, PhiInt64, PhiPointer, PhiGCPointer, PhiFloat32, PhiFloat64,
    
    PhiSourceInt32, PhiSourceInt64, PhiSourcePointer, PhiSourceGCPointer, PhiSourceFloat32, PhiSourceFloat64,

    // Branches
    Jump, JumpIfTrue, JumpIfFalse,

    // Arithmetic
    Int32Neg, Int64Neg,
    Int32Add, Int64Add,
    Int32Sub, Int64Sub,
    Int32Mul, Int64Mul,
    Int32SDiv, Int64SDiv,
    Int32UDiv, Int64UDiv,
    Int32SMod, Int64SMod,
    Int32UMod, Int64UMod,

    // Bitwise
    Int32BitNot, Int64BitNot,
    Int32BitAnd, Int64BitAnd,
    Int32BitOr , Int64BitOr,
    Int32BitXor, Int64BitXor,
    Int32ShiftLeft, Int64ShiftLeft,
    Int32LShiftRight, Int64LShiftRight,
    Int32AShiftRight, Int64AShiftRight,


    // Comparisons
    Int32Equals, Int64Equals, PointerEquals,
    Int32NotEquals, Int64NotEquals, PointerNotEquals,

    Int32LessThan, UInt32LessThan, Int64LessThan, UInt64LessThan,
    Int32LessOrEquals, UInt32LessOrEquals, Int64LessOrEquals, UInt64LessOrEquals,
    Int32GreaterThan, UInt32GreaterThan, Int64GreaterThan, UInt64GreaterThan,
    Int32GreaterOrEqual, UInt32GreaterOrEqual, Int64GreaterOrEqual, UInt64GreaterOrEqual,

    // Floating point arithmetic
    Float32Neg,  Float64Neg,
    Float32Add,  Float64Add,
    Float32Sub,  Float64Sub,
    Float32Mul,  Float64Mul,
    Float32Div,  Float64Div,
    Float32Sqrt, Float64Sqrt,

    // Pointer arithmetic
    PointerAddConstantOffset,

    // Constants
    ConstInt32, ConstInt64, ConstPointer, ConstFloat32, ConstFloat64,
    ConstGCPointer, ConstInteger, ConstCharacter, ConstFloat, ConstVoid,

    // Returns
    ReturnInt32, ReturnInt64, ReturnPointer, ReturnFloat32, ReturnFloat64,
    ReturnGCPointer, ReturnVoid,
}

export abstract class MirVisitor {
    abstract visitPackage(mirPackage: MirPackage): any;
    abstract visitImportedFunction(importedFunction: MirImportedFunction): any;
    abstract visitFunction(mirFunction: MirFunction): any;
    abstract visitTemporary(temporary: MirTemporary): any;
    abstract visitBasicBlock(basicBlock: MirBasicBlock): any;
    abstract visitInstruction(instruction: MirInstruction): any;
    
}

export class MirContext {
    pointerSize: number;
    pointerAlignment: number;
    gcPointerSize: number;
    gcPointerAlignment: number;

    typeNameMap: Record<string, MirType> = {}

    basicBlockType: MirType;
    gcPointerType: MirType;
    pointerType: MirType;
    voidType: MirType;

    boolean8Type: MirType;
    int8Type: MirType;
    int16Type: MirType;
    int32Type: MirType;
    int64Type: MirType;
    uint8Type: MirType;
    uint16Type: MirType;
    uint32Type: MirType;
    uint64Type: MirType;
    float32Type: MirType;
    float64Type: MirType;
    
    sizeType: MirType;
    uintPointerType: MirType;
    intPointerType: MirType;

    constructor(pointerSize: number) {
        this.pointerSize = pointerSize;
        this.pointerAlignment = pointerSize;

        this.gcPointerSize = pointerSize;
        this.gcPointerAlignment = pointerSize;

        this.basicBlockType = this.addNamedType(new MirBasicBlockType(this, 'BasicBlock', this.pointerSize, this.pointerAlignment))
        this.gcPointerType  = this.addNamedType(new MirGCPointerType(this, 'GCPointer', this.gcPointerSize, this.gcPointerAlignment))
        this.pointerType    = this.addNamedType(new MirPointerType(this, 'Pointer', this.pointerSize, this.pointerAlignment))
        this.voidType       = this.addNamedType(new MirVoidType(this, 'Void', 0, 1))

        this.boolean8Type   = this.addNamedType(new MirBoolean8Type(this, 'Boolean8', 1, 1))
        this.int8Type       = this.addNamedType(new MirInt8Type(this, 'Int8', 1, 1))
        this.int16Type      = this.addNamedType(new MirInt16Type(this, 'Int16', 2, 2))
        this.int32Type      = this.addNamedType(new MirInt32Type(this, 'Int32', 4, 4))
        this.int64Type      = this.addNamedType(new MirInt64Type(this, 'Int64', 8, 8))
        this.uint8Type      = this.addNamedType(new MirUInt8Type(this, 'UInt8', 1, 1))
        this.uint16Type     = this.addNamedType(new MirUInt16Type(this, 'UInt16', 2, 2))
        this.uint32Type     = this.addNamedType(new MirUInt32Type(this, 'UInt32', 4, 4))
        this.uint64Type     = this.addNamedType(new MirUInt64Type(this, 'UInt64', 8, 8))
        this.float32Type    = this.addNamedType(new MirFloat32Type(this, 'Float32', 4, 4))
        this.float64Type    = this.addNamedType(new MirFloat64Type(this, 'Float64', 8, 8))

        if(pointerSize === 4) {
            this.sizeType = this.uint32Type
            this.uintPointerType = this.uint32Type
            this.intPointerType = this.int32Type
        } else {
            this.sizeType = this.uint64Type
            this.uintPointerType = this.uint64Type
            this.intPointerType = this.int64Type
        }

        this.typeNameMap['Size'] = this.sizeType
        this.typeNameMap['UIntPointer'] = this.uintPointerType
        this.typeNameMap['IntPointer'] = this.intPointerType
    }

    addNamedType(type: MirType): MirType {
        this.typeNameMap[type.name] = type;
        return type;
    }
}

export abstract class MirValue {
    abstract accept(visitor: MirVisitor): any;

    abstract getSymbolName(): string;
}

export class MirPackage extends MirValue {
    context: MirContext;
    name: string;
    elementTable: MirPackageElement[] = [];
    anonSymbolCount: number = 0

    constructor(context: MirContext, name: string) {
        super();
        this.context = context;
        this.name = name;
    }

    accept(visitor: MirVisitor): any {
        return visitor.visitPackage(this);
    }

    addElement(element: MirPackageElement) {
        assert.ok(element.module === null);
        assert.ok(element.owner === null);

        this.elementTable.push(element);

        element.module = this;
        element.owner = this;
    }

    generateAnonymousSymbol() : string {
        return this.name + '__anonymous_' + this.anonSymbolCount++;
    }

    getSymbolName(): string {
        return this.name;
    }

    fullPrintString(): string {
        let result = `package ${this.name};\n`;

        for(let i = 0; i < this.elementTable.length; ++i) {
            let element = this.elementTable[i];
            if(!element)
                throw new Error('Expected a mir package element.');

            result += element.fullPrintString();
        }

        return result;
    }
}

export abstract class MirPackageElement extends MirValue {
    name: string | null;
    anonSymbolName: string | null = null;
    module: MirPackage | null = null;
    owner: MirValue | null = null;
    isExternC: boolean = false;

    constructor(name: string) {
        super();
        this.name = name;
    }

    isImportedFunction(): boolean {
        return false;
    }

    isFunction(): boolean {
        return false;
    }

    abstract fullPrintString(): string;

    getSymbolName(): string {
        if(!this.name) {
            if(!this.anonSymbolName) {
                if(!this.module)
                    throw new Error('Expected a valid module')
                this.anonSymbolName = this.module.generateAnonymousSymbol()
            }

            return this.anonSymbolName as string;
        }

        if(this.isExternC || this.name == 'SysmelMain')
            return this.name;

        if(!this.owner)
            throw new Error('Expected a valid owner')

        return this.owner.getSymbolName() + '__' + this.name;
    }
}

export class MirImportedFunction extends MirPackageElement {
    accept(visitor: MirVisitor): any {
        return visitor.visitImportedFunction(this);
    }

    isImportedFunction(): boolean {
        return true;
    }

    fullPrintString(): string {
        return `imported function ${this.getSymbolName()};\n`
    }
}

export abstract class MirGlobalConstant extends MirPackageElement {
}

export class MirFunction extends MirPackageElement {
    sourcePosition: AbstractSourcePosition = getOrMakeEmptySourcePosition();
    sourceFunction: hir.HIRFunction | null = null;
    firstBasicBlock: MirBasicBlock | null = null;
    lastBasicBlock: MirBasicBlock | null = null;
    temporaries: MirTemporary[] = []
    enumeratedInstructions: MirFunctionLocal[] | null = null;

    accept(visitor: MirVisitor): any {
        return visitor.visitFunction(this);
    }

    isFunction(): boolean {
        return true;
    }

    newTemporary(type: MirType, sourcePosition: AbstractSourcePosition, name: string | null) {
        let temporary = new MirTemporary(type, this.temporaries.length, sourcePosition, name);
        this.temporaries.push(temporary);
        return temporary;
    }
    
    addBasicBlock(basicBlock: MirBasicBlock) {
        if(this.lastBasicBlock === null) {
            this.firstBasicBlock = this.lastBasicBlock = basicBlock;
        } else {
            this.lastBasicBlock.nextBlock = basicBlock;
            basicBlock.previousBlock = this.lastBasicBlock;
            this.lastBasicBlock = basicBlock;
        }
    }

    enumerateInstructions() {
        if(this.enumeratedInstructions)
            return this.enumeratedInstructions;

        this.enumeratedInstructions = [];

        let block = this.firstBasicBlock;
        while(block) {
            block.index = this.enumeratedInstructions.length;
            this.enumeratedInstructions.push(block);

            let instruction = block.firstInstruction;
            while(instruction) {
                instruction.index = this.enumeratedInstructions.length;
                this.enumeratedInstructions.push(instruction);

                instruction = instruction.nextInstruction;
            }

            block = block.nextBlock;
        }

        return this.enumeratedInstructions;
    }

    evaluateWithArguments(callArguments: any[]): any {
        let instructions = this.enumerateInstructions();
        let context = new MirFunctionActivationContext(this, instructions, callArguments);
        return context.evaluate();
    }

    fullPrintString(): string {
        this.enumerateInstructions();
        let result = `function ${this.getSymbolName()} {\n`;

        // Temporaries
        {
            for(let i = 0; i < this.temporaries.length; ++i) {
                let temp = this.temporaries[i];
                if(!temp)
                    throw new Error('Expected a temporary.');
                result += temp.fullPrintString() + '\n'
            }
        }

        // Basic blocks
        let basicBlock = this.firstBasicBlock;
        while(basicBlock) {
            result += basicBlock.fullPrintString();
            basicBlock = basicBlock.nextBlock;
        }

        result += `}\n`;
        return result
    }
}

class MirFunctionActivationContext {
    mirFunction: MirFunction;
    instructions: MirFunctionLocal[];
    callArguments: any[];
    calloutArguments: any[] = [];
    temporaries: any[];
    instructionPC: number = 0;
    pc: number = 0;
    hasReturnValue: boolean = false;
    returnValue: any = null;

    constructor(mirFunction: MirFunction, instructions: MirFunctionLocal[], callArguments: any[]) {
        this.mirFunction = mirFunction;
        this.instructions = instructions;
        this.callArguments = callArguments;

        this.temporaries = Array(mirFunction.temporaries.length).fill(null);
    }

    evaluate() {
        while (this.pc < this.instructions.length) {
            this.instructionPC = this.pc;
            ++this.pc;

            let instruction = this.instructions[this.instructionPC];
            if(!instruction)
                throw new Error('Expected an instruction');
            instruction.evaluateInContext(this);
            if(this.hasReturnValue)
                return this.returnValue;
        }
        throw new Error('Reached beyond the instruction list.')
    }

    getTempValue(temp: MirTemporary): any {
        return this.temporaries[temp.index];
    }

    setTempValue(temp: MirTemporary, value: any): any {
        this.temporaries[temp.index] = value;
    }

    setReturnValue(value: any): void {
        this.returnValue = value;
        this.hasReturnValue = true;
    }

    getArgumentValue(index: number): any {
        return this.callArguments[index];
    }

    beginCall(): void {
        this.calloutArguments = []
    }

    addCallArgument(argument: any) {
        this.calloutArguments.push(argument);
    }
};

/*
class MirFunctionActivationContext:

    def getTempOrConstantValue(self, tempOrConstant):
        if tempOrConstant.isTemporary():
            return self.getTempValue(tempOrConstant)
        return tempOrConstant

*/

export class MirTemporary extends MirValue {
    type: MirType;
    index: number;
    sourcePosition: AbstractSourcePosition;
    name: string | null;

    constructor(type: MirType, index: number, sourcePosition: AbstractSourcePosition, name: string | null) {
        super();
        this.type = type;
        this.index = index
        this.sourcePosition = sourcePosition;
        this.name = name;
    }

    accept(visitor: MirVisitor) {
        return visitor.visitTemporary(this);
    }

    getSymbolName(): string {
        throw new Error('Temporary does not have a symbol name')
    }

    toString(): string {
        if(this.name)
            return `temp ${this.name}|${this.index.toString()}`

        return `temp ${this.index.toString()}`
    }

    fullPrintString(): string {
        return `${this.toString()} type: ${this.type.toString()}`
    }

}

export abstract class MirFunctionLocal extends MirValue {
    index: number = -1;
    sourcePosition: AbstractSourcePosition;
    name: string | null;

    constructor(sourcePosition: AbstractSourcePosition, name: string | null) {
        super();
        this.sourcePosition = sourcePosition;
        this.name = name;
    }

    abstract evaluateInContext(context: MirFunctionActivationContext): void;

    getSymbolName(): string {
        throw new Error('Function local value does not have a symbol name')
    }

    toString(): string {
        if(this.name)
            return `${this.name}|${this.index.toString()}`

        return `${this.index.toString()}`
    }
}

export class MirBasicBlock extends MirFunctionLocal {
    previousBlock: MirBasicBlock | null = null;
    nextBlock: MirBasicBlock | null = null;
    firstInstruction: MirInstruction | null = null;
    lastInstruction: MirInstruction | null = null;

    constructor(sourcePosition: AbstractSourcePosition, name: string | null) {
        super(sourcePosition, name);
    }

    accept(visitor: MirVisitor) {
        return visitor.visitBasicBlock(this);
    }

    evaluateInContext(context: MirFunctionActivationContext) {
        // Nothing is required here.
    }

    addInstruction(instruction: MirInstruction) : void {
        if(this.lastInstruction === null) {
            this.firstInstruction = this.lastInstruction = instruction;
        } else {
            instruction.previousInstruction = this.lastInstruction;
            this.lastInstruction.nextInstruction = instruction;
            this.lastInstruction = instruction;
        }
    }

    fullPrintString(): string {
        let result = this.toString() + ':\n';
        let instruction = this.firstInstruction;
        while(instruction) {
            result += '    ';
            result += instruction.fullPrintString()
            result += '\n';
            instruction = instruction.nextInstruction;
        }
        return result;
    }

}

export class MirInstruction extends MirFunctionLocal {
    result: MirValue | null;
    opcode: MirOpcode;
    firstArgument: MirValue | null;
    secondArgument: MirValue | null;

    previousInstruction: MirInstruction | null = null;
    nextInstruction: MirInstruction | null = null;

    constructor(result: MirValue | null, opcode: MirOpcode, firstArgument: MirValue | null, secondArgument: MirValue | null,
                sourcePosition: AbstractSourcePosition, name: string | null) {
        super(sourcePosition, name);
        this.result = result;
        this.opcode = opcode;
        this.firstArgument = firstArgument;
        this.secondArgument = secondArgument;
    }

    accept(visitor: MirVisitor) {
        return visitor.visitInstruction(this);
    }

    fullPrintString(): string {
        let result = '';
        if(this.result) {
            result += this.result.toString();
            result += ' := ';
        }

        result += MirOpcode[this.opcode];

        return result;
    }

    evaluateInContext(context: MirFunctionActivationContext): void {
        switch(this.opcode) {
        case MirOpcode.ReturnVoid:
            context.setReturnValue(null);
            break
        default:
            throw new Error(`Unsupported instruction opcode ${MirOpcode[this.opcode]}`)
        }
    }

}

export class MirType {
    context: MirContext;
    name: string;
    valueSize: number;
    valueAlignment: number;

    constructor(context: MirContext, name: string, valueSize: number, valueAlignment: number) {
        this.context = context;
        this.name = name;
        this.valueSize = valueSize;
        this.valueAlignment = valueAlignment;
    }

    isVoidType(): boolean {
        return false;
    }

    isBasicBlockType(): boolean {
        return false;
    }

    isClosureType(): boolean {
        return false;
    }

    isFunctionType(): boolean {
        return false;
    }

    isGCPointerType(): boolean {
        return false;
    }

    isPointerType(): boolean {
        return false;
    }

    isBoolean8Type(): boolean {
        return false;
    }

    isInt8Type(): boolean {
        return false;
    }

    isInt16Type(): boolean {
        return false;
    }

    isInt32Type(): boolean {
        return false;
    }

    isInt64Type(): boolean {
        return false;
    }

    isUInt8Type(): boolean {
        return false;
    }

    isUInt16Type(): boolean {
        return false;
    }

    isUInt32Type(): boolean {
        return false;
    }

    isUInt64Type(): boolean {
        return false;
    }

    isFloat32Type(): boolean {
        return false;
    }

    isFloat64Type(): boolean {
        return false;
    }

};

export class MirVoidType extends MirType {
    isVoidType(): boolean {
        return true;
    }
}

export class MirBasicBlockType extends MirType {
    isBasicBlockType(): boolean {
        return true;
    }
}

export class MirFunctionType extends MirType {
    isFunctionType(): boolean {
        return true;
    }
}

export class MirClosureType extends MirType {
    isClosureType(): boolean {
        return true;
    }
}

export class MirGCPointerType extends MirType {
    isGCPointerType(): boolean {
        return true;
    }
}

export class MirPointerType extends MirType {
    isPointerType(): boolean {
        return true;
    }
}

export class MirBoolean8Type extends MirType {
    isBoolean8Type(): boolean {
        return true;
    }
}

export class MirInt8Type extends MirType {
    isInt8Type(): boolean {
        return true;
    }
}

export class MirInt16Type extends MirType {
    isInt16Type(): boolean {
        return true;
    }
}

export class MirInt32Type extends MirType {
    isInt32Type(): boolean {
        return true;
    }
}

export class MirInt64Type extends MirType {
    isInt64Type(): boolean {
        return true;
    }
}

export class MirUInt8Type extends MirType {
    isUInt8Type(): boolean {
        return true;
    }
}

export class MirUInt16Type extends MirType {
    isUInt16Type(): boolean {
        return true;
    }
}

export class MirUInt32Type extends MirType {
    isUInt32Type(): boolean {
        return true;
    }
}

export class MirUInt64Type extends MirType {
    isUInt64Type(): boolean {
        return true;
    }
}

export class MirFloat32Type extends MirType {
    isFloat32Type(): boolean {
        return true;
    }
}

export class MirFloat64Type extends MirType {
    isFloat64Type(): boolean {
        return true;
    }
}

export class MirBuilder {
    mirFunction: MirFunction;
    basicBlock: MirBasicBlock;

    constructor(mirFunction: MirFunction, basicBlock: MirBasicBlock) {
        this.mirFunction = mirFunction;
        this.basicBlock = basicBlock;
    }

    addInstruction(instruction: MirInstruction) : MirInstruction {
        this.basicBlock.addInstruction(instruction);
        return instruction;
    }

    returnVoidAt(sourcePosition: AbstractSourcePosition) : MirInstruction {
        let instruction = new MirInstruction(null, MirOpcode.ReturnVoid, null, null, sourcePosition, null);
        this.addInstruction(instruction);
        return instruction;
    }
}