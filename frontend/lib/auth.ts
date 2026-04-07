import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiBase } from "./api";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const res = await fetch(`${apiBase}/users/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials)
        });

        if (!res.ok) return null;
        const data = await res.json();
        return {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          token: data.token
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.accessToken = user.token;
        token.sub = user.id || token.sub;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    }
  }
};
