import { FaFacebook, FaLinkedin, FaGithub, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">About GDG</h3>
            <p className="text-gray-600 text-sm">
              Google Developer Groups is a community of developers who are
              interested in Google's developer technology.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-gray-600 hover:text-blue-600">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-600 hover:text-blue-600">
                  About
                </a>
              </li>
              <li>
                <a
                  href="/shorten"
                  className="text-gray-600 hover:text-blue-600"
                >
                  URL Shortener
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-600">ISSAT Sousse</li>
              <li className="text-gray-600">Tunisia</li>
              <li>
                <a
                  href="mailto:dscissatso@gmail.com"
                  className="text-gray-600 hover:text-blue-600"
                >
                  dscissatso@gmail.com
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/gdgoc.issatso"
                target="_blank"
                className="text-gray-600 hover:text-blue-600"
              >
                <FaFacebook size={20} />
              </a>
              <a
                href="https://www.instagram.com/gdgc.issatso/"
                target="_blank"
                className="text-gray-600 hover:text-blue-600"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="https://x.com/gdgc_issatso"
                target="_blank"
                className="text-gray-600 hover:text-blue-600"
              >
                <FaXTwitter size={20} />
              </a>
              <a
                href="https://www.linkedin.com/company/gdsc-issatso"
                target="_blank"
                className="text-gray-600 hover:text-blue-600"
              >
                <FaLinkedin size={20} />
              </a>
              <a
                href="https://github.com/Google-Developer-Student-Clubs-ISSATSo"
                target="_blank"
                className="text-gray-600 hover:text-blue-600"
              >
                <FaGithub size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Google Developer Groups on Campus
              ISSATSo. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
