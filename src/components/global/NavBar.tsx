import { NavLink } from "react-router-dom";

export default function NavBar() {
  const linkBase = "text-sm text-muted hover:text-text";
  const active = "text-brand-700 font-semibold text-text";
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2 text-text">
          <h2 className="text-lg font-semibold">Concert.com</h2>
        </div>

        <nav className="flex items-center gap-4 text-sm text-muted" aria-label="Primary navigation">
          <NavLink to={"/"} className={({ isActive }) => (isActive ? `${linkBase} ${active}` : linkBase)}>
            Home
          </NavLink>
          <NavLink to={"/login"} className={({ isActive }) => (isActive ? `${linkBase} ${active}` : linkBase)}>
            <span className="inline-flex items-center gap-2">
              Login
            </span>
          </NavLink>
          <NavLink to={"/signup"} className={({ isActive }) => (isActive ? `${linkBase} ${active}` : linkBase)}>
            <span className="inline-flex items-center gap-2">
              Sign Up
            </span>
          </NavLink>
          <NavLink to={"/cart"} className={({ isActive }) => (isActive ? `${linkBase} ${active}` : linkBase)}>
            <span className="inline-flex items-center gap-2">
              Cart
            </span>
          </NavLink>
        </nav>
      </div>
    </header>
  )
}