import { NextResponse } from "next/server";
import { z } from "zod";

/** Schema do perfil (server-side) */
const AddressSchema = z.object({
  city: z.string().optional().default(""),
  country: z.string().optional().default(""),
  state: z.string().optional().default(""),
  zip: z.string().optional().default(""),
  district: z.string().optional().default(""),
  street: z.string().optional().default(""),
  number: z.string().optional().default(""),
  complement: z.string().optional().default(""),
});

const ProfileSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  image: z.string().nullable().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  birthDate: z.string().optional(), // ISO yyyy-mm-dd
  gender: z.enum(["Masculino", "Feminino", "Não Especificado"]).optional(),
  phone: z.string().optional(),
  address: AddressSchema.optional(),
});

/** Mock em memória */
declare global {
  // eslint-disable-next-line no-var
  var __LUIGARA_PROFILE: unknown | undefined;
}
const getStore = () => (globalThis.__LUIGARA_PROFILE ??= null);

export async function GET() {
  const data = getStore();
  return NextResponse.json(data ?? {});
}

export async function PUT(req: Request) {
  try {
    const json = await req.json();
    const parsed = ProfileSchema.parse(json);

    // validações simples extras
    if (parsed.address?.zip) {
      const onlyDigits = parsed.address.zip.replace(/\D/g, "");
      if (parsed.address.country?.toLowerCase() === "brazil" && onlyDigits.length !== 8) {
        return NextResponse.json({ error: "CEP deve ter 8 dígitos (Brasil)" }, { status: 400 });
      }
    }
    if (parsed.phone) {
      const d = parsed.phone.replace(/\D/g, "");
      if (d.length < 10 || d.length > 11) {
        return NextResponse.json({ error: "Telefone deve ter 10 ou 11 dígitos" }, { status: 400 });
      }
    }

    globalThis.__LUIGARA_PROFILE = parsed;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.issues) {
      // erro do Zod
      return NextResponse.json({ error: e.issues?.[0]?.message || "Dados inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}
