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

        this.coreTypeMappings.set(this.hirCoreTypes.float32Type, this.mirContext.float32Type);
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
        return this.visitNextValue(type.baseType);
    }
    visitPointerLikeType(type: hir.HIRPointerLikeType): any {
        throw new Error('TODO: HirPackage2Mir visitPointerLikeType')
    }
    visitPointerType(type: hir.HIRPointerType): any {
        return this.visitPointerLikeType(type);
    }
    visitReferenceType(type: hir.HIRReferenceType): any {
        return this.visitPointerLikeType(type);
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
        return new mir.MirIntegerConstantValue(constant.value);
    }
    visitConstantLiteralFloatValue(constant: hir.HIRConstantLiteralFloatValue): any {
        return new mir.MirFloatConstantValue(constant.value);
    }
    visitConstantLiteralBooleanValue(constant: hir.HIRConstantLiteralBooleanValue): any {
        return new mir.MirBooleanConstantValue(constant.value);
    }
    visitConstantLiteralCharacterValue(constant: hir.HIRConstantLiteralCharacterValue): any {
        return new mir.MirIntegerConstantValue(constant.value);
    }
    visitConstantLiteralStringValue(constant: hir.HIRConstantLiteralStringValue): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitConstantLiteralSymbolValue(constant: hir.HIRConstantLiteralSymbolValue): any {
        throw new Error('TODO: HirPackage2Mir')
    }
    visitConstantLiteralVoidValue(constant: hir.HIRConstantLiteralVoidValue): any {
        return new mir.MirVoidConstantValue();
    }
    visitConstantLiteralNilValue(constant: hir.HIRConstantLiteralNilValue): any {
        return new mir.MirNilConstantValue();
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
        return null;
    }
    visitPrimitiveFunction(primitiveFunction: hir.HIRPrimitiveFunction): any {
        return null;
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
        let mirFunction = new mir.MirFunction(hirFunction.name);
        mirFunction.sourceFunction = hirFunction;

        this.valueMap.set(hirFunction, mirFunction);
        this.currentMirPackage?.addMirFunction(mirFunction);

        new HirFunction2Mir(this, hirFunction, mirFunction).translateFunction();

        return mirFunction;
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
        return null;
    }
    visitMetaBuilder(metaBuilder: hir.HIRMetaBuilder): any {
        throw new Error('Not supported')
    }

}

export class HirFunction2Mir extends hir.HIRVisitor {
    packageTranslator: HirPackage2Mir;
    hirFunction: hir.HIRFunction;
    mirFunction: mir.MirFunction;
    prologueBlock: mir.MirBasicBlock;
    prologueBuilder: mir.MirBuilder;
    builder: mir.MirBuilder;
    valueMap: Map<hir.HIRValue, mir.MirValue> = new Map();

    constructor(packageTranslator: HirPackage2Mir, hirFunction: hir.HIRFunction, mirFunction: mir.MirFunction) {
        super();

        assert.ok(hirFunction.firstBasicBlock);

        this.packageTranslator = packageTranslator;
        this.hirFunction = hirFunction;
        this.mirFunction = mirFunction;

        this.prologueBlock = new mir.MirBasicBlock(hirFunction.sourcePosition, 'prologue');
        mirFunction.addBasicBlock(this.prologueBlock);
        this.prologueBuilder = new mir.MirBuilder(mirFunction, this.prologueBlock);
        this.builder = new mir.MirBuilder(mirFunction, this.prologueBlock);
    }

    translateFunction() {
        // Arguments
        for(let i = 0; i < this.hirFunction.dependentFunctionType.functionArguments.length; ++i) {
            let argument = this.hirFunction.dependentFunctionType.functionArguments[i];
            if(!argument)
                throw new Error('Expected an argument.');
            this.visitNextValue(argument)
        }

        // Create the basic blocks
        this.createAndMapBasicBlocks();

        // Translate the basic block
        this.translateBasicBlocks();

        // End the prologue
        let firstBasicBlock = this.valueMap.get(this.hirFunction.firstBasicBlock as hir.HIRValue) as mir.MirBasicBlock;
        this.prologueBuilder.jumpAt(firstBasicBlock, this.hirFunction.sourcePosition);
    }

