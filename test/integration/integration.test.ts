/* eslint-disable @typescript-eslint/no-explicit-any */
const mockedPutObject = jest.fn();
const mockedGetSignedUrl = jest.fn();
jest.mock("aws-sdk/clients/s3", (): any => {
    return class S3 {
        public putObject(params: any): any {
            mockedPutObject(params);
            return {
                promise: async (): Promise<void> => {}
            };
        }
        public getSignedUrl(operation: string, params: any): string {
            mockedGetSignedUrl(operation, params);
            return "https://dummy.url.com";
        }
    };
});

jest.mock("nodemailer");
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import request from "supertest";
import jwt from "jsonwebtoken";

import {} from "types/passport-user";

import { RegisterUserOptions, registerValidUser, signToken, REGISTER_VALID } from "../helpers";
import { initMongo, disconnectMongo } from "../setup";
import { User } from "../../src/models/User";
import { SESSION_SECRET } from "../../src/config/secrets";

const GENERIC_UPLOAD_USER_ID = "GENERIC_UPLOAD_USER_ID";

interface JWTPayload {
    email: string;
    role: string;
    sub: string;
    exp: number;
}

import app from "app";
describe("API V1", (): void => {

    describe("/hello", (): void => {
        describe("GET /", (): void => {
            it("should return 200 OK", async (): Promise<void>  => {
                const { body } = await request(app).get("/v1/hello")
                    .expect(200);
                expect(body).toMatchSnapshot();
            });
        });
    });

    describe("/upload", (): void => {
        const adminOpts: RegisterUserOptions = {
            id: GENERIC_UPLOAD_USER_ID,
            role: "admin",
            randomize: true,
        };

        const userOpts: RegisterUserOptions = {
            id: GENERIC_UPLOAD_USER_ID,
            randomize: true,
        };

        describe("POST /", (): void => {
            beforeEach(async (): Promise<void> => {
                mockedPutObject.mockClear();
                mockedGetSignedUrl.mockClear();
                await initMongo();
            });

            afterAll(async(): Promise<void> => disconnectMongo());

            it("should return 201, the document added to storage and call s3.putObject, s3.getSignedUrl - one file", async (): Promise<void> => {
                const token = await registerValidUser(adminOpts);
                const { body } = await request(app)
                    .post("/v1/upload")
                    .set("authorization", `Bearer ${token}`)
                    .attach("file", "test/integration/files/sample-white.png")
                    .expect(201);

                expect(body).toMatchSnapshot();
                expect(mockedPutObject).toHaveBeenCalled();
                expect(mockedGetSignedUrl).toHaveBeenCalled();
            });

            it("should return 201, the documents added to storage and call s3.putObject, s3.getSignedUrl twice - two files", async (): Promise<void> => {
                const token = await registerValidUser(adminOpts);
                const { body } = await request(app)
                    .post("/v1/upload")
                    .set("authorization", `Bearer ${token}`)
                    .attach("file", "test/integration/files/sample-white.png")
                    .attach("file", "test/integration/files/sample-black.png")
                    .expect(201);
                
                expect(body).toMatchSnapshot();
                expect(mockedPutObject).toHaveBeenCalledTimes(2);
                expect(mockedGetSignedUrl).toHaveBeenCalledTimes(2);
            });

            it("should return 401 and not call s3.putObject, s3.getSignedUrl", async (): Promise<void> => {
                const token = await registerValidUser(userOpts);
                await request(app)
                    .post("/v1/upload")
                    .set("authorization", `Bearer ${token}`)
                    .attach("file", "test/integration/files/sample-white.png")
                    .attach("file", "test/integration/files/sample-black.png")
                    .expect(403);
                expect(mockedPutObject).toHaveBeenCalledTimes(0);
                expect(mockedGetSignedUrl).toHaveBeenCalledTimes(0);
            });
        });
    });

    describe("/users", (): void => {
        const adminOpts: RegisterUserOptions = { role: "admin" };

        describe("GET /", (): void => {
            beforeEach(async (): Promise<void> => {
                await initMongo();
                await registerValidUser(adminOpts);
            });
            afterAll(async (): Promise<void> => disconnectMongo());

            it("should return a list of users", async (): Promise<void> => {
                const user = await User.findOne({});
                const { body } = await request(app)
                    .get("/v1/users/")
                    .set("authorization", `Bearer ${signToken({
                        email: user.email,
                        id: user.id,
                        role: user.role,
                        exp: "1s"
                    })}`)
                    .expect(200);
                expect(body).toMatchSnapshot();
            });
        });
    });

    describe("/account", (): void => {
        const userOpts: RegisterUserOptions = {};
        
        describe("GET /jwt/refresh", (): void => {
            beforeEach(async (): Promise<void> => initMongo());
            afterAll(async (): Promise<void> => disconnectMongo());

            it("should return a fresher JWT", async (): Promise<void> => {
                const token = await registerValidUser(userOpts);
                const payload = await jwt.verify(token, SESSION_SECRET) as JWTPayload;
                const expiringToken = signToken({
                    id: payload.sub,
                    email: payload.email,
                    role: "user",
                    exp: "1s"
                });
                const refresh = await request(app)
                    .get("/v1/account/jwt/refresh")
                    .set("authorization", `Bearer ${expiringToken}`);

                const freshPayload = await jwt.verify(refresh.body.token, SESSION_SECRET) as JWTPayload;
                const oldPayload = await jwt.verify(expiringToken, SESSION_SECRET) as JWTPayload;
                expect(freshPayload.exp > oldPayload.exp).toBe(true);
            });

            it("should return 401 - token is valid but the user does not exist", async (): Promise<void> => {
                const token = await registerValidUser(userOpts);
                await User.deleteMany({});
                const refresh = await request(app)
                    .get("/v1/account/jwt/refresh")
                    .set("authorization", `Bearer ${token}`);
                expect(refresh.status).toBe(401);
            });
        });

        describe("POST /register", (): void => {

            const REGISTER_INVALID_EMAIL_PASSWORD = {
                "email": "a@a.a",
                "password": "pass"
            };

            const REGISTER_VALID_NAME_EMAIL_PASSWORD = {
                email: "valid@email.com",
                password: "valid_password",
                name: "valid name"
            };

            beforeEach(async (): Promise<void> => initMongo());
            afterAll(async (): Promise<void> => disconnectMongo());
        
            it("should return status 201, create a user and return a JWT - valid register", async (): Promise<void> => {
                const response = await request(app)
                    .post("/v1/account/register")
                    .send(REGISTER_VALID);

                expect(response.status).toBe(201);
                const payload = await jwt.verify(response.body.token, SESSION_SECRET);
                expect((payload as JWTPayload).email).toBe(REGISTER_VALID.email);
            });
        
            it("should return status 201, create a user with a name", async (): Promise<void> => {
                const response = await request(app)
                    .post("/v1/account/register")
                    .send(REGISTER_VALID_NAME_EMAIL_PASSWORD);

                expect(response.status).toBe(201);
                const user = await User.findOne({email: REGISTER_VALID_NAME_EMAIL_PASSWORD.email});
                expect(user.profile.name).toBe(REGISTER_VALID_NAME_EMAIL_PASSWORD.name);
            });
        
            it("should return status 422 - invalid email and password", async (): Promise<void> => {
                const { body } = await request(app)
                    .post("/v1/account/register")
                    .send(REGISTER_INVALID_EMAIL_PASSWORD)
                    .expect(422);
                expect(body).toMatchSnapshot();
            });
        
            it("should return status 422 - duplicate account", async (): Promise<void> => {
                await request(app).post("/v1/account/register").send(REGISTER_VALID);
                const { body } = await request(app)
                    .post("/v1/account/register")
                    .send(REGISTER_VALID)
                    .expect(422);
                expect(body).toMatchSnapshot();
            });
        
        });
     
        describe("POST /login", (): void => {  
            beforeEach(async (): Promise<void> => initMongo());
            afterAll(async (): Promise<void> => disconnectMongo());
            
            it("should return status 200 and the user's JWT - valid login", async (): Promise<void> => {
                await registerValidUser(userOpts);
                const response = await request(app)
                    .post("/v1/account/login")
                    .send(REGISTER_VALID);
                expect(response.status).toBe(200);
                const payload = await jwt.verify(response.body.token, SESSION_SECRET);
                expect((payload as JWTPayload).email).toBe(REGISTER_VALID.email);
            });

            it("should return status 403 - email not registered", async (): Promise<void> => {
                const { body } = await request(app)
                    .post("/v1/account/login")
                    .send(REGISTER_VALID)
                    .expect(403);
                expect(body).toMatchSnapshot();                    
            });

            it("should return status 403 - invalid credentials", async (): Promise<void> => {
                await registerValidUser(userOpts);
                const { body } = await request(app)
                    .post("/v1/account/login")
                    .send({
                        email: REGISTER_VALID.email,
                        password: "wrong_password"
                    })
                    .expect(403);
                expect(body).toMatchSnapshot();   
            });

            it("should return status 403 - no payload", async (): Promise<void> => {
                await registerValidUser(userOpts);
                const { body } = await request(app)
                    .post("/v1/account/login")
                    .send({})
                    .expect(403);
                expect(body).toMatchSnapshot();   
            });

        });

        describe("POST /forgot", (): void => {
            let sendMailMock: jest.Mock;
            beforeEach(async (): Promise<void> => {
                sendMailMock = jest.fn();
                (nodemailer.createTransport as jest.Mock).mockReturnValue({"sendMail": sendMailMock});

                await initMongo();
                await registerValidUser(userOpts);
            });
            afterAll(async (): Promise<void> => disconnectMongo());
            
            it("should return 201, set a password reset token and send an email", async (): Promise<void> => {
                await request(app)
                    .post("/v1/account/forgot")
                    .send({ email: REGISTER_VALID.email })
                    .expect(201);
                
                const user = await User.findOne({});
                expect(user.passwordResetToken).toBeDefined();
                expect(sendMailMock).toHaveBeenCalled();
            });

            it("should return 422, does not set a password reset token or send an email - no data", async (): Promise<void> => {
                const { body } = await request(app)
                    .post("/v1/account/forgot")
                    .send({})
                    .expect(422);
                expect(body).toMatchSnapshot();
                const user = await User.findOne({});
                expect(user.passwordResetToken).toBeUndefined();
                expect(sendMailMock).toBeCalledTimes(0);
            });

            it("should return 404, does not set a password reset token or send an email - email not registered", async (): Promise<void> => {
                const { body } = await request(app)
                    .post("/v1/account/forgot")
                    .send({ email: "not@registered.email" })
                    .expect(404);
                expect(body).toMatchSnapshot();
                const user = await User.findOne({});
                expect(user.passwordResetToken).toBeUndefined();
                expect(sendMailMock).toBeCalledTimes(0);
            });
        });

        describe("POST /reset/:token", (): void => {
            let sendMailMock: jest.Mock;
            const RESET_PASSWORD_VALID = {
                password: "different_valid_password",
                confirm: "different_valid_password"
            };
            const RESET_PASSWORD_INVALID = {
                password: "pass",
                confirm: "different_password"
            };
            beforeEach(async (): Promise<void> => {
                sendMailMock = jest.fn();
                (nodemailer.createTransport as jest.Mock).mockReturnValue({"sendMail": sendMailMock});
                await initMongo();
                await User.create({
                    email: "valid@email.com",
                    password: "$2b$10$dn9jixNaX2WCvnVWBfW4aucSPTS41hzE9.A3n7QLPL4bkHQ.6eCqK",
                    id: "b27e8455-eac8-47c9-babc-8a8a6be5e4ae",
                    passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
                    passwordResetToken: "4ec7149e1c5d55721a9cb2b069c22ac0"
                });
            });
            afterAll(async (): Promise<void> => disconnectMongo());

            it("should return 201 and reset the password", async(): Promise<void> => {
                let user = await User.findOne({});
                await request(app)
                    .post(`/v1/account/reset/${user.passwordResetToken}`)
                    .send(RESET_PASSWORD_VALID)
                    .expect(201);
                user = await User.findOne({});
                expect(sendMailMock).toHaveBeenCalled();
                expect(await user.authenticate(RESET_PASSWORD_VALID.password)).toBe(true);
            });

            it("should return 422 - password mismatch, password too short and invalid token", async(): Promise<void> => {
                const { body } = await request(app)
                    .post("/v1/account/reset/invalid_token")
                    .send(RESET_PASSWORD_INVALID)
                    .expect(422);
                expect(body).toMatchSnapshot();
                expect(sendMailMock).toBeCalledTimes(0);
            });

            it("should return 422 - expired token", async(): Promise<void> => {
                const user = await User.findOne({});
                user.passwordResetExpires = new Date(Date.now() - 1000);
                await user.save();
                const { body } = await request(app)
                    .post(`/v1/account/reset/${user.passwordResetExpires}`)
                    .send(RESET_PASSWORD_VALID)
                    .expect(422);
                expect(body).toMatchSnapshot();
                expect(sendMailMock).toBeCalledTimes(0);
            });
        });

        describe("GET /profile", (): void => {
            beforeEach(async (): Promise<void> => await initMongo());
            afterAll(async (): Promise<void> => disconnectMongo());

            it("should return 200 and the user's profile information", async (): Promise<void> => {
                const token = await registerValidUser(userOpts);
                const { body } = await request(app)
                    .get("/v1/account/profile")
                    .set("authorization", `Bearer ${token}`)
                    .expect(200);
                expect(body).toMatchSnapshot();
            });

            it("should return 401 - invalid authorization token", async (): Promise<void> => {
                await registerValidUser(userOpts);
                await request(app)
                    .get("/v1/account/profile")
                    .expect(401);
            });
        });

        describe("POST /profile", (): void => {
            beforeEach(async (): Promise<void> => await initMongo());
            afterAll(async (): Promise<void> => disconnectMongo());
            const PROFILE_DATA = {
                name: "Valid User",
                gender: "User",
                location: "Userland",
                website: "valid.user.com"
            };

            it("should return 200 and change the user's profile information", async (): Promise<void> => {
                const token = await registerValidUser(userOpts);
                await request(app)
                    .post("/v1/account/profile")
                    .set("authorization", `Bearer ${token}`)
                    .send(PROFILE_DATA)
                    .expect(200);
                const user = await User.findOne({});
                expect(user.profile.name).toBe(PROFILE_DATA.name);
                expect(user.profile.gender).toBe(PROFILE_DATA.gender);
                expect(user.profile.location).toBe(PROFILE_DATA.location);
                expect(user.profile.website).toBe(PROFILE_DATA.website);
            });

            it("should return 200 and return the profile", async (): Promise<void> => {
                const token = await registerValidUser(userOpts);
                const { body } = await request(app)
                    .post("/v1/account/profile")
                    .set("authorization", `Bearer ${token}`)
                    .send(PROFILE_DATA)
                    .expect(200);
                expect(body).toMatchSnapshot();
            });

            it("should return 401 - invalid authorization token", async (): Promise<void> => {
                await registerValidUser(userOpts);
                await request(app)
                    .post("/v1/account/profile")
                    .send(PROFILE_DATA)
                    .expect(401);
                const user = await User.findOne({});
                expect(user.profile.name).toBeUndefined();
                expect(user.profile.gender).toBeUndefined();
                expect(user.profile.location).toBeUndefined();
                expect(user.profile.website).toBeUndefined();
            });
        });

        describe("POST /password", (): void => {
            beforeEach(async (): Promise<void> => initMongo());
            afterAll(async (): Promise<void> => disconnectMongo());

            const VALID_PASSWORD_PAYLOAD = {
                password: "newValidPassword",
                confirm: "newValidPassword"
            };

            const INVALID_PASSWORD_PAYLOAD = {
                password: "short",
                confirm: "wrong"
            };

            it("should return 200 and change the user's password", async (): Promise<void> => {
                const token = await registerValidUser(userOpts);
                await request(app)
                    .post("/v1/account/password")
                    .set("authorization", `Bearer ${token}`)
                    .send(VALID_PASSWORD_PAYLOAD)
                    .expect(200);
                const user = await User.findOne({});
                expect(await bcrypt.compare(VALID_PASSWORD_PAYLOAD.password, user.password)).toBe(true);
            });

            it("should return 401 - invalid authorization token", async (): Promise<void> => {
                await registerValidUser(userOpts);
                await request(app)
                    .post("/v1/account/password")
                    .set("authorization", "Bearer invalid_token")
                    .send(VALID_PASSWORD_PAYLOAD)
                    .expect(401);
                const user = await User.findOne({});
                expect(await bcrypt.compare(VALID_PASSWORD_PAYLOAD.password, user.password)).toBe(false);
            });

            it("should return 422 - invalid data", async (): Promise<void> => {
                const token = await registerValidUser(userOpts);
                await request(app)
                    .post("/v1/account/password")
                    .set("authorization", `Bearer ${token}`)
                    .send(INVALID_PASSWORD_PAYLOAD)
                    .expect(422);
                const user = await User.findOne({});
                expect(await bcrypt.compare(VALID_PASSWORD_PAYLOAD.password, user.password)).toBe(false);
            });
        });

        describe("POST /delete", (): void => {
            beforeEach(async (): Promise<void> => initMongo());
            afterAll(async (): Promise<void> => disconnectMongo());

            it("should return 200 and delete the user", async (): Promise<void> => {
                const token = await registerValidUser(userOpts);
                await request(app)
                    .post("/v1/account/delete")
                    .set("authorization", `Bearer ${token}`)
                    .expect(200);
                expect(await User.findOne()).toBeNull();
            });

            it("should return 401 - invalid authorization token", async (): Promise<void> => {
                await registerValidUser(userOpts);
                await request(app)
                    .post("/v1/account/delete")
                    .expect(401);
                expect(await User.findOne()).toBeDefined();
            });
        });
    });
});