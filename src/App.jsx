import { useEffect, useMemo, useState } from 'react'
import { FEATURES, SERVER, SNAPSHOT } from './config.js'

const STATUS_ORDER = { online: 0, dnd: 1, idle: 2, offline: 3 }

function usePollingJson(url, interval) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!url) return undefined

    let alive = true
    let timer

    const load = async () => {
      try {
        const response = await fetch(url, { cache: 'no-store' })
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
        const next = await response.json()
        if (!alive) return
        setData(next)
        setError(null)
      } catch (nextError) {
        if (alive) setError(nextError)
      } finally {
        if (alive) timer = window.setTimeout(load, interval)
      }
    }

    load()

    return () => {
      alive = false
      window.clearTimeout(timer)
    }
  }, [url, interval])

  return { data, error }
}

function mergeStatus(remote) {
  if (!remote) return SNAPSHOT

  return {
    ...SNAPSHOT,
    ...remote,
    topFighters:
      Array.isArray(remote.topFighters) && remote.topFighters.length
        ? remote.topFighters
        : SNAPSHOT.topFighters,
  }
}

function getStreamerPresence(widget) {
  return widget?.members?.find(
    (member) =>
      member.username?.toLowerCase() ===
      SERVER.streamerWidgetUsername.toLowerCase(),
  )
}

function humanMembers(widget) {
  return [...(widget?.members ?? [])]
    .filter((member) => !SERVER.excludedWidgetUsers.has(member.username))
    .sort(
      (a, b) =>
        (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9),
    )
}

function statusText(status) {
  if (status === 'online') return 'online'
  if (status === 'idle') return 'idle'
  if (status === 'dnd') return 'busy'
  return 'offline'
}

function relativeTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const seconds = Math.round((date.getTime() - Date.now()) / 1000)
  const abs = Math.abs(seconds)
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

  if (abs < 60) return formatter.format(seconds, 'second')
  if (abs < 3600) return formatter.format(Math.round(seconds / 60), 'minute')
  if (abs < 86400) return formatter.format(Math.round(seconds / 3600), 'hour')
  return formatter.format(Math.round(seconds / 86400), 'day')
}

function AvatarStack({ members, onlineCount, limit = 7 }) {
  const visible = members.slice(0, limit)
  const remainder = Math.max(0, onlineCount - visible.length)

  return (
    <div className="avatar-stack" aria-label={`${onlineCount} online`}>
      {visible.map((member) => (
        <span className="avatar-wrap" key={`${member.id}-${member.username}`}>
          <img className="avatar" src={member.avatar_url} alt="" loading="lazy" />
          <span className={`presence-dot ${member.status ?? 'offline'}`} />
        </span>
      ))}
      {remainder > 0 && <span className="avatar-more">+{remainder}</span>}
    </div>
  )
}

function RightNowRow({ icon, tone = '', title, detail, href, action, compact = false }) {
  const body = (
    <>
      <span className={`right-now-icon ${tone}`}>{icon}</span>
      <span className="right-now-copy">
        <strong>{title}</strong>
        {!compact && detail && <small>{detail}</small>}
      </span>
      {action && <span className="row-action">{action}</span>}
    </>
  )

  const className = `right-now-row${compact ? ' compact-row' : ''}${href ? ' interactive' : ''}`

  if (!href) return <div className={className}>{body}</div>

  return (
    <a className={className} href={href} target="_blank" rel="noreferrer">
      {body}
    </a>
  )
}

function Feature({ feature }) {
  return (
    <div className="feature-pill">
      <span>{feature.icon}</span>
      <span>{feature.label}</span>
    </div>
  )
}

function CompactWidget({ view }) {
  const {
    data,
    inviteUrl,
    members,
    onlineCount,
    serverName,
    streamerRow,
    arenaRow,
    tournamentRow,
    voiceCount,
    widgetError,
  } = view

  return (
    <article className="server-card compact-card" aria-label={`${serverName} server widget`}>
      <div
        className="compact-banner"
        style={{ '--banner-image': `url("${SERVER.bannerUrl}")` }}
        aria-hidden="true"
      />

      <header className="compact-header">
        <div className="compact-identity">
          <div className="compact-icon-shell">
            <img className="server-icon" src={SERVER.iconUrl} alt="" />
          </div>
          <div className="compact-heading-copy">
            <div className="name-line">
              <h1>{serverName}</h1>
              <span className="server-tag">{SERVER.tag}</span>
            </div>
            <p className="tagline">{SERVER.tagline}</p>
          </div>
        </div>

        <div className="compact-social">
          <div className="counts">
            <span><strong>{data.memberCount}</strong> members</span>
            <span className="dot-separator">•</span>
            <span><i className="online-dot" /> <strong>{onlineCount}</strong> online</span>
          </div>
          <AvatarStack members={members} onlineCount={onlineCount} limit={4} />
        </div>
      </header>

      <section className="compact-section compact-live-section">
        <span className="eyebrow">⚡ Right now</span>
        <div className="right-now-list compact-now-list">
          <RightNowRow {...streamerRow} compact />
          <RightNowRow {...arenaRow} compact />
          <RightNowRow {...tournamentRow} compact />
          {voiceCount > 0 && (
            <RightNowRow
              compact
              icon="🎙️"
              tone="active"
              title={`${voiceCount} ${voiceCount === 1 ? 'person is' : 'people are'} in voice`}
            />
          )}
        </div>
      </section>

      <section className="compact-section compact-smash-section">
        <span className="eyebrow">🎮 Smash</span>

        <div className="compact-smash-stats">
          <span><strong>{data.ultimateChapters}</strong> Ultimate chapters</span>
          <span className="dot-separator">•</span>
          <span><strong>{data.fighterGuides}</strong> fighter guides</span>
          <span className="dot-separator">•</span>
          <span><strong>{data.smashers}</strong> Smashers</span>
        </div>

        <div className="compact-fighters" aria-label="Most played fighters">
          {data.topFighters.slice(0, 3).map((fighter) => (
            <span key={fighter.name}>{fighter.name} <strong>{fighter.count}</strong></span>
          ))}
        </div>
      </section>

      <section className="compact-section compact-around-section">
        <span className="eyebrow">☕ Around the server</span>
        <div className="compact-features">
          {FEATURES.map((feature) => (
            <Feature feature={feature} key={feature.label} />
          ))}
        </div>
      </section>

      <footer className="compact-footer">
        <a className="join-button" href={inviteUrl} target="_blank" rel="noreferrer">
          <span>Join TwoWhit’s Tots</span>
          <span aria-hidden="true">→</span>
        </a>
        {widgetError && (
          <p className="data-note compact-data-note">
            Live Discord data unavailable — showing snapshot fallbacks.
          </p>
        )}
      </footer>
    </article>
  )
}

