import { Mail, ShieldCheck, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { brand } from "../brand";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { hasSupabaseConfig, supabase } from "../lib/supabase";

export const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runAuth(async () => {
      const { error } = await supabase!.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }
      window.location.href = "/";
    });
  };

  const signUp = async () => {
    await runAuth(async () => {
      const { error } = await supabase!.auth.signUp({ email, password });
      if (error) {
        throw error;
      }
      setMessage("Cont creat. Verifica emailul daca Supabase cere confirmare.");
    });
  };

  const magicLink = async () => {
    await runAuth(async () => {
      const { error } = await supabase!.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin }
      });
      if (error) {
        throw error;
      }
      setMessage("Magic link trimis pe email.");
    });
  };

  const runAuth = async (action: () => Promise<void>) => {
    if (!hasSupabaseConfig || !supabase) {
      setMessage("Supabase nu este configurat in environment.");
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      await action();
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Autentificarea a esuat.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10 text-white">
      <Card className="w-full max-w-md p-6">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#1C69D4] text-lg font-black">BH</div>
        <h1 className="mt-6 text-center text-3xl font-black">{brand.name}</h1>
        <p className="mt-2 text-center text-sm leading-6 text-white/56">
          Autentificare cu email, parola sau magic link prin Supabase Auth.
        </p>

        <form className="mt-6 space-y-4" onSubmit={signIn}>
          <label className="block">
            <span className="text-sm font-bold text-white/70">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nume@email.ro"
              className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/6 px-4 text-white outline-none placeholder:text-white/34"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-white/70">Parola</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/6 px-4 text-white outline-none placeholder:text-white/34"
            />
          </label>
          <Button fullWidth icon={<ShieldCheck size={18} />} type="submit" disabled={busy}>
            Intra in club
          </Button>
          <Button fullWidth variant="secondary" icon={<UserPlus size={18} />} onClick={signUp} disabled={busy || !password}>
            Creeaza cont
          </Button>
          <Button fullWidth variant="secondary" icon={<Mail size={18} />} onClick={magicLink} disabled={busy || !email}>
            Trimite magic link
          </Button>
        </form>

        {message ? (
          <div className="mt-5 rounded-2xl border border-white/8 bg-white/5 p-4 text-sm leading-6 text-white/70">{message}</div>
        ) : null}

        <div className="mt-5 rounded-2xl border border-white/8 bg-white/5 p-4 text-sm leading-6 text-white/56">
          Supabase este {hasSupabaseConfig ? "configurat" : "neconfigurat in environment"}.
        </div>

        <Link to="/" className="mt-5 block text-center text-sm font-bold text-[#9cc4ff]">
          Inapoi la aplicatie
        </Link>
      </Card>
    </main>
  );
};
