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
      authorize: async (credentials, request) => {
        try {
          const { email, password } = await authSchema.omit({ name: true }).parseAsync(credentials);

          // Debug log
          console.log(`Authenticating user with email: ${email}`);
          
          const user = await getUser({ email });
          console.log(`User found in DB: ${!!user}`);
          
          if (!user) {
            console.log("No user found with this email");
            return null;
          }

          // Debug log the stored password (be careful with this in production!)
          console.log(`Password in DB: ${user.password ? "exists" : "missing"}`);
          
          const passwordMatch = await compare(password, user.password);
          console.log(`Password match: ${passwordMatch}`);
          
          if (!passwordMatch) {
            console.log("Password doesn't match");
            return null;
          }

          console.log("Authentication successful");
          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
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
  debug: true, // Enable debug mode for more verbose logs
});
