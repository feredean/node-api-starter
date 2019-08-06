import {NextFunction, Request, Response} from "express";
import logger from "util/logger";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handleErrors = (error: Error, _req: Request, res: Response, _next: NextFunction): void => {
    logger.error(error.stack);
    res.status(500).json({errors: [{ msg: "Server Error" }]});
};

export const handleMissing = (_req: Request, res: Response): void => {
    res.sendStatus(404);
};

