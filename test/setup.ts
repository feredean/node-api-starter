import mongoose from "mongoose";

process.env.SESSION_SECRET = "super_secret_key";

process.env.FACEBOOK_ID = "not_used";
process.env.FACEBOOK_SECRET = "not_used";

process.env.MONGO_DATABASE = "test-node-api-starter";
process.env.MONGO_HOST = "localhost";
process.env.MONGO_PORT = "27017";
process.env.MONGO_USERNAME = "not_used";
process.env.MONGO_PASSWORD = "not_used";

process.env.SENDGRID_PASSWORD = "not_used";
process.env.SENDGRID_USER = "not_used";

process.env.AWS_ACCESS_KEY_ID = "not_used";
process.env.AWS_ACCESS_KEY_SECRET = "not_used";

process.env.CORS_REGEX = "not_used";
export const initMongo = async (): Promise<void> => {
    async function clearDB(): Promise<void> {
        await Promise.all(
            Object.keys(mongoose.connection.collections).map(
                async (key): Promise<void> => {
                    await mongoose.connection.collections[key].deleteMany({});
                }
            )
        );
    }

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(
            `mongodb://localhost:27017/${process.env.MONGO_DATABASE}`
        );
    }
    await clearDB();
};
export const disconnectMongo = async (): Promise<void> => mongoose.disconnect();
