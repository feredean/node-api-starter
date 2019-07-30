import mongoose from "mongoose";
process.env.MONGO_DATABASE = "starter-test";
export const initMongo = async (): Promise<void> => {
    async function clearDB(): Promise<void> {
        await Promise.all(
            Object.keys(mongoose.connection.collections).map(async (key): Promise<void> => {
                await mongoose.connection.collections[key].deleteMany({});
            }),
        );
    }

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(
            `mongodb://localhost:27017/${process.env.MONGO_DATABASE}`,
            {
                useNewUrlParser: true,
            },
        );
    }
    await clearDB();
};
export const disconnectMongo = async (): Promise<void> => mongoose.disconnect();
