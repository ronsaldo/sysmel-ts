import {AbstractSourcePosition, getOrMakeEmptySourcePosition} from "./source_code.js"
import * as hir from "./hir.js"
import * as assert from 'assert'

export enum MirOpcode
{
    Nop,
    
    // Function arguments
    ArgumentBoolean8, ArgumentInt32, ArgumentInt64, ArgumentPointer, ArgumentGCPointer, ArgumentFloat32, ArgumentFloat64,

    // Function callouts
    BeginCall,
    CallArgumentBoolean8, CallArgumentInt32, CallArgumentInt64, CallArgumentPointer, CallArgumentGCPointer, CallArgumentFloat32, CallArgumentFloat64,
    CallBoolean8Result, CallInt32Result, CallInt64Result, CallPointerResult, CallGCPointerResult, CallVoidResult, CallFloat32Result, CallFloat64Result,

    // Memory allocation
    GCAllocate,

    // Load and store
    LoadUInt8, LoadUInt16, LoadUInt32, LoadUInt64,
    LoadInt8, LoadInt16, LoadInt32, LoadInt64,
    LoadPointer, LoadGCPointer, LoadFloat32, LoadFloat64,

    StoreInt8, StoreInt16, StoreInt32, StoreInt64,
    StorePointer, StoreGCPointer, StoreFloat32, StoreFloat64,

    // Phi
    PhiBoolean8, PhiInt32, PhiInt64, PhiPointer, PhiGCPointer, PhiFloat32, PhiFloat64,
    
    PhiSourceBoolean8, PhiSourceInt32, PhiSourceInt64, PhiSourcePointer, PhiSourceGCPointer, PhiSourceFloat32, PhiSourceFloat64,

    // Branches
    Jump, JumpIfTrue, JumpIfFalse,

    // Logical
    Boolean8Not,

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
    ConstBoolean8, ConstInt32, ConstInt64, ConstPointer, ConstFloat32, ConstFloat64,
    ConstGCPointer, ConstBoolean, ConstInteger, ConstCharacter, ConstFloat, ConstVoid,

    // Returns
    ReturnBoolean8, ReturnInt32, ReturnInt64, ReturnPointer, ReturnFloat32, ReturnFloat64,
    ReturnGCPointer, ReturnVoid,
}

export abstract class MirVisitor {
    abstract visitPackage(mirPackage: MirPackage): any;
    abstract visitImportedFunction(importedFunction: MirImportedFunction): any;
    abstract visitFunction(mirFunction: MirFunction): any;
    abstract visitTemporary(temporary: MirTemporary): any;
    abstract visitBasicBlock(basicBlock: MirBasicBlock): any;
    abstract visitInstruction(instruction: MirInstruction): any;
    abstract visitBooleanConstantValue(instruction: MirBooleanConstantValue): any;
    abstract visitIntegerConstantValue(instruction: MirIntegerConstantValue): any;
    abstract visitFloatConstantValue(instruction: MirFloatConstantValue): any;
    abstract visitVoidConstantValue(instruction: MirVoidConstantValue): any;
    abstract visitNilConstantValue(instruction: MirNilConstantValue): any;
    abstract visitStringConstantValue(instruction: MirStringConstantValue): any;
    abstract visitSymbolConstantValue(instruction: MirSymbolConstantValue): any;

    abstract visitVoidType(type: MirVoidType): any;
    abstract visitBasicBlockType(type: MirBasicBlockType): any;
    abstract visitFunctionType(type: MirFunctionType): any;
    abstract visitClosureType(type: MirClosureType): any;
    abstract visitGCPointerType(type: MirGCPointerType): any;
    abstract visitPointerType(type: MirPointerType): any;

    abstract visitBoolean8Type(type: MirBoolean8Type): any;
    abstract visitInt8Type(type:  MirInt8Type): any;
    abstract visitInt16Type(type: MirInt16Type): any;
    abstract visitInt32Type(type: MirInt32Type): any;
    abstract visitInt64Type(type: MirInt64Type): any;

    abstract visitUInt8Type(type:  MirUInt8Type): any;
    abstract visitUInt16Type(type: MirUInt16Type): any;
    abstract visitUInt32Type(type: MirUInt32Type): any;
    abstract visitUInt64Type(type: MirUInt64Type): any;

    abstract visitFloat32Type(type: MirFloat32Type): any;
    abstract visitFloat64Type(type: MirFloat64Type): any;

}

export class MirContext {
    pointerSize: number;
    pointerAlignment: number;
    gcPointerSize: number;
    gcPointerAlignment: number;

    typeNameMap: Record<string, MirType> = {};
    primitiveTranslatorMap: Record<string, (hir2mir: any, callInstruction: hir.HIRCallInstruction) => MirValue> = {};

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

