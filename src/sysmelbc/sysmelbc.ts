import * as parseTree from "./parsetree.js"
import * as parser from "./parser.js"
import * as hir from "./hir.js"
import * as assert from 'assert';

class FrontEndDriver {
    context: hir.HIRContext;
    outputFileName: string | null = null;

    constructor() {
        this.context = new hir.HIRContext();
    }

    printHelp() {
        console.log('node sysmelbc.js <options> <inputFile>')
    }

    printVersion() {
        console.log('sysmelbc version 0.1')
    }

    evaluateAST(ast: parseTree.ParseTreeNode) : hir.HIRValue {
        assert.ok(new parseTree.ParseTreeParseErrorVisitor().checkAndPrintErrors(ast));
        let evaluationContext = this.context.createTopLevelEvaluationContext(ast.sourcePosition.getSourceCode());
        return new hir.AnalysisAndEvaluationPass(evaluationContext).visitDecayedNode(ast);
    }

    evaluateString(sourceString: string) : hir.HIRValue {
        let ast = parser.parseSourceString(sourceString)
        return this.evaluateAST(ast);
    }
    
    evaluateAndPrintString(sourceString: string) {
        let value = this.evaluateString(sourceString);
        console.log(value.toString())
    }

    evaluateFileNamed(fileName: string) : hir.HIRValue {
        let ast = parser.parseFileNamed(fileName);
        return this.evaluateAST(ast);
    }

    parseCommandLine() {
        let hasInput = false;

        for(let i = 2; i < process.argv.length; ++i) {
            let arg = process.argv[i];
            if (!arg)
                throw new Error('Expected an argument');

            if (arg.startsWith('-')) {
                if(arg == '-h') {
                    this.printHelp();
                    process.exit(0);
                } else if(arg == '-v') {
                    this.printVersion();
                    process.exit(0);
                } else if(arg == '-o') {
                    let output = process.argv[++i];
                    if(!output) {
                        this.printHelp();
                        process.exit(0);
                    }
                    this.outputFileName = output;
                } else if(arg == '-print-eval') {
                    let script = process.argv[++i];
                    if(!script)
                        throw new Error('Expected script to evaluate and print.')
                    this.evaluateAndPrintString(script);
                    hasInput = true;
                } else if(arg == '-eval') {
                    let script = process.argv[++i];
                    if(!script)
                        throw new Error('Expected script to evaluate.')
                    this.evaluateString(script);
                    hasInput = true;
                } else {
                    this.printHelp();
                    process.exit(1);
                }
            } else {
                hasInput = true;
                this.evaluateFileNamed(arg);
            }
        }

        // Check the pressence of input files.
        if(!hasInput) {
            this.printHelp();
            process.exit(0);
        }

        if(!this.outputFileName)
            return;
    }

    main() {
        this.parseCommandLine();
    }
}

new FrontEndDriver().main()
