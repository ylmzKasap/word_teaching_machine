export default function find_closest_element(
  event: React.MouseEvent,
  selectors: string[]
): HTMLElement | null {
  // Accepts an array of selectors and returns the first closest element.
  const element = event.target as HTMLInputElement;

  for (let selector of selectors) {
    const closestItem = element.closest(selector) as HTMLElement | null;
    if (closestItem) {
      return closestItem;
    }
  }

  return null;
}