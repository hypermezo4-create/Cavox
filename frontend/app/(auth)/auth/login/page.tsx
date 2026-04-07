import { Suspense } from "react";
import LoginForm from "./login-form";

function LoginFallback() {
  return (
    <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center text-zinc-300">
      جاري تحميل صفحة تسجيل الدخول...
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
