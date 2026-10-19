import React, { useState } from 'react';
import { Info, Database, ShieldAlert, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { useBetterMe } from '../../services/serviceContext';
import { useAuth } from '../../services/authContext';

export const DevDataBanner: React.FC = () => {
  const { backendProvider } = useBetterMe();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const isSupabaseActive = backendProvider === 'supabase' && user;

  return (
    <aside
      aria-label="Database and privacy environment details"
      className={`${
        isSupabaseActive ? 'bg-[#F1F6F3] border-[#DCE8DF]' : 'bg-[#F7F4EE] border-[#EBE4D8]'
      } border-b text-xs text-[#5C554C] transition-all`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {isSupabaseActive ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E2EFE5] text-[#2F5238] font-semibold text-[11px] tracking-wide uppercase">
              <CheckCircle2 className="w-3 h-3 text-[#3E6C4A]" />
              Supabase Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#EDE7DB] text-[#4F473E] font-semibold text-[11px] tracking-wide uppercase">
              <Database className="w-3 h-3 text-[#7D7060]" />
              Session Local Mode
            </span>
          )}

          <span className="hidden sm:inline text-[#7D7264]">•</span>
          <span className="text-[#685F53]">
            {isSupabaseActive
              ? `Authenticated as ${user?.email}. Habits, Logs, Moods, Journals, and Traits are stored live in Supabase with Row Level Security.`
              : 'Sign in to access your Supabase records.'}
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="shrink-0 flex items-center gap-1 text-[#6F6457] hover:text-[#2D2A26] font-medium py-0.5 px-2 rounded hover:bg-[#EDE6DB] transition-colors"
        >
          <span>{isExpanded ? 'Hide Info' : 'Security & Architecture'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3 pt-1 border-t border-[#EAE3D6] grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-[#6E6356]">
          <div className="flex items-start gap-2 bg-[#F2EDE3] p-2.5 rounded-xl">
            <ShieldAlert className="w-4 h-4 text-[#8C765C] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#403931]">Row-Level Security (RLS)</p>
              <p className="mt-0.5">
                Every query to PostgreSQL passes your authenticated JWT token. Only records matching <code className="font-mono">auth.uid() = user_id</code> can be accessed.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-[#F2EDE3] p-2.5 rounded-xl">
            <Info className="w-4 h-4 text-[#8C765C] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#403931]">Strict In-Memory Journaling</p>
              <p className="mt-0.5">
                Private journal reflections are held securely in application memory during your session and are never saved to unencrypted localStorage.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-[#F2EDE3] p-2.5 rounded-xl">
            <Database className="w-4 h-4 text-[#8C765C] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#403931]">Real Supabase CRUD</p>
              <p className="mt-0.5">
                Traits are created, updated, archived, and deleted directly on your remote Supabase instance (<code className="font-mono text-[10px]">itxrxgubsvxhcjscjphy.supabase.co</code>).
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
