import { NextFunction } from "express";

import httpMocks from "node-mocks-http";
import * as mw from "middleware";

describe("Middlewares", (): void => {

    describe("404 handler", (): void => {
        it("should return status 404", (): void => {
            const request = httpMocks.createRequest();
            const response = httpMocks.createResponse();
            mw.handleMissing(request, response);
            expect(response.statusCode).toBe(404);
        });
    });

    describe("error handler", (): void => {
        it("should return status 500 and Server Error message", (): void => {
            const request = httpMocks.createRequest();
            const response = httpMocks.createResponse();
            mw.handleErrors({} as unknown as Error, request, response, {} as unknown as NextFunction);
            const data = response._getJSONData();
            expect(response.statusCode).toBe(500);
            expect(data).toEqual({errors: [{ msg: "Server Error" }]});
        });
    });

});