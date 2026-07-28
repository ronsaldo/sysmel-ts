import * as hir from "./hir.js"
import * as mir from "./mir.js"
import * as assert from 'assert'

export class HirPackage2Mir extends hir.HIRVisitor {
    hirCoreTypes: hir.HIRCoreTypes;
    hirContext: hir.HIRContext;
    mirContext: mir.MirContext;
    valueMap: Map<hir.HIRValue, mir.MirValue> = new Map();
    coreTypeMappings: Map<hir.HIRType, mir.MirType> = new Map();
    currentMirPackage: mir.MirPackage | null = null;

    constructor(hirContext: hir.HIRContext, mirContext: mir.MirContext) {
        super();
        this.hirCoreTypes = hirContext.coreTypes;
        this.hirContext = hirContext;
        this.mirContext = mirContext;
        this.setCoreTypeMappins();
    }

    setCoreTypeMappins() {
        this.coreTypeMappings.set(this.hirCoreTypes.boolean8Type, this.mirContext.boolean8Type);

        this.coreTypeMappings.set(this.hirCoreTypes.int8Type,  this.mirContext.int8Type);
        this.coreTypeMappings.set(this.hirCoreTypes.int16Type, this.mirContext.int16Type);
        this.coreTypeMappings.set(this.hirCoreTypes.int32Type, this.mirContext.int32Type);
        this.coreTypeMappings.set(this.hirCoreTypes.int64Type, this.mirContext.int64Type);

        this.coreTypeMappings.set(this.hirCoreTypes.uint8Type,  this.mirContext.uint8Type);
        this.coreTypeMappings.set(this.hirCoreTypes.uint16Type, this.mirContext.uint16Type);
        this.coreTypeMappings.set(this.hirCoreTypes.uint32Type, this.mirContext.uint32Type);
        this.coreTypeMappings.set(this.hirCoreTypes.uint64Type, this.mirContext.uint64Type);

        this.coreTypeMappings.set(this.hirCoreTypes.char8Type,  this.mirContext.uint8Type);
        this.coreTypeMappings.set(this.hirCoreTypes.char16Type, this.mirContext.uint16Type);
        this.coreTypeMappings.set(this.hirCoreTypes.char32Type, this.mirContext.uint32Type);

        this.coreTypeMappings.set(this.hirCoreTypes.float32Type,  this.mirContext.float32Type);
        this.coreTypeMappings.set(this.hirCoreTypes.float64Type, this.mirContext.float64Type);
    }

    translateHirPackage2Mir(hirPackage: hir.HIRPackage): mir.MirPackage {
        return this.translateValue(hirPackage) as mir.MirPackage;
    }

    translateValue(value: hir.HIRValue) : mir.MirValue {
        if(this.valueMap.has(value))
            return this.valueMap.get(value) as mir.MirValue;

        assert.ok(!value.isFunctionLocalValue());
        let translatedValue = this.visitNextValue(value) as mir.MirValue;
        this.valueMap.set(value, translatedValue);
        return translatedValue;
    }

    visitNextValue(value: hir.HIRValue) : any {
        return value.accept(this);
    }

    visitPackage(hirPackage: hir.HIRPackage): any {
        if(this.valueMap.has(hirPackage))
            return this.valueMap.get(hirPackage);

        // Start translating the package.
        let oldPackage = this.currentMirPackage;
        let mirPackage = new mir.MirPackage(this.mirContext, hirPackage.name as string);
        this.valueMap.set(hirPackage, mirPackage);
        this.currentMirPackage = mirPackage;

        // Translate the used packages.
        for(let i = 0; i < hirPackage.usedPackages.length; ++i) {
            let usedPackage = hirPackage.usedPackages[i] as hir.HIRPackage;
            this.translateValue(usedPackage);
        }

        // Translate the children.
        hirPackage.finishPendingAnalysis();
        for(let i = 0; i < hirPackage.children.length; ++i) {
            let child = hirPackage.children[i] as hir.HIRPackage;
            this.translateValue(child);
        }

        this.currentMirPackage = oldPackage;
        return mirPackage;
    }    

    visitType(type: hir.HIRType): any {
        throw new Error('TODO: HirPackage2Mir')
    }

    visitNominalType(type: hir.HIRNominalType): any {
        let mirType = this.mirContext.gcPointerType;
        if(this.coreTypeMappings.has(type)) {
            mirType = this.coreTypeMappings.get(type) as mir.MirType
        }
        this.valueMap.set(type, mirType);
        return mirType;
    }

