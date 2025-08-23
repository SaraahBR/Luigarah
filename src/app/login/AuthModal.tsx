"use client";

import { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { signIn } from "next-auth/react";
import type { StoredUser } from "./storage";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  onAuthSuccess: (user: StoredUser) => void;
};

export default function AuthModal({ open, onClose, onAuthSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => firstInputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open, tab]);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const nameGuess = email.split("@")[0] || "Cliente";
    onAuthSuccess({ name: nameGuess, email });
    onClose();
  }

  function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "Cliente").trim();
    const email = String(form.get("email") || "").trim();
    onAuthSuccess({ name, email });
    onClose();
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Card */}
      <div
        role="dialog"
        aria-modal="true"
        className="fixed z-[91] inset-0 flex items-start justify-center p-4 md:p-6"
      >
        <div className="w-full max-w-md rounded-xl bg-white text-zinc-900 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="text-lg font-semibold text-zinc-900">Seja bem-vindo</h2>
            <button
              onClick={onClose}
              className="text-2xl p-1 rounded hover:bg-gray-100"
              aria-label="Fechar modal"
            >
              <FiX />
            </button>
          </div>

          {/* Tabs */}
          <div className="px-5 pt-4">
            <div className="flex gap-6 text-sm font-semibold">
              <button
                onClick={() => setTab("login")}
                className={`pb-3 border-b-2 ${
                  tab === "login"
                    ? "border-black text-black"
                    : "border-transparent text-zinc-600 hover:text-zinc-800"
                }`}
              >
                ENTRAR
              </button>
              <button
                onClick={() => setTab("signup")}
                className={`pb-3 border-b-2 ${
                  tab === "signup"
                    ? "border-black text-black"
                    : "border-transparent text-zinc-600 hover:text-zinc-800"
                }`}
              >
                ACABEI DE CHEGAR
              </button>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="px-5 pb-5">
            {tab === "login" ? (
              <form className="space-y-3 mt-4" onSubmit={handleLogin}>
                <label className="block text-sm text-zinc-800">
                  <span className="block mb-1">E-mail</span>
                  <input
                    ref={firstInputRef}
                    type="email"
                    name="email"
                    required
                    className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-800 text-zinc-900 placeholder-zinc-500"
                  />
                </label>

                <label className="block text-sm text-zinc-800">
                  <span className="block mb-1">Senha</span>
                  <input
                    type="password"
                    name="password"
                    required
                    className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-800 text-zinc-900 placeholder-zinc-500"
                  />
                </label>

                <button
                  type="submit"
                  className="w-full mt-2 rounded-md bg-black text-white py-2.5 font-semibold hover:bg-gray-900"
                >
                  Entrar
                </button>

                {/* Divisor */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">ou</span>
                  </div>
                </div>

                {/* Social */}
                <button
                  type="button"
                  onClick={() => signIn("google")}
                  className="w-full rounded-md border py-2.5 font-semibold text-zinc-800 hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <FcGoogle className="w-5 h-5" />
                  Continuar com Google
                </button>

                <button
                  type="button"
                  onClick={() => signIn("facebook")}
                  className="w-full rounded-md border py-2.5 font-semibold text-zinc-800 hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <FaFacebookF className="w-5 h-5 text-[#1877F2]" />
                  Continuar com Facebook
                </button>

                <p className="text-center text-xs text-zinc-700 mt-3">
                  Novo na LUIGARAH?{" "}
                  <button type="button" onClick={() => setTab("signup")} className="underline">
                    Cadastre-se
                  </button>
                </p>
              </form>
            ) : (
              <form className="space-y-3 mt-4" onSubmit={handleSignup}>
                <label className="block text-sm text-zinc-800">
                  <span className="block mb-1">Nome</span>
                  <input
                    ref={firstInputRef}
                    type="text"
                    name="name"
                    required
                    className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-800 text-zinc-900 placeholder-zinc-500"
                  />
                </label>

                <label className="block text-sm text-zinc-800">
                  <span className="block mb-1">E-mail</span>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-800 text-zinc-900 placeholder-zinc-500"
                  />
                </label>

                <label className="block text-sm text-zinc-800">
                  <span className="block mb-1">Senha</span>
                  <input
                    type="password"
                    name="password"
                    required
                    className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-800 text-zinc-900 placeholder-zinc-500"
                  />
                </label>

                <p className="text-[11px] text-zinc-700 leading-snug">
                  Ao cadastrar suas informações, você concorda com nossos Termos &amp; Condições, Política de
                  cookies e privacidade, e em participar do nosso programa de fidelidade.
                </p>

                <button
                  type="submit"
                  className="w-full mt-2 rounded-md bg-black text-white py-2.5 font-semibold hover:bg-gray-900"
                >
                  Criar conta
                </button>

                {/* Divisor */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">ou</span>
                  </div>
                </div>

                {/* Social */}
                <button
                  type="button"
                  onClick={() => signIn("google")}
                  className="w-full rounded-md border py-2.5 font-semibold text-zinc-800 hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <FcGoogle className="w-5 h-5" />
                  Continuar com Google
                </button>

                <button
                  type="button"
                  onClick={() => signIn("facebook")}
                  className="w-full rounded-md border py-2.5 font-semibold text-zinc-800 hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <FaFacebookF className="w-5 h-5 text-[#1877F2]" />
                  Continuar com Facebook
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
