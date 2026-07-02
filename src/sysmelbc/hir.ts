import {AbstractSourcePosition, getOrMakeEmptySourcePosition} from "./source_code.js"
import * as parseTree from "./parsetree.js"

export abstract class HIRValue {
    sourcePosition: AbstractSourcePosition;

    constructor(sourcePosition: AbstractSourcePosition) {
        this.sourcePosition = sourcePosition;
    }

    abstract getType(): HIRType;

    isType(): boolean {
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
}

export class HIRConstantLiteralBooleanValue extends HIRConstantLiteralValue {
    value: boolean;

    constructor(value: boolean, type: HIRType, sourcePosition: AbstractSourcePosition) {
        super(type, sourcePosition);
        this.value = value;
    }

    isConstantLiteralBooleanValue() : boolean {
        return true
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
}

export class HIRConstantLiteralVoidValue extends HIRConstantLiteralValue {
    constructor(type: HIRType, sourcePosition: AbstractSourcePosition) {
        super(type, sourcePosition);
    }

    isConstantLiteralVoidValue() : boolean {
        return true
    }
}

export class HIRConstantLiteralNilValue extends HIRConstantLiteralValue {
    constructor(type: HIRType, sourcePosition: AbstractSourcePosition) {
        super(type, sourcePosition);
    }

    isConstantLiteralNilValue() : boolean {
        return true
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

        this.coreValueList.push(['void',  new HIRConstantLiteralVoidValue(this.voidType, getOrMakeEmptySourcePosition())]);
        this.coreValueList.push(['false', new HIRConstantLiteralBooleanValue(false, this.boolean8Type, getOrMakeEmptySourcePosition())]);
        this.coreValueList.push(['true',  new HIRConstantLiteralBooleanValue(true, this.boolean8Type, getOrMakeEmptySourcePosition())]);
        this.coreValueList.push(['nil',   new HIRConstantLiteralNilValue(this.undefinedType, getOrMakeEmptySourcePosition())]);
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