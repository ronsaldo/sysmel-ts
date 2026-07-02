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

        console.log(identity.fullPrintString());

/*
        result = identity.evaluateWithArguments([HIRConstantLiteralIntegerValue(42, self.context.coreTypes.integerType, None)])
        self.assertEqual(result.value, 42)
*/


    }
    
} 