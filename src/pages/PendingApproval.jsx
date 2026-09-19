import { useAuth } from '../hooks/useAuth';
import { LogOut } from 'lucide-react';
import Logo from '../components/Logo';

export default function PendingApproval() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--bg-1)] text-[var(--cream)] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-[var(--glass)] border border-[var(--line)] backdrop-blur-[16px] saturate-[140%] shadow-[0_24px_60px_rgba(0,0,0,0.28)] rounded-3xl p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--sun)] to-transparent rounded-bl-full -z-10 opacity-20"></div>
        <div className="flex justify-center mb-6">
          <Logo className="w-16 h-16" />
        </div>
        <h2 className="font-serif text-3xl font-bold mb-4">Account Pending</h2>
        <p className="text-[var(--muted)] mb-8">
          Thank you for joining Krishi Setu! Your account is currently under review by an administrator. 
          You will be able to access the platform once your account is approved.
        </p>
        <button
          onClick={logout}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-sans font-semibold text-base border-2 border-[var(--line)] bg-transparent text-[var(--cream)] transition-all duration-200 hover:border-[var(--sun-2)] hover:text-[var(--sun-2)]"
        >
          <LogOut className="w-5 h-5" />
          Sign out
        </button>
      </div>
    </div>
  );
}
