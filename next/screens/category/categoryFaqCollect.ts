import type { CategoryFAQ, CategoryNode } from "@/types/categories";

export function collectCategoryFaqs(category: CategoryNode, locale: string): CategoryFAQ[] {
  const faqs = (category.faq || []).filter((faq) => faq.lang === locale);
  return faqs.sort((a, b) => a.order - b.order);
}
