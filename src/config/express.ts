import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import bodyParser from "body-parser";
import { Express } from "express";

import { APP_PORT } from "./settings";
import { CORS_REGEX } from "./secrets";
import { setupPassport } from "./passport";
import logger from "../util/logger";

export const setupExpress = (app: Express): void => {
    app.set("port", APP_PORT);

    const corsOptions = {
        origin: (origin: string, callback: Function): void => {
            if (!origin) return callback();
            const match = origin.match(new RegExp(CORS_REGEX)) ? true : false;
            callback(null, match);
        }
    };

    setupPassport(app);

    app.use(cors(corsOptions));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(compression());
    app.use(
        morgan(
            "[:method] :url :status :res[content-length] - :response-time ms",
            {
                stream: {
                    write: (text: string): void => {
                        logger.info(text.substring(0, text.lastIndexOf("\n")));
                    }
                }
            }
        )
    );
};
