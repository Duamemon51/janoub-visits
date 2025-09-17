'use client';

import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { useI18n } from '@/i18n/LanguageProvider';

export default function Footer() {
  const { t, dir, locale } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white mt-12" dir={dir} lang={locale}>
      {/* Top Section */}
      <div className="page-container px-4 md:px-8 py-8 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Newsletter */}
          <div className={`text-center ${dir === 'rtl' ? 'md:text-right' : 'md:text-left'}`}>
            <h3 className="text-[18px] font-semibold mb-3 text-[#4B4B4B]">
              {t('footer.newsletter.title')}
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-stretch sm:max-w-md sm:mx-auto md:mx-0 gap-3 sm:gap-0">
              <input
                type="email"
                placeholder={t('footer.newsletter.placeholder')}
                className="
                  border border-gray-300 px-4 py-2 w-full focus:outline-none
                  text-[14px] text-[#4B4B4B] placeholder-[#8C8C8C]
                  rounded-lg sm:rounded-s-lg sm:rounded-e-none
                "
                style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}
              />
              <button
                className="
                  bg-[#56008D] text-white px-6 py-2 text-[14px] font-medium
                  rounded-lg sm:rounded-e-lg sm:rounded-s-none
                "
              >
                {t('footer.newsletter.cta')}
              </button>
            </div>
          </div>

          {/* App Download */}
          <div className={`text-center ${dir === 'rtl' ? 'md:text-right' : 'md:text-left'}`}>
            <h3 className="text-[18px] font-semibold mb-3 text-[#4B4B4B]">
              {t('footer.download.title')}
            </h3>
            <div className={`flex flex-wrap items-center ${dir === 'rtl' ? 'md:justify-start' : 'md:justify-start'} justify-center gap-4`}>
              <img src="/AG.png" alt={t('footer.download.appGalleryAlt')} className="h-10 w-auto" />
              <img src="/AS.png" alt={t('footer.download.appStoreAlt')} className="h-10 w-auto" />
              <img src="/GP.png" alt={t('footer.download.googlePlayAlt')} className="h-10 w-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="page-container px-4 md:px-8 py-8 text-[14px] text-[#4B4B4B]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0">
          {/* Logos */}
          <div className="pt-6 sm:pt-0 text-center lg:text-start">
            <img src="/logo.png" alt={t('common.brand')} className="h-12 w-auto mx-auto lg:mx-0 mb-4" />
            <img src="/logo1.png" alt={t('footer.partnerAlt')} className="h-8 w-auto mx-auto lg:mx-0" />
          </div>

          {/* Contact */}
          <div className={`pt-6 sm:pt-0 text-center ${dir === 'rtl' ? 'sm:text-right' : 'sm:text-left'} leading-relaxed`}>
            <h4 className="font-semibold mb-3 text-[15px] text-[#4B4B4B]">{t('footer.contact.title')}</h4>
            <ul className="space-y-3">
              <li className="flex items-center justify-center sm:justify-start gap-2">
                <MapPin size={18} className="shrink-0" />
                <span>{t('footer.contact.address')}</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-2">
                <Phone size={18} className="shrink-0" />
                <a href="tel:+9788888888" dir="ltr" className="hover:text-[#56008D]">
                  +97 888 8888
                </a>
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-2">
                <Mail size={18} className="shrink-0" />
                <a href="mailto:info@tafreeh.com" dir="ltr" className="hover:text-[#56008D]">
                  info@tafreeh.com
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className={`pt-6 sm:pt-0 text-center ${dir === 'rtl' ? 'sm:text-right' : 'sm:text-left'}`}>
            <h4 className="font-semibold mb-3 text-[15px] text-[#4B4B4B]">{t('footer.quick.title')}</h4>
            <ul className="space-y-2">
              <li><a href="/" className="hover:text-[#56008D]">{t('footer.quick.links.home')}</a></li>
              <li><a href="/about" className="hover:text-[#56008D]">{t('footer.quick.links.about')}</a></li>
              <li><a href="/destinations" className="hover:text-[#56008D]">{t('footer.quick.links.destinations')}</a></li>
              <li><a href="/events" className="hover:text-[#56008D]">{t('footer.quick.links.events')}</a></li>
              <li><a href="/bookings" className="hover:text-[#56008D]">{t('footer.quick.links.bookings')}</a></li>
              <li><a href="/contact" className="hover:text-[#56008D]">{t('footer.quick.links.contact')}</a></li>
            </ul>
          </div>

          {/* Social */}
          <div className={`pt-6 sm:pt-0 text-center ${dir === 'rtl' ? 'sm:text-right' : 'sm:text-left'}`}>
            <h4 className="font-semibold mb-3 text-[15px] text-[#4B4B4B]">{t('footer.social.title')}</h4>
            <div className="flex justify-center sm:justify-start gap-3 text-[#56008D]">
              <a href="#" aria-label={t('footer.social.facebook')} className="p-2 rounded-full hover:bg-[#56008D]/10"><Facebook size={20} /></a>
              <a href="#" aria-label={t('footer.social.twitter')} className="p-2 rounded-full hover:bg-[#56008D]/10"><Twitter size={20} /></a>
              <a href="#" aria-label={t('footer.social.instagram')} className="p-2 rounded-full hover:bg-[#56008D]/10"><Instagram size={20} /></a>
              <a href="#" aria-label={t('footer.social.youtube')} className="p-2 rounded-full hover:bg-[#56008D]/10"><Youtube size={20} /></a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#56008D] text-white text-center py-3 text-[14px]">
        © {year} {t('common.brand')} — {t('footer.bottom.rights')}
      </div>
    </footer>
  );
}
