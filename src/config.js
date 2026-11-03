export const SERVER = {
  id: '1533152480328941778',
  name: 'TwoWhit’s Tots',
  tag: '2WIT',
  tagline: 'Chill vibes only. 🥔',
  description:
    'A welcoming community for TwoWhit’s streams, Super Smash Bros. Ultimate, gaming, finding people to play, and learning together.',

  widgetUrl:
    'https://discord.com/api/guilds/1533152480328941778/widget.json',
  fallbackInviteUrl: 'https://discord.com/invite/Cnf5Znpp',

  // These hashes came from the attached server snapshot. If the server icon or
  // banner changes later, update the hashes here.
  iconUrl:
    'https://cdn.discordapp.com/icons/1533152480328941778/48075047f3a4e846c7e403c95a858c7f.webp?size=256',
  bannerUrl:
    'https://cdn.discordapp.com/banners/1533152480328941778/3a6834991075ab797c9f8726cf4045a7.webp?size=1024',

  // Optional. Point this at a public JSON endpoint if you want the richer
  // server-specific rows to update live. See public/examples/community-status.json.
  communityStatusUrl: import.meta.env.VITE_COMMUNITY_STATUS_URL || '',

  refreshMs: 60_000,

  // Default presentation. Use 'full' or 'compact'. A ?layout=full or
  // ?layout=compact query parameter overrides this without rebuilding.
  defaultLayout: import.meta.env.VITE_WIDGET_LAYOUT || 'compact',
  streamerWidgetUsername: 'twoWhitaker',

  // The public widget includes bots in its presence list. Keep the avatar pile
  // human-focused by excluding known bot usernames.
  excludedWidgetUsers: new Set([
    'Pokétwo',
    '⭐ Live Notify',
    '🌍 Vocab Buddy',
    '🌅 Daykeeper',
    '🎙 Voice Desk',
    '🎧 Community Playlist',
    '🏡 Innkeeper',
    '📺 Stream Guide',
    '🟢 Play Desk',
    '🛟 Server Recovery',
    '🎬 LIVE Clipper',
  ]),
}

// Snapshot-backed fallbacks from the attached Nov. 3, 2026 archive.
// A community status endpoint can override any of these fields at runtime.
export const SNAPSHOT = {
  memberCount: 127,
  onlineAtSnapshot: 33,
  tots: 94,
  smashers: 86,
  streamNotifications: 76,
  playNotifications: 49,
  ultimateChapters: 20,
  fighterGuides: 86,
  topFighters: [
    { name: 'Bowser', count: 18 },
    { name: 'Captain Falcon', count: 13 },
    { name: 'Joker', count: 13 },
  ],
}

export const FEATURES = [
  { icon: '🎬', label: 'Live clips' },
  { icon: '🌿', label: 'Pokétwo' },
  { icon: '🇩🇪', label: 'Daily German' },
  { icon: '🎙️', label: 'On-demand voice' },
]
