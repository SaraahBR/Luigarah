"use client";

import Link from "next/link";
import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FiArrowRight,
  FiHeart,
  FiHome,
  FiLink,
  FiLock,
  FiLogOut,
  FiPackage,
  FiShield,
  FiUploadCloud,
  FiX,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { Loader2 } from "lucide-react";

import { useAuthUser, Gender, UserProfile } from "../useAuthUser";
import authApi from "@/hooks/api/authApi";
import { validarSenha } from "@/lib/passwordValidation";
import { useTranslations } from "next-intl";
import { useErroApi } from "@/i18n/useErroApi";
import { useCatalogo } from "@/i18n/useCatalogo";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Sonner (toasts)
import { toast } from "sonner";

/* --- Helpers visuais --- */
function Monograma({ name }: { readonly name: string }) {
  const initials =
    name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("") || "LH";

  return (
    <div className="h-16 w-16 rounded-full bg-black text-white grid place-items-center text-lg font-semibold tracking-wide select-none">
      {initials}
    </div>
  );
}

/* --- Máscaras --- */
const formatCEP = (v: string) => {
  const d = v.replaceAll(/\D/g, "").slice(0, 8);
  return d.replace(/^(\d{5})(\d{0,3}).*/, (_, a, b) => (b ? `${a}-${b}` : a));
};
const formatPhone = (v: string) => {
  const d = v.replaceAll(/\D/g, "").slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/^(\d{0,2})(\d{0,4})(\d{0,4}).*/, (_, a, b, c) =>
      [a && `(${a}`, a && ") ", b, c && `-${c}`].filter(Boolean).join("")
    );
  }
  return d.replace(/^(\d{0,2})(\d{0,5})(\d{0,4}).*/, (_, a, b, c) =>
    [a && `(${a}`, a && ") ", b, c && `-${c}`].filter(Boolean).join("")
  );
};

const isBlank = (v?: string | null) => !String(v ?? "").trim();

type CampoObrigatorio =
  | "firstName" | "lastName" | "birthDate" | "phone" | "email"
  | "country" | "state" | "city" | "zip" | "district" | "street" | "number";

// Devolve as chaves dos campos faltantes; o nome exibido vem das traduções (minhaConta.fields)
function validateRequired(p?: UserProfile | null) {
  const missing: CampoObrigatorio[] = [];

  // Pessoais
  if (isBlank(p?.firstName)) missing.push("firstName");
  if (isBlank(p?.lastName)) missing.push("lastName");
  if (isBlank(p?.birthDate)) missing.push("birthDate");
  // Gênero não é obrigatório - aceita "Não Especificado" ou vazio
  if (isBlank(p?.phone)) missing.push("phone");
  if (isBlank(p?.email)) missing.push("email");

  // Endereço
  const a = p?.address;
  if (isBlank(a?.country)) missing.push("country");
  if (isBlank(a?.state)) missing.push("state");
  if (isBlank(a?.city)) missing.push("city");
  if (isBlank(a?.zip)) missing.push("zip");
  if (isBlank(a?.district)) missing.push("district");
  if (isBlank(a?.street)) missing.push("street");
  if (isBlank(a?.number)) missing.push("number");

  return missing;
}

