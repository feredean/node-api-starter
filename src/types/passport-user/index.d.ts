export {};

declare global {
    namespace Express {
        interface User {
            email: string;
            role: string;
            sub: string;
            iat: number;
            exp: number;
        }
    }
}
