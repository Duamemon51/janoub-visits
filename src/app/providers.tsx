'use client';

import { AuthProvider } from "@/context/AuthProvider";

import { LanguageProvider } from '@/i18n/LanguageProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </LanguageProvider>
  );
}
