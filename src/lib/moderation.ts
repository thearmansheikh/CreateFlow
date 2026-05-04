// Minimal prompt safety filter for AI generation routes.
// This is a *first line* of defense — not a substitute for proper moderation.
// For a production-grade product, layer OpenAI's moderation endpoint or
// Anthropic's safety classifiers on top of this. The rules below target the
// categories with the highest legal/PR risk for an open AI generation tool.

interface ModerationResult {
  ok: boolean
  category?: string
  reason?: string
}

// Word-boundary patterns. Each entry is a category + a list of regexes.
// Patterns are case-insensitive and matched against the full prompt.
const RULES: Array<{ category: string; patterns: RegExp[]; reason: string }> = [
  {
    category: 'csam',
    reason:
      'Sexual or suggestive content involving minors is strictly prohibited.',
    patterns: [
      /\b(child|kid|minor|underage|toddler|infant|teen|teenager|young\s+girl|young\s+boy|preteen|loli|shota)\b[^.]{0,80}\b(nude|naked|sexual|sex|erotic|nsfw|porn|fuck|breast|nipple|genital|undressed|bikini|lingerie)\b/i,
      /\b(nude|naked|sexual|sex|erotic|nsfw|porn|fuck|breast|nipple|genital)\b[^.]{0,80}\b(child|kid|minor|underage|toddler|infant|teen|teenager|young\s+girl|young\s+boy|preteen|loli|shota)\b/i,
      /\bcsam\b/i,
    ],
  },
  {
    category: 'self_harm',
    reason: 'Content promoting self-harm or suicide is not allowed.',
    patterns: [
      /\b(how\s+to|guide\s+to|instructions?\s+for|tutorial)\s+(commit\s+)?suicide\b/i,
      /\b(how\s+to|guide\s+to|instructions?\s+for|tutorial)\s+(self.?harm|cut\s+myself|kill\s+myself)\b/i,
    ],
  },
  {
    category: 'weapon_synthesis',
    reason:
      'Instructions for creating weapons or hazardous materials are not allowed.',
    patterns: [
      /\b(how\s+to|guide\s+to|instructions?\s+for|synthesize|recipe|make)\b[^.]{0,80}\b(bomb|explosive|nerve\s+agent|sarin|vx|anthrax|ricin|chemical\s+weapon|biological\s+weapon|bioweapon|nuclear\s+device|dirty\s+bomb)\b/i,
    ],
  },
  {
    category: 'malware',
    reason: 'Generation of working malware or exploit code is not allowed.',
    patterns: [
      /\b(write|generate|create|build)\b[^.]{0,40}\b(ransomware|keylogger|stealer|botnet|rootkit|cryptolocker|trojan|spyware)\b/i,
    ],
  },
]

export function moderatePrompt(prompt: string): ModerationResult {
  if (!prompt || typeof prompt !== 'string') {
    return { ok: true }
  }

  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(prompt)) {
        return { ok: false, category: rule.category, reason: rule.reason }
      }
    }
  }

  return { ok: true }
}

export const MODERATION_ERROR_BODY = (result: ModerationResult) => ({
  error:
    result.reason ?? 'This prompt was blocked by our content safety filter.',
  category: result.category,
  blocked: true,
})
