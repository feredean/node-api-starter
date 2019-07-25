
import request, { Test } from "supertest";
import app from "../src/app";

describe("GET /api", (): void => {
    it("should return 200 OK", (): Test  => {
        return request(app).get("/")
            .expect(200);
    });
});