import * as types from '@babel/types';
import { isImportSpecifier, ImportDeclaration, ImportSpecifier, Identifier } from '@babel/types';
import { NodePath } from '@babel/core';

export default (_: any, config: any) => {
    if (config.libraryName === undefined) {
        console.warn('config.libraryName is required');
        return {};
    }
    return {
        visitor: {
            ImportDeclaration(nodePath: NodePath<ImportDeclaration>, state: any) {
                const sourceName = nodePath.node.source.value;
                const libraryDirectory = config.libraryDirectory ? `/${config.libraryDirectory}` : '';
                if (sourceName !== config.libraryName) {
                    return;
                }

                const sourceValue = nodePath.node.source.value;
                const memberImports = nodePath.node.specifiers.filter((specifier) => isImportSpecifier(specifier));
                const fullImports = nodePath.node.specifiers.filter((specifier) => !isImportSpecifier(specifier));
                if (memberImports.length > 0) {
                    // make newNodes
                    const newNodes = memberImports.map((item: ImportSpecifier) => {
                        const localName = item.local.name;
                        const importedName = (item.imported as Identifier).name;
                        const newSource = types.stringLiteral(`${sourceValue}${libraryDirectory}/${importedName}`);
                        const newSpecifier = types.importDefaultSpecifier(types.identifier(localName));
                        const newNode = types.importDeclaration([newSpecifier], newSource);
                        return newNode;
                    });

                    if (fullImports.length > 0) {
                        newNodes.unshift(types.importDeclaration(fullImports, nodePath.node.source));
                    }

                    // replace
                    nodePath.replaceWithMultiple(newNodes);
                }
            }
        }
    };
};
