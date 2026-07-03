import {AbstractSourcePosition, getOrMakeEmptySourcePosition} from "./source_code.js"
import * as parseTree from "./parsetree.js"
import * as hir from "./hir.js"

export class AnalysisAndEvaluationPass extends parseTree.ParseTreeVisitor {
    evaluationContext: hir.HIREvaluationContext;

    constructor(evaluationContext: hir.HIREvaluationContext) {
        super();
        this.evaluationContext = evaluationContext;
    }

    visitErrorNode(node: parseTree.ParseTreeErrorNode): any {
        throw new Error(node.sourcePosition.formatMessage(node.errorMessage));
    }

    visitParseErrorNode(node: parseTree.ParseTreeParseErrorNode): any {
        throw new Error(node.sourcePosition.formatMessage(node.errorMessage));
    }

    visitApplicationNode(node: parseTree.ParseTreeApplicationNode): any {
        throw new Error('TODO ParseTreeApplicationNode AnalysisAndEvaluationPass');
    }

    visitAssignmentNode(node: parseTree.ParseTreeAssignmentNode): any {
        throw new Error('TODO ParseTreeAssignmentNode AnalysisAndEvaluationPass');
    }

    visitAssociationNode(node: parseTree.ParseTreeAssociationNode): any {
        throw new Error('TODO ParseTreeAssociationNode AnalysisAndEvaluationPass');
    }

    visitBinaryExpressionSequenceNode(node: parseTree.ParseTreeBinaryExpressionSequenceNode): any {
        throw new Error('TODO ParseTreeBinaryExpressionSequenceNode AnalysisAndEvaluationPass');
    }

    visitDictionaryNode(node: parseTree.ParseTreeDictionaryNode): any {
        throw new Error('TODO ParseTreeDictionaryNode AnalysisAndEvaluationPass');
    }
    
    visitIdentifierReferenceNode(node: parseTree.ParseTreeIdentifierReferenceNode): any {
        throw new Error('TODO ParseTreeIdentifierReferenceNode AnalysisAndEvaluationPass');
    }

    visitArgumentDefinitionNode(node: parseTree.ParseTreeArgumentDefinitionNode): any {
        throw new Error('TODO ParseTreeArgumentDefinitionNode AnalysisAndEvaluationPass');
    }

    visitFunctionTypeNode(node: parseTree.ParseTreeFunctionTypeNode): any {
        throw new Error('TODO ParseTreeFunctionTypeNode AnalysisAndEvaluationPass');
    }

    visitFunctionNode(node: parseTree.ParseTreeFunctionNode): any {
        throw new Error('TODO ParseTreeFunctionNode AnalysisAndEvaluationPass');
    }

    visitLexicalBlockNode(node: parseTree.ParseTreeLexicalBlockNode): any {
        let childEnvironment = new hir.HIRLexicalEnvironment(this.evaluationContext.environment);
        let oldEnvironment = this.evaluationContext.environment;

        let result = this.visitNode(node.body) as hir.HIRValue;

        this.evaluationContext.environment = oldEnvironment;
        
        return result;
    }

    visitLiteralCharacterNode(node: parseTree.ParseTreeLiteralCharacterNode): any {
        return new hir.HIRConstantLiteralCharacterValue(node.value, this.evaluationContext.context.coreTypes.characterType, node.sourcePosition);
    }

    visitLiteralFloatNode(node: parseTree.ParseTreeLiteralFloatNode): any {
        return new hir.HIRConstantLiteralFloatValue(node.value, this.evaluationContext.context.coreTypes.floatType, node.sourcePosition);
    }

    visitLiteralIntegerNode(node: parseTree.ParseTreeLiteralIntegerNode): any {
        return new hir.HIRConstantLiteralIntegerValue(node.value, this.evaluationContext.context.coreTypes.integerType, node.sourcePosition);
    }

    visitLiteralStringNode(node: parseTree.ParseTreeLiteralStringNode): any {
        return new hir.HIRConstantLiteralStringValue(node.value, this.evaluationContext.context.coreTypes.stringType, node.sourcePosition);
    }

    visitLiteralSymbolNode(node: parseTree.ParseTreeLiteralSymbolNode): any {
        return new hir.HIRConstantLiteralSymbolValue(node.value, this.evaluationContext.context.coreTypes.symbolType, node.sourcePosition);
    }

    visitLiteralValueNode(node: parseTree.ParseTreeLiteralValueNode): any {
        return node.value as hir.HIRValue;
    }

    visitCascadedMessageNode(node: parseTree.ParseTreeCascadedMessageNode): any {
        throw new Error('TODO visitCascadedMessageNode AnalysisAndEvaluationPass');
    }

    visitMessageCascadeNode(node: parseTree.ParseTreeMessageCascadeNode): any {
        throw new Error('TODO visitMessageCascadeNode AnalysisAndEvaluationPass');
    }

    visitMessageSendNode(node: parseTree.ParseTreeMessageSendNode): any {
        throw new Error('TODO visitMessageSendNode AnalysisAndEvaluationPass');
    }

    visitSequenceNode(node: parseTree.ParseTreeSequenceNode): any {
        let result: hir.HIRValue = this.evaluationContext.context.coreTypes.voidValue;
        for(let i = 0; i < node.elements.length; ++i) {
            result = this.visitNode(node.elements[i] as parseTree.ParseTreeNode) as hir.HIRValue;
        }

        return result
    }

    visitTupleNode(node: parseTree.ParseTreeTupleNode): any {
        throw new Error('TODO visitTupleNode AnalysisAndEvaluationPass');
    }

    visitQuoteNode(node: parseTree.ParseTreeQuoteNode): any {
        return new hir.HIRConstantLiteralParseTree(node.expression, this.evaluationContext.context.coreTypes.parseTreeType, node.sourcePosition);
    }

    visitQuasiQuoteNode(node: parseTree.ParseTreeQuasiQuoteNode): any {
        throw new Error('TODO visitQuasiQuoteNode AnalysisAndEvaluationPass');
    }

    visitQuasiUnquoteNode(node: parseTree.ParseTreeQuasiUnquoteNode): any {
        throw new Error(node.sourcePosition.formatMessage('Invalid location for a quasi-unquote.'));
    }

    visitSpliceNode(node: parseTree.ParseTreeSpliceNode): any {
        throw new Error(node.sourcePosition.formatMessage('Invalid location for a splice.'));
    }

    visitVariableDefinitionNode(node: parseTree.ParseTreeVariableDefinitionNode): any {
        throw new Error(node.sourcePosition.formatMessage('visitVariableDefinitionNode.'));
    }

    visitIfSelectionNode(node: parseTree.ParseTreeIfSelectionNode): any {
        throw new Error(node.sourcePosition.formatMessage('visitIfSelectionNode.'));
    }

    visitSwitchSelectionNode(node: parseTree.ParseTreeSwitchSelectionNode): any {
        throw new Error(node.sourcePosition.formatMessage('visitSwitchSelectionNode.'));
    }

    visitReturnNode(node: parseTree.ParseReturnNode): any {
        throw new Error(node.sourcePosition.formatMessage('visitReturnNode.'));
    }

    visitWhileDoNode(node: parseTree.ParseWhileDoNode): any {
        throw new Error(node.sourcePosition.formatMessage('visitWhileDoNode.'));
    }

    visitDoWhileNode(node: parseTree.ParseDoWhileNode): any {
        throw new Error(node.sourcePosition.formatMessage('visitDoWhileNode.'));
    }

}
