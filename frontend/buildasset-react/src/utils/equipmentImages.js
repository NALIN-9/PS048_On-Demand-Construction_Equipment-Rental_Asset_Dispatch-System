/**
 * Curated high-resolution, multi-angle industrial machinery photo galleries.
 */
export const CATEGORY_GALLERY_PRESETS = {
  "Dump Truck": [
    "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1508873696983-2df570464756?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80",
  ],
  "Excavator": [
    "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1579487785973-74d2ca7abdd5?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1504307651554-6691fc9d0554?auto=format&fit=crop&w=1200&q=80",
  ],
  "Bulldozer": [
    "https://images.unsplash.com/photo-1584463699042-3081045a7674?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80",
  ],
  "Crane": [
    "https://images.unsplash.com/photo-1508873696983-2df570464756?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80",
  ],
  "Backhoe Loader": [
    "https://images.unsplash.com/photo-1579487785973-74d2ca7abdd5?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1504307651554-6691fc9d0554?auto=format&fit=crop&w=1200&q=80",
  ],
  "Compactor": [
    "https://images.unsplash.com/photo-1504307651554-6691fc9d0554?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80",
  ],
  "Motor Grader": [
    "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80",
  ],
  "Wheel Loader": [
    "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1584463699042-3081045a7674?auto=format&fit=crop&w=1200&q=80",
  ],
  "Forklift": [
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80",
  ],
};

export const CATEGORY_IMAGE_PRESETS = Object.fromEntries(
  Object.entries(CATEGORY_GALLERY_PRESETS).map(([k, v]) => [k, v[0]])
);

/**
 * Returns a 100% reliable, zero-network SVG data URI blueprint for any machinery category
 */
export const getCategorySvgPlaceholder = (category = "Machinery", title = "") => {
  const cat = (category || "Heavy Machinery").toUpperCase();
  const name = (title || "").toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
    <defs>
      <linearGradient id="bgG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="50%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#090d16"/>
      </linearGradient>
      <linearGradient id="amberG" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#d97706"/>
      </linearGradient>
      <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#334155" stroke-width="0.8" opacity="0.35"/>
      </pattern>
    </defs>
    <rect width="600" height="400" fill="url(#bgG)"/>
    <rect width="600" height="400" fill="url(#grid)"/>
    <circle cx="300" cy="165" r="95" fill="#f59e0b" opacity="0.08"/>
    <g transform="translate(300, 150) scale(2.3)" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M -28 14 L 28 14 L 22 -4 L -18 -4 Z" fill="#f59e0b" fill-opacity="0.18"/>
      <circle cx="-15" cy="16" r="7" fill="#0f172a" stroke="#f59e0b" stroke-width="2.2"/>
      <circle cx="15" cy="16" r="7" fill="#0f172a" stroke="#f59e0b" stroke-width="2.2"/>
      <path d="M -6 -4 L -6 -20 L 10 -20 L 16 -4 Z" fill="#f59e0b" fill-opacity="0.25"/>
      <path d="M 10 -12 L 32 -22 L 42 -4"/>
    </g>
    <rect x="60" y="280" width="480" height="2" fill="url(#amberG)" opacity="0.7"/>
    <text x="300" y="320" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="20" fill="#f8fafc" text-anchor="middle" letter-spacing="3">${cat}</text>
    <text x="300" y="348" font-family="monospace" font-weight="700" font-size="12" fill="#f59e0b" text-anchor="middle" letter-spacing="2">${name || "BUILDASSET FLEET ASSET"}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const DEFAULT_MACHINERY_IMAGE = getCategorySvgPlaceholder("Machinery", "HEAVY LOGISTICS");


/**
 * Robust URL sanitizer that extracts direct image links from Google Images redirects,
 * cleans query strings, and fixes common paste mistakes.
 */
export const sanitizeImageUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  let url = rawUrl.trim();

  // Strip enclosing quotes
  if (
    (url.startsWith('"') && url.endsWith('"')) ||
    (url.startsWith("'") && url.endsWith("'"))
  ) {
    url = url.slice(1, -1).trim();
  }

  // Handle Google Images search result link format (e.g. google.com/imgres?imgurl=...)
  if (url.includes("google.com/imgres") || url.includes("google.") && url.includes("imgurl=")) {
    try {
      const parsed = new URL(url);
      const direct = parsed.searchParams.get("imgurl");
      if (direct) {
        return decodeURIComponent(direct);
      }
    } catch {
      // Regex fallback
      const match = url.match(/imgurl=([^&]+)/i);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }
  }

  // Handle Google Redirect url format (e.g. google.com/url?url=... or google.com/url?q=...)
  if (url.includes("google.") && (url.includes("/url?") || url.includes("url="))) {
    try {
      const parsed = new URL(url);
      const direct = parsed.searchParams.get("url") || parsed.searchParams.get("q");
      if (direct && (direct.startsWith("http://") || direct.startsWith("https://"))) {
        return decodeURIComponent(direct);
      }
    } catch {
      // ignore
    }
  }

  return url;
};

/**
 * Returns an array of image URLs for an equipment item.
 * Supports single URL, comma-separated URLs, JSON array string, or category presets.
 */
export const getEquipmentGallery = (imageUrl, category) => {
  if (imageUrl && imageUrl.trim()) {
    const trimmed = imageUrl.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.map(sanitizeImageUrl).filter(Boolean);
          if (cleaned.length > 0) return cleaned;
        }
      } catch {
        // Not valid JSON, proceed to comma check
      }
    }
    if (trimmed.includes(",")) {
      const parts = trimmed
        .split(",")
        .map((s) => sanitizeImageUrl(s))
        .filter(Boolean);
      if (parts.length > 0) return parts;
    }
    const single = sanitizeImageUrl(trimmed);
    if (single) return [single];
  }

  // Fallback to Category Preset Gallery
  const matchedKey = Object.keys(CATEGORY_GALLERY_PRESETS).find(
    (k) => k.toLowerCase() === (category || "").toLowerCase()
  );

  if (matchedKey && CATEGORY_GALLERY_PRESETS[matchedKey]?.length > 0) {
    return CATEGORY_GALLERY_PRESETS[matchedKey];
  }

  return [DEFAULT_MACHINERY_IMAGE];
};

/**
 * Returns the primary (single) image URL for equipment.
 */
export const getEquipmentImage = (imageUrl, category) => {
  const gallery = getEquipmentGallery(imageUrl, category);
  return gallery[0] || DEFAULT_MACHINERY_IMAGE;
};

/**
 * Helper to generate a direct Google Image Search URL for any equipment name & category
 */
export const getGoogleImageSearchUrl = (name, category, manufacturer) => {
  const queryParts = [manufacturer, name, category, "machinery hd photo"].filter(Boolean);
  const query = encodeURIComponent(queryParts.join(" "));
  return `https://www.google.com/search?tbm=isch&q=${query}`;
};

/**
 * Compresses an uploaded image File using HTML5 canvas to a lightweight base64 data URL.
 */
export const compressImageFile = (file, maxDimension = 1200, quality = 0.82) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Selected file is not an image."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image for processing."));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

