# TypeScript Node API StarterPack
[![Dependency Status](https://david-dm.org/feredean/node-api-starter.svg)](https://david-dm.org/feredean/node-api-starter) [![CircleCI](https://circleci.com/gh/feredean/node-api-starter.svg?style=shield)](https://circleci.com/gh/feredean/node-api-starter)

**Live Demo**: [https://node-api-starter.experiments.explabs.io](https://node-api-starter.experiments.explabs.io)

A boilerplate for Node.js APIs.

This project has two purposes:

1. Provide a boilerplate for modern Node.js API development with the following requirements
    - fully configured development environment
    - created to be used primarily as a backend for modern SPAs or PWAs
    - have all the most common requirements already implemented (authentication, database integration, CI integration and more)
    <!-- - in depth documentation that does not stop at the app and also discusses deployment options with Kubernetes -->
1. Serve as a reference for implementations that can vary from how to set up continuous deployment using CircleCI to getting rid of those mildly annoying `../../../../` imports.

# Table of contents

- [Requirements](#requirements)
  - [Quick start](#quick-start)
  - [Fancy start](#fancy-start)
- [Getting started](#getting-started)
- [Deployment](#deployment)
  - [Prerequisites](#prerequisites)
  - [Deploying to kubernetes](#deploying-to-kubernetes)
  - [CircleCI](#circleci)
- [Project Structure](#project-structure)
- [Build scripts](#build-scripts)
- [Import path workaround](#import-path-workaround)
- [Debugging](#debugging)
- [Testing](#testing)
  - [Integration tests and jest](#integration-tests-and-jest)
  - [Configure Jest](#configure-jest)
  - [Running tests](#running-tests)
  - [Linting](#linting)
  - [VSCode Extensions](#vscode-extensions)
- [Dependencies](#dependencies)
  - [`production`](#production)
  - [`development`](#development)
- [Tips & Tricks](#tips-&-tricks)
- [Related projects](#related-projects)
- [License](#license)

# Requirements

There are two ways to go about handling requirements. You can either follow the quick start path where you dump all the dependencies in your system or you can go down the fancy setup that will give you more flexibility in the future by using nvm and docker.

## Quick start

- Install [Node.js](https://nodejs.org/en/)
- Install [MongoDB](https://docs.mongodb.com/manual/installation/)
- Install [VS Code](https://code.visualstudio.com/)

## Fancy start

- Install [Node Version Manager](https://github.com/nvm-sh/nvm#installation-and-update)
- Configure nvm [Shell Integration](https://github.com/nvm-sh/nvm#deeper-shell-integration) (highly recommend setting up zsh together with [oh my zsh](https://github.com/robbyrussell/oh-my-zsh)). Once you set it up it will automatically change the node version if the project has a `.nvmrc` file.
- Install [docker](https://docs.docker.com/install/)
- Run MongoDB in a docker container `docker run --name mongo-dev -p 27017:27017 mongo:4.0`

# Getting started

```shell
# Get the latest snapshot
git clone --depth=1 https://github.com/feredean/node-api-starter.git <project_name>

# Change directory
cd <project_name>

# Install dependencies
npm install

# Build the project
npm run build

# Copy the .env.example contents into the .env
cat .env.example > .env

# The STARTER_PATH env variable will be needed each time you run the API, be sure to persist it
# If you decide to change the env variable name be sure to also change it in package.json build scripts
export STARTER_PATH="$(pwd)/dist"

# Run (development mode) the API on port 9100
npm run watch
```

To build the project in VS Code press `cmd + shift + b`. You can also run tasks using the command pallet (`cmd + shift + p`) and select `Tasks: Run Task` > `npm: start` to run `npm start` for you.

Finally, navigate to `http://localhost:9100` and you now have access to your API

# Deployment

The example in this project is built around the existence of a kubernetes cluster. You can easily change to your infrastructure of choice by changing the deploy step in `.circleci/config.yml` to pull the docker image wherever you need it.

```yaml
  # pull the image from docker hub and deploy it to the k8s cluster
  deploy:
    docker:
      - image: feredean/circleci-kops:0.1.0
    environment:
      IMAGE_NAME: feredean/node-api-starter
      KOPS_STATE_STORE: s3://k8s-explabs-io-state-store
    steps:
      - run:
          name: Deploy to k8s cluster
          command: |
            # Ensure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set in the project's env vars
            kops export kubecfg --name k8s.explabs.io
            kubectl set image deploy/node-api-starter node-api-starter=$IMAGE_NAME:$CIRCLE_SHA1
```

## Prerequisites

### Kubernetes

Depending on your cloud provider of choice you can fairly quickly set up a managed, production-ready environment for deploying containerized applications.

- Google's [GKE](https://cloud.google.com/kubernetes-engine/)
- Amazon's [EKS](https://aws.amazon.com/eks/)
- Microsoft's [AKS](https://azure.microsoft.com/en-in/services/kubernetes-service/)

This project is deployed on a cluster set up with [kops](https://github.com/kubernetes/kops) on [aws spot instances](https://aws.amazon.com/ec2/spot/). If there is interest I plan on going more in depth on this subject and provide a walk-through.

### MongoDB

If you're like me and don't want the headache and uncertainty of managing your own production database take a look at [mongodb's atlas](https://www.mongodb.com/cloud/atlas). If you feel up to the task there are some kubernetes projects like [KubeDB](https://kubedb.com/) that can be of use.

## Deploying to Kubernetes

First you need to have an `.env.prod` file that has all the secrets that will be used in production. A `node-starter` secret needs to be created, it is used by the API deployment.

```zsh
kubectl create secret generic node-starter --from-env-file=.env.prod
```

Notice that in `deployment.yaml` the environment is loaded from the node-starter secret

```yaml
envFrom:
- secretRef:
    name: node-starter
```

Finally you need to create the kubernetes deployment, service and optionally the horizontal pod autoscaler that can later be paired with the [cluster autoscaler](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler). To do this simply run the following:

```zsh
kubectl create -f deployment.yaml
```

If somehow a deadly bug has managed to make its way past the test suite and got deployed to production where it's wreaking havoc you need to run following command:

```zsh
kubectl rollout undo deployment <your deployment name>
```

This will instantly roll back the deployment to the previous one.

## CircleCI

To achieve continuous deployment I have chosen CircleCI. Recently Github has announced their new feature [actions](https://github.com/features/actions) which is currently still in beta. The GA release will still [take a while](https://twitter.com/natfriedman/status/1159514205940117504). When it's out I'm considering switching to it.

Now, to deploy on CircleCI:

1. Go to [CircleCI](https://circleci.com/) and create an account
1. Link your project
1. Add the needed environment variables to run the test

    ```zsh
    # Used to connect to the kubernetes cluster
    AWS_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY

    # Used for publishing the image
    DOCKERHUB_PASS
    DOCKERHUB_USERNAME
    ```

1. Make master branch a protected branch require `ci/circleci: test` check before merging from feature branches. Once a PR is merged into master CircleCI will automatically build, test and deploy the new version of the API.

Congratulations! You how have an API set up and ready to embrace the CD workflow!

# Project Structure

| Name | Description |
| ------------------------ | -----------------------------------------------------------------------------------------------------------|
| **.circleci**            | Contains CircleCI settings for continuous deployment                                                       |
| **.vscode**              | Contains VS Code specific settings                                                                         |
| **dist**                 | Contains the distributable (or output) from your TypeScript build. This is the code you ship               |
| **node_modules**         | Contains all your npm dependencies                                                                         |
| **src**                  | Contains your source code that will be compiled to the dist dir                                            |
| **src/api**              | Contains all the API versions each with it's own controllers for the configured routes                     |
| **src/config**           | Contains all the configuration needed to setup the API (express, routes and passport)                      |
| **src/models**           | Models define Mongoose schemas that will be used in storing and retrieving data from MongoDB               |
| **src/types**            | Holds .d.ts files not found on DefinitelyTyped                                                             |
| **src/utils**            | Contains API wide snippets (Logger, Error Formatter)                                                       |
| **src**/server.ts        | Entry point to your express app                                                                            |
| **test**                 | Contains your tests. Separate from source because there is a different build process                       |
| **test**/tsconfig.json   | Config settings for compiling the tests                                                                    |
| .env                     | All the env variables needed to run the app. Gitignored, will be loaded by dotenv                          |
| .env.example             | All the env variables needed to run the app. An example list of the keys that must exist in .env files     |
| .env.prod                | All the env variables needed to run the app in production. Gitignored, will be used in the deployment      |
| .eslintignore            | Config settings for paths to exclude from linting                                                          |
| .eslintrc                | Config settings for ESLint code style checking                                                             |
| .nvmrc                   | A file containing the node version used in the project automatically loaded by nvm                         |
| deployment.yaml          | Contains kubernetes configuration for running the app on a cluster (auto-scaling included)                 |
| Dockerfile               | Used to build the docker image in the `dockerize` job in `.circleci/config.yml`                            |
| jest.config.js           | Used to configure Jest running tests written in TypeScript                                                 |
| package.json             | File that contains npm dependencies as well as build scripts                                               |
| tsconfig.json            | Config settings for compiling server code written in TypeScript                                            |

# Build scripts

[npm scripts](https://docs.npmjs.com/misc/scripts) can be found in `package.json` in the `scripts` section. They can call each other which means it's very easy to compose complex builds out of simple individual build scripts.

Any build that runs the compiled `dist/server.js` must have the NODE_PATH set up. This is required for the [import path workaround](#import-path-workaround).

| Npm Script | Description |
| ------------------------- | -----------------------------------------------------------------------------------------------------------------|
| `start`                   | Runs node on `dist/server.js` which is the apps entry point                                                      |
| `build`                   | Full build. Runs `build-ts` and `lint` build tasks                                                               |
| `build-ts`                | Compiles all source `.ts` files to `.js` files in the `dist` folder                                              |
| `watch`                   | Runs `watch-ts` and `watch-node` concurrently. Use this for development                                          |
| `watch-node`              | Runs node with nodemon so the process restarts if it crashes or a change is made. Used in the main `watch` task  |
| `watch-ts`                | Same as `build-ts` but continuously watches `.ts` files and re-compiles when needed                              |
| `test`                    | Runs tests using Jest test runner verbosely and generate a coverage report                                       |
| `watch-test`              | Runs tests in watch mode                                                                                         |
| `lint`                    | Runs ESLint on project files                                                                                     |
| `check-deps`              | Audits and upgrades (inside package.json run npm install to apply) dependencies to their latest stable version   |
|<img width=100/>||

# Import path workaround

> module names are considered resource identifiers, and are mapped to the output as they appear in the source

As a result the import paths will be copied over to the compiled js require paths. The compiled code will not work since the tsconfig options are not applied to the output. The Typescript compiler does not want to become a build tool. Normally in frontend projects this is taken care of by build tools such as webpack. There are packages that can solve this problem, more on this issue and possible solutions can be found in <https://github.com/microsoft/TypeScript/issues/10866>.

The approach chosen for this project is to:

1. Add a `NODE_PATH` env variable that points to the `dist` folder. The path will be taken from an env variable in the system. For deployment the path will be set in the Dockerfile after copying over the dist.

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

# Debugging

Debugging TypeScript requires source maps to be enabled in `tsconfig.json`:

```json
"compilerOptions" {
    "sourceMap": true
}
```

In `.vscode` folder you can find the `launch.json` file. Here you can find the configuration that tells VS Code how to attach the debugger to the node process.

```json
{
    "type": "node",
    "request": "attach",
    "name": "Attach Debugger to Process ID",
    "processId": "${command:PickProcess}",
    "protocol": "inspector"
}
```

Once this configuration is added make sure the app is running `npm run watch`, add breakpoints, hit `F5`, select the `node dist/server.js` process (usually the first one) and you're ready to go!

# Testing

This project uses [Jest](https://facebook.github.io/jest/). When writing tests that interact with mongoose keep [this](https://mongoosejs.com/docs/jest.html) in mind.

## Integration tests and jest

When writing integration tests that use a shared resource (a database for example) you need to keep in mind that jest will test separate files in parallel which will lead to tests interfering with each other. For example lets say you want to test that `GET /v1/account/` will return a user you inserted just before you made the call. In another file you need to create a user in order to test something else. If you use the same database it is possible that `GET /v1/account/` will sometimes return one user (the one inserted in the test) and other times return multiple users (that got inserted by other tests).

In order to avoid this you have some options:

- Keep all the tests that use a shared resource in the same file
- Get [really creative](https://stackoverflow.com/a/52029468/1906892) with your setup
- Use the option `--runInBand` to force all the tests to run serially in the current process
- Set up the tests in such a way that each file uses a separate database

After running into issue with all the other options I decided to move all the tests into one file.  

## Configure Jest

In order to properly load modules in the test suites a new `test/tsconfig.json` file is needed.

In `jest.config.js` you can find `setupFilesAfterEnv: ["./test/setup.ts"]` where the test environment variables are set. In the setup file you can also find the `initMongo` and `disconnectMongo` helper functions. They are used to connect/disconnect to the test database and empty the database before starting a test. The Typescript compilation to JS will happen in memory using the `test/tsconfig.json` file.

## Running tests

To run the tests simply use `npm test`. If you want to use jest `watch mode` use `npm run watch-test`.

## Linting

This year [Palantir has announced](https://medium.com/palantir/tslint-in-2019-1a144c2317a9) the deprecation of TSLint.

> In order to avoid bifurcating the linting tool space for TypeScript, we therefore plan to deprecate TSLint and focus our efforts instead on improving ESLint’s TypeScript support.

This project is using `ESLint` with `typescript-eslint/recommended` settings.

## VSCode Extensions

- [VS Code ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)

# Dependencies

## `production`

| Package                         | Description                                                              |
| ------------------------------- | -------------------------------------------------------------------------|
| aws-sdk                         | Amazon Web Services SDK - used to connect to s3                          |
| bcrypt                          | A library to help you hash passwords.                                    |
| body-parser                     | Express 4 middleware.                                                    |
| compression                     | Express 4 middleware.                                                    |
| cors                            | Express middleware that can be used to enable CORS with various options  |
| dotenv                          | Loads environment variables from .env file.                              |
| express                         | Node.js web framework.                                                   |
| fbgraph                         | Facebook Graph API library.                                              |
| jsonwebtoken                    | An implementation of JSON Web Tokens.                                    |
| lodash                          | General utility library.                                                 |
| mongoose                        | MongoDB ODM.                                                             |
| morgan                          | HTTP request logger middleware                                           |
| multer                          | Middleware for handling multipart/form-data                              |
| nodemailer                      | Node.js library for sending emails.                                      |
| passport                        | Simple and elegant authentication library for node.js                    |
| passport-facebook               | Sign-in with Facebook plugin.                                            |
| passport-local                  | Sign-in with Username and Password plugin.                               |
| uuid                            | Simple, fast generation of RFC4122 UUIDS.                                |
| validator                       | A library of string validators and sanitizers.                           |
| winston                         | Logging library                                                          |

## `development`

| Package                         | Description                                                                            |
| ------------------------------- | ---------------------------------------------------------------------------------------|
| @types                          | Dependencies in this folder are `.d.ts` files used to provide types                    |
| concurrently                    | Utility that manages multiple concurrent tasks. Used with npm scripts                  |
| eslint                          | Linter for JavaScript and TypeScript files                                             |
| jest                            | Testing library for JavaScript                                                         |
| nodemon                         | Utility that automatically restarts node process on code changes                       |
| npm-check-updates               | Upgrades package.json dependencies to the latest versions, ignoring specified version  |
| supertest                       | HTTP assertion library                                                                 |
| ts-jest                         | A preprocessor with sourcemap support to help use TypeScript with Jest                 |
| typescript                      | JavaScript compiler/type checker that boosts JavaScript productivity                   |

To install or update these dependencies you can use `npm install` or `npm update`.

# Tips & Tricks

This section is a list of resources for building an API that can be useful in certain situations

- If you are unsure what format your API's JSON responses should have take a look at this [specification](https://jsonapi.org/) and see if it could work for your project.
- [Kong](https://github.com/Kong/kong) is a cloud-native, fast, scalable, and distributed Microservice Abstraction Layer (also known as an API Gateway, API Middleware or in some cases Service Mesh). It boasts a lot of cool [features](https://github.com/Kong/kong#features) and of course works with [kubernetes](https://github.com/Kong/kubernetes-ingress-controller)
- RESTful API Modeling Language ([RAML](https://raml.org/)) makes it easy to manage the whole API lifecycle from design to sharing. It's concise - you only write what you need to define - and reusable. It is machine readable API design that is actually human friendly.

# Related projects

I highly recommend taking a look at both Sahat's [Hackathon Starter](https://github.com/sahat/hackathon-starter) and Microsoft's [TypeScript Node Starter](https://github.com/microsoft/TypeScript-Node-Starter). Both have been great help and a source of inspiration for setting up this project.

# License

The MIT License (MIT)

Copyright (c) 2019 Tiberiu Feredean

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
