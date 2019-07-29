import { Express } from "express";
import hello from "api/v1/hello";
import account from "api/v1/account";

export default (app: Express): void => {
    app.use("/v1/hello", hello);
    app.use("/v1/account", account);
};