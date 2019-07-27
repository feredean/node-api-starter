import * as winston from "winston";
import { Logger } from "winston";
import { NODE_ENV } from "config/secrets";

const { createLogger, format, transports } = winston;
const logger: Logger = createLogger({
    format: winston.format.combine(
        // Use these two instead for JSON format
        // format.timestamp(),
        // format.json()
        format.timestamp({format: "YYYY-MM-DD HH:mm:ss.SSS"}),
        format.printf((info): string => {
            return `[${info.timestamp}] [${info.level.toUpperCase()}] ${info.message}`;
        })
    ),
    transports: [
        new transports.Console({ level: NODE_ENV === "production" ? "error" : "debug" })
    ]
});

export default logger;