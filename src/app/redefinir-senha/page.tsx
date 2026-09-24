"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiMail, FiLock, FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useErroApi } from "@/i18n/useErroApi";
import { validarSenha } from "@/lib/passwordValidation";
import authApi from "@/hooks/api/authApi";

export default function RedefinirSenhaPage() {
  const [step, setStep] = useState<"email" | "codigo">("email");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const router = useRouter();
  const t = useTranslations("redefinirSenha");
  const tSenha = useTranslations("erros.senha");
  const traduzirErro = useErroApi();

  const handleSolicitarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error(t("typeEmail"));
      return;
    }

    setLoading(true);

    try {
      await authApi.solicitarResetSenha({ email });
      toast.success(t("codeSent"));
      setStep("codigo");
    } catch (error: unknown) {
      toast.error(traduzirErro(error));
    } finally {
      setLoading(false);
    }
  };

  const handleRedefinirSenha = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!codigo || !novaSenha || !confirmarSenha) {
      toast.error(t("fillAll"));
      return;
    }

    if (novaSenha !== confirmarSenha) {
      toast.error(t("passwordsDontMatch"));
      return;
    }

    // Valida senha
    const validacao = validarSenha(novaSenha);
    if (!validacao.valido) {
      toast.error(tSenha(validacao.codigos[0]));
      return;
    }

    setLoading(true);

    try {
      await authApi.redefinirSenhaComCodigo({
        email,
        codigo,
        novaSenha,
        confirmarNovaSenha: confirmarSenha,
      });

      toast.success(t("success"));
      
      // Aguarda um pouco e redireciona para login
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push("/");
    } catch (error: unknown) {
      toast.error(traduzirErro(error));
    } finally {
      setLoading(false);
    }
  };

  const handleReenviarCodigo = async () => {
    setLoading(true);

    try {
      await authApi.solicitarResetSenha({ email });
      toast.success(t("newCodeSent"));
    } catch (error: unknown) {
      toast.error(traduzirErro(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-4">
          <Link href="/" className="inline-block mb-3">
            <div className="relative w-28 md:w-36 h-auto mx-auto">
              <Image 
                src="/logos/LUIGARA-LOGO.png" 
                alt="Luigara" 
                width={200}
                height={80}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </Link>
          <h1 className="text-lg md:text-xl font-bold text-gray-900">
            {step === "email" ? t("forgotTitle") : t("resetTitle")}
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            {step === "email" 
              ? t("forgotSubtitle") 
              : t("resetSubtitle")
            }
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-5">
          {step === "email" ? (
            // Etapa 1: Solicitar código
            <form onSubmit={handleSolicitarCodigo} className="space-y-3">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  {t("email")}
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("emailPlaceholder")}
                    required
                    disabled={loading}
                    className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-2.5 text-sm rounded-lg font-semibold hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("sending")}
                  </>
                ) : (
                  <>
                    <FiMail className="w-4 h-4" />
                    {t("sendCode")}
                  </>
                )}
              </button>

              <Link
                href="/"
                className="block text-center text-sm text-gray-600 hover:text-black mt-4"
              >
                <FiArrowLeft className="inline w-4 h-4 mr-1" />
                {t("backHome")}
              </Link>
            </form>
          ) : (
            // Etapa 2: Redefinir senha
            <form onSubmit={handleRedefinirSenha} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("code")}
                </label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {t.rich("codeSentTo", { email, b: (c) => <strong>{c}</strong> })}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("newPassword")}
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showNovaSenha ? "text" : "password"}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder={t("newPasswordPlaceholder")}
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNovaSenha(!showNovaSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                    tabIndex={-1}
                    aria-label={showNovaSenha ? t("hidePassword") : t("showPassword")}
                  >
                    {showNovaSenha ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {tSenha("hint")}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("confirmPassword")}
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirmarSenha ? "text" : "password"}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder={t("confirmPasswordPlaceholder")}
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                    tabIndex={-1}
                    aria-label={showConfirmarSenha ? t("hidePassword") : t("showPassword")}
                  >
                    {showConfirmarSenha ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("resetting")}
                  </>
                ) : (
                  <>
                    <FiLock className="w-4 h-4" />
                    {t("resetTitle")}
                  </>
                )}
              </button>

              <div className="flex flex-col gap-2 text-center text-sm">
                <button
                  type="button"
                  onClick={handleReenviarCodigo}
                  disabled={loading}
                  className="text-gray-600 hover:text-black underline underline-offset-4 disabled:opacity-50"
                >
                  {t("resendCode")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setCodigo("");
                    setNovaSenha("");
                    setConfirmarSenha("");
                  }}
                  disabled={loading}
                  className="text-gray-600 hover:text-black disabled:opacity-50"
                >
                  <FiArrowLeft className="inline w-4 h-4 mr-1" />
                  {t("back")}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
