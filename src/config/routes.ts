import { Express } from "express";
import { helloRouter } from "../api/v1/hello";
import { accountRouter } from "../api/v1/account";
import { usersRouter } from "../api/v1/users";
import { uploadRouter } from "../api/v1/upload";
export const setupRoutesV1 = (app: Express): void => {
    app.use("/v1/hello", helloRouter);
    app.use("/v1/account", accountRouter);
    app.use("/v1/users", usersRouter);
    app.use("/v1/upload", uploadRouter);
};
