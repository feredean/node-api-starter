import jwt from "jsonwebtoken";
import logger from "util/logger";
import { RequestHandler, NextFunction, Request, Response, } from "express";
import { format as errorFormat } from "util/error";
import { SESSION_SECRET } from "config/secrets";
import { USER_ROLES } from "config/settings";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handleErrors = (error: Error, _req: Request, res: Response, _next: NextFunction): void => {
    logger.error(error.stack);
    res.status(500).json(errorFormat("Server Error"));
};

export const handleMissing = (_req: Request, res: Response): void => {
    res.sendStatus(404);
};

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
        if (!req.headers.authorization) return res.sendStatus(401);
        const token = req.headers.authorization.split("Bearer ")[1];
        req.user = await jwt.verify(token, SESSION_SECRET);
        next();
    } catch (error) {
        logger.error(error);
        res.sendStatus(401);
    }
};

export const hasPermission = (level: string): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        try {
            if (!req.headers.authorization) return res.sendStatus(401);
            const token = req.headers.authorization.split("Bearer ")[1];
            req.user = await jwt.verify(token, SESSION_SECRET);
            if (USER_ROLES.indexOf(req.user.role) >= USER_ROLES.indexOf(level)) {
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
