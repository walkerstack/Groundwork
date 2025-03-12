import _slugify from "slugify";

export const toSlug = (text: string, suffix?: string) => {
  return (
    _slugify(text, {
      lower: true,
      strict: true,
      trim: true,
    }) + (suffix ? `-${suffix}` : "")
  );
};
