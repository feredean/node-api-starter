import crypto from "crypto";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import UUID from "uuid/v4";
import { USER_ROLES } from "../config/settings";

export interface Profile {
    name?: string;
    gender?: string;
    location?: string;
    website?: string;
    picture?: string;
}
export interface AuthToken {
    accessToken: string;
    kind: string;
}
export interface UserAPIFormat {
    id: string;
    email: string;
    role: string;
    profile?: Profile;
    avatar: string;
}
export type UserDocument = mongoose.Document & {
    id: string;
    email: string;
    password: string;
    passwordResetToken: string;
    passwordResetExpires: Date;
    role: string;
    profile: Profile;

    facebook: string;
    tokens: AuthToken[];

    authenticate: (candidatePassword: string) => Promise<boolean>;
    gravatar: (size: number) => string;
    format: () => UserAPIFormat;
};

const userSchema = new mongoose.Schema(
    {
        id: { type: String, default: UUID, unique: true },
        email: { type: String, unique: true },
        password: String,
        passwordResetToken: String,
        passwordResetExpires: Date,
        role: { type: String, default: "user", enum: USER_ROLES },

        facebook: String,
        tokens: Array,

        profile: {
            name: String,
            gender: String,
            location: String,
            website: String,
            picture: String
        }
    },
    { timestamps: true }
);

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
    authenticate: async function(candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.password);
    },
    gravatar: function(size: number = 200): string {
        if (!this.email) {
            return `https://gravatar.com/avatar/?s=${size}&d=retro`;
        }
        const md5 = crypto
            .createHash("md5")
            .update(this.email)
            .digest("hex");
        return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
    },
    format: function(): UserAPIFormat {
        const result = {
            id: this.id,
            email: this.email,
            role: this.role,
            avatar: this.gravatar(),
            profile: {
                name: this.profile.name,
                gender: this.profile.gender,
                location: this.profile.location,
                website: this.profile.website,
                picture: this.profile.picture
            }
        };

        return result;
    }
};

export const User = mongoose.model<UserDocument>("User", userSchema);
