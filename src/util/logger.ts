import { Logger, createLogger, format, transports } from "winston";
import { NODE_ENV, PRODUCTION } from "config/settings";

const logger: Logger = createLogger({
    format: format.combine(
        // Use these two instead for JSON format
        // format.timestamp(),
        // format.json()
        format.timestamp({format: "YYYY-MM-DD HH:mm:ss.SSS"}),
        format.printf((info): string => {
            return `[${info.timestamp}] [${info.level.toUpperCase()}] ${info.message}`;
        })
    ),
    transports: [
        new transports.Console({ level: NODE_ENV === PRODUCTION ? "error" : "debug" })
    ]
});

export default logger;