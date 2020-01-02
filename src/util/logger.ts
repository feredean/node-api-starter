import { Logger, createLogger, format, transports } from "winston";
import { PRODUCTION, NODE_ENV, TEST } from "../config/settings";

const logLevel = (): string => {
    switch (NODE_ENV) {
        case PRODUCTION:
            return "info";
        case TEST:
            return "no_logging";
        default:
            return "debug";
    }
};

const logger: Logger = createLogger({
    format: format.combine(
        // Use these two instead for JSON format
        // format.timestamp(),
        // format.json()
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
        format.printf((info): string => {
            return `[${info.timestamp}] [${info.level.toUpperCase()}] ${
                info.message
            }`;
        })
    ),
    transports: [new transports.Console({ level: logLevel() })]
});

export default logger;
