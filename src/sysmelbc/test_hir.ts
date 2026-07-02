import * as hir from "./hir.js"
import * as assert from 'assert';

export function runTests() {
    // Core types
    {
        let coreTypes = new hir.HIRCoreTypes();

        // Universe
        assert.ok(coreTypes.getUniverseAtLevel(0).isType())
        assert.ok(coreTypes.getUniverseAtLevel(0).isUniverseType())
        assert.strictEqual(coreTypes.getUniverseAtLevel(0), coreTypes.getUniverseAtLevel(0))
        console.log(coreTypes.getUniverseAtLevel(0).toString())
    }
    
} 