
import { Link } from "react-router-dom";

export default function SiteFooter() {
  return (
    <footer className="mt-20 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Link
            to="/"
            className="text-3xl font-extrabold tracking-[-1.5px] text-white"
          >
            stayse<span className="text-blue-400">.</span>
          </Link>

          <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
            Find stays that make every journey feel a little more like yours.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-white">Explore</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li><a href="#destinations" className="hover:text-white">Destinations</a></li>
            <li><a href="#stays" className="hover:text-white">Featured stays</a></li>
            <li><a href="#why-stayse" className="hover:text-white">Why Stayse</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-white">Hosting</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li><a href="#host" className="hover:text-white">List your property</a></li>
            <li><a href="#host" className="hover:text-white">Hosting resources</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-white">Support</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li>
              <a href="mailto:support@stayse.example" className="hover:text-white">
                Contact us
              </a>
            </li>
            <li>
              <Link to="/account/change-password" className="hover:text-white">
                Account security
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-slate-500 sm:flex-row sm:justify-between sm:px-8">
          <span>© {new Date().getFullYear()} Stayse. All rights reserved.</span>
          <span>Made for better journeys.</span>
        </div>
      </div>
    </footer>
  );
}
