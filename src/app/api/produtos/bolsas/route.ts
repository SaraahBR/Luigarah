import { NextResponse } from "next/server";
import data from "@/data/bolsas.json";

export async function GET() {
  return NextResponse.json(data.produtos);
}