    visitDynamicType(type: hir.HIRDynamicType): any {
        return this.mirContext.gcPointerType
    }
    visitPrimitiveType(type: hir.HIRPrimitiveType): any {
        return this.visitNominalType(type);
    }
    visitUndefinedType(type: hir.HIRUndefinedType): any {
        return this.mirContext.pointerType
    }
    visitVoidType(type: hir.HIRVoidType): any {
        return this.mirContext.voidType
    }
    visitControlFlowEscapeType(type: hir.HIRControlFlowEscapeType): any {
        return this.mirContext.voidType
    }
    visitUniverseType(type: hir.HIRUniverseType): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitDerivedType(type: hir.HIRDerivedType): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitPointerLikeType(type: hir.HIRPointerLikeType): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitPointerType(type: hir.HIRPointerType): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitReferenceType(type: hir.HIRReferenceType): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitMutableValueBoxType(type: hir.HIRMutableValueBoxType): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitAssociationType(type: hir.HIRAssociationType): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitTupleType(type: hir.HIRTupleType): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitDependentFunctionType(type: hir.HIRDependentFunctionType): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitSimpleFunctionType(type: hir.HIRSimpleFunctionType): any {
        throw new Error('TODO: HirPackage2Mir')
    }

    visitConstantLiteralIntegerValue(constant: hir.HIRConstantLiteralIntegerValue): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitConstantLiteralFloatValue(constant: hir.HIRConstantLiteralFloatValue): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitConstantLiteralBooleanValue(constant: hir.HIRConstantLiteralBooleanValue): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitConstantLiteralCharacterValue(constant: hir.HIRConstantLiteralCharacterValue): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitConstantLiteralStringValue(constant: hir.HIRConstantLiteralStringValue): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitConstantLiteralSymbolValue(constant: hir.HIRConstantLiteralSymbolValue): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitConstantLiteralVoidValue(constant: hir.HIRConstantLiteralVoidValue): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitConstantLiteralNilValue(constant: hir.HIRConstantLiteralNilValue): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitConstantLiteralUndefinedValue(constant: hir.HIRConstantLiteralUndefinedValue): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitConstantLiteralParseTree(constant: hir.HIRConstantLiteralParseTree): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    
    visitConstantAssociation(type: hir.HIRConstantAssociation): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitConstantTuple(type: hir.HIRConstantTuple): any {
        throw new Error('TODO: HirPackage2Mir')
    }

    visitMacroContext(context: hir.HIRMacroContext): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitPrimitiveMacro(macro: hir.HIRPrimitiveMacro): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitPrimitiveFunction(primitiveFunction: hir.HIRPrimitiveFunction): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitMutableValueBox(valueBox: hir.HIRMutableValueBox): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitPointerLikeValue(pointerLike: hir.HIRPointerLikeValue): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitPointerValue(pointer: hir.HIRPointerValue): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitReferenceValue(reference: hir.HIRReferenceValue): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitFunction(hirFunction: hir.HIRFunction): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitFunctionClosure(closure: hir.HIRFunctionClosure): any {
        throw new Error('TODO: HirPackage2Mir')
    }

    visitArgument(argument: hir.HIRArgument): any {
        throw new Error('Not supported')
    }
    visitCapture(capture: hir.HIRCapture): any {
        throw new Error('Not supported')
    }
    visitBasicBlock(basicBlock: hir.HIRBasicBlock): any {
        throw new Error('Not supported')
    }

    visitAllocaInstruction(instruction: hir.HIRAllocaInstruction): any {
        throw new Error('Not supported')
    }
    visitBranchInstruction(instruction: hir.HIRBranchInstruction): any {
        throw new Error('Not supported')
    }
    visitConditionalBranchInstruction(instruction: hir.HIRConditionalBranchInstruction): any {
        throw new Error('Not supported')
    }
    visitCallInstruction(instruction: hir.HIRCallInstruction): any {
        throw new Error('Not supported')
    }
    visitLoadInstruction(instruction: hir.HIRLoadInstruction): any {
        throw new Error('Not supported')
    }
    visitStoreInstruction(instruction: hir.HIRStoreInstruction): any {
        throw new Error('Not supported')
    }
    visitMakeAssociationInstruction(instruction: hir.HIRMakeAssociationInstruction): any {
        throw new Error('Not supported')
    }
    visitMakeClosureInstruction(instruction: hir.HIRMakeClosureInstruction): any {
        throw new Error('Not supported')
    }
    visitMakeTupleInstruction(instruction: hir.HIRMakeTupleInstruction): any {
        throw new Error('Not supported')
    }
    visitPhiInstruction(instruction: hir.HIRPhiInstruction): any {
        throw new Error('Not supported')
    }
    visitPhiSourceInstruction(instruction: hir.HIRPhiSourceInstruction): any {
        throw new Error('Not supported')
    }
    visitReturnInstruction(instruction: hir.HIRReturnInstruction): any {
        throw new Error('Not supported')
    }
    visitAssertConditionInstruction(instruction: hir.HIRAssertConditionInstruction): any {
        throw new Error('Not supported')
    }
    visitRuntimeErrorInstruction(instruction: hir.HIRRuntimeErrorInstruction): any {
        throw new Error('Not supported')
    }
    visitUnreachableInstruction(instruction: hir.HIRUnreachableInstruction): any {
        throw new Error('Not supported')
    }

    visitMetaBuilderFactory(factory: hir.HIRMetaBuilderFactory): any {
        throw new Error('Not supported')
    }
    visitMetaBuilder(metaBuilder: hir.HIRMetaBuilder): any {
        throw new Error('Not supported')
    }

}