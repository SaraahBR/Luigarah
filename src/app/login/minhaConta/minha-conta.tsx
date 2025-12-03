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
} from "react-icons/fi";
import { Loader2 } from "lucide-react";

import { useAuthUser, Gender, UserProfile } from "../useAuthUser";
import authApi from "@/hooks/api/authApi";
import { validarSenha } from "@/lib/passwordValidation";
import { getErrorMessage } from "@/lib/errorUtils";

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
function Monograma({ name }: { name: string }) {
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
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.replace(/^(\d{5})(\d{0,3}).*/, (_, a, b) => (b ? `${a}-${b}` : a));
};
const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
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

function validateRequired(p?: UserProfile | null) {
  const missing: string[] = [];

  // Pessoais
  if (isBlank(p?.firstName)) missing.push("Nome");
  if (isBlank(p?.lastName)) missing.push("Sobrenome");
  if (isBlank(p?.birthDate)) missing.push("Data de nascimento");
  // Gênero não é obrigatório - aceita "Não Especificado" ou vazio
  if (isBlank(p?.phone)) missing.push("Telefone");
  if (isBlank(p?.email)) missing.push("E-mail");

  // Endereço
  const a = p?.address;
  if (isBlank(a?.country)) missing.push("País");
  if (isBlank(a?.state)) missing.push("Estado");
  if (isBlank(a?.city)) missing.push("Cidade");
  if (isBlank(a?.zip)) missing.push("CEP");
  if (isBlank(a?.district)) missing.push("Bairro");
  if (isBlank(a?.street)) missing.push("Rua");
  if (isBlank(a?.number)) missing.push("Número");

  return missing;
}

