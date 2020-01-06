import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "models/User";
import { SESSION_SECRET } from "config/secrets";

interface JWTData {
    id: string;
    email: string;
    role: string;
    exp: string;
}
export interface JWTPayload {
    email: string;
    role: string;
    sub: string;
    exp: number;
}
export interface RegisterUserOptions {
    id?: string;
    role?: string;
    jwtExpiration?: string;
    randomize?: boolean;
    email?: string;
    password?: string;
}
export const GENERIC_UPLOAD_USER_ID = "GENERIC_UPLOAD_USER_ID";
export const signToken = (data: JWTData): string => {
    return jwt.sign(
        {
            email: data.email,
            role: data.role
        },
        SESSION_SECRET,
        {
            expiresIn: data.exp,
            subject: data.id
        }
    );
};

export const registerValidUser = async ({
    randomize = false,
    id = "GENERIC_USER_ID",
    role = "user",
    jwtExpiration = "5s",
    email = "valid@email.com",
    password = "valid_password"
}: RegisterUserOptions): Promise<string> => {
    const user = {
        email: randomize
            ? `${crypto.randomBytes(16).toString("hex")}@valid.com`
            : email,
        password: password,
        id: id,
        role: role
    };

    await User.create(user);

    return signToken({
        id: user.id,
        email: user.email,
        role: role,
        exp: jwtExpiration
    });
};
