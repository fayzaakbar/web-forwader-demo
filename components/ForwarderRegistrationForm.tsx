"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, LoaderCircle, UserPlus } from "lucide-react";
import { registerForwarderAction } from "@/app/forwarder/register/actions";
import { LanguageToggle } from "@/components/LanguageToggle";
import { messages, type Locale } from "@/lib/messages";

export function ForwarderRegistrationForm({ locale, demo }: { locale: Locale; demo: boolean }) {
  const copy = messages[locale];
  const [state, formAction, pending] = useActionState(registerForwarderAction, { error: "", message: "" });

  return <section aria-labelledby="registration-title" className="mx-auto max-w-[560px] px-5 py-10 sm:px-8 sm:py-14">
    <div className="mb-6 flex items-center justify-between gap-4"><Link href="/forwarder/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-ink"><ArrowLeft size={15} />{copy.backToLogin}</Link><LanguageToggle locale={locale} /></div>
    <div className="border-y border-line py-7">
      <p className="text-xs font-semibold uppercase tracking-[0.13em] text-ocean">{demo ? copy.demoWorkspace : copy.forwarder}</p>
      <h1 id="registration-title" className="mt-2 font-display text-2xl font-semibold text-ink">{copy.registrationTitle}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">{copy.registrationHint}</p>
      {demo && <p className="mt-4 border-l-2 border-ocean bg-[#f2f7f7] px-3 py-2.5 text-sm text-slate-600">{copy.demoOnly}</p>}
      {state.error && <p role="alert" className="mt-4 rounded-sm border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">{state.error}</p>}
      {state.message && <p role="status" className="mt-4 rounded-sm border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900">{state.message}</p>}
      {!state.message && <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <div><label htmlFor="contact_name" className="mb-1.5 block text-sm font-medium text-slate-700">{copy.contactName}</label><input id="contact_name" name="contact_name" autoComplete="name" required minLength={2} maxLength={120} className="h-11 w-full rounded-sm border-line text-sm focus:border-ocean focus:ring-ocean" /></div>
        <div><label htmlFor="company_name" className="mb-1.5 block text-sm font-medium text-slate-700">{copy.companyName}</label><input id="company_name" name="company_name" autoComplete="organization" required minLength={2} maxLength={160} className="h-11 w-full rounded-sm border-line text-sm focus:border-ocean focus:ring-ocean" /></div>
        <div><label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">{copy.email}</label><input id="email" name="email" type="email" autoComplete="email" required className="h-11 w-full rounded-sm border-line text-sm focus:border-ocean focus:ring-ocean" /></div>
        <div><label htmlFor="website" className="mb-1.5 block text-sm font-medium text-slate-700">{copy.website}</label><input id="website" name="website" type="url" placeholder="https://company.com" className="h-11 w-full rounded-sm border-line text-sm focus:border-ocean focus:ring-ocean" /></div>
        <div><label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">{copy.password}</label><input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className="h-11 w-full rounded-sm border-line text-sm focus:border-ocean focus:ring-ocean" /><p className="mt-1 text-xs text-slate-500">{copy.passwordHint}</p></div>
        <button type="submit" disabled={pending} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-ink px-4 text-sm font-semibold text-white transition hover:bg-[#183b59] disabled:cursor-wait disabled:opacity-70">{pending ? <LoaderCircle size={16} className="animate-spin" /> : <UserPlus size={16} />} {copy.createAccount}</button>
      </form>}
    </div>
  </section>;
}
