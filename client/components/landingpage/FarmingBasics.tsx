'use client'
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from '../hooks/useTranlations';

const FarmingBasics = () => {
  const t = useTranslations();

  const farmingBasics = [
    {
      title: t.farmingBasics.items.cropSelection,
      description: t.farmingBasics.itemDescriptions.cropSelection,
    },
    {
      title: t.farmingBasics.items.weatherAwareness,
      description: t.farmingBasics.itemDescriptions.weatherAwareness,
    },
    {
      title: t.farmingBasics.items.marketTiming,
      description: t.farmingBasics.itemDescriptions.marketTiming,
    },
    {
      title: t.farmingBasics.items.profitOptimization,
      description: t.farmingBasics.itemDescriptions.profitOptimization,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      x: -50 
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  } as const;

  const textVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  } as const;

  const imageVariants = {
    hidden: { 
      opacity: 0, 
      x: 100,
      scale: 0.95,
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
        delay: 0.4,
      },
    },
  } as const ;

  const buttonVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 1,
      },
    },
    hover: {
      scale: 1.05,
      backgroundColor: "#c03534",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  
  return (
    <section className="w-full bg-gray-200">
      <div className="grid lg:grid-cols-2 min-h-150">

        <motion.div 
          className="px-6 md:px-16 py-16 flex flex-col justify-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.p 
            variants={textVariants}
            className="uppercase text-sm tracking-widest text-gray-700 mb-4"
          >
            Smart Agriculture Platform
          </motion.p>

          <motion.h2 
            variants={textVariants}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-8"
          >
            {t.farmingBasics.title}
          </motion.h2>

          <motion.p 
            variants={textVariants}
            className="text-gray-800 mb-10 max-w-xl leading-relaxed"
          >
            {t.farmingBasics.ctaDescription}
          </motion.p>

          <motion.div 
            className="space-y-4"
            variants={containerVariants}
          >
            {farmingBasics.map((item, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  x: 10,
                  transition: { type: "spring", stiffness: 400, damping: 17 }
                }}
              >
                <h3 className="font-bold text-lg text-gray-900">
                  {item.title}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.button 
            className="mt-10 w-fit px-6 py-3 bg-black text-[#e4e5ba]"
            whileHover="hover"
            whileTap="tap"
          >
            {t.farmingBasics.cta}
          </motion.button>

        </motion.div>

        <motion.div 
          className="relative flex items-start justify-center -mt-20 p-10 lg:p-0"
          variants={imageVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <Image
            src="/farmer2.jpg"
            alt="Smart Farming"
            width={600}
            height={1200}
            className="object-contain h-auto"
          />
        </motion.div>

      </div>
    </section>
  );
};

export default FarmingBasics;