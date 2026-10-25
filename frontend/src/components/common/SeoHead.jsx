import React, { useEffect } from 'react';

/**
 * Dynamic SEO Head Component
 * Dynamically synchronizes document title, meta tags, and Schema.org JSON-LD structured data
 * based on live profile biodata from the API.
 */
export default function SeoHead({ biodata }) {
  useEffect(() => {
    if (!biodata) return;

    const name = biodata.name || 'Bayu Prastyo';
    const nickname = biodata.nickname || 'baydev';
    const titleRole = biodata.title || biodata.role || 'Full-Stack Web & Mobile Engineer';
    const location = biodata.location || 'Yogyakarta / Karanganyar';
    const rawAvatar = biodata.avatar || '/images/avatar.png';
    const avatar = rawAvatar.startsWith('http') ? rawAvatar : `${window.location.origin}${rawAvatar}`;
    const bioText =
      biodata.hero_subheadline ||
      biodata.about ||
      'Full-stack software engineer & web programmer spesialis Laravel 13, PostgreSQL 17, ReactJS, Next.js, dan Docker homelab.';

    // 1. Dynamic Document Title
    const pageTitle = `${name} (${nickname} / bayukun / masbay) | ${titleRole}`;
    document.title = pageTitle;

    // Helper to safely set or create meta tag
    const setMetaTag = (attributeName, attributeValue, content) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Primary Meta Tags
    setMetaTag('name', 'title', pageTitle);
    setMetaTag(
      'name',
      'description',
      `Portofolio resmi ${name} (${nickname} / bayukun / masbay). ${bioText} Berlokasi di ${location}.`
    );
    setMetaTag('name', 'author', `${name} (${nickname})`);
    setMetaTag(
      'name',
      'keywords',
      'bayu prastyo, baydev, bayukun, masbay, bayukun28, bayu prastyo developer, bayu prastyo programmer, web developer yogyakarta, programmer karanganyar, full stack developer indonesia, reactjs laravel developer, jasa pembuatan website aplikasi'
    );

    // 3. OpenGraph Tags
    setMetaTag('property', 'og:title', pageTitle);
    setMetaTag('property', 'og:description', bioText);
    setMetaTag('property', 'og:image', avatar);
    setMetaTag('property', 'og:url', 'https://baydev.my.id/');
    setMetaTag('property', 'og:type', 'profile');

    // 4. Twitter Tags
    setMetaTag('name', 'twitter:title', pageTitle);
    setMetaTag('name', 'twitter:description', bioText);
    setMetaTag('name', 'twitter:image', avatar);
    setMetaTag('name', 'twitter:card', 'summary_large_image');

    // 5. Dynamic Schema.org JSON-LD
    const schemaId = 'dynamic-seo-jsonld';
    let scriptTag = document.getElementById(schemaId);
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = schemaId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const socialUrls = [
      biodata.socials?.github || biodata.github || 'https://github.com/BayuKun28',
      biodata.socials?.facebook || biodata.facebook || 'https://www.facebook.com/bhayou.bluedevil/',
      biodata.socials?.twitter || biodata.twitter || 'https://x.com/namedbay33',
      biodata.socials?.instagram || biodata.instagram || 'https://www.instagram.com/bayukun_28/',
      'https://info.baydev.my.id',
    ].filter(Boolean);

    const schemaData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Person',
          '@id': 'https://baydev.my.id/#person',
          name: name,
          alternateName: [
            nickname,
            'bayukun',
            'masbay',
            'BayuKun28',
            'Bayu Prastyo Dev',
            'baydev.my.id',
          ],
          givenName: 'Bayu',
          familyName: 'Prastyo',
          gender: 'Male',
          jobTitle: titleRole,
          description: bioText,
          url: 'https://baydev.my.id',
          image: avatar,
          email: biodata.email ? `mailto:${biodata.email}` : 'mailto:bayukundev@gmail.com',
          telephone: biodata.phone ? `+62${biodata.phone.replace(/^0/, '')}` : '+628991907216',
          address: {
            '@type': 'PostalAddress',
            addressLocality: location,
            addressCountry: 'ID',
          },
          sameAs: socialUrls,
          knowsAbout: [
            'Full-Stack Web Development',
            'ReactJS & Next.js',
            'Laravel Framework',
            'PostgreSQL Database Architecture',
            'Docker Homelab Orchestration',
            'REST API Architecture',
            'Tailwind CSS Neubrutalism Design',
          ],
        },
        {
          '@type': 'WebSite',
          '@id': 'https://baydev.my.id/#website',
          url: 'https://baydev.my.id',
          name: `${name} (${nickname}) | Portofolio Resmi`,
          alternateName: `Portofolio ${name} (baydev / bayukun / masbay)`,
          description: bioText,
          inLanguage: 'id-ID',
          publisher: {
            '@id': 'https://baydev.my.id/#person',
          },
        },
        {
          '@type': 'ProfilePage',
          '@id': 'https://baydev.my.id/#webpage',
          url: 'https://baydev.my.id',
          name: `Profil & Portofolio ${name} (${nickname})`,
          isPartOf: {
            '@id': 'https://baydev.my.id/#website',
          },
          about: {
            '@id': 'https://baydev.my.id/#person',
          },
          mainEntity: {
            '@id': 'https://baydev.my.id/#person',
          },
        },
      ],
    };

    scriptTag.text = JSON.stringify(schemaData);
  }, [biodata]);

  return null; // Head-only component
}
