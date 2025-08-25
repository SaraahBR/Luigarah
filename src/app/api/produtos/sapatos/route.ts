import { NextResponse } from "next/server";
import data from "@/data/sapatos.json";

export async function GET() {
  return NextResponse.json(data.produtos);
}
