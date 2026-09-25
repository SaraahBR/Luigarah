import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

/** Mesma duração do JWT do backend: quando um vence, o outro também. */
const UM_DIA = 24 * 60 * 60;

export const authOptions: NextAuthOptions = {
  // Login com e-mail e senha é feito direto no backend (AuthModal), não aqui.
  // O antigo CredentialsProvider aceitava qualquer e-mail sem senha correta.
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID ?? "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt", maxAge: UM_DIA },
  callbacks: {
    async jwt({ token, user, profile, account }) {
      if (user) {
        token.name = user.name ?? token.name;
        token.email = user.email ?? token.email;
        token.picture = user.image ?? token.picture;
      }

      // Preservar imagem do profile do OAuth (Google retorna 'picture')
      if (profile && "picture" in profile && typeof profile.picture === "string") {
        token.picture = profile.picture;
      }

      // No login: guarda o token do provedor para o backend conferir no Google/Facebook
      // (o backend não confia mais no e-mail enviado pelo navegador)
      if (account) {
        token.provider = account.provider;
        token.oauthToken =
          account.provider === "google" ? account.id_token : account.access_token;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name ?? session.user.name ?? "Cliente";
        session.user.email = token.email ?? session.user.email ?? "";
        session.user.image = (token.picture as string) ?? session.user.image ?? null;
      }
      session.provider = token.provider;
      session.oauthToken = token.oauthToken;
      return session;
    },
  },
};
