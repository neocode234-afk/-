import {z} from "zod";
export const schema=z.object({name:z.string().trim().min(2).max(100).regex(/^[آ-ی\u200c\s]+$/),phone:z.string().regex(/^09\d{9}$/),password:z.string().min(8).max(72)});
