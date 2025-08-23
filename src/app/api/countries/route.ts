import { NextResponse } from "next/server";

export async function GET() {
  const r = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2", { cache: "force-cache" });
  const json = (await r.json()) as Array<{ name: { common: string }; cca2: string }>;

  const countries = json
    .map((c) => ({ name: c.name.common, iso2: c.cca2 }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return NextResponse.json(countries);
}
