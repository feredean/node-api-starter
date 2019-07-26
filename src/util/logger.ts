
import winston from "winston";
import { Logger } from "winston";
import env from "config/environment";

const logger: Logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
    level: "info",
    transports: [
        new winston.transports.Console({ level: "debug" })
    ]
});

export default logger;