import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID ?? "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "E-mail e senha",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        const password = credentials?.password?.trim();
        if (!email || !password) return null;
        return { id: email, name: email.split("@")[0], email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, profile, account }) {
      // Log completo para debug
      console.log('[NextAuth JWT]  Callback chamado:', {
        hasUser: !!user,
        hasProfile: !!profile,
        hasAccount: !!account,
        provider: account?.provider,
      });

      if (user) {
        token.name = user.name ?? token.name;
        token.email = user.email ?? token.email;
        token.picture = user.image ?? token.picture;
        console.log('[NextAuth JWT]  User tem imagem?', !!user.image, user.image);
      }
      
      // Preservar imagem do profile do OAuth (Google retorna 'picture')
      if (profile && 'picture' in profile && typeof profile.picture === 'string') {
        token.picture = profile.picture;
        console.log('[NextAuth JWT]  Foto do Google capturada:', profile.picture);
      }

      // Log do token final
      console.log('[NextAuth JWT]  Token final picture:', token.picture);
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name ?? session.user.name ?? "Cliente";
        session.user.email = token.email ?? session.user.email ?? "";
        session.user.image = (token.picture as string) ?? session.user.image ?? null;
        
        console.log('[NextAuth Session]  Imagem final na sessão:', session.user.image);
      }
      return session;
    },
  },
  debug: true,
};
