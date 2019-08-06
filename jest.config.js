module.exports = {
    globals: {
        "ts-jest": {
            tsConfig: "test/tsconfig.json"
        }
    },
    moduleDirectories: [
        "node_modules",
        "src",
        "test"
    ],
    setupFilesAfterEnv: ["./test/setup.ts"],
    moduleFileExtensions: [
        "ts",
        "js"
    ],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    testMatch: [
        "**/test/**/*.test.(ts|js)"
    ],
    testEnvironment: "node",
    coverageThreshold: {
        global: {
            lines: 80,
        }
    }
};
