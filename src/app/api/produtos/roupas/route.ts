import { NextResponse } from "next/server";
import data from "@/data/roupas.json";

export async function GET() {
  return NextResponse.json(data.produtos);
}
