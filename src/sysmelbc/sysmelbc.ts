import * as fs from "fs"

let inputFileNames: string[] = [];
let outputFileName: string | null = null;

function printHelp() {
    console.log('nod sysmelbc.js <options> <inputFile>')
}

function printVersion() {
    console.log('sysmelbc version 0.1')
}

function parseCommandLine() {
    for(let i = 2; i < process.argv.length; ++i) {
        let arg = process.argv[i];
        if (!arg)
            throw new Error('Expected an argument');

        if (arg.startsWith('-')) {
            if(arg == '-h') {
                printHelp();
                process.exit(0);
            } else if(arg == '-v') {
                printVersion();
                process.exit(0);
            } else if(arg == '-o') {
                let output = process.argv[++i];
                if(!output) {
                    printHelp();
                    process.exit(0);
                }
                outputFileName = output;
            } else {
                printHelp();
                process.exit(1);
            }
        } else {
            inputFileNames.push(arg);
        }
    }

    // Check the pressence of input files.
    if(inputFileNames.length == 0) {
        printHelp();
        process.exit(0);
    }

    console.log(inputFileNames);
    console.log(outputFileName);
}

parseCommandLine();