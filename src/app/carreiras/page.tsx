"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { RiUserStarLine, RiPencilRulerLine, RiCodeLine, RiSearchEyeLine } from "react-icons/ri";

export default function CarreirasPage() {
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
              CARREIRAS
            </h1>
            <div className="shimmer-line h-[2px] mx-auto mb-8" />
          </motion.div>
          
          <motion.p 
            className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
            style={{ fontFamily: "'Playfair Display', 'Times New Roman', serif" }}
            {...fadeInUp}
            transition={{ delay: 0.4 }}
          >
            Junte-se a nós nesta jornada de elegância, inovação e transformação
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
            Nossas <span className="font-semibold">Oportunidades</span>
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
                title: "Modelo",
                description: "Represente a elegância e sofisticação da Luigarah nas passarelas e campanhas",
                icon: RiUserStarLine
              },
              {
                title: "Designer",
                description: "Crie experiências visuais memoráveis e interfaces que inspiram",
                icon: RiPencilRulerLine
              },
              {
                title: "Programador",
                description: "Desenvolva soluções tecnológicas inovadoras para o futuro da moda",
                icon: RiCodeLine
              },
              {
                title: "Analista",
                description: "Transforme dados em insights valiosos para decisões estratégicas",
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
                alt="José Antonio - Modelo Luigarah"
                fill
                className="object-cover"
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="order-1 md:order-2">
              <h2 className="text-4xl font-light text-gray-900 mb-6">
                José <span className="font-semibold">Antonio</span>
              </h2>
              <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">Modelo • Embaixador da Inclusão</p>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Aos 57 anos, José enfrentou inúmeras rejeições na indústria da moda por não se encaixar nos 
                  &ldquo;padrões tradicionais&rdquo; por ser um homem de idade avançada. Vinda de uma família humilde do interior de São Paulo, ele sonhava em 
                  ver corpos diversos representados nas passarelas de luxo.
                </p>
                <p>
                  Quando a Luigarah abriu suas portas para modelos de todos os biotipos, José encontrou seu lugar. 
                  Hoje, aos 64 anos, ele é um dos principais embaixadores da marca, desfilando em campanhas 
                  internacionais e inspirando milhares de jovens que se identificam com sua história.
                </p>
                <p className="italic text-gray-700 border-l-4 border-gray-900 pl-4">
                  &ldquo;Na Luigarah, aprendi que elegância não tem um tamanho único. Cada corpo conta uma história, 
                  e todas merecem ser celebradas.&rdquo; - José Antonio
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
              <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">Designer UI/UX • Inovador Digital</p>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Rafael cresceu fascinado pela interseção entre arte e tecnologia. Formado em Design Gráfico, 
                  ele enfrentou o desafio de provar que a experiência digital poderia ser tão luxuosa e sofisticada 
                  quanto uma boutique física.
                </p>
                <p>
                  Após anos trabalhando em startups, Rafael trouxe sua visão revolucionária para a Luigarah. 
                  Ele liderou a criação de interfaces que combinam minimalismo elegante com funcionalidade intuitiva, 
                  transformando cada clique em uma experiência sensorial.
                </p>
                <p className="italic text-gray-700 border-l-4 border-gray-900 pl-4">
                  &ldquo;Design não é apenas sobre como algo parece, mas sobre como faz você se sentir. 
                  Na Luigarah, cada pixel é uma declaração de elegância.&rdquo; - Rafael Mendes
                </p>
              </div>
            </motion.div>

            <motion.div 
              variants={scaleIn}
              className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl"
            >
              <Image
                src="/Desfile_de_Moda_Luxuoso.png"
                alt="Desfile Luigarah"
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
                alt="Maria - Mestre Costureira"
                fill
                className="object-cover"
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="order-1 md:order-2">
              <h2 className="text-4xl font-light text-gray-900 mb-6">
                Maria <span className="font-semibold">Rodrigues</span>
              </h2>
              <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">Mestre Costureira • Guardiã da Tradição</p>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Com 37 anos e mais de três décadas de experiência, Maria é a prova viva de que o verdadeiro 
                  luxo está nos detalhes artesanais. Ela aprendeu a costurar aos 12 anos com sua avó, em uma pequena 
                  vila no interior de Minas Gerais.
                </p>
                <p>
                  Quando a indústria da moda rápida ameaçou extinguir as técnicas tradicionais, Maria encontrou 
                  na Luigarah um espaço para compartilhar seu conhecimento ancestral. Hoje, ela lidera workshops 
                  de alta costura, ensinando jovens costureiras a arte de criar peças que duram gerações.
                </p>
                <p>
                  Suas mãos, marcadas por anos de dedicação, transformam tecidos em obras de arte. Cada ponto 
                  carrega história, resistência e a sabedoria de quem viu a moda evoluir sem perder sua essência.
                </p>
                <p className="italic text-gray-700 border-l-4 border-gray-900 pl-4">
                  &ldquo;Uma peça feita à mão carrega a alma de quem a criou. É isso que diferencia o luxo verdadeiro 
                  da produção em massa.&rdquo; - Maria Rodrigues
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
              <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">Sub Diretora Fashion • Drag Queen</p>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Lady Steffany é sinônimo de coragem e estilo. Como drag queen e executiva da moda,
                  ela transformou sua expressão artística em liderança inspiradora, elevando a estética
                  da Luigarah a um novo patamar de ousadia e sofisticação.
                </p>
                <p>
                  Sua trajetória começou nos palcos independentes, onde aprendeu que moda é identidade e
                  resistência. Na Luigarah, Steffany conduz coleções cápsula que celebram diversidade,
                  brilho e técnica impecável — unindo alfaiataria precisa a materiais inovadores.
                </p>
                <p className="italic text-gray-700 border-l-4 border-gray-900 pl-4">
                  &ldquo;Ser luxo é honrar quem você é. A arte drag me ensinou que elegância é também atitude.&rdquo; - Lady Steffany
                </p>
              </div>
            </motion.div>

            <motion.div 
              variants={scaleIn}
              className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl"
            >
              <Image
                src="/Drag_Queen_Luxuosa.png"
                alt="Lady Steffany - Sub Diretora Fashion"
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
                alt="Irmãos Estilosos - Arquitetos"
                fill
                className="object-cover"
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="order-1 md:order-2">
              <h2 className="text-4xl font-light text-gray-900 mb-6">
                Irmãos <span className="font-semibold">Steffany</span>
              </h2>
              <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">Arquitetos • Estética Alternativa</p>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Tatuados, autênticos e fora dos padrões. Os irmãos Steffany assinam projetos de
                  arquitetura para lojas conceito e pop-ups da Luigarah, mesclando brutalismo suave,
                  iluminação cênica e materiais sustentáveis.
                </p>
                <p>
                  Para eles, cada espaço é uma narrativa sensorial: o concreto encontra o veludo, o aço
                  dialoga com a seda. O resultado? Ambientes que valorizam as peças e acolhem a diversidade
                  do público, sem abrir mão da sofisticação.
                </p>
                <p className="italic text-gray-700 border-l-4 border-gray-900 pl-4">
                  &ldquo;Arquitetura é vestir o vazio. Na Luigarah, vestimos experiências com personalidade.&rdquo;
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
            Pronto para fazer parte da <span className="font-semibold">nossa história</span>?
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-300 mb-10"
            {...fadeInUp}
            transition={{ delay: 0.2 }}
          >
            Na Luigarah, valorizamos talento, diversidade e paixão. Todas as histórias são fictícias, 
            criadas para ilustrar nossos valores de inclusão e excelência.
          </motion.p>
          <motion.div
            className="inline-block bg-white/10 backdrop-blur-sm text-white px-10 py-4 rounded-full font-semibold text-lg border border-white/20"
            {...fadeInUp}
            transition={{ delay: 0.4 }}
          >
            Projeto Fictício - Portfólio
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
