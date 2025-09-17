// src/components/CompleteGuideAseer.tsx
'use client';

import { useI18n } from '@/i18n/LanguageProvider';

export default function CompleteGuideAseer() {
  const { t, dir, locale } = useI18n();

  return (
    <div className="mt-20" dir={dir} lang={locale} style={{ color: 'initial' }}>
      <h2 className="text-[28px] md:text-[32px] font-bold text-black mb-10 mt-5">
        {t('guide.aseer.title')}
      </h2>

      <section className="px-4 md:px-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Weather */}
        <div className="border border-[#56008D] rounded-lg p-6 text-black">
          <h3 className="font-bold text-[16px] mb-4">{t('guide.aseer.weather.title')}</h3>
          <div className="flex items-center justify-between mb-2">
            <img src="/Vector5.png" alt={t('guide.aseer.weather.alt')} className="w-10 h-10" />
            <span className="text-[20px] font-bold">{t('guide.aseer.weather.temp')}</span>
            <span className="text-[12px] text-gray-500">{t('guide.aseer.weather.status')}</span>
          </div>
          <div className="mt-4 text-[12px] font-medium space-y-1">
            <div className="flex justify-between">
              <span>{t('guide.aseer.weather.seasons.winter.name')}</span>
              <span>{t('guide.aseer.weather.seasons.winter.range')}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('guide.aseer.weather.seasons.spring.name')}</span>
              <span>{t('guide.aseer.weather.seasons.spring.range')}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('guide.aseer.weather.seasons.summer.name')}</span>
              <span>{t('guide.aseer.weather.seasons.summer.range')}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('guide.aseer.weather.seasons.autumn.name')}</span>
              <span>{t('guide.aseer.weather.seasons.autumn.range')}</span>
            </div>
          </div>
        </div>

        {/* Transport */}
        <div className="border border-[#56008D] rounded-lg p-6 text-black">
          <h3 className="font-bold text-[16px] mb-4">{t('guide.aseer.transport.title')}</h3>
          <ul className="space-y-3 text-[13px]">
            <li className="flex items-start gap-2">
              <img src="/Vector6.png" alt={t('guide.aseer.transport.items.0.alt')} className="w-5 h-5" />
              {t('guide.aseer.transport.items.0.text')}
            </li>
            <li className="flex items-start gap-2">
              <img src="/Vector4.png" alt={t('guide.aseer.transport.items.1.alt')} className="w-5 h-5" />
              {t('guide.aseer.transport.items.1.text')}
            </li>
            <li className="flex items-start gap-2">
              <img src="/vector3.png" alt={t('guide.aseer.transport.items.2.alt')} className="w-5 h-5" />
              {t('guide.aseer.transport.items.2.text')}
            </li>
          </ul>
          <p className="mt-3 text-[12px] font-semibold" style={{ color: '#56008D', cursor: 'pointer' }}>
            {t('guide.aseer.transport.more')}
          </p>
        </div>

        {/* City Guide */}
        <div className="border border-[#56008D] rounded-lg p-6 flex flex-col justify-between text-black">
          <div>
            <h3 className="font-bold text-[16px] mb-4">{t('guide.aseer.city.title')}</h3>
            <p className="text-[13px] leading-relaxed">
              {t('guide.aseer.city.body')}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 cursor-pointer">
            <img src="/Vector2.png" alt={t('guide.aseer.city.downloadAlt')} className="w-5 h-5" />
            <span className="text-[12px] font-semibold" style={{ color: '#56008D' }}>
              {t('guide.aseer.city.download')}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
