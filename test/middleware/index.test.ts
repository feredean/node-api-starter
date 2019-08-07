/* eslint-disable @typescript-eslint/no-explicit-any */
import * as mw from "middleware";

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
            mw.handleMissing({} as any, res);
            expect(res.sendStatus).toHaveBeenCalledWith(404);
        });
    });

    describe("error handler", (): void => {
        it("should return status 500 and Server Error message", (): void => {
            const res = mockResponse();
            mw.handleErrors({} as any, {} as any, res, {} as any);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({errors: [{ msg: "Server Error" }]});
        });
    });

    const EXPIRED_USER_TOKEN =  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZhbGlkQGVtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNTY1MjU5ODc2LCJleHAiOjE1NjUyNTk4NzcsInN1YiI6ImMwODFmY2QyLTUyMGItNGNkMS04ZjBiLTUxN2ZhNzdmZmU0YyJ9.Jv1q1Dqu2_FgEMCm6Gi3iNHvxhxz8bFo6eAfpkzkU80";
    const EXPIRED_ADMIN_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZhbGlkQGVtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU2NTI1OTg3NiwiZXhwIjoxNTY1MjU5ODc3LCJzdWIiOiJjMDgxZmNkMi01MjBiLTRjZDEtOGYwYi01MTdmYTc3ZmZlNGMifQ.jSo6RLnzqxkClVeeKPUWx8KalzdvNDNqMumwTbk4FP0";
    
    const VALID_USER_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZhbGlkQGVtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNTY1MjU4NjMyLCJzdWIiOiJjMDgxZmNkMi01MjBiLTRjZDEtOGYwYi01MTdmYTc3ZmZlNGMifQ.hXFIgZ87JDd32WiLXwijturhdeWRRQQ_gheHhZBGV2M";
    const VALID_ADMIN_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZhbGlkQGVtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU2NTI1ODYzMiwic3ViIjoiYzA4MWZjZDItNTIwYi00Y2QxLThmMGItNTE3ZmE3N2ZmZTRjIn0.tWTHAM3t9oTRf9CxgJmo4RuzvqWnZfhzmg9sjb-BQBc";

    describe("isAuthenticated", (): void => {
        it("should call next()", async (): Promise<void> => {
            const req: any = {
                headers: { authorization: VALID_USER_TOKEN }
            };
            const res = mockResponse();
            const nextMock = jest.fn();
            await mw.isAuthenticated(req, res, nextMock);
            expect(nextMock).toHaveBeenCalled();
        });
        it("should return status 401 - expired token", async (): Promise<void> => {
            const req: any = {
                headers: { authorization: EXPIRED_USER_TOKEN }
            };
            const res = mockResponse();
            const nextMock = jest.fn();
            await mw.isAuthenticated(req, res, nextMock);
            expect(res.sendStatus).toHaveBeenCalledWith(401);
            expect(nextMock).toBeCalledTimes(0);
        });
        it("should return status 401 - missing authorization header", async (): Promise<void> => {
            const req: any = { headers: {} };
            const res = mockResponse();
            const nextMock = jest.fn();
            await mw.isAuthenticated(req, res, nextMock);
            expect(res.sendStatus).toHaveBeenCalledWith(401);
            expect(nextMock).toBeCalledTimes(0);
        });
    });

    describe("hasPermission", (): void => {
        it("should call next() - token needs admin role - has admin role", async (): Promise<void> => {
            const req: any = {
                headers: { authorization: VALID_ADMIN_TOKEN }
            };
            const res = mockResponse();
            const nextMock = jest.fn();
            await mw.hasPermission("admin")(req, res, nextMock);
            expect(nextMock).toHaveBeenCalled();
        });
        it("should call next() - token needs user role - has admin role", async (): Promise<void> => {
            const req: any = {
                headers: { authorization: VALID_ADMIN_TOKEN }
            };
            const res = mockResponse();
            const nextMock = jest.fn();
            await mw.hasPermission("user")(req, res, nextMock);
            expect(nextMock).toHaveBeenCalled();
        });
        it("should call next() - token needs user role - has user role", async (): Promise<void> => {
            const req: any = {
                headers: { authorization: VALID_USER_TOKEN }
            };
            const res = mockResponse();
            const nextMock = jest.fn();
            await mw.hasPermission("user")(req, res, nextMock);
            expect(nextMock).toHaveBeenCalled();
        });
        it("should return 401 - token needs admin role - has admin role but token is expired", async (): Promise<void> => {
            const req: any = {
                headers: { authorization: EXPIRED_ADMIN_TOKEN }
            };
            const res = mockResponse();
            const nextMock = jest.fn();
            await mw.hasPermission("admin")(req, res, nextMock);
            expect(res.sendStatus).toHaveBeenCalledWith(401);
            expect(nextMock).toBeCalledTimes(0);
        });
        it("should return 403 - token needs admin role - has user role", async (): Promise<void> => {
            const req: any = {
                headers: { authorization: VALID_USER_TOKEN }
            };
            const res = mockResponse();
            const nextMock = jest.fn();
            await mw.hasPermission("admin")(req, res, nextMock);
            expect(res.sendStatus).toHaveBeenCalledWith(403);
            expect(nextMock).toBeCalledTimes(0);
        });
        it("should return 401 when the authorization header is missing", async (): Promise<void> => {
            const req: any = {headers: {} };
            const res = mockResponse();
            const nextMock = jest.fn();
            await mw.hasPermission("admin")(req, res, nextMock);
            expect(res.sendStatus).toHaveBeenCalledWith(401);
            expect(nextMock).toBeCalledTimes(0);
        });
    });
});
