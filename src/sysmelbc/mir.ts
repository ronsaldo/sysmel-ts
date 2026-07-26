export const enum MirOpcode
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
}

export class MirPackage {
    context: MirContext;
    name: string;
    elementTable: MirPackageElement[] = [];

    constructor(context: MirContext, name: string) {
        this.context = context;
        this.name = name;
    }

    accept(visitor: MirVisitor): any {
        return visitor.visitPackage(this);
    }
}

export abstract class MirPackageElement {
    name: string | null;
    anonSymbolName: string | null = null;
    module: MirPackage;
    owner: MirPackageElement | null = null;
    isExternC: boolean = false;

    constructor(module: MirPackage, name: string, owner: MirPackageElement | null) {
        this.module = module;
        this.name = name;
        this.owner = owner;
    }


    abstract accept(visitor: MirVisitor): any;

    isImportedFunction(): boolean {
        return false;
    }
}

export class MirImportedFunction extends MirPackageElement {
    accept(visitor: MirVisitor) {
        return visitor.visitImportedFunction(this);
    }

    isImportedFunction(): boolean {
        return true;
    }
}

export class MirContext {

}
