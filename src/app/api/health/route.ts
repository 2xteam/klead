import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectDB();
    const state = mongoose.connection.readyState;

    return NextResponse.json({
      status: "ok",
      mongodb: state === 1 ? "connected" : "disconnected",
      database: "klead",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
