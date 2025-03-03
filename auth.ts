import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authSchema } from "./lib/zod";
import { getUser } from "./lib/queries";
import { compare } from "bcrypt-ts";

export const config = {
  runtime: "nodejs",
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          let user = null;

          const { email, password } = await authSchema.omit({ name: true }).parseAsync(credentials);

          user = await getUser({ email });
          if (!user) return null;

          const passwordMatch = await compare(password, user.password);
          if (!passwordMatch) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
          };
        } catch (error) {
          console.error("Authentication error:", error);
        }
      },
    }),
    Google,
  ],
  // Use JWT strategy for session management
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    // You can also customize other pages:
    // signOut: '/auth/signout',
    // error: '/auth/error',
    // newUser: '/auth/new-user'
  },
  callbacks: {
    // Customize JWT contents
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        // Add any other user properties you want in the JWT
      }
      return token;
    },
    // Customize session object
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string;
        // Add any other token properties to the session
      }
      return session;
    },
  },
});