        this.addPrimitiveTranslators();
    }

    addNamedType(type: MirType): MirType {
        this.typeNameMap[type.name] = type;
        return type;
    }
    
    addPrimitiveTranslators(): void {
        this.addBoolean8Primitives();
        this.addInt32Primitives();
        this.addUInt32Primitives();
        this.addCalloutPrimitives()
    }

    addBoolean8Primitives(): void {
        this.primitiveTranslatorMap['Boolean8::not'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, operand: MirTemporary) => {
            return builder.boolean8NotAt(operand, sourcePosition);
        });
    }

    addInt32Primitives(): void {
        // Unary
        this.primitiveTranslatorMap['Int32::negated'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, operand: MirTemporary) => {
            return builder.int32NegAt(operand, sourcePosition)
        });
        this.primitiveTranslatorMap['Int32::bitInvert'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, operand: MirTemporary) => {
            return builder.int32BitNotAt(operand, sourcePosition)
        });

        // Arithmetic
        this.primitiveTranslatorMap['Int32::+'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32AddAt(left, right, sourcePosition);
        });
        this.primitiveTranslatorMap['Int32::-'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32SubAt(left, right, sourcePosition);
        });
        this.primitiveTranslatorMap['Int32::*'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32MulAt(left, right, sourcePosition);
        });
        this.primitiveTranslatorMap['Int32:://'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32SDivAt(left, right, sourcePosition);
        });
        this.primitiveTranslatorMap['Int32::%'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32SModAt(left, right, sourcePosition);
        });

        // Bitwise and logical
        this.primitiveTranslatorMap['Int32::&'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32BitAndAt(left, right, sourcePosition);
        });
        this.primitiveTranslatorMap['Int32::|'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32BitOrAt(left, right, sourcePosition);
        });
        this.primitiveTranslatorMap['Int32::^'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32BitXorAt(left, right, sourcePosition);
        });
        this.primitiveTranslatorMap['Int32::<<'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32ShiftLeftAt(left, right, sourcePosition);
        });
        this.primitiveTranslatorMap['Int32::>>'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32AShiftRightAt(left, right, sourcePosition);
        });
        
        // Comparisons
        this.primitiveTranslatorMap['Int32::='] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32EqualsAt(left, right, sourcePosition);
        });
        this.primitiveTranslatorMap['Int32::~'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32NotEqualsAt(left, right, sourcePosition);
        });
        this.primitiveTranslatorMap['Int32::<'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32LessThanAt(left, right, sourcePosition);
        });
        this.primitiveTranslatorMap['Int32::<=)'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32LessOrEqualsAt(left, right, sourcePosition);
        });
        this.primitiveTranslatorMap['Int32::>'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32GreaterThanAt(left, right, sourcePosition);
        });
        this.primitiveTranslatorMap['Int32::>=)'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32GreaterOrEqualsAt(left, right, sourcePosition);
        });
    }

    addUInt32Primitives(): void {
        // Unary
        this.primitiveTranslatorMap['UInt32::negated'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, operand: MirTemporary) => {
            return builder.int32NegAt(operand, sourcePosition)
        });
        this.primitiveTranslatorMap['UInt32::bitInvert'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, operand: MirTemporary) => {
            return builder.int32BitNotAt(operand, sourcePosition)
        });

        // Arithmetic
        this.primitiveTranslatorMap['UInt32::+'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32AddAt(left, right, sourcePosition);
        });
        this.primitiveTranslatorMap['UInt32::-'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32SubAt(left, right, sourcePosition);
        });
        this.primitiveTranslatorMap['UInt32::*'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32MulAt(left, right, sourcePosition);
        });
        this.primitiveTranslatorMap['UInt32:://'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32UDivAt(left, right, sourcePosition);
        });
        this.primitiveTranslatorMap['UInt32::%'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32UModAt(left, right, sourcePosition);
        });

        // Bitwise and logical
        this.primitiveTranslatorMap['UInt32::&'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32BitAndAt(left, right, sourcePosition);
        });
        this.primitiveTranslatorMap['UInt32::|'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32BitOrAt(left, right, sourcePosition);
        });
        this.primitiveTranslatorMap['UInt32::^'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32BitXorAt(left, right, sourcePosition);
        });
        this.primitiveTranslatorMap['UInt32::<<'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32ShiftLeftAt(left, right, sourcePosition);
        });
        this.primitiveTranslatorMap['UInt32::>>'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32LShiftRightAt(left, right, sourcePosition);
        });
        
        // Comparisons
        this.primitiveTranslatorMap['UInt32::='] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32EqualsAt(left, right, sourcePosition);
        });
        this.primitiveTranslatorMap['UInt32::~'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.int32NotEqualsAt(left, right, sourcePosition);
        });
        this.primitiveTranslatorMap['UInt32::<'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.uint32LessThanAt(left, right, sourcePosition);
        });
        this.primitiveTranslatorMap['UInt32::<=)'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.uint32LessOrEqualsAt(left, right, sourcePosition);
        });
        this.primitiveTranslatorMap['UInt32::>'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.uint32GreaterThanAt(left, right, sourcePosition);
        });
        this.primitiveTranslatorMap['UInt32::>=)'] = this.makeBuilderTranslator((builder: MirBuilder, sourcePosition: AbstractSourcePosition, left: MirTemporary, right: MirTemporary) => {
            return builder.uint32GreaterOrEqualsAt(left, right, sourcePosition);
        });
    }

    addCalloutPrimitives(): void {
        // IO
        this.addCalloutPrimitive('IO::print', '__sysmel_io_print', (x: any) => process.stdout.write(x.toString()));
        this.addCalloutPrimitive('IO::printLine', '__sysmel_io_printLine', (x: any) => console.log(x.toString()));
        this.addCalloutPrimitive('IO::write', '__sysmel_io_write', (x: string) => process.stdout.write(x));
        this.addCalloutPrimitive('IO::writeLine', '__sysmel_io_writeLine', (x: string) => console.log(x));

        // Characters
        this.addCalloutPrimitive('Character::negated', '__sysmel_character_negated', (x: number) => -x);
        this.addCalloutPrimitive('Character::bitInvert', '__sysmel_character_bitInvert', (x: number) => 1 - x);

        this.addCalloutPrimitive('Character::+', '__sysmel_character_add', (x: number, y: number) => x + y);
        this.addCalloutPrimitive('Character::-', '__sysmel_character_sub', (x: number, y: number) => x - y);
        this.addCalloutPrimitive('Character::*', '__sysmel_character_mul', (x: number, y: number) => x * y);
        this.addCalloutPrimitive('Character:://', '__sysmel_character_div', (x: number, y: number) => Math.trunc(x / y));
        this.addCalloutPrimitive('Character::%', '__sysmel_character_mod', (x: number, y: number) => x % y);

        this.addCalloutPrimitive('Character::&', '__sysmel_character_and', (x: number, y: number) => x & y);
        this.addCalloutPrimitive('Character::|', '__sysmel_character_or', (x: number, y: number) => x | y);
        this.addCalloutPrimitive('Character::^', '__sysmel_character_xor', (x: number, y: number) => x ^ y);
        this.addCalloutPrimitive('Character::<<', '__sysmel_character_shiftLeft', (x: number, y: number) => x << y);
        this.addCalloutPrimitive('Character::>>', '__sysmel_character_shiftRight', (x: number, y: number) => x >> y);

        this.addCalloutPrimitive('Character::=', '__sysmel_character_equals', (x: number, y: number) => x === y);
        this.addCalloutPrimitive('Character::~=', '__sysmel_character_notEquals', (x: number, y: number) => x !== y);
        //this.addCalloutPrimitive('Character::hash', '__sysmel_character_hash', (x: number, y: number) => hash);

        this.addCalloutPrimitive('Character::<',  '__sysmel_character_lessThan', (x: number, y: number) => x < y);
        this.addCalloutPrimitive('Character::<=', '__sysmel_character_lessOrEquals', (x: number, y: number) => x <= y);
        this.addCalloutPrimitive('Character::>',  '__sysmel_character_greaterThan', (x: number, y: number) => x > y);
        this.addCalloutPrimitive('Character::>=', '__sysmel_character_greaterOrEquals', (x: number, y: number) => x >= y);

        this.addCalloutPrimitive('Character::asInt8',  '__sysmel_character_asInt8',  (x: number) => x);
        this.addCalloutPrimitive('Character::asInt16', '__sysmel_character_asInt16', (x: number) => x);
        this.addCalloutPrimitive('Character::asInt32', '__sysmel_character_asInt32', (x: number) => x);
        this.addCalloutPrimitive('Character::asInt64', '__sysmel_character_asInt64', (x: number) => x);
        
        this.addCalloutPrimitive('Character::asUInt8',  '__sysmel_character_asUInt8',  (x: number) => x);
        this.addCalloutPrimitive('Character::asUInt16', '__sysmel_character_asUInt16', (x: number) => x);
        this.addCalloutPrimitive('Character::asUInt32', '__sysmel_character_asUInt32', (x: number) => x);
        this.addCalloutPrimitive('Character::asUInt64', '__sysmel_character_asUInt64', (x: number) => x);

        this.addCalloutPrimitive('Character::asChar8',  '__sysmel_character_asChar8',  (x: number) => x);
        this.addCalloutPrimitive('Character::asChar16', '__sysmel_character_asChar16', (x: number) => x);
        this.addCalloutPrimitive('Character::asChar32', '__sysmel_character_asChar32', (x: number) => x);

        // Integers
        this.addCalloutPrimitive('Integer::negated', '__sysmel_integer_negated', (x: number) => -x);
        this.addCalloutPrimitive('Integer::bitInvert', '__sysmel_integer_bitInvert', (x: number) => 1 - x);

        this.addCalloutPrimitive('Integer::+', '__sysmel_integer_add', (x: number, y: number) => x + y);
        this.addCalloutPrimitive('Integer::-', '__sysmel_integer_sub', (x: number, y: number) => x - y);
        this.addCalloutPrimitive('Integer::*', '__sysmel_integer_mul', (x: number, y: number) => x * y);
        this.addCalloutPrimitive('Integer:://', '__sysmel_integer_div', (x: number, y: number) => Math.trunc(x / y));
        this.addCalloutPrimitive('Integer::%', '__sysmel_integer_mod', (x: number, y: number) => x % y);

        this.addCalloutPrimitive('Integer::&', '__sysmel_integer_and', (x: number, y: number) => x & y);
        this.addCalloutPrimitive('Integer::|', '__sysmel_integer_or', (x: number, y: number) => x | y);
        this.addCalloutPrimitive('Integer::^', '__sysmel_integer_xor', (x: number, y: number) => x ^ y);
        this.addCalloutPrimitive('Integer::<<', '__sysmel_integer_shiftLeft', (x: number, y: number) => x << y);
        this.addCalloutPrimitive('Integer::>>', '__sysmel_integer_shiftRight', (x: number, y: number) => x >> y);

        this.addCalloutPrimitive('Integer::=', '__sysmel_integer_equals', (x: number, y: number) => x === y);
        this.addCalloutPrimitive('Integer::~=', '__sysmel_integer_notEquals', (x: number, y: number) => x !== y);
        //this.addCalloutPrimitive('Integer::hash', '__sysmel_integer_hash', (x: number, y: number) => hash);

        this.addCalloutPrimitive('Integer::<',  '__sysmel_integer_lessThan', (x: number, y: number) => x < y);
        this.addCalloutPrimitive('Integer::<=', '__sysmel_integer_lessOrEquals', (x: number, y: number) => x <= y);
        this.addCalloutPrimitive('Integer::>',  '__sysmel_integer_greaterThan', (x: number, y: number) => x > y);
        this.addCalloutPrimitive('Integer::>=', '__sysmel_integer_greaterOrEquals', (x: number, y: number) => x >= y);

        this.addCalloutPrimitive('Integer::asInt8',  '__sysmel_integer_asInt8',  (x: number) => x);
        this.addCalloutPrimitive('Integer::asInt16', '__sysmel_integer_asInt16', (x: number) => x);
        this.addCalloutPrimitive('Integer::asInt32', '__sysmel_integer_asInt32', (x: number) => x);
        this.addCalloutPrimitive('Integer::asInt64', '__sysmel_integer_asInt64', (x: number) => x);
        
        this.addCalloutPrimitive('Integer::asUInt8',  '__sysmel_integer_asUInt8',  (x: number) => x);
        this.addCalloutPrimitive('Integer::asUInt16', '__sysmel_integer_asUInt16', (x: number) => x);
        this.addCalloutPrimitive('Integer::asUInt32', '__sysmel_integer_asUInt32', (x: number) => x);
        this.addCalloutPrimitive('Integer::asUInt64', '__sysmel_integer_asUInt64', (x: number) => x);

        this.addCalloutPrimitive('Integer::asChar8',  '__sysmel_integer_asChar8',  (x: number) => x);
        this.addCalloutPrimitive('Integer::asChar16', '__sysmel_integer_asChar16', (x: number) => x);
        this.addCalloutPrimitive('Integer::asChar32', '__sysmel_integer_asChar32', (x: number) => x);

        // Float
        this.addCalloutPrimitive('Float::negated', '__sysmel_float_negated', (x: number) => -x);
        this.addCalloutPrimitive('Float::sqrt', '__sysmel_float_sqrt', (x: number) => Math.sqrt(x));

        this.addCalloutPrimitive('Float::+', '__sysmel_float_add', (x: number, y: number) => x + y);
        this.addCalloutPrimitive('Float::-', '__sysmel_float_sub', (x: number, y: number) => x - y);
        this.addCalloutPrimitive('Float::*', '__sysmel_float_mul', (x: number, y: number) => x * y);
        this.addCalloutPrimitive('Float:://', '__sysmel_float_div', (x: number, y: number) => Math.trunc(x / y));
        this.addCalloutPrimitive('Float::%', '__sysmel_float_mod', (x: number, y: number) => x % y);

        this.addCalloutPrimitive('Float::=', '__sysmel_float_equals', (x: number, y: number) => x === y);
        this.addCalloutPrimitive('Float::~=', '__sysmel_float_notEquals', (x: number, y: number) => x !== y);
        //this.addCalloutPrimitive('Float::hash', '__sysmel_float_hash', (x: number, y: number) => hash);

        this.addCalloutPrimitive('Float::<',  '__sysmel_float_lessThan', (x: number, y: number) => x < y);
        this.addCalloutPrimitive('Float::<=', '__sysmel_float_lessOrEquals', (x: number, y: number) => x <= y);
        this.addCalloutPrimitive('Float::>',  '__sysmel_float_greaterThan', (x: number, y: number) => x > y);
        this.addCalloutPrimitive('Float::>=', '__sysmel_float_greaterOrEquals', (x: number, y: number) => x >= y);

        this.addCalloutPrimitive('Float::asInt8',  '__sysmel_float_asInt8',  (x: number) => x);
        this.addCalloutPrimitive('Float::asInt16', '__sysmel_float_asInt16', (x: number) => x);
        this.addCalloutPrimitive('Float::asInt32', '__sysmel_float_asInt32', (x: number) => x);
        this.addCalloutPrimitive('Float::asInt64', '__sysmel_float_asInt64', (x: number) => x);
        
        this.addCalloutPrimitive('Float::asUInt8',  '__sysmel_float_asUInt8',  (x: number) => x);
        this.addCalloutPrimitive('Float::asUInt16', '__sysmel_float_asUInt16', (x: number) => x);
        this.addCalloutPrimitive('Float::asUInt32', '__sysmel_float_asUInt32', (x: number) => x);
        this.addCalloutPrimitive('Float::asUInt64', '__sysmel_float_asUInt64', (x: number) => x);

        this.addCalloutPrimitive('Float::asChar8',  '__sysmel_float_asChar8',  (x: number) => x);
        this.addCalloutPrimitive('Float::asChar16', '__sysmel_float_asChar16', (x: number) => x);
        this.addCalloutPrimitive('Float::asChar32', '__sysmel_float_asChar32', (x: number) => x);
    }

    addCalloutPrimitive(primitiveName: string, runtimeName: string, implementation: any): void {
        let primitiveTranslator = (hir2mir: any, callInstruction: hir.HIRCallInstruction) => {
            return hir2mir.callRuntimeFunctionWithNameAndImplementation(callInstruction, runtimeName, implementation)
        }
        
        this.primitiveTranslatorMap[primitiveName] = primitiveTranslator;
    }

    makeBuilderTranslator(translationFunction: any): (hir2mir: any, callInstruction: hir.HIRCallInstruction) => MirValue {
        return (hir2mir: any, callInstruction: hir.HIRCallInstruction) => {
            let callArguments: MirValue[] = [];
            for(let i = 0; i < callInstruction.callArguments.length; ++i)  {
                let hirArgument = callInstruction.callArguments[i];
                if(!hirArgument)
                    throw new Error('Expected a hir argument');

                let mirArgument = hir2mir.translateValue(hirArgument);
                callArguments.push(mirArgument);
            }

            return translationFunction(hir2mir.builder, callInstruction.sourcePosition, ...callArguments);
        }
    }

    getPrimitiveTranslatorFor(primitiveName: string): (hir2mir: any, callInstruction: hir.HIRCallInstruction) => MirValue {
        let translator = this.primitiveTranslatorMap[primitiveName];
        if(!translator)
            throw new Error(`Missing primitive translator for ${primitiveName}.`)
        return translator;
    }
}

