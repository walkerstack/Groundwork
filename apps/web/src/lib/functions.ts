// chunk an array into smaller arrays of a given size
export const chunkArray = <T>(array: T[], size: number) => {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size),
  );
};

// capitalize first character of each word in a string
export const capitalize = (str?: string | null) => {
  if (!str || typeof str !== "string") return str;
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
