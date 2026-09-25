import "next-auth";
import "next-auth/jwt";

/**
 * Dados do login social guardados na sessão do NextAuth: o backend confere o token
 * no próprio Google/Facebook antes de gerar o JWT da API.
 */
declare module "next-auth" {
  interface Session {
    /** "google" ou "facebook" */
    provider?: string;
    /** id_token (Google) ou access_token (Facebook) */
    oauthToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    provider?: string;
    oauthToken?: string;
  }
}
