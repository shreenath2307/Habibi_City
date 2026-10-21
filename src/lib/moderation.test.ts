import { describe, it, expect } from 'vitest'
import { checkText, CRISIS_MESSAGE, PRACTICAL_TAGS, OBSERVATION_TAGS, TAG_LABEL } from './moderation'

describe('Moderation Logic (checkText)', () => {
  it('returns null for standard positive commuter notes', () => {
    expect(checkText('Clean train this morning, arrived right on schedule.')).toBeNull()
    expect(checkText('Someone offered me their seat near Dadar. Kindness exists.')).toBeNull()
  })

  it('detects crisis keywords and returns crisis helpline message', () => {
    const crisisQueries = [
      'I want to end my life on the tracks',
      'Feeling completely suicidal today',
      'thinking about killing myself',
      'I want to die',
    ]

    for (const phrase of crisisQueries) {
      const res = checkText(phrase)
      expect(res).not.toBeNull()
      expect(res?.kind).toBe('crisis')
      expect(res?.message).toBe(CRISIS_MESSAGE)
    }
  })

  it('detects banned abusive words and flags as abuse', () => {
    const abusivePhrases = [
      'What a fucking terrible delay',
      'This driver is an asshole',
      'Total piece of shit service',
    ]

    for (const phrase of abusivePhrases) {
      const res = checkText(phrase)
      expect(res).not.toBeNull()
      expect(res?.kind).toBe('abuse')
      expect(res?.message).toContain('abusive language')
    }
  })

  it('has consistent tags and human readable labels', () => {
    expect(PRACTICAL_TAGS).toEqual(['delay', 'crowding', 'safety', 'clear'])
    expect(OBSERVATION_TAGS).toEqual(['sightings', 'kindness', 'small moments', 'vibes'])
    expect(TAG_LABEL['delay']).toBe('Delayed')
    expect(TAG_LABEL['kindness']).toBe('Kindness')
  })
})
