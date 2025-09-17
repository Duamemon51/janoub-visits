'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/LanguageProvider';
import toast, { Toaster } from 'react-hot-toast';

interface SignUpForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUpPage() {
  const { t, dir, locale } = useI18n();
  const router = useRouter();

  const [form, setForm] = useState<SignUpForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatar(file);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (avatar) formData.append('avatar', avatar);

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Signup successful!');
        setTimeout(() => router.push('/signin'), 1500);
      } else {
        toast.error(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-screen h-screen relative overflow-hidden font-[Montserrat]"
      dir={dir}
      lang={locale}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: '8px', color: '#fff', fontWeight: '500' },
          success: { duration: 4000, style: { background: '#6C2BD9' } },
          error: { duration: 4000, style: { background: '#FF4D4F' } },
        }}
      />

      <img
        src="/signup.png"
        alt={t('auth.signUp.bgAlt')}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      <div className="absolute inset-0 bg-black/30 z-10" />

      <div className="relative z-20 w-full h-full flex items-center justify-between px-6 md:px-20">
        <div className="text-white max-w-[600px]">
          <h1 className="text-[36px] md:text-[48px] font-bold leading-tight mb-2">
            {t('auth.hero.title')}
          </h1>
          <p className="text-[18px] md:text-[20px]">
            {t('auth.signUp.subtitle')}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md w-[344px] p-4 md:p-4">
          <h2 className="text-[18px] font-semibold text-[#666666] mb-4">
            {t('auth.signUp.heading')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            <div className="flex gap-2">
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder={t('auth.signUp.firstName')}
                className="w-1/2 h-[40px] bg-[#F5F5F5] text-[#666666] placeholder-gray-400 border border-[#666666] px-3 rounded-md"
              />
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder={t('auth.signUp.lastName')}
                className="w-1/2 h-[40px] bg-[#F5F5F5] text-[#666666] placeholder-gray-400 border border-[#666666] px-3 rounded-md"
              />
            </div>

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              placeholder={t('auth.labels.emailPlaceholder')}
              className="w-full h-[40px] bg-[#F5F5F5] text-[#666666] placeholder-gray-400 border border-[#666666] px-3 rounded-md"
            />
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              type="password"
              placeholder={t('auth.signUp.password')}
              className="w-full h-[40px] bg-[#F5F5F5] text-[#666666] placeholder-gray-400 border border-[#666666] px-3 rounded-md"
            />
            <input
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              type="password"
              placeholder={t('auth.signUp.confirmPassword')}
              className="w-full h-[40px] bg-[#F5F5F5] text-[#666666] placeholder-gray-400 border border-[#666666] px-3 rounded-md"
            />

            
          

            <div className="flex items-start gap-2 text-[#666666] text-xs">
              <input type="checkbox" className="mt-1 accent-purple-700" />
              <p>
                {t('auth.signUp.agree1')}{' '}
                <a href="#" className="text-[#6C2BD9] underline">
                  {t('auth.signUp.terms')}
                </a>{' '}
                {t('auth.signUp.and')}{' '}
                <a href="#" className="text-[#6C2BD9] underline">
                  {t('auth.signUp.privacy')}
                </a>
              </p>
            </div>

            <button
              type="submit"
              className="w-full h-[40px] bg-[#6C2BD9] text-white font-medium rounded-md hover:bg-purple-800 transition"
              disabled={loading}
            >
              {loading ? 'Signing up...' : t('auth.signUp.submit')}
            </button>

            <p className="text-center text-xs text-[#666666]">
              {t('auth.signUp.haveAccount')}{' '}
              <a href="/signin" className="text-[#6C2BD9] font-medium underline">
                {t('auth.signUp.signIn')}
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
