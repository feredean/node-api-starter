import { handleMissing, isAuthenticated, hasPermission, handleErrors } from "../../src/middleware";

/* eslint-disable @typescript-eslint/no-explicit-any */

const mockResponse = (): any => {
    const res: any = {};
    res.sendStatus = jest.fn().mockReturnValue(res);
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("Middlewares", (): void => {

    describe("404 handler", (): void => {
        it("should return status 404", (): void => {
            const res = mockResponse();
            handleMissing({} as any, res);
            expect(res.sendStatus).toHaveBeenCalledWith(404);
        });
    });

    describe("error handler", (): void => {
        it("should return status 500 and Server Error message", (): void => {
            const res = mockResponse();
            handleErrors({} as any, {} as any, res, {} as any);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({errors: [{ msg: "Server Error" }]});
        });
    });

    const EXPIRED_USER_TOKEN =  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZhbGlkQGVtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNTY1MjU5ODc2LCJleHAiOjE1NjUyNTk4NzcsInN1YiI6ImMwODFmY2QyLTUyMGItNGNkMS04ZjBiLTUxN2ZhNzdmZmU0YyJ9.pG9kAXGIAecuhbzejy08-uMntZT94u-8BV1LQgPRFJo";
    const EXPIRED_ADMIN_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZhbGlkQGVtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU2NTI1OTg3NiwiZXhwIjoxNTY1MjU5ODc3LCJzdWIiOiJjMDgxZmNkMi01MjBiLTRjZDEtOGYwYi01MTdmYTc3ZmZlNGMifQ.iGhhlgB6gh5usj90s92RQyEsBjhU7yzn6Y8YrxSPtJY";
    
    const VALID_USER_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZhbGlkQGVtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNTY1MjU4NjMyLCJzdWIiOiJjMDgxZmNkMi01MjBiLTRjZDEtOGYwYi01MTdmYTc3ZmZlNGMifQ.WPBcEdyjcKObhALdoyFb9825EvjTPzgD8yxb339kmV8";
    const VALID_ADMIN_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZhbGlkQGVtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU2NTI1ODYzMiwic3ViIjoiYzA4MWZjZDItNTIwYi00Y2QxLThmMGItNTE3ZmE3N2ZmZTRjIn0.vabX4sliFmwcfiaR0h7lVgR1tl5jlrHX2uVbP4irnPQ";

    describe("isAuthenticated", (): void => {
        it("should call next()", (): void => {
            const req: any = {
                headers: { authorization: VALID_USER_TOKEN }
            };
            const res = mockResponse();
            const nextMock = jest.fn();
            isAuthenticated(req, res, nextMock);
            expect(nextMock).toHaveBeenCalled();
        });
        it("should return status 401 - expired token", (): void => {
            const req: any = {
                headers: { authorization: EXPIRED_USER_TOKEN }
            };
            const res = mockResponse();
            const nextMock = jest.fn();
            isAuthenticated(req, res, nextMock);
            expect(res.sendStatus).toHaveBeenCalledWith(401);
            expect(nextMock).toBeCalledTimes(0);
        });
        it("should return status 401 - missing authorization header", (): void => {
            const req: any = { headers: {} };
            const res = mockResponse();
            const nextMock = jest.fn();
            isAuthenticated(req, res, nextMock);
            expect(res.sendStatus).toHaveBeenCalledWith(401);
            expect(nextMock).toBeCalledTimes(0);
        });
    });

    describe("hasPermission", (): void => {
        it("should call next() - token needs admin role - has admin role", (): void => {
            const req: any = {
                headers: { authorization: VALID_ADMIN_TOKEN }
            };
            const res = mockResponse();
            const nextMock = jest.fn();
            hasPermission("admin")(req, res, nextMock);
            expect(nextMock).toHaveBeenCalled();
        });
        it("should call next() - token needs user role - has admin role", (): void => {
            const req: any = {
                headers: { authorization: VALID_ADMIN_TOKEN }
            };
            const res = mockResponse();
            const nextMock = jest.fn();
            hasPermission("user")(req, res, nextMock);
            expect(nextMock).toHaveBeenCalled();
        });
        it("should call next() - token needs user role - has user role", (): void => {
            const req: any = {
                headers: { authorization: VALID_USER_TOKEN }
            };
            const res = mockResponse();
            const nextMock = jest.fn();
            hasPermission("user")(req, res, nextMock);
            expect(nextMock).toHaveBeenCalled();
        });
        it("should return 401 - token needs admin role - has admin role but token is expired", (): void => {
            const req: any = {
                headers: { authorization: EXPIRED_ADMIN_TOKEN }
            };
            const res = mockResponse();
            const nextMock = jest.fn();
            hasPermission("admin")(req, res, nextMock);
            expect(res.sendStatus).toHaveBeenCalledWith(401);
            expect(nextMock).toBeCalledTimes(0);
        });
        it("should return 403 - token needs admin role - has user role", (): void => {
            const req: any = {
                headers: { authorization: VALID_USER_TOKEN }
            };
            const res = mockResponse();
            const nextMock = jest.fn();
            hasPermission("admin")(req, res, nextMock);
            expect(res.sendStatus).toHaveBeenCalledWith(403);
            expect(nextMock).toBeCalledTimes(0);
        });
        it("should return 401 when the authorization header is missing", (): void => {
            const req: any = {headers: {} };
            const res = mockResponse();
            const nextMock = jest.fn();
            hasPermission("admin")(req, res, nextMock);
            expect(res.sendStatus).toHaveBeenCalledWith(401);
            expect(nextMock).toBeCalledTimes(0);
        });
    });
});
