import type { PageContent, SiteTemplateId, ThemeConfig } from "@/core/types/page";

const defaultTheme: ThemeConfig = {
  mode: "system",
  primaryColor: "#0f172a",
  accentColor: "#be185d",
  fontFamily: "Inter",
  borderRadius: "12px",
};

function hero(title: string, tagline: string): PageContent["hero"] {
  return {
    title,
    tagline,
    imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32d7?q=80&w=1200&auto=format&fit=crop",
    ctaText: "Contact us",
    ctaLink: "/contact",
  };
}

export const SITE_TEMPLATES: Record<
  SiteTemplateId,
  { label: string; theme: ThemeConfig; pages: Record<string, PageContent> }
> = {
  general: {
    label: "General business",
    theme: defaultTheme,
    pages: {
      home: {
        hero: hero("Welcome to your business", "We help customers every day with reliable service."),
        blocks: [
          { id: "1", type: "features", title: "Why choose us", body: "Quality · Trust · Local service", visible: true },
          {
            id: "2",
            type: "whatsapp",
            title: "Chat on WhatsApp",
            body: "Fast replies during business hours",
            visible: true,
            data: { phone: "91XXXXXXXXXX", message: "Hi! I found you on ALINKS." },
          },
          {
            id: "3",
            type: "link",
            title: "Our services",
            body: "",
            visible: true,
            data: { href: "/services", buttonLabel: "View services" },
          },
        ],
      },
      about: {
        blocks: [
          {
            id: "1",
            type: "text",
            title: "Our story",
            body: "Tell customers who you are and what you stand for.",
            visible: true,
          },
        ],
      },
      services: {
        blocks: [
          {
            id: "1",
            type: "services",
            title: "What we offer",
            body: "Popular choices",
            visible: true,
            data: {
              items: [
                { name: "Service one", price: "₹499", duration: "30 min" },
                { name: "Service two", price: "₹999", duration: "60 min" },
              ],
            },
          },
        ],
      },
      contact: {
        blocks: [
          {
            id: "1",
            type: "contact",
            title: "Get in touch",
            body: "We are nearby and happy to help.",
            visible: true,
            data: { phone: "91XXXXXXXXXX", address: "Your area, City" },
          },
          {
            id: "2",
            type: "hours",
            title: "Opening hours",
            body: "",
            visible: true,
            data: { lines: ["Mon–Sat: 10:00 AM – 8:00 PM", "Sunday: Closed"] },
          },
          {
            id: "3",
            type: "whatsapp",
            title: "WhatsApp us",
            body: "",
            visible: true,
            data: { phone: "91XXXXXXXXXX", message: "Hi!" },
          },
        ],
      },
      legal: {
        blocks: [
          {
            id: "1",
            type: "legal",
            title: "Terms & Privacy",
            body: "Publish your terms and privacy policy. Operated independently — not Artix.",
            visible: true,
          },
        ],
      },
    },
  },
  salon: {
    label: "Salon & beauty",
    theme: { ...defaultTheme, primaryColor: "#be185d", accentColor: "#f43f5e" },
    pages: {
      home: {
        hero: hero("Your salon name", "Book appointments and explore our packages."),
        blocks: [
          {
            id: "1",
            type: "services",
            title: "Popular packages",
            body: "Tap to book on WhatsApp",
            visible: true,
            data: {
              items: [
                { name: "Haircut & styling", price: "₹599", duration: "45 min" },
                { name: "Facial glow", price: "₹799", duration: "60 min" },
              ],
            },
          },
          {
            id: "2",
            type: "cta",
            title: "Book a slot",
            body: "Pay-then-book packages available",
            visible: true,
            data: { href: "/book", buttonLabel: "Book now" },
          },
          {
            id: "3",
            type: "whatsapp",
            title: "WhatsApp salon",
            body: "",
            visible: true,
            data: { phone: "91XXXXXXXXXX", message: "Hi, I want to book a salon service." },
          },
        ],
      },
      about: {
        blocks: [
          {
            id: "1",
            type: "text",
            title: "About our salon",
            body: "Experienced stylists and hygienic care.",
            visible: true,
          },
        ],
      },
      services: {
        blocks: [
          {
            id: "1",
            type: "services",
            title: "Services & packages",
            body: "Add more in the editor",
            visible: true,
            data: {
              items: [
                { name: "Haircut", price: "₹399", duration: "30 min" },
                { name: "Bridal package", price: "₹9999", duration: "4 hr" },
              ],
            },
          },
        ],
      },
      contact: {
        blocks: [
          {
            id: "1",
            type: "contact",
            title: "Visit or call",
            body: "Walk-ins welcome when slots are free.",
            visible: true,
            data: { phone: "91XXXXXXXXXX", address: "Salon street, City" },
          },
          {
            id: "2",
            type: "hours",
            title: "Hours",
            body: "",
            visible: true,
            data: { lines: ["Tue–Sun: 10:00 AM – 8:00 PM", "Monday: Closed"] },
          },
        ],
      },
      legal: {
        blocks: [
          {
            id: "1",
            type: "legal",
            title: "Salon terms",
            body: "Cancellation policy and service disclaimers.",
            visible: true,
          },
        ],
      },
    },
  },
  ecommerce: {
    label: "Shop / kirana",
    theme: { ...defaultTheme, primaryColor: "#059669", accentColor: "#10b981" },
    pages: {
      home: {
        hero: hero("Your shop", "Order on WhatsApp — fast local delivery."),
        blocks: [
          {
            id: "1",
            type: "features",
            title: "Shop highlights",
            body: "Fresh stock · Fair prices · WhatsApp orders",
            visible: true,
          },
          {
            id: "2",
            type: "link",
            title: "Browse store",
            body: "",
            visible: true,
            data: { href: "/store", buttonLabel: "Open store" },
          },
          {
            id: "3",
            type: "whatsapp",
            title: "Order on WhatsApp",
            body: "Send your list — we confirm stock",
            visible: true,
            data: { phone: "91XXXXXXXXXX", message: "Hi, I want to order from your shop." },
          },
        ],
      },
      about: {
        blocks: [
          {
            id: "1",
            type: "text",
            title: "About our shop",
            body: "Family-run store serving the neighbourhood.",
            visible: true,
          },
        ],
      },
      services: {
        blocks: [
          {
            id: "1",
            type: "text",
            title: "Catalog",
            body: "Connect Google Sheets in dashboard to sync products. Use Store page for the full list.",
            visible: true,
          },
          {
            id: "2",
            type: "link",
            title: "Full store",
            body: "",
            visible: true,
            data: { href: "/store", buttonLabel: "Shop now" },
          },
        ],
      },
      contact: {
        blocks: [
          {
            id: "1",
            type: "contact",
            title: "Order & delivery",
            body: "Delivery areas and timings below.",
            visible: true,
            data: { phone: "91XXXXXXXXXX", address: "Shop area, City" },
          },
          {
            id: "2",
            type: "hours",
            title: "Shop hours",
            body: "",
            visible: true,
            data: { lines: ["Daily: 8:00 AM – 9:00 PM"] },
          },
        ],
      },
      legal: {
        blocks: [
          {
            id: "1",
            type: "legal",
            title: "Shop terms",
            body: "COD terms, returns, and privacy for customers.",
            visible: true,
          },
        ],
      },
    },
  },
  /**
   * Presence / profile — influencer link hub. NO store / checkout CTAs.
   * Page map within 5-page rule: Home · About · Links (services) · Contact · Legal.
   * Gallery lives as blocks on Home/About.
   */
  presence: {
    label: "Presence / creator",
    theme: { ...defaultTheme, primaryColor: "#111827", accentColor: "#a855f7" },
    pages: {
      home: {
        hero: {
          title: "Your name",
          tagline: "Creator · collabs · links in one place",
          imageUrl:
            "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1200&auto=format&fit=crop",
          ctaText: "Work with me",
          ctaLink: "/contact",
        },
        blocks: [
          {
            id: "1",
            type: "text",
            title: "Bio",
            body: "Short intro for brands and fans. Edit this in the website builder.",
            visible: true,
          },
          {
            id: "2",
            type: "link",
            title: "Latest content",
            body: "Pin your top link",
            visible: true,
            data: { href: "https://instagram.com", buttonLabel: "Open Instagram" },
          },
          {
            id: "3",
            type: "link",
            title: "YouTube",
            body: "",
            visible: true,
            data: { href: "https://youtube.com", buttonLabel: "Watch on YouTube" },
          },
          {
            id: "4",
            type: "cta",
            title: "Brand collabs",
            body: "Media kit & rates on request — contact only (no shop).",
            visible: true,
            data: { href: "/contact", buttonLabel: "Work with me" },
          },
          {
            id: "5",
            type: "whatsapp",
            title: "WhatsApp",
            body: "Fast collab replies",
            visible: true,
            data: { phone: "91XXXXXXXXXX", message: "Hi! Found your ALINKS profile — collab?" },
          },
        ],
      },
      about: {
        blocks: [
          {
            id: "1",
            type: "text",
            title: "About me",
            body: "Niches, story, and what you create. Keep it mobile-first.",
            visible: true,
          },
          {
            id: "2",
            type: "gallery",
            title: "Highlights",
            body: "Work, events, BTS",
            visible: true,
            data: {
              images: [
                {
                  url: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=800&auto=format&fit=crop",
                  caption: "Sample work",
                },
              ],
            },
          },
          {
            id: "3",
            type: "features",
            title: "Reach (self-reported)",
            body: "Platforms · approx audience · past brands",
            visible: true,
          },
        ],
      },
      services: {
        blocks: [
          {
            id: "1",
            type: "text",
            title: "All links",
            body: "Your full link hub — edit titles and URLs in the builder.",
            visible: true,
          },
          {
            id: "2",
            type: "link",
            title: "Instagram",
            body: "",
            visible: true,
            data: { href: "https://instagram.com", buttonLabel: "Instagram" },
          },
          {
            id: "3",
            type: "link",
            title: "YouTube",
            body: "",
            visible: true,
            data: { href: "https://youtube.com", buttonLabel: "YouTube" },
          },
          {
            id: "4",
            type: "link",
            title: "Portfolio",
            body: "",
            visible: true,
            data: { href: "/about", buttonLabel: "View portfolio" },
          },
          {
            id: "5",
            type: "link",
            title: "Contact / collab",
            body: "",
            visible: true,
            data: { href: "/contact", buttonLabel: "Get in touch" },
          },
        ],
      },
      contact: {
        blocks: [
          {
            id: "1",
            type: "contact",
            title: "Collab & contact",
            body: "Brands: include brand name, budget range, and brief. This is a lead form — not checkout.",
            visible: true,
            data: { phone: "91XXXXXXXXXX", address: "", email: "" },
          },
          {
            id: "2",
            type: "whatsapp",
            title: "WhatsApp for collabs",
            body: "",
            visible: true,
            data: {
              phone: "91XXXXXXXXXX",
              message: "Hi! Brand collab enquiry from your ALINKS profile.",
            },
          },
          {
            id: "3",
            type: "text",
            title: "Rate card (display only)",
            body: "List package names and rates as text. No cart or payment on this profile.",
            visible: true,
          },
        ],
      },
      legal: {
        blocks: [
          {
            id: "1",
            type: "legal",
            title: "Terms & Privacy",
            body: "Your profile terms. Operated independently — not Artix.",
            visible: true,
          },
        ],
      },
    },
  },
  /**
   * Food Layer 1 — menu display + WhatsApp. No cart / dine-in QR.
   */
  food: {
    label: "Food / kitchen",
    theme: { ...defaultTheme, primaryColor: "#c2410c", accentColor: "#ea580c" },
    pages: {
      home: {
        hero: {
          title: "Your kitchen name",
          tagline: "Fresh food · Order on WhatsApp",
          imageUrl:
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop",
          ctaText: "View menu",
          ctaLink: "/menu",
        },
        blocks: [
          {
            id: "1",
            type: "features",
            title: "Why order with us",
            body: "Fresh · Hygienic · Fast WhatsApp ordering",
            visible: true,
          },
          {
            id: "2",
            type: "link",
            title: "Digital menu",
            body: "",
            visible: true,
            data: { href: "/menu", buttonLabel: "Browse menu" },
          },
          {
            id: "3",
            type: "whatsapp",
            title: "Order on WhatsApp",
            body: "Send your list — we confirm",
            visible: true,
            data: {
              phone: "91XXXXXXXXXX",
              message: "Hi! I want to order from your ALINKS menu.",
            },
          },
        ],
      },
      about: {
        blocks: [
          {
            id: "1",
            type: "text",
            title: "Our kitchen",
            body: "Tell guests about your food, hygiene, and service area.",
            visible: true,
          },
        ],
      },
      services: {
        blocks: [
          {
            id: "1",
            type: "text",
            title: "Menu highlights",
            body: "Full menu lives on the Menu page — sections, veg/non-veg, WhatsApp order.",
            visible: true,
          },
          {
            id: "2",
            type: "link",
            title: "Open menu",
            body: "",
            visible: true,
            data: { href: "/menu", buttonLabel: "View menu" },
          },
        ],
      },
      contact: {
        blocks: [
          {
            id: "1",
            type: "contact",
            title: "Find us / call",
            body: "Hours and kitchen location.",
            visible: true,
            data: { phone: "91XXXXXXXXXX", address: "Your area, City" },
          },
          {
            id: "2",
            type: "hours",
            title: "Kitchen hours",
            body: "",
            visible: true,
            data: { lines: ["Mon–Sun: 11:00 AM – 10:00 PM"] },
          },
          {
            id: "3",
            type: "whatsapp",
            title: "WhatsApp kitchen",
            body: "",
            visible: true,
            data: { phone: "91XXXXXXXXXX", message: "Hi!" },
          },
        ],
      },
      legal: {
        blocks: [
          {
            id: "1",
            type: "legal",
            title: "Food terms",
            body: "Allergies, delivery radius, and cancellation notes.",
            visible: true,
          },
        ],
      },
    },
  },
  bookings: {
    label: "Bookings / consults",
    theme: { ...defaultTheme, primaryColor: "#1e3a5f", accentColor: "#3b82f6" },
    pages: {
      home: {
        hero: {
          title: "Your practice or venue",
          tagline: "Book a slot online — free or pay when you visit",
          imageUrl:
            "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop",
          ctaText: "Book now",
          ctaLink: "/book",
        },
        blocks: [
          {
            id: "1",
            type: "features",
            title: "Why book with us",
            body: "Clear slots · Professional care · Easy WhatsApp follow-up",
            visible: true,
          },
          {
            id: "2",
            type: "link",
            title: "Book appointment",
            body: "",
            visible: true,
            data: { href: "/book", buttonLabel: "View slots" },
          },
          {
            id: "3",
            type: "whatsapp",
            title: "WhatsApp us",
            body: "",
            visible: true,
            data: { phone: "91XXXXXXXXXX", message: "Hi! I want to book via ALINKS." },
          },
        ],
      },
      about: {
        blocks: [
          {
            id: "1",
            type: "text",
            title: "About",
            body: "Tell clients who you serve. Clinic: license on file before go-live.",
            visible: true,
          },
        ],
      },
      services: {
        blocks: [
          {
            id: "1",
            type: "services",
            title: "Services",
            body: "Add packages in the editor",
            visible: true,
            data: {
              items: [
                { name: "Consultation", price: "₹499", duration: "30 min" },
                { name: "Follow-up", price: "₹299", duration: "15 min" },
              ],
            },
          },
          {
            id: "2",
            type: "link",
            title: "Book",
            body: "",
            visible: true,
            data: { href: "/book", buttonLabel: "Book a slot" },
          },
        ],
      },
      contact: {
        blocks: [
          {
            id: "1",
            type: "contact",
            title: "Contact",
            body: "",
            visible: true,
            data: { phone: "91XXXXXXXXXX", address: "Your area, City" },
          },
        ],
      },
      legal: {
        blocks: [
          {
            id: "1",
            type: "legal",
            title: "Terms",
            body: "Cancellation and consult disclaimers. No diagnosis marketplace.",
            visible: true,
          },
        ],
      },
    },
  },
  real_estate: {
    label: "Real estate",
    theme: { ...defaultTheme, primaryColor: "#14532d", accentColor: "#22c55e" },
    pages: {
      home: {
        hero: {
          title: "Your agency",
          tagline: "Property-Bank · leads · no online title sale",
          imageUrl:
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop",
          ctaText: "View listings",
          ctaLink: "/listings",
        },
        blocks: [
          {
            id: "1",
            type: "features",
            title: "Property-Bank",
            body: "Open · teaser · private listings · WhatsApp leads",
            visible: true,
          },
          {
            id: "2",
            type: "link",
            title: "Listings",
            body: "",
            visible: true,
            data: { href: "/listings", buttonLabel: "Browse properties" },
          },
          {
            id: "3",
            type: "whatsapp",
            title: "WhatsApp agent",
            body: "",
            visible: true,
            data: { phone: "91XXXXXXXXXX", message: "Hi! Looking at your ALINKS listings." },
          },
        ],
      },
      about: {
        blocks: [
          {
            id: "1",
            type: "text",
            title: "About the agency",
            body: "RERA-aware marketing copy. No escrow or title checkout on ALINKS.",
            visible: true,
          },
        ],
      },
      services: {
        blocks: [
          {
            id: "1",
            type: "text",
            title: "How we help",
            body: "Buy · sell · rent · lease facilitation. Site visits on request.",
            visible: true,
          },
          {
            id: "2",
            type: "link",
            title: "Property-Bank",
            body: "",
            visible: true,
            data: { href: "/listings", buttonLabel: "Open listings" },
          },
        ],
      },
      contact: {
        blocks: [
          {
            id: "1",
            type: "contact",
            title: "Office",
            body: "",
            visible: true,
            data: { phone: "91XXXXXXXXXX", address: "City" },
          },
        ],
      },
      legal: {
        blocks: [
          {
            id: "1",
            type: "legal",
            title: "Disclaimers",
            body: "Listings are informational. No online property title purchase on ALINKS.",
            visible: true,
          },
        ],
      },
    },
  },
  education: {
    label: "Education",
    theme: { ...defaultTheme, primaryColor: "#1e40af", accentColor: "#3b82f6" },
    pages: {
      home: {
        hero: {
          title: "Your institute or teacher brand",
          tagline: "Courses · free enquiry · YouTube intros",
          imageUrl:
            "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop",
          ctaText: "View courses",
          ctaLink: "/courses",
        },
        blocks: [
          {
            id: "1",
            type: "features",
            title: "Why learn with us",
            body: "Clear fees · Demo friendly · YouTube intros only",
            visible: true,
          },
          {
            id: "2",
            type: "youtube",
            title: "Intro video",
            body: "Watch on YouTube — no other video hosts on ALINKS",
            visible: true,
            data: { youtubeUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw" },
          },
          {
            id: "3",
            type: "link",
            title: "Courses",
            body: "",
            visible: true,
            data: { href: "/courses", buttonLabel: "Browse courses" },
          },
          {
            id: "4",
            type: "whatsapp",
            title: "WhatsApp for demo",
            body: "",
            visible: true,
            data: { phone: "91XXXXXXXXXX", message: "Hi! Free demo enquiry from your ALINKS site." },
          },
        ],
      },
      about: {
        blocks: [
          {
            id: "1",
            type: "text",
            title: "About the teacher / institute",
            body: "Open catalogue of subjects — not music-only. Side-income tutors welcome.",
            visible: true,
          },
        ],
      },
      services: {
        blocks: [
          {
            id: "1",
            type: "text",
            title: "Programmes",
            body: "Full course list lives on the Courses page with YouTube intros and free enquiry.",
            visible: true,
          },
          {
            id: "2",
            type: "link",
            title: "All courses",
            body: "",
            visible: true,
            data: { href: "/courses", buttonLabel: "Open courses" },
          },
        ],
      },
      contact: {
        blocks: [
          {
            id: "1",
            type: "contact",
            title: "Contact",
            body: "Parents and students welcome.",
            visible: true,
            data: { phone: "91XXXXXXXXXX", address: "City" },
          },
        ],
      },
      legal: {
        blocks: [
          {
            id: "1",
            type: "legal",
            title: "Terms",
            body: "No guaranteed rank/job claims. YouTube embeds warrant content rights.",
            visible: true,
          },
        ],
      },
    },
  },

  fitness: {
    label: "Fitness",
    theme: { ...defaultTheme, primaryColor: "#9a3412", accentColor: "#ea580c" },
    pages: {
      home: {
        hero: {
          title: "Your gym or studio",
          tagline: "Trial classes · memberships · book free slots",
          imageUrl:
            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop",
          ctaText: "Book trial",
          ctaLink: "/book",
        },
        blocks: [
          {
            id: "1",
            type: "features",
            title: "Train with us",
            body: "Free trial · Group classes · PT packs · No medical claims",
            visible: true,
          },
          {
            id: "2",
            type: "link",
            title: "Book a class",
            body: "",
            visible: true,
            data: { href: "/book", buttonLabel: "Open schedule" },
          },
          {
            id: "3",
            type: "whatsapp",
            title: "WhatsApp gym",
            body: "",
            visible: true,
            data: { phone: "91XXXXXXXXXX", message: "Hi! Trial class from your ALINKS site." },
          },
        ],
      },
      about: {
        blocks: [
          {
            id: "1",
            type: "text",
            title: "About the studio",
            body: "Tell members about trainers, equipment, and hours. Not a medical clinic.",
            visible: true,
          },
        ],
      },
      services: {
        blocks: [
          {
            id: "1",
            type: "services",
            title: "Classes & memberships",
            body: "Manage full list under Packages in the editor",
            visible: true,
            data: {
              items: [
                { name: "Trial class", price: "Free", duration: "60 min" },
                { name: "Monthly membership", price: "₹1,499", duration: "30 days" },
                { name: "PT session", price: "₹999", duration: "45 min" },
              ],
            },
          },
          {
            id: "2",
            type: "link",
            title: "Book",
            body: "",
            visible: true,
            data: { href: "/book", buttonLabel: "Book now" },
          },
        ],
      },
      contact: {
        blocks: [
          {
            id: "1",
            type: "contact",
            title: "Visit us",
            body: "",
            visible: true,
            data: { phone: "91XXXXXXXXXX", address: "Studio address, City" },
          },
          {
            id: "2",
            type: "hours",
            title: "Hours",
            body: "",
            visible: true,
            data: { lines: ["Mon–Sat: 6:00 AM – 10:00 PM", "Sunday: 7:00 AM – 2:00 PM"] },
          },
        ],
      },
      legal: {
        blocks: [
          {
            id: "1",
            type: "legal",
            title: "Terms",
            body: "No disease-cure claims. Train at your own risk; follow trainer guidance.",
            visible: true,
          },
        ],
      },
    },
  },

  automotive: {
    label: "Automotive",
    theme: { ...defaultTheme, primaryColor: "#1e293b", accentColor: "#f59e0b" },
    pages: {
      home: {
        hero: {
          title: "Your dealership or workshop",
          tagline: "Vehicles · service · enquiry — no online car checkout",
          imageUrl:
            "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200&auto=format&fit=crop",
          ctaText: "View stock",
          ctaLink: "/vehicles",
        },
        blocks: [
          {
            id: "1",
            type: "features",
            title: "Why choose us",
            body: "Verified stock · Test drive · Workshop care",
            visible: true,
          },
          {
            id: "2",
            type: "link",
            title: "Vehicles",
            body: "",
            visible: true,
            data: { href: "/vehicles", buttonLabel: "Browse inventory" },
          },
          {
            id: "3",
            type: "link",
            title: "Book service",
            body: "",
            visible: true,
            data: { href: "/book", buttonLabel: "Workshop slots" },
          },
          {
            id: "4",
            type: "whatsapp",
            title: "WhatsApp dealer",
            body: "",
            visible: true,
            data: { phone: "91XXXXXXXXXX", message: "Hi! Interested in a vehicle from your ALINKS site." },
          },
        ],
      },
      about: {
        blocks: [
          {
            id: "1",
            type: "text",
            title: "About us",
            body: "Deals close offline (RC, loan, insurance). ALINKS is showcase + leads + service booking.",
            visible: true,
          },
        ],
      },
      services: {
        blocks: [
          {
            id: "1",
            type: "services",
            title: "Workshop services",
            body: "Book free inspection slots online",
            visible: true,
            data: {
              items: [
                { name: "General service", price: "₹2,499", duration: "2 hr" },
                { name: "Free inspection", price: "Free", duration: "30 min" },
              ],
            },
          },
        ],
      },
      contact: {
        blocks: [
          {
            id: "1",
            type: "contact",
            title: "Showroom / workshop",
            body: "",
            visible: true,
            data: { phone: "91XXXXXXXXXX", address: "Auto street, City" },
          },
        ],
      },
      legal: {
        blocks: [
          {
            id: "1",
            type: "legal",
            title: "Terms",
            body: "No online vehicle title purchase on ALINKS. Prices indicative.",
            visible: true,
          },
        ],
      },
    },
  },

};