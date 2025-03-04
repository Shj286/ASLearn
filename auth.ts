import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authSchema } from "./lib/zod";
import { getUser } from "./lib/queries";
import { compare } from "bcrypt-ts";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

export const config = {
  runtime: "nodejs",
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials, request) => {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            return null;
          }

          const { email, password } = await authSchema.omit({ name: true }).parseAsync(credentials);

          // Debug log
          console.log(`Authenticating user with email: ${email}`);
          
          const user = await getUser({ email });
          
          // More verbose logging
          if (user) {
            console.log(`User found in DB: ${user._id}`);
            console.log(`Stored password hash: ${user.password?.substring(0, 10)}...`);
          } else {
            console.log("No user found with this email");
            return null;
          }

          // Try with direct string comparison first (for debugging)
          console.log(`Raw password input: ${password}`);
          
          // Check if the password exists in the user object
          if (!user.password) {
            console.log("User has no password stored");
            return null;
          }

          // Use bcrypt to compare the password
          const passwordMatch = await compare(password, user.password);
          console.log(`Password match result: ${passwordMatch}`);
          
          if (!passwordMatch) {
            console.log("Password doesn't match");
            return null;
          }

          console.log("Authentication successful");
          return {
            id: user._id.toString(),
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
  debug: true, // Keep debug mode enabled
});
