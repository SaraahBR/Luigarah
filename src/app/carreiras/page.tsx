"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { RiUserStarLine, RiPencilRulerLine, RiCodeLine, RiSearchEyeLine } from "react-icons/ri";

export default function CarreirasPage() {
  const t = useTranslations("carreiras");
  const s = (c: React.ReactNode) => <span className="font-semibold">{c}</span>;
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Hero Section */}
      <motion.section 
        className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative inline-block"
          >
            <h1 
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6"
              style={{
                fontFamily: "'Playfair Display', 'Times New Roman', serif",
                letterSpacing: '0.1em',
              }}
            >
              {t("title")}
            </h1>
            <div className="shimmer-line h-[2px] mx-auto mb-8" />
          </motion.div>
          
          <motion.p 
            className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
            style={{ fontFamily: "'Playfair Display', 'Times New Roman', serif" }}
            {...fadeInUp}
            transition={{ delay: 0.4 }}
          >
            {t("tagline")}
          </motion.p>
        </div>
      </motion.section>

      {/* Oportunidades - deve vir antes das histórias */}
      <motion.section 
        className="py-16 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl font-light text-center text-gray-900 mb-12"
            {...fadeInUp}
          >
            {t.rich("opportunitiesTitle", { s })}
          </motion.h2>

          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                title: t("jobs.model.title"),
                description: t("jobs.model.description"),
                icon: RiUserStarLine
              },
              {
                title: t("jobs.designer.title"),
                description: t("jobs.designer.description"),
                icon: RiPencilRulerLine
              },
              {
                title: t("jobs.developer.title"),
                description: t("jobs.developer.description"),
                icon: RiCodeLine
              },
              {
                title: t("jobs.analyst.title"),
                description: t("jobs.analyst.description"),
                icon: RiSearchEyeLine
              }
            ].map((job, index) => {
              const IconComponent = job.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center"
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <div className="text-gray-900 mb-4 flex justify-center">
                    <IconComponent size={48} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{job.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{job.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

  {/* História 1: José Antonio - O Modelo que Quebrou Barreiras */}
      <motion.section 
        className="py-16 px-4 sm:px-6 lg:px-8 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="grid md:grid-cols-2 gap-12 items-center"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div 
              variants={scaleIn}
              className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl order-2 md:order-1"
            >
              <Image
                src="/Home.png"
                alt={t("stories.jose.alt")}
                fill
                className="object-cover"
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="order-1 md:order-2">
              <h2 className="text-4xl font-light text-gray-900 mb-6">
                José <span className="font-semibold">Antonio</span>
              </h2>
              <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">{t("stories.jose.role")}</p>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>{t("stories.jose.p1")}</p>
                <p>{t("stories.jose.p2")}</p>
                <p className="italic text-gray-700 border-l-4 border-gray-900 pl-4">
                  &ldquo;{t("stories.jose.quote")}&rdquo; - José Antonio
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* História 2: Rafael - O Designer que Revolucionou o Digital */}
      <motion.section 
        className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="grid md:grid-cols-2 gap-12 items-center"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <h2 className="text-4xl font-light text-gray-900 mb-6">
                Rafael <span className="font-semibold">Mendes</span>
              </h2>
              <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">{t("stories.rafael.role")}</p>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>{t("stories.rafael.p1")}</p>
                <p>{t("stories.rafael.p2")}</p>
                <p className="italic text-gray-700 border-l-4 border-gray-900 pl-4">
                  &ldquo;{t("stories.rafael.quote")}&rdquo; - Rafael Mendes
                </p>
              </div>
            </motion.div>

            <motion.div 
              variants={scaleIn}
              className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl"
            >
              <Image
                src="/Desfile_de_Moda_Luxuoso.png"
                alt={t("stories.rafael.alt")}
                fill
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* História 3: Maria - A Costureira que Preserva a Arte */}
      <motion.section 
        className="py-16 px-4 sm:px-6 lg:px-8 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="grid md:grid-cols-2 gap-12 items-center"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div 
              variants={scaleIn}
              className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl order-2 md:order-1"
            >
              <Image
                src="/Costureira_Albina.png"
                alt={t("stories.maria.alt")}
                fill
                className="object-cover"
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="order-1 md:order-2">
              <h2 className="text-4xl font-light text-gray-900 mb-6">
                Maria <span className="font-semibold">Rodrigues</span>
              </h2>
              <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">{t("stories.maria.role")}</p>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>{t("stories.maria.p1")}</p>
                <p>{t("stories.maria.p2")}</p>
                <p>{t("stories.maria.p3")}</p>
                <p className="italic text-gray-700 border-l-4 border-gray-900 pl-4">
                  &ldquo;{t("stories.maria.quote")}&rdquo; - Maria Rodrigues
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* História 4: Lady Steffany - Sub Diretora Fashion */}
      <motion.section 
        className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="grid md:grid-cols-2 gap-12 items-center"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <h2 className="text-4xl font-light text-gray-900 mb-6">
                Lady <span className="font-semibold">Steffany</span>
              </h2>
              <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">{t("stories.steffany.role")}</p>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>{t("stories.steffany.p1")}</p>
                <p>{t("stories.steffany.p2")}</p>
                <p className="italic text-gray-700 border-l-4 border-gray-900 pl-4">
                  &ldquo;{t("stories.steffany.quote")}&rdquo; - Lady Steffany
                </p>
              </div>
            </motion.div>

            <motion.div 
              variants={scaleIn}
              className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl"
            >
              <Image
                src="/Drag_Queen_Luxuosa.png"
                alt={t("stories.steffany.alt")}
                fill
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* História 5: Irmãos Estilosos - Arquitetos Alternativos */}
      <motion.section 
        className="py-16 px-4 sm:px-6 lg:px-8 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="grid md:grid-cols-2 gap-12 items-center"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div 
              variants={scaleIn}
              className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl order-2 md:order-1"
            >
              <Image
                src="/Irmãos_Estilosos.png"
                alt={t("stories.irmaos.alt")}
                fill
                className="object-cover"
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="order-1 md:order-2">
              <h2 className="text-4xl font-light text-gray-900 mb-6">
                {t.rich("stories.irmaos.name", { s })}
              </h2>
              <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">{t("stories.irmaos.role")}</p>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>{t("stories.irmaos.p1")}</p>
                <p>{t("stories.irmaos.p2")}</p>
                <p className="italic text-gray-700 border-l-4 border-gray-900 pl-4">
                  &ldquo;{t("stories.irmaos.quote")}&rdquo;
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section 
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-4xl sm:text-5xl font-light mb-6"
            {...fadeInUp}
          >
            {t.rich("ctaTitle", { s })}
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-300 mb-10"
            {...fadeInUp}
            transition={{ delay: 0.2 }}
          >
            {t("ctaText")}
          </motion.p>
          <motion.div
            className="inline-block bg-white/10 backdrop-blur-sm text-white px-10 py-4 rounded-full font-semibold text-lg border border-white/20"
            {...fadeInUp}
            transition={{ delay: 0.4 }}
          >
            {t("ctaBadge")}
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
