import React from 'react'
import { useWebsiteData } from '../hooks/useWebsiteData'
import { Mail, Globe, Instagram, Youtube, Twitter, Linkedin, Phone, Shield, FileText } from 'lucide-react'

const Footer = () => {
  const { data } = useWebsiteData()
  const footer = data.footer || {}

  return (
    <footer className="bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-[#E55A00] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">{footer.brand?.logoLetter || 'T'}</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">{footer.brand?.name || 'TestingVala'}</h3>
                <p className="text-gray-400 text-sm">{footer.brand?.tagline || 'QA Excellence Platform'}</p>
              </div>
            </div>

            <p className="text-gray-300 mb-6 leading-relaxed">{footer.description}</p>

            <div className="space-y-3 mb-6">
              {footer.contact?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <a href={`mailto:${footer.contact.email}`} className="text-gray-200">{footer.contact.email}</a>
                </div>
              )}
              {footer.contact?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <span className="text-gray-200">{footer.contact.phone}</span>
                </div>
              )}
              {footer.contact?.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-primary" />
                  <a href={footer.contact.website} className="text-gray-200">{footer.contact.website.replace(/^https?:\/\//, '')}</a>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              {footer.socialMedia?.twitter && (
                <a href={footer.socialMedia.twitter} className="text-gray-200 hover:text-primary transition-colors p-2 bg-gray-800 rounded-lg hover:bg-gray-700" aria-label="Twitter">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {footer.socialMedia?.linkedin && (
                <a href={footer.socialMedia.linkedin} className="text-gray-200 hover:text-primary transition-colors p-2 bg-gray-800 rounded-lg hover:bg-gray-700" aria-label="LinkedIn">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {footer.socialMedia?.youtube && (
                <a href={footer.socialMedia.youtube} className="text-gray-200 hover:text-primary transition-colors p-2 bg-gray-800 rounded-lg hover:bg-gray-700" aria-label="YouTube">
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {footer.socialMedia?.instagram && (
                <a href={footer.socialMedia.instagram} className="text-gray-200 hover:text-primary transition-colors p-2 bg-gray-800 rounded-lg hover:bg-gray-700" aria-label="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#FF6600]" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {(footer.quickLinks || []).map((l, i) => (
                <li key={i}><a href={l.href || '#'} className="text-gray-300 hover:text-[#FF6600] transition-colors flex items-center gap-2">{l.label}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#FF6600]" />
              Resources & Legal
            </h4>
            <ul className="space-y-3">
              {(footer.resources || []).map((r, i) => (
                <li key={i}><a href={r.href || '#'} className="text-gray-300 hover:text-[#FF6600] transition-colors flex items-center gap-2">{r.label}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">{footer.copyright || `© ${new Date().getFullYear()} TestingVala. All rights reserved.`} <span className="hidden sm:inline">| Built with ❤️ for the QA community</span></p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Shield className="w-4 h-4" />
              <span>Secure & Reliable</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Globe className="w-4 h-4" />
              <span>Global Community</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
