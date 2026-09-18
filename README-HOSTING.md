# راه‌اندازی AliPrompt روی هاست

این پروژه به هاست دارای **Node.js 20+**، MySQL 8 و فضای دیسک دائمی نیاز دارد. cPanel معمولی بدون Node.js برای پنل و API مناسب نیست.

1. در MySQL Databases یک Database و User بسازید و All Privileges بدهید.
2. در phpMyAdmin فایل `database/schema.sql` را Import کنید. اگر دیتابیس را قبلاً ساخته‌اید، سپس `database/migrations/001_add_user_name.sql` را فقط یک‌بار اجرا کنید. اگر اجازه ساخت Database ندارید، دو خط اول SQL را حذف و دیتابیس ساخته‌شده را انتخاب کنید.
3. `.env.example` را به `.env.production` کپی و `DB_HOST`، `DB_PORT`، `DB_NAME`، `DB_USER` و `DB_PASSWORD` را وارد کنید.
4. برای `AUTH_SECRET` یک رشته تصادفی حداقل ۳۲ کاراکتری قرار دهید. Secret و رمزها را وارد Git نکنید.
5. موقتاً `ADMIN_EMAIL` و `ADMIN_PASSWORD` حداقل ۱۲ کاراکتری را تنظیم و `npm run create-admin` را اجرا کنید؛ سپس این دو متغیر را حذف کنید.
6. `npm install`، سپس `npm run build` و `npm run start` را اجرا کنید.
7. پوشه `public/uploads/prompts` باید برای Node.js قابل نوشتن و بین Deployها پایدار باشد.
8. دامنه را در پنل هاست به برنامه Node.js وصل و `NEXT_PUBLIC_SITE_URL` را برابر URL کامل HTTPS تنظیم کنید.

ورود مدیر: `/admin/login`. فقط پرامپت‌های Published در سایت عمومی دیده می‌شوند. Queryها پارامتری، رمزها bcrypt، Session از نوع HttpOnly/SameSite و آپلود محدود به JPG/PNG/WEBP تا ۸MB با بررسی امضای فایل و محدودیت اندازه است.

تا قبل از اتصال MySQL، محتوای فعلی از `data/prompts.ts` نمایش داده می‌شود. پس از تنظیم دیتابیس، مدیریت محتوا کاملاً از پنل و MySQL انجام می‌شود. از دیتابیس و `public/uploads` نسخه پشتیبان بگیرید.
