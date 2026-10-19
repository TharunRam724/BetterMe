import React, { useState } from 'react';
import { Feather, Mail, Lock, User, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useAuth } from '../../services/authContext';

export const AuthPage: React.FC = () => {
  const { signIn, signUp, authError, clearAuthError } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setSuccessNotice(null);

    if (!email.trim() || !password) return;

    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          // Handled via authError state in context
        }
      } else {
        const res = await signUp(email, password, name);
        if (res.error) {
          // Handled via authError
        } else if (res.requiresEmailConfirmation) {
          setSuccessNotice(
            'Account created! If email confirmation is enabled for your project, please check your inbox to confirm your email before signing in.'
          );
        } else {
          setSuccessNotice('Account successfully created and signed in.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-purple-100 selection:text-purple-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon */}
        <div className="w-12 h-12 rounded-2xl bg-[#EDE7F8] border border-[#DDD4F2] flex items-center justify-center text-[#6B5A96] mx-auto mb-3 shadow-[0_4px_12px_rgba(107,90,150,0.12)]">
          <Feather className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#282522]">
          BetterMe
        </h1>
        <p className="mt-1 text-xs text-[#7A7268]">
          Mindful Personal Growth & Habits
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="p-7 sm:p-8 shadow-[0_8px_30px_rgba(40,32,20,0.05)] border-[#EAE3DA]">
          {/* Mode Switcher Tabs */}
          <div className="flex p-1 rounded-2xl bg-[#F4EFEA] border border-[#E7DFD4] mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                clearAuthError();
                setSuccessNotice(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                mode === 'signin'
                  ? 'bg-white text-[#282522] shadow-xs'
                  : 'text-[#6F675D] hover:text-[#282522]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                clearAuthError();
                setSuccessNotice(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                mode === 'signup'
                  ? 'bg-white text-[#282522] shadow-xs'
                  : 'text-[#6F675D] hover:text-[#282522]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Alert */}
          {authError && (
            <div className="mb-5 p-3 rounded-xl bg-[#FDF2F2] border border-[#F6D0D0] flex items-start gap-2.5 text-xs text-[#9E3939] animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-[#C24141] shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <span className="font-semibold">Authentication Error: </span>
                {authError}
              </div>
            </div>
          )}

          {/* Success Notice */}
          {successNotice && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#F1F7F3] border border-[#D5E7DB] flex items-start gap-2.5 text-xs text-[#3D5F47] animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-[#486952] shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{successNotice}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label
                  htmlFor="auth-name"
                  className="block text-xs font-semibold text-[#544D45] mb-1"
                >
                  Your Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C847A]" />
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] placeholder-[#A0988E] focus:outline-none focus:ring-2 focus:ring-[#8774B8] focus:bg-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-semibold text-[#544D45] mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C847A]" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@domain.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] placeholder-[#A0988E] focus:outline-none focus:ring-2 focus:ring-[#8774B8] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-semibold text-[#544D45] mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C847A]" />
                <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] placeholder-[#A0988E] focus:outline-none focus:ring-2 focus:ring-[#8774B8] focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                className="w-full"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {mode === 'signin' ? 'Sign In to BetterMe' : 'Create Account'}
              </Button>
            </div>
          </form>

          {/* Supabase Connection Security Capsule */}
          <div className="mt-6 pt-5 border-t border-[#F0EAE1] text-center">
            <p className="text-[11px] text-[#82786D] leading-relaxed">
              Protected with Supabase Auth & PostgreSQL Row-Level Security.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
