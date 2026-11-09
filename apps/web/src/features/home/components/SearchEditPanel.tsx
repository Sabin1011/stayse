
import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  MapPin,
  CalendarDays,
  Users,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
} from "lucide-react";
import { destinations } from "../data/mockProperties";

export default function SearchEditPanel() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [isEditing, setIsEditing] = useState(false);

  const [destination, setDestination] = useState(
    searchParams.get("destination") || ""
  );
  const [checkIn, setCheckIn] = useState(
    searchParams.get("checkIn") || ""
  );
  const [checkOut, setCheckOut] = useState(
    searchParams.get("checkOut") || ""
  );
  const [adults, setAdults] = useState(
    Number(searchParams.get("adults") || 2)
  );
  const [children, setChildren] = useState(
    Number(searchParams.get("children") || 0)
  );
  const [error, setError] = useState("");

  // Keep the editable fields in sync with browser back/forward navigation.
  useEffect(() => {
    setDestination(searchParams.get("destination") || "");
    setCheckIn(searchParams.get("checkIn") || "");
    setCheckOut(searchParams.get("checkOut") || "");
    setAdults(Number(searchParams.get("adults") || 2));
    setChildren(Number(searchParams.get("children") || 0));
  }, [searchParams]);

  const today = (() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  })();

  const totalGuests = adults + children;

  const formatDate = (value: string) => {
    if (!value) return "Select date";

    return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!destination) {
      setError("Please select a destination.");
      return;
    }

    if (!checkIn || !checkOut) {
      setError("Please select both dates.");
      return;
    }

    if (checkIn < today) {
      setError("Check-in date cannot be in the past.");
      return;
    }

    if (checkOut <= checkIn) {
      setError("Check-out must be after check-in.");
      return;
    }

    if (totalGuests < 1 || totalGuests > 16) {
      setError("Choose between 1 and 16 guests.");
      return;
    }

    const updatedParams = new URLSearchParams(searchParams);

    updatedParams.set("destination", destination);
    updatedParams.set("checkIn", checkIn);
    updatedParams.set("checkOut", checkOut);
    updatedParams.set("adults", String(adults));
    updatedParams.set("children", String(children));

    setSearchParams(updatedParams);
    setIsEditing(false);
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-7">
      {/* Compact search summary */}
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Explore stays
          </p>

          <h1 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            Stays in {destination || "your destination"}
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Find your next comfortable stay with Stayse.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800">
            <p className="text-[10px] font-semibold uppercase text-slate-400">
              Dates
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
              {formatDate(checkIn)} – {formatDate(checkOut)}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800">
            <p className="text-[10px] font-semibold uppercase text-slate-400">
              Guests
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
              {adults} adults, {children} children
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setError("");
              setIsEditing((value) => !value);
            }}
            aria-expanded={isEditing}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-hover"
          >
            <Search size={16} />
            Edit search
            {isEditing ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expandable search form */}
      {isEditing && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-700"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Destination */}
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                <MapPin size={15} className="text-primary" />
                Destination
              </span>

              <select
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">Choose destination</option>
                {destinations.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Check-in */}
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                <CalendarDays size={15} className="text-primary" />
                Check-in
              </span>

              <input
                type="date"
                value={checkIn}
                min={today}
                onChange={(event) => {
                  const value = event.target.value;
                  setCheckIn(value);

                  if (checkOut && value >= checkOut) {
                    setCheckOut("");
                  }
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </label>

            {/* Check-out */}
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                <CalendarDays size={15} className="text-primary" />
                Check-out
              </span>

              <input
                type="date"
                value={checkOut}
                min={
                  checkIn
                    ? new Date(
                        new Date(`${checkIn}T00:00:00`).getTime() +
                          86400000
                      )
                        .toISOString()
                        .split("T")[0]
                    : today
                }
                onChange={(event) => setCheckOut(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </label>

            {/* Adults */}
            <div>
              <span className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                <Users size={15} className="text-primary" />
                Adults
              </span>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                <button
                  type="button"
                  disabled={adults <= 1}
                  onClick={() => setAdults((value) => Math.max(1, value - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-700 disabled:opacity-30 dark:border-slate-600 dark:text-white"
                  aria-label="Remove adult"
                >
                  <Minus size={14} />
                </button>

                <span className="text-sm font-bold text-slate-800 dark:text-white">
                  {adults}
                </span>

                <button
                  type="button"
                  disabled={totalGuests >= 16}
                  onClick={() => setAdults((value) => value + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-700 disabled:opacity-30 dark:border-slate-600 dark:text-white"
                  aria-label="Add adult"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Children */}
            <div>
              <span className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                <Users size={15} className="text-primary" />
                Children
              </span>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                <button
                  type="button"
                  disabled={children <= 0}
                  onClick={() =>
                    setChildren((value) => Math.max(0, value - 1))
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-700 disabled:opacity-30 dark:border-slate-600 dark:text-white"
                  aria-label="Remove child"
                >
                  <Minus size={14} />
                </button>

                <span className="text-sm font-bold text-slate-800 dark:text-white">
                  {children}
                </span>

                <button
                  type="button"
                  disabled={totalGuests >= 16}
                  onClick={() => setChildren((value) => value + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-700 disabled:opacity-30 dark:border-slate-600 dark:text-white"
                  aria-label="Add child"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-4 text-sm font-medium text-rose-600">
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setDestination(searchParams.get("destination") || "");
                setCheckIn(searchParams.get("checkIn") || "");
                setCheckOut(searchParams.get("checkOut") || "");
                setAdults(Number(searchParams.get("adults") || 2));
                setChildren(Number(searchParams.get("children") || 0));
                setError("");
                setIsEditing(false);
              }}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-hover"
            >
              <Search size={16} />
              Update search
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
