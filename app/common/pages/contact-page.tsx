import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LandingLayout } from '~/common/layouts/landing-layout';

export default function ContactPage() {
  const { t } = useTranslation('contact');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            {isHydrated ? t('title') : '문의하기'}
          </h1>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            {isHydrated
              ? t('subtitle')
              : '궁금한 점이나 제안사항이 있으시면 언제든지 연락해주세요'}
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            {/* 연락처 정보 */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">
                  {isHydrated ? t('contact_info.title') : '연락처 정보'}
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary">📧</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {isHydrated ? t('contact_info.email.title') : '이메일'}
                      </h3>
                      <p className="text-muted-foreground">
                        {isHydrated
                          ? t('contact_info.email.value')
                          : 'noah@surecrm.pro'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isHydrated
                          ? t('contact_info.email.note')
                          : '평일 9시-18시 내 답변'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary">🏢</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {isHydrated
                          ? t('contact_info.business.title')
                          : '사업자 정보'}
                      </h3>
                      <p className="text-muted-foreground">
                        {isHydrated
                          ? t('contact_info.business.name')
                          : 'SureCRM'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isHydrated
                          ? t('contact_info.business.description')
                          : '보험설계사 전용 CRM 솔루션'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary">⏰</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {isHydrated
                          ? t('contact_info.support_hours.title')
                          : '지원 시간'}
                      </h3>
                      <p className="text-muted-foreground">
                        {isHydrated
                          ? t('contact_info.support_hours.hours')
                          : '평일 09:00 - 18:00'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isHydrated
                          ? t('contact_info.support_hours.note')
                          : '주말 및 공휴일 제외'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 문의 양식 */}
            <div className="bg-card rounded-lg p-8 border">
              <h2 className="text-2xl font-bold mb-6">
                {isHydrated ? t('form.title') : '문의 양식'}
              </h2>

              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {isHydrated ? t('form.fields.name.label') : '이름'} *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder={
                      isHydrated
                        ? t('form.fields.name.placeholder')
                        : '성함을 입력해주세요'
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {isHydrated ? t('form.fields.email.label') : '이메일'} *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder={
                      isHydrated
                        ? t('form.fields.email.placeholder')
                        : '이메일 주소를 입력해주세요'
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {isHydrated ? t('form.fields.company.label') : '회사명'}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder={
                      isHydrated
                        ? t('form.fields.company.placeholder')
                        : '회사명을 입력해주세요'
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {isHydrated
                      ? t('form.fields.inquiry_type.label')
                      : '문의 유형'}
                  </label>
                  <select className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="">
                      {isHydrated
                        ? t('form.fields.inquiry_type.placeholder')
                        : '문의 유형을 선택해주세요'}
                    </option>
                    <option value="demo">
                      {isHydrated
                        ? t('form.fields.inquiry_type.options.demo')
                        : '데모 요청'}
                    </option>
                    <option value="pricing">
                      {isHydrated
                        ? t('form.fields.inquiry_type.options.pricing')
                        : '요금 문의'}
                    </option>
                    <option value="support">
                      {isHydrated
                        ? t('form.fields.inquiry_type.options.support')
                        : '기술 지원'}
                    </option>
                    <option value="partnership">
                      {isHydrated
                        ? t('form.fields.inquiry_type.options.partnership')
                        : '파트너십'}
                    </option>
                    <option value="other">
                      {isHydrated
                        ? t('form.fields.inquiry_type.options.other')
                        : '기타'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {isHydrated ? t('form.fields.message.label') : '메시지'} *
                  </label>
                  <textarea
                    required
                    rows={5}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder={
                      isHydrated
                        ? t('form.fields.message.placeholder')
                        : '문의 내용을 자세히 적어주세요'
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  {isHydrated ? t('form.submit') : '문의 보내기'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
