import * as z from "zod";
export const UserValidation = z.object({
  profile_name: z.string().url().nonempty(),
  name: z.string().min(3).max(25),
  username: z.string().min(4).max(30),
  bio: z.string().min(3).max(200),
});
