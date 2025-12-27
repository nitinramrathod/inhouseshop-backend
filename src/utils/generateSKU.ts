export const generateSKU = (category: string, brand: string) => {
  const rand = Math.floor(1000 + Math.random() * 9000);
  const date = Date.now().toString().slice(-5);

  const clean = (v: string) =>
    v.trim().toUpperCase().replace(/\s+/g, "-");

  return `SKU-${clean(category)}-${clean(brand)}-${date}-${rand}`;
};