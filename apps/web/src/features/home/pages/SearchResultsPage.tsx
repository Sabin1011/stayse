import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpDown,
  MapPin,
  SlidersHorizontal,
  Star,
  X,
  Heart,
  Check,
} from "lucide-react";

import { properties } from "../data/mockProperties";
import type { StayProperty } from "../data/mockProperties";

import SearchEditPanel from "../components/SearchEditPanel";


type SortOption = "recommended" | "price-low" | "price-high" | "rating";

const categories = [
  "All",
  ...new Set(properties.map((property) => property.category)),
];

function PropertyCard({ property }: { property: StayProperty }) {
  const [isFavourite, setIsFavourite] = useState(false);

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900">
      <div className="relative h-56 overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        {property.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow">
            {property.badge}
          </span>
        )}

        <button
          type="button"
          onClick={() => setIsFavourite((value) => !value)}
          aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow transition hover:scale-110"
        >
          <Heart
            size={18}
            className={isFavourite ? "fill-rose-500 text-rose-500" : ""}
          />
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {property.category}
            </p>

            <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              {property.title}
            </h3>

            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
              <MapPin size={14} />
              {property.location}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1 text-sm font-bold text-slate-800 dark:text-white">
            <Star size={15} className="fill-amber-400 text-amber-400" />
            {property.rating}
          </div>
        </div>

        <div className="my-4 border-t border-slate-100 dark:border-slate-700" />

        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {property.reviews} reviews
          </p>

          <p className="text-lg font-extrabold text-slate-900 dark:text-white">
            ₹{property.price.toLocaleString("en-IN")}
            <span className="text-xs font-normal text-slate-500">
              {" "}/ night
            </span>
          </p>
        </div>
      </div>
    </article>
  );
}

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const destination = searchParams.get("destination") || "";

  const previousDestination = useRef(destination);

    useEffect(() => {
    if (previousDestination.current !== destination) {
        setMaxPrice(10000);
        setSelectedCategory("All");
        setMinimumRating(0);
        setSortBy("recommended");

        previousDestination.current = destination;
    }
    }, [destination]);

  const [maxPrice, setMaxPrice] = useState(10000);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minimumRating, setMinimumRating] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filteredProperties = useMemo(() => {
    let result = properties.filter((property) =>
      property.location.toLowerCase().includes(destination.toLowerCase())
    );

    result = result.filter((property) => property.price <= maxPrice);

    if (selectedCategory !== "All") {
      result = result.filter(
        (property) => property.category === selectedCategory
      );
    }

    if (minimumRating > 0) {
      result = result.filter(
        (property) => property.rating >= minimumRating
      );
    }

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;

      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;

      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;

      default:
        result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [destination, maxPrice, selectedCategory, minimumRating, sortBy]);

  const clearFilters = () => {
    setMaxPrice(10000);
    setSelectedCategory("All");
    setMinimumRating(0);
    setSortBy("recommended");
  };

  const FilterContent = () => (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 dark:text-white">
          Filters
        </h3>

        <button
          type="button"
          onClick={clearFilters}
          className="text-xs font-bold text-primary hover:underline"
        >
          Clear all
        </button>
      </div>

      {/* Price filter */}
      <section>
        <h4 className="mb-3 text-sm font-bold text-slate-800 dark:text-white">
          Maximum price per night
        </h4>

        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-slate-500">₹1,000</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            ₹{maxPrice.toLocaleString("en-IN")}
          </span>
        </div>

        <input
          type="range"
          min={1000}
          max={10000}
          step={500}
          value={maxPrice}
          onChange={(event) => setMaxPrice(Number(event.target.value))}
          className="w-full accent-blue-600"
        />
      </section>

      <div className="border-t border-slate-100 dark:border-slate-700" />

      {/* Category filter */}
      <section>
        <h4 className="mb-3 text-sm font-bold text-slate-800 dark:text-white">
          Property type
        </h4>

        <div className="space-y-3">
          {categories.map((category) => (
            <label
              key={category}
              className="flex cursor-pointer items-center gap-3 text-sm text-slate-600 dark:text-slate-300"
            >
              <input
                type="radio"
                name="category"
                checked={selectedCategory === category}
                onChange={() => setSelectedCategory(category)}
                className="h-4 w-4 accent-blue-600"
              />
              {category}
            </label>
          ))}
        </div>
      </section>

      <div className="border-t border-slate-100 dark:border-slate-700" />

      {/* Rating filter */}
      <section>
        <h4 className="mb-3 text-sm font-bold text-slate-800 dark:text-white">
          Guest rating
        </h4>

        <div className="space-y-3">
          {[0, 4, 4.5, 4.8, 4.9].map((rating) => (
            <label
              key={rating}
              className="flex cursor-pointer items-center gap-3 text-sm text-slate-600 dark:text-slate-300"
            >
              <input
                type="radio"
                name="rating"
                checked={minimumRating === rating}
                onChange={() => setMinimumRating(rating)}
                className="h-4 w-4 accent-blue-600"
              />

              {rating === 0 ? (
                "Any rating"
              ) : (
                <span className="flex items-center gap-1">
                  {rating}+ <Star size={13} className="fill-amber-400 text-amber-400" />
                </span>
              )}
            </label>
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 pb-16 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-primary"
        >
          <ArrowLeft size={17} />
          Back to home
        </button>

        {/* Editable search panel */}
        <SearchEditPanel />

        {/* Results heading and sorting */}
        <section className="mt-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Available properties
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {filteredProperties.length} properties found
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white lg:hidden"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>

            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900">
              <ArrowUpDown size={16} className="text-slate-500" />

              <span className="text-xs font-semibold text-slate-500">
                Sort:
              </span>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value as SortOption)
                }
                className="bg-transparent text-sm font-semibold text-slate-800 outline-none dark:text-white"
              >
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: Low to high</option>
                <option value="price-high">Price: High to low</option>
                <option value="rating">Top rated</option>
              </select>
            </label>
          </div>
        </section>

        {/* Main content */}
        <div className="mt-6 grid grid-cols-1 gap-7 lg:grid-cols-[260px_1fr]">
          {/* Desktop filters */}
          <aside className="hidden h-fit rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900 lg:block">
            <FilterContent />
          </aside>

          {/* Property results */}
          <section>
            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
                <MapPin size={35} className="text-slate-300" />

                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                  No properties found
                </h3>

                <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                  Try changing your filters or searching for another destination.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-hover"
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setShowMobileFilters(false)}
            className="absolute inset-0 bg-slate-950/50"
          />

          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Refine your search
              </h2>

              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                aria-label="Close"
                className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <FilterContent />

            <button
              type="button"
              onClick={() => setShowMobileFilters(false)}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-white hover:bg-primary-hover"
            >
              <Check size={17} />
              Show {filteredProperties.length} properties
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
