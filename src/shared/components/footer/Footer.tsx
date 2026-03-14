import {
  Mail,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  MessageCircle,
} from "lucide-react";
import { Separator } from "@/shared/ui/separator";
import Logo from "@/assets/logo";
import { Link } from "react-router-dom";

const WHATSAPP_NUMBER = "962795441474";
const WHATSAPP_BUY_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("مرحباً، أرغب في شراء بطاقة دورة. يرجى إرسال تفاصيل الأسعار.")}`;
const WHATSAPP_CONTACT_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      {
        name: "Browse Courses",
        href: "/browse/product-courses",
        internal: true,
      },
      { name: "Study Materials", href: "/courses", internal: true },
      { name: "About Us", href: "/about", internal: true },
    ],
    support: [
      { name: "Buy Prepaid Code", href: WHATSAPP_BUY_LINK, internal: false },
      {
        name: "Contact via WhatsApp",
        href: WHATSAPP_CONTACT_LINK,
        internal: false,
      },
      { name: "My Learning", href: "/my-learning", internal: true },
    ],
    legal: [
      { name: "Privacy Policy", href: "#privacy", internal: false },
      { name: "Terms of Service", href: "#terms", internal: false },
    ],
  };

  const socialLinks = [
    {
      icon: <Instagram className="h-4 w-4" />,
      href: "https://www.instagram.com/ecampusjo/",
      label: "Instagram",
    },
    {
      icon: <Facebook className="h-4 w-4" />,
      href: "https://www.facebook.com/profile.php?id=61575006386806",
      label: "Facebook",
    },
    {
      icon: <Youtube className="h-4 w-4" />,
      href: "https://www.youtube.com/@ecampusacademy_jo",
      label: "YouTube",
    },
    {
      icon: <Linkedin className="h-4 w-4" />,
      href: "https://www.linkedin.com/company/ecampus-hub",
      label: "LinkedIn",
    },
    {
      icon: <MessageCircle className="h-4 w-4" />,
      href: WHATSAPP_CONTACT_LINK,
      label: "WhatsApp",
    },
  ];

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <Logo style={{ height: "36px" }} />
              <span className="text-lg font-bold">eCampus</span>
            </Link>
            <p className="mb-4 text-sm text-muted-foreground">
              Your gateway to academic excellence in Jordan.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Mail className="h-4 w-4" />
              <a
                href="mailto:support@ecampus.jo"
                className="hover:text-primary transition-colors"
              >
                support@ecampus.jo
              </a>
            </div>
            <a
              href={WHATSAPP_BUY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 rounded-lg bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 text-sm font-medium transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Buy Prepaid Code
            </a>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-3 gap-6 md:col-span-1 lg:col-span-3">
            {/* Platform */}
            <div>
              <h4 className="mb-3 text-sm font-semibold">Platform</h4>
              <ul className="space-y-2">
                {footerLinks.platform.map((link) => (
                  <li key={link.name}>
                    {link.internal ? (
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {link.name}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="mb-3 text-sm font-semibold">Support</h4>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    {link.internal ? (
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {link.name}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="mb-3 text-sm font-semibold">Legal</h4>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bottom Footer */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">
              © {currentYear} eCampus.jo — All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Made with ❤️ by{" "}
              <a
                href="https://www.linkedin.com/in/mohammad-nour-aldeen-swedan-a985071b5"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary underline transition-colors"
              >
                Mohammad Swedan
              </a>
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-md border bg-background transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
