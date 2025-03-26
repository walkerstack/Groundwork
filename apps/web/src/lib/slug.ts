import _slugify from "slugify";

export const validSlugRegex = new RegExp(/^[a-zA-Z0-9\-]+$/);

export const toSlug = (text: string, suffix?: string) => {
  return (
    _slugify(text, {
      lower: true,
      strict: true,
      trim: true,
    }) + (suffix ? `-${suffix}` : "")
  );
};
