import { Suspense } from "react";
import RegisterForm from "./register-form";

function RegisterFallback() {
  return (
    <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center text-zinc-300">
      جاري تحميل صفحة إنشاء الحساب...
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterForm />
    </Suspense>
  );
}
