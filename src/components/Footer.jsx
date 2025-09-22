import React from 'react'
import { useWebsiteData } from '../contexts/GlobalDataContext'
import { Mail, Globe, Instagram, Youtube, Twitter, Linkedin, Phone, Shield, FileText, Users, Award, Target } from 'lucide-react'

const Footer = () => {
  const { data } = useWebsiteData()
  
  const defaultFooter = {
    brand: {
      name: 'TestingVala',
      tagline: 'Premier QA Excellence Platform',
      description: 'Empowering quality assurance professionals worldwide through innovative testing solutions, comprehensive resources, and a thriving global community.'
    },
    contact: {
      email: 'info@testingvala.com',
      phone: '+1 (555) 123-4567',
      website: 'https://www.testingvala.com',
      address: 'Global QA Community'
    },
    socialMedia: {
      twitter: 'https://twitter.com/testingvala',
      linkedin: 'https://www.linkedin.com/company/testingvala',
      youtube: 'https://www.youtube.com/@TestingvalaOfficial',
      instagram: 'https://www.instagram.com/testingvala'
    },
    quickLinks: [
      { label: 'About Us', href: '#about' },
      { label: 'Community', href: '#community' },
      { label: 'Contests', href: '#contest' },
      { label: 'Resources', href: '#resources' },
      { label: 'Contact', href: '#contact' }
    ],
    services: [
      { label: 'QA Training Programs', href: '#training' },
      { label: 'Certification Courses', href: '#certification' },
      { label: 'Enterprise Solutions', href: '#enterprise' },
      { label: 'Consulting Services', href: '#consulting' },
      { label: 'Career Support', href: '#careers' }
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Code of Conduct', href: '/conduct' }
    ],
    copyright: `© ${new Date().getFullYear()} TestingVala. All rights reserved.`
  }

  const footer = { ...defaultFooter, ...data?.footer }
  
  // Ensure social media links are properly merged
  if (data?.contact?.socialMedia) {
    footer.socialMedia = { ...footer.socialMedia, ...data.contact.socialMedia }
  }
  
  // Ensure contact info is properly merged
  if (data?.contact) {
    footer.contact = { ...footer.contact, ...data.contact }
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF6600] to-[#E55A00] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">{footer.brand.name}</h3>
                <p className="text-gray-400 text-sm">{footer.brand.tagline}</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed">{footer.brand.description}</p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#FF6600]" />
                <a href={`mailto:${footer.contact.email}`} className="text-gray-300 hover:text-white transition-colors">
                  {footer.contact.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#FF6600]" />
                <span className="text-gray-300">{footer.contact.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-[#FF6600]" />
                <a href={footer.contact.website} className="text-gray-300 hover:text-white transition-colors">
                  www.testingvala.com
                </a>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <a href={footer.socialMedia.twitter} className="text-gray-400 hover:text-[#FF6600] transition-colors p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                <Twitter className="w-5 h-5" />
              </a>
              <a href={footer.socialMedia.linkedin} className="text-gray-400 hover:text-[#FF6600] transition-colors p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href={footer.socialMedia.youtube} className="text-gray-400 hover:text-[#FF6600] transition-colors p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                <Youtube className="w-5 h-5" />
              </a>
              <a href={footer.socialMedia.instagram} className="text-gray-400 hover:text-[#FF6600] transition-colors p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-[#FF6600]" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {footer.quickLinks.map((link, i) => (
                <li key={i}>
                  <a href={link.href} className="text-gray-300 hover:text-[#FF6600] transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#FF6600]" />
              Services
            </h4>
            <ul className="space-y-3">
              {footer.services.map((service, i) => (
                <li key={i}>
                  <a href={service.href} className="text-gray-300 hover:text-[#FF6600] transition-colors">
                    {service.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#FF6600]" />
              Legal & Support
            </h4>
            <ul className="space-y-3">
              {footer.legal.map((item, i) => (
                <li key={i}>
                  <a href={item.href} className="text-gray-300 hover:text-[#FF6600] transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              {footer.copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
