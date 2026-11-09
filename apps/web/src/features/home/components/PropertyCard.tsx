import { useState } from "react";
import { Heart, Star } from "lucide-react";
import type { StayProperty } from "../data/mockProperties";

export default function PropertyCard({ property }: { property: StayProperty }) {
  const [saved, setSaved] = useState(false);
  return (
    <article className="group min-w-0">
      <div className="relative aspect-[1.12/1] overflow-hidden rounded-2xl bg-slate-100">
        <img src={property.image} alt={property.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {property.badge && <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-slate-800 shadow-sm">{property.badge}</span>}
        <button type="button" aria-label={saved ? "Remove from saved stays" : "Save stay"} aria-pressed={saved} onClick={() => setSaved((v) => !v)} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur transition hover:scale-105 hover:text-rose-600">
          <Heart size={18} fill={saved ? "currentColor" : "none"} className={saved ? "text-rose-600" : ""} />
        </button>
      </div>
      <div className="pt-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 text-[14px] font-bold text-text">{property.title}</h3>
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-text"><Star size={13} fill="currentColor" className="text-amber-500" /> {property.rating}</span>
        </div>
        <p className="mt-1 text-sm text-text-secondary">{property.location}</p>
        <p className="mt-1 text-xs text-text-secondary">{property.category} · {property.reviews} reviews</p>
        <p className="mt-2 text-sm text-text"><strong className="font-extrabold">₹{property.price.toLocaleString("en-IN")}</strong><span className="text-text-secondary"> / night</span></p>
      </div>
    </article>
  );
}
