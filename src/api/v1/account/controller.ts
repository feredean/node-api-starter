import crypto from "crypto";
import jwt from "jsonwebtoken";
import passport from "passport";
import validator from "validator";
import nodemailer from "nodemailer";
import { Response, Request, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";

import { UserDocument, User } from "../../../models/User";
import { SESSION_SECRET, SENDGRID_USER, SENDGRID_PASSWORD } from "../../../config/secrets";
import { JWT_EXPIRATION, UNSUBSCRIBE_LANDING, RECOVERY_LANDING, SENDER_EMAIL } from "../../../config/settings";
import { formatError } from "../../../util/error";
import { passwordResetTemplate, passwordChangedConfirmationTemplate } from "../../../resources/emails";
import { SUCCESSFUL_RESPONSE } from "../../../util/success";

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
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
        const validationErrors = [];
        if (!validator.isEmail(req.body.email)) validationErrors.push("Please enter a valid email address" );
        if (!validator.isLength(req.body.password, { min: 8 })) validationErrors.push("Password must be at least 8 characters long" );
        if (validationErrors.length) return res.status(422).json(formatError(...validationErrors));
        req.body.email = validator.normalizeEmail(req.body.email, { "gmail_remove_dots": false });
        const existing = await User.findOne({ email: req.body.email });
        if (existing) return res.status(422).json(formatError("Account already exists"));

        const user = new User({
            email: req.body.email,
            password: req.body.password,
            profile: {
                name: req.body.name
            }
        });
        await user.save();

        res.status(201).json({ token: signToken(user) });
    } catch (error) {
        next(error);
    }
};
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
        if (!req.body.email || !req.body.password) return res.status(403).json(formatError("Invalid credentials"));
        req.body.email = validator.normalizeEmail(req.body.email, { "gmail_remove_dots": false });
        passport.authenticate("local", (err: Error, user: UserDocument, info: IVerifyOptions): Response => {
            if (err) throw err;
            if (!user) return res.status(403).json(formatError(info.message));
            res.status(200).json({ token: signToken(user) });
        })(req, res, next);
    } catch (error) {
        next(error);
    }
};
export const forgot = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
        if (!req.body.email) return res.status(422).json(formatError("Invalid data"));
        req.body.email = validator.normalizeEmail(req.body.email, { "gmail_remove_dots": false });

        const user = await User.findOne({email: req.body.email});
        if (!user) return res.status(404).json(formatError("Email not found"));
        const token = crypto.randomBytes(16).toString("hex");
        user.passwordResetToken = token;
        user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // ms
        await user.save();

        const transporter = nodemailer.createTransport({
            service: "SendGrid",
            auth: {
                user: SENDGRID_USER,
                pass: SENDGRID_PASSWORD
            }
        });

        const mailOptions = {
            to: req.body.email,
            from: SENDER_EMAIL,
            subject: "Node API starter - Password reset",
            html: passwordResetTemplate(`${RECOVERY_LANDING}/reset/${token}`, UNSUBSCRIBE_LANDING)
        };

        await transporter.sendMail(mailOptions);
        res.status(201).json(SUCCESSFUL_RESPONSE);
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
        if (validationErrors.length) return res.status(422).json(formatError(...validationErrors));

        const user = await User
            .findOne({passwordResetToken: req.params.token})
            .where("passwordResetExpires").gt(Date.now());
        if (!user) return res.status(422).json(formatError("Invalid token"));

        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: "SendGrid",
            auth: {
                user: SENDGRID_USER,
                pass: SENDGRID_PASSWORD
            }
        });

        const mailOptions = {
            to: user.email,
            from: SENDER_EMAIL,
            subject: "Node API starter - Password successfully changed",
            html: passwordChangedConfirmationTemplate(UNSUBSCRIBE_LANDING)
        };
        await transporter.sendMail(mailOptions);

        res.status(201).json(SUCCESSFUL_RESPONSE);
    } catch (error) {
        next(error);
    }
};
export const postProfile = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
        const user = await User.findOne({ id: req.user.sub });
        user.profile.name = req.body.name;
        user.profile.gender = req.body.gender;
        user.profile.location = req.body.location;
        user.profile.website = req.body.website;
        await user.save();
        res.status(200).json(user.format());
    } catch (error) {
        next(error);
    }
};
export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
        const user = await User.findOne({ id: req.user.sub });
        res.status(200).json(user.format());
    } catch (error) {
        next(error);
    }
};
export const password = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
        const validationErrors = [];
        if (!validator.isLength(req.body.password, { min: 8 })) validationErrors.push("Password must be at least 8 characters long");
        if (req.body.password !== req.body.confirm) validationErrors.push("Passwords do not match");
        if (validationErrors.length) return res.status(422).json(formatError(...validationErrors));
        const user = await User.findOne({ id: req.user.sub });
        user.password = req.body.password;
        await user.save();
        res.status(200).json(SUCCESSFUL_RESPONSE);
    } catch (error) {
        next(error);
    }
};
export const deleteAccount = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
        await User.deleteOne({ id: req.user.sub });
        res.status(200).json(SUCCESSFUL_RESPONSE);
    } catch (error) {
        next(error);
    }
};