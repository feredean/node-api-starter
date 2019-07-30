
import request from "supertest";
import app from "app";
import { initMongo, disconnectMongo } from "setup";
import { User } from "models/User";

const REGISTER_VALID = {
    "email": "valid@email.com",
    "password": "validpassword"
};

const REGISTER_INVALID_EMAIL_PASSWORD = {
    "email": "a@a.a",
    "password": "asda"
};

describe("POST /v1/account", (): void => {
    beforeEach(async (): Promise<void> => initMongo());
    afterAll(async (): Promise<void> => disconnectMongo());

    it("should return 201 Created", async (): Promise<void>  => {
        await request(app)
            .post("/v1/account/register")
            .send(REGISTER_VALID)
            .set("Accept", "application/json")
            .expect(201, {
                "token": ""
            });
    });

    it("should return create a user", async (): Promise<void>  => {
        await request(app)
            .post("/v1/account/register")
            .send(REGISTER_VALID);
        const user = await User.findOne({});
        expect(user.email).toEqual("valid@email.com");
    });

    it("should return 200 Bad Request", async (): Promise<void>  => {
        await request(app)
            .post("/v1/account/register")
            .send(REGISTER_INVALID_EMAIL_PASSWORD)
            .set("Accept", "application/json")
            .expect(400, {
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
});