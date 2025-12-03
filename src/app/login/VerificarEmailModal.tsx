"use client";

import { useEffect, useRef, useState } from "react";
import { FiX, FiMail } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errorUtils";
import authApi from "@/hooks/api/authApi";

type VerificarEmailModalProps = {
  open: boolean;
  onClose: () => void;
  email: string;
  onSuccess: () => void;
};

export default function VerificarEmailModal({ 
  open, 
  onClose, 
  email,
  onSuccess 
}: VerificarEmailModalProps) {
  const [codigo, setCodigo] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRefs.current[0]?.focus(), 50);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) globalThis.addEventListener("keydown", onEsc);
    return () => globalThis.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  const handleInputChange = (index: number, value: string) => {
    // Permite apenas números
    if (value && !/^\d$/.test(value)) return;

    const newCodigo = [...codigo];
    newCodigo[index] = value;
    setCodigo(newCodigo);

    // Auto-focus no próximo input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Backspace: volta para o input anterior
    if (e.key === "Backspace" && !codigo[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Enter: verifica código se todos os campos estão preenchidos
    if (e.key === "Enter") {
      const codigoCompleto = codigo.join("");
      if (codigoCompleto.length === 6) {
        handleVerificar();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    
    if (pastedData) {
      const newCodigo = pastedData.split("");
      while (newCodigo.length < 6) newCodigo.push("");
      setCodigo(newCodigo);
      
      // Focus no último input preenchido ou no próximo vazio
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleVerificar = async () => {
    const codigoCompleto = codigo.join("");
    
    if (codigoCompleto.length !== 6) {
      toast.error("Digite o código completo de 6 dígitos");
      return;
    }

    setLoading(true);

    try {
      await authApi.verificarCodigo({
        email,
        codigo: codigoCompleto,
      });

      toast.success("Email verificado com sucesso! Bem-vindo(a) ao Luigara!");
      
      // Aguarda um pouco para o estado se propagar
      await new Promise(resolve => setTimeout(resolve, 100));
      
      onSuccess();
      onClose();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
      // Limpa o código em caso de erro
      setCodigo(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async () => {
    setReenviando(true);

    try {
      await authApi.enviarCodigoVerificacao({ email });
      toast.success("Novo código enviado para seu email!");
      // Limpa o código atual
      setCodigo(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setReenviando(false);
    }
  };

  const codigoCompleto = codigo.join("").length === 6;

  return (
    <>
      <div 
        className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      <div 
        role="dialog" 
        aria-modal="true" 
        className="fixed z-[91] inset-0 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-md rounded-xl bg-white text-zinc-900 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="text-lg font-semibold text-zinc-900">Verifique seu email</h2>
            <button 
              onClick={onClose} 
              className="text-2xl p-1 rounded hover:bg-gray-100" 
              disabled={loading}
            >
              <FiX />
            </button>
          </div>

          <div className="px-5 py-6 space-y-5">
            {/* Ícone e descrição */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                <FiMail className="h-8 w-8 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Enviamos um código de verificação de <strong>6 dígitos</strong> para
                </p>
                <p className="font-semibold text-gray-900 mt-1">{email}</p>
              </div>
            </div>

            {/* Inputs de código */}
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {codigo.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  disabled={loading}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:border-black focus:ring-2 focus:ring-gray-200 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                  aria-label={`Dígito ${idx + 1}`}
                />
              ))}
            </div>

            {/* Botão verificar */}
            <button
              onClick={handleVerificar}
              disabled={!codigoCompleto || loading}
              className="w-full rounded-md bg-black text-white py-3 font-semibold hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar código"
              )}
            </button>

            {/* Reenviar código */}
            <div className="text-center">
              <p className="text-sm text-gray-600">Não recebeu o código?</p>
              <button
                onClick={handleReenviar}
                disabled={reenviando || loading}
                className="text-sm font-semibold underline underline-offset-4 mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reenviando ? "Reenviando..." : "Reenviar código"}
              </button>
            </div>

            {/* Info sobre expiração */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800 text-center">
                ⏰ O código expira em <strong>12 horas</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
