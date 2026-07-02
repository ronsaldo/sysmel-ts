import {getOrMakeEmptySourcePosition} from "./source_code.js"
import * as hir from "./hir.js"
import * as assert from 'assert'

export function runTests() {
    // Core types
    {
        let coreTypes = new hir.HIRCoreTypes();

        // Universe
        assert.ok(coreTypes.getUniverseAtLevel(0).isType())
        assert.ok(coreTypes.getUniverseAtLevel(0).isUniverseType())
        assert.strictEqual(coreTypes.getUniverseAtLevel(0), coreTypes.getUniverseAtLevel(0))
    }

    // Context
    {
        let context = new hir.HIRContext();
        //console.log(context.corePackage.publicSymbolTable);
    }

    // Identity function
    {
        let context = new hir.HIRContext();
        let argument = new hir.HIRArgument(context.coreTypes.int32Type, 'x', getOrMakeEmptySourcePosition());
        let functionType = new hir.HIRDependentFunctionType([argument], context.coreTypes.int32Type, context.coreTypes, getOrMakeEmptySourcePosition())
        let identity = new hir.HIRFunction('identity', functionType, getOrMakeEmptySourcePosition());

        let entryBlock = new hir.HIRBasicBlock(context.coreTypes.basicBlockType, 'entry', getOrMakeEmptySourcePosition());
        identity.addBasicBlock(entryBlock)

        let builder = new hir.HIRBuilder(identity, context, entryBlock, new hir.HIREmptyEnvironment());
        builder.returnValue(argument, getOrMakeEmptySourcePosition());
        //console.log(identity.fullPrintString());

        let result = identity.evaluateWithArguments([new hir.HIRConstantLiteralIntegerValue(42, context.coreTypes.int32Type, getOrMakeEmptySourcePosition())]);
        assert.ok(result.isConstantLiteralIntegerValue());
        assert.strictEqual((result as hir.HIRConstantLiteralIntegerValue).value, 42);
    }

    // Branch
    {
        let context = new hir.HIRContext();
        let argument = new hir.HIRArgument(context.coreTypes.int32Type, 'x', getOrMakeEmptySourcePosition());
        let functionType = new hir.HIRDependentFunctionType([argument], context.coreTypes.int32Type, context.coreTypes, getOrMakeEmptySourcePosition())
        let identity = new hir.HIRFunction('identity', functionType, getOrMakeEmptySourcePosition());

        let entryBlock = new hir.HIRBasicBlock(context.coreTypes.basicBlockType, 'entry', getOrMakeEmptySourcePosition());
        identity.addBasicBlock(entryBlock)

        let exitBlock = new hir.HIRBasicBlock(context.coreTypes.basicBlockType, 'exit', getOrMakeEmptySourcePosition());
        identity.addBasicBlock(exitBlock)

        {
            let builder = new hir.HIRBuilder(identity, context, entryBlock, new hir.HIREmptyEnvironment());
            builder.branch(exitBlock, getOrMakeEmptySourcePosition())
        }

        {
            let builder = new hir.HIRBuilder(identity, context, exitBlock, new hir.HIREmptyEnvironment());
            builder.returnValue(argument, getOrMakeEmptySourcePosition());
        }

        let result = identity.evaluateWithArguments([new hir.HIRConstantLiteralIntegerValue(42, context.coreTypes.int32Type, getOrMakeEmptySourcePosition())]);
        assert.ok(result.isConstantLiteralIntegerValue());
        assert.strictEqual((result as hir.HIRConstantLiteralIntegerValue).value, 42);
    }

    // Conditional branch
    {
        let context = new hir.HIRContext();
        let argument = new hir.HIRArgument(context.coreTypes.boolean8Type, 'x', getOrMakeEmptySourcePosition());
        let functionType = new hir.HIRDependentFunctionType([argument], context.coreTypes.int32Type, context.coreTypes, getOrMakeEmptySourcePosition())
        let identity = new hir.HIRFunction('identity', functionType, getOrMakeEmptySourcePosition());

        let entryBlock = new hir.HIRBasicBlock(context.coreTypes.basicBlockType, 'entry', getOrMakeEmptySourcePosition());
        identity.addBasicBlock(entryBlock)

        let trueBlock = new hir.HIRBasicBlock(context.coreTypes.basicBlockType, 'true', getOrMakeEmptySourcePosition());
        identity.addBasicBlock(trueBlock)

        let falseBlock = new hir.HIRBasicBlock(context.coreTypes.basicBlockType, 'false', getOrMakeEmptySourcePosition());
        identity.addBasicBlock(falseBlock)

        {
            let builder = new hir.HIRBuilder(identity, context, entryBlock, new hir.HIREmptyEnvironment());
            builder.conditionalBranch(argument, trueBlock, falseBlock, getOrMakeEmptySourcePosition());
        }

        {
            let builder = new hir.HIRBuilder(identity, context, trueBlock, new hir.HIREmptyEnvironment());
            builder.returnValue(new hir.HIRConstantLiteralIntegerValue(1, context.coreTypes.int32Type, getOrMakeEmptySourcePosition()), getOrMakeEmptySourcePosition());
        }

        {
            let builder = new hir.HIRBuilder(identity, context, falseBlock, new hir.HIREmptyEnvironment());
            builder.returnValue(new hir.HIRConstantLiteralIntegerValue(0, context.coreTypes.int32Type, getOrMakeEmptySourcePosition()), getOrMakeEmptySourcePosition());
        }

        console.log(identity.fullPrintString());

        // False result
        {
            let result = identity.evaluateWithArguments([new hir.HIRConstantLiteralBooleanValue(false, context.coreTypes.boolean8Type, getOrMakeEmptySourcePosition())]);
            assert.ok(result.isConstantLiteralIntegerValue());
            assert.strictEqual((result as hir.HIRConstantLiteralIntegerValue).value, 0);
        }

        // True result
        {
            let result = identity.evaluateWithArguments([new hir.HIRConstantLiteralBooleanValue(true, context.coreTypes.boolean8Type, getOrMakeEmptySourcePosition())]);
            assert.ok(result.isConstantLiteralIntegerValue());
            assert.strictEqual((result as hir.HIRConstantLiteralIntegerValue).value, 1);
        }
    }

} 