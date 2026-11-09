import { ArrowRight, Compass, ShieldCheck, Sparkles } from "lucide-react";
import SiteNavbar from "../components/SiteNavbar";
import SearchPanel from "../components/SearchPanel";
import PropertyCard from "../components/PropertyCard";
import SiteFooter from "../components/SiteFooter";
import { destinations, properties } from "../data/mockProperties";

const HERO = "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=2200&q=90";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-text">
      <SiteNavbar />
      <main>
        <section className="relative isolate z-20 min-h-[570px] overflow-visible bg-slate-900 sm:min-h-[620px]">
          <img src={HERO} alt="Beautiful modern holiday accommodation surrounded by nature" className="absolute inset-0 -z-20 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/75 via-slate-950/35 to-slate-950/10" />
          <div className="mx-auto flex max-w-7xl flex-col px-5 pb-28 pt-24 sm:px-8 sm:pt-28 lg:pt-32">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-white backdrop-blur"><Sparkles size={14} className="text-amber-300" /> STAYS THAT STAY WITH YOU</span>
            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-[-1.8px] text-white sm:text-6xl lg:text-[68px]">Find your place<br className="hidden sm:block" /> in the world.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/85 sm:text-lg">From quiet hill retreats to coastal escapes, discover spaces that make every journey memorable.</p>
          </div>
          <div className="absolute bottom-[-1px] left-0 right-0 z-30 translate-y-1/2 px-5 sm:px-8">
            <SearchPanel />
          </div>
        </section>

        <section id="destinations" className="mx-auto max-w-7xl px-5 pt-36 sm:px-8 sm:pt-40">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[1.8px] text-accent">A little inspiration</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight text-text sm:text-3xl">Explore popular destinations</h2><p className="mt-2 text-sm text-text-secondary">Places worth adding to your next getaway.</p></div>
            <a href="#stays" className="hidden items-center gap-2 text-sm font-bold text-primary hover:gap-3 sm:flex">Explore stays <ArrowRight size={16} /></a>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
            {destinations.map((destination) => <a href="#stays" key={destination.name} className="group">
              <div className="aspect-[0.92/1] overflow-hidden rounded-2xl bg-slate-100 sm:aspect-[0.95/1]"><img src={destination.image} alt={destination.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></div>
              <h3 className="mt-3 text-sm font-extrabold text-text sm:text-base">{destination.name}</h3><p className="mt-1 text-xs text-text-secondary">{destination.country} · {destination.stays}</p>
            </a>)}
          </div>
        </section>

        <section id="stays" className="mx-auto max-w-7xl px-5 pt-20 sm:px-8 sm:pt-24">
          <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[1.8px] text-accent">Handpicked for you</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight text-text sm:text-3xl">Stays guests love</h2><p className="mt-2 text-sm text-text-secondary">A few beautiful places to get your plans started.</p></div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-surface-secondary px-3 py-2 text-xs font-semibold text-primary"><Compass size={15} /> Curated collection</span>
          </div>
          <div className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-6">
            {properties.map((property) => <PropertyCard key={property.id} property={property} />)}
          </div>
        </section>

        <section id="why-stayse" className="mx-auto max-w-7xl px-5 pt-20 sm:px-8 sm:pt-24">
          <div className="overflow-hidden rounded-[28px] bg-[#EAF2FF] px-6 py-10 dark:bg-slate-800 sm:px-10 sm:py-12 lg:flex lg:items-center lg:justify-between lg:px-14">
            <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[1.8px] text-primary">Travel with confidence</p><h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">A better stay starts with a better way to find it.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">Discover places with the details that matter, compare your options, and plan your next getaway in one place.</p></div>
            <div className="mt-7 flex shrink-0 items-center gap-3 rounded-2xl bg-white/80 px-5 py-4 text-sm font-bold text-slate-800 shadow-sm dark:bg-slate-900 dark:text-white lg:mt-0"><ShieldCheck size={25} className="text-accent" /><span>Designed around your journey</span></div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