export abstract class MirValue {
    abstract accept(visitor: MirVisitor): any;

    abstract getSymbolName(): string;

    isTemporary(): boolean {
        return false;
    }

    isConstantValue(): boolean {
        return false;
    }

    isGlobalConstant(): boolean {
        return false;
    }

    isImportedFunction(): boolean {
        return false;
    }

    isFunction(): boolean {
        return false;
    }

    isType(): boolean {
        return false;
    }

    evaluateAsConstantValue(): any {
        throw new Error('Not a constant value.');
    }
}

export class MirPackage extends MirValue {
    context: MirContext;
    name: string;
    elementTable: MirPackageElement[] = [];
    anonSymbolCount: number = 0
    translatedFunctionMap: Map<hir.HIRFunction, MirFunction> = new Map();
    translatedPrimitiveMap: Record<string, MirImportedFunction> = {}

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

    addMirFunction(mirFunction: MirFunction) {
        this.addElement(mirFunction);
        if (mirFunction.sourceFunction) {
            this.translatedFunctionMap.set(mirFunction.sourceFunction, mirFunction)
        }
    }

    generateAnonymousSymbol() : string {
        return this.name + '__anonymous_' + this.anonSymbolCount++;
    }

    getSymbolName(): string {
        return this.name;
    }

    getOrCreateRuntimePrimitiveNamedWithImplementation(primitiveName: string, implementation: any) : MirImportedFunction {
        if (primitiveName in this.translatedPrimitiveMap)
            return this.translatedPrimitiveMap[primitiveName] as MirImportedFunction;

        let primitive = new MirImportedFunction(primitiveName);
        primitive.isExternC = true;
        primitive.implementation = implementation;
        this.addElement(primitive);
        this.translatedPrimitiveMap[primitiveName] = primitive;
        return primitive;
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

    constructor(name: string | null) {
        super();
        this.name = name;
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
    implementation:any | null = null;

    accept(visitor: MirVisitor): any {
        return visitor.visitImportedFunction(this);
    }

    isImportedFunction(): boolean {
        return true;
    }

    evaluateWithArguments(callArguments: any[]): any {
        if(!this.implementation)
            throw new Error(`Imported funtion ${this.toString()} does not have an implementation.`);

        return this.implementation(...callArguments);
    }

    toString(): string {
        return this.getSymbolName();
    }

    fullPrintString(): string {
        return `imported function ${this.getSymbolName()};\n`
    }
}

export abstract class MirGlobalConstant extends MirPackageElement {
    isGlobalConstant() {
        return true;
    }
}

export abstract class MirConstantValue extends MirValue {
    getSymbolName(): string {
        throw new Error('constant does not have a symbol name.');
    }

    isConstantValue(): boolean {
        return true;
    }
}

export class MirBooleanConstantValue extends MirConstantValue {
    value: boolean;

    constructor(value: boolean) {
        super();
        this.value = value;
    }

    accept(visitor: MirVisitor) {
        return visitor.visitBooleanConstantValue(this);
    }

    evaluateAsConstantValue(): any {
        return this.value;
    }

    toString(): string {
        return 'boolean ' + this.value;
    }
}

export class MirIntegerConstantValue extends MirConstantValue {
    value: number;

    constructor(value: number) {
        super();
        this.value = value;
    }

    accept(visitor: MirVisitor) {
        return visitor.visitIntegerConstantValue(this);
    }

    evaluateAsConstantValue(): any {
        return this.value;
    }

    toString(): string {
        return 'integer ' + this.value;
    }
}

export class MirFloatConstantValue extends MirConstantValue {
    value: number;

    constructor(value: number) {
        super();
        this.value = value;
    }

    accept(visitor: MirVisitor) {
        return visitor.visitFloatConstantValue(this);
    }

    evaluateAsConstantValue(): any {
        return this.value;
    }

    toString(): string {
        return 'float ' + this.value;
    }
}

export class MirVoidConstantValue extends MirConstantValue {
    accept(visitor: MirVisitor) {
        return visitor.visitVoidConstantValue(this);
    }

    evaluateAsConstantValue(): any {
        return null;
    }

    toString(): string {
        return 'void';
    }
}

export class MirNilConstantValue extends MirConstantValue {
    accept(visitor: MirVisitor) {
        return visitor.visitNilConstantValue(this);
    }

    evaluateAsConstantValue(): any {
        return null;
    }

    toString(): string {
        return 'nil';
    }
}

export class MirStringConstantValue extends MirGlobalConstant {
    value: string;

    constructor(value: string) {
        super(null);
        this.value = value;
    }

    accept(visitor: MirVisitor) {
        return visitor.visitStringConstantValue(this);
    }

    evaluateAsConstantValue(): any {
        return this.value;
    }

    toString(): string {
        return 'string ' + this.value;
    }

    fullPrintString(): string {
        return this.toString();
    }
}

export class MirSymbolConstantValue extends MirGlobalConstant {
    value: string;

    constructor(value: string) {
        super(null);
        this.value = value;
    }

    accept(visitor: MirVisitor) {
        return visitor.visitSymbolConstantValue(this);
    }

    evaluateAsConstantValue(): any {
        return this.value;
    }

    toString(): string {
        return 'symbol ' + this.value;
    }

    fullPrintString(): string {
        return this.toString();
    }
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

    toString(): string {
        return this.getSymbolName();
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

    getTempOrConstantValue(tempOrConstant: MirValue): any {
        if(tempOrConstant.isTemporary())
            return this.getTempValue(tempOrConstant as MirTemporary)
        if(tempOrConstant.isConstantValue())
            return tempOrConstant.evaluateAsConstantValue();
        if(tempOrConstant.isFunction() || tempOrConstant.isImportedFunction())
            return tempOrConstant;

        throw new Error('Not valid temp or constant value.');
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

    isTemporary(): boolean {
        return true;
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

        if(this.firstArgument) {
            result += ' ';
            result += this.firstArgument.toString();
        }
        if(this.secondArgument) {
            result += ', ';
            result += this.secondArgument.toString();
        }

        return result;
    }

    evaluateInContext(context: MirFunctionActivationContext): void {
        switch(this.opcode) {
        case MirOpcode.ArgumentBoolean8:
        case MirOpcode.ArgumentInt32:
        case MirOpcode.ArgumentInt64:
        case MirOpcode.ArgumentPointer:
        case MirOpcode.ArgumentGCPointer:
        case MirOpcode.ArgumentFloat32:
        case MirOpcode.ArgumentFloat64:
            context.setTempValue(this.result as MirTemporary, context.callArguments[this.index - 1])
            break;

        case MirOpcode.BeginCall:
            context.beginCall();
            break;

        case MirOpcode.CallArgumentBoolean8:
        case MirOpcode.CallArgumentInt32:
        case MirOpcode.CallArgumentInt64:
        case MirOpcode.CallArgumentPointer:
        case MirOpcode.CallArgumentGCPointer:
        case MirOpcode.CallArgumentFloat32:
        case MirOpcode.CallArgumentFloat64:
            context.addCallArgument(context.getTempOrConstantValue(this.firstArgument as MirValue));
            break;

        case MirOpcode.CallBoolean8Result:
        case MirOpcode.CallInt32Result:
        case MirOpcode.CallInt64Result:
        case MirOpcode.CallPointerResult:
        case MirOpcode.CallGCPointerResult:
        case MirOpcode.CallFloat32Result:
        case MirOpcode.CallFloat64Result:
            {
                let functional = context.getTempOrConstantValue(this.firstArgument as MirValue);
                let result = functional.evaluateWithArguments(context.calloutArguments);
                context.setTempValue(this.result as MirTemporary, result);
            }
            break;

        case MirOpcode.CallVoidResult:
            {
                let functional = context.getTempOrConstantValue(this.firstArgument as MirValue);
                functional.evaluateWithArguments(context.calloutArguments);
            }
            break;

        // Jump
        case MirOpcode.Jump:
            context.pc = (this.firstArgument as MirBasicBlock).index
            break;
        case MirOpcode.JumpIfTrue:
            if (context.getTempOrConstantValue(this.firstArgument as MirValue))
                context.pc = (this.secondArgument as MirBasicBlock).index
            break;
        case MirOpcode.JumpIfFalse:
            if (!context.getTempOrConstantValue(this.firstArgument as MirValue))
                context.pc = (this.secondArgument as MirBasicBlock).index
            break;

        // Nop
        case MirOpcode.Nop:
            // Nothing is required here
            break;

        // Logical
        case MirOpcode.Boolean8Not:
            context.setTempValue(this.result as MirTemporary, !context.getTempValue(this.firstArgument as MirTemporary))
            break;

        // Arithmetic
        case MirOpcode.Int32Neg:
        case MirOpcode.Int64Neg:
            context.setTempValue(this.result as MirTemporary, -context.getTempValue(this.firstArgument as MirTemporary))
            break;

        case MirOpcode.Int32Add:
        case MirOpcode.Int64Add:
            context.setTempValue(this.result as MirTemporary, context.getTempValue(this.firstArgument as MirTemporary) + context.getTempValue(this.secondArgument as MirTemporary))
            break;

        case MirOpcode.Int32Sub:
        case MirOpcode.Int64Sub:
            context.setTempValue(this.result as MirTemporary, context.getTempValue(this.firstArgument as MirTemporary) - context.getTempValue(this.secondArgument as MirTemporary))
            break;

        case MirOpcode.Int32Mul:
        case MirOpcode.Int64Mul:
            context.setTempValue(this.result as MirTemporary, context.getTempValue(this.firstArgument as MirTemporary) * context.getTempValue(this.secondArgument as MirTemporary))
            break;

        case MirOpcode.Int32SDiv:
        case MirOpcode.Int64SDiv:
        case MirOpcode.Int32UDiv:
        case MirOpcode.Int64UDiv:
            context.setTempValue(this.result as MirTemporary, Math.trunc(context.getTempValue(this.firstArgument as MirTemporary) / context.getTempValue(this.secondArgument as MirTemporary)))
            break;

        case MirOpcode.Int32SMod:
        case MirOpcode.Int64SMod:
        case MirOpcode.Int32UMod:
        case MirOpcode.Int64UMod:
            context.setTempValue(this.result as MirTemporary, context.getTempValue(this.firstArgument as MirTemporary) % context.getTempValue(this.secondArgument as MirTemporary))
            break;

        // Bitwise
        case MirOpcode.Int32BitNot:
        case MirOpcode.Int64BitNot:
            context.setTempValue(this.result as MirTemporary, ~context.getTempValue(this.firstArgument as MirTemporary))
            break;

        case MirOpcode.Int32BitAnd:
        case MirOpcode.Int64BitAnd:
            context.setTempValue(this.result as MirTemporary, context.getTempValue(this.firstArgument as MirTemporary) & context.getTempValue(this.secondArgument as MirTemporary))
            break;

        case MirOpcode.Int32BitOr:
        case MirOpcode.Int64BitOr:
            context.setTempValue(this.result as MirTemporary, context.getTempValue(this.firstArgument as MirTemporary) | context.getTempValue(this.secondArgument as MirTemporary))
            break;

        case MirOpcode.Int32BitXor:
        case MirOpcode.Int64BitXor:
            context.setTempValue(this.result as MirTemporary, context.getTempValue(this.firstArgument as MirTemporary) ^ context.getTempValue(this.secondArgument as MirTemporary))
            break;

        case MirOpcode.Int32ShiftLeft:
        case MirOpcode.Int64ShiftLeft:
            context.setTempValue(this.result as MirTemporary, context.getTempValue(this.firstArgument as MirTemporary) << context.getTempValue(this.secondArgument as MirTemporary))
            break;

        case MirOpcode.Int32LShiftRight:
        case MirOpcode.Int64LShiftRight:
            context.setTempValue(this.result as MirTemporary, context.getTempValue(this.firstArgument as MirTemporary) >>> context.getTempValue(this.secondArgument as MirTemporary))
            break;

        case MirOpcode.Int32AShiftRight:
        case MirOpcode.Int64AShiftRight:
            context.setTempValue(this.result as MirTemporary, context.getTempValue(this.firstArgument as MirTemporary) >> context.getTempValue(this.secondArgument as MirTemporary))
            break;

        // Comparisons
        case MirOpcode.Int32Equals:
        case MirOpcode.Int64Equals:
        case MirOpcode.PointerEquals:
            context.setTempValue(this.result as MirTemporary, context.getTempValue(this.firstArgument as MirTemporary) === context.getTempValue(this.secondArgument as MirTemporary))
            break;

        case MirOpcode.Int32NotEquals:
        case MirOpcode.Int64NotEquals:
        case MirOpcode.PointerNotEquals:
            context.setTempValue(this.result as MirTemporary, context.getTempValue(this.firstArgument as MirTemporary) !== context.getTempValue(this.secondArgument as MirTemporary))
            break;

        case MirOpcode.Int32LessThan:
        case MirOpcode.Int64LessThan:
        case MirOpcode.UInt32LessThan:
        case MirOpcode.UInt64LessThan:
            context.setTempValue(this.result as MirTemporary, context.getTempValue(this.firstArgument as MirTemporary) < context.getTempValue(this.secondArgument as MirTemporary))
            break;

        case MirOpcode.Int32LessOrEquals:
        case MirOpcode.Int64LessOrEquals:
        case MirOpcode.UInt32LessOrEquals:
        case MirOpcode.UInt64LessOrEquals:
            context.setTempValue(this.result as MirTemporary, context.getTempValue(this.firstArgument as MirTemporary) <= context.getTempValue(this.secondArgument as MirTemporary))
            break;

        case MirOpcode.Int32GreaterThan:
        case MirOpcode.Int64GreaterThan:
        case MirOpcode.UInt32GreaterThan:
        case MirOpcode.UInt64GreaterThan:
            context.setTempValue(this.result as MirTemporary, context.getTempValue(this.firstArgument as MirTemporary) > context.getTempValue(this.secondArgument as MirTemporary))
            break;

        case MirOpcode.Int32GreaterOrEqual:
        case MirOpcode.Int64GreaterOrEqual:
        case MirOpcode.UInt32GreaterOrEqual:
        case MirOpcode.UInt64GreaterOrEqual:
            context.setTempValue(this.result as MirTemporary, context.getTempValue(this.firstArgument as MirTemporary) >= context.getTempValue(this.secondArgument as MirTemporary))
            break;

        // Constants
        case MirOpcode.ConstBoolean8:
        case MirOpcode.ConstInt32:
        case MirOpcode.ConstInt64:
        case MirOpcode.ConstPointer:
        case MirOpcode.ConstFloat32:
        case MirOpcode.ConstFloat64:
        case MirOpcode.ConstGCPointer:
        case MirOpcode.ConstBoolean:
        case MirOpcode.ConstInteger:
        case MirOpcode.ConstCharacter:
        case MirOpcode.ConstFloat:
            context.setTempValue(this.result as MirTemporary, this.firstArgument?.evaluateAsConstantValue());
            break;
        case MirOpcode.ConstVoid:
            context.setTempValue(this.result as MirTemporary, null);
            break;

        // Phi
        case MirOpcode.PhiBoolean8:
        case MirOpcode.PhiInt32:
        case MirOpcode.PhiInt64:
        case MirOpcode.PhiPointer:
        case MirOpcode.PhiGCPointer:
        case MirOpcode.PhiFloat32:
        case MirOpcode.PhiFloat64:
            // Nothing is required here
            break;

        // Phi source
        case MirOpcode.PhiSourceBoolean8:
        case MirOpcode.PhiSourceInt32:
        case MirOpcode.PhiSourceInt64:
        case MirOpcode.PhiSourcePointer:
        case MirOpcode.PhiSourceGCPointer:
        case MirOpcode.PhiSourceFloat32:
        case MirOpcode.PhiSourceFloat64:
            {
                let value = context.getTempOrConstantValue(this.firstArgument as MirValue);
                context.setTempValue(this.result as MirTemporary, value);
            }
            break;

        // Returns
        case MirOpcode.ReturnBoolean8:
        case MirOpcode.ReturnInt32:
        case MirOpcode.ReturnInt64:
        case MirOpcode.ReturnPointer:
        case MirOpcode.ReturnFloat32:
        case MirOpcode.ReturnFloat64:
        case MirOpcode.ReturnGCPointer:
            context.setReturnValue(context.getTempOrConstantValue(this.firstArgument as MirValue));
            break;
        case MirOpcode.ReturnVoid:
            context.setReturnValue(null);
            break
        default:
            throw new Error(`Unsupported instruction opcode ${MirOpcode[this.opcode]}`)
        }
    }

}

export abstract class MirType extends MirValue {
    context: MirContext;
    name: string;
    valueSize: number;
    valueAlignment: number;

    constructor(context: MirContext, name: string, valueSize: number, valueAlignment: number) {
        super();
        this.context = context;
        this.name = name;
        this.valueSize = valueSize;
        this.valueAlignment = valueAlignment;
    }

    abstract emitArgumentWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary;
    abstract emitCallArgumentWithBuilder(builder: MirBuilder, value: MirTemporary, sourcePosition: AbstractSourcePosition): void;
    abstract emitCallWithBuilder(builder: MirBuilder, functional: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary;
    abstract emitReturnWithBuilder(builder: MirBuilder, valueToReturn: MirTemporary, sourcePosition: AbstractSourcePosition): void;
    abstract emitPhiWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition): MirTemporary;
    abstract emitPhiSourceWithBuilder(builder: MirBuilder, targetPhi: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction;
    abstract emitBooleanConstantWithBuilder(builder: MirBuilder, value: boolean, sourcePosition: AbstractSourcePosition): MirTemporary;
    abstract emitCharacterConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary;
    abstract emitIntegerConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary;
    abstract emitFloatConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary;

    getSymbolName(): string {
        return this.name;
    }

    toString(): string {
        return this.name;
    }

    isType(): boolean {
        return true;
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
    accept(visitor: MirVisitor) {
        return visitor.visitVoidType(this);
    }

    emitArgumentWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        throw new Error('Unsupported value as argument.')
    }

    emitReturnWithBuilder(builder: MirBuilder, valueToReturn: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.returnVoidAt(sourcePosition);
    }

    emitPhiWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value in Phi.')
    }

    emitPhiSourceWithBuilder(builder: MirBuilder, targetPhi: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        throw new Error('Unsupported value in Phi.')
    }
    emitCallArgumentWithBuilder(builder: MirBuilder, value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        throw new Error('Unsupported value for argument passing.')
    }
    emitCallWithBuilder(builder: MirBuilder, functional: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.callVoidResultAt(functional, sourcePosition);
    }
    emitBooleanConstantWithBuilder(builder: MirBuilder, value: boolean, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for boolean constant.')
    }
    emitIntegerConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for integer constant.')
    }
    emitCharacterConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for character constant.')
    }
    emitFloatConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for float constant.')
    }

    isVoidType(): boolean {
        return true;
    }
}

export class MirBasicBlockType extends MirType {
    accept(visitor: MirVisitor) {
        return visitor.visitBasicBlockType(this);
    }

    emitArgumentWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        throw new Error('Unsupported value as argument.');
    }

    emitReturnWithBuilder(builder: MirBuilder, valueToReturn: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        throw new Error('Unsupported value for returning.');
    }

    emitPhiWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value in Phi.');
    }

    emitPhiSourceWithBuilder(builder: MirBuilder, targetPhi: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        throw new Error('Unsupported value in Phi.');
    }

    emitCallArgumentWithBuilder(builder: MirBuilder, value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        throw new Error('Cannot pass a basic block as an argument.');
    }
    emitCallWithBuilder(builder: MirBuilder, functional: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Cannot call something that returns a basic block.');
    }
    emitBooleanConstantWithBuilder(builder: MirBuilder, value: boolean, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for boolean constant.')
    }
    emitIntegerConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for integer constant.');
    }
    emitCharacterConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for character constant.')
    }
    emitFloatConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for float constant.')
    }

    isBasicBlockType(): boolean {
        return true;
    }
}

export class MirFunctionType extends MirType {
    accept(visitor: MirVisitor) {
        return visitor.visitFunctionType(this);
    }

    emitArgumentWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        return builder.argumentPointerAt(sourcePosition, name);
    }

    emitReturnWithBuilder(builder: MirBuilder, valueToReturn: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.returnPointerAt(valueToReturn, sourcePosition);
    }

    emitPhiWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.phiPointerAt(sourcePosition);
    }

    emitPhiSourceWithBuilder(builder: MirBuilder, targetPhi: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        return builder.phiSourcePointerAt(targetPhi, sourceValue, sourcePosition);
    }

    emitCallArgumentWithBuilder(builder: MirBuilder, value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        return builder.callArgumentPointerAt(value, sourcePosition);
    }

    emitCallWithBuilder(builder: MirBuilder, functional: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.callPointerResultAt(functional, sourcePosition);
    }

    emitBooleanConstantWithBuilder(builder: MirBuilder, value: boolean, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for boolean constant.')
    }
    emitIntegerConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for integer constant.')
    }

    emitCharacterConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for character constant.')
    }

    emitFloatConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for float constant.')
    }

    isFunctionType(): boolean {
        return true;
    }
}

