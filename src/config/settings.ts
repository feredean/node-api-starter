import dotenv from "dotenv";
import logger from "util/logger";
import fs from "fs";

export const PRODUCTION = "production";

if (!fs.existsSync(".env")) {
    logger.error("No .env file configured");
    process.exit(1);
}

dotenv.config();

const secrets = [
    "NODE_ENV",
    "SESSION_SECRET",

    "MONGO_DATABASE",
    "MONGO_USERNAME",
    "MONGO_PASSWORD",
    "MONGO_HOST",
    "MONGO_PORT",    
];

for (const secret of secrets) {
    if (!process.env[secret]) {
        logger.error(`Env variable ${secret} is missing.`);
        process.exit(1);
    }
}
let nodeEnv = process.env["NODE_ENV"];
let mongoURI;

if (nodeEnv === PRODUCTION) {
    mongoURI = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}?authSource=admin`;
} else {
    mongoURI = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`;
}
export const NODE_ENV = nodeEnv;
export const SESSION_SECRET = process.env["SESSION_SECRET"];
export const MONGO_URI = mongoURI;
export const APP_PORT = 3000;
export const CORS = [
    /localhost:\d{4}$/,
    /domain\.tld$/
];