export default function MinhaConta() {
  const { profile, updateProfile, saveProfile, setAvatar, logout, isOAuthUser, user } = useAuthUser();

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

  // Verifica se a conta foi criada com método tradicional (LOCAL)
  const isLocalAccount = user?.provider === "LOCAL";

  const avatar = useMemo(() => profile?.image ?? null, [profile?.image]);
  const nameFull = profile?.name || "Cliente";
  const email = profile?.email || "email@exemplo.com";

  function onPickFile() {
    fileRef.current?.click();
  }
  
  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    
    // Valida tipo de arquivo
    if (!/^image\/(png|jpe?g|webp|gif)$/i.test(f.type)) {
      toast.error("Escolha uma imagem PNG, JPG, WEBP ou GIF.");
      return;
    }

    // Valida tamanho (máx 5MB)
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande! Máximo 5MB.");
      return;
    }

    // Mostra loading
    toast.loading("Enviando foto...", { id: "upload-foto" });

    const reader = new FileReader();
    reader.onload = async () => {
      const result = await setAvatar(String(reader.result || ""));
      
      if (result.success) {
        toast.success("Foto atualizada com sucesso!", { id: "upload-foto" });
      } else {
        toast.error(result.error || "Erro ao atualizar foto", { id: "upload-foto" });
      }
    };
    reader.readAsDataURL(f);
  }

  // Atualizar foto por URL
  async function atualizarFotoPorUrl() {
    if (!fotoUrl.trim()) {
      toast.error("Digite uma URL válida");
      return;
    }

    try {
      toast.loading("Atualizando foto...", { id: "update-foto-url" });
      
      await authApi.atualizarFotoPorUrl(fotoUrl.trim());
      
      // Atualiza o profile localmente
      updateProfile({ image: fotoUrl.trim() });
      
      toast.success("Foto atualizada com sucesso!", { id: "update-foto-url" });
      setShowUrlModal(false);
      setFotoUrl("");
    } catch (error) {
      console.error("Erro ao atualizar foto por URL:", error);
      toast.error("Erro ao atualizar foto", { id: "update-foto-url" });
    }
  }

  // Remover foto de perfil
  async function removerFoto() {
    try {
      toast.loading("Removendo foto...", { id: "remove-foto" });
      
      await authApi.removerFotoPerfil();
      
      // Atualiza o profile localmente
      updateProfile({ image: null });
      
      toast.success("Foto removida com sucesso!", { id: "remove-foto" });
    } catch (error) {
      console.error("Erro ao remover foto:", error);
      toast.error("Erro ao remover foto", { id: "remove-foto" });
    }
  }

  // Alterar senha (apenas para contas locais)
  async function handleAlterarSenha(e: React.FormEvent) {
    e.preventDefault();

    if (!senhaAtual || !novaSenhaState || !confirmarNovaSenhaState) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (novaSenhaState !== confirmarNovaSenhaState) {
      toast.error("As senhas não coincidem");
      return;
    }

    // Valida nova senha
    const validacao = validarSenha(novaSenhaState);
    if (!validacao.valido) {
      toast.error(validacao.erros[0]);
      return;
    }

    setLoadingAlterarSenha(true);

    try {
      await authApi.alterarSenha({
        senhaAtual,
        novaSenha: novaSenhaState,
        confirmarNovaSenha: confirmarNovaSenhaState,
      });

      toast.success("Senha alterada com sucesso!");
      
      // Limpa os campos e fecha o modal
      setSenhaAtual("");
      setNovaSenhaState("");
      setConfirmarNovaSenhaState("");
      setShowAlterarSenhaModal(false);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoadingAlterarSenha(false);
    }
  }

  /* País/Estado/Cidade dinâmicos junto com CEP */
  const [countries, setCountries] = useState<Array<{ name: string; iso2: string }>>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCEP, setLoadingCEP] = useState(false);

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
      });
  }, [profile?.address?.country]);

  // Ao escolher estado também busca cidades
  useEffect(() => {
    const country = profile?.address?.country;
    const state = profile?.address?.state;
    if (!country || !state) {
      setCities([]);
      return;
    }
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
      .catch(() => setCities([]));
  }, [profile?.address?.country, profile?.address?.state]);

  // CEP (Brasil) também preenche endereço e sonner
  async function lookupCEP(cep: string) {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;

    setLoadingCEP(true);
    try {
      const r = await fetch(`/api/cep?value=${clean}`);
      const data = await r.json();
      if (!r.ok) throw new Error((data && data.error) || "CEP inválido");

      updateProfile({
        address: {
          ...(profile?.address || {}),
          zip: data.zip,
          city: data.city,
          state: data.state,
          district: data.district,
          street: data.street,
          country: data.country,
        },
      });

      toast.success("Endereço preenchido com sucesso. Confira cidade/estado/bairro/rua.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Não foi possível buscar o CEP. Verifique o número digitado.";
      toast.error(msg);
    } finally {
      setLoadingCEP(false);
    }
  }

  /* Helpers de formulário */
  function onAddressField(key: keyof NonNullable<UserProfile["address"]>) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      updateProfile({
        address: { ...(profile?.address || {}), [key]: e.target.value },
      });
  }

  /* Campos obrigatórios faltantes */
  const missingRequired = useMemo(() => validateRequired(profile), [profile]);
  const hasMissing = missingRequired.length > 0;

  /* Filtros de busca */
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return countries;
    const search = countrySearch.toLowerCase();
    return countries.filter(c => c.name.toLowerCase().includes(search));
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
      const msg = `Preencha os campos obrigatórios: ${missing.join(", ")}.`;
      setSaveError(msg);
      toast.error(msg);
      return;
    }

    // 2) Validações adicionais (CEP/telefone)
    const isBR = profile?.address?.country?.toLowerCase() === "brazil";
    const cepDigits = (profile?.address?.zip || "").replace(/\D/g, "");
    if (isBR && cepDigits && cepDigits.length !== 8) {
      const msg = "CEP (Brasil) precisa ter 8 dígitos.";
      setSaveError(msg);
      toast.error(msg);
      return;
    }
    const phoneDigits = (profile?.phone || "").replace(/\D/g, "");
    if (profile?.phone && (phoneDigits.length < 10 || phoneDigits.length > 11)) {
      const msg = "Telefone deve ter 10 ou 11 dígitos.";
      setSaveError(msg);
      toast.error(msg);
      return;
    }

    // 3) Persiste no backend
    setSaving(true);
    try {
      if (!profile) {
        throw new Error("Perfil não encontrado");
      }

      const result = await saveProfile(profile);
      
      if (!result.success) {
        throw new Error(result.error || "Erro ao salvar");
      }

      setSaveOk(true);
      toast.success("Perfil salvo com sucesso!");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao salvar";
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
                    title="Alterar foto de perfil"
                    aria-label="Alterar foto"
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
                      <span className="text-sm">Fazer upload</span>
                    </button>
                    
                    <button
                      onClick={() => setShowUrlModal(true)}
                      className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition-colors text-left"
                    >
                      <FiLink className="text-lg" />
                      <span className="text-sm">Usar URL</span>
                    </button>
                    
                    {avatar && (
                      <button
                        onClick={removerFoto}
                        className="flex items-center gap-3 px-3 py-2 rounded hover:bg-red-50 text-red-600 transition-colors text-left"
                      >
                        <FiX className="text-lg" />
                        <span className="text-sm">Remover foto</span>
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
              <h1 className="text-2xl font-semibold leading-tight">Minha conta</h1>
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
                  <p className="text-sm text-gray-600">Acompanhar</p>
                  <p className="font-medium">Pedidos</p>
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
                  <p className="text-sm text-gray-600">Gerenciar</p>
                  <p className="font-medium">Endereços</p>
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
                  <p className="text-sm text-gray-600">Meus</p>
                  <p className="font-medium">Interesses</p>
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
                  <p className="text-sm text-gray-600">Privacidade &amp;</p>
                  <p className="font-medium">Segurança</p>
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
                <p className="font-semibold text-blue-900 mb-1"> Sincronização do Google em Andamento</p>
                <p className="text-sm text-blue-800 mb-3">
                  Você está logado com <strong>Google</strong>. Estamos tentando sincronizar sua conta com nosso banco de dados automaticamente.
                </p>
                <div className="bg-white rounded-lg p-3 text-sm border border-blue-100">
                  <p className="font-medium text-blue-900 mb-2">Status da Sincronização:</p>
                  <ul className="space-y-1 text-blue-700">
                    <li> <strong>Pode editar:</strong> Todos os campos funcionam normalmente</li>
                    <li>⏳ <strong>Salvamento:</strong> Aguardando endpoint do backend estar disponível</li>
                    <li> <strong>Temporário:</strong> Alterações resetam ao recarregar a página</li>
                  </ul>
                </div>
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-900 font-medium mb-1"> Para salvar permanentemente agora:</p>
                  <p className="text-xs text-amber-800">
                    Faça logout e crie uma conta com <strong>e-mail e senha</strong>, ou aguarde a implementação do endpoint de sincronização OAuth no backend.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dados pessoais */}
        <div className="rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold">Informações pessoais</h2>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-sm">
              <span className="block mb-1 text-gray-700">Nome <span className="text-red-600">*</span></span>
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
              <span className="block mb-1 text-gray-700">Sobrenome <span className="text-red-600">*</span></span>
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
              <span className="block mb-1 text-gray-700">Data de nascimento <span className="text-red-600">*</span></span>
              <Input
                type="date"
                value={profile?.birthDate || ""}
                onChange={(e) => {
                  // Input type="date" sempre retorna no formato YYYY-MM-DD (ISO 8601)
                  // Já é o formato que o backend espera!
                  updateProfile({ birthDate: e.target.value });
                }}
                max={new Date().toISOString().split('T')[0]} // Não permite datas futuras
                placeholder="DD/MM/AAAA"
              />
              <span className="text-xs text-gray-500 mt-1 block">
                Formato aceito: DD/MM/AAAA (ex: 13/04/2002)
              </span>
            </label>

            <label className="text-sm">
              <span className="block mb-1 text-gray-700">Gênero</span>
              <Select
                value={(profile?.gender as Gender) || "Não Especificado"}
                onValueChange={(val) => updateProfile({ gender: val as Gender })}
              >
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Feminino">Feminino</SelectItem>
                    <SelectItem value="Não Especificado">Não Especificado</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </label>

            <label className="text-sm">
              <span className="block mb-1 text-gray-700">Telefone <span className="text-red-600">*</span></span>
              <Input
                value={formatPhone(profile?.phone || "")}
                onChange={(e) => updateProfile({ phone: formatPhone(e.target.value) })}
                placeholder="(11) 98888-7777"
              />
            </label>

            <label className="text-sm sm:col-span-2">
              <span className="block mb-1 text-gray-700">E-mail <span className="text-red-600">*</span></span>
              <Input value={profile?.email || ""} disabled />
            </label>
          </div>
        </div>

        {/* Endereço */}
        <div id="enderecos" className="rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold">Endereço</h2>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* País */}
            <label className="text-sm">
              <span className="block mb-1 text-gray-700">País <span className="text-red-600">*</span></span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-10 px-3 text-left font-normal"
                  >
                    <span className={profile?.address?.country ? "" : "text-gray-500"}>
                      {profile?.address?.country || "Selecione um país"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <div className="px-2 py-1.5 border-b sticky top-0 bg-white z-10">
                    <Input
                      placeholder="Pesquisar país..."
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="max-h-72 overflow-y-auto p-1">
                    {filteredCountries.length === 0 ? (
                      <div className="py-6 text-center text-sm text-gray-500">
                        Nenhum país encontrado.
                      </div>
                    ) : (
                      filteredCountries.map((c) => (
                        <div
                          key={c.iso2}
                          className={`px-2 py-1.5 text-sm hover:bg-gray-100 cursor-pointer rounded ${
                            profile?.address?.country === c.name ? 'bg-gray-100 font-medium' : ''
                          }`}
                          onClick={() => {
                            updateProfile({
                              address: { ...(profile?.address || {}), country: c.name, state: "", city: "" },
                            });
                            setCountrySearch("");
                          }}
                        >
                          {c.name}
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </label>

            {/* Estado */}
            <label className="text-sm">
              <span className="block mb-1 text-gray-700">Estado <span className="text-red-600">*</span></span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-10 px-3 text-left font-normal"
                    disabled={!states.length}
                  >
                    <span className={profile?.address?.state ? "" : "text-gray-500"}>
                      {profile?.address?.state || (states.length ? "Selecione um estado" : "Selecione o país")}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <div className="px-2 py-1.5 border-b sticky top-0 bg-white z-10">
                    <Input
                      placeholder="Pesquisar estado..."
                      value={stateSearch}
                      onChange={(e) => setStateSearch(e.target.value)}
                      className="h-8 text-sm"
                      disabled={!states.length}
                    />
                  </div>
                  <div className="max-h-72 overflow-y-auto p-1">
                    {filteredStates.length === 0 ? (
                      <div className="py-6 text-center text-sm text-gray-500">
                        Nenhum estado encontrado.
                      </div>
                    ) : (
                      filteredStates.map((s) => (
                        <div
                          key={s}
                          className={`px-2 py-1.5 text-sm hover:bg-gray-100 cursor-pointer rounded ${
                            profile?.address?.state === s ? 'bg-gray-100 font-medium' : ''
                          }`}
                          onClick={() => {
                            updateProfile({ address: { ...(profile?.address || {}), state: s, city: "" } });
                            setStateSearch("");
                          }}
                        >
                          {s}
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </label>

            {/* Cidade (COMBOBOX/AUTOCOMPLETE) */}
            <label className="text-sm">
              <span className="block mb-1 text-gray-700">Cidade <span className="text-red-600">*</span></span>
              <Popover open={cityOpen} onOpenChange={setCityOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-10 px-3 text-left font-normal"
                    disabled={!cities.length}
                  >
                    <span className={profile?.address?.city ? "" : "text-gray-500"}>
                      {profile?.address?.city || (cities.length ? "Selecione uma cidade" : "Selecione o estado")}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <div className="px-2 py-1.5 border-b sticky top-0 bg-white z-10">
                    <Input
                      placeholder="Pesquisar cidade..."
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      className="h-8 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-72 overflow-y-auto p-1">
                    {filteredCities.length === 0 ? (
                      <div className="py-6 text-center text-sm text-gray-500">
                        Nenhuma cidade encontrada.
                      </div>
                    ) : (
                      filteredCities.map((c) => (
                        <div
                          key={c}
                          className="px-2 py-1.5 text-sm hover:bg-gray-100 cursor-pointer rounded"
                          onClick={() => {
                            updateProfile({ address: { ...(profile?.address || {}), city: c } });
                            setCityOpen(false);
                            setCitySearch("");
                          }}
                        >
                          {c}
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </label>

            {/* CEP */}
            <label className="text-sm">
              <span className="block mb-1 text-gray-700">
                CEP <span className="text-red-600">*</span> {loadingCEP && <Loader2 className="inline h-4 w-4 animate-spin ml-1" />}
              </span>
              <Input
                value={formatCEP(profile?.address?.zip || "")}
                onChange={(e) =>
                  updateProfile({ address: { ...(profile?.address || {}), zip: formatCEP(e.target.value) } })
                }
                onBlur={(e) => lookupCEP(e.target.value)}
                placeholder="Apenas números (Brasil)"
              />
              {loadingCEP && (
                <span className="text-xs text-gray-500">procurando endereço…</span>
              )}
            </label>

            {/* Bairro */}
            <label className="text-sm">
              <span className="block mb-1 text-gray-700">Bairro <span className="text-red-600">*</span></span>
              <Input
                value={profile?.address?.district || ""}
                onChange={onAddressField("district")}
              />
            </label>

            {/* Rua */}
            <label className="text-sm lg:col-span-2">
              <span className="block mb-1 text-gray-700">Rua <span className="text-red-600">*</span></span>
              <Input
                value={profile?.address?.street || ""}
                onChange={onAddressField("street")}
              />
            </label>

            {/* Número */}
            <label className="text-sm">
              <span className="block mb-1 text-gray-700">Número <span className="text-red-600">*</span></span>
              <Input
                value={profile?.address?.number || ""}
                onChange={onAddressField("number")}
              />
            </label>

            {/* Complemento (opcional) */}
            <label className="text-sm lg:col-span-3">
              <span className="block mb-1 text-gray-700">Complemento (opcional)</span>
              <Input
                value={profile?.address?.complement || ""}
                onChange={onAddressField("complement")}
              />
            </label>
          </div>
        </div>

        {/* Preferências */}
        <div id="preferencias" className="rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold">Preferências</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
              <span className="text-sm">Receber novidades e lançamentos</span>
              <input type="checkbox" className="h-4 w-4 accent-black" defaultChecked />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
              <span className="text-sm">Alertas de reposição</span>
              <input type="checkbox" className="h-4 w-4 accent-black" />
            </label>
          </div>
        </div>

        {/* Segurança e ações */}
        <div id="seguranca" className="rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 justify-between flex-wrap">
            <h2 className="text-lg font-semibold">Segurança</h2>

            <div className="flex items-center gap-3">
              {/* Mensagens */}
              {hasMissing && (
                <span className="text-sm text-red-600">
                  Preencha os campos obrigatórios: {missingRequired.join(", ")}.
                </span>
              )}
              {saveError && !hasMissing && <span className="text-sm text-red-600">{saveError}</span>}
              {saveOk && <span className="text-sm text-green-600">Salvo!</span>}

              {/* Botão principal */}
              <Button
                onClick={onSave}
                disabled={saving || hasMissing}
                className="bg-black hover:bg-zinc-900"
                title={hasMissing ? "Preencha todos os campos obrigatórios para salvar" : "Salvar alterações"}
                aria-disabled={saving || hasMissing}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar alterações"
                )}
              </Button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isLocalAccount ? (
              <button 
                onClick={() => setShowAlterarSenhaModal(true)}
                className="flex items-center justify-between rounded-xl border border-gray-200 p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg border border-gray-200 grid place-items-center">
                    <FiLock />
                  </div>
                  <div>
                    <p className="font-medium">Alterar senha</p>
                    <p className="text-sm text-gray-600">Defina uma senha forte para sua conta</p>
                  </div>
                </div>
                <FiArrowRight />
              </button>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 opacity-60">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg border border-gray-200 grid place-items-center">
                    <FiLock />
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Alterar senha</p>
                    <p className="text-xs text-gray-500">Disponível apenas para contas criadas com email/senha</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={async () => {
                await logout();
              }}
              className="flex items-center justify-between rounded-xl border border-gray-200 p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg border border-gray-200 grid place-items-center">
                  <FiLogOut />
                </div>
                <div>
                  <p className="font-medium">Sair da conta</p>
                  <p className="text-sm text-gray-600">Encerrar sessão neste dispositivo</p>
                </div>
              </div>
              <FiArrowRight />
            </button>
          </div>
        </div>

        {/* Pedidos (placeholder) */}
        <div id="pedidos" className="rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Pedidos &amp; devoluções</h2>
            <button className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4">
              ver histórico
              <FiArrowRight />
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Você ainda não realizou pedidos. Quando seu primeiro pedido for
            feito, ele aparecerá aqui com status e rastreamento.
          </p>
        </div>
      </section>

      {/* Modal de URL para foto */}
      <Dialog open={showUrlModal} onOpenChange={setShowUrlModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Atualizar foto por URL</DialogTitle>
            <DialogDescription>
              Cole a URL de uma imagem para usar como foto de perfil
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="foto-url" className="text-sm font-medium">
                URL da imagem
              </label>
              <Input
                id="foto-url"
                placeholder="https://exemplo.com/foto.jpg"
                value={fotoUrl}
                onChange={(e) => setFotoUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    atualizarFotoPorUrl();
                  }
                }}
              />
              <p className="text-xs text-gray-500">
                Formatos aceitos: JPG, PNG, WEBP, GIF
              </p>
            </div>

            {fotoUrl && (
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-600 mb-2">Pré-visualização:</p>
                <div className="flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fotoUrl}
                    alt="Pré-visualização"
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
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={atualizarFotoPorUrl}
              disabled={!fotoUrl.trim()}
            >
              Atualizar foto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Alterar Senha */}
      <Dialog open={showAlterarSenhaModal} onOpenChange={setShowAlterarSenhaModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
            <DialogDescription>
              Digite sua senha atual e a nova senha para alterar
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAlterarSenha} className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="senha-atual" className="text-sm font-medium">
                Senha atual *
              </label>
              <Input
                id="senha-atual"
                type="password"
                placeholder="Digite sua senha atual"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                required
                disabled={loadingAlterarSenha}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="nova-senha" className="text-sm font-medium">
                Nova senha *
              </label>
              <Input
                id="nova-senha"
                type="password"
                placeholder="Digite sua nova senha"
                value={novaSenhaState}
                onChange={(e) => setNovaSenhaState(e.target.value)}
                required
                disabled={loadingAlterarSenha}
              />
              <p className="text-xs text-gray-500">
                6 a 40 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 especial (@$!%*?&#)
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmar-nova-senha" className="text-sm font-medium">
                Confirmar nova senha *
              </label>
              <Input
                id="confirmar-nova-senha"
                type="password"
                placeholder="Confirme sua nova senha"
                value={confirmarNovaSenhaState}
                onChange={(e) => setConfirmarNovaSenhaState(e.target.value)}
                required
                disabled={loadingAlterarSenha}
              />
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
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loadingAlterarSenha}
                className="flex items-center gap-2"
              >
                {loadingAlterarSenha ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Alterando...
                  </>
                ) : (
                  <>
                    <FiLock className="w-4 h-4" />
                    Alterar senha
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