export class MirClosureType extends MirType {
    accept(visitor: MirVisitor) {
        return visitor.visitClosureType(this);
    }

    emitArgumentWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        return builder.argumentGCPointerAt(sourcePosition, name);
    }

    emitReturnWithBuilder(builder: MirBuilder, valueToReturn: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.returnGCPointerAt(valueToReturn, sourcePosition);
    }

    emitPhiWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.phiGCPointerAt(sourcePosition);
    }

    emitPhiSourceWithBuilder(builder: MirBuilder, targetPhi: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        return builder.phiSourceGCPointerAt(targetPhi, sourceValue, sourcePosition);
    }

    emitCallArgumentWithBuilder(builder: MirBuilder, value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.callArgumentGCPointerAt(value, sourcePosition);
    }

    emitCallWithBuilder(builder: MirBuilder, functional: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.callGCPointerResultAt(functional, sourcePosition);
    }

    emitBooleanConstantWithBuilder(builder: MirBuilder, value: boolean, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for boolean constant.')
    }
    emitIntegerConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for integer constant.')
    }

    emitCharacterConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for character constant.')
    }

    emitFloatConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for float constant.')
    }

    isClosureType(): boolean {
        return true;
    }
}

export class MirGCPointerType extends MirType {
    accept(visitor: MirVisitor) {
        return visitor.visitGCPointerType(this);
    }

    emitArgumentWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        return builder.argumentGCPointerAt(sourcePosition, name);
    }

    emitReturnWithBuilder(builder: MirBuilder, valueToReturn: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.returnGCPointerAt(valueToReturn, sourcePosition);
    }

    emitPhiWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.phiGCPointerAt(sourcePosition);
    }

    emitPhiSourceWithBuilder(builder: MirBuilder, targetPhi: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        return builder.phiSourceGCPointerAt(targetPhi, sourceValue, sourcePosition);
    }

    emitCallArgumentWithBuilder(builder: MirBuilder, value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        return builder.callArgumentGCPointerAt(value, sourcePosition);
    }

    emitCallWithBuilder(builder: MirBuilder, functional: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.callGCPointerResultAt(functional, sourcePosition);
    }

    emitBooleanConstantWithBuilder(builder: MirBuilder, value: boolean, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.constBooleanAt(value, sourcePosition)
    }
    emitIntegerConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.constIntegerAt(value, sourcePosition)
    }
    
    emitCharacterConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.constCharacterAt(value, sourcePosition);
    }

    emitFloatConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.constFloatAt(value, sourcePosition);
    }

    isGCPointerType(): boolean {
        return true;
    }
}

export class MirPointerType extends MirType {
    accept(visitor: MirVisitor) {
        return visitor.visitPointerType(this);
    }

    emitArgumentWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        return builder.argumentPointerAt(sourcePosition, name);
    }

    emitReturnWithBuilder(builder: MirBuilder, valueToReturn: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.returnPointerAt(valueToReturn, sourcePosition);
    }
    
    emitPhiWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.phiPointerAt(sourcePosition);
    }

    emitPhiSourceWithBuilder(builder: MirBuilder, targetPhi: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        return builder.phiSourcePointerAt(targetPhi, sourceValue, sourcePosition);
    }

    emitCallArgumentWithBuilder(builder: MirBuilder, value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.callArgumentPointerAt(value, sourcePosition);
    }

    emitCallWithBuilder(builder: MirBuilder, functional: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.callPointerResultAt(functional, sourcePosition);
    }
    emitBooleanConstantWithBuilder(builder: MirBuilder, value: boolean, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for boolean constant.')
    }
    emitIntegerConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('MirPointer does not support integer constant.');
    }

    emitCharacterConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for character constant.')
    }

    emitFloatConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for float constant.')
    }

    isPointerType(): boolean {
        return true;
    }
}

export class MirBoolean8Type extends MirType {
    accept(visitor: MirVisitor) {
        return visitor.visitBoolean8Type(this);
    }

    emitArgumentWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        return builder.argumentBoolean8At(sourcePosition, name);
    }

    emitReturnWithBuilder(builder: MirBuilder, valueToReturn: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.returnBoolean8At(valueToReturn, sourcePosition)
    }

    emitPhiWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.phiBoolean8At(sourcePosition);
    }

    emitPhiSourceWithBuilder(builder: MirBuilder, targetPhi: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        return builder.phiSourceBoolean8At(targetPhi, sourceValue, sourcePosition);
    }

    emitCallArgumentWithBuilder(builder: MirBuilder, value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.callArgumentBoolean8At(value, sourcePosition);
    }

    emitCallWithBuilder(builder: MirBuilder, functional: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.callBoolean8ResultAt(functional, sourcePosition);
    }

    emitBooleanConstantWithBuilder(builder: MirBuilder, value: boolean, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.constBoolean8At(value, sourcePosition);
    }

    emitIntegerConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.constBoolean8At(value !== 0, sourcePosition);
    }

    emitCharacterConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for character constant.')
    }

    emitFloatConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for float constant.')
    }

    isBoolean8Type(): boolean {
        return true;
    }
}

export class MirInt8Type extends MirType {
    accept(visitor: MirVisitor) {
        return visitor.visitInt8Type(this);
    }

    emitArgumentWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        return builder.argumentInt8At(sourcePosition, name);
    }

    emitReturnWithBuilder(builder: MirBuilder, valueToReturn: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.returnInt8At(valueToReturn, sourcePosition);
    }

    emitPhiWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.phiInt8At(sourcePosition);
    }
    
    emitPhiSourceWithBuilder(builder: MirBuilder, targetPhi: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        return builder.phiSourceInt8At(targetPhi, sourceValue, sourcePosition);
    }

    emitCallArgumentWithBuilder(builder: MirBuilder, value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.callArgumentInt8At(value, sourcePosition);
    }

    emitCallWithBuilder(builder: MirBuilder, functional: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.callInt8ResultAt(functional, sourcePosition);
    }

    emitBooleanConstantWithBuilder(builder: MirBuilder, value: boolean, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for boolean constant.')
    }

    emitIntegerConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.constInt8At(value, sourcePosition);
    }

    emitCharacterConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.constInt8At(value, sourcePosition);
    }
    
    emitFloatConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for float constant.')
    }

    isInt8Type(): boolean {
        return true;
    }
}

export class MirInt16Type extends MirType {
    accept(visitor: MirVisitor) {
        return visitor.visitInt16Type(this);
    }

    emitArgumentWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        return builder.argumentInt16At(sourcePosition, name);
    }

    emitReturnWithBuilder(builder: MirBuilder, valueToReturn: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.returnInt16At(valueToReturn, sourcePosition);
    }

    emitPhiWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.phiInt16At(sourcePosition);
    }

    emitPhiSourceWithBuilder(builder: MirBuilder, targetPhi: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        return builder.phiSourceInt16At(targetPhi, sourceValue, sourcePosition);
    }

    emitCallArgumentWithBuilder(builder: MirBuilder, value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.callArgumentInt16At(value, sourcePosition);
    }

    emitCallWithBuilder(builder: MirBuilder, functional: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.callInt16ResultAt(functional, sourcePosition);
    }

    emitBooleanConstantWithBuilder(builder: MirBuilder, value: boolean, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for boolean constant.')
    }

    emitIntegerConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.constInt16At(value, sourcePosition);
    }

    emitCharacterConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.constInt16At(value, sourcePosition);
    }

    emitFloatConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for float constant.')
    }

    isInt16Type(): boolean {
        return true;
    }
}

