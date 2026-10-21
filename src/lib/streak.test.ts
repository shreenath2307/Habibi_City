import { describe, it, expect, beforeEach } from 'vitest'
import { getStreak, bumpStreak, dayString, yesterdayString } from './streak'

describe('Commuter Streak Logic', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('initializes at 0 when no prior streak exists', () => {
    expect(getStreak()).toBe(0)
  })

  it('increments streak on the first observation of the day', () => {
    const streak = bumpStreak()
    expect(streak).toBe(1)
    expect(getStreak()).toBe(1)
  })

  it('does not increment multiple times on the same day', () => {
    bumpStreak()
    const streakSecondTime = bumpStreak()
    expect(streakSecondTime).toBe(1)
    expect(getStreak()).toBe(1)
  })

  it('increments from yesterday to today', () => {
    // Simulate a streak from yesterday
    const yesterday = yesterdayString()
    localStorage.setItem('commute_streak', JSON.stringify({ count: 4, last: yesterday }))

    expect(getStreak()).toBe(4)
    const newStreak = bumpStreak()
    expect(newStreak).toBe(5)
    expect(getStreak()).toBe(5)
  })

  it('resets streak to 0 if more than 1 day was missed', () => {
    // 3 days ago
    const oldDate = new Date()
    oldDate.setDate(oldDate.getDate() - 3)
    const oldStr = dayString(oldDate)

    localStorage.setItem('commute_streak', JSON.stringify({ count: 12, last: oldStr }))
    expect(getStreak()).toBe(0)
  })
})
