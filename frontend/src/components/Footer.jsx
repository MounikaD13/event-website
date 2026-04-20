import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart, ArrowRight } from 'lucide-react';

const FacebookIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

const InstagramIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
  </svg>
);

const TwitterIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
  </svg>
);

const LinkedinIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="w-full bg-[#FAF9F6] border-t border-[#EBE5DA] mt-auto">
      {/* Newsletter / Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-10 md:py-14 flex flex-col lg:flex-row items-center justify-between gap-8 border-b border-[#EBE5DA]">
          <div className="text-center lg:text-left max-w-lg">
            <h3 className="font-['Playfair_Display'] text-2xl sm:text-3xl text-[#4A4F4D] mb-2">Join our Insider List</h3>
            <p className="text-[#667280] text-sm leading-relaxed">Subscribe for exclusive access to hidden venues, event trends, and luxury inspiration straight to your inbox.</p>
          </div>
          <div className="w-full lg:w-auto lg:flex-1 lg:max-w-md">
            <form className="flex flex-col sm:flex-row items-stretch gap-3 w-full" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 min-w-0 bg-white border border-[#EBE5DA] rounded-full py-3.5 px-6 text-sm text-[#4A4F4D] focus:outline-none focus:border-[#C1A27B] transition-colors shadow-sm"
              />
              <button
                type="submit"
                className="shrink-0 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#C1A27B] hover:bg-[#b0916a] text-white rounded-full text-sm font-semibold tracking-wide transition-colors whitespace-nowrap"
              >
                Subscribe <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Block */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left">
            <Link to="/" className="inline-block mb-6">
              <span className="font-['Playfair_Display'] text-3xl font-bold text-[#4A4F4D] tracking-widest uppercase block mb-1">
                OVERSEAS
              </span>
              <span className="text-[10px] text-[#A3B19B] tracking-[0.3em] uppercase block">
                Destination Event Planners
              </span>
            </Link>
            <p className="text-sm text-[#667280] leading-relaxed mb-8 max-w-xs">
              Curating spectacular destination weddings, exclusive corporate retreats, and unforgettable celebrations across the globe since 2010.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-[#EBE5DA] bg-white flex items-center justify-center text-[#A3B19B] hover:bg-[#A3B19B] hover:text-white hover:border-[#A3B19B] transition-all duration-300">
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-[#EBE5DA] bg-white flex items-center justify-center text-[#A3B19B] hover:bg-[#A3B19B] hover:text-white hover:border-[#A3B19B] transition-all duration-300">
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-[#EBE5DA] bg-white flex items-center justify-center text-[#A3B19B] hover:bg-[#A3B19B] hover:text-white hover:border-[#A3B19B] transition-all duration-300">
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-[#EBE5DA] bg-white flex items-center justify-center text-[#A3B19B] hover:bg-[#A3B19B] hover:text-white hover:border-[#A3B19B] transition-all duration-300">
                <LinkedinIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Column 1 - Services */}
          <div className="lg:col-span-2 lg:col-start-6 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h4 className="font-['Playfair_Display'] text-lg font-semibold text-[#4A4F4D] mb-6">Services</h4>
            <ul className="space-y-4 text-sm text-[#667280]">
              <li><Link to="/events?type=wedding" className="hover:text-[#C1A27B] transition-colors">Destination Weddings</Link></li>
              <li><Link to="/events?type=corporate" className="hover:text-[#C1A27B] transition-colors">Corporate Retreats</Link></li>
              <li><Link to="/events?type=party" className="hover:text-[#C1A27B] transition-colors">Private Parties</Link></li>
              <li><Link to="/events?type=gala" className="hover:text-[#C1A27B] transition-colors">Charity Galas</Link></li>
              <li><Link to="/events?type=conference" className="hover:text-[#C1A27B] transition-colors">Global Conferences</Link></li>
            </ul>
          </div>

          {/* Links Column 2 - Company */}
          <div className="lg:col-span-2 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h4 className="font-['Playfair_Display'] text-lg font-semibold text-[#4A4F4D] mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-[#667280]">
              <li><Link to="/about" className="hover:text-[#C1A27B] transition-colors">Our Story</Link></li>
              <li><Link to="/events" className="hover:text-[#C1A27B] transition-colors">Portfolio & Gallery</Link></li>
              <li><Link to="/#testimonials" className="hover:text-[#C1A27B] transition-colors">Client Reviews</Link></li>
              <li><Link to="/careers" className="hover:text-[#C1A27B] transition-colors">Careers</Link></li>
              <li><Link to="/booking" className="hover:text-[#C1A27B] transition-colors">Book a Consultation</Link></li>
            </ul>
          </div>

          {/* Contact Info Column */}
          <div className="lg:col-span-3 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h4 className="font-['Playfair_Display'] text-lg font-semibold text-[#4A4F4D] mb-6">Get in Touch</h4>
            <ul className="space-y-5 text-sm text-[#667280]">
              <li className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                <MapPin className="w-4 h-4 text-[#C1A27B] mt-0.5" />
                <span>123 Elite Horizon Blvd,<br />Suite 400, New York, NY 10001</span>
              </li>
              <li className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                <Phone className="w-4 h-4 text-[#C1A27B]" />
                <a href="tel:+18886837472" className="hover:text-[#C1A27B] transition-colors">+1 (888) OVERSEAS</a>
              </li>
              <li className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                <Mail className="w-4 h-4 text-[#C1A27B]" />
                <a href="mailto:hello@overseas.events" className="hover:text-[#C1A27B] transition-colors">hello@overseas.events</a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-white border-t border-[#EBE5DA] py-6 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#667280] text-xs">
            © {new Date().getFullYear()} Overseas Events LLC. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-[#667280]">
            <Link to="/#privacy" className="hover:text-[#C1A27B] transition-colors">Privacy Policy</Link>
            <Link to="/#terms" className="hover:text-[#C1A27B] transition-colors">Terms of Service</Link>
            <Link to="/#faq" className="hover:text-[#C1A27B] transition-colors">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
