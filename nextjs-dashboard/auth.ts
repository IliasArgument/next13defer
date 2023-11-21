("");

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import type { User } from "@/app/lib/definitions";
import bcrypt from "bcrypt";
import { sql } from "@vercel/postgres";

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
  name: string,
  email: string,
  password: string
): Promise<User | any> {
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
    throw new Error("Failed to create user.");
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      type:'credentials',
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          // const passwordsMatch = await bcrypt.compare(password, user.password);

          // if (passwordsMatch) return user;
        }

        console.log('Invalid credentials');
        return null;
      }
      // }
      ,
      credentials: {}
    }),
  ],
  pages: {
    signIn: "/login",
    // error: '/auth/error',
    // signOut: '/auth/signout'
  },

});
