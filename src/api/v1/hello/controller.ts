import { Response, Request } from "express";

export const index = (_req: Request, res: Response): void => {
    res.sendStatus(200);
};