import NextAuth, { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { compare } from "bcrypt";
import { sql } from "@vercel/postgres";
import { SessionInterface } from "./common.types";

export const handler = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials, req) {
        const response = await sql`
        SELECT * FROM users WHERE email=${credentials?.email}`;
        const user = response.rows[0];

        const passwordCorrect = await compare(
          credentials?.password || "",
          user.password
        );

        if (passwordCorrect) {
          return {
            id: user.id,
            email: user.email,
          };
        }

        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }: any) {
      if (account.provider === "google") {
        const response = await sql`
        SELECT * FROM users WHERE email=${profile?.email}`;
        const user = response.rows[0];
      }
      console.log("hello2");
      return true; // Do different verification for other providers that don't have `email_verified`
    },
  },
});


export async function getCurrentUser() {
  const session = (await getServerSession(
    handler
  )) as unknown as SessionInterface;
  return session;
}
