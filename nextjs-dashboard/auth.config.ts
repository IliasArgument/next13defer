import type { NextAuthConfig, User } from 'next-auth';
import GoogleProvider from "next-auth/providers/google";
import { SessionInterface } from './common.types';
import getServerSession from "next-auth";
import { sql } from '@vercel/postgres';
import { createUser } from './auth';

export async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
    // async session({ session }) {
    //   console.log(session, 'session')
    //   const email = session?.user?.email as string;
    //   try {
    //     const data = await getUser(email) as { user?: User }
    //     const newSession = {
    //       ...session,
    //       user: {
    //         ...session.user,
    //         ...data?.user,
    //       },
    //     };

    //     return newSession;
    //   } catch (error: any) {
    //     return session;
    //   }
    // },
  }
  // callbacks: {
  //   async signIn({account, profile}:{account: any | null; profile?: any | undefined;}) {
  //       const isAccount = account && profile;
  //       console.log(isAccount, 'isAccount')
  //       console.log(account, 'account')
  //       if (isAccount && account.provider === "google") {
  //           // return profile.email_verified && profile.email.endsWith("@example.com")
  //           return true
  //         }
  //       return true // Do different verification for other providers that don't have `email_verified`
  //   }
  // }

  ,
} satisfies NextAuthConfig;

export async function getCurrentUser() {
  const session = await getServerSession(authConfig) as unknown as SessionInterface;
  return session;
}

