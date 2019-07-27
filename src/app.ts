import express from "express";
import mongoose from "mongoose";
import setupExpress from "config/express";
import setupRoutesV1 from "config/routes/v1";
import { MONGO_URI } from "config/settings";

mongoose.set("useCreateIndex", true);
mongoose.connect(MONGO_URI, { useNewUrlParser: true })
    .catch((err): void => {
        console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
    });

const app = express();

setupExpress(app);
setupRoutesV1(app);
// setupPassport(app);

export default app;
