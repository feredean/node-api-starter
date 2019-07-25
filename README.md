# Node API StarterPack

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
| package.json             | File that contains npm dependencies as well as [build scripts](#what-if-a-library-isnt-on-definitelytyped)                          |
| tsconfig.json            | Config settings for compiling server code written in TypeScript                               |

## TypeScript Node Starter

Heavily inspired from https://github.com/microsoft/TypeScript-Node-Starter. It's basically a stripped down version with some personal flavour mixed in.
