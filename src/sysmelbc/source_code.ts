export class SourceCode {
    text: string;
    name: string;
    directory: string
    
    constructor(text: string, name: string, directory: string) {
        this.text = text;
        this.name = name;
        this.directory = directory;
    }
}

export class SourcePosition {
    sourceCode: SourceCode;
    startIndex: number;
    endIndex: number;

    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;

    constructor(sourceCode: SourceCode,
        startIndex: number, endIndex: number,
        startLine: number, startColumn: number,
        endLine: number, endColumn: number) {

        this.sourceCode = sourceCode;
        this.startIndex = startIndex;
        this.endIndex = endIndex;

        this.startLine = startLine;
        this.startColumn = startColumn;
        this.endLine = endLine;
        this.endColumn = endColumn;
    }

    getValue() : string {
        return this.sourceCode.text.substring(this.startIndex, this.endIndex)
    }

    until(endSourcePosition: SourcePosition) : SourcePosition {
        return new SourcePosition(this.sourceCode,
                this.startIndex, endSourcePosition.startIndex,
                this.startLine, this.startColumn,
                endSourcePosition.startLine, endSourcePosition.startColumn 
        )
    }

    to(endSourcePosition: SourcePosition) : SourcePosition {
        return new SourcePosition(this.sourceCode,
                this.startIndex, endSourcePosition.endIndex,
                this.startLine, this.startColumn,
                endSourcePosition.endLine, endSourcePosition.endColumn,
        )
    }
}