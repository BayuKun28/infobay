import React, { useEffect, useState } from 'react';
import { Navbar, Footer } from '../components/layout';
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
import { analyticsService } from '../services/api';
import { defaultProfileData } from '../data/profileData';
import { useTheme } from '../hooks';

export default function PublicPortfolio() {
  const { themeMode, isDark, toggleThemeMode } = useTheme();
  const [data, setData] = useState(defaultProfileData);
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ensure page begins at top on fresh visit if no anchor hash is present
    if (typeof window !== 'undefined' && !window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    // Record privacy-first anonymous visit
    analyticsService.recordVisit();

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

      {/* Top Announcement Bar if configured in Biodata */}
      {data?.biodata?.announcement_bar && (
        <div className="bg-[#FFDE59] text-black border-b-2 border-black py-1.5 px-4 text-center font-mono font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 sticky top-0 z-50">
          <span>{data.biodata.announcement_bar}</span>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        isLiveApi={isLiveApi}
        themeMode={themeMode}
        toggleThemeMode={toggleThemeMode}
      />

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
      <Skills skills={data?.skills} techStack={data?.techStack} biodata={data?.biodata} />

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
