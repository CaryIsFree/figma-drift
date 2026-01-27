import type { Page } from 'playwright';

export interface ElementInfo {
  tagName: string;
  id: string;
  className: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor: string;
  color: string;
}

export async function scrapeDOM(page: Page): Promise<ElementInfo[]> {
  const script = `
    (function() {
      const elements = [];
      const all = document.querySelectorAll('*');

      function rgbToHex(rgb) {
        const result = rgb.match(/\\d+/g);
        if (!result || result.length < 3) return rgb;
        const r = parseInt(result[0]);
        const g = parseInt(result[1]);
        const b = parseInt(result[2]);
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
      }

      all.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return;

        const text = el.textContent ? el.textContent.trim().slice(0, 100) : '';
        
        elements.push({
          tagName: el.tagName,
          id: el.id,
          className: el.className,
          text: text,
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY,
          width: rect.width,
          height: rect.height,
          backgroundColor: rgbToHex(style.backgroundColor),
          color: rgbToHex(style.color)
        });
      });

      return elements;
    })()
  `;

  return await page.evaluate(script) as ElementInfo[];
}
