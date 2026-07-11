import dns from "node:dns";
import mongoose from "mongoose";

// Windows 로컬 DNS가 MongoDB Atlas SRV 조회를 거부하는 경우 대비
dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

function getMongoUri(): string {
  const value = process.env.MONGODB_URI;
  if (!value) {
    throw new Error("MONGODB_URI 환경 변수가 설정되지 않았습니다.");
  }
  return value;
}

const MONGODB_URI = getMongoUri();

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      dbName: "klead",
      serverSelectionTimeoutMS: 20000,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
