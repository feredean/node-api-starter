**While the project can still be used for reference, the reality is that it has aged and no longer reflects best practices. To make this clear, the project is now archived.**

# Typescript Node API Starter (Archived)

[![CircleCI](https://circleci.com/gh/feredean/node-api-starter.svg?style=shield)](https://circleci.com/gh/feredean/node-api-starter)

**Live App Demo**: [https://node-api-starter-angular-app.experiments.explabs.io](https://node-api-starter-angular-app.experiments.explabs.io)  
**Live API**: [https://node-api-starter.experiments.explabs.io/v1/hello](https://node-api-starter.experiments.explabs.io/v1/hello)

A boilerplate for Node.js APIs designed for app consumption, written in Typescript.

This project has two purposes:

1. Provide a boilerplate for modern Node.js API development with the following requirements
   - fully configured development environment
   - created to be used primarily as a backend for SPAs or PWAs
   - have all the most common requirements already implemented (authentication, database integration, CI integration and more)
     <!-- - in depth documentation that does not stop at the app and also discusses deployment options with Kubernetes -->
1. Serve as a reference for various implementations from CD with CircleCI to putting it all together with an example app.

You can find the Angular App source code here [https://github.com/feredean/node-api-starter-angular-app](https://github.com/feredean/node-api-starter-angular-app)

# Table of contents

- [Requirements](#requirements)
  - [Quick start](#quick-start)
  - [Fancy start](#fancy-start)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Deployment](#deployment)
  - [Prerequisites](#prerequisites)
  - [Deploying to kubernetes](#deploying-to-kubernetes)
  - [CircleCI](#circleci)
- [Project structure](#project-structure)
- [Build scripts](#build-scripts)
- [Import path quirks](#import-path-quirks)
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
- [Resources](#resources)
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
- Run MongoDB in a docker container `docker run -d --name mongo-dev -p 27017:27017 mongo:4.0`

# Getting started

Set VSCode's Typescript import module specifier for the workspace to `relative` for more information have a look [here](#import-path-quirks)

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

# Run (development mode) the API on port 9100
npm run watch
```

To build the project in VS Code press `cmd + shift + b`. You can also run tasks using the command pallet (`cmd + shift + p`) and select `Tasks: Run Task` > `npm: start` to run `npm start` for you.

Finally, navigate to [http://localhost:9100/v1/hello](http://localhost:9100/v1/hello) and you now have access to your API

# Environment variables

For how environment variables are imported and exported have a look in [src/config/secrets](src/config/secrets.ts). Here you can also change the `requiredSecrets` or the way `mongoURI` is constructed if for example you wish to use username/password when connecting to mongo in the development environment.

| Name                  | Description                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
|                       | The session secret is used to sign the JWT tokens                                                                                     |
| SESSION_SECRET        | A quick way to generate a secret: `node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"`                     |
|                       | The mongo host and port are not necessarily taken from the `.env` file they can be provided by the deployment environment such as k8s |
| MONGO_HOST            | mongo host                                                                                                                            |
| MONGO_PORT            | mongo port                                                                                                                            |
| MONGO_DATABASE        | name of the database                                                                                                                  |
| MONGO_USERNAME        | mongo user - not used for development, required for production                                                                        |
| MONGO_PASSWORD        | mongo user's password - not used for development, required for production                                                             |
|                       | Facebook credentials used for sign in with Facebook - currently not implemented                                                       |
| FACEBOOK_ID           | Facebook ID                                                                                                                           |
| FACEBOOK_SECRET       | Facebook Secret                                                                                                                       |
|                       | Sendgrid credentials used by the `nodemailer` package in forgot/reset password functionality                                          |
| SENDGRID_USER         | Sendgrid account user name                                                                                                            |
| SENDGRID_PASSWORD     | Sendgrid account password                                                                                                             |
|                       | AWS user used for uploading files to s3 with `AmazonS3FullAccess` Policy                                                              |
| AWS_ACCESS_KEY_ID     | AWS Access key ID                                                                                                                     |
| AWS_ACCESS_KEY_SECRET | AWS Access key secret                                                                                                                 |
|                       | This will be used to create a REGEX that will block origins that don't match                                                          |
| CORS_REGEX            | use `localhost:\d{4}$` for development and `domain\.tld$` for production                                                              |

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

Notice that in `.kubernetes/deployment.yaml` the environment is loaded from the node-starter secret

```yaml
envFrom:
  - secretRef:
      name: node-starter
```

Finally you need to create the kubernetes deployment, service and optionally the horizontal pod autoscaler that can later be paired with the [cluster autoscaler](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler). To do this simply run the following:

```zsh
kubectl create -f .kubernetes/deployment.yaml
```

If somehow a deadly bug has managed to make its way past the test suite and got deployed to production where it's wreaking havoc you need to run following command:

```zsh
kubectl rollout undo deployment <your deployment name>
```

This will instantly roll back the deployment to the previous one.

## CircleCI

To integrate with CircleCI:

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

# Project structure

| Name                   | Description                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| **.circleci**          | Contains CircleCI settings for continuous deployment                                                   |
| **.kubernetes**        | Contains kubernetes configuration for running the app on a cluster (auto-scaling included)             |
| **.vscode**            | Contains VS Code specific settings                                                                     |
| **dist**               | Contains the distributable (or output) from your TypeScript build. This is the code you ship           |
| **node_modules**       | Contains all your npm dependencies                                                                     |
| **src**                | Contains your source code that will be compiled to the dist dir                                        |
| **src/api**            | Contains all the API versions each with it's own controllers for the configured routes                 |
| **src/config**         | Contains all the configuration needed to setup the API (express, routes and passport)                  |
| **src/models**         | Models define Mongoose schemas that will be used in storing and retrieving data from MongoDB           |
| **src/types**          | Holds .d.ts files not found on DefinitelyTyped                                                         |
| **src/utils**          | Contains API wide snippets (Logger, Error Formatter)                                                   |
| **src**/server.ts      | Entry point to your express app                                                                        |
| **test**               | Contains your tests. Separate from source because there is a different build process                   |
| **test**/tsconfig.json | Config settings for compiling the tests                                                                |
| .env                   | All the env variables needed to run the app. Gitignored, will be loaded by dotenv                      |
| .env.example           | All the env variables needed to run the app. An example list of the keys that must exist in .env files |
| .env.prod              | All the env variables needed to run the app in production. Gitignored, will be used in the deployment  |
| .eslintignore          | Config settings for paths to exclude from linting                                                      |
| .eslintrc              | Config settings for ESLint code style checking                                                         |
| .nvmrc                 | A file containing the node version used in the project automatically loaded by nvm                     |
| Dockerfile             | Used to build the docker image in the `dockerize` job in `.circleci/config.yml`                        |
| jest.config.js         | Used to configure Jest running tests written in TypeScript                                             |
| package.json           | File that contains npm dependencies as well as build scripts                                           |
| tsconfig.json          | Config settings for compiling server code written in TypeScript                                        |

# Build scripts

[npm scripts](https://docs.npmjs.com/misc/scripts) can be found in `package.json` in the `scripts` section. They can call each other which means it's very easy to compose complex builds out of simple individual build scripts.

| Npm Script                    | Description                                                                                                                                                                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `start`                       | Runs `tsc -w` (continuously watches `.ts` files and re-compiles when a change is made) and `nodemon dist/server.js` (runs node with nodemon so the process restarts when a change is made) concurrently. Use this for development |
| `test`                        | Runs tests using Jest test runner verbosely and generate a coverage report                                                                                                                                                        |
| `test:watch`                  | Runs tests in watch mode                                                                                                                                                                                                          |
| `test:debugger`               | Waits for a debugger to get attached and then runs tests                                                                                                                                                                          |
| `test:debugger:watch`         | Waits for a debugger to get attached and runs tests in watch mode                                                                                                                                                                 |
| `build`                       | Full build. Runs `build-ts` and `lint` build tasks                                                                                                                                                                                |
| `build-ts`                    | Compiles all source `.ts` files to `.js` files in the `dist` folder                                                                                                                                                               |
| `lint`                        | Runs ESLint on project files                                                                                                                                                                                                      |
| `check-deps` <img width=120/> | Audits and upgrades (inside package.json run npm install to apply) dependencies to their latest stable version                                                                                                                    |

# Import path quirks

To change the way VSCode does auto import simply search for `typescript import module` in settings and change it to `relative` for the workspace.

![VSCode relative imports](https://user-images.githubusercontent.com/3910622/66314780-3429f880-e91d-11e9-8714-c6a79ced7030.png)

You need to do this because

> module names are considered resource identifiers, and are mapped to the output as they appear in the source

As a result the import paths will be copied over to the compiled js require paths. The compiled code will not work since the tsconfig options are not applied to the output. The Typescript compiler does not want to become a build tool. Normally in frontend projects this is taken care of by build tools such as webpack. There are packages that offer solutions, more on this [here](https://github.com/microsoft/TypeScript/issues/10866).

If you really want to use absolute paths you can find a working example of this project using a different approach at this [commit](https://github.com/feredean/node-api-starter/tree/443fc222c7254e280d41063fa093d0129d68fd9a#import-path-workaround). I decided to drop it going forward since imports are usually added via autocompletion. The visual improvements from

```ts
import { UserDocument, User } from "../../../models/User";
import {
  SESSION_SECRET,
  SENDGRID_USER,
  SENDGRID_PASSWORD
} from "../../../config/secrets";
import {
  JWT_EXPIRATION,
  UNSUBSCRIBE_LANDING,
  RECOVERY_LANDING,
  SENDER_EMAIL
} from "../../../config/settings";
import { formatError } from "../../../util/error";
import {
  passwordResetTemplate,
  passwordChangedConfirmationTemplate
} from "../../../resources/emails";
import { SUCCESSFUL_RESPONSE } from "../../../util/success";
```

to

```ts
import { User, UserDocument } from "models/User";
import {
  SESSION_SECRET,
  SENDGRID_USER,
  SENDGRID_PASSWORD
} from "config/secrets";
import { JWT_EXPIRATION, UNSUBSCRIBE_LANDING } from "config/settings";
import { formatError } from "util/error";
import * as emailTemplates from "resources/emails";
import { SUCCESSFUL_RESPONSE } from "util/success";
```

do not justify the complexity that comes with adding absolute path support.

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

Once this configuration is added make sure that either the app is running (`npm run watch`) or tests are running in debug mode (`npm run watch-test-debugger`). Now add breakpoints, hit `F5`, select the process you want to attach the debugger to and you're ready to go!

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

| Package           | Description                                                             |
| ----------------- | ----------------------------------------------------------------------- |
| aws-sdk           | Amazon Web Services SDK - used to connect to s3                         |
| bcrypt            | A library to help you hash passwords.                                   |
| body-parser       | Express 4 middleware.                                                   |
| compression       | Express 4 middleware.                                                   |
| cors              | Express middleware that can be used to enable CORS with various options |
| dotenv            | Loads environment variables from .env file.                             |
| express           | Node.js web framework.                                                  |
| fbgraph           | Facebook Graph API library.                                             |
| jsonwebtoken      | An implementation of JSON Web Tokens.                                   |
| lodash            | General utility library.                                                |
| mongoose          | MongoDB ODM.                                                            |
| morgan            | HTTP request logger middleware                                          |
| multer            | Middleware for handling multipart/form-data                             |
| nodemailer        | Node.js library for sending emails.                                     |
| passport          | Simple and elegant authentication library for node.js                   |
| passport-facebook | Sign-in with Facebook plugin.                                           |
| passport-local    | Sign-in with Username and Password plugin.                              |
| uuid              | Simple, fast generation of RFC4122 UUIDS.                               |
| validator         | A library of string validators and sanitizers.                          |
| winston           | Logging library                                                         |

## `development`

| Package           | Description                                                                           |
| ----------------- | ------------------------------------------------------------------------------------- |
| @types            | Dependencies in this folder are `.d.ts` files used to provide types                   |
| concurrently      | Utility that manages multiple concurrent tasks. Used with npm scripts                 |
| eslint            | Linter for JavaScript and TypeScript files                                            |
| jest              | Testing library for JavaScript                                                        |
| nodemon           | Utility that automatically restarts node process on code changes                      |
| npm-check-updates | Upgrades package.json dependencies to the latest versions, ignoring specified version |
| supertest         | HTTP assertion library                                                                |
| ts-jest           | A preprocessor with sourcemap support to help use TypeScript with Jest                |
| typescript        | JavaScript compiler/type checker that boosts JavaScript productivity                  |

If you're the type of person that likes to live life on the bleeding edge feel free to use `npm run check-deps`

# Resources

This section is a list of resources for building an API that can be useful in certain situations

- If you are unsure what format your API's JSON responses should have take a look at this [specification](https://jsonapi.org/) and see if it could work for your project.
- [Kong](https://github.com/Kong/kong) is a cloud-native, fast, scalable, and distributed Microservice Abstraction Layer (also known as an API Gateway, API Middleware or in some cases Service Mesh). It boasts a lot of cool [features](https://github.com/Kong/kong#features) and of course works with [kubernetes](https://github.com/Kong/kubernetes-ingress-controller)
- RESTful API Modeling Language ([RAML](https://raml.org/)) makes it easy to manage the whole API lifecycle from design to sharing. It's concise - you only write what you need to define - and reusable. It is machine readable API design that is actually human friendly.
- Brought to you by Heroku, [12factor](https://12factor.net/) is a methodology for building software-as-a-service applications

# Related projects

I highly recommend taking a look at both Sahat's [Hackathon Starter](https://github.com/sahat/hackathon-starter) and Microsoft's [TypeScript Node Starter](https://github.com/microsoft/TypeScript-Node-Starter). Both have been great help and a source of inspiration for setting up this project.

# License

The MIT License (MIT)

Copyright (c) 2019 Tiberiu Feredean

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
