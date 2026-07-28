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

        let result = mirFunction.evaluateWithArguments([])
        assert.strictEqual(result, null);
        tearDown();
    }

    // Test return int32
    {
        setUp();

        let mirFunction = new mir.MirFunction('main')
        mirPackage.addElement(mirFunction);

        let entryBlock = new mir.MirBasicBlock(getOrMakeEmptySourcePosition(), 'entry');
        mirFunction.addBasicBlock(entryBlock);

        let builder = new mir.MirBuilder(mirFunction, entryBlock);
        let constant = builder.constInt32At(42, getOrMakeEmptySourcePosition())
        builder.returnInt32At(constant, getOrMakeEmptySourcePosition());

        let result = mirFunction.evaluateWithArguments([]);
        assert.strictEqual(result, 42);
        tearDown();
    }

    // Sum int32
    {
        setUp();

        let sumFunction = new mir.MirFunction('sum')
        mirPackage.addElement(sumFunction);

        {
            let entryBlock = new mir.MirBasicBlock(getOrMakeEmptySourcePosition(), 'entry');
            sumFunction.addBasicBlock(entryBlock);

            let builder = new mir.MirBuilder(sumFunction, entryBlock);
            let firstArgument = builder.argumentInt32At(getOrMakeEmptySourcePosition(), 'first')
            let secondArgument = builder.argumentInt32At(getOrMakeEmptySourcePosition(), 'second')
            let sum = builder.int32AddAt(firstArgument, secondArgument, getOrMakeEmptySourcePosition());
            builder.returnInt32At(sum, getOrMakeEmptySourcePosition());

            let result = sumFunction.evaluateWithArguments([2, 3]);
            assert.strictEqual(result, 5);
        }

        {
            let callSumFunction = new mir.MirFunction('callSum')
            mirPackage.addElement(callSumFunction);

            let entryBlock = new mir.MirBasicBlock(getOrMakeEmptySourcePosition(), 'entry');
            callSumFunction.addBasicBlock(entryBlock);

            let builder = new mir.MirBuilder(callSumFunction, entryBlock);
            let firstArgument = builder.constInt32At(1, getOrMakeEmptySourcePosition());
            let secondArgument = builder.constInt32At(2, getOrMakeEmptySourcePosition());

            builder.beginCallAt(getOrMakeEmptySourcePosition());
            builder.callArgumentInt32At(firstArgument, getOrMakeEmptySourcePosition());
            builder.callArgumentInt32At(secondArgument, getOrMakeEmptySourcePosition());
            let callResult = builder.callInt32ResultAt(sumFunction, getOrMakeEmptySourcePosition());
            builder.returnInt32At(callResult, getOrMakeEmptySourcePosition());

            let result = callSumFunction.evaluateWithArguments([]);
            assert.strictEqual(result, 3);
        }
        tearDown();
    }

    // Test int32 min
    {
        setUp();

        let mirFunction = new mir.MirFunction('main')
        mirPackage.addElement(mirFunction);

        let entryBlock = new mir.MirBasicBlock(getOrMakeEmptySourcePosition(), 'entry');
        mirFunction.addBasicBlock(entryBlock);

        let builder = new mir.MirBuilder(mirFunction, entryBlock);
        let firstArgument = builder.argumentInt32At(getOrMakeEmptySourcePosition(), 'first');
        let secondArgument = builder.argumentInt32At(getOrMakeEmptySourcePosition(), 'second');
        let isLessThan = builder.int32LessThanAt(firstArgument, secondArgument, getOrMakeEmptySourcePosition());

        let lessThanBlock = new mir.MirBasicBlock(getOrMakeEmptySourcePosition(), 'lessThan');
        let greaterThanBlock = new mir.MirBasicBlock(getOrMakeEmptySourcePosition(), 'greaterThan');
        builder.conditionalBranchAt(isLessThan, lessThanBlock, greaterThanBlock, getOrMakeEmptySourcePosition());

        mirFunction.addBasicBlock(lessThanBlock);
        builder.basicBlock = lessThanBlock;
        builder.returnInt32At(firstArgument, getOrMakeEmptySourcePosition());

        mirFunction.addBasicBlock(greaterThanBlock);
        builder.basicBlock = greaterThanBlock;
        builder.returnInt32At(secondArgument, getOrMakeEmptySourcePosition());

        let result = mirFunction.evaluateWithArguments([1, 2]);
        assert.strictEqual(result, 1);

        result = mirFunction.evaluateWithArguments([2, 1]);
        assert.strictEqual(result, 1);

        tearDown();
    }
}
