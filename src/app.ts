import express, {NextFunction, Request, Response} from "express";
import mongoose from "mongoose";
import setupExpress from "config/express";
import setupRoutesV1 from "config/routes/v1";
import { MONGO_URI } from "config/secrets";
import logger from "util/logger";

mongoose.set("useCreateIndex", true);
mongoose.connect(MONGO_URI, { useNewUrlParser: true })
    .catch((err): void => {
        logger.error("MongoDB connection error. Please make sure MongoDB is running. " + err);
    });

const app = express();

setupExpress(app);
setupRoutesV1(app);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: Error, _req: Request, res: Response, _next: NextFunction): void => {
    logger.error(error.stack);
    res.status(500).json({errors: ["Server Error"]});
});

app.route("/*").get((_req, res): void => {
    res.sendStatus(404);
});

export default app;
