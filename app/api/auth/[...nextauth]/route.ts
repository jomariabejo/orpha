import NextAuth, { SessionStrategy } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getDb } from '../../mongodb'
import { User } from '../../../../models/user'
import bcrypt from 'bcrypt'

// --- BOOTSTRAP ADMIN USER (Uncomment to run once) ---
// (async () => {
//   const db = await getDb()
//   const userCount = await db.collection('users').countDocuments()
//   if (userCount === 0) {
//     const passwordHash = await bcrypt.hash('admin123', 10)
//     const adminUser: User = {
//       id: crypto.randomUUID(),
//       name: 'Admin',
//       email: 'admin@example.com',
//       passwordHash,
//       role: 'admin',
//     }
//     await db.collection('users').insertOne(adminUser)
//     console.log('Default admin user created: admin@example.com / admin123')
//   }
// })()
// --- END BOOTSTRAP ---

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) return null
        const db = await getDb()
        const user = await db.collection('users').findOne({ email: credentials.email }) as User | null
        if (!user) return null
        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null
        if (!('role' in user) || (user.role !== 'staff' && user.role !== 'admin')) return null
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

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 