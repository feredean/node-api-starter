export const NODE_ENV = process.env.NODE_ENV;
export const PRODUCTION = "production";
export const JWT_EXPIRATION = "7d";
export const TEST = "test";
export const APP_PORT = 9100;
export const CORS = [
    /localhost:\d{4}$/,
    /domain\.tld$/
];
export const UNSUBSCRIBE_LANDING = "";
export const USER_ROLES = ["user", "admin", "owner"];
export const S3_CONTENT_BUCKET = "starter-content";
export const S3_CONTENT_LINK_EXPIRATION = 15 * 60; // 15 min