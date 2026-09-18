import { Link } from 'react-router-dom';
import { Sprout, ArrowRight, ShieldCheck, Tractor } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fff8f0] text-[#1e1b14] flex flex-col font-sans">
      <nav className="border-b border-gray-200/60 bg-[#fff8f0]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-[#1f4d36] p-1.5 rounded-lg">
                <Sprout className="h-6 w-6 text-[#8dbd9f]" />
              </div>
              <span className="text-xl font-bold font-serif text-[#033621]">Krishi Setu</span>
            </div>
            <div className="flex gap-4">
              <Link to="/login" className="text-sm font-medium hover:text-[#3a674f] px-3 py-2 transition-colors">
                Log in
              </Link>
              <Link to="/register" className="btn-primary text-sm font-medium shadow-sm transition-transform hover:-translate-y-0.5">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow flex flex-col justify-center items-center px-4 py-16 sm:py-24 text-center animate-fade-in">
        <div className="max-w-3xl space-y-8 animate-fade-in-up">
          <h1 className="text-5xl sm:text-7xl font-bold font-serif text-[#033621] tracking-tight leading-tight">
            Farm-to-Market, <span className="text-[#3a674f] italic">Simplified.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[#414943] max-w-2xl mx-auto leading-relaxed">
            Krishi Setu connects farmers directly with buyers for transparent, reliable crop deals. Calculate transport costs instantly and trade with confidence.
          </p>
          
          <div className="pt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="btn-primary text-lg px-8 py-3 shadow-md flex items-center justify-center gap-2 group hover:-translate-y-1 transition-all">
              Join the Network
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="bg-white border border-[#c0c9c1] text-[#1e1b14] rounded-lg px-8 py-3 font-medium hover:bg-gray-50 hover:border-[#717972] hover:-translate-y-1 transition-all text-lg flex items-center justify-center">
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl w-full text-left">
          <div className="ledger-card p-6 flex flex-col items-start gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="bg-[#febe51]/20 p-3 rounded-full">
              <Tractor className="h-6 w-6 text-[#724d00]" />
            </div>
            <h3 className="text-xl font-bold font-serif">For Farmers</h3>
            <p className="text-[#414943]">List your crops, receive direct offers from verified buyers, and secure the best prices for your hard work.</p>
          </div>
          <div className="ledger-card p-6 flex flex-col items-start gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="bg-[#a0d2b3]/20 p-3 rounded-full">
              <ShieldCheck className="h-6 w-6 text-[#1f4d36]" />
            </div>
            <h3 className="text-xl font-bold font-serif">For Buyers</h3>
            <p className="text-[#414943]">Post requests or browse available crops. Our automated transport calculator gives you the true landed cost instantly.</p>
          </div>
        </div>
      </main>
      
      <footer className="border-t border-gray-200/60 py-8 text-center text-sm text-[#717972]">
        <p>© {new Date().getFullYear()} Krishi Setu. All rights reserved.</p>
      </footer>
    </div>
  );
}
