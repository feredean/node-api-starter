import crypto from "crypto";
import bcrypt from "bcrypt";
import mongoose from "mongoose";


export interface AuthToken {
    accessToken: string;
    kind: string;
}

export type UserDocument = mongoose.Document & {
    email: string;
    password: string;
    passwordResetToken: string;
    passwordResetExpires: Date;

    facebook: string;
    tokens: AuthToken[];

    profile: {
        name: string;
        gender: string;
        location: string;
        website: string;
        picture: string;
    };

    authenticate: (candidatePassword: string) => Promise<boolean>;
    gravatar: (size: number) => string;
};

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date,

    facebook: String,
    tokens: Array,

    profile: {
        name: String,
        gender: String,
        location: String,
        website: String,
        picture: String
    }
}, { timestamps: true });

userSchema.pre("save", async function(next: Function): Promise<void> {
    const user = this as UserDocument;
    if (!user.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods = {
    authenticate: async function (candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.password);
    },
    gravatar: function (size: number = 200): string {
        if (!this.email) {
            return `https://gravatar.com/avatar/?s=${size}&d=retro`;
        }
        const md5 = crypto.createHash("md5").update(this.email).digest("hex");
        return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
    }
};

export const User = mongoose.model<UserDocument>("User", userSchema);