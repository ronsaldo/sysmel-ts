import {getOrMakeEmptySourcePosition} from "./source_code.js"
import * as mir from "./mir.js"
import * as assert from 'assert'

let context: mir.MirContext = new mir.MirContext(8);
let mirPackage: mir.MirPackage = new mir.MirPackage(context, 'TestPackage');

function setUp() {
    context = new mir.MirContext(8);
    mirPackage = new mir.MirPackage(context, 'TestPackage');
}

function tearDown() {

}

export function runTests() {
    // Empty module
    {
        setUp();
        assert.strictEqual(mirPackage.elementTable.length, 0);
        tearDown();
    }

    // Test return void
    {
        setUp();

        let mirFunction = new mir.MirFunction('main')
        mirPackage.addElement(mirFunction);

        let entryBlock = new mir.MirBasicBlock(getOrMakeEmptySourcePosition(), 'entry');
        mirFunction.addBasicBlock(entryBlock);

        let builder = new mir.MirBuilder(mirFunction, entryBlock);
        builder.returnVoidAt(getOrMakeEmptySourcePosition());

        console.log(mirPackage.fullPrintString());
        tearDown();
    }
}
