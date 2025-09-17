'use client';
import { useI18n } from '@/i18n/LanguageProvider';

export default function LanguageSwitch() {
  const { locale, setLocale, t } = useI18n();
  return (
    <div className="flex gap-2">
      <button
        onClick={() => setLocale('ar')}
        className={`px-4 py-2 rounded ${locale==='ar' ? 'bg-purple-700 text-white' : 'border'} `}
      >
        {t('common.arabic')}
      </button>
      <button
        onClick={() => setLocale('en')}
        className={`px-4 py-2 rounded ${locale==='en' ? 'bg-purple-700 text-white' : 'border'} `}
      >
        {t('common.english')}
      </button>
    </div>
  );
}
