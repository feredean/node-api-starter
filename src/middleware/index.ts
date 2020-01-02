import jwt from "jsonwebtoken";
import { RequestHandler, NextFunction, Request, Response } from "express";

import logger from "../util/logger";
import { SESSION_SECRET } from "../config/secrets";
import { USER_ROLES } from "../config/settings";
import { formatError } from "../util/error";

export const handleErrors = (
    error: Error,
    _req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
): void => {
    logger.error(error.stack);
    res.status(500).json(formatError("Server Error"));
};

export const handleMissing = (_req: Request, res: Response): void => {
    res.sendStatus(404);
};

export const isAuthenticated = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        if (!req.headers.authorization) {
            res.sendStatus(401);
            return;
        }
        const token = req.headers.authorization.split("Bearer ")[1];
        req.user = jwt.verify(token, SESSION_SECRET) as Express.User;
        next();
    } catch (error) {
        logger.error(error);
        res.sendStatus(401);
    }
};

export const hasPermission = (level: string): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            if (!req.headers.authorization) {
                res.sendStatus(401);
                return;
            }
            const token = req.headers.authorization.split("Bearer ")[1];
            req.user = jwt.verify(token, SESSION_SECRET) as Express.User;
            if (
                USER_ROLES.indexOf(req.user.role) >= USER_ROLES.indexOf(level)
            ) {
                next();
            } else {
                res.sendStatus(403);
            }
        } catch (error) {
            logger.error(error);
            res.sendStatus(401);
        }
    };
};
