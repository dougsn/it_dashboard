// Rasterize inline SVGs to PNG <img> using data: URLs.
// CSP allows data: but not blob:, so we use canvas → data:image/png.
async function rasterizeSvgs(root: HTMLElement): Promise<() => void> {
  const svgs = Array.from(root.querySelectorAll<SVGSVGElement>("svg"));
  const replacements: { placeholder: HTMLImageElement; parent: Element; svg: SVGSVGElement }[] = [];

  await Promise.all(svgs.map((svg, idx) => new Promise<void>(resolve => {
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) { resolve(); return; }

    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) { resolve(); return; }
    ctx.scale(scale, scale);

    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(rect.width));
    clone.setAttribute("height", String(rect.height));

    const svgStr = new XMLSerializer().serializeToString(clone);
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const placeholder = document.createElement("img");
      placeholder.src = canvas.toDataURL("image/png");
      placeholder.style.width = `${rect.width}px`;
      placeholder.style.height = `${rect.height}px`;
      placeholder.style.display = "block";
      const parent = svg.parentElement!;
      parent.insertBefore(placeholder, svg);
      svg.style.display = "none";
      replacements.push({ placeholder, parent, svg });
      resolve();
    };
    img.onerror = () => { console.error(`[PDF] SVG[${idx}] erro`); resolve(); };
    img.src = dataUrl;
  })));

  return () => {
    for (const { placeholder, parent, svg } of replacements) {
      svg.style.display = "";
      parent.removeChild(placeholder);
    }
  };
}

// Returns a function that resolves lab/oklch/lch colors to rgb() via canvas.
// The browser 2D canvas handles all color spaces natively.
function makeColorResolver() {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 1;
  const ctx = cv.getContext("2d")!;
  return (color: string): string => {
    if (!/lab\(|oklch\(|lch\(/.test(color)) return color;
    try {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return a < 255 ? `rgba(${r},${g},${b},${+(a / 255).toFixed(3)})` : `rgb(${r},${g},${b})`;
    } catch { return color; }
  };
}

// Set rgb() inline styles on all descendants so html2canvas never reads lab() values.
// Firefox's getComputedStyle returns lab() for oklch colors — inlining rgb() overrides it.
function applyRgbInlineColors(root: HTMLElement, resolve: (c: string) => string) {
  const PROPS = [
    "color", "background-color",
    "border-top-color", "border-right-color",
    "border-bottom-color", "border-left-color",
  ];
  const all = [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))];
  for (const el of all) {
    const computed = window.getComputedStyle(el);
    for (const prop of PROPS) {
      const val = computed.getPropertyValue(prop);
      if (!val) continue;
      el.style.setProperty(prop, resolve(val));
    }
  }
}

// Export the given element as an A4 PDF.
// Clones the element into a fixed off-screen container so the sidebar x-offset
// doesn't shift the PDF content, then rasterizes SVGs and resolves oklch colors.
export async function exportToPdf(element: HTMLElement): Promise<void> {
  const resolver = makeColorResolver();

  const pdfContainer = document.createElement("div");
  pdfContainer.style.cssText =
    "position:fixed;top:0;left:-9999px;width:794px;background:white;pointer-events:none;";
  const clone = element.cloneNode(true) as HTMLElement;
  pdfContainer.appendChild(clone);
  document.body.appendChild(pdfContainer);

  let restoreSvgs: (() => void) | null = null;
  try {
    applyRgbInlineColors(clone, resolver);
    restoreSvgs = await rasterizeSvgs(clone);

    const html2pdf = (await import("html2pdf.js")).default;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const opts: any = {
      margin: [10, 15, 10, 15],
      filename: `relatorio-${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: "jpeg", quality: 0.97 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: "css", before: [".pdf-break"], avoid: ["tr"] },
    };
    await html2pdf().set(opts).from(clone).save();
  } finally {
    restoreSvgs?.();
    document.body.removeChild(pdfContainer);
  }
}
