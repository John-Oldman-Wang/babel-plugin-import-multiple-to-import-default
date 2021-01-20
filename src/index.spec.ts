import { readFile, readdirSync } from 'fs';
import { promisify } from 'util';
import { resolve } from 'path';
import { equal } from 'assert';
import { transform } from '@babel/core';
import plugin from './index';

const readCode = (path: string) => promisify(readFile)(path).then((buf) => buf.toString());
const testDir = resolve(__dirname, './test');

describe('babel plugin', function () {
    const result = readdirSync(testDir);
    const caseDirs = result.map((item) => {
        return {
            name: item,
            path: resolve(testDir, item)
        };
    });
    describe('single', function () {
        caseDirs
            .filter((item) => {
                // return item.name === 'import-default-multiple'
                return true;
            })
            .forEach(({ name, path }) => {
                it(name, async function () {
                    const sourceCode = await readCode(resolve(path, './source.js'));
                    const resultCode = await readCode(resolve(path, './result.js'));
                    const result = transform(sourceCode, {
                        generatorOpts: {
                            jsescOption: {
                                quotes: 'single'
                            }
                        },
                        plugins: [
                            [
                                plugin,
                                {
                                    // libraryName: 'some-module'
                                }
                            ]
                        ]
                    });

                    equal(result.code, resultCode);
                });
            });
    });
});
