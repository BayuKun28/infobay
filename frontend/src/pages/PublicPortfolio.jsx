import React, { useEffect, useState } from 'react';
import { Navbar, Footer } from '../components/layout';
import Marquee from '../components/public/Marquee';
import Hero from '../components/public/Hero';
import About from '../components/public/About';
import Services from '../components/public/Services';
import Skills from '../components/public/Skills';
import Portfolio from '../components/public/Portfolio';
import Testimonials from '../components/public/Testimonials';
import Certifications from '../components/public/Certifications';
import Contact from '../components/public/Contact';
import { SeoHead, FloatingScrollTop } from '../components/common';
import { getPublicProfile } from '../services';
import { defaultProfileData } from '../data/profileData';
import { useTheme } from '../hooks';

export default function PublicPortfolio() {
  const { themeMode, isDark, toggleThemeMode } = useTheme();
  const [data, setData] = useState(defaultProfileData);
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const result = await getPublicProfile();
        if (isMounted) {
          setData(result);
          setIsLiveApi(result.isLiveApi);
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFDF0] dark:bg-[#0B0F19] text-black dark:text-[#F8FAFC] flex flex-col selection:bg-neo-yellow selection:text-black transition-colors duration-150">
      {/* Dynamic SEO Meta & Structured Data */}
      <SeoHead biodata={data?.biodata} />

      {/* Navigation */}
      <Navbar
        isLiveApi={isLiveApi}
        themeMode={themeMode}
        toggleThemeMode={toggleThemeMode}
      />

      {/* Marquee Banner with dynamic items */}
      <Marquee items={data?.biodata?.marquee_items} />

      {/* Hero Section */}
      <Hero biodata={data?.biodata} />

      {/* About Section */}
      <About
        biodata={data?.biodata}
        education={data?.education}
        experience={data?.experience}
      />

      {/* Services Section */}
      <Services services={data?.services} />

      {/* Skills Section */}
      <Skills skills={data?.skills} techStack={data?.techStack} />

      {/* Portfolio Showcase Section */}
      <Portfolio portfolios={data?.portfolios} />

      {/* Testimonials Section */}
      <Testimonials testimonials={data?.testimonials} />

      {/* Certifications Section */}
      <Certifications certifications={data?.certifications} />

      {/* Contact Section */}
      <Contact biodata={data?.biodata} />

      {/* Footer */}
      <Footer biodata={data?.biodata} />

      {/* Floating Scroll To Top Button */}
      <FloatingScrollTop />
    </div>
  );
}