export class MirInt32Type extends MirType {
    accept(visitor: MirVisitor) {
        return visitor.visitInt32Type(this);
    }

    emitArgumentWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        return builder.argumentInt32At(sourcePosition, name);
    }

    emitReturnWithBuilder(builder: MirBuilder, valueToReturn: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.returnInt32At(valueToReturn, sourcePosition);
    }

    emitPhiWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.phiInt32At(sourcePosition);
    }

    emitPhiSourceWithBuilder(builder: MirBuilder, targetPhi: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        return builder.phiSourceInt32At(targetPhi, sourceValue, sourcePosition);
    }

    emitCallArgumentWithBuilder(builder: MirBuilder, value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.callArgumentInt32At(value, sourcePosition);
    }

    emitCallWithBuilder(builder: MirBuilder, functional: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.callInt32ResultAt(functional, sourcePosition);
    }

    emitBooleanConstantWithBuilder(builder: MirBuilder, value: boolean, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for boolean constant.')
    }

    emitIntegerConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.constInt32At(value, sourcePosition);
    }

    emitCharacterConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.constInt32At(value, sourcePosition);
    }

    emitFloatConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for float constant.')
    }

    isInt32Type(): boolean {
        return true;
    }
}

export class MirInt64Type extends MirType {
    accept(visitor: MirVisitor) {
        return visitor.visitInt64Type(this);
    }

    emitArgumentWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        return builder.argumentInt64At(sourcePosition, name);
    }

    emitReturnWithBuilder(builder: MirBuilder, valueToReturn: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.returnInt64At(valueToReturn, sourcePosition)
    }

    emitPhiWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.phiInt64At(sourcePosition);
    }

    emitPhiSourceWithBuilder(builder: MirBuilder, targetPhi: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        return builder.phiSourceInt64At(targetPhi, sourceValue, sourcePosition);
    }

    emitCallArgumentWithBuilder(builder: MirBuilder, value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.callArgumentInt64At(value, sourcePosition);
    }

    emitCallWithBuilder(builder: MirBuilder, functional: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.callInt64ResultAt(functional, sourcePosition);
    }

    emitIntegerConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.constInt64At(value, sourcePosition);
    }
    
    emitBooleanConstantWithBuilder(builder: MirBuilder, value: boolean, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for boolean constant.')
    }

    emitCharacterConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.constInt64At(value, sourcePosition);
    }
    
    emitFloatConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for float constant.')
    }

    isInt64Type(): boolean {
        return true;
    }
}

export class MirUInt8Type extends MirType {
    accept(visitor: MirVisitor) {
        return visitor.visitUInt8Type(this);
    }

    emitArgumentWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        return builder.argumentUInt8At(sourcePosition, name);
    }

    emitReturnWithBuilder(builder: MirBuilder, valueToReturn: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.returnUInt8At(valueToReturn, sourcePosition);
    }

    emitPhiWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.phiUInt8At(sourcePosition);
    }

    emitPhiSourceWithBuilder(builder: MirBuilder, targetPhi: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        return builder.phiSourceUInt8At(targetPhi, sourceValue, sourcePosition);
    }

    emitCallArgumentWithBuilder(builder: MirBuilder, value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.callArgumentUInt8At(value, sourcePosition);
    }

    emitCallWithBuilder(builder: MirBuilder, functional: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.callUInt8ResultAt(functional, sourcePosition);
    }
    
    emitBooleanConstantWithBuilder(builder: MirBuilder, value: boolean, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for boolean constant.')
    }

    emitIntegerConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.constUInt8At(value, sourcePosition);
    }

    emitCharacterConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.constUInt8At(value, sourcePosition);
    }

    emitFloatConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for float constant.')
    }

    isUInt8Type(): boolean {
        return true;
    }
}

export class MirUInt16Type extends MirType {
    accept(visitor: MirVisitor) {
        return visitor.visitUInt16Type(this);
    }

    emitArgumentWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        return builder.argumentUInt16At(sourcePosition, name);
    }

    emitReturnWithBuilder(builder: MirBuilder, valueToReturn: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.returnUInt16At(valueToReturn, sourcePosition);
    }

    emitPhiWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.phiUInt16At(sourcePosition);
    }

    emitPhiSourceWithBuilder(builder: MirBuilder, targetPhi: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        return builder.phiSourceUInt16At(targetPhi, sourceValue, sourcePosition);
    }

    emitCallArgumentWithBuilder(builder: MirBuilder, value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.callArgumentUInt16At(value, sourcePosition);
    }

    emitCallWithBuilder(builder: MirBuilder, functional: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.callUInt16ResultAt(functional, sourcePosition);
    }

    emitBooleanConstantWithBuilder(builder: MirBuilder, value: boolean, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for boolean constant.')
    }

    emitIntegerConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.constUInt16At(value, sourcePosition);
    }

    emitCharacterConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.constUInt16At(value, sourcePosition);
    }

    emitFloatConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for float constant.')
    }

    isUInt16Type(): boolean {
        return true;
    }
}

export class MirUInt32Type extends MirType {
    accept(visitor: MirVisitor) {
        return visitor.visitUInt32Type(this);
    }

    emitArgumentWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        return builder.argumentInt32At(sourcePosition, name);
    }

    emitReturnWithBuilder(builder: MirBuilder, valueToReturn: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.returnInt32At(valueToReturn, sourcePosition);
    }

    emitPhiWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.phiInt32At(sourcePosition);
    }

    emitPhiSourceWithBuilder(builder: MirBuilder, targetPhi: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        return builder.phiSourceInt32At(targetPhi, sourceValue, sourcePosition);
    }

    emitCallArgumentWithBuilder(builder: MirBuilder, value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.callArgumentInt32At(value, sourcePosition);
    }

    emitCallWithBuilder(builder: MirBuilder, functional: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.callInt32ResultAt(functional, sourcePosition);
    }

    emitBooleanConstantWithBuilder(builder: MirBuilder, value: boolean, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for boolean constant.')
    }

    emitIntegerConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.constInt32At(value, sourcePosition);
    }

    emitCharacterConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.constInt32At(value, sourcePosition);
    }
    
    emitFloatConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for float constant.')
    }

    isUInt32Type(): boolean {
        return true;
    }
}

export class MirUInt64Type extends MirType {
    accept(visitor: MirVisitor) {
        return visitor.visitUInt64Type(this);
    }

    emitArgumentWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        return builder.argumentInt64At(sourcePosition, name);
    }

    emitReturnWithBuilder(builder: MirBuilder, valueToReturn: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.returnInt64At(valueToReturn, sourcePosition);
    }

    emitPhiWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.phiInt64At(sourcePosition);
    }

    emitPhiSourceWithBuilder(builder: MirBuilder, targetPhi: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        return builder.phiSourceInt64At(targetPhi, sourceValue, sourcePosition);
    }

    emitCallArgumentWithBuilder(builder: MirBuilder, value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.callArgumentInt64At(value, sourcePosition);
    }

    emitCallWithBuilder(builder: MirBuilder, functional: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.callInt64ResultAt(functional, sourcePosition);
    }

    emitBooleanConstantWithBuilder(builder: MirBuilder, value: boolean, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for boolean constant.')
    }

    emitIntegerConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.constInt64At(value, sourcePosition);
    }

    emitCharacterConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.constInt64At(value, sourcePosition);
    }

    emitFloatConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for float constant.')
    }

    isUInt64Type(): boolean {
        return true;
    }
}

export class MirFloat32Type extends MirType {
    accept(visitor: MirVisitor) {
        return visitor.visitFloat32Type(this);
    }

    emitArgumentWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        return builder.argumentFloat32At(sourcePosition, name);
    }

    emitReturnWithBuilder(builder: MirBuilder, valueToReturn: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.returnFloat32At(valueToReturn, sourcePosition);
    }

    emitPhiWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.phiFloat32At(sourcePosition);
    }

    emitPhiSourceWithBuilder(builder: MirBuilder, targetPhi: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        return builder.phiSourceFloat32At(targetPhi, sourceValue, sourcePosition);
    }

    emitCallArgumentWithBuilder(builder: MirBuilder, value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.callArgumentFloat32At(value, sourcePosition);
    }

    emitCallWithBuilder(builder: MirBuilder, functional: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.callFloat32ResultAt(functional, sourcePosition);
    }

    emitBooleanConstantWithBuilder(builder: MirBuilder, value: boolean, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for boolean constant.')
    }

    emitIntegerConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.constFloat32At(value, sourcePosition);
    }

    emitCharacterConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Not valid type for character constant');
    }

    emitFloatConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.constFloat32At(value, sourcePosition);
    }

    isFloat32Type(): boolean {
        return true;
    }
}

export class MirFloat64Type extends MirType {
    accept(visitor: MirVisitor) {
        return visitor.visitFloat64Type(this);
    }

    emitArgumentWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        return builder.argumentFloat64At(sourcePosition, name);
    }

    emitReturnWithBuilder(builder: MirBuilder, valueToReturn: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.returnFloat64At(valueToReturn, sourcePosition);
    }

    emitPhiWithBuilder(builder: MirBuilder, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.phiFloat64At(sourcePosition);
    }

    emitPhiSourceWithBuilder(builder: MirBuilder, targetPhi: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        return builder.phiSourceFloat64At(targetPhi, sourceValue, sourcePosition);
    }

    emitCallArgumentWithBuilder(builder: MirBuilder, value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        builder.callArgumentFloat64At(value, sourcePosition);
    }

    emitCallWithBuilder(builder: MirBuilder, functional: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.callFloat64ResultAt(functional, sourcePosition);
    }

    emitBooleanConstantWithBuilder(builder: MirBuilder, value: boolean, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Unsupported value for boolean constant.')
    }

    emitIntegerConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.constFloat64At(value, sourcePosition);
    }

    emitCharacterConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        throw new Error('Not valid type for character constant');
    }

    emitFloatConstantWithBuilder(builder: MirBuilder, value: number, sourcePosition: AbstractSourcePosition): MirTemporary {
        return builder.constFloat64At(value, sourcePosition);
    }

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

    getContext(): MirContext {
        let module = this.mirFunction.module;
        if(!module)
            throw new Error('Expected a module.');
        return module.context;
    }

    conditionalBranchAt(condition: MirTemporary, trueDestination: MirBasicBlock, falseDestination: MirBasicBlock, sourcePosition: AbstractSourcePosition) {
        this.jumpIfFalseAt(condition, falseDestination, sourcePosition);
        this.jumpAt(trueDestination, sourcePosition);
    }

    jumpAt(destination: MirBasicBlock, sourcePosition: AbstractSourcePosition) {
        let instruction = new MirInstruction(null, MirOpcode.Jump, destination, null, sourcePosition, null);
        this.addInstruction(instruction);
    }

    jumpIfTrueAt(condition: MirTemporary, destination: MirBasicBlock, sourcePosition: AbstractSourcePosition) {
        let instruction = new MirInstruction(null, MirOpcode.JumpIfTrue, condition, destination, sourcePosition, null);
        this.addInstruction(instruction);
    }

    jumpIfFalseAt(condition: MirTemporary, destination: MirBasicBlock, sourcePosition: AbstractSourcePosition) {
        let instruction = new MirInstruction(null, MirOpcode.JumpIfFalse, condition, destination, sourcePosition, null);
        this.addInstruction(instruction);
    }

    argumentBoolean8At(sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().boolean8Type, sourcePosition, name);
        let instruction = new MirInstruction(temp, MirOpcode.ArgumentBoolean8, null, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    argumentInt8At(sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int8Type, sourcePosition, name);
        let instruction = new MirInstruction(temp, MirOpcode.ArgumentInt32, null, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    argumentInt16At(sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int16Type, sourcePosition, name);
        let instruction = new MirInstruction(temp, MirOpcode.ArgumentInt32, null, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    argumentUInt8At(sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().uint8Type, sourcePosition, name);
        let instruction = new MirInstruction(temp, MirOpcode.ArgumentInt32, null, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    argumentUInt16At(sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().uint16Type, sourcePosition, name);
        let instruction = new MirInstruction(temp, MirOpcode.ArgumentInt32, null, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }

    argumentInt32At(sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int32Type, sourcePosition, name);
        let instruction = new MirInstruction(temp, MirOpcode.ArgumentInt32, null, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    argumentInt64At(sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int64Type, sourcePosition, name);
        let instruction = new MirInstruction(temp, MirOpcode.ArgumentInt64, null, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    argumentPointerAt(sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().pointerType, sourcePosition, name);
        let instruction = new MirInstruction(temp, MirOpcode.ArgumentPointer, null, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    argumentGCPointerAt(sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().gcPointerType, sourcePosition, name);
        let instruction = new MirInstruction(temp, MirOpcode.ArgumentGCPointer, null, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    argumentFloat32At(sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().float32Type, sourcePosition, name);
        let instruction = new MirInstruction(temp, MirOpcode.ArgumentFloat32, null, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    argumentFloat64At(sourcePosition: AbstractSourcePosition, name: string | null): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().float64Type, sourcePosition, name);
        let instruction = new MirInstruction(temp, MirOpcode.ArgumentFloat64, null, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }


    beginCallAt(sourcePosition: AbstractSourcePosition): void {
        let instruction = new MirInstruction(null, MirOpcode.BeginCall, null, null, sourcePosition, null);
        this.addInstruction(instruction);
    }

    callArgumentBoolean8At(value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        let instruction = new MirInstruction(null, MirOpcode.CallArgumentBoolean8, value, null, sourcePosition, null);
        this.addInstruction(instruction);
    }
    callArgumentInt8At(value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        this.callArgumentInt32At(value, sourcePosition);
    }
    callArgumentInt16At(value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        this.callArgumentInt32At(value, sourcePosition);
    }
    callArgumentUInt8At(value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        this.callArgumentInt32At(value, sourcePosition);
    }
    callArgumentUInt16At(value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        this.callArgumentInt32At(value, sourcePosition);
    }

    callArgumentInt32At(value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        let instruction = new MirInstruction(null, MirOpcode.CallArgumentInt32, value, null, sourcePosition, null);
        this.addInstruction(instruction);
    }
    callArgumentInt64At(value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        let instruction = new MirInstruction(null, MirOpcode.CallArgumentInt64, value, null, sourcePosition, null);
        this.addInstruction(instruction);
    }
    callArgumentPointerAt(value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        let instruction = new MirInstruction(null, MirOpcode.CallArgumentPointer, value, null, sourcePosition, null);
        this.addInstruction(instruction);
    }
    callArgumentGCPointerAt(value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        let instruction = new MirInstruction(null, MirOpcode.CallArgumentGCPointer, value, null, sourcePosition, null);
        this.addInstruction(instruction);
    }
    callArgumentFloat32At(value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        let instruction = new MirInstruction(null, MirOpcode.CallArgumentFloat32, value, null, sourcePosition, null);
        this.addInstruction(instruction);
    }
    callArgumentFloat64At(value: MirTemporary, sourcePosition: AbstractSourcePosition): void {
        let instruction = new MirInstruction(null, MirOpcode.CallArgumentFloat64, value, null, sourcePosition, null);
        this.addInstruction(instruction);
    }

    callBoolean8ResultAt(calledFunction: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().boolean8Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.CallBoolean8Result, calledFunction, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    callInt8ResultAt(calledFunction: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        return this.callInt32ResultAt(calledFunction, sourcePosition);
    }
    callInt16ResultAt(calledFunction: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        return this.callInt32ResultAt(calledFunction, sourcePosition);
    }
    callUInt8ResultAt(calledFunction: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        return this.callInt32ResultAt(calledFunction, sourcePosition);
    }
    callUInt16ResultAt(calledFunction: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        return this.callInt32ResultAt(calledFunction, sourcePosition);
    }
    callInt32ResultAt(calledFunction: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int32Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.CallInt32Result, calledFunction, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    callInt64ResultAt(calledFunction: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int64Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.CallInt64Result, calledFunction, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    callPointerResultAt(calledFunction: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().pointerType, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.CallPointerResult, calledFunction, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    callGCPointerResultAt(calledFunction: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().gcPointerType, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.CallGCPointerResult, calledFunction, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    callVoidResultAt(calledFunction: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().voidType, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.CallVoidResult, calledFunction, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    callFloat32ResultAt(calledFunction: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().float32Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.CallFloat32Result, calledFunction, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    callFloat64ResultAt(calledFunction: MirValue, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().float64Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.CallFloat64Result, calledFunction, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }

    boolean8NotAt(operand: MirTemporary, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int32Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.Boolean8Not, operand, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }

    int32NegAt(operand: MirTemporary, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int32Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.Int32Neg, operand, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }

    int32AddAt(left: MirTemporary, right: MirTemporary, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int32Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.Int32Add, left, right, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }

    int32SubAt(left: MirTemporary, right: MirTemporary, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int32Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.Int32Sub, left, right, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }

    int32MulAt(left: MirTemporary, right: MirTemporary, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int32Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.Int32Mul, left, right, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    int32SDivAt(left: MirTemporary, right: MirTemporary, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int32Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.Int32SDiv, left, right, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    int32UDivAt(left: MirTemporary, right: MirTemporary, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int32Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.Int32UDiv, left, right, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }

    int32SModAt(left: MirTemporary, right: MirTemporary, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int32Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.Int32SMod, left, right, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }

    int32UModAt(left: MirTemporary, right: MirTemporary, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int32Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.Int32UMod, left, right, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }

    // Bitwise
    int32BitNotAt(operand: MirTemporary, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int32Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.Int32BitNot, operand, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    int32BitAndAt(left: MirTemporary, right: MirTemporary, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int32Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.Int32BitAnd, left, right, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    int32BitOrAt(left: MirTemporary, right: MirTemporary, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int32Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.Int32BitOr, left, right, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    int32BitXorAt(left: MirTemporary, right: MirTemporary, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int32Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.Int32BitXor, left, right, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    int32ShiftLeftAt(left: MirTemporary, right: MirTemporary, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int32Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.Int32ShiftLeft, left, right, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    int32LShiftRightAt(left: MirTemporary, right: MirTemporary, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int32Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.Int32LShiftRight, left, right, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    int32AShiftRightAt(left: MirTemporary, right: MirTemporary, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int32Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.Int32AShiftRight, left, right, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }

    int32EqualsAt(left: MirTemporary, right: MirTemporary, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().boolean8Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.Int32Equals, left, right, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    int32NotEqualsAt(left: MirTemporary, right: MirTemporary, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().boolean8Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.Int32NotEquals, left, right, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    int32LessThanAt(left: MirTemporary, right: MirTemporary, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().boolean8Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.Int32LessThan, left, right, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    int32LessOrEqualsAt(left: MirTemporary, right: MirTemporary, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().boolean8Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.Int32LessOrEquals, left, right, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    int32GreaterThanAt(left: MirTemporary, right: MirTemporary, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().boolean8Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.Int32GreaterThan, left, right, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    int32GreaterOrEqualsAt(left: MirTemporary, right: MirTemporary, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().boolean8Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.Int32GreaterOrEqual, left, right, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }

    uint32LessThanAt(left: MirTemporary, right: MirTemporary, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().boolean8Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.UInt32LessThan, left, right, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    uint32LessOrEqualsAt(left: MirTemporary, right: MirTemporary, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().boolean8Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.UInt32LessOrEquals, left, right, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    uint32GreaterThanAt(left: MirTemporary, right: MirTemporary, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().boolean8Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.UInt32GreaterThan, left, right, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    uint32GreaterOrEqualsAt(left: MirTemporary, right: MirTemporary, sourcePosition: AbstractSourcePosition): MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().boolean8Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.UInt32GreaterOrEqual, left, right, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }

    constBoolean8At(value: boolean, sourcePosition: AbstractSourcePosition) : MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().boolean8Type, sourcePosition, null);
        let constant = new MirBooleanConstantValue(value);
        let instruction = new MirInstruction(temp, MirOpcode.ConstBoolean8, constant, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    constInt8At(value: number, sourcePosition: AbstractSourcePosition) : MirTemporary {
        return this.constInt32At(value, sourcePosition);
    }
    constInt16At(value: number, sourcePosition: AbstractSourcePosition) : MirTemporary {
        return this.constInt32At(value, sourcePosition);
    }
    constUInt8At(value: number, sourcePosition: AbstractSourcePosition) : MirTemporary {
        return this.constInt32At(value, sourcePosition);
    }
    constUInt16At(value: number, sourcePosition: AbstractSourcePosition) : MirTemporary {
        return this.constInt32At(value, sourcePosition);
    }

    constInt32At(value: number, sourcePosition: AbstractSourcePosition) : MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int32Type, sourcePosition, null);
        let constant = new MirIntegerConstantValue(value);
        let instruction = new MirInstruction(temp, MirOpcode.ConstInt32, constant, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    constInt64At(value: number, sourcePosition: AbstractSourcePosition) : MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int64Type, sourcePosition, null);
        let constant = new MirIntegerConstantValue(value);
        let instruction = new MirInstruction(temp, MirOpcode.ConstInt64, constant, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    constFloat32At(value: number, sourcePosition: AbstractSourcePosition) : MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().float32Type, sourcePosition, null);
        let constant = new MirFloatConstantValue(value);
        let instruction = new MirInstruction(temp, MirOpcode.ConstFloat32, constant, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    constFloat64At(value: number, sourcePosition: AbstractSourcePosition) : MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().float64Type, sourcePosition, null);
        let constant = new MirFloatConstantValue(value);
        let instruction = new MirInstruction(temp, MirOpcode.ConstFloat64, constant, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }

    constPointerAt(value: number, sourcePosition: AbstractSourcePosition) : MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().pointerType, sourcePosition, null);
        let constant = new MirIntegerConstantValue(value);
        let instruction = new MirInstruction(temp, MirOpcode.ConstPointer, constant, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    constGCPointerAt(value: number, sourcePosition: AbstractSourcePosition) : MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().gcPointerType, sourcePosition, null);
        let constant = new MirIntegerConstantValue(value);
        let instruction = new MirInstruction(temp, MirOpcode.ConstGCPointer, constant, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    constGlobalCGPointerAt(globalConstant: MirGlobalConstant, sourcePosition: AbstractSourcePosition) : MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().gcPointerType, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.ConstGCPointer, globalConstant, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }

    constBooleanAt(value: boolean, sourcePosition: AbstractSourcePosition) : MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().gcPointerType, sourcePosition, null);
        let constant = new MirBooleanConstantValue(value);
        let instruction = new MirInstruction(temp, MirOpcode.ConstBoolean, constant, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    constIntegerAt(value: number, sourcePosition: AbstractSourcePosition) : MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().gcPointerType, sourcePosition, null);
        let constant = new MirIntegerConstantValue(value);
        let instruction = new MirInstruction(temp, MirOpcode.ConstInteger, constant, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    constCharacterAt(value: number, sourcePosition: AbstractSourcePosition) : MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().gcPointerType, sourcePosition, null);
        let constant = new MirIntegerConstantValue(value);
        let instruction = new MirInstruction(temp, MirOpcode.ConstCharacter, constant, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    constFloatAt(value: number, sourcePosition: AbstractSourcePosition) : MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().gcPointerType, sourcePosition, null);
        let constant = new MirFloatConstantValue(value);
        let instruction = new MirInstruction(temp, MirOpcode.ConstFloat, constant, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    constVoidAt(value: number, sourcePosition: AbstractSourcePosition) : MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().voidType, sourcePosition, null);
        let constant = new MirIntegerConstantValue(value);
        let instruction = new MirInstruction(temp, MirOpcode.ConstVoid, constant, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }

    phiBoolean8At(sourcePosition: AbstractSourcePosition) : MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().boolean8Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.PhiBoolean8, null, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }

    phiInt8At(sourcePosition: AbstractSourcePosition) : MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int8Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.PhiInt32, null, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    phiInt16At(sourcePosition: AbstractSourcePosition) : MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int16Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.PhiInt32, null, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    phiUInt8At(sourcePosition: AbstractSourcePosition) : MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().uint8Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.PhiInt32, null, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    phiUInt16At(sourcePosition: AbstractSourcePosition) : MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().uint16Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.PhiInt32, null, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }

    phiInt32At(sourcePosition: AbstractSourcePosition) : MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int32Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.PhiInt32, null, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    phiInt64At(sourcePosition: AbstractSourcePosition) : MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().int64Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.PhiInt64, null, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    phiPointerAt(sourcePosition: AbstractSourcePosition) : MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().pointerType, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.PhiPointer, null, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    phiGCPointerAt(sourcePosition: AbstractSourcePosition) : MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().gcPointerType, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.PhiGCPointer, null, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    phiFloat32At(sourcePosition: AbstractSourcePosition) : MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().float32Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.PhiFloat32, null, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }
    phiFloat64At(sourcePosition: AbstractSourcePosition) : MirTemporary {
        let temp = this.mirFunction.newTemporary(this.getContext().float64Type, sourcePosition, null);
        let instruction = new MirInstruction(temp, MirOpcode.PhiFloat64, null, null, sourcePosition, null);
        this.addInstruction(instruction);
        return temp;
    }

    phiSourceBoolean8At(targetTemp: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        let instruction = new MirInstruction(targetTemp, MirOpcode.PhiSourceBoolean8, sourceValue, null, sourcePosition, null);
        this.addInstruction(instruction);
        return instruction;
    }
    phiSourceInt8At(targetTemp: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        return this.phiSourceInt32At(targetTemp, sourceValue, sourcePosition);
    }
    phiSourceInt16At(targetTemp: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        return this.phiSourceInt32At(targetTemp, sourceValue, sourcePosition);
    }
    phiSourceUInt8At(targetTemp: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        return this.phiSourceInt32At(targetTemp, sourceValue, sourcePosition);
    }
    phiSourceUInt16At(targetTemp: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        return this.phiSourceInt32At(targetTemp, sourceValue, sourcePosition);
    }

    phiSourceInt32At(targetTemp: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        let instruction = new MirInstruction(targetTemp, MirOpcode.PhiSourceInt32, sourceValue, null, sourcePosition, null);
        this.addInstruction(instruction);
        return instruction;
    }
    phiSourceInt64At(targetTemp: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        let instruction = new MirInstruction(targetTemp, MirOpcode.PhiSourceInt64, sourceValue, null, sourcePosition, null);
        this.addInstruction(instruction);
        return instruction;
    }
    phiSourcePointerAt(targetTemp: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        let instruction = new MirInstruction(targetTemp, MirOpcode.PhiSourcePointer, sourceValue, null, sourcePosition, null);
        this.addInstruction(instruction);
        return instruction;
    }
    phiSourceGCPointerAt(targetTemp: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        let instruction = new MirInstruction(targetTemp, MirOpcode.PhiSourceGCPointer, sourceValue, null, sourcePosition, null);
        this.addInstruction(instruction);
        return instruction;
    }
    phiSourceFloat32At(targetTemp: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        let instruction = new MirInstruction(targetTemp, MirOpcode.PhiSourceFloat32, sourceValue, null, sourcePosition, null);
        this.addInstruction(instruction);
        return instruction;
    }
    phiSourceFloat64At(targetTemp: MirTemporary, sourceValue: MirTemporary, sourcePosition: AbstractSourcePosition): MirInstruction {
        let instruction = new MirInstruction(targetTemp, MirOpcode.PhiSourceFloat64, sourceValue, null, sourcePosition, null);
        this.addInstruction(instruction);
        return instruction;
    }

    returnBoolean8At(temp: MirTemporary, sourcePosition: AbstractSourcePosition) : MirInstruction {
        let instruction = new MirInstruction(null, MirOpcode.ReturnBoolean8, temp, null, sourcePosition, null);
        this.addInstruction(instruction);
        return instruction;
    }
    returnInt8At(temp: MirTemporary, sourcePosition: AbstractSourcePosition) : MirInstruction {
        return this.returnInt32At(temp, sourcePosition);
    }
    returnInt16At(temp: MirTemporary, sourcePosition: AbstractSourcePosition) : MirInstruction {
        return this.returnInt32At(temp, sourcePosition);
    }
    returnUInt8At(temp: MirTemporary, sourcePosition: AbstractSourcePosition) : MirInstruction {
        return this.returnInt32At(temp, sourcePosition);
    }
    returnUInt16At(temp: MirTemporary, sourcePosition: AbstractSourcePosition) : MirInstruction {
        return this.returnInt32At(temp, sourcePosition);
    }

    returnInt32At(temp: MirTemporary, sourcePosition: AbstractSourcePosition) : MirInstruction {
        let instruction = new MirInstruction(null, MirOpcode.ReturnInt32, temp, null, sourcePosition, null);
        this.addInstruction(instruction);
        return instruction;
    }
    returnInt64At(temp: MirTemporary, sourcePosition: AbstractSourcePosition) : MirInstruction {
        let instruction = new MirInstruction(null, MirOpcode.ReturnInt64, temp, null, sourcePosition, null);
        this.addInstruction(instruction);
        return instruction;
    }
    returnPointerAt(temp: MirTemporary, sourcePosition: AbstractSourcePosition) : MirInstruction {
        let instruction = new MirInstruction(null, MirOpcode.ReturnPointer, temp, null, sourcePosition, null);
        this.addInstruction(instruction);
        return instruction;
    }
    returnGCPointerAt(temp: MirTemporary, sourcePosition: AbstractSourcePosition) : MirInstruction {
        let instruction = new MirInstruction(null, MirOpcode.ReturnGCPointer, temp, null, sourcePosition, null);
        this.addInstruction(instruction);
        return instruction;
    }
    returnFloat32At(temp: MirTemporary, sourcePosition: AbstractSourcePosition) : MirInstruction {
        let instruction = new MirInstruction(null, MirOpcode.ReturnFloat32, temp, null, sourcePosition, null);
        this.addInstruction(instruction);
        return instruction;
    }
    returnFloat64At(temp: MirTemporary, sourcePosition: AbstractSourcePosition) : MirInstruction {
        let instruction = new MirInstruction(null, MirOpcode.ReturnFloat64, temp, null, sourcePosition, null);
        this.addInstruction(instruction);
        return instruction;
    }

    returnVoidAt(sourcePosition: AbstractSourcePosition) : MirInstruction {
        let instruction = new MirInstruction(null, MirOpcode.ReturnVoid, null, null, sourcePosition, null);
        this.addInstruction(instruction);
        return instruction;
    }
}