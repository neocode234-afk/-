import {SignJWT,jwtVerify} from "jose";import {cookies} from "next/headers";
export const COOKIE_NAME="aliprompt_admin";const secret=()=>new TextEncoder().encode(process.env.AUTH_SECRET||"");
export async function createSession(admin:{id:number;email:string}){if(!process.env.AUTH_SECRET)throw new Error("AUTH_SECRET is missing");return new SignJWT({email:admin.email,role:"admin"}).setProtectedHeader({alg:"HS256"}).setSubject(String(admin.id)).setIssuedAt().setExpirationTime("8h").sign(secret())}
export async function getSession(){const token=(await cookies()).get(COOKIE_NAME)?.value;if(!token||!process.env.AUTH_SECRET)return null;try{const {payload}=await jwtVerify(token,secret());return payload.role==="admin"?payload:null}catch{return null}}