    createAndMapBasicBlocks() {
        let basicBlock = this.hirFunction.firstBasicBlock;
        while(basicBlock) {
            let mirBasicBlock = new mir.MirBasicBlock(basicBlock.sourcePosition, basicBlock.name);
            this.mirFunction.addBasicBlock(mirBasicBlock);
            this.valueMap.set(basicBlock, mirBasicBlock);
            this.translateBasicBlockPhis(basicBlock, mirBasicBlock);

            basicBlock = basicBlock.nextBasicBlock;
        }
    }

    translateBasicBlockPhis(basicBlock: hir.HIRBasicBlock, mirBasicBlock: mir.MirBasicBlock): void {
        this.builder.basicBlock = mirBasicBlock;
        let instruction = basicBlock.firstInstruction;
        while (instruction && instruction.isPhiInstruction()) {
            let phiType = this.packageTranslator.translateValue(instruction.getType()) as mir.MirType;
            let phiValue = phiType.emitPhiWithBuilder(this.builder, instruction.sourcePosition);
            this.valueMap.set(instruction, phiValue);

            instruction = instruction.nextInstruction;
        }
    }

    translateBasicBlocks(): void {
        let basicBlock = this.hirFunction.firstBasicBlock;
        while(basicBlock) {
            this.translateBasicBlock(basicBlock);
            basicBlock = basicBlock.nextBasicBlock;
        }
    }

    translateBasicBlock(basicBlock: hir.HIRBasicBlock): void {
        let mirBasicBlock = this.valueMap.get(basicBlock) as mir.MirBasicBlock;
        this.builder.basicBlock = mirBasicBlock;

        let instruction = basicBlock.firstInstruction;
        while(instruction) {
            this.translateInstruction(instruction);
            instruction = instruction.nextInstruction;
        }
    }

    translateInstruction(instruction: hir.HIRInstruction) {
        if(instruction.isPhiInstruction())
        {
            assert.ok(this.valueMap.has(instruction));
            return;
        }

        assert.ok(!this.valueMap.has(instruction));
        let value = this.visitNextValue(instruction);
        this.valueMap.set(instruction, value);
    }

    translateValue(value: hir.HIRValue): mir.MirValue {
        if(this.valueMap.has(value)) {
            return this.valueMap.get(value) as mir.MirValue;
        }

        assert.ok(!value.isFunctionLocalValue());
        let translatedValue = this.visitNextValue(value);
        this.valueMap.set(value, translatedValue);
        return translatedValue;
    }

    visitNextValue(value: hir.HIRValue) : mir.MirValue {
        return value.accept(this);
    }

    visitType(type: hir.HIRType): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitNominalType(type: hir.HIRNominalType): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitDynamicType(type: hir.HIRDynamicType): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitPrimitiveType(type: hir.HIRPrimitiveType): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitUndefinedType(type: hir.HIRUndefinedType): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitVoidType(type: hir.HIRVoidType): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitControlFlowEscapeType(type: hir.HIRControlFlowEscapeType): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitUniverseType(type: hir.HIRUniverseType): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitDerivedType(type: hir.HIRDerivedType): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitPointerLikeType(type: hir.HIRPointerLikeType): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitPointerType(type: hir.HIRPointerType): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitReferenceType(type: hir.HIRReferenceType): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitMutableValueBoxType(type: hir.HIRMutableValueBoxType): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitAssociationType(type: hir.HIRAssociationType): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitTupleType(type: hir.HIRTupleType): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitDependentFunctionType(type: hir.HIRDependentFunctionType): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitSimpleFunctionType(type: hir.HIRSimpleFunctionType): any {
        throw new Error('TODO: HirFunction2Mir');
    }

