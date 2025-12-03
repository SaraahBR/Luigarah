"use client";

import { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errorUtils";
import { validarSenha } from "@/lib/passwordValidation";
import { useAuthUser } from "./useAuthUser";
import VerificarEmailModal from "./VerificarEmailModal";
import { useRouter } from "next/navigation";

type AuthModalProps = {
  readonly open: boolean;
  readonly onClose: () => void;
};

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [showVerificarEmail, setShowVerificarEmail] = useState(false);
  const [emailParaVerificar, setEmailParaVerificar] = useState("");
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  
  const { login, registrar } = useAuthUser();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => firstInputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open, tab]);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) globalThis.addEventListener("keydown", onEsc);
    return () => globalThis.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData(e.currentTarget);
      const email = (form.get("email") as string | null ?? "").trim();
      const senha = (form.get("password") as string | null ?? "").trim();

      if (!email || !senha) {
        toast.error("Preencha todos os campos");
        setLoading(false);
        return;
      }

      const result = await login(email, senha);

      if (result.success) {
        toast.success("Login realizado com sucesso!");
        // Aguarda um pouco para o estado se propagar antes de fechar o modal
        await new Promise(resolve => setTimeout(resolve, 100));
        onClose();
      } else {
        toast.error(result.error || "Erro ao fazer login");
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData(e.currentTarget);
      const nome = (form.get("firstName") as string | null ?? "").trim();
      const sobrenome = (form.get("lastName") as string | null ?? "").trim();
      const email = (form.get("email") as string | null ?? "").trim();
      const senha = (form.get("password") as string | null ?? "").trim();
      const confirmarSenha = (form.get("confirmPassword") as string | null ?? "").trim();

      if (!nome || !sobrenome || !email || !senha || !confirmarSenha) {
        toast.error("Preencha todos os campos obrigatórios");
        setLoading(false);
        return;
      }

      if (senha !== confirmarSenha) {
        toast.error("As senhas não coincidem");
        setLoading(false);
        return;
      }

      // Validação de senha usando helper centralizado
      const validacaoSenha = validarSenha(senha);
      if (!validacaoSenha.valido) {
        toast.error(validacaoSenha.erros[0]); // Mostra o primeiro erro
        setLoading(false);
        return;
      }

      const result = await registrar({ nome, sobrenome, email, senha });

      if (result.success) {
        toast.success("Conta criada com sucesso! Verifique seu email.");
        // Aguarda um pouco para o estado se propagar
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Abre modal de verificação de email
        setEmailParaVerificar(email);
        setShowVerificarEmail(true);
      } else {
        toast.error(result.error || "Erro ao criar conta");
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <dialog open={open} className="fixed z-[91] inset-0 flex items-start justify-center p-4 md:p-6 bg-transparent">
        <div className="w-full max-w-md rounded-xl bg-white text-zinc-900 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="text-lg font-semibold text-zinc-900">Seja bem-vindo</h2>
            <button onClick={onClose} className="text-2xl p-1 rounded hover:bg-gray-100" disabled={loading}>
              <FiX />
            </button>
          </div>
          <div className="px-5 pt-4">
            <div className="flex gap-6 text-sm font-semibold">
              <button onClick={() => setTab("login")} disabled={loading} className={`pb-3 border-b-2 ${tab === "login" ? "border-black text-black" : "border-transparent text-zinc-600"}`}>
                ENTRAR
              </button>
              <button onClick={() => setTab("signup")} disabled={loading} className={`pb-3 border-b-2 ${tab === "signup" ? "border-black text-black" : "border-transparent text-zinc-600"}`}>
                CRIAR CONTA
              </button>
            </div>
          </div>
          <div className="px-5 pb-5">
            {tab === "login" ? (
              <form className="space-y-3 mt-4" onSubmit={handleLogin} autoComplete="on">
                <label className="block text-sm text-zinc-800">
                  <span className="block mb-1">E-mail</span>
                  <input 
                    ref={firstInputRef} 
                    type="email" 
                    name="email" 
                    autoComplete="email"
                    required 
                    disabled={loading} 
                    className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-gray-800" 
                  />
                </label>
                <label className="block text-sm text-zinc-800">
                  <span className="block mb-1">Senha</span>
                  <input 
                    type="password" 
                    name="password" 
                    autoComplete="current-password"
                    required 
                    disabled={loading} 
                    className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-gray-800" 
                  />
                </label>
                <button type="submit" disabled={loading} className="w-full mt-2 rounded-md bg-black text-white py-2.5 font-semibold hover:bg-gray-900 flex items-center justify-center gap-2">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Entrando...</> : "Entrar"}
                </button>
                <div className="relative my-4"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">ou</span></div></div>
                <button type="button" onClick={() => signIn("google")} disabled={loading} className="w-full rounded-md border py-2.5 font-semibold flex items-center justify-center gap-2"><FcGoogle className="w-5 h-5" />Continuar com Google</button>
                <button type="button" onClick={() => signIn("facebook")} disabled={loading} className="w-full rounded-md border py-2.5 font-semibold flex items-center justify-center gap-2"><FaFacebookF className="w-5 h-5 text-[#1877F2]" />Continuar com Facebook</button>
                <div className="flex flex-col gap-2 mt-3">
                  <p className="text-center text-xs">Novo na LUIGARAH? <button type="button" onClick={() => setTab("signup")} className="underline">Cadastre-se</button></p>
                  <p className="text-center text-xs">
                    <button 
                      type="button" 
                      onClick={() => {
                        onClose();
                        router.push("/redefinir-senha");
                      }} 
                      className="underline text-gray-600 hover:text-black"
                    >
                      Esqueci minha senha
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              <form className="space-y-3 mt-4" onSubmit={handleSignup} autoComplete="on">
                <div className="grid grid-cols-2 gap-3">
                  <label>
                    <span className="block mb-1 text-sm">Nome *</span>
                    <input 
                      ref={firstInputRef} 
                      type="text" 
                      name="firstName" 
                      autoComplete="given-name"
                      required 
                      disabled={loading} 
                      className="w-full rounded-md border px-3 py-2" 
                    />
                  </label>
                  <label>
                    <span className="block mb-1 text-sm">Sobrenome *</span>
                    <input 
                      type="text" 
                      name="lastName" 
                      autoComplete="family-name"
                      required 
                      disabled={loading} 
                      className="w-full rounded-md border px-3 py-2" 
                    />
                  </label>
                </div>
                <label>
                  <span className="block mb-1 text-sm">E-mail *</span>
                  <input 
                    type="email" 
                    name="email" 
                    autoComplete="email"
                    required 
                    disabled={loading} 
                    className="w-full rounded-md border px-3 py-2" 
                  />
                </label>
                <label>
                  <span className="block mb-1 text-sm">Senha *</span>
                  <input 
                    type="password" 
                    name="password" 
                    autoComplete="new-password"
                    required 
                    disabled={loading} 
                    className="w-full rounded-md border px-3 py-2" 
                  />
                  <p className="text-[10px] text-zinc-600 mt-1">6 a 40 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 especial (@$!%*?&#)</p>
                </label>
                <label>
                  <span className="block mb-1 text-sm">Confirmar Senha *</span>
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    autoComplete="new-password"
                    required 
                    disabled={loading} 
                    className="w-full rounded-md border px-3 py-2" 
                  />
                </label>
                <p className="text-[11px]">Ao cadastrar, você concorda com nossos <a href="/lgpd/termos-de-servico" target="_blank" className="underline">Termos</a> e <a href="/lgpd/politica-de-privacidade" target="_blank" className="underline">Política de privacidade</a>.</p>
                <button type="submit" disabled={loading} className="w-full mt-2 rounded-md bg-black text-white py-2.5 font-semibold hover:bg-gray-900 flex items-center justify-center gap-2">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Criando...</> : "Criar conta"}
                </button>
                <div className="relative my-4"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">ou</span></div></div>
                <button type="button" onClick={() => signIn("google")} className="w-full rounded-md border py-2.5 font-semibold flex items-center justify-center gap-2"><FcGoogle className="w-5 h-5" />Continuar com Google</button>
                <button type="button" onClick={() => signIn("facebook")} className="w-full rounded-md border py-2.5 font-semibold flex items-center justify-center gap-2"><FaFacebookF className="w-5 h-5 text-[#1877F2]" />Continuar com Facebook</button>
                <p className="text-center text-xs mt-3">Já tem conta? <button type="button" onClick={() => setTab("login")} className="underline">Faça login</button></p>
              </form>
            )}
          </div>
        </div>
      </dialog>

      {/* Modal de Verificação de Email */}
      <VerificarEmailModal
        open={showVerificarEmail}
        onClose={() => {
          setShowVerificarEmail(false);
          onClose(); // Fecha o modal de auth também
        }}
        email={emailParaVerificar}
        onSuccess={() => {
          // Após verificar, fecha ambos os modais e recarrega a página
          setShowVerificarEmail(false);
          onClose();
          router.refresh();
        }}
      />
    </>
  );
}