import validator from "validator";
import { Response, Request, NextFunction } from "express";
import { User } from "models/User";

// import passport from "passport";

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const validationErrors = [];
        if (!validator.isEmail(req.body.email)) validationErrors.push({ msg: "Please enter a valid email address." });
        if (!validator.isLength(req.body.password, { min: 8 })) validationErrors.push({ msg: "Password must be at least 8 characters long" });
        if (validationErrors.length) {
            res.status(400).json({errors: validationErrors});
            return;
        }
        req.body.email = validator.normalizeEmail(req.body.email, { "gmail_remove_dots": false });

        const user = new User({
            email: req.body.email,
            password: req.body.password
        });

        const existing = await User.findOne({ email: req.body.email });
        if (existing) {
            res.status(400).json({errors: [{ msg: "Account already exists." }]});
        } else {
            await user.save();
            res.status(201).json({ token: "" });
        }
    } catch (error) {
        next(error);
    }
};