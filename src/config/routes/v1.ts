import { Express } from "express";
import hello from "api/v1/hello";

export default (app: Express): void => {
    app.use("/v1/hello", hello);

    app.route("/*").get((_req, res): void => {
        res.sendStatus(404);
    });
};