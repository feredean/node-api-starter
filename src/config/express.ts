import cors from "cors";
import morgan from "morgan";
import passport from "passport";
import compression from "compression";
import bodyParser from "body-parser";
import errorHandler from "errorhandler";
import { Express } from "express";

import logger from "util/logger";
import { CORS, APP_PORT, NODE_ENV, PRODUCTION } from "config/settings";

export default (app: Express): void => {
    app.set("port", APP_PORT);

    if (NODE_ENV !== PRODUCTION) app.use(errorHandler());

    let corsOptions = {
        origin: function (origin: string, callback: Function): void {
            if (!origin) return callback();
            let match = false;
            for (let accepted of CORS) {
                if (origin.match(accepted)) match = true;
            }
            callback(null, match);
        }
    };

    app.use(cors(corsOptions));
    app.use(passport.initialize());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(compression());
    app.use(morgan("[:method] :url :status :res[content-length] - :response-time ms", { "stream": {
        write: (text: string): void => {
            logger.info(text.substring(0, text.lastIndexOf("\n")));
        }
    }}));
};
