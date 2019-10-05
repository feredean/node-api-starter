import express from "express";
import mongoose from "mongoose";
import setupExpress from "config/express";
import setupRoutesV1 from "config/routes/v1";
import { MONGO_URI } from "config/secrets";
import * as mw from "middleware";
import logger from "util/logger";

mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

mongoose.connect(MONGO_URI, { useNewUrlParser: true })
    .catch((err): void => {
        logger.error("MongoDB connection error. Please make sure MongoDB is running. " + err);
        process.exit(1);
    });

const app = express();

setupExpress(app);
setupRoutesV1(app);

app.use(mw.handleMissing);
app.use(mw.handleErrors);

export default app;
