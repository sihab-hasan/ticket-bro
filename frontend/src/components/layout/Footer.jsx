import React, { useState } from "react"; // Removed useContext
import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Github,
  Mail,
  Phone,
  MapPin,
  Heart,
  Globe,
  CreditCard,
  Shield,
  Truck,
  ArrowRight,
  ChevronRight,
  Users,
  Calendar,
  Wifi,
  Zap,
  Sun,
  Moon,
  Laptop,
  Sparkles,
  Ticket,
  Star,
  Award,
  Clock,
  CheckCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Container from "@/components/layout/Container";
import { useTheme } from "@/context/ThemeContext"; // Using the hook correctly
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { theme, setThemeMode } = useTheme(); // Using the hook directly, not useContext
  const [email, setEmail] = useState("");

  const footerSections = [
    {
      title: "Company",
      icon: Users,
      links: [
        { label: "About Us", href: "/about" },
        { label: "Careers", href: "/careers", badge: "Hiring" },
        { label: "Press", href: "/press" },
        { label: "Blog", href: "/blog" },
        { label: "Investors", href: "/investors" },
      ],
    },
    {
      title: "Explore",
      icon: Calendar,
      links: [
        { label: "Concerts", href: "/browse" },
        { label: "Sports", href: "/browse" },
        { label: "Movies", href: "/browse" },
        { label: "Theater", href: "/browse" },
        { label: "Festivals", href: "/browse" },
      ],
    },
    {
      title: "Support",
      icon: Shield,
      links: [
        { label: "Help Center", href: "/faq" },
        { label: "Contact Us", href: "/contact" },
        { label: "Returns", href: "/returns" },
        { label: "Shipping Info", href: "/shipping" },
      ],
    },
    {
      title: "Legal",
      icon: Award,
      links: [
        { label: "Terms of Service", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Cookie Policy", href: "/cookies" },
        { label: "GDPR", href: "/gdpr" },
      ],
    },
  ];

  const socialLinks = [
    {
      icon: Facebook,
      href: "#",
      label: "Facebook",
      color: "hover:bg-blue-600",
    },
    { icon: Twitter, href: "#", label: "Twitter", color: "hover:bg-sky-500" },
    {
      icon: Instagram,
      href: "#",
      label: "Instagram",
      color: "hover:bg-pink-600",
    },
    {
      icon: Linkedin,
      href: "#",
      label: "LinkedIn",
      color: "hover:bg-blue-700",
    },
    { icon: Github, href: "#", label: "GitHub", color: "hover:bg-gray-800" },
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    setEmail("");
  };

  const handleThemeChange = (newTheme) => {
    setThemeMode(newTheme);
  };

  return (
    <footer className="bg-gradient-to-b from-background to-background/95 pt-8 pb-8 relative overflow-hidden">
      {/* Gradient line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      {/* Decorative Elements - Subtle Motion added to background blurs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <Container className="relative">
        {/* --- Upper Section: Newsletter & Branding --- */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-md" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 md:p-10 rounded-md border border-border bg-background/50 backdrop-blur-sm">
            {/* Brand Section */}
            <div className="lg:col-span-4 space-y-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity"
              >
                <Ticket className="h-8 w-8 text-primary animate-bounce-slow" />
                <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Ticket Bro
                </span>
              </Link>

              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                The world's leading secondary marketplace for tickets.
                <span className="block mt-2 font-medium text-foreground/80">
                  Over 10 million tickets sold worldwide.
                </span>
              </p>
            </div>

            {/* Newsletter Section */}
            <div className="lg:col-span-5 space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  Join our newsletter
                </h3>
                <p className="text-muted-foreground text-sm">
                  Get early access to presales, exclusive discounts, and event
                  recommendations.
                </p>
              </div>

              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 bg-background border-border h-12 rounded-md focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="h-12 px-8 rounded-md font-medium group relative overflow-hidden transition-all hover:pr-10"
                  >
                    <span className="relative z-10">Subscribe</span>
                    <ArrowRight className="absolute right-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  By subscribing, you agree to our Privacy Policy and consent to
                  receive updates.
                </p>
              </form>
            </div>

            {/* Social Links */}
            <div className="lg:col-span-3 flex flex-col items-end justify-center">
              <span className="text-sm font-medium mb-4">Follow us</span>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className={`p-3 rounded-full bg-muted hover:text-white ${social.color} transition-all duration-150 hover:scale-125 hover:-translate-y-2 shadow-sm hover:shadow-md`}
                    aria-label={social.label}
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- Middle Section: Navigation --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8">
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-5">
              <h4 className="text-sm font-bold uppercase tracking-widest text-foreground/80 flex items-center gap-2 group cursor-default">
                <section.icon className="h-4 w-4 text-primary group-hover:rotate-12 transition-transform" />
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-[15px] text-muted-foreground hover:text-primary transition-all flex items-center group relative w-fit"
                    >
                      <span className="absolute -left-5 opacity-0 group-hover:opacity-100 group-hover:-left-1 transition-all duration-300">
                        <ChevronRight className="h-3 w-3 text-primary" />
                      </span>
                      <span className="group-hover:translate-x-3 transition-transform duration-300">
                        {link.label}
                      </span>
                      {link.badge && (
                        <Badge
                          variant="secondary"
                          className="ml-2 text-[10px] px-1.5 py-0 group-hover:bg-primary group-hover:text-primary-foreground "
                        >
                          {link.badge}
                        </Badge>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* --- Lower Section: Controls & Badges --- */}
        <div className="flex flex-col lg:flex-row justify-between items-center py-8 border-y border-border gap-8">
          <div className="flex flex-wrap justify-center gap-4">
            <Select defaultValue="en">
              <SelectTrigger className="w-[140px] bg-muted/50 border-border">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">🇺🇸 English (US)</SelectItem>
                <SelectItem value="fr">🇫🇷 Français</SelectItem>
                <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                <SelectItem value="es">🇪🇸 Español</SelectItem>
                <SelectItem value="it">🇮🇹 Italiano</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="usd">
              <SelectTrigger className="w-[110px] bg-muted/50 border-border ">
                <CreditCard className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">💵 USD ($)</SelectItem>
                <SelectItem value="eur">💶 EUR (€)</SelectItem>
                <SelectItem value="gbp">💷 GBP (£)</SelectItem>
                <SelectItem value="jpy">💴 JPY (¥)</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center bg-muted/50 rounded-md p-1 border border-border h-9">
              {[
                { val: "light", icon: Sun },
                { val: "dark", icon: Moon },
                { val: "system", icon: Laptop },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => handleThemeChange(opt.val)}
                  className={`h-7 w-7 flex items-center justify-center rounded-md ${
                    theme === opt.val
                      ? "bg-background shadow-sm text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  } transition-all duration-200`}
                  title={`${opt.val} mode`}
                >
                  <opt.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-gradient-to-r from-green-500/10 to-green-500/5 px-4 py-2 rounded-md border border-green-500/20 hover:border-green-500/40  group cursor-help">
              <Shield className="h-4 w-4 text-green-500 group-hover:scale-110" />
              <span>PCI-DSS Compliant</span>
            </div>
            <div className="flex items-center gap-4">
              <CreditCard
                className="h-6 w-6 text-muted-foreground/60 hover:text-foreground transition-all hover:scale-110 cursor-pointer"
                title="Visa"
              />
              <CreditCard
                className="h-6 w-6 text-muted-foreground/60 hover:text-foreground transition-all hover:scale-110 cursor-pointer"
                title="Mastercard"
              />
              <CreditCard
                className="h-6 w-6 text-muted-foreground/60 hover:text-foreground transition-all hover:scale-110 cursor-pointer"
                title="American Express"
              />
              <Zap
                className="h-5 w-5 text-yellow-500 animate-bounce-slow"
                title="Instant Delivery"
              />
            </div>
          </div>
        </div>

        {/* --- Bottom Bar --- */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Ticket Bro Technologies Inc. All rights reserved.
            <span className="hidden md:inline mx-2">•</span>
            <span className="block md:inline text-xs hover:text-primary  cursor-pointer">
              Listed on NYSE: TICK
            </span>
          </p>

          <div className="flex items-center gap-6 text-xs">
            {["Privacy", "Terms", "Cookies", "Sitemap"].map((item) => (
              <Link
                key={item}
                to={`/${item.toLowerCase()}`}
                className="text-muted-foreground hover:text-primary transition-all hover:underline underline-offset-4"
              >
                {item}
              </Link>
            ))}
            <div className="flex items-center gap-1 ml-2 group">
              <a
                href="https://github.com/sihab-hasan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs transition-all duration-200 hover:text-gray-400 hover:underline"
              >
                {/* GitHub Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12a12 12 0 008.2 11.38c.6.11.82-.26.82-.58v-2.17c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.73.08-.73 1.22.09 1.86 1.25 1.86 1.25 1.08 1.85 2.84 1.32 3.53 1 .11-.79.42-1.32.76-1.63-2.67-.3-5.47-1.34-5.47-5.94 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.16 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0C17.9 3.99 18.9 4.3 18.9 4.3c.66 1.64.24 2.86.12 3.16.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.93.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.83.58A12 12 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>

                <span>Sihab Hasan</span>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
