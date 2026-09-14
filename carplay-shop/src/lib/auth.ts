import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp, MINUTE } from "@/lib/rate-limit";

// Hash factice comparé quand l'email n'existe pas : le temps de réponse est
// ainsi le même qu'avec un compte existant (pas de fuite d'existence d'un
// compte par mesure du temps de réponse).
const DUMMY_HASH = bcrypt.hashSync("mot-de-passe-factice-anti-timing", 10);

// Limites de tentatives de connexion : par adresse IP et par email.
const LOGIN_MAX_PER_IP = 20;
const LOGIN_MAX_PER_EMAIL = 8;
const LOGIN_WINDOW = 15 * MINUTE;

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
  // Cookie de session persistant : reste valable 30 jours même après
  // fermeture complète du navigateur (PC, mobile, tablette), que ce soit un
  // compte admin ou client. Se reconnecter n'est nécessaire qu'après 30 jours
  // d'inactivité, ou après une déconnexion manuelle.
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: 30 * 24 * 60 * 60,
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
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;
        if (credentials.email.length > 254 || credentials.password.length > 200) return null;

        const email = credentials.email.toLowerCase().trim();

        // Limitation des tentatives (force brute) : même réponse qu'un mauvais
        // mot de passe, pour ne rien révéler.
        const ip = getClientIp((req?.headers as Record<string, string> | undefined) ?? {});
        if (!rateLimit(`login:ip:${ip}`, LOGIN_MAX_PER_IP, LOGIN_WINDOW).ok) return null;
        if (!rateLimit(`login:email:${email}`, LOGIN_MAX_PER_EMAIL, LOGIN_WINDOW).ok) return null;

        const user = await prisma.user.findUnique({ where: { email } });

        // Comparaison systématique (hash réel ou factice) : temps de réponse
        // identique que le compte existe ou non.
        const valid = await bcrypt.compare(credentials.password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !valid) return null;

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
