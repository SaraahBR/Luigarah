"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { getErrorMessage } from "@/lib/errorUtils";

/**
 * Mensagens de erro conhecidas do backend (sempre em português) -> chave em
 * messages/*.json (erros.api). A comparação é por trecho, sem acento e sem
 * diferenciar maiúsculas; a primeira regra que casar vence.
 */
const REGRAS: Array<[string, string]> = [
  ["e-mail ou senha incorretos", "invalidCredentials"],
  ["credenciais invalidas", "invalidCredentials"],
  ["ja foi verificado", "alreadyVerified"],
  ["conta ja verificada", "alreadyVerified"],
  ["ja esta cadastrada mas nao foi verificada", "registeredNotVerified"],
  ["nao foi verificada", "notVerified"],
  ["conta nao verificada", "notVerified"],
  ["conta oauth", "oauthAccount"],
  ["esta conta foi criada com", "oauthAccount"],
  ["email ja esta em uso", "emailInUse"],
  ["ja cadastrado", "emailInUse"],
  ["email nao cadastrado", "emailNotRegistered"],
  ["usuario nao encontrado", "userNotFound"],
  ["muitas tentativas", "tooManyAttempts"],
  ["para pedir um novo codigo", "waitNewCode"],
  ["login com google", "socialLoginFailed"],
  ["login com facebook", "socialLoginFailed"],
  ["login social sem token", "socialLoginFailed"],
  ["codigo expirado", "codeExpired"],
  ["codigo ja foi utilizado", "codeUsed"],
  ["codigo ja utilizado", "codeUsed"],
  ["codigo nao encontrado", "codeNotFound"],
  ["codigo invalido", "codeInvalid"],
  ["senha atual incorreta", "wrongCurrentPassword"],
  ["senhas nao coincidem", "passwordsDontMatch"],
  ["confirmacao nao coincidem", "passwordsDontMatch"],
  ["erro ao enviar email", "emailSendError"],
  ["falha ao enviar email", "emailSendError"],
  ["servico de email", "emailSendError"],
  ["usuario nao autenticado", "notAuthenticated"],
  ["acesso negado", "accessDenied"],
  ["nao tem permissao", "accessDenied"],
  ["produto ja esta na lista de desejos", "alreadyInWishlist"],
  ["produto nao encontrado", "productNotFound"],
  ["tamanho nao encontrado", "sizeNotFound"],
  ["quantidade maxima excedida", "maxQuantity"],
  ["quantidade deve estar entre", "maxQuantity"],
  ["endereco nao encontrado", "addressNotFound"],
  ["erro desconhecido", "generic"],
  ["sessao expirada", "sessionExpired"],
  ["erro de conexao", "network"],
  ["failed to fetch", "network"],
  ["networkerror", "network"],
];

const normalizar = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/**
 * Traduz o erro de uma chamada à API para o idioma do site.
 * Mensagens desconhecidas são exibidas como vieram (ou a mensagem padrão).
 */
export function useErroApi() {
  const t = useTranslations("erros.api");

  return useCallback(
    (erro: unknown, padrao?: string): string => {
      // Erros do RTK Query chegam como { data: { mensagem } }
      const dados = (erro as { data?: { mensagem?: string; message?: string } } | null)?.data;
      const msg =
        typeof erro === "string"
          ? erro
          : dados?.mensagem || dados?.message || (erro ? getErrorMessage(erro) : "");
      const alvo = normalizar(msg || "");
      const regra = REGRAS.find(([trecho]) => alvo.includes(trecho));
      if (regra) return t(regra[1]);
      return msg || padrao || t("generic");
    },
    [t]
  );
}
