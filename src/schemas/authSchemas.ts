import { z } from "zod";

export const loginSchema = z.object({
    username: z.string().min(1, "Kullanıcı adı gereklidir"),
    password: z.string().min(1, "Şifre gereklidir"),
});

export type LoginFormValues = z.infer<typeof loginSchema>; 