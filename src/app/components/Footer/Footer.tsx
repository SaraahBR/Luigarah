'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { FaInstagram, FaFacebookF, FaPinterestP, FaTwitter } from 'react-icons/fa'
import AmexIcon from '@/pagamentos/amex.svg'
import VisaIcon from '@/pagamentos/visa.svg'
import MastercardIcon from '@/pagamentos/mastercard.svg'
import PaypalIcon from '@/pagamentos/paypal.svg'
import HipercardIcon from '@/pagamentos/hipercard.svg'
import EloIcon from '@/pagamentos/elo.svg'
import BoletoIcon from '@/pagamentos/boleto.svg'

// DADOS PARA OS LINKS (mantém o JSX limpo)
const paymentMethods = [
  { name: 'American Express', src: AmexIcon },
  { name: 'Visa', src: VisaIcon },
  { name: 'Mastercard', src: MastercardIcon },
  { name: 'PayPal', src: PaypalIcon },
  { name: 'Boleto', src: BoletoIcon },
  { name: 'Elo', src: EloIcon },
  { name: 'Hipercard', src: HipercardIcon },
]

// "key" = chave da tradução em messages/*.json (footer.links)
const faleConoscoLinks = [
  { key: 'customerSupport', href: '/apoio-ao-cliente' },
  { key: 'faq', href: '/perguntas-frequentes' },
  { key: 'ordersDelivery', href: '/pedidos-e-entregas' },
  { key: 'returns', href: '/devolucoes' },
  { key: 'howToBuy', href: '/como-comprar' },
]

const sobreNosLinks = [
  { key: 'aboutUs', href: '/sobre' },
  { key: 'careers', href: '/carreiras' },
]

const socialLinks = [
  { name: 'Instagram', icon: <FaInstagram />, href: '#' },
  { name: 'Facebook', icon: <FaFacebookF />, href: '#' },
  { name: 'Pinterest', icon: <FaPinterestP />, href: '#' },
  { name: 'Twitter', icon: <FaTwitter />, href: '#' },
]

const Footer = () => {
  const t = useTranslations('footer')
  return (
    <footer className="bg-gray-100 text-gray-700 pt-10">
      <div className="container mx-auto px-4">
        <div className="border-b pb-8 mb-8">
          <h3 className="font-semibold mb-4">{t('paymentMethods')}</h3>
          <div className="flex items-center gap-4">
            {paymentMethods.map((method) => (
              <div
                className="relative flex items-center group"
                key={method.name}
              >
                <Image
                  src={method.src}
                  alt={method.name}
                  className="h-10 w-auto"
                />

                <span
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                                 w-max bg-gray-800 text-white text-xs rounded-md px-2 py-1 
                                 opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                                 transition-opacity duration-300"
                >
                  {method.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div>
            <h3 className="font-semibold mb-4">{t('contactUs')}</h3>
            <ul className="space-y-2">
              {faleConoscoLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm hover:underline"
                  >
                    {t(`links.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">{t('aboutLuigarah')}</h3>
            <ul className="space-y-2">
              {sobreNosLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm hover:underline"
                  >
                    {t(`links.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div></div>
          <div className="md:text-right">
            <h3 className="font-semibold mb-4">{t('social')}</h3>
            <div className="flex md:justify-end items-center gap-4 text-xl">
              {socialLinks.map((social) => (
                <Link
                  href={social.href}
                  key={social.name}
                  className="hover:text-black"
                  aria-label={t('visitProfile', { network: social.name })}
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-200 py-6">
        <div className="container mx-auto px-4 text-sm text-gray-600">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex gap-4 mb-4 md:mb-0">
              <Link href="/lgpd/politica-de-privacidade" className="hover:underline">
                {t('privacy')}
              </Link>
              <Link href="/lgpd/termos-de-servico" className="hover:underline">
                {t('terms')}
              </Link>
              <Link href="#" className="hover:underline">
                {t('accessibility')}
              </Link>
            </div>
            <p>
              &copy; {new Date().getFullYear()} Luigarah. {t('rights')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
