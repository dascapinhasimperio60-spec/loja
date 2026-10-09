import Link from "next/link";
import { Hook } from "@/components/store/hook";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-ink px-6">
      <div className="flex flex-col items-center text-center">
        <Hook className="h-16 w-auto" />
        <p className="mt-4 font-led text-2xl font-black tracking-[0.15em] text-sign [text-shadow:0_0_10px_rgba(255,204,41,0.6)]">404</p>
        <h1 className="mt-3 text-[clamp(2.4rem,7vw,5rem)] font-black uppercase leading-[0.9] tracking-[-0.03em] wdth-expanded">Gancho vazio</h1>
        <p className="mt-4 max-w-[40ch] text-lg text-muted">Esse produto saiu da parede ou o link mudou. A vitrine continua cheia.</p>
        <Link href="/produtos" className="plaque plaque-hole mt-8 px-5 py-3 text-base font-black uppercase wdth-semi">
          Voltar para a vitrine
        </Link>
      </div>
    </main>
  );
}
