
import { useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Search,
  Users,
  Minus,
  Plus,
  ChevronDown,
} from "lucide-react";
import { destinations } from "../data/mockProperties";

export default function SearchPanel() {
  const [destination, setDestination] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [showGuests, setShowGuests] = useState(false);

  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    const search = destination.trim().toLowerCase();

    if (!search) return destinations;

    return destinations.filter(
      (item) =>
        item.name.toLowerCase().includes(search) ||
        item.country.toLowerCase().includes(search)
    );
  }, [destination]);

  const today = (() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  })();

  const openDatePicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    const input = ref.current;
    if (!input) return;

    try {
      if (typeof input.showPicker === "function") {
        input.showPicker();
      } else {
        input.focus();
        input.click();
      }
    } catch {
      input.focus();
    }
  };

  const selectDestination = (name: string) => {
    setDestination(name);
    setSelectedDestination(name);
    setShowSuggestions(false);
    setMessage("");
  };

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    setSelectedDestination("");
    setShowSuggestions(true);
    setMessage("");
  };

  const handleDestinationKeyDown = (
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Escape") {
      setShowSuggestions(false);
    }

    if (event.key === "Enter" && suggestions.length > 0) {
      event.preventDefault();
      selectDestination(suggestions[0].name);
    }
  };

  const totalGuests = adults + children;

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (!selectedDestination) {
      setMessage("Please select a destination from the suggestions.");
      return;
    }

    if (!checkIn || !checkOut) {
      setMessage("Please select both check-in and check-out dates.");
      return;
    }

    if (checkIn < today) {
      setMessage("Check-in date cannot be in the past.");
      return;
    }

    if (checkOut <= checkIn) {
      setMessage("Check-out must be after check-in.");
      return;
    }

    const params = new URLSearchParams({
      destination: selectedDestination,
      checkIn,
      checkOut,
      adults: String(adults),
      children: String(children),
    });

    navigate(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="relative z-30 mx-auto grid w-full max-w-5xl grid-cols-1 gap-2 rounded-[26px] border border-white/70 bg-white p-3 shadow-[0_18px_60px_rgba(15,23,42,0.16)] sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_0.8fr_auto] lg:items-center lg:rounded-full lg:p-2"
    >
      {/* Destination autocomplete */}
      <div className="relative">
        <div className="flex min-w-0 items-center gap-3 rounded-2xl px-4 py-3 transition hover:bg-slate-50 lg:rounded-full">
          <MapPin className="shrink-0 text-primary" size={20} />

          <label className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold uppercase tracking-[1.2px] text-slate-500">
              Where
            </span>

            <input
              value={destination}
              onChange={(event) =>
                handleDestinationChange(event.target.value)
              }
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleDestinationKeyDown}
              role="combobox"
              aria-expanded={showSuggestions}
              aria-autocomplete="list"
              aria-controls="destination-suggestions"
              placeholder="Search destinations"
              autoComplete="off"
              className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400"
            />
          </label>

          {destination && (
            <button
              type="button"
              onClick={() => {
                setDestination("");
                setSelectedDestination("");
                setShowSuggestions(true);
              }}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700"
              aria-label="Clear destination"
            >
              Clear
            </button>
          )}
        </div>

        {showSuggestions && (
          <div
            id="destination-suggestions"
            role="listbox"
            className="absolute left-0 top-full z-[100] mt-3 max-h-80 w-full min-w-[280px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl"
          >
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {destination ? "Matching destinations" : "Popular destinations"}
            </p>

            {suggestions.length > 0 ? (
              suggestions.map((item) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={selectedDestination === item.name}
                  key={item.name}
                  onClick={() => selectDestination(item.name)}
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-slate-50"
                >
                  <img
                    src={item.image}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-slate-800">
                      {item.name}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {item.country}
                    </span>
                  </span>

                  <MapPin size={16} className="shrink-0 text-slate-400" />
                </button>
              ))
            ) : (
              <p className="px-3 py-5 text-center text-sm text-slate-500">
                No matching destinations found.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Check-in */}
      <div
        onClick={() => openDatePicker(checkInRef)}
        className="flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 transition hover:bg-slate-50 lg:rounded-full"
      >
        <CalendarDays className="shrink-0 text-primary" size={19} />

        <label className="min-w-0 flex-1 cursor-pointer">
          <span className="block text-[10px] font-bold uppercase tracking-[1.2px] text-slate-500">
            Check in
          </span>

          <input
            ref={checkInRef}
            type="date"
            value={checkIn}
            min={today}
            onChange={(event) => {
              const value = event.target.value;
              setCheckIn(value);

              if (checkOut && value >= checkOut) {
                setCheckOut("");
              }

              setMessage("");
            }}
            onClick={(event) => event.stopPropagation()}
            className="w-full min-w-0 cursor-pointer bg-transparent text-xs font-semibold text-slate-700 outline-none"
          />
        </label>
      </div>

      {/* Check-out */}
      <div
        onClick={() => openDatePicker(checkOutRef)}
        className="flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 transition hover:bg-slate-50 lg:rounded-full"
      >
        <CalendarDays className="shrink-0 text-primary" size={19} />

        <label className="min-w-0 flex-1 cursor-pointer">
          <span className="block text-[10px] font-bold uppercase tracking-[1.2px] text-slate-500">
            Check out
          </span>

          <input
            ref={checkOutRef}
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
            onChange={(event) => {
              setCheckOut(event.target.value);
              setMessage("");
            }}
            onClick={(event) => event.stopPropagation()}
            className="w-full min-w-0 cursor-pointer bg-transparent text-xs font-semibold text-slate-700 outline-none"
          />
        </label>
      </div>

      {/* Guest selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowGuests((value) => !value)}
          aria-expanded={showGuests}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-slate-50 lg:rounded-full"
        >
          <Users className="shrink-0 text-primary" size={19} />

          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold uppercase tracking-[1.2px] text-slate-500">
              Guests
            </span>
            <span className="block text-sm font-semibold text-slate-700">
              {totalGuests} {totalGuests === 1 ? "guest" : "guests"}
            </span>
          </span>

          <ChevronDown
            size={15}
            className={`text-slate-400 transition ${
              showGuests ? "rotate-180" : ""
            }`}
          />
        </button>

        {showGuests && (
          <div className="absolute right-0 top-full z-[100] mt-3 w-72 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">Adults</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Ages 13 or above
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={adults <= 1}
                  onClick={() => setAdults((value) => Math.max(1, value - 1))}
                  aria-label="Remove adult"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Minus size={14} />
                </button>

                <span className="w-5 text-center text-sm font-bold text-slate-800">
                  {adults}
                </span>

                <button
                  type="button"
                  disabled={totalGuests >= 16}
                  onClick={() => setAdults((value) => value + 1)}
                  aria-label="Add adult"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="my-5 border-t border-slate-100" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">Children</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Ages 0–12
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={children <= 0}
                  onClick={() =>
                    setChildren((value) => Math.max(0, value - 1))
                  }
                  aria-label="Remove child"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Minus size={14} />
                </button>

                <span className="w-5 text-center text-sm font-bold text-slate-800">
                  {children}
                </span>

                <button
                  type="button"
                  disabled={totalGuests >= 16}
                  onClick={() => setChildren((value) => value + 1)}
                  aria-label="Add child"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGuests(false)}
              className="mt-5 w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover"
            >
              Done
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      <button
        type="submit"
        className="flex h-14 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:bg-primary-hover"
      >
        <Search size={18} />
        <span className="lg:hidden">Search stays</span>
      </button>

      {message && (
        <p
          role="status"
          className="px-4 pb-2 text-xs font-medium text-slate-600 sm:col-span-2 lg:absolute lg:left-8 lg:top-full lg:mt-2 lg:rounded-lg lg:bg-white lg:px-3 lg:py-2 lg:shadow"
        >
          {message}
        </p>
      )}
    </form>
  );
}
