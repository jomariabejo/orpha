import { SessionStrategy } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getDb } from '../mongodb'
import { User } from '../../../models/user'
import bcrypt from 'bcrypt'

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-here",
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        console.log('Auth attempt for:', credentials?.email)
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }
        const db = await getDb()
        const user = await db.collection("users").findOne({ email: credentials.email }) as User | null
        console.log('User found:', user ? 'Yes' : 'No')
        if (!user) {
          console.log('User not found in database')
          return null
        }
        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        console.log('Password valid:', valid)
        if (!valid) {
          console.log('Invalid password')
          return null
        }
        console.log('User role:', user.role)
        if (!('role' in user) || (user.role !== 'staff' && user.role !== 'admin')) {
          console.log('Invalid role:', user.role)
          return null
        }
        console.log('Authentication successful for:', user.email)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = (user as any).role
        token.id = (user as any).id
      }
      return token
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
} 