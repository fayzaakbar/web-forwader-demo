"use client";

import { useDeferredValue, useState } from "react";
import { BadgeCheck, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { CompanyCard } from "@/components/CompanyCard";
import { getCoverageLabels, getServiceNames } from "@/lib/forwarder-utils";
import { messages, translateService, type Locale } from "@/lib/messages";
import type { Forwarder, ServiceCategoryRecord } from "@/types/database";

export function DirectoryExplorer({ forwarders, categories, locale }: { forwarders: Forwarder[]; categories: ServiceCategoryRecord[]; locale: Locale }) {
  const copy = messages[locale];
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [country, setCountry] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const countries = Array.from(new Set(forwarders.flatMap((forwarder) =>
    forwarder.service_areas.flatMap((area) => [area.origin_country, area.destination_country]),
  ))).sort((left, right) => left.localeCompare(right));
  const filteredForwarders = forwarders.filter((forwarder) => {
    const searchText = [
      forwarder.name,
      forwarder.description,
      forwarder.headquarters_city,
      forwarder.headquarters_country,
      ...getServiceNames(forwarder),
      ...getCoverageLabels(forwarder),
    ].filter(Boolean).join(" ").toLowerCase();
    const matchesSearch = !deferredSearch || searchText.includes(deferredSearch);
    const matchesCategory = category === "all" || forwarder.company_services.some((service) => service.service_categories?.slug === category);
    const matchesCountry = country === "all" || forwarder.service_areas.some((area) => area.origin_country === country || area.destination_country === country);
    const matchesVerified = !verifiedOnly || forwarder.verified_status === "verified";
    return matchesSearch && matchesCategory && matchesCountry && matchesVerified;
  });
  const hasFilters = Boolean(search || category !== "all" || country !== "all" || verifiedOnly);

  function resetFilters() {
    setSearch("");
    setCategory("all");
    setCountry("all");
    setVerifiedOnly(false);
  }

  return (
    <>
      <section className="directory-hero relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(10,35,55,.97)_0%,rgba(10,35,55,.86)_49%,rgba(10,35,55,.37)_100%)]" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&w=2000&q=85')] bg-cover bg-center opacity-35" />
        <div className="relative mx-auto max-w-[1400px] px-5 pb-12 pt-12 sm:px-8 sm:pb-16 sm:pt-16 lg:px-12 lg:pb-[72px] lg:pt-[72px]">
          <div className="max-w-[690px]">
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-teal-200"><span className="h-px w-7 bg-teal-300" /> {copy.heroEyebrow}</p>
            <h1 className="font-display text-[40px] font-semibold leading-[1.08] tracking-[-0.025em] sm:text-[54px]">{copy.heroTitleFirst}<br className="hidden sm:block" /> {copy.heroTitleSecond}</h1>
            <p className="mt-4 max-w-[500px] text-[15px] leading-7 text-slate-200">{copy.heroDescription}</p>
          </div>

          <form onSubmit={(event) => event.preventDefault()} role="search" className="mt-8 flex max-w-[780px] items-center gap-3 rounded-md bg-white p-2 pl-4 shadow-2xl shadow-slate-950/20">
            <Search size={19} className="shrink-0 text-slate-400" aria-hidden="true" />
            <label htmlFor="directory-search" className="sr-only">{copy.searchPlaceholder}</label>
            <input id="directory-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={copy.searchPlaceholder} className="h-11 min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-ink placeholder:text-slate-400 focus:ring-0" />
            <button type="submit" className="h-11 shrink-0 rounded-sm bg-ocean px-5 text-sm font-semibold text-white transition hover:bg-[#0d5c62]">{copy.searchButton}</button>
          </form>
          <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 text-xs font-medium text-slate-200">
            <span><strong className="mr-1.5 text-white">{forwarders.length}</strong> {copy.listedForwarders}</span>
            <span><strong className="mr-1.5 text-white">{categories.length}</strong> {copy.serviceCategories}</span>
            <span className="flex items-center gap-1.5"><BadgeCheck size={14} className="text-teal-200" /> {copy.verifiedProfiles}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 pb-20 pt-9 sm:px-8 lg:px-12 lg:pt-12">
        <div className="mb-7 flex flex-col gap-5 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ocean">{copy.partnerDirectory}</p>
            <h2 className="mt-1.5 font-display text-[25px] font-semibold tracking-[-0.02em] text-ink">{copy.exploreForwarders}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <label htmlFor="service-filter" className="sr-only">{copy.allServices}</label>
              <select id="service-filter" value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 min-w-[155px] appearance-none rounded-sm border-line bg-white pl-3 pr-9 text-sm text-slate-700 focus:border-ocean focus:ring-ocean">
                <option value="all">{copy.allServices}</option>
                {categories.map((item) => <option key={item.id} value={item.slug}>{translateService(item.name, locale)}</option>)}
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-3 top-3 text-slate-400" aria-hidden="true" />
            </div>
            <div className="relative">
              <label htmlFor="country-filter" className="sr-only">{copy.allCountries}</label>
              <select id="country-filter" value={country} onChange={(event) => setCountry(event.target.value)} className="h-10 min-w-[150px] appearance-none rounded-sm border-line bg-white pl-3 pr-9 text-sm text-slate-700 focus:border-ocean focus:ring-ocean">
                <option value="all">{copy.allCountries}</option>
                {countries.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-3 top-3 text-slate-400" aria-hidden="true" />
            </div>
            <button type="button" onClick={() => setVerifiedOnly((current) => !current)} aria-pressed={verifiedOnly} className={`inline-flex h-10 items-center gap-2 rounded-sm border px-3 text-sm font-medium transition ${verifiedOnly ? "border-ocean bg-[#eaf4f3] text-ocean" : "border-line bg-white text-slate-600 hover:border-slate-300"}`}>
              <BadgeCheck size={15} aria-hidden="true" /> {copy.verifiedFilter}
            </button>
            {hasFilters && <button type="button" onClick={resetFilters} className="inline-flex h-10 items-center gap-1.5 px-2 text-sm text-slate-500 hover:text-ink"><X size={14} /> {copy.clear}</button>}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
          <p><span className="font-semibold text-ink">{filteredForwarders.length}</span> {filteredForwarders.length === 1 ? copy.forwarderFound : copy.forwardersFound}</p>
          <p className="hidden items-center gap-1.5 sm:flex"><SlidersHorizontal size={14} /> {copy.filterHint}</p>
        </div>
        {filteredForwarders.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredForwarders.map((forwarder) => <CompanyCard key={forwarder.id} forwarder={forwarder} locale={locale} />)}
          </div>
        ) : (
          <div className="border-y border-line py-16 text-center">
            <p className="font-display text-lg font-semibold text-ink">{copy.noForwarderMatches}</p>
            <p className="mt-2 text-sm text-slate-500">{copy.changeFilters}</p>
            <button type="button" onClick={resetFilters} className="mt-5 rounded-sm bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#183b59]">{copy.clearFilters}</button>
          </div>
        )}
      </section>
    </>
  );
}
