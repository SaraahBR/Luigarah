import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { country, state } = await req.json();
  if (!country || !state) return NextResponse.json({ error: "country e state são obrigatórios" }, { status: 400 });

  const r = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ country, state }),
    cache: "no-store",
  });

  const data = await r.json();
  const cities: string[] = data?.data?.sort((a: string, b: string) => a.localeCompare(b, "pt-BR")) || [];
  return NextResponse.json(cities);
}