    visitConstantLiteralIntegerValue(constant: hir.HIRConstantLiteralIntegerValue): any {
        let constantType = this.packageTranslator.translateValue(constant.getType()) as mir.MirType;
        return constantType.emitIntegerConstantWithBuilder(this.prologueBuilder, constant.value, constant.sourcePosition)
    }
    visitConstantLiteralFloatValue(constant: hir.HIRConstantLiteralFloatValue): any {
        let constantType = this.packageTranslator.translateValue(constant.getType()) as mir.MirType;
        return constantType.emitFloatConstantWithBuilder(this.prologueBuilder, constant.value, constant.sourcePosition)
    }
    visitConstantLiteralBooleanValue(constant: hir.HIRConstantLiteralBooleanValue): any {
        throw new Error('TODO: HirFunction2Mir visitConstantLiteralBooleanValue');
    }
    visitConstantLiteralCharacterValue(constant: hir.HIRConstantLiteralCharacterValue): any {
        let constantType = this.packageTranslator.translateValue(constant.getType()) as mir.MirType;
        return constantType.emitCharacterConstantWithBuilder(this.prologueBuilder, constant.value, constant.sourcePosition)
    }
    visitConstantLiteralStringValue(constant: hir.HIRConstantLiteralStringValue): any {
        throw new Error('TODO: HirFunction2Mir visitConstantLiteralStringValue');
    }
    visitConstantLiteralSymbolValue(constant: hir.HIRConstantLiteralSymbolValue): any {
        throw new Error('TODO: HirFunction2Mir visitConstantLiteralSymbolValue');
    }
    visitConstantLiteralVoidValue(constant: hir.HIRConstantLiteralVoidValue): any {
        throw new Error('TODO: HirFunction2Mir visitConstantLiteralVoidValue');
    }
    visitConstantLiteralNilValue(constant: hir.HIRConstantLiteralNilValue): any {
        throw new Error('TODO: HirFunction2Mir visitConstantLiteralNilValue');
    }
    visitConstantLiteralUndefinedValue(constant: hir.HIRConstantLiteralUndefinedValue): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitConstantLiteralParseTree(constant: hir.HIRConstantLiteralParseTree): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    
    visitConstantAssociation(type: hir.HIRConstantAssociation): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitConstantTuple(type: hir.HIRConstantTuple): any {
        throw new Error('TODO: HirFunction2Mir');
    }

    visitMacroContext(context: hir.HIRMacroContext): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitPrimitiveMacro(macro: hir.HIRPrimitiveMacro): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitPrimitiveFunction(primitiveFunction: hir.HIRPrimitiveFunction): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitMutableValueBox(valueBox: hir.HIRMutableValueBox): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitPointerLikeValue(pointerLike: hir.HIRPointerLikeValue): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitPointerValue(pointer: hir.HIRPointerValue): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitReferenceValue(reference: hir.HIRReferenceValue): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitFunction(hirFunction: hir.HIRFunction): any {
        return this.packageTranslator.translateValue(hirFunction);
    }
    visitFunctionClosure(closure: hir.HIRFunctionClosure): any {
        throw new Error('TODO: HirFunction2Mir');
    }

    visitArgument(argument: hir.HIRArgument): any {
        let argumentType = this.packageTranslator.translateValue(argument.type);
        let argumentTemporary = (argumentType as mir.MirType).emitArgumentWithBuilder(this.builder, argument.sourcePosition, argument.name);
        this.valueMap.set(argument, argumentTemporary);
        return argumentTemporary;
    }
    visitCapture(capture: hir.HIRCapture): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitBasicBlock(basicBlock: hir.HIRBasicBlock): any {
        throw new Error('TODO: HirFunction2Mir');
    }

