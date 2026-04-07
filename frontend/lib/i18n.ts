export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const dictionaries = {
  en: {
    home: "Home",
    products: "Products",
    about: "About",
    contact: "Contact",
    cart: "Cart",
    checkout: "Checkout"
  },
  ar: {
    home: "الرئيسية",
    products: "المنتجات",
    about: "من نحن",
    contact: "اتصل بنا",
    cart: "السلة",
    checkout: "الدفع"
  }
};
