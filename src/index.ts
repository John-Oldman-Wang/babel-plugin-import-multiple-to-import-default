import * as types from '@babel/types';
import { isImportSpecifier, ImportDeclaration, ImportSpecifier, Identifier } from '@babel/types';
import { NodePath } from '@babel/core';

export default (_: any, config: any) => {
    const s = new WeakSet();
    return {
        visitor: {
            ImportDeclaration(nodePath: NodePath<ImportDeclaration>) {
                const sourceName = nodePath.node.source.value;
                if (sourceName !== config.libraryName) {
                    return;
                }
                if (s.has(nodePath.node)) {
                    return;
                }
                const needClone: ImportSpecifier[] = [];
                const needKeep = [];
                for (let i = 0; i < nodePath.node.specifiers.length; i++) {
                    const item = nodePath.node.specifiers[i];
                    if (isImportSpecifier(item)) {
                        needClone.push(item);
                    } else {
                        needKeep.push(item);
                    }
                }

                if (needClone.length !== 0) {
                    needClone.reverse().forEach((item: ImportSpecifier) => {
                        const localName = item.local.name;
                        const importedName = (item.imported as Identifier).name;

                        const newNode = types.clone(nodePath.node);

                        // change source
                        const newSource = types.stringLiteral(`${newNode.source.value}/${importedName}`);
                        newNode.source = newSource;

                        // change specifiers

                        const newSpecifier = types.importDefaultSpecifier(types.identifier(localName));
                        newNode.specifiers = [newSpecifier];

                        // insert
                        s.add(newNode);
                        nodePath.insertAfter(newNode as any);
                        // return newNode;
                    });

                    // change old node specifiers
                    nodePath.node.specifiers = needKeep;
                    if (needKeep.length === 0) {
                        !nodePath.removed && nodePath.remove();
                    }
                }
            }
        }
    };
};
