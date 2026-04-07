import { PrismaClient, BannerPlacement, SocialPlatform } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    {
      slug: 'men',
      nameEn: 'Men',
      nameAr: 'رجالي',
      descriptionEn: 'Men\'s sneakers and lifestyle shoes.',
      descriptionAr: 'أحذية رياضية وكاجوال رجالي.',
      showOnHome: true,
      sortOrder: 1,
    },
    {
      slug: 'women',
      nameEn: 'Women',
      nameAr: 'حريمي',
      descriptionEn: 'Women\'s sneakers and lifestyle shoes.',
      descriptionAr: 'أحذية رياضية وكاجوال حريمي.',
      showOnHome: true,
      sortOrder: 2,
    },
    {
      slug: 'kids',
      nameEn: 'Kids',
      nameAr: 'أطفال',
      descriptionEn: 'Kids shoes built for comfort and movement.',
      descriptionAr: 'أحذية أطفال مريحة وعملية للحركة اليومية.',
      showOnHome: true,
      sortOrder: 3,
    },
    {
      slug: 'offers',
      nameEn: 'Offers',
      nameAr: 'عروض',
      descriptionEn: 'Special deals and limited-time drops.',
      descriptionAr: 'عروض خاصة وتخفيضات لفترة محدودة.',
      showOnHome: true,
      sortOrder: 4,
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        nameEn: category.nameEn,
        nameAr: category.nameAr,
        descriptionEn: category.descriptionEn,
        descriptionAr: category.descriptionAr,
        showOnHome: category.showOnHome,
        sortOrder: category.sortOrder,
        isActive: true,
      },
      create: category,
    });
  }

  const generalSettings = [
    { key: 'site_name_en', group: 'general', label: 'Site name (EN)', value: 'Cavo' },
    { key: 'site_name_ar', group: 'general', label: 'Site name (AR)', value: 'كافو' },
    { key: 'site_tagline_en', group: 'branding', label: 'Tagline (EN)', value: 'Mirror Original. Best Price. Best Quality.' },
    { key: 'site_tagline_ar', group: 'branding', label: 'Tagline (AR)', value: 'مرآة للأصلي. أفضل سعر. أفضل جودة.' },
    { key: 'support_email', group: 'contact', label: 'Support email', value: 'hello@cavo.eg' },
    { key: 'support_phone', group: 'contact', label: 'Support phone', value: '+20 100 000 0000' },
    { key: 'currency', group: 'commerce', label: 'Store currency', value: 'EGP' },
    { key: 'whatsapp_number', group: 'contact', label: 'WhatsApp number', value: '+20 100 000 0000' },
  ];

  for (const setting of generalSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {
        group: setting.group,
        label: setting.label,
        value: setting.value,
      },
      create: setting,
    });
  }

  const socialLinks = [
    { platform: SocialPlatform.WHATSAPP, label: 'WhatsApp', url: 'https://wa.me/201000000000', sortOrder: 1 },
    { platform: SocialPlatform.INSTAGRAM, label: 'Instagram', url: 'https://instagram.com/cavo.eg', sortOrder: 2 },
    { platform: SocialPlatform.TELEGRAM, label: 'Telegram', url: 'https://t.me/cavoeg', sortOrder: 3 },
    { platform: SocialPlatform.FACEBOOK, label: 'Facebook', url: 'https://facebook.com/cavo.eg', sortOrder: 4 },
    { platform: SocialPlatform.TIKTOK, label: 'TikTok', url: 'https://tiktok.com/@cavo.eg', sortOrder: 5 },
  ];

  for (const link of socialLinks) {
    await prisma.socialLink.upsert({
      where: { id: `${link.platform.toLowerCase()}-seed` },
      update: {
        label: link.label,
        url: link.url,
        sortOrder: link.sortOrder,
        isActive: true,
      },
      create: {
        id: `${link.platform.toLowerCase()}-seed`,
        platform: link.platform,
        label: link.label,
        url: link.url,
        sortOrder: link.sortOrder,
        isActive: true,
      },
    });
  }

  await prisma.banner.upsert({
    where: { id: 'home-hero-seed' },
    update: {
      titleEn: 'Step Into Your Style',
      titleAr: 'امشِ على ذوقك',
      subtitleEn: 'Fresh drops from top brands, curated for everyday wear.',
      subtitleAr: 'تشكيلة جديدة من أفضل الماركات مختارة للبس اليومي.',
      imageUrl: '/images/banners/home-hero.jpg',
      placement: BannerPlacement.HOME_HERO,
      sortOrder: 1,
      isActive: true,
    },
    create: {
      id: 'home-hero-seed',
      titleEn: 'Step Into Your Style',
      titleAr: 'امشِ على ذوقك',
      subtitleEn: 'Fresh drops from top brands, curated for everyday wear.',
      subtitleAr: 'تشكيلة جديدة من أفضل الماركات مختارة للبس اليومي.',
      imageUrl: '/images/banners/home-hero.jpg',
      placement: BannerPlacement.HOME_HERO,
      sortOrder: 1,
      isActive: true,
    },
  });

  const faqRows = [
    {
      categoryKey: 'orders',
      questionEn: 'How do I place an order?',
      questionAr: 'كيف أطلب منتج؟',
      answerEn: 'Choose your product, select size and color, then complete checkout or contact us on WhatsApp.',
      answerAr: 'اختر المنتج وحدد المقاس واللون ثم أكمل الطلب أو تواصل معنا عبر واتساب.',
      sortOrder: 1,
    },
    {
      categoryKey: 'shipping',
      questionEn: 'Which payment methods are available?',
      questionAr: 'ما طرق الدفع المتاحة؟',
      answerEn: 'Vodafone Cash, Insta Pay, and cash on delivery when available.',
      answerAr: 'فودافون كاش وإنستا باي والدفع عند الاستلام عند التوفر.',
      sortOrder: 2,
    },
  ];

  for (const faq of faqRows) {
    await prisma.faq.upsert({
      where: {
        id: `${faq.categoryKey}-${faq.sortOrder}`,
      },
      update: faq,
      create: {
        id: `${faq.categoryKey}-${faq.sortOrder}`,
        ...faq,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
