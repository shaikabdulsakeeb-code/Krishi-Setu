import { Link, Navigate } from 'react-router-dom';
import { ShieldCheck, Tractor, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { currentUser, userData, loading } = useAuth();

  if (!loading && currentUser && userData?.role) {
    if (userData.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to={`/${userData.role}/dashboard`} replace />;
  }

  return (
    <div className="app-shell min-h-screen bg-transparent text-[var(--cream)] font-sans">
      <nav className="fixed inset-x-0 top-0 z-50 py-4 transition-all duration-300 bg-[rgba(15,46,31,0.78)] backdrop-blur-md border-b border-[var(--line)]">
        <div className="max-w-[1180px] w-[calc(100%-2rem)] sm:w-[calc(100%-2.5rem)] mx-auto flex items-center justify-between gap-3">
          <Link to="/" className="flex shrink-0 items-center gap-2 text-[1.15rem] sm:text-[1.35rem] font-bold font-serif no-underline tracking-wide">
            <Logo className="w-[34px] h-[34px]" />
            Krishi Setu
          </Link>
          <ul className="hidden lg:flex gap-7 list-none m-0 p-0">
            <li><a href="#how" className="text-[var(--muted)] font-medium text-[0.98rem] hover:text-[var(--sun-2)] transition-colors">How it works</a></li>
            <li><a href="#join" className="text-[var(--muted)] font-medium text-[0.98rem] hover:text-[var(--sun-2)] transition-colors">Farmers and buyers</a></li>
            <li><a href="#why" className="text-[var(--muted)] font-medium text-[0.98rem] hover:text-[var(--sun-2)] transition-colors">Why Krishi Setu</a></li>
          </ul>
          <div className="flex items-center gap-2.5">
            <Link to="/login" className="text-[var(--muted)] hover:text-[var(--sun-2)] transition-colors font-medium px-3 py-2 hidden lg:block">Log in</Link>
            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded-full font-sans font-semibold text-sm sm:text-base no-underline cursor-pointer border-2 border-transparent transition-all duration-200 bg-gradient-to-br from-[var(--sun-2)] to-[var(--sun)] text-[var(--ink)] shadow-[0_8px_24px_rgba(245,183,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(245,183,0,0.45)]">
              Join now
            </Link>
          </div>
        </div>
      </nav>

      <main id="top">
        {/* HERO */}
        <section className="relative min-h-[100svh] flex items-center pt-[8.5rem] pb-[6rem] overflow-hidden">
          <div className="absolute right-[-13vw] sm:right-[-30vw] lg:right-[-13vw] top-1/2 w-[clamp(380px,64vw,780px)] aspect-square -translate-y-1/2 pointer-events-none opacity-30 sm:opacity-70 lg:opacity-100" aria-hidden="true">
            <Logo sunflower={true} className="w-full h-full" />
          </div>
          <div className="relative z-10 max-w-[1180px] w-[calc(100%-2.5rem)] mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 items-center">
            <div className="animate-fade-in-up">
              <h1 className="font-serif font-black text-[clamp(2.6rem,6.2vw,5rem)] leading-[1.02] tracking-[-0.02em]">
                Sell your harvest.
                <span className="block text-[var(--sun-2)]">Buy it straight from the field.</span>
              </h1>
              <p className="mt-[1.4rem] max-w-[34rem] text-[1.18rem] text-[var(--muted)]">
                Krishi Setu connects farmers and buyers for crop deals where the price, quantity and terms are visible to both sides.
              </p>
              <div className="mt-8 flex flex-wrap gap-[0.9rem]">
                <Link to="/register" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-sans font-semibold text-base no-underline cursor-pointer border-2 border-transparent transition-all duration-200 bg-gradient-to-br from-[var(--sun-2)] to-[var(--sun)] text-[var(--ink)] shadow-[0_8px_24px_rgba(245,183,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(245,183,0,0.45)]">
                  Get started
                </Link>
                <a href="#how" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-sans font-semibold text-base no-underline cursor-pointer border-2 border-[var(--line)] bg-transparent text-[var(--cream)] transition-all duration-200 hover:border-[var(--sun-2)] hover:text-[var(--sun-2)]">
                  See how it works
                </a>
              </div>
            </div>
            <div className="flex justify-start lg:justify-end lg:self-end animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-[min(380px,100%)] rounded-[26px] p-[1.3rem_1.4rem] bg-[var(--glass)] border border-[var(--line)] backdrop-blur-[16px] saturate-[140%] shadow-[0_24px_60px_rgba(0,0,0,0.28)]" role="group" aria-label="Sample deal board">
                <h2 className="font-serif text-[1.15rem] font-bold flex justify-between items-baseline gap-4">
                  Today on the board <small className="font-sans font-medium text-[0.78rem] text-[var(--muted)]">Sample data</small>
                </h2>
                <ul className="list-none mt-[0.9rem] flex flex-col">
                  <li className="flex justify-between gap-4 py-[0.7rem] border-t border-[var(--line)]">
                    <div><b className="font-semibold">Groundnut</b><span className="text-[var(--muted)] text-[0.9rem] block">Anantapur · 80 quintals</span></div>
                    <em className="not-italic font-bold text-[var(--sun-2)] whitespace-nowrap">₹6,200</em>
                  </li>
                  <li className="flex justify-between gap-4 py-[0.7rem] border-t border-[var(--line)]">
                    <div><b className="font-semibold">Red chilli</b><span className="text-[var(--muted)] text-[0.9rem] block">Guntur · 40 quintals</span></div>
                    <em className="not-italic font-bold text-[var(--sun-2)] whitespace-nowrap">₹14,500</em>
                  </li>
                  <li className="flex justify-between gap-4 py-[0.7rem] border-t border-[var(--line)]">
                    <div><b className="font-semibold">Paddy</b><span className="text-[var(--muted)] text-[0.9rem] block">Krishna · 300 quintals</span></div>
                    <em className="not-italic font-bold text-[var(--sun-2)] whitespace-nowrap">₹2,350</em>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="relative py-[6.5rem] bg-[var(--band)] my-[59px]" id="how">
          <svg className="absolute left-0 w-full h-[60px] fill-[var(--band)] -top-[59px]" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0,60 L0,30 C240,0 480,60 720,30 C960,0 1200,60 1440,30 L1440,60Z"/></svg>
          <div className="max-w-[1180px] w-[calc(100%-2.5rem)] mx-auto animate-fade-in-up">
            <h2 className="font-serif font-bold text-[clamp(2rem,4vw,3.1rem)] leading-[1.1] tracking-[-0.015em] max-w-[22ch]">From the field to a signed deal in four steps</h2>
            <p className="mt-4 max-w-[40rem] text-[var(--muted)] text-[1.1rem]">No long chain of middlemen. Farmers and buyers deal with each other directly, and both can see what was agreed.</p>
            <ol className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 list-none relative">
              <div className="hidden lg:block absolute left-[8%] right-[8%] top-[27px] h-[2px] bg-[repeating-linear-gradient(90deg,var(--sun)_0_10px,transparent_10px_20px)] opacity-55"></div>
              <li className="relative">
                <div className="w-[56px] h-[56px] rounded-full grid place-items-center bg-[var(--sun)] text-[var(--ink)] font-serif font-black text-[1.35rem] shadow-[0_0_0_8px_var(--band)] relative z-10">1</div>
                <h3 className="mt-5 font-serif text-[1.3rem] font-bold">Post your crop</h3>
                <p className="mt-2 text-[var(--muted)]">Farmers add the crop, variety, quantity, location and the price they expect.</p>
              </li>
              <li className="relative">
                <div className="w-[56px] h-[56px] rounded-full grid place-items-center bg-[var(--sun)] text-[var(--ink)] font-serif font-black text-[1.35rem] shadow-[0_0_0_8px_var(--band)] relative z-10">2</div>
                <h3 className="mt-5 font-serif text-[1.3rem] font-bold">Buyers compare</h3>
                <p className="mt-2 text-[var(--muted)]">Buyers search the board and shortlist crops that match what they need.</p>
              </li>
              <li className="relative">
                <div className="w-[56px] h-[56px] rounded-full grid place-items-center bg-[var(--sun)] text-[var(--ink)] font-serif font-black text-[1.35rem] shadow-[0_0_0_8px_var(--band)] relative z-10">3</div>
                <h3 className="mt-5 font-serif text-[1.3rem] font-bold">Agree the terms</h3>
                <p className="mt-2 text-[var(--muted)]">Both sides settle price, quantity and delivery in one place.</p>
              </li>
              <li className="relative">
                <div className="w-[56px] h-[56px] rounded-full grid place-items-center bg-[var(--sun)] text-[var(--ink)] font-serif font-black text-[1.35rem] shadow-[0_0_0_8px_var(--band)] relative z-10">4</div>
                <h3 className="mt-5 font-serif text-[1.3rem] font-bold">Deliver and close</h3>
                <p className="mt-2 text-[var(--muted)]">The crop moves, the deal is closed, and both sides keep a record of it.</p>
              </li>
            </ol>
          </div>
          <svg className="absolute left-0 w-full h-[60px] fill-[var(--band)] -bottom-[59px] scale-y-[-1]" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0,60 L0,30 C240,0 480,60 720,30 C960,0 1200,60 1440,30 L1440,60Z"/></svg>
        </section>

        {/* AUDIENCES */}
        <section className="py-[6.5rem] relative" id="join">
          <div className="max-w-[1180px] w-[calc(100%-2.5rem)] mx-auto animate-fade-in-up">
            <h2 className="font-serif font-bold text-[clamp(2rem,4vw,3.1rem)] leading-[1.1] tracking-[-0.015em] max-w-[22ch]">Made for both sides of the deal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              <article className="rounded-[32px] p-8 md:p-10 bg-gradient-to-br from-[var(--sun-2)] to-[var(--sun)] text-[var(--ink)]">
                <h3 className="font-serif text-[1.9rem] font-black leading-[1.1]">For farmers</h3>
                <p className="mt-3 max-w-[30rem] text-[#3d3208]">Put your crop in front of buyers and decide who gets it.</p>
                <ul className="my-6 grid gap-2 list-none">
                  <li className="flex gap-3 items-start font-medium before:content-[''] before:flex-none before:w-[11px] before:h-[11px] before:mt-[6px] before:rounded-full before:bg-[var(--seed)] before:shadow-[0_0_0_3px_rgba(74,44,18,0.25)]">List a crop in a few minutes</li>
                  <li className="flex gap-3 items-start font-medium before:content-[''] before:flex-none before:w-[11px] before:h-[11px] before:mt-[6px] before:rounded-full before:bg-[var(--seed)] before:shadow-[0_0_0_3px_rgba(74,44,18,0.25)]">Set the price you expect</li>
                  <li className="flex gap-3 items-start font-medium before:content-[''] before:flex-none before:w-[11px] before:h-[11px] before:mt-[6px] before:rounded-full before:bg-[var(--seed)] before:shadow-[0_0_0_3px_rgba(74,44,18,0.25)]">Choose from the offers you receive</li>
                </ul>
                <Link to="/register" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-sans font-semibold text-base no-underline cursor-pointer border-2 border-transparent transition-all duration-200 bg-[var(--ink)] text-[var(--cream)] hover:bg-[#1f4d36]">
                  List your crop
                </Link>
              </article>
              <article className="rounded-[14px_44px_14px_44px] p-8 md:p-10 bg-[var(--glass)] border border-[var(--line)] backdrop-blur-[16px] saturate-[140%] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
                <h3 className="font-serif text-[1.9rem] font-black leading-[1.1]">For buyers</h3>
                <p className="mt-3 max-w-[30rem] text-[var(--muted)]">Find crops by type and location, and deal with the grower.</p>
                <ul className="my-6 grid gap-2 list-none">
                  <li className="flex gap-3 items-start font-medium before:content-[''] before:flex-none before:w-[11px] before:h-[11px] before:mt-[6px] before:rounded-full before:bg-[var(--sun-2)] before:shadow-[0_0_0_3px_rgba(255,216,77,0.25)]">Search by crop, quantity and district</li>
                  <li className="flex gap-3 items-start font-medium before:content-[''] before:flex-none before:w-[11px] before:h-[11px] before:mt-[6px] before:rounded-full before:bg-[var(--sun-2)] before:shadow-[0_0_0_3px_rgba(255,216,77,0.25)]">Compare prices side by side</li>
                  <li className="flex gap-3 items-start font-medium before:content-[''] before:flex-none before:w-[11px] before:h-[11px] before:mt-[6px] before:rounded-full before:bg-[var(--sun-2)] before:shadow-[0_0_0_3px_rgba(255,216,77,0.25)]">Keep every agreement in one place</li>
                </ul>
                <Link to="/register" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-sans font-semibold text-base no-underline cursor-pointer border-2 border-transparent transition-all duration-200 bg-gradient-to-br from-[var(--sun-2)] to-[var(--sun)] text-[var(--ink)] shadow-[0_8px_24px_rgba(245,183,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(245,183,0,0.45)]">
                  Find crops
                </Link>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#0A2115] pt-14 pb-8 border-t border-[var(--line)]">
        <div className="max-w-[1180px] w-[calc(100%-2.5rem)] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-8">
            <div>
              <Link to="/" className="flex items-center gap-2.5 text-[1.35rem] font-bold font-serif no-underline tracking-wide">
                <Logo className="w-[34px] h-[34px]" />
                Krishi Setu
              </Link>
              <p className="text-[var(--muted)] max-w-[26rem] mt-3">Farm-to-market deals with clear prices, for farmers and buyers.</p>
            </div>
            <div>
              <h4 className="font-serif text-[1.05rem] mb-3">Get started</h4>
              <ul className="list-none grid gap-2">
                <li><Link to="/register" className="text-[var(--muted)] no-underline hover:text-[var(--sun-2)] transition-colors">Register as Farmer</Link></li>
                <li><Link to="/register" className="text-[var(--muted)] no-underline hover:text-[var(--sun-2)] transition-colors">Register as Buyer</Link></li>
                <li><Link to="/login" className="text-[var(--muted)] no-underline hover:text-[var(--sun-2)] transition-colors">Log In</Link></li>
              </ul>
            </div>
          </div>
          <p className="mt-10 pt-5 border-t border-[var(--line)] text-sm text-[var(--muted)]">
            © {new Date().getFullYear()} Krishi Setu. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
