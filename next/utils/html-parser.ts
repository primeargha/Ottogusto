import { STORE_IDS } from "@/config/store-constants";

export const parseHtmlToString = (htmlString: string, store: string): string => {
  const parser = new DOMParser();
  let doc = parser.parseFromString(htmlString, "text/html");

  const convertNode = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      return text ? text : "";
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tag = element.tagName.toLowerCase();
      const className = element.getAttribute("class") || "";
      const children = Array.from(node.childNodes).map(convertNode).join("");

      switch (tag) {
        case "p":
          if (className === "p1") {
            return "";
          }

          const textContent = element.textContent?.trim();
          if (textContent && element.querySelectorAll("span").length > 0) {
            return textContent;
          }

          return `<p class="${className || "text-color-text-body body-regular-md mb-4"}">${children}</p>`;

        case "span":
          return children;

        case "h1":
          return `<h1 class="${className || "text-color-text-body font-bold text-2xl mb-4"}">${children}</h1>`;

        case "h2":
          return `<h2 class="${className || "text-color-text-body font-bold text-xl mb-3"}">${children}</h2>`;

        case "h3":
          return `<h3 class="${className || "text-color-text-body font-bold text-lg mb-3"}">${children}</h3>`;

        case "h4":
          return `<h4 class="${className || "text-color-text-body font-bold text-base mb-3"}">${children}</h4>`;

        case "h5":
          return `<h5 class="${className || "text-color-text-body font-bold mb-2"}">${children}</h5>`;

        case "h6":
          return `<h6 class="${className || "text-color-text-body font-bold mb-2"}">${children}</h6>`;

        case "ul":
          return `<ul class="${className || "list-disc list-inside mb-4"}">${children}</ul>`;

        case "ol":
          return `<ol class="${className || "list-decimal list-inside mb-4"}">${children}</ol>`;

        case "li":
          return `<li class="${className || "text-color-text-body mb-2"}">${children}</li>`;

        case "a":
          const href = element.getAttribute("href") || "#";
          return `<a href="${href}" class="${className || "text-color-primary-main hover:underline"}">${children}</a>`;

        case "strong":
        case "b":
          return `<strong class="${className || "font-bold"}">${children}</strong>`;

        case "em":
        case "i":
          return `<em class="${className || "italic"}">${children}</em>`;

        case "div":
          return `<div class="${className}">${children}</div>`;

        case "section":
          return `<section class="${className}">${children}</section>`;

        case "article":
          return `<article class="${className}">${children}</article>`;

        default:
          return children.length > 0 ? `<div class="${className}">${children}</div>` : "";
      }
    }
    return "";
  };

  const result = Array.from(doc.body.childNodes).map(convertNode).join("");
  return result;
};
