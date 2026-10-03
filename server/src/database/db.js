import mongoose from "mongoose";

const db = async () => {
    try {
        console.log(`\n MongoDB connecting to :: ${process.env.MONGODB_URL}`)
        // const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}`)
        const connectionInstance = await mongoose.connect(
            process.env.MONGODB_URL,
            {
                dbName: process.env.DB_NAME,
            }
        );
        console.log(`\n MongoDB connected !! DB HOST :: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("Mongodb connection error", error);
        process.exit(1)
    }
}

export default db;