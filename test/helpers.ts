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

export interface RegisterUserOptions {
    id?: string;
    role?: string;
    jwtExpiration?: string;
    randomize?: boolean;
}
export const REGISTER_VALID = {
    email: "valid@email.com",
    password: "valid_password"
};
export const signToken = (data: JWTData): string => jwt.sign({
    email: data.email,
    role: data.role
}, SESSION_SECRET, { 
    expiresIn: data.exp,
    subject: data.id
});
export const registerValidUser = async ({
    randomize = false,
    id = "GENERIC_USER_ID",
    role = "user",
    jwtExpiration = "5s"
}: RegisterUserOptions): Promise<string> => {
    const user = {
        email: randomize ? `${crypto.randomBytes(16).toString("hex")}@valid.com` : REGISTER_VALID.email,
        password: REGISTER_VALID.password,
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