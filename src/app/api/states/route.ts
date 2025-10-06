import { NextResponse } from "next/server";

type StatesAPIResponse = {
  data?: {
    states?: Array<{ name?: string }>;
  };
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as unknown));
  const country =
    typeof (body as Record<string, unknown>).country === "string"
      ? ((body as Record<string, unknown>).country as string)
      : "";

  if (!country) {
    return NextResponse.json({ error: "country é obrigatório" }, { status: 400 });
  }

  const r = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ country }),
    cache: "no-store",
  });

  const raw = (await r.json().catch(() => ({}))) as unknown;
  const data = raw as StatesAPIResponse;

  const states =
    data?.data?.states
      ?.map((s) => (typeof s?.name === "string" ? s.name : ""))
      .filter((n): n is string => Boolean(n))
      .sort((a, b) => a.localeCompare(b, "pt-BR")) || [];

  return NextResponse.json(states);
}
