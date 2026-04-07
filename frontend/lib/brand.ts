export const CAVO_BRAND = {
  name: "Cavo",
  phoneLocal: "01221204322",
  phoneIntl: "201221204322",
  whatsappBase: "https://wa.me/201221204322",
  tagline: "Premium footwear with fast WhatsApp ordering.",
  heroAlert: "Premium Cavo Footwear • Order directly on WhatsApp",
  social: {
    instagram: "https://instagram.com/cavo_eg",
    telegram: "https://t.me/cavo_eg",
    facebook: "https://facebook.com/cavoeg",
    tiktok: "https://tiktok.com/@cavo_eg"
  }
};

export function createWhatsAppLink(message?: string) {
  const text = encodeURIComponent(message || "Hello Cavo, I want to order from your store.");
  return `${CAVO_BRAND.whatsappBase}?text=${text}`;
}
