'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type FeatureItem = {
  title: string;
  description: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

export const SeoContent = () => {
  const { t } = useTranslation();

  const features = useMemo(
    () => t('seo.features.items', { returnObjects: true }) as FeatureItem[],
    [t],
  );

  const trustSignals = useMemo(
    () => t('seo.trust.items', { returnObjects: true }) as FeatureItem[],
    [t],
  );

  const faqItems = useMemo(
    () => t('seo.faq.items', { returnObjects: true }) as FaqItem[],
    [t],
  );

  return (
    <section className="sr-only" aria-label={t('seo.hero.title')}>
      <h1>{t('seo.hero.title')}</h1>
      <p>{t('seo.hero.description')}</p>
      <p>{t('seo.hero.cta')}</p>

      <h2>{t('seo.features.title')}</h2>
      <p>{t('seo.features.summary')}</p>
      <ul>
        {features.map((feature) => (
          <li key={feature.title}>
            <strong>{feature.title}</strong>
            <span> {feature.description}</span>
          </li>
        ))}
      </ul>

      <h2>{t('seo.trust.title')}</h2>
      <p>{t('seo.trust.summary')}</p>
      <ul>
        {trustSignals.map((item) => (
          <li key={item.title}>
            <strong>{item.title}</strong>
            <span> {item.description}</span>
          </li>
        ))}
      </ul>

      <h2>{t('seo.faq.title')}</h2>
      <dl>
        {faqItems.map((faq) => (
          <div key={faq.question}>
            <dt>{faq.question}</dt>
            <dd>{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
