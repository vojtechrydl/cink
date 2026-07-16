import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const { user, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(email, password, name);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-[26px]">
      <div className="w-full max-w-[302px]">
        <div className="flex flex-col items-center mb-[34px]">
          <div className="w-[62px] h-[62px] rounded-[18px] bg-brand-bg flex items-center justify-center shadow-[0_8px_20px_-8px_rgba(217,119,6,0.4)]">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="3" width="16" height="14" rx="2.5" />
              <line x1="4" y1="10" x2="20" y2="10" />
              <circle cx="8.5" cy="20" r="1.3" fill="#D97706" stroke="none" />
              <circle cx="15.5" cy="20" r="1.3" fill="#D97706" stroke="none" />
              <line x1="8" y1="17" x2="7" y2="20" />
              <line x1="16" y1="17" x2="17" y2="20" />
            </svg>
          </div>
          <div className="font-extrabold text-[26px] tracking-[.08em] text-heading mt-4">CINK</div>
          <div className="text-[14px] text-tertiary mt-1">Sbírka plzeňských tramvají</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-0">
          {error && (
            <div className="bg-red-50 text-red-700 text-[13px] rounded-[13px] p-3 mb-4">
              {error}
            </div>
          )}

          <label className="block text-[12px] font-semibold text-secondary mb-[7px]">Jméno</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-[48px] rounded-[13px] bg-card border border-border px-[15px] text-[14px] text-heading placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent mb-4"
            placeholder="Jan Novák"
          />

          <label className="block text-[12px] font-semibold text-secondary mb-[7px]">E-mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-[48px] rounded-[13px] bg-card border border-border px-[15px] text-[14px] text-heading placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent mb-4"
            placeholder="vas@email.cz"
          />

          <label className="block text-[12px] font-semibold text-secondary mb-[7px]">Heslo</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-[48px] rounded-[13px] bg-card border border-border px-[15px] text-[14px] text-heading placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent mb-[22px]"
            placeholder="Alespoň 6 znaků"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-[50px] rounded-[13px] bg-brand text-white text-[15px] font-semibold shadow-[0_10px_22px_-8px_var(--color-brand-shadow)] disabled:opacity-50 transition-colors"
          >
            {submitting ? "Registruji..." : "Vytvořit účet"}
          </button>

          <p className="text-center text-[13px] text-tertiary mt-[18px]">
            Již máte účet?{" "}
            <Link to="/prihlaseni" className="text-brand font-semibold">
              Přihlaste se
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
