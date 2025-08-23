import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { country } = await req.json();
  if (!country) return NextResponse.json({ error: "country é obrigatório" }, { status: 400 });

  const r = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ country }),
    cache: "no-store",
  });

  const data = await r.json();
  const states: string[] = data?.data?.states?.map((s: any) => s.name).sort((a: string, b: string) => a.localeCompare(b, "pt-BR")) || [];
  return NextResponse.json(states);
}
