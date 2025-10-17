"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa";
import { 
  RiLeafLine, 
  RiVipDiamondLine, 
  RiStarLine,
  RiTeamLine,
  RiHeartLine,
  RiEyeLine
} from "react-icons/ri";

export default function SobrePage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
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
                letterSpacing: '0.15em',
              }}
            >
              LUIGARAH
            </h1>
            <div className="shimmer-line h-[2px] mx-auto mb-8" />
          </motion.div>
          
          <motion.p 
            className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
            style={{ fontFamily: "'Playfair Display', 'Times New Roman', serif" }}
            {...fadeInUp}
            transition={{ delay: 0.4 }}
          >
            Onde luxo, exclusividade e elegância se encontram em cada detalhe
          </motion.p>
        </div>
      </motion.section>

      {/* Nossa História */}
      <motion.section 
        className="py-16 px-4 sm:px-6 lg:px-8"
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
                Nossa <span className="font-semibold">Essência</span>
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  A <strong>Luigarah</strong> é um projeto fictício desenvolvido para portfólio, 
                  inspirado nos melhores sites de moda de luxo do mundo, como <strong>Farfetch</strong>, 
                  <strong> Zara</strong> e <strong>Prada</strong>. 
                </p>
                <p>
                  Este site foi criado para demonstrar nossos talentos e habilidades em diversas áreas: 
                  <strong> UI/UX Design</strong>, <strong>Arte</strong>, <strong>Criatividade</strong>, 
                  <strong> Organização</strong> e <strong>Programação</strong>. Cada detalhe foi pensado 
                  para criar uma experiência visual sofisticada e funcional.
                </p>
                <p>
                  Desenvolvido com muito <strong>profissionalismo</strong>, <strong>carinho</strong> e 
                  <strong> estudo</strong>, o projeto Luigarah representa nossa paixão por criar 
                  interfaces elegantes e experiências digitais memoráveis no universo digital.
                </p>
              </div>
            </motion.div>

            <motion.div 
              variants={scaleIn}
              className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl bg-white flex items-center justify-center p-8"
            >
              <Image
                src="/logos/LUIGARA-LOGO.png"
                alt="Luigarah Luxury"
                fill
                className="object-contain p-12"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Nosso Propósito */}
      <motion.section 
        className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50"
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
            Nosso <span className="font-semibold">Propósito</span>
          </motion.h2>

          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                title: "Exclusividade",
                description: "Seleção criteriosa de marcas icônicas e peças raras que definem o verdadeiro luxo",
                icon: RiStarLine
              },
              {
                title: "Acessibilidade",
                description: "Interface intuitiva e recursos pensados para garantir que todos possam navegar e aproveitar a experiência",
                icon: RiEyeLine
              },
              {
                title: "Inclusão",
                description: "Moda para todos, celebrando a diversidade e oferecendo peças que refletem diferentes estilos e identidades",
                icon: RiHeartLine
              },
              {
                title: "Representatividade",
                description: "Compromisso em valorizar e representar diferentes culturas, corpos e histórias através da moda",
                icon: RiTeamLine
              },
              {
                title: "Sustentabilidade",
                description: "Compromisso com marcas que valorizam práticas éticas e sustentáveis",
                icon: RiLeafLine
              },
              {
                title: "Inovação",
                description: "Plataforma moderna e intuitiva que une tecnologia e elegância",
                icon: RiVipDiamondLine
              }
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="text-gray-900 mb-4">
                    <IconComponent size={40} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* Nossa Equipe */}
      <motion.section 
        className="py-20 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-4xl font-light text-gray-900 mb-4">
              Conheça Nossa <span className="font-semibold">Equipe</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Desenvolvedores apaixonados por criar experiências digitais excepcionais
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* Sarah Hernandes */}
            <motion.div
              variants={scaleIn}
              className="group"
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="relative h-80 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Image
                    src="/equipe/SARAH.jpg"
                    alt="Sarah Hernandes"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">Sarah Hernandes</h3>
                  <p className="text-gray-600 mb-6 font-medium">Desenvolvedora Full Stack</p>
                  <div className="flex gap-4">
                    <a 
                      href="https://www.linkedin.com/in/sarahhernandes/" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      aria-label="LinkedIn Sarah"
                    >
                      <FaLinkedin size={24} />
                    </a>
                    <a 
                      href="https://github.com/SaraahBR" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      aria-label="GitHub Sarah"
                    >
                      <FaGithub size={24} />
                    </a>
                    <a 
                      href="mailto:vihernandesbr@gmail.com" 
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      aria-label="Email Sarah"
                    >
                      <FaEnvelope size={24} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Luigi Rodrigo */}
            <motion.div
              variants={scaleIn}
              className="group"
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="relative h-80 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Image
                    src="/equipe/LUIGI.jpg"
                    alt="Luigi Rodrigo"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">Luigi Rodrigo</h3>
                  <p className="text-gray-600 mb-6 font-medium">Desenvolvedor Full Stack</p>
                  <div className="flex gap-4">
                    <a 
                      href="https://www.linkedin.com/in/luigi-rodrigo/" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      aria-label="LinkedIn Luigi"
                    >
                      <FaLinkedin size={24} />
                    </a>
                    <a 
                      href="https://github.com/luigirodrigo" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      aria-label="GitHub Luigi"
                    >
                      <FaGithub size={24} />
                    </a>
                    <a 
                      href="mailto:luigirodrigo45@gmail.com" 
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      aria-label="Email Luigi"
                    >
                      <FaEnvelope size={24} />
                    </a>
                  </div>
                </div>
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
            Pronto para descobrir o <span className="font-semibold">luxo autêntico</span>?
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-300 mb-10"
            {...fadeInUp}
            transition={{ delay: 0.2 }}
          >
            Explore nossa coleção exclusiva e encontre peças que definem seu estilo único
          </motion.p>
          <motion.a
            href="/colecao"
            className="inline-block bg-white text-gray-900 px-10 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors duration-300 shadow-xl hover:shadow-2xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explorar Coleção
          </motion.a>
        </div>
      </motion.section>
    </div>
  );
}
