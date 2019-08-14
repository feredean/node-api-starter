import crypto from "crypto";
import jwt from "jsonwebtoken";
import passport from "passport";
import validator from "validator";
import nodemailer from "nodemailer";
import { Response, Request, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";

import { SESSION_SECRET, SENDGRID_USER, SENDGRID_PASSWORD } from "config/secrets";
import { JWT_EXPIRATION, UNSUBSCRIBE_LANDING } from "config/settings";
import * as emailTemplates from "resources/emails";

import { format as errorFormat } from "util/error";
import { User, UserDocument, UserAPIFormat } from "models/User";

const signToken = (user: UserDocument): string => jwt.sign({
    email: user.email,
    role: user.role
}, SESSION_SECRET, { 
    expiresIn: JWT_EXPIRATION,
    subject: user.id
});

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
        const user = await User.findOne({ id: req.user.sub });
        if (!user) return res.sendStatus(401);
        res.status(200).json({ token: signToken(user) });
    } catch (error) {
        next(error);
    }
};
export const index = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const users = await User.find({});
        const result = {
            Data: new Array<UserAPIFormat>()
        };
        for (const user of users) {
            result.Data.push(user.format());
        }
        res.status(200).json(result);
    } catch (error) {
        next();
    }
};
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
        const validationErrors = [];
        if (!validator.isEmail(req.body.email)) validationErrors.push("Please enter a valid email address" );
        if (!validator.isLength(req.body.password, { min: 8 })) validationErrors.push("Password must be at least 8 characters long" );
        if (validationErrors.length) return res.status(422).json(errorFormat(...validationErrors));
        req.body.email = validator.normalizeEmail(req.body.email, { "gmail_remove_dots": false });
        const existing = await User.findOne({ email: req.body.email });
        if (existing) return res.status(422).json(errorFormat("Account already exists"));
                
        const user = new User({
            email: req.body.email,
            password: req.body.password
        });
        await user.save();

        res.status(201).json({ token: signToken(user) });
    } catch (error) {
        next(error);
    }
};
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
        if (!req.body.email || !req.body.password) return res.status(403).json(errorFormat("Invalid credentials"));
        req.body.email = validator.normalizeEmail(req.body.email, { "gmail_remove_dots": false });
        passport.authenticate("local", (err: Error, user: UserDocument, info: IVerifyOptions): Response => {
            if (err) throw err;
            if (!user) return res.status(403).json(errorFormat(info.message));
            res.status(200).json({ token: signToken(user) });
        })(req, res, next);
    } catch (error) {
        next(error);
    }
};
export const forgot = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
        if (!req.body.email) return res.status(422).json(errorFormat("Invalid data"));
        req.body.email = validator.normalizeEmail(req.body.email, { "gmail_remove_dots": false });

        const user = await User.findOne({email: req.body.email});
        if (!user) return res.status(404).json(errorFormat("Email not found"));
        const token = crypto.randomBytes(16).toString("hex");
        user.passwordResetToken = token;
        user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // ms
        await user.save();

        const transporter = await nodemailer.createTransport({
            service: "SendGrid",
            auth: {
                user: SENDGRID_USER,
                pass: SENDGRID_PASSWORD
            }
        });

        const mailOptions = {
            to: req.body.email,
            from: "node-api@starter.com",
            subject: "Node API starter - Password reset",
            html: emailTemplates.passwordReset(req.headers.host, token, UNSUBSCRIBE_LANDING)
        };

        await transporter.sendMail(mailOptions);
        res.sendStatus(201);
    } catch (error) {
        next(error);
    }
};
export const reset = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
        const validationErrors = [];
        if (!validator.isLength(req.body.password, { min: 8 })) validationErrors.push("Password must be at least 8 characters long");
        if (req.body.password !== req.body.confirm) validationErrors.push("Passwords do not match");
        if (!validator.isHexadecimal(req.params.token)) validationErrors.push("Invalid token");
        if (validationErrors.length) return res.status(422).json(errorFormat(...validationErrors));

        const user = await User
            .findOne({passwordResetToken: req.params.token})
            .where("passwordResetExpires").gt(Date.now());
        if (!user) return res.status(422).json(errorFormat("Invalid token"));

        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        const transporter = await nodemailer.createTransport({
            service: "SendGrid",
            auth: {
                user: SENDGRID_USER,
                pass: SENDGRID_PASSWORD
            }
        });

        const mailOptions = {
            to: user.email,
            from: "node-api@starter.com",
            subject: "Node API starter - Password successfully changed",
            html: emailTemplates.passwordChangedConfirmation(UNSUBSCRIBE_LANDING)
        };
        await transporter.sendMail(mailOptions);

        res.sendStatus(201);
    } catch (error) {
        next(error);
    }
};
export const profile = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
        const user = await User.findOne({ id: req.user.sub });
        user.profile.name = req.body.name;
        user.profile.gender = req.body.gender;
        user.profile.location = req.body.location;
        user.profile.website = req.body.website;
        await user.save();
        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
};
export const password = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
        const validationErrors = [];
        if (!validator.isLength(req.body.password, { min: 8 })) validationErrors.push("Password must be at least 8 characters long");
        if (req.body.password !== req.body.confirm) validationErrors.push("Passwords do not match");
        if (validationErrors.length) return res.status(422).json(errorFormat(...validationErrors));
        const user = await User.findOne({ id: req.user.sub });
        user.password = req.body.password;
        await user.save();
        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
};
export const deleteAccount = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
        await User.deleteOne({ id: req.user.sub });
        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
};