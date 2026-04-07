import { Suspense } from "react";
import HomeContent from "./home-content";

export const dynamic = "force-dynamic";

function HomeFallback() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-black/30 p-10 text-center text-zinc-300">
        جاري تحميل الصفحة الرئيسية...
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeContent />
    </Suspense>
  );
}
