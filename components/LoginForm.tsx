"use client";

import { useActionState } from "react";
import { Anchor, LoaderCircle, LogIn } from "lucide-react";
import { signInAction } from "@/app/login/actions";
import { LanguageToggle } from "@/components/LanguageToggle";
import { messages, type Locale } from "@/lib/messages";

export function LoginForm({ role, locale, setupRequired = false }: { role: "admin" | "forwarder"; locale: Locale; setupRequired?: boolean }) {
  const [state, formAction, pending] = useActionState(signInAction, { error: "" });
  const copy = messages[locale];

  return <section aria-label="Workspace sign in" className="grid min-h-[calc(100vh-140px)] place-items-center bg-canvas px-5 py-12">
    <section className="w-full max-w-[430px] rounded-md border border-line bg-white p-6 shadow-soft sm:p-8">
      <div className="mb-8 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-sm bg-ink text-white"><Anchor size={19} /></span>
        <span className="font-display text-xl font-bold tracking-[-0.03em] text-ink">routewise<span className="text-ocean">.</span></span>
        </div>
        <LanguageToggle locale={locale} />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.13em] text-ocean">{copy.workspace}</p>
      <h1 className="mt-2 font-display text-[26px] font-semibold text-ink">{role === "admin" ? copy.adminLogin : copy.forwarderLogin}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">{copy.signInHint}</p>

      {setupRequired && <p role="status" className="mt-5 rounded-sm border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">{copy.accessDisabled}</p>}
      {state.error && <p role="alert" className="mt-5 rounded-sm border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">{state.error}</p>}

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="expected_role" value={role} />
        <input type="hidden" name="locale" value={locale} />
        <div><label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">{copy.email}</label><input id="email" name="email" type="email" autoComplete="username" required className="h-11 w-full rounded-sm border-line text-sm focus:border-ocean focus:ring-ocean" /></div>
        <div><label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">{copy.password}</label><input id="password" name="password" type="password" autoComplete="current-password" required className="h-11 w-full rounded-sm border-line text-sm focus:border-ocean focus:ring-ocean" /></div>
        <button type="submit" disabled={pending} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-ink px-4 text-sm font-semibold text-white transition hover:bg-[#183b59] disabled:cursor-wait disabled:opacity-70">
          {pending ? <LoaderCircle size={16} className="animate-spin" /> : <LogIn size={16} />} {copy.signIn}
        </button>
      </form>
    </section>
  </section>;
}
