"use client";

import { useEffect, useRef, useState } from "react";
import { FiX, FiEye, FiEyeOff } from "react-icons/fi";
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
import authApi from "@/hooks/api/authApi";

type AuthModalProps = {
  readonly open: boolean;
  readonly onClose: () => void;
};

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [showVerificarEmail, setShowVerificarEmail] = useState(false);
  const [emailParaVerificar, setEmailParaVerificar] = useState("");
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [showPasswordSignup, setShowPasswordSignup] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
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

  useEffect(() => {
    if (open) {
      // Salva posição atual do scroll
      const scrollY = window.scrollY;
      document.body.style.top = `-${scrollY}px`;
      document.body.classList.add('modal-open');
    } else {
      // Restaura posição do scroll
      const scrollY = document.body.style.top;
      document.body.classList.remove('modal-open');
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.top = '';
    };
  }, [open]);

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
        toast.success("Conta criada com sucesso!");
        
        // ✅ ENVIA o código de verificação para o email
        try {
          await authApi.enviarCodigoVerificacao({ email });
          toast.success("Código de verificação enviado para seu email!");
        } catch (error: unknown) {
          console.error('[AuthModal] Erro ao enviar código:', error);
          toast.error("Erro ao enviar código de verificação. Tente reenviar.");
        }
        
        // Aguarda um pouco para o estado se propagar
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Abre modal de verificação de email e fecha AuthModal
        setEmailParaVerificar(email);
        setShowVerificarEmail(true);
        onClose(); // ✅ Fecha AuthModal quando VerificarEmailModal abrir
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
      <div 
        className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-md" 
        onClick={onClose} 
        aria-hidden="true"
        style={{ touchAction: 'none' }}
      />
      <dialog open={open} className="fixed z-[91] inset-0 flex items-center justify-center p-4 md:p-6 bg-transparent pointer-events-none">
        <div className="pointer-events-auto w-full flex items-center justify-center">
        <div 
          style={{ 
            width: typeof window !== 'undefined' && window.innerWidth >= 768 ? '500px' : 'calc(100vw - 32px)',
            maxWidth: '95vw',
            minWidth: typeof window !== 'undefined' && window.innerWidth >= 768 ? '500px' : 'auto'
          }} 
          className="rounded-lg bg-white text-zinc-900 shadow-2xl overflow-hidden my-auto max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b">
            <h2 className="text-base md:text-lg font-semibold text-zinc-900">Seja bem-vindo</h2>
            <button onClick={onClose} className="text-xl md:text-2xl p-1 rounded hover:bg-gray-100" disabled={loading}>
              <FiX />
            </button>
          </div>
          <div className="px-4 md:px-6 pt-3 md:pt-4">
            <div className="flex gap-4 md:gap-6 text-xs md:text-sm font-semibold">
              <button onClick={() => setTab("login")} disabled={loading} className={`pb-2 md:pb-3 border-b-2 ${tab === "login" ? "border-black text-black" : "border-transparent text-zinc-600"}`}>
                ENTRAR
              </button>
              <button onClick={() => setTab("signup")} disabled={loading} className={`pb-2 md:pb-3 border-b-2 ${tab === "signup" ? "border-black text-black" : "border-transparent text-zinc-600"}`}>
                CRIAR CONTA
              </button>
            </div>
          </div>
          <div className="px-4 md:px-8 pb-4 md:pb-6">
            {tab === "login" ? (
              <form className="space-y-3 md:space-y-5 mt-3 md:mt-5" onSubmit={handleLogin} autoComplete="on">
                <label className="block">
                  <span className="block mb-1 text-xs md:text-sm font-medium text-zinc-800">E-mail</span>
                  <input 
                    ref={firstInputRef} 
                    type="email" 
                    name="email" 
                    autoComplete="email"
                    required 
                    disabled={loading} 
                    className="w-full rounded-md border px-3 md:px-4 py-2 md:py-3 text-sm md:text-base focus:ring-2 focus:ring-gray-800" 
                  />
                </label>
                <label className="block">
                  <span className="block mb-1 text-xs md:text-sm font-medium text-zinc-800">Senha</span>
                  <div className="relative">
                    <input 
                      type={showPasswordLogin ? "text" : "password"}
                      name="password" 
                      autoComplete="current-password"
                      required 
                      disabled={loading} 
                      className="w-full rounded-md border px-3 md:px-4 py-2 md:py-3 pr-10 md:pr-11 text-sm md:text-base focus:ring-2 focus:ring-gray-800" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordLogin(!showPasswordLogin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                      tabIndex={-1}
                    >
                      {showPasswordLogin ? <FiEyeOff size={18} className="md:w-5 md:h-5" /> : <FiEye size={18} className="md:w-5 md:h-5" />}
                    </button>
                  </div>
                </label>
                <button type="submit" disabled={loading} className="w-full mt-2 rounded-md bg-black text-white py-2 md:py-3 text-sm md:text-base font-semibold hover:bg-gray-900 flex items-center justify-center gap-2">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Entrando...</> : "Entrar"}
                </button>
                <div className="relative my-3 md:my-5"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">ou</span></div></div>
                <button type="button" onClick={() => signIn("google")} disabled={loading} className="w-full rounded-md border py-2 md:py-3 text-sm md:text-base font-semibold flex items-center justify-center gap-2"><FcGoogle className="w-4 h-4 md:w-5 md:h-5" />Continuar com Google</button>
                <button type="button" onClick={() => signIn("facebook")} disabled={loading} className="w-full rounded-md border py-2 md:py-3 text-sm md:text-base font-semibold flex items-center justify-center gap-2"><FaFacebookF className="w-4 h-4 md:w-5 md:h-5 text-[#1877F2]" />Continuar com Facebook</button>
                <div className="flex flex-col gap-1.5 md:gap-2 mt-3 md:mt-4">
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
              <form className="space-y-1.5 md:space-y-2 mt-2 md:mt-3" onSubmit={handleSignup} autoComplete="on">
                <div className="grid grid-cols-2 gap-1.5 md:gap-2">
                  <label className="block">
                    <span className="block mb-0.5 text-xs md:text-sm font-medium text-zinc-800">Nome *</span>
                    <input 
                      ref={firstInputRef} 
                      type="text" 
                      name="firstName" 
                      autoComplete="given-name"
                      required 
                      disabled={loading} 
                      className="w-full rounded-md border px-2 md:px-3 py-1.5 text-sm focus:ring-2 focus:ring-gray-800" 
                    />
                  </label>
                  <label className="block">
                    <span className="block mb-0.5 text-xs md:text-sm font-medium text-zinc-800">Sobrenome *</span>
                    <input 
                      type="text" 
                      name="lastName" 
                      autoComplete="family-name"
                      required 
                      disabled={loading} 
                      className="w-full rounded-md border px-2 md:px-3 py-1.5 text-sm focus:ring-2 focus:ring-gray-800" 
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="block mb-0.5 text-xs md:text-sm font-medium text-zinc-800">E-mail *</span>
                  <input 
                    type="email" 
                    name="email" 
                    autoComplete="email"
                    required 
                    disabled={loading} 
                    className="w-full rounded-md border px-2 md:px-3 py-1.5 text-sm focus:ring-2 focus:ring-gray-800" 
                  />
                </label>
                <label className="block">
                  <span className="block mb-0.5 text-xs md:text-sm font-medium text-zinc-800">Senha *</span>
                  <div className="relative">
                    <input 
                      type={showPasswordSignup ? "text" : "password"}
                      name="password" 
                      autoComplete="new-password"
                      required 
                      disabled={loading} 
                      className="w-full rounded-md border px-2 md:px-3 py-1.5 pr-9 md:pr-10 text-sm focus:ring-2 focus:ring-gray-800" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordSignup(!showPasswordSignup)}
                      className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                      tabIndex={-1}
                    >
                      {showPasswordSignup ? <FiEyeOff size={16} className="md:w-[18px] md:h-[18px]" /> : <FiEye size={16} className="md:w-[18px] md:h-[18px]" />}
                    </button>
                  </div>
                  <p className="text-[9px] md:text-[10px] text-zinc-600 mt-0.5">6 a 40 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 especial (@$!%*?&#)</p>
                </label>
                <label className="block">
                  <span className="block mb-0.5 text-xs md:text-sm font-medium text-zinc-800">Confirmar Senha *</span>
                  <div className="relative">
                    <input 
                      type={showPasswordConfirm ? "text" : "password"}
                      name="confirmPassword" 
                      autoComplete="new-password"
                      required 
                      disabled={loading} 
                      className="w-full rounded-md border px-2 md:px-3 py-1.5 pr-9 md:pr-10 text-sm focus:ring-2 focus:ring-gray-800" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                      tabIndex={-1}
                    >
                      {showPasswordConfirm ? <FiEyeOff size={16} className="md:w-[18px] md:h-[18px]" /> : <FiEye size={16} className="md:w-[18px] md:h-[18px]" />}
                    </button>
                  </div>
                </label>
                <p className="text-[9px] md:text-[11px]">Ao cadastrar, você concorda com nossos <a href="/lgpd/termos-de-servico" target="_blank" className="underline">Termos</a> e <a href="/lgpd/politica-de-privacidade" target="_blank" className="underline">Política de privacidade</a>.</p>
                <button type="submit" disabled={loading} className="w-full mt-1 rounded-md bg-black text-white py-2 md:py-2.5 text-sm md:text-base font-semibold hover:bg-gray-900 flex items-center justify-center gap-2">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Criando...</> : "Criar conta"}
                </button>
                <div className="relative my-1.5 md:my-2"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">ou</span></div></div>
                <button type="button" onClick={() => signIn("google")} className="w-full rounded-md border py-1.5 md:py-2 text-sm font-semibold flex items-center justify-center gap-2"><FcGoogle className="w-4 h-4 md:w-5 md:h-5" />Continuar com Google</button>
                <button type="button" onClick={() => signIn("facebook")} className="w-full rounded-md border py-1.5 md:py-2 text-sm font-semibold flex items-center justify-center gap-2"><FaFacebookF className="w-4 h-4 md:w-5 md:h-5 text-[#1877F2]" />Continuar com Facebook</button>
                <p className="text-center text-xs mt-1 md:mt-1.5">Já tem conta? <button type="button" onClick={() => setTab("login")} className="underline">Faça login</button></p>
              </form>
            )}
          </div>
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