-- Questbound Guild Shop Seed Items
-- At least 8 items across four item types: theme, badge, avatar_frame, effect

INSERT INTO items (slug, name, description, item_type, price, metadata, is_active) VALUES
  -- THEMES
  (
    'theme-moonlit-guild',
    'Moonlit Guild Hall',
    'The classical aesthetic of the guild hall bathed in midnight azure and astral cyan.',
    'theme',
    0,
    '{"themeId": "moonlit", "primaryColor": "#6ee7f9", "bgColor": "#0b1020", "surfaceColor": "#151d32"}'::jsonb,
    true
  ),
  (
    'theme-solar-sanctum',
    'Solar Sanctum',
    'A radiant daylight sanctuary filled with golden sunlight and warm sandstone glow.',
    'theme',
    150,
    '{"themeId": "solar", "primaryColor": "#f6c453", "bgColor": "#14100c", "surfaceColor": "#221a14"}'::jsonb,
    true
  ),
  (
    'theme-shadow-grove',
    'Shadow Grove',
    'An ancient mystical grove shrouded in bioluminescent emerald moss and obsidian night.',
    'theme',
    200,
    '{"themeId": "shadow", "primaryColor": "#78e6a0", "bgColor": "#0a1612", "surfaceColor": "#13241d"}'::jsonb,
    true
  ),

  -- BADGES
  (
    'badge-novice-adventurer',
    'Novice Adventurer',
    'Awarded to courageous seekers who take their very first steps into the guild.',
    'badge',
    25,
    '{"icon": "Compass", "rarity": "common", "color": "#6ee7f9"}'::jsonb,
    true
  ),
  (
    'badge-iron-will',
    'Iron Will',
    'Forged through relentless consistency, discipline, and unstoppable habit streaks.',
    'badge',
    75,
    '{"icon": "Flame", "rarity": "rare", "color": "#f6c453"}'::jsonb,
    true
  ),
  (
    'badge-grand-archivist',
    'Grand Archivist',
    'The seal of profound intellect and scholarly devotion to life quests.',
    'badge',
    120,
    '{"icon": "BookOpen", "rarity": "epic", "color": "#c084fc"}'::jsonb,
    true
  ),

  -- AVATAR FRAMES
  (
    'frame-laurel-of-dawn',
    'Laurel of Dawn',
    'A circular crest interwoven with silver enchanted leaves.',
    'avatar_frame',
    50,
    '{"borderStyle": "double", "borderColor": "#6ee7f9", "glow": "0 0 15px rgba(110, 231, 249, 0.5)"}'::jsonb,
    true
  ),
  (
    'frame-obsidian-crest',
    'Obsidian Crest',
    'Sharpened volcanic rune edges that shimmer with dark defensive energy.',
    'avatar_frame',
    100,
    '{"borderStyle": "solid", "borderColor": "#94a3b8", "glow": "0 0 15px rgba(148, 163, 184, 0.4)"}'::jsonb,
    true
  ),
  (
    'frame-starlight-halo',
    'Starlight Halo',
    'A celestial orbital ring that pulses with cosmic stardust.',
    'avatar_frame',
    180,
    '{"borderStyle": "dashed", "borderColor": "#f6c453", "glow": "0 0 20px rgba(246, 196, 83, 0.6)"}'::jsonb,
    true
  ),

  -- CELEBRATION EFFECTS
  (
    'effect-starlight-burst',
    'Starlight Burst',
    'Summons prismatic cosmic star particles whenever you complete a quest.',
    'effect',
    80,
    '{"particles": ["★", "✦", "✧"], "colors": ["#6ee7f9", "#ffffff", "#c084fc"]}'::jsonb,
    true
  ),
  (
    'effect-dragonfire-spark',
    'Dragonfire Sparks',
    'Ignites molten gold embers and fiery celebration blasts upon triumph.',
    'effect',
    140,
    '{"particles": ["🔥", "✨", "💥"], "colors": ["#f6c453", "#ff8b7b", "#f97316"]}'::jsonb,
    true
  )
ON CONFLICT (slug) DO NOTHING;
