import dotenv from "dotenv"

dotenv.config();

if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required. Add it to src/.env.");
}

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required. Add it to src/.env.");
}

const config={
    MONGO_URI: process.env.MONGODB_URI,
    JWT_SECRET:process.env.JWT_SECRET,

}

export default config;