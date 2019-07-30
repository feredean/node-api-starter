import dotenv from "dotenv";
import logger from "util/logger";
import { PRODUCTION, NODE_ENV } from "config/settings";
import fs from "fs";

if (!fs.existsSync(".env")) {
    logger.info("No .env file found, looking for variables in environment.");
}

dotenv.config();

const secrets = [
    "SESSION_SECRET",

    "MONGO_DATABASE",
    "MONGO_USERNAME",
    "MONGO_PASSWORD",
    "MONGO_HOST",
    "MONGO_PORT",

    "FACEBOOK_ID",
    "FACEBOOK_SECRET",
];

for (const secret of secrets) {
    if (!process.env[secret]) {
        logger.error(`Env variable ${secret} is missing.`);
        process.exit(1);
    }
}

let mongoURI;
let mongoBase = `${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`;

if (NODE_ENV === PRODUCTION) {
    mongoURI = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${mongoBase}?authSource=admin`;
} else {
    mongoURI = `mongodb://${mongoBase}`;
}

export const SESSION_SECRET = process.env["SESSION_SECRET"];
export const MONGO_URI = mongoURI;
export const FACEBOOK_ID = process.env["FACEBOOK_ID"];
export const FACEBOOK_SECRET = process.env["FACEBOOK_SECRET"];