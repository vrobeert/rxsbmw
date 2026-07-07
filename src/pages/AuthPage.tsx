import { Mail, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { brand } from "../brand";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { hasSupabaseConfig } from "../lib/supabase";

export const AuthPage = () => (
  <main className="grid min-h-screen place-items-center px-4 py-10 text-white">
    <Card className="w-full max-w-md p-6">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#1C69D4] text-lg font-black">BH</div>
      <h1 className="mt-6 text-center text-3xl font-black">{brand.name}</h1>
      <p className="mt-2 text-center text-sm leading-6 text-white/56">
        Autentificare cu email, parola sau magic link prin Supabase Auth.
      </p>

      <form className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-bold text-white/70">Email</span>
          <input
            type="email"
            placeholder="nume@email.ro"
            className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/6 px-4 text-white outline-none placeholder:text-white/34"
          />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-white/70">Parola</span>
          <input
            type="password"
            placeholder="••••••••"
            className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/6 px-4 text-white outline-none placeholder:text-white/34"
          />
        </label>
        <Button fullWidth icon={<ShieldCheck size={18} />}>
          Intra in club
        </Button>
        <Button fullWidth variant="secondary" icon={<Mail size={18} />}>
          Trimite magic link
        </Button>
      </form>

      <div className="mt-5 rounded-2xl border border-white/8 bg-white/5 p-4 text-sm leading-6 text-white/56">
        Supabase este {hasSupabaseConfig ? "configurat" : "in modul demo pana adaugi .env.local"}.
      </div>

      <Link to="/" className="mt-5 block text-center text-sm font-bold text-[#9cc4ff]">
        Continua in demo
      </Link>
    </Card>
  </main>
);