    visitAllocaInstruction(instruction: hir.HIRAllocaInstruction): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitBranchInstruction(instruction: hir.HIRBranchInstruction): any {
        let destination = this.translateValue(instruction.destination) as mir.MirBasicBlock;
        this.builder.jumpAt(destination, instruction.sourcePosition);
    }
    visitConditionalBranchInstruction(instruction: hir.HIRConditionalBranchInstruction): any {
        let condition = this.translateValue(instruction.condition) as mir.MirTemporary;
        let trueDestination = this.translateValue(instruction.trueDestination) as mir.MirBasicBlock;
        let falseDestination = this.translateValue(instruction.falseDestination) as mir.MirBasicBlock;
        this.builder.conditionalBranchAt(condition, trueDestination, falseDestination, instruction.sourcePosition);
    }

    visitCallInstruction(instruction: hir.HIRCallInstruction): any {
        if (instruction.functional.isPrimitiveFunction()) {
            let primitive = instruction.functional as hir.HIRPrimitiveFunction;
            let primitiveName = primitive.name;
            let translator = this.packageTranslator.mirContext.getPrimitiveTranslatorFor(primitiveName);
            return translator(this, instruction);
        }

        let functional = this.translateValue(instruction.functional);
        this.builder.beginCallAt(instruction.sourcePosition);

        for(let i = 0; i < instruction.callArguments.length; ++i) {
            let argument = instruction.callArguments[i];
            if(!argument)
                throw new Error('Expected an argument.');

            let argumentValue = this.translateValue(argument);
            
            let argumentType = this.packageTranslator.translateValue(argument.getType()) as mir.MirType
            argumentType.emitCallArgumentWithBuilder(this.builder, argumentValue as mir.MirTemporary, argument.sourcePosition)
        }

        let callType = this.packageTranslator.translateValue(instruction.type) as mir.MirType;
        return callType.emitCallWithBuilder(this.builder, functional, instruction.sourcePosition);
    }

    visitLoadInstruction(instruction: hir.HIRLoadInstruction): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitStoreInstruction(instruction: hir.HIRStoreInstruction): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitMakeAssociationInstruction(instruction: hir.HIRMakeAssociationInstruction): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitMakeClosureInstruction(instruction: hir.HIRMakeClosureInstruction): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitMakeTupleInstruction(instruction: hir.HIRMakeTupleInstruction): any {
        throw new Error('TODO: HirFunction2Mir');
    }

    visitPhiInstruction(instruction: hir.HIRPhiInstruction): any {
        throw new Error('Phi should be translated during the basic block creation pass');
    }

    visitPhiSourceInstruction(instruction: hir.HIRPhiSourceInstruction): any {
        let targetPhi = this.valueMap.get(instruction.targetPhi) as mir.MirTemporary;
        let sourceValue = this.translateValue(instruction.sourceValue) as mir.MirTemporary;
        let sourceValueType = sourceValue.type;
        sourceValueType.emitPhiSourceWithBuilder(this.builder, targetPhi, sourceValue, instruction.sourcePosition)
    }

    visitReturnInstruction(instruction: hir.HIRReturnInstruction): any {
        let hirReturnType = instruction.valueToReturn.getType();
        if(hirReturnType.isVoidType()) {
            return this.builder.returnVoidAt(instruction.sourcePosition);
        }

        let returnType = this.packageTranslator.translateValue(hirReturnType) as mir.MirType;
        let returnValue = this.translateValue(instruction.valueToReturn);
        assert.ok(returnValue.isTemporary())
        return returnType.emitReturnWithBuilder(this.builder, returnValue as mir.MirTemporary, instruction.sourcePosition);
    }

    visitAssertConditionInstruction(instruction: hir.HIRAssertConditionInstruction): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitRuntimeErrorInstruction(instruction: hir.HIRRuntimeErrorInstruction): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitUnreachableInstruction(instruction: hir.HIRUnreachableInstruction): any {
        throw new Error('TODO: HirFunction2Mir');
    }

    visitMetaBuilderFactory(factory: hir.HIRMetaBuilderFactory): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitMetaBuilder(metaBuilder: hir.HIRMetaBuilder): any {
        throw new Error('TODO: HirFunction2Mir');
    }
    visitPackage(hirPackage: hir.HIRPackage): any {
        throw new Error('TODO: HirFunction2Mir');
    }
}