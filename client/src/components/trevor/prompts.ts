// Suggested prompts shown as chips when the conversation is empty.
// These are picked to match real products in the seeded catalogue,
// so Trevor always returns results when one is clicked.
// Click "More ideas" to reshuffle 5 new ones from this pool.
export const TREVOR_PROMPT_POOL: string[] = [
  'Show me Samsung smart TVs',
  'Find Sony noise cancelling headphones',
  'I want a PlayStation 5 console',
  'Show me Apple iPhones',
  'Find a Dyson vacuum cleaner',
  'Show me Ninja air fryers',
  'I want a Weber BBQ for the garden',
  'Show me Apple Watches',
  'Find Fitbit fitness trackers',
  'Show me LEGO sets',
  'I want a Nintendo Switch',
  'Show me Nespresso coffee machines',
  'Find a Habitat sofa',
  'Show me Garmin smart watches',
  'I want Apple AirPods',
  'Find Bosch lawnmowers',
  'Show me Philips Hue smart lights',
  'I want a Canon camera',
  'Find Tefal air fryers',
  'Show me Pandora jewellery',
]

export function pickRandomPrompts(count = 5): string[] {
  const shuffled = [...TREVOR_PROMPT_POOL].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
