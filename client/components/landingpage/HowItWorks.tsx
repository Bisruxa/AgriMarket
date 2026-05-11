'use client'
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { useTranslations } from '@/components/hooks/useTranlations';
import { useLanguage } from '@/app/context/LanguageContext';
import { Brain, Map, Handshake } from 'lucide-react';

const HowItWorks = () => {
  const t = useTranslations();
  const { language } = useLanguage();
  const containerRef = useRef(null);
  const headingRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const stepAnimations = [
    {
      rotate: useSpring(useTransform(smoothProgress, [0, 0.15, 0.85, 1], [0, 2, -2, 0]), { stiffness: 50, damping: 20 }),
      scale: useTransform(smoothProgress, [0, 0.225], [0.95, 1]),
      dotScale: useTransform(smoothProgress, [0.9, 1], [0, 1])
    },
    {
      rotate: useSpring(useTransform(smoothProgress, [0.25, 0.4, 0.6, 0.75], [0, 2, -2, 0]), { stiffness: 50, damping: 20 }),
      scale: useTransform(smoothProgress, [0.25, 0.475], [0.95, 1]),
      dotScale: useTransform(smoothProgress, [1.15, 1.25], [0, 1])
    },
    {
      rotate: useSpring(useTransform(smoothProgress, [0.5, 0.65, 0.85, 1], [0, 2, -2, 0]), { stiffness: 50, damping: 20 }),
      scale: useTransform(smoothProgress, [0.5, 0.725], [0.95, 1]),
      dotScale: useTransform(smoothProgress, [1.4, 1.5], [0, 1])
    },
    {
      rotate: useSpring(useTransform(smoothProgress, [0.75, 0.9, 1.1, 1.25], [0, 2, -2, 0]), { stiffness: 50, damping: 20 }),
      scale: useTransform(smoothProgress, [0.75, 0.975], [0.95, 1]),
      dotScale: null
    }
  ];

  const steps = [
    {
      title: t.howItWorks.steps.signup,
      description: t.howItWorks.stepDescriptions.signup,
      link: "/signup",
      image: "/potato.jpg"
    },
    {
      title: t.howItWorks.steps.addFarm,
      description: t.howItWorks.stepDescriptions.addFarm,
      link: "/signup",
      image: "/corn.jpg"
    },
    {
      title: t.howItWorks.steps.getInsights,
      description: t.howItWorks.stepDescriptions.getInsights,
      link: "/signup",
      image: "/onions.jpg"
    },
    {
      title: t.howItWorks.steps.connectGrow,
      description: t.howItWorks.stepDescriptions.connectGrow,
      icon: <Handshake className="text-[#5B8C51]" size={48} />,
      link: "/signup",
      image: "/Crop.jpg"
    },
  ];

  return (
    <section 
      ref={containerRef}
      className={`relative py-20 px-6 md:px-12 bg-gray-200 ${language === 'am' ? 'amharic' : ''}`}
    >
      <div className="max-w-6xl mx-auto">

        {/* Main Heading - simpler entrance animation */}
        <motion.div 
          ref={headingRef}
          className="mb-20"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p className="text-sm tracking-widest text-black uppercase mb-3">
            A Simple Process
          </p>

          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900">
            How <span className="text-[#4A7342]">AgriMarket</span> Works.
          </h2>

          <motion.p 
            className="mt-6 max-w-2xl text-gray-700 text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {t.howItWorks.description}
          </motion.p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-24 relative">
          {/* Drawing line SVG with smooth animation */}
          <svg
            className="absolute left-1/2 top-0 w-0.5 h-full transform -translate-x-1/2 hidden md:block"
            style={{ zIndex: 0 }}
          >
            <motion.line
              x1="50%"
              y1="0"
              x2="50%"
              y2="100%"
              stroke="#668B57"
              strokeWidth="3"
              strokeDasharray="8 8"
              style={{
                pathLength: smoothProgress
              }}
              transition={{ duration: 0.1 }}
            />
          </svg>

          {steps.map((step, index) => {
            const animations = stepAnimations[index];
            return (
              <motion.div
                key={index}
                className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
              >
                
                {/* Connecting line dots with smooth scale */}
                {index < steps.length - 1 && animations.dotScale && (
                  <motion.div
                    className="absolute left-1/2 bottom-0 w-4 h-4 bg-[#668B57] rounded-full transform -translate-x-1/2 translate-y-1/2 hidden md:block"
                    style={{
                      scale: animations.dotScale
                    }}
                  />
                )}
                
                {/* Image with smooth rotation */}
                <motion.div 
                  className={`${index % 2 !== 0 ? 'md:order-2' : ''}`}
                  style={{
                    rotate: animations.rotate,
                    scale: animations.scale
                  }}
                >
                  <motion.div 
                    className="relative w-full h-87.5 border-8 border-white overflow-hidden shadow-xl rounded-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {step.icon ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        {step.icon}
                      </div>
                    ) : (
                      <Image
                        src={step.image}
                        alt={step.title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </motion.div>
                </motion.div>


                {/* Text content */}
                <div className={`${index % 2 !== 0 ? 'md:order-1' : ''}`}>
                  <div className="relative">
                    {/* Step number */}
                    <motion.div 
                      className="relative inline-block"
                      initial={{ opacity: 0, x: -15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      <p className="text-sm font-bold text-[#4A7342] mb-3 relative z-10">
                        {`0${index + 1}.`}
                      </p>
                      <motion.div
                        className="absolute bottom-0 left-0 h-0.5 bg-[#668B57]"
                        initial={{ width: "0%" }}
                        whileInView={{ width: "100%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.2, ease: "easeInOut" }}
                      />
                    </motion.div>

                    <motion.h3 
                      className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3"
                      initial={{ x: -15, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                    >
                      {step.title}
                    </motion.h3>

                    <motion.p 
                      className="text-gray-700 leading-relaxed mb-6"
                      initial={{ x: -15, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                    >
                      {step.description}
                    </motion.p>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div 
          className="mt-24 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Link href="/signup">
            <motion.button 
              className="px-10 py-4 bg-[#668B57] text-white font-semibold cursor-pointer relative overflow-hidden rounded-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <motion.span
                className="absolute inset-0 bg-white"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{ opacity: 0.2 }}
              />
              <span className="relative z-10">{t.howItWorks.cta}</span>
            </motion.button>
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

export default HowItWorks;
