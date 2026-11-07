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

    // 1. Dynamic Document Title (Optimized 50-60 chars for Google SERP)
    const pageTitle = `${name} (${nickname}) | Full-Stack Software Engineer`;
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

    // 2. Primary Meta Tags (Optimized 150-160 chars description)
    const metaDescription =
      biodata.meta_description ||
      `Portofolio resmi ${name} (${nickname}). Full-Stack Software Engineer 7+ tahun pengalaman spesialis Laravel, PostgreSQL, React, Next.js, dan Docker homelab.`;
    const ogImg = biodata.og_image
      ? (biodata.og_image.startsWith('http') ? biodata.og_image : `${window.location.origin}${biodata.og_image}`)
      : avatar;

    setMetaTag('name', 'title', pageTitle);
    setMetaTag('name', 'google-site-verification', 'xj3wGMsk9mIsj3kZghL6qIHOLt9I4wbMaQgk-4B9JK8');
    setMetaTag('name', 'description', metaDescription);
    setMetaTag('name', 'author', `${name} (${nickname})`);
    setMetaTag(
      'name',
      'keywords',
      'bayu prastyo, baydev, bayukun, masbay, bayukun28, bayu prastyo developer, bayu prastyo programmer, web developer yogyakarta, programmer karanganyar, full stack developer indonesia, reactjs laravel developer, jasa pembuatan website aplikasi, neubrutalism web design'
    );

    // 3. OpenGraph Tags
    setMetaTag('property', 'og:title', pageTitle);
    setMetaTag('property', 'og:description', metaDescription);
    setMetaTag('property', 'og:image', ogImg);
    setMetaTag('property', 'og:url', 'https://baydev.my.id/');
    setMetaTag('property', 'og:type', 'profile');

    // 4. Twitter Tags
    setMetaTag('name', 'twitter:title', pageTitle);
    setMetaTag('name', 'twitter:description', metaDescription);
    setMetaTag('name', 'twitter:image', ogImg);
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
        {
          '@type': 'ItemList',
          '@id': 'https://baydev.my.id/#navigation',
          name: 'Menu Navigasi Resmi baydev',
          itemListElement: [
            {
              '@type': 'SiteNavigationElement',
              position: 1,
              name: 'Tentang (About)',
              description: `Profil, latar belakang, dan riwayat profesional ${name} (${nickname})`,
              url: 'https://baydev.my.id/#about',
            },
            {
              '@type': 'SiteNavigationElement',
              position: 2,
              name: 'Layanan (Services)',
              description: 'Solusi rekayasa perangkat lunak, full-stack web, dan arsitektur database',
              url: 'https://baydev.my.id/#services',
            },
            {
              '@type': 'SiteNavigationElement',
              position: 3,
              name: 'Keahlian (Skills)',
              description: 'Tech stack arsenal: Laravel, PostgreSQL, React, Docker, Linux',
              url: 'https://baydev.my.id/#skills',
            },
            {
              '@type': 'SiteNavigationElement',
              position: 4,
              name: 'Portofolio (Showcase)',
              description: 'Showcase karya dan proyek aplikasi web & mobile skala produksi',
              url: 'https://baydev.my.id/#portfolio',
            },
            {
              '@type': 'SiteNavigationElement',
              position: 5,
              name: 'Sertifikasi (Certifications)',
              description: 'Sertifikasi kompetensi resmi, lisensi teknis, dan kredensial profesional',
              url: 'https://baydev.my.id/#certifications',
            },
            {
              '@type': 'SiteNavigationElement',
              position: 6,
              name: 'Kontak (Contact)',
              description: `Hubungi ${name} untuk konsultasi dan kolaborasi proyek`,
              url: 'https://baydev.my.id/#contact',
            },
          ],
        },
      ],
    };

    scriptTag.text = JSON.stringify(schemaData);
  }, [biodata]);

  return null; // Head-only component
}
