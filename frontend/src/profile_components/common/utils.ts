export function extract_int(str: string) {
  const intMatch = str.match(/\d+$/);
  return intMatch ? intMatch[0] : "";
}

export function to_title(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function snakify(str: string) {
  return str.split(" ").join("_").toLowerCase();
}
