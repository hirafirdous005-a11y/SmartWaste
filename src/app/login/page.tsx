'use client';

import React, { Suspense } from 'react';
import { UnifiedLoginGate } from '@/components/auth/UnifiedLoginGate';
import { useSearchParams } from 'next/navigation';

function LoginContent() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role') as 'citizen' | 'worker' | 'admin' | null;
  const redirectParam = searchParams.get('redirect') || undefined;

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <UnifiedLoginGate
          defaultRole={roleParam || 'citizen'}
          onSuccessRedirect={redirectParam}
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center text-xs text-slate-400">
          Loading Authentication Gate...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

