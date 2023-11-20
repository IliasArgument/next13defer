''

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import type { User } from "@/app/lib/definitions";
import bcrypt from "bcrypt";
import { sql } from "@vercel/postgres";
import GoogleProvider from "next-auth/providers/google";



export async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}

export async function createUser(
  email: string,
  password: string,
  name: string
): Promise<User | undefined> {
  const salt = bcrypt.genSaltSync();
  const hashedPassword = bcrypt.hashSync(password, salt);

  try {
    const { rows } = await sql`
    INSERT INTO users (name, email, password) 
    VALUES (${name}, ${email}, ${hashedPassword}) 
    RETURNING id, name, email, password`;
    const newUser: any = {
      ...rows[0],
      id: rows[0].id.toString(),
      email: rows[0].email,
      name: rows[0].name,
    };
    return newUser;
  } catch (error) {
    console.error("Failed to create user:", error);
    throw new Error("Failed to create user.");
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            action: z.string().optional(),
            email: z.string().email(),
            password: z.string().min(6),
            name: z.string().optional(),
          })
          .safeParse(credentials);
        if (parsedCredentials.success) {
          const { action, email, password, name } = parsedCredentials.data;

          if (action === "login") {

            // Handle login logic
            const user = await getUser(email);
            if (!user) return null;
            const passwordsMatch = await bcrypt.compare(
              password,
              user.password
            );
            if (passwordsMatch) return user;
          } else if (action === "register" && name) {
            // Handle registration logic
            const existingUser = await getUser(email);
            if (existingUser) return null;
            const user = await createUser(email, password, name);
            if (!user) return null;
            return user;
          } else {
            // Invalid action
            return null;
          }
        }

        return null;
      },
    }),
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    //   allowDangerousEmailAccountLinking: true,
    // }),
  ],
  callbacks: {
    // async signIn({ user, account }: {
    //   user: User | any,
    //   account: any
    // }) {
    //   console.log(account, 'account')
    //   try {
    //     const userExists = await getUser(user?.email as string) as { user?: User }
    //     if (!userExists.user) {
    //       await createUser(user?.name as string, user?.email as string, user?.password as string)
    //     }
    //     return true;
    //   } catch (error: any) {
    //     return false;
    //   }
    // },
  }
});
