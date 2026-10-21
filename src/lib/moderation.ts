import { ModerationResult, PracticalTag, ObservationTag, DispatchTag } from '@/types/database'

export const PRACTICAL_TAGS: PracticalTag[] = ['delay', 'crowding', 'safety', 'clear']
export const OBSERVATION_TAGS: ObservationTag[] = ['sightings', 'kindness', 'small moments', 'vibes']

export const TAG_LABEL: Record<DispatchTag | string, string> = {
  delay: 'Delayed',
  crowding: 'Crowded',
  safety: 'Safety concern',
  clear: 'All clear',
  sightings: 'Sighting',
  kindness: 'Kindness',
  'small moments': 'Small moment',
  vibes: 'Vibes',
}

const BANNED = ['fuck', 'shit', 'bitch', 'bastard', 'asshole', 'slut', 'retard', 'whore']

const CRISIS = [
  'end my life',
  'ending my life',
  'suicide',
  'suicidal',
  'kill myself',
  'killing myself',
  'want to die',
  'end it all',
]

export const CRISIS_MESSAGE =
  "If you're struggling, please reach out to a local helpline or someone you trust."

/**
 * Moderation check: returns null when text is clean, otherwise a reason with a kind.
 */
export function checkText(text: string): ModerationResult | null {
  const t = text.toLowerCase()
  if (CRISIS.some((w) => t.includes(w))) {
    return { kind: 'crisis', message: CRISIS_MESSAGE }
  }
  if (BANNED.some((w) => new RegExp('\\b' + w, 'i').test(t))) {
    return { kind: 'abuse', message: 'Please rewrite this without abusive language.' }
  }
  return null
}
