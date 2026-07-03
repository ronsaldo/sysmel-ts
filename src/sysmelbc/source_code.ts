export class SourceCode {
    text: string;
    name: string;
    directory: string
    
    constructor(text: string, name: string, directory: string) {
        this.text = text;
        this.name = name;
        this.directory = directory;
    }

    toString(): string {
        if (this.directory.length !== 0)
            return this.directory + '/' + this.name;
        return this.name;
    }
}

export abstract class AbstractSourcePosition {
    formatMessage(message: string) : string {
        return message;
    }

    getSourceCode(): SourceCode | null {
        return null;
    }

};

export class EmptySourcePosition extends AbstractSourcePosition {
    // Nothing is required here
}

export class SourcePosition extends AbstractSourcePosition{
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
        super();

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

    toString(): string {
        return this.sourceCode.toString()
            + ':' + this.startLine.toString() + '.' + this.startColumn.toString()
            + '-' + this.endLine.toString() + '.' + this.endColumn.toString();
    } 
    
    formatMessage(message: string) : string {
        return this.toString() + ': ' + message;
    }

    getSourceCode(): SourceCode | null {
        return this.sourceCode;
    }

}

let emptySourcePosition = new EmptySourcePosition;
export function getOrMakeEmptySourcePosition()
{
    return emptySourcePosition;
}