export default function MinhaConta() {
  const { profile, updateProfile, saveProfile, savePreferences, setAvatar, logout, isOAuthUser } = useAuthUser();
  const t = useTranslations("minhaConta");
  const tSenha = useTranslations("erros.senha");
  const traduzirErro = useErroApi();
  const { locale, tag } = useCatalogo();
  const nomesCampos = (campos: CampoObrigatorio[]) => campos.map((c) => t(`fields.${c}`)).join(", ");

  /* Avatar upload */
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState<boolean>(false);
  
  // Modal de URL para foto
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [fotoUrl, setFotoUrl] = useState("");

  // Modal de Alterar Senha
  const [showAlterarSenhaModal, setShowAlterarSenhaModal] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenhaState, setNovaSenhaState] = useState("");
  const [confirmarNovaSenhaState, setConfirmarNovaSenhaState] = useState("");
  const [loadingAlterarSenha, setLoadingAlterarSenha] = useState(false);
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarNovaSenha, setShowConfirmarNovaSenha] = useState(false);

  const avatar = useMemo(() => profile?.image ?? null, [profile?.image]);
  const nameFull = profile?.name || t("customer");
  const email = profile?.email || t("emailExample");

  function onPickFile() {
    fileRef.current?.click();
  }
  
  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    
    // Valida tipo de arquivo
    if (!/^image\/(png|jpe?g|webp|gif)$/i.test(f.type)) {
      toast.error(t("toasts.imageType"));
      return;
    }

    // Valida tamanho (máx 5MB)
    if (f.size > 5 * 1024 * 1024) {
      toast.error(t("toasts.imageTooBig"));
      return;
    }

    // Mostra loading
    toast.loading(t("toasts.uploadingPhoto"), { id: "upload-foto" });

    const reader = new FileReader();
    reader.onload = async () => {
      const result = await setAvatar((reader.result as string | null) ?? "");
      
      if (result.success) {
        toast.success(t("toasts.photoUpdated"), { id: "upload-foto" });
      } else {
        toast.error(traduzirErro(result.error || "", t("toasts.photoError")), { id: "upload-foto" });
      }
    };
    reader.readAsDataURL(f);
  }

  // Atualizar foto por URL
  async function atualizarFotoPorUrl() {
    if (!fotoUrl.trim()) {
      toast.error(t("toasts.invalidUrl"));
      return;
    }

    try {
      toast.loading(t("toasts.updatingPhoto"), { id: "update-foto-url" });
      
      await authApi.atualizarFotoPorUrl(fotoUrl.trim());
      
      // Atualiza o profile localmente
      updateProfile({ image: fotoUrl.trim() });
      
      toast.success(t("toasts.photoUpdated"), { id: "update-foto-url" });
      setShowUrlModal(false);
      setFotoUrl("");
    } catch (error) {
      console.error("Erro ao atualizar foto por URL:", error);
      toast.error(t("toasts.photoError"), { id: "update-foto-url" });
    }
  }

  // Remover foto de perfil
  async function removerFoto() {
    try {
      toast.loading(t("toasts.removingPhoto"), { id: "remove-foto" });
      
      await authApi.removerFotoPerfil();
      
      // Atualiza o profile localmente
      updateProfile({ image: null });
      
      toast.success(t("toasts.photoRemoved"), { id: "remove-foto" });
    } catch (error) {
      console.error("Erro ao remover foto:", error);
      toast.error(t("toasts.photoRemoveError"), { id: "remove-foto" });
    }
  }

  // Alterar senha (apenas para contas locais)
  async function handleAlterarSenha(e: React.FormEvent) {
    e.preventDefault();

    if (!senhaAtual || !novaSenhaState || !confirmarNovaSenhaState) {
      toast.error(t("toasts.fillAll"));
      return;
    }

    if (novaSenhaState !== confirmarNovaSenhaState) {
      toast.error(t("toasts.passwordsDontMatch"));
      return;
    }

    // Valida nova senha
    const validacao = validarSenha(novaSenhaState);
    if (!validacao.valido) {
      toast.error(tSenha(validacao.codigos[0]));
      return;
    }

    setLoadingAlterarSenha(true);

    try {
      await authApi.alterarSenha({
        senhaAtual,
        novaSenha: novaSenhaState,
        confirmarNovaSenha: confirmarNovaSenhaState,
      });

      toast.success(t("toasts.passwordChanged"));
      
      // Limpa os campos e fecha o modal
      setSenhaAtual("");
      setNovaSenhaState("");
      setConfirmarNovaSenhaState("");
      setShowAlterarSenhaModal(false);
    } catch (error: unknown) {
      toast.error(traduzirErro(error));
    } finally {
      setLoadingAlterarSenha(false);
    }
  }

  /* País/Estado/Cidade dinâmicos junto com CEP */
  // name = valor salvo (inglês, usado nas APIs); label = nome exibido (em português vindo da API)
  const [countriesPt, setCountries] = useState<Array<{ name: string; iso2: string; label: string }>>([]);
  // Nos outros idiomas o nome do país vem do próprio navegador (Intl.DisplayNames)
  const countries = useMemo(() => {
    if (locale === "pt") return countriesPt;
    let nomes: Intl.DisplayNames | null = null;
    try {
      nomes = new Intl.DisplayNames([tag], { type: "region" });
    } catch {
      return countriesPt;
    }
    return countriesPt
      .map((c) => {
        let label = c.label;
        try {
          label = nomes?.of(c.iso2) || c.label;
        } catch {
          // iso2 desconhecido: mantém o nome original
        }
        return { ...c, label };
      })
      .sort((a, b) => a.label.localeCompare(b.label, tag));
  }, [countriesPt, locale, tag]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const ultimoCepBuscado = useRef("");

  const countryLabel = (name?: string) =>
    countries.find((c) => c.name === name)?.label || name || "";

  // Combobox de cidade
  const [cityOpen, setCityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");

  // Carrega países
  useEffect(() => {
    fetch("/api/countries")
      .then((r) => r.json())
      .then(setCountries)
      .catch(() => setCountries([]));
  }, []);

  // Ao escolher país também busca estados
  useEffect(() => {
    const country = profile?.address?.country;
    if (!country) {
      setStates([]);
      setCities([]);
      return;
    }
    setLoadingStates(true);
    fetch("/api/states", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country }),
    })
      .then((r) => r.json())
      .then((arr: unknown) => {
        const list = Array.isArray(arr) ? (arr.filter((x): x is string => typeof x === "string")) : [];
        setStates(list);
        setCities([]);
      })
      .catch(() => {
        setStates([]);
        setCities([]);
      })
      .finally(() => setLoadingStates(false));
  }, [profile?.address?.country]);

  // Ao escolher estado também busca cidades
  useEffect(() => {
    const country = profile?.address?.country;
    const state = profile?.address?.state;
    if (!country || !state) {
      setCities([]);
      return;
    }
    setLoadingCities(true);
    fetch("/api/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country, state }),
    })
      .then((r) => r.json())
      .then((arr: unknown) => {
        const list = Array.isArray(arr) ? (arr.filter((x): x is string => typeof x === "string")) : [];
        setCities(list);
      })
      .catch(() => setCities([]))
      .finally(() => setLoadingCities(false));
  }, [profile?.address?.country, profile?.address?.state]);

  // CEP (Brasil) também preenche endereço e sonner
  async function lookupCEP(cep: string) {
    const clean = cep.replaceAll(/\D/g, "");
    if (clean.length !== 8 || clean === ultimoCepBuscado.current) return;
    // CEP só existe no Brasil: com outro país selecionado o campo é código postal livre
    const pais = profile?.address?.country;
    if (pais && pais.toLowerCase() !== "brazil") return;
    ultimoCepBuscado.current = clean;

    setLoadingCEP(true);
    try {
      const r = await fetch(`/api/cep?value=${clean}`);
      const data = await r.json();
      if (!r.ok) throw new Error(r.status === 404 ? t("toasts.cepNotFound") : t("toasts.cepInvalid"));

      updateProfile({
        address: {
          ...profile?.address,
          zip: data.zip,
          city: data.city,
          state: data.state,
          // CEP geral de cidade não tem rua/bairro: mantém o que já foi digitado
          district: data.district || profile?.address?.district || "",
          street: data.street || profile?.address?.street || "",
          country: data.country,
        },
      });

      if (data.street) {
        toast.success(t("toasts.addressFilled"));
      } else {
        toast.success(t("toasts.cityCep"));
      }
    } catch (e: unknown) {
      ultimoCepBuscado.current = "";
      const msg = e instanceof Error ? e.message : t("toasts.cepError");
      toast.error(msg);
    } finally {
      setLoadingCEP(false);
    }
  }

  /* Helpers de formulário */
  function onAddressField(key: keyof NonNullable<UserProfile["address"]>) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      updateProfile({
        address: { ...profile?.address, [key]: e.target.value },
      });
  }

  /* Preferências: salvam na hora, independente do resto do formulário */
  const preferencias = profile?.preferences ?? { receberNovidades: true, alertasReposicao: false };

  async function onTogglePreferencia(campo: "receberNovidades" | "alertasReposicao", valor: boolean) {
    const result = await savePreferences({ ...preferencias, [campo]: valor });
    if (result.success) {
      toast.success(t("toasts.preferenceSaved"));
    } else {
      toast.error(traduzirErro(result.error || "", t("toasts.preferenceError")));
    }
  }

  /* Campos obrigatórios faltantes */
  const missingRequired = useMemo(() => validateRequired(profile), [profile]);
  const hasMissing = missingRequired.length > 0;

  /* Filtros de busca */
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return countries;
    const search = countrySearch.toLowerCase();
    return countries.filter(c => c.label.toLowerCase().includes(search) || c.name.toLowerCase().includes(search));
  }, [countries, countrySearch]);

  const filteredStates = useMemo(() => {
    if (!stateSearch.trim()) return states;
    const search = stateSearch.toLowerCase();
    return states.filter(s => s.toLowerCase().includes(search));
  }, [states, stateSearch]);

  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return cities;
    const search = citySearch.toLowerCase();
    return cities.filter(c => c.toLowerCase().includes(search));
  }, [cities, citySearch]);

  /* Salvar */
  async function onSave() {
    setSaveError(null);
    setSaveOk(false);

    // 1) Validação de obrigatórios
    const missing = validateRequired(profile);
    if (missing.length) {
      const msg = t("fillRequired", { campos: nomesCampos(missing) });
      setSaveError(msg);
      toast.error(msg);
      return;
    }

    // 2) Validações adicionais (CEP/telefone)
    const isBR = profile?.address?.country?.toLowerCase() === "brazil";
    const cepDigits = (profile?.address?.zip || "").replaceAll(/\D/g, "");
    if (isBR && cepDigits && cepDigits.length !== 8) {
      const msg = t("toasts.cepDigits");
      setSaveError(msg);
      toast.error(msg);
      return;
    }
    const phoneDigits = (profile?.phone || "").replaceAll(/\D/g, "");
    if (profile?.phone && (phoneDigits.length < 10 || phoneDigits.length > 11)) {
      const msg = t("toasts.phoneDigits");
      setSaveError(msg);
      toast.error(msg);
      return;
    }

    // 3) Persiste no backend
    setSaving(true);
    try {
      if (!profile) {
        throw new Error(t("toasts.profileNotFound"));
      }

      const result = await saveProfile(profile);
      
      if (!result.success) {
        throw new Error(traduzirErro(result.error || "", t("toasts.saveError")));
      }

      setSaveOk(true);
      toast.success(t("toasts.profileSaved"));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t("toasts.saveError");
      setSaveError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveOk(false), 2000);
    }
  }

  return (
    <main className="min-h-[70vh] bg-white text-black">
      {/* Hero */}
      <section className="relative border-b">
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="h-16 w-16 rounded-full overflow-hidden bg-zinc-100 border border-zinc-200 grid place-items-center">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={avatar}
                    src={avatar}
                    alt={`${nameFull} avatar`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Monograma name={nameFull} />
                )}
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="absolute -bottom-2 -right-2 h-9 w-9 rounded-full p-0 bg-black hover:bg-zinc-900"
                    title={t("photo.change")}
                    aria-label={t("photo.change")}
                  >
                    <FiUploadCloud />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="end">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={onPickFile}
                      className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition-colors text-left"
                    >
                      <FiUploadCloud className="text-lg" />
                      <span className="text-sm">{t("photo.upload")}</span>
                    </button>
                    
                    <button
                      onClick={() => setShowUrlModal(true)}
                      className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition-colors text-left"
                    >
                      <FiLink className="text-lg" />
                      <span className="text-sm">{t("photo.useUrl")}</span>
                    </button>
                    
                    {avatar && (
                      <button
                        onClick={removerFoto}
                        className="flex items-center gap-3 px-3 py-2 rounded hover:bg-red-50 text-red-600 transition-colors text-left"
                      >
                        <FiX className="text-lg" />
                        <span className="text-sm">{t("photo.remove")}</span>
                      </button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />
            </div>

            <div>
              <h1 className="text-2xl font-semibold leading-tight">{t("title")}</h1>
              <p className="text-sm text-gray-600">
                {nameFull} · {email}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Atalhos */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="#pedidos" className="group rounded-2xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl border border-gray-200 grid place-items-center">
                  <FiPackage className="text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t("shortcuts.trackPre")}</p>
                  <p className="font-medium">{t("shortcuts.track")}</p>
                </div>
              </div>
              <FiArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>

          <Link href="#enderecos" className="group rounded-2xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl border border-gray-200 grid place-items-center">
                  <FiHome className="text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t("shortcuts.addressesPre")}</p>
                  <p className="font-medium">{t("shortcuts.addresses")}</p>
                </div>
              </div>
              <FiArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>

          <Link href="#preferencias" className="group rounded-2xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl border border-gray-200 grid place-items-center">
                  <FiHeart className="text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t("shortcuts.interestsPre")}</p>
                  <p className="font-medium">{t("shortcuts.interests")}</p>
                </div>
              </div>
              <FiArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>

          <Link href="/lgpd/exclusao-de-dados" className="group rounded-2xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl border border-gray-200 grid place-items-center">
                  <FiShield className="text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t("shortcuts.privacyPre")}</p>
                  <p className="font-medium">{t("shortcuts.privacy")}</p>
                </div>
              </div>
              <FiArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        </div>
      </section>

      {/* Formulário principal */}
      <section className="container mx-auto px-4 pb-14 space-y-10">
        {/* Aviso para usuários OAuth */}
        {isOAuthUser && !authApi.isAuthenticated() && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex gap-3">
              <div className="text-blue-600 mt-0.5">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-blue-900 mb-1"> {t("oauth.title")}</p>
                <p className="text-sm text-blue-800 mb-3">
                  {t.rich("oauth.intro", { b: (c) => <strong>{c}</strong> })}
                </p>
                <div className="bg-white rounded-lg p-3 text-sm border border-blue-100">
                  <p className="font-medium text-blue-900 mb-2">{t("oauth.status")}</p>
                  <ul className="space-y-1 text-blue-700">
                    <li> {t.rich("oauth.canEdit", { b: (c) => <strong>{c}</strong> })}</li>
                    <li>⏳ {t.rich("oauth.saving", { b: (c) => <strong>{c}</strong> })}</li>
                    <li> {t.rich("oauth.temporary", { b: (c) => <strong>{c}</strong> })}</li>
                  </ul>
                </div>
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-900 font-medium mb-1"> {t("oauth.saveNow")}</p>
                  <p className="text-xs text-amber-800">
                    {t.rich("oauth.saveNowText", { b: (c) => <strong>{c}</strong> })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dados pessoais */}
        <div className="rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold">{t("personal")}</h2>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-sm">
              <span className="block mb-1 text-gray-700">{t("fields.firstName")} <span className="text-red-600">*</span></span>
              <Input
                value={profile?.firstName || ""}
                onChange={(e) =>
                  updateProfile({
                    firstName: e.target.value,
                    name: `${e.target.value} ${profile?.lastName || ""}`.trim(),
                  })
                }
              />
            </label>

            <label className="text-sm">
              <span className="block mb-1 text-gray-700">{t("fields.lastName")} <span className="text-red-600">*</span></span>
              <Input
                value={profile?.lastName || ""}
                onChange={(e) =>
                  updateProfile({
                    lastName: e.target.value,
                    name: `${profile?.firstName || ""} ${e.target.value}`.trim(),
                  })
                }
              />
            </label>

            <label className="text-sm">
              <span className="block mb-1 text-gray-700">{t("fields.birthDate")} <span className="text-red-600">*</span></span>
              <Input
                type="date"
                value={profile?.birthDate || ""}
                onChange={(e) => {
                  // Input type="date" sempre retorna no formato YYYY-MM-DD (ISO 8601)
                  // Já é o formato que o backend espera!
                  updateProfile({ birthDate: e.target.value });
                }}
                max={new Date().toISOString().split('T')[0]} // Não permite datas futuras
                placeholder={t("datePlaceholder")}
              />
              <span className="text-xs text-gray-500 mt-1 block">
                {t("dateHint")}
              </span>
            </label>

            <label className="text-sm">
              <span className="block mb-1 text-gray-700">{t("fields.gender")}</span>
              <Select
                value={(profile?.gender as Gender) || "Não Especificado"}
                onValueChange={(val) => updateProfile({ gender: val as Gender })}
              >
                <SelectTrigger><SelectValue placeholder={t("select")} /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {/* o valor salvo continua em português; só o texto exibido muda */}
                    <SelectItem value="Masculino">{t("genders.male")}</SelectItem>
                    <SelectItem value="Feminino">{t("genders.female")}</SelectItem>
                    <SelectItem value="Não Especificado">{t("genders.unspecified")}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </label>

            <label className="text-sm">
              <span className="block mb-1 text-gray-700">{t("fields.phone")} <span className="text-red-600">*</span></span>
              <Input
                value={formatPhone(profile?.phone || "")}
                onChange={(e) => updateProfile({ phone: formatPhone(e.target.value) })}
                placeholder="(11) 98888-7777"
              />
            </label>

            <label className="text-sm sm:col-span-2">
              <span className="block mb-1 text-gray-700">{t("fields.email")} <span className="text-red-600">*</span></span>
              <Input value={profile?.email || ""} disabled />
            </label>
          </div>
        </div>

        {/* Endereço */}
        <div id="enderecos" className="rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold">{t("address")}</h2>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* País */}
            <label className="text-sm">
              <span className="block mb-1 text-gray-700">{t("fields.country")} <span className="text-red-600">*</span></span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-10 px-3 text-left font-normal"
                  >
                    <span className={profile?.address?.country ? "" : "text-gray-500"}>
                      {countryLabel(profile?.address?.country) || t("selectCountry")}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <div className="px-2 py-1.5 border-b sticky top-0 bg-white z-10">
                    <Input
                      placeholder={t("searchCountry")}
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="max-h-72 overflow-y-auto p-1">
                    {filteredCountries.length === 0 ? (
                      <div className="py-6 text-center text-sm text-gray-500">
                        {t("noCountry")}
                      </div>
                    ) : (
                      filteredCountries.map((c) => (
                        <div
                          key={c.iso2}
                          role="button"
                          tabIndex={0}
                          className={`px-2 py-1.5 text-sm hover:bg-gray-100 cursor-pointer rounded ${
                            profile?.address?.country === c.name ? 'bg-gray-100 font-medium' : ''
                          }`}
                          onClick={() => {
                            updateProfile({
                              address: { ...profile?.address, country: c.name, state: "", city: "" },
                            });
                            setCountrySearch("");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              updateProfile({
                                address: { ...profile?.address, country: c.name, state: "", city: "" },
                              });
                              setCountrySearch("");
                            }
                          }}
                        >
                          {c.label}
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </label>

            {/* Estado */}
            <label className="text-sm">
              <span className="block mb-1 text-gray-700">{t("fields.state")} <span className="text-red-600">*</span></span>
              {profile?.address?.country && !loadingStates && !states.length ? (
                // Lista indisponível para o país: digitação livre
                <Input
                  value={profile?.address?.state || ""}
                  onChange={onAddressField("state")}
                  placeholder={t("typeState")}
                />
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-10 px-3 text-left font-normal"
                      disabled={!states.length}
                    >
                      <span className={profile?.address?.state ? "" : "text-gray-500"}>
                        {profile?.address?.state || (loadingStates ? t("loadingStates") : states.length ? t("selectState") : t("selectCountryFirst"))}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <div className="px-2 py-1.5 border-b sticky top-0 bg-white z-10">
                      <Input
                        placeholder={t("searchState")}
                        value={stateSearch}
                        onChange={(e) => setStateSearch(e.target.value)}
                        className="h-8 text-sm"
                        disabled={!states.length}
                      />
                    </div>
                    <div className="max-h-72 overflow-y-auto p-1">
                      {filteredStates.length === 0 ? (
                        <div className="py-6 text-center text-sm text-gray-500">
                          {t("noState")}
                        </div>
                      ) : (
                        filteredStates.map((s) => (
                          <div
                            key={s}
                            role="button"
                            tabIndex={0}
                            className={`px-2 py-1.5 text-sm hover:bg-gray-100 cursor-pointer rounded ${
                              profile?.address?.state === s ? 'bg-gray-100 font-medium' : ''
                            }`}
                            onClick={() => {
                              updateProfile({ address: { ...profile?.address, state: s, city: "" } });
                              setStateSearch("");
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                updateProfile({ address: { ...profile?.address, state: s, city: "" } });
                                setStateSearch("");
                              }
                            }}
                          >
                            {s}
                          </div>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </label>

            {/* Cidade (COMBOBOX/AUTOCOMPLETE) */}
            <label className="text-sm">
              <span className="block mb-1 text-gray-700">{t("fields.city")} <span className="text-red-600">*</span></span>
              {profile?.address?.state && !loadingCities && !cities.length ? (
                // Lista indisponível para o estado: digitação livre
                <Input
                  value={profile?.address?.city || ""}
                  onChange={onAddressField("city")}
                  placeholder={t("typeCity")}
                />
              ) : (
                <Popover open={cityOpen} onOpenChange={setCityOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-10 px-3 text-left font-normal"
                      disabled={!cities.length}
                    >
                      <span className={profile?.address?.city ? "" : "text-gray-500"}>
                        {profile?.address?.city || (loadingCities ? t("loadingCities") : cities.length ? t("selectCity") : t("selectStateFirst"))}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <div className="px-2 py-1.5 border-b sticky top-0 bg-white z-10">
                      <Input
                        placeholder={t("searchCity")}
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        className="h-8 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="max-h-72 overflow-y-auto p-1">
                      {filteredCities.length === 0 ? (
                        <div className="py-6 text-center text-sm text-gray-500">
                          {t("noCity")}
                        </div>
                      ) : (
                        filteredCities.map((c) => (
                          <div
                            key={c}
                            role="button"
                            tabIndex={0}
                            className="px-2 py-1.5 text-sm hover:bg-gray-100 cursor-pointer rounded"
                            onClick={() => {
                              updateProfile({ address: { ...profile?.address, city: c } });
                              setCityOpen(false);
                              setCitySearch("");
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                updateProfile({ address: { ...profile?.address, city: c } });
                                setCityOpen(false);
                                setCitySearch("");
                              }
                            }}
                          >
                            {c}
                          </div>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </label>

            {/* CEP */}
            <label className="text-sm">
              <span className="block mb-1 text-gray-700">
                {t("fields.zip")} <span className="text-red-600">*</span> {loadingCEP && <Loader2 className="inline h-4 w-4 animate-spin ml-1" />}
              </span>
              <Input
                value={formatCEP(profile?.address?.zip || "")}
                onChange={(e) => {
                  const cep = formatCEP(e.target.value);
                  updateProfile({ address: { ...profile?.address, zip: cep } });
                  // Busca automática assim que o CEP fica completo
                  if (cep.replaceAll(/\D/g, "").length === 8) lookupCEP(cep);
                }}
                onBlur={(e) => lookupCEP(e.target.value)}
                placeholder={t("zipPlaceholder")}
              />
              {loadingCEP && (
                <span className="text-xs text-gray-500">{t("searchingAddress")}</span>
              )}
            </label>

            {/* Bairro */}
            <label className="text-sm">
              <span className="block mb-1 text-gray-700">{t("fields.district")} <span className="text-red-600">*</span></span>
              <Input
                value={profile?.address?.district || ""}
                onChange={onAddressField("district")}
              />
            </label>

            {/* Rua */}
            <label className="text-sm lg:col-span-2">
              <span className="block mb-1 text-gray-700">{t("fields.street")} <span className="text-red-600">*</span></span>
              <Input
                value={profile?.address?.street || ""}
                onChange={onAddressField("street")}
              />
            </label>

            {/* Número */}
            <label className="text-sm">
              <span className="block mb-1 text-gray-700">{t("fields.number")} <span className="text-red-600">*</span></span>
              <Input
                value={profile?.address?.number || ""}
                onChange={onAddressField("number")}
              />
            </label>

            {/* Complemento (opcional) */}
            <label className="text-sm lg:col-span-3">
              <span className="block mb-1 text-gray-700">{t("complement")}</span>
              <Input
                value={profile?.address?.complement || ""}
                onChange={onAddressField("complement")}
              />
            </label>
          </div>
        </div>

        {/* Preferências */}
        <div id="preferencias" className="rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold">{t("preferences")}</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
              <span className="text-sm">{t("newsletter")}</span>
              <input
                type="checkbox"
                className="h-4 w-4 accent-black"
                checked={preferencias.receberNovidades}
                onChange={(e) => onTogglePreferencia("receberNovidades", e.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
              <span className="text-sm">{t("restockAlerts")}</span>
              <input
                type="checkbox"
                className="h-4 w-4 accent-black"
                checked={preferencias.alertasReposicao}
                onChange={(e) => onTogglePreferencia("alertasReposicao", e.target.checked)}
              />
            </label>
          </div>
        </div>

        {/* Segurança e ações */}
        <div id="seguranca" className="rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 justify-between flex-wrap">
            <h2 className="text-lg font-semibold">{t("security")}</h2>

            <div className="flex items-center gap-3">
              {/* Mensagens */}
              {hasMissing && (
                <span className="text-sm text-red-600">
                  {t("fillRequired", { campos: nomesCampos(missingRequired) })}
                </span>
              )}
              {saveError && !hasMissing && <span className="text-sm text-red-600">{saveError}</span>}
              {saveOk && <span className="text-sm text-green-600">{t("saved")}</span>}

              {/* Botão principal */}
              <Button
                onClick={onSave}
                disabled={saving || hasMissing}
                className="bg-black hover:bg-zinc-900"
                title={hasMissing ? t("fillAllToSave") : t("saveChanges")}
                aria-disabled={saving || hasMissing}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("saving")}
                  </>
                ) : (
                  t("saveChanges")
                )}
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={async () => {
                await logout();
              }}
              className="w-full flex items-center justify-between rounded-xl border border-gray-200 p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg border border-gray-200 grid place-items-center">
                  <FiLogOut />
                </div>
                <div>
                  <p className="font-medium">{t("logout")}</p>
                  <p className="text-sm text-gray-600">{t("logoutHint")}</p>
                </div>
              </div>
              <FiArrowRight />
            </button>
          </div>
        </div>

        {/* Pedidos (placeholder) */}
        <div id="pedidos" className="rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t("orders")}</h2>
            <button className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4">
              {t("history")}
              <FiArrowRight />
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {t("noOrders")}
          </p>
        </div>
      </section>

      {/* Modal de URL para foto */}
      <Dialog open={showUrlModal} onOpenChange={setShowUrlModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("urlModal.title")}</DialogTitle>
            <DialogDescription>
              {t("urlModal.description")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="foto-url" className="text-sm font-medium">
                {t("urlModal.label")}
              </label>
              <Input
                id="foto-url"
                placeholder={t("urlModal.placeholder")}
                value={fotoUrl}
                onChange={(e) => setFotoUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    atualizarFotoPorUrl();
                  }
                }}
              />
              <p className="text-xs text-gray-500">
                {t("urlModal.formats")}
              </p>
            </div>

            {fotoUrl && (
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-600 mb-2">{t("urlModal.preview")}</p>
                <div className="flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fotoUrl}
                    alt={t("urlModal.previewAlt")}
                    className="h-24 w-24 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowUrlModal(false);
                setFotoUrl("");
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={atualizarFotoPorUrl}
              disabled={!fotoUrl.trim()}
            >
              {t("urlModal.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Alterar Senha */}
      <Dialog open={showAlterarSenhaModal} onOpenChange={setShowAlterarSenhaModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("passwordModal.title")}</DialogTitle>
            <DialogDescription>
              {t("passwordModal.description")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAlterarSenha} className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="senha-atual" className="text-sm font-medium">
                {t("passwordModal.current")} *
              </label>
              <div className="relative">
                <Input
                  id="senha-atual"
                  type={showSenhaAtual ? "text" : "password"}
                  placeholder={t("passwordModal.currentPlaceholder")}
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  required
                  disabled={loadingAlterarSenha}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                  tabIndex={-1}
                  aria-label={showSenhaAtual ? t("passwordModal.hide") : t("passwordModal.show")}
                >
                  {showSenhaAtual ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="nova-senha" className="text-sm font-medium">
                {t("passwordModal.new")} *
              </label>
              <div className="relative">
                <Input
                  id="nova-senha"
                  type={showNovaSenha ? "text" : "password"}
                  placeholder={t("passwordModal.newPlaceholder")}
                  value={novaSenhaState}
                  onChange={(e) => setNovaSenhaState(e.target.value)}
                  required
                  disabled={loadingAlterarSenha}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNovaSenha(!showNovaSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                  tabIndex={-1}
                  aria-label={showNovaSenha ? t("passwordModal.hide") : t("passwordModal.show")}
                >
                  {showNovaSenha ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {tSenha("hint")}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmar-nova-senha" className="text-sm font-medium">
                {t("passwordModal.confirm")} *
              </label>
              <div className="relative">
                <Input
                  id="confirmar-nova-senha"
                  type={showConfirmarNovaSenha ? "text" : "password"}
                  placeholder={t("passwordModal.confirmPlaceholder")}
                  value={confirmarNovaSenhaState}
                  onChange={(e) => setConfirmarNovaSenhaState(e.target.value)}
                  required
                  disabled={loadingAlterarSenha}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmarNovaSenha(!showConfirmarNovaSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                  tabIndex={-1}
                  aria-label={showConfirmarNovaSenha ? t("passwordModal.hide") : t("passwordModal.show")}
                >
                  {showConfirmarNovaSenha ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAlterarSenhaModal(false);
                  setSenhaAtual("");
                  setNovaSenhaState("");
                  setConfirmarNovaSenhaState("");
                }}
                disabled={loadingAlterarSenha}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={loadingAlterarSenha}
                className="flex items-center gap-2"
              >
                {loadingAlterarSenha ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("passwordModal.changing")}
                  </>
                ) : (
                  <>
                    <FiLock className="w-4 h-4" />
                    {t("passwordModal.title")}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
