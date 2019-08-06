import request from "supertest";
import app from "app";
import { initMongo, disconnectMongo } from "setup";
import { User } from "models/User";

const REGISTER_VALID = {
    "email": "valid@email.com",
    "password": "valid_password"
};

const REGISTER_INVALID_EMAIL_PASSWORD = {
    "email": "a@a.a",
    "password": "pass"
};

describe("API V1", (): void => {
    describe("POST /v1/account", (): void => {
    
        beforeEach(async (): Promise<void> => initMongo());
        afterAll(async (): Promise<void> => disconnectMongo());
    
        it("should return status 201 and create a user", async (): Promise<void> => {
            await request(app)
                .post("/v1/account/register")
                .send(REGISTER_VALID)
                .set("Accept", "application/json")
                .expect(201, {
                    "token": ""
                });
            const user = await User.findOne({});
            expect(user.email).toEqual(REGISTER_VALID.email);
        });
    
        it("should return status 422 - invalid email and password", async (): Promise<void> => {
            await request(app)
                .post("/v1/account/register")
                .send(REGISTER_INVALID_EMAIL_PASSWORD)
                .set("Accept", "application/json")
                .expect(422, {
                    "errors": [
                        {
                            "msg": "Please enter a valid email address."
                        },
                        {
                            "msg": "Password must be at least 8 characters long"
                        }
                    ]
                });
        });
    
        it("should return status 422 - duplicate account", async (): Promise<void> => {
            await request(app).post("/v1/account/register").send(REGISTER_VALID);
            await request(app)
                .post("/v1/account/register")
                .send(REGISTER_VALID)
                .set("Accept", "application/json")
                .expect(422, {
                    "errors": [
                        {
                            "msg": "Account already exists."
                        }
                    ]
                });
        });
    
    });
});