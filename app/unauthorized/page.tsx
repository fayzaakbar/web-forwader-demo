import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { signOutAction } from "@/app/login/actions";

export default function UnauthorizedPage() {
  return <section aria-labelledby="unauthorized-heading" className="mx-auto max-w-[760px] px-5 py-20 sm:px-8">
    <div className="border-y border-line py-10">
      <ShieldAlert size={26} className="text-ocean" />
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.13em] text-ocean">Access restricted</p>
      <h1 id="unauthorized-heading" className="mt-2 font-display text-3xl font-semibold text-ink">This account has no workspace role.</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Ask a platform administrator to add you as a platform admin or to a forwarder company before opening this workspace.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/" className="inline-flex h-10 items-center gap-2 rounded-sm border border-line px-3.5 text-sm font-semibold text-ink hover:border-ocean hover:text-ocean"><ArrowLeft size={15} /> Directory</Link>
        <form action={signOutAction}><button className="h-10 rounded-sm bg-ink px-3.5 text-sm font-semibold text-white hover:bg-[#183b59]">Sign out</button></form>
      </div>
    </div>
  </section>;
}
