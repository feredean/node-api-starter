# TypeScript Node API StarterPack - WORK IN PROGRESS

[![Dependency Status](https://david-dm.org/feredean/node-api-starter.svg)](https://david-dm.org/feredean/node-api-starter) [![CircleCI](https://circleci.com/gh/feredean/node-api-starter.svg?style=svg)](https://circleci.com/gh/feredean/node-api-starter)

| Name | Description |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| **.vscode**              | Contains VS Code specific settings                                                            |
| **dist**                 | Contains the distributable (or output) from your TypeScript build. This is the code you ship  |
| **node_modules**         | Contains all your npm dependencies                                                            |
| **src**                  | Contains your source code that will be compiled to the dist dir                               |
| **src/config**           | Passport authentication strategies and login middleware. Add other complex config code here   |
| **src/controllers**      | Controllers define functions that respond to various http requests                            |
| **src/models**           | Models define Mongoose schemas that will be used in storing and retrieving data from MongoDB  |
| **src/types**            | Holds .d.ts files not found on DefinitelyTyped. Covered more in this [section](#type-definition-dts-files)          |
| **src**/server.ts        | Entry point to your express app                                                               |
| **test**                 | Contains your tests. Separate from source because there is a different build process.         |
| .env                     | API keys, tokens, passwords, database URI. Gitignored, will be loaded by dotenv               |
| .env.example             | API keys, tokens, passwords, database URI. An example list of the keys that should exist in .env |
| .eslintignore            | Config settings for paths to exclude from linting                                             |
| .eslintrc                | Config settings for ESLint code style checking                                                |
| .nvmrc                   | A file containing the node version used in the project automatically loaded by nvm            |
| jest.config.js           | Used to configure Jest running tests written in TypeScript                                    |
| package.json             | File that contains npm dependencies as well as [build scripts](#what-if-a-library-isnt-on-definitelytyped)                        |
| tsconfig.json            | Config settings for compiling server code written in TypeScript                               |

## Import path workaround

> module names are considered resource identifiers, and are mapped to the output as they appear in the source

As a result the import paths will be copied over to the compiled js require paths. The compiled code will not work since the tsconfig options are not applied to the output. The Typescript compiler does not want to become a build tool. Normally in frontend projects this is taken care of by build tools such as webpack. There are packages that can solve this problem, more on this issue and possible solutions can be found in <https://github.com/microsoft/TypeScript/issues/10866>.

The approach chosen for this project is to:

1. Add a NODE_PATH env variable that points to the dist folder. The path will be taken from an env variable in the system. For deployment we will later set the path in the Dockerfile after copying over the dist.

    ```json
        "watch-node": "NODE_PATH=$STARTER_PATH nodemon dist/server.js"
    ```

2. Let the compiler know to look in the src folder for modules.

    ```json
    {
        "paths": {
            "*": [
                "src/*",
                "node_modules/*",
                "src/types/*"
            ]
        }
    }
    ```

## TypeScript Node Starter

Heavily inspired from <https://github.com/microsoft/TypeScript-Node-Starter>. It's basically a stripped down version with some personal flavour mixed in.

## CI Pipeline
<!-- kubectl create secret generic node-starter --from-env-file=.env.prod -->
<https://circleci.com/docs/2.0/local-cli/#validate-a-circleci-config>
<!-- circleci local execute -->