"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {LogIn,UserPlus,LoaderCircle} from "lucide-react";
export function AccessPanel(){
 const router=useRouter();const [mode,setMode]=useState<"login"|"register">("login");
 const [name,setName]=useState("");const [phone,setPhone]=useState("");const [secret,setSecret]=useState("");const [msg,setMsg]=useState("");const [busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setMsg("");
 try{const res=await fetch(mode==="login"?"/api/auth/access":"/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(mode==="login"?{phone,code:secret}:{name,phone,password:secret})});
 const data=await res.json();if(!res.ok)throw new Error(data.error||"خطا در درخواست");if(mode==="register"){setMsg("ثبت‌نام با موفقیت انجام شد ✓");setSecret("");return}router.replace(data.admin?"/admin":"/");router.refresh();
 }catch(e){setMsg(e instanceof Error?e.message:"اتصال برقرار نشد؛ دوباره تلاش کنید.");}finally{setBusy(false);}}
 return <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-5 py-10"><div className="w-full rounded-[2rem] border border-black/10 bg-white p-8 shadow-card dark:border-white/10 dark:bg-white/5">
 <div className="mb-7 flex rounded-full bg-black/5 p-1 dark:bg-white/10">{(["login","register"] as const).map(tab=><button key={tab} onClick={()=>{setMode(tab);setMsg("");setSecret("");}} className={`flex-1 rounded-full py-2.5 text-sm font-bold ${mode===tab?"bg-white shadow dark:bg-white/15":""}`}>{tab==="login"?"ورود":"ثبت‌نام"}</button>)}</div>
 <span className="mb-5 grid size-12 place-items-center rounded-2xl bg-violet text-white">{mode==="login"?<LogIn/>:<UserPlus/>}</span>
 <h1 className="text-3xl font-black">{mode==="login"?"ورود به AliPrompt":"ساخت حساب کاربری"}</h1><p className="mb-7 mt-3 text-sm leading-7 text-black/50 dark:text-white/50">{mode==="login"?"شماره موبایل و کد تأیید را وارد کنید.":"نام فارسی، شماره موبایل و رمز عبور خود را وارد کنید."}</p>
 <form onSubmit={submit} className="grid gap-5">
 {mode==="register"&&<label className="grid gap-2 text-xs font-bold">نام و نام خانوادگی (فارسی)<input required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={e=>setName(e.target.value)} className="input" placeholder="نام شما"/></label>}
 <label className="grid gap-2 text-xs font-bold">شماره موبایل<input type="tel" dir="ltr" required autoComplete="tel" maxLength={11} value={phone} onChange={e=>setPhone(e.target.value)} className="input" placeholder="09xxxxxxxxx"/></label>
 <label className="grid gap-2 text-xs font-bold">رمز عبور<input dir="ltr" type="password" required autoComplete={mode==="register"?"new-password":"current-password"} minLength={mode==="register"?8:4} maxLength={72} value={secret} onChange={e=>setSecret(e.target.value)} className="input"/>{mode==="register"&&<span className="text-black/45 dark:text-white/45">حداقل ۸ کاراکتر؛ شماره موبایل در این نسخه با پیامک تأیید نمی‌شود.</span>}</label>
 {msg&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{msg}</p>}
 <button disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink font-bold text-white disabled:opacity-60 dark:bg-white dark:text-ink">{busy&&<LoaderCircle className="animate-spin" size={18}/>} {mode==="login"?"ورود":"ثبت‌نام رایگان"}</button>
 </form></div></div>;
}