export default function App() {
  const widgetState = usePollingJson(SERVER.widgetUrl, SERVER.refreshMs)
  const communityState = usePollingJson(
    SERVER.communityStatusUrl,
    SERVER.refreshMs,
  )

  const widget = widgetState.data
  const data = useMemo(
    () => mergeStatus(communityState.data),
    [communityState.data],
  )

  const members = useMemo(() => humanMembers(widget), [widget])
  const streamerPresence = getStreamerPresence(widget)
  const onlineCount = widget?.presence_count ?? SNAPSHOT.onlineAtSnapshot
  const inviteUrl = widget?.instant_invite || SERVER.fallbackInviteUrl
  const serverName = widget?.name || SERVER.name
  const voiceCount = (widget?.members ?? []).filter((member) => member.channel_id).length

  const params = new URLSearchParams(window.location.search)
  const isEmbed = params.get('embed') === '1'

  useEffect(() => {
    document.documentElement.dataset.embed = isEmbed ? 'true' : 'false'
  }, [isEmbed])

  const live = data.live
  const smashArenas = data.smashArenas
  const tournaments = data.tournaments

  const streamerRow = live
    ? live.isLive
      ? {
          icon: '●',
          tone: 'live',
          title: 'twoWhit is LIVE',
          detail: live.title || `${live.platform || 'Stream'} is live now`,
          href: live.url,
          action: 'Watch',
        }
      : {
          icon: '●',
          tone: 'offline',
          title: 'twoWhit is offline',
          detail: live.lastLiveAt ? `Last live ${relativeTime(live.lastLiveAt)}` : '',
        }
    : {
        icon: '●',
        tone: streamerPresence?.status || 'offline',
        title: streamerPresence
          ? `twoWhit is ${statusText(streamerPresence.status)} on Discord`
          : 'twoWhit is offline on Discord',
        detail: 'Streaming status can plug into the optional community feed.',
      }

  const arenaRow = smashArenas
    ? {
        icon: '🆚',
        tone: smashArenas.openCount > 0 ? 'active' : '',
        title:
          Number.isFinite(smashArenas.openCount)
            ? smashArenas.openCount > 0
              ? `${smashArenas.openCount} ${smashArenas.openCount === 1 ? 'Smash arena is' : 'Smash arenas are'} open right now`
              : 'No Smash arenas are open right now'
            : smashArenas.title || 'Smash Arenas',
        detail:
          smashArenas.detail ||
          'Create a Smash Ultimate arena, join an open arena, and find other players to battle.',
        href: smashArenas.url,
        action: smashArenas.url ? 'Open' : '',
      }
    : {
        icon: '🆚',
        title: 'Create or join a Smash arena',
        detail: 'Open an arena, join one directly, and find other players to battle.',
      }

  const tournamentRow = tournaments
    ? {
        icon: '📺',
        tone: tournaments.liveCount > 0 ? 'live' : '',
        title:
          tournaments.liveCount > 0
            ? `${tournaments.liveCount} ${tournaments.liveCount === 1 ? 'tournament is' : 'tournaments are'} live now`
            : tournaments.headline ||
              `${tournaments.todayCount ?? 0} on the tournament guide today`,
        detail: tournaments.liveCount > 0 ? tournaments.headline : tournaments.detail,
        href: tournaments.url,
        action: tournaments.url ? 'View' : '',
      }
    : {
        icon: '📺',
        title: 'Ultimate & Melee tournament guide',
        detail: 'Today’s broadcasts, live status, current matches, and what’s next.',
      }

  const view = {
    data,
    inviteUrl,
    members,
    onlineCount,
    serverName,
    streamerRow,
    arenaRow,
    tournamentRow,
    voiceCount,
    widgetError: widgetState.error,
  }

  return (
    <main className="page-shell">
      <CompactWidget view={view} />
    </main>
  )
}
