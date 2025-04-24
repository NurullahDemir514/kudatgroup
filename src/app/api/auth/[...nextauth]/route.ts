import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Kullanıcı Adı", type: "text" },
                password: { label: "Şifre", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error("MissingCredentials");
                }

                try {
                    // MongoDB'ye bağlan
                    await connectToDatabase();

                    // Kullanıcıyı kullanıcı adı ile ara
                    console.log("Aranan kullanıcı adı:", credentials.username);
                    const user = await User.findOne({ name: credentials.username });
                    console.log("Bulunan kullanıcı:", user);

                    if (!user) {
                        throw new Error("UserNotFound");
                    }

                    // Şifre kontrolü
                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isPasswordValid) {
                        throw new Error("InvalidPassword");
                    }

                    // Hesap aktif mi kontrolü
                    if (user.status === "inactive") {
                        throw new Error("AccountDisabled");
                    }

                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role
                    };
                } catch (error) {
                    console.error("Kimlik doğrulama hatası:", error);
                    throw error;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        }
    },
    pages: {
        signIn: "/admin/login",
        signOut: "/admin/login",
        error: "/admin/login", // Hata durumunda login sayfasına yönlendir
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 gün
    },
    secret: process.env.NEXTAUTH_SECRET || "gizli-anahtar-bulten-admin-panel",
    debug: true, // Hata ayıklama için debug modu açık
});

export { handler as GET, handler as POST }; 