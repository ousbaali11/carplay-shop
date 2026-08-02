import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Reproduit le nom de cookie standard de NextAuth (avec le préfixe "__Secure-"
// utilisé automatiquement en HTTPS), pour rester compatible avec son
// fonctionnement interne tout en personnalisant sa durée de vie ci-dessous.
const useSecureCookies = (process.env.NEXTAUTH_URL || "").startsWith("https://");
const cookiePrefix = useSecureCookies ? "__Secure-" : "";

// Authentification unique pour les clients ET l'admin.
// Le rôle (CLIENT / ADMIN) est stocké en base et injecté dans la session,
// c'est lui qui détermine l'accès à /admin (voir middleware.ts).
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    // Filet de sécurité côté serveur : une session ne peut de toute façon jamais
    // dépasser 30 jours, même en théorie. En pratique, voir "cookies" ci-dessous :
    // c'est ça qui déconnecte réellement à la fermeture du navigateur.
    maxAge: 30 * 24 * 60 * 60,
  },
  // Cookie de session "classique" (sans maxAge/expires) : le navigateur le
  // supprime lui-même à sa fermeture complète. Rouvrir le navigateur plus tard
  // = obligatoirement se reconnecter, que ce soit un compte admin ou client.
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },
  pages: {
    signIn: "/compte/connexion",
  },
  providers: [
    CredentialsProvider({
      name: "Identifiants",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
