import express from "express";
import mongoose from "mongoose";
import { MONGO_URI } from "./config/secrets";
import logger from "./util/logger";
import { setupExpress } from "./config/express";
import { handleMissing, handleErrors } from "./middleware";
import { setupRoutesV1 } from "./config/routes";

mongoose.set("useNewUrlParser", true);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

mongoose.connect(MONGO_URI).catch((err): void => {
    logger.error(
        "MongoDB connection error. Please make sure MongoDB is running. " + err
    );
    process.exit(1);
});

const app = express();

setupExpress(app);
setupRoutesV1(app);

app.use(handleMissing);
app.use(handleErrors);

export default app;
