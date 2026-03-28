import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import SubmitButton from "./components/SubmitButton";

type PlatformOption =
  | "Alle Plattformen"
  | "TikTok"
  | "Instagram Reel"
  | "YouTube Short";

type CreatePlatformOption = "tiktok" | "instagram" | "youtube";

type SearchParams = {
  entity?: string;
  year?: string;
  month?: string;
  platform?: string;
  create?: string;
  copy?: string;
};

type SocialAccount = {
  id: string;
  platform: string;
  handle: string;
  externalAccountId?: string | null;
};

type DemoEntityPost = {
  id: string;
  platform: string;
  title?: string | null;
  caption: string;
  scheduledAt: string | Date;
  videoFileName?: string | null;
  status?: string;
};

type Entity = {
  id: string;
  name: string;
  apiKey: string;
  accounts: SocialAccount[];
  posts: DemoEntityPost[];
};

type ApiPost = {
  id: string;
  entityId: string;
  accountId: string | null;
  platform: string;
  title: string | null;
  caption: string;
  videoUrl: string;
  publicVideoUrl?: string | null;
  videoFileName?: string | null;
  scheduledAt: string;
  status: string;
  entity?: {
    id: string;
    name: string;
  };
  account?: {
    id: string;
    platform: string;
    handle: string;
    externalAccountId?: string | null;
  } | null;
};

async function getEntities() {
  return prisma.entity.findMany({
    orderBy: {
      createdAt: "asc",
    },
    include: {
      accounts: true,
      posts: {
        orderBy: {
          scheduledAt: "asc",
        },
      },
    },
  });
}

async function getPosts() {
  return prisma.scheduledPost.findMany({
    orderBy: {
      scheduledAt: "asc",
    },
    include: {
      entity: true,
      account: true,
    },
    take: 500,
  });
}

const platformOptions: PlatformOption[] = [
  "Alle Plattformen",
  "TikTok",
  "Instagram Reel",
  "YouTube Short",
];

const monthNames = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

const calendarDays = Array.from({ length: 31 }, (_, index) => index + 1);

function getBerlinNowInfo() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = parts.find((part) => part.type === "year")?.value ?? "2026";
  const month = parts.find((part) => part.type === "month")?.value ?? "03";
  const day = parts.find((part) => part.type === "day")?.value ?? "26";

  return {
    year,
    month,
    day,
    isoDate: `${year}-${month}-${day}`,
    monthIndex: Number(month) - 1,
  };
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isPlatformOption(value: string | undefined): value is PlatformOption {
  return platformOptions.includes(value as PlatformOption);
}

function buildFilterHref(params: {
  entity?: string;
  year?: string;
  month?: string;
  platform?: string;
  create?: string;
  copy?: string;
}) {
  const search = new URLSearchParams();

  if (params.entity) search.set("entity", params.entity);
  if (params.year) search.set("year", params.year);
  if (params.month) search.set("month", params.month);
  if (params.platform) search.set("platform", params.platform);
  if (params.create) search.set("create", params.create);
  if (params.copy) search.set("copy", params.copy);

  const query = search.toString();
  return query ? `/?${query}` : "/";
}

function pageStyle() {
  return {
    padding: "32px 24px 64px",
    fontFamily: "Arial, sans-serif",
    background:
      "radial-gradient(circle at top, rgba(37,99,235,0.10), transparent 28%), #0b0f19",
    color: "#f3f4f6",
    minHeight: "100vh",
  } as const;
}

function shellStyle() {
  return {
    maxWidth: "1240px",
    margin: "0 auto",
  } as const;
}

function heroStyle() {
  return {
    textAlign: "center" as const,
    marginBottom: "28px",
  };
}

function heroEyebrowStyle() {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 14px",
    borderRadius: "999px",
    border: "1px solid rgba(96,165,250,0.25)",
    background: "rgba(37,99,235,0.10)",
    color: "#bfdbfe",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
    marginBottom: "14px",
  } as const;
}

function heroTitleStyle() {
  return {
    margin: 0,
    fontSize: "42px",
    fontWeight: 800,
    letterSpacing: "-0.04em",
    color: "#f9fafb",
  } as const;
}

function heroTextStyle() {
  return {
    marginTop: "12px",
    color: "#94a3b8",
    fontSize: "15px",
    maxWidth: "640px",
    marginLeft: "auto",
    marginRight: "auto",
    lineHeight: 1.6,
  } as const;
}

function sectionStyle() {
  return {
    marginTop: "24px",
  } as const;
}

function cardStyle() {
  return {
    border: "1px solid #243041",
    borderRadius: "22px",
    padding: "20px",
    background: "linear-gradient(180deg, #111827 0%, #0f172a 100%)",
    color: "#f3f4f6",
    boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
    backdropFilter: "blur(8px)",
  } as const;
}

function softCardStyle() {
  return {
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "14px",
    background: "#0f172a",
    color: "#f8fafc",
  } as const;
}

function topBarStyle() {
  return {
    ...cardStyle(),
    display: "grid",
    gap: "20px",
  } as const;
}

function pillStyle(active: boolean) {
  return {
    padding: "10px 14px",
    borderRadius: "999px",
    border: active ? "1px solid #60a5fa" : "1px solid #334155",
    background: active ? "#2563eb" : "#0f172a",
    color: "#f8fafc",
    fontSize: "14px",
    fontWeight: 700,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "42px",
    boxShadow: active ? "0 10px 22px rgba(37,99,235,0.22)" : "none",
  } as const;
}

function primaryButtonStyle() {
  return {
    minWidth: "176px",
    minHeight: "44px",
    padding: "10px 16px",
    borderRadius: "12px",
    border: "1px solid #3b82f6",
    background: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 22px rgba(37,99,235,0.24)",
  } as const;
}

function secondaryButtonStyle() {
  return {
    minWidth: "176px",
    minHeight: "44px",
    padding: "10px 16px",
    borderRadius: "12px",
    border: "1px solid #475569",
    background: "#1e293b",
    color: "#f8fafc",
    cursor: "pointer",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  } as const;
}

function smallButtonStyle() {
  return {
    width: "100%",
    minHeight: "40px",
    padding: "8px 12px",
    borderRadius: "10px",
    border: "1px solid #475569",
    background: "#1f2937",
    color: "#f9fafb",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  } as const;
}

function smallPrimaryButtonStyle() {
  return {
    ...smallButtonStyle(),
    border: "1px solid #3b82f6",
    background: "#2563eb",
  } as const;
}

function dangerButtonStyle() {
  return {
    ...smallButtonStyle(),
    border: "1px solid #ef4444",
    background: "#7f1d1d",
    color: "#ffffff",
  } as const;
}

function sectionCardStyle() {
  return {
    ...cardStyle(),
    marginTop: "16px",
  } as const;
}

function inputStyle() {
  return {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #334155",
    background: "#0b1220",
    color: "#f8fafc",
  } as const;
}

function labelStyle() {
  return {
    display: "block",
    marginBottom: "8px",
    color: "#cbd5e1",
    fontWeight: 600,
    fontSize: "14px",
  } as const;
}

function mutedTextStyle() {
  return {
    color: "#94a3b8",
  } as const;
}

function sectionTitleStyle() {
  return {
    margin: 0,
    fontSize: "22px",
    fontWeight: 800,
    color: "#f8fafc",
    letterSpacing: "-0.02em",
  } as const;
}

function statusBadgeStyle(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "sent") {
    return {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "6px 10px",
      borderRadius: "999px",
      background: "rgba(16,185,129,0.15)",
      border: "1px solid rgba(16,185,129,0.4)",
      color: "#6ee7b7",
      fontSize: "12px",
      fontWeight: 700,
    } as const;
  }

  if (normalized === "failed") {
    return {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "6px 10px",
      borderRadius: "999px",
      background: "rgba(239,68,68,0.14)",
      border: "1px solid rgba(239,68,68,0.35)",
      color: "#fca5a5",
      fontSize: "12px",
      fontWeight: 700,
    } as const;
  }

  if (normalized === "sending") {
    return {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "6px 10px",
      borderRadius: "999px",
      background: "rgba(59,130,246,0.14)",
      border: "1px solid rgba(59,130,246,0.35)",
      color: "#93c5fd",
      fontSize: "12px",
      fontWeight: 700,
    } as const;
  }

  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(148,163,184,0.12)",
    border: "1px solid rgba(148,163,184,0.3)",
    color: "#cbd5e1",
    fontSize: "12px",
    fontWeight: 700,
  } as const;
}

function metricCardStyle() {
  return {
    ...softCardStyle(),
    minHeight: "92px",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",
  };
}

function formatPlatformLabel(platform: string): Exclude<
  PlatformOption,
  "Alle Plattformen"
> {
  if (platform === "instagram") return "Instagram Reel";
  if (platform === "youtube") return "YouTube Short";
  return "TikTok";
}

function formatMonthLabelFromIndex(monthIndex: number, year: number) {
  return `${monthNames[monthIndex]} ${year}`;
}

function formatStatusLabel(status: string) {
  if (status === "planned") return "Geplant";
  if (status === "sending") return "Wird gesendet";
  if (status === "sent") return "Gesendet";
  if (status === "failed") return "Fehlgeschlagen";
  return status;
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const entities: Entity[] = await getEntities();
  const posts: ApiPost[] = await getPosts();
  const resolvedSearchParams = (await searchParams) ?? {};
  const berlinNow = getBerlinNowInfo();

  const entityNames = entities.map((entity) => entity.name);
  const selectedEntityName =
    getSingleValue(resolvedSearchParams.entity) ?? entityNames[0] ?? "";

  const selectedYear =
    Number(getSingleValue(resolvedSearchParams.year) ?? berlinNow.year) ||
    Number(berlinNow.year);

  const selectedMonthIndex =
    Number(getSingleValue(resolvedSearchParams.month) ?? berlinNow.monthIndex) ||
    0;

  const rawPlatform = getSingleValue(resolvedSearchParams.platform);
  const selectedPlatformLabel: PlatformOption = isPlatformOption(rawPlatform)
    ? rawPlatform
    : "Alle Plattformen";

  const showCreateForm = getSingleValue(resolvedSearchParams.create) === "1";
  const showCopyPanel = getSingleValue(resolvedSearchParams.copy) === "1";

  const selectedEntity =
    entities.find((entity) => entity.name === selectedEntityName) ?? entities[0];

  const selectedMonthLabel = formatMonthLabelFromIndex(
    selectedMonthIndex,
    selectedYear
  );

  const selectedEntityPosts = posts.filter(
    (post) => post.entity?.name === selectedEntity?.name
  );

  const visiblePosts = selectedEntityPosts
    .filter((post) => {
      const platformLabel = formatPlatformLabel(post.platform);
      const postDate = new Date(post.scheduledAt);

      const platformMatches =
        selectedPlatformLabel === "Alle Plattformen" ||
        platformLabel === selectedPlatformLabel;

      const monthMatches = postDate.getMonth() === selectedMonthIndex;
      const yearMatches = postDate.getFullYear() === selectedYear;

      return platformMatches && monthMatches && yearMatches;
    })
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );

  const filteredCalendarPosts = visiblePosts.map((post) => {
    const date = new Date(post.scheduledAt);
    const timeLabel = date.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      id: post.id,
      day: date.getDate(),
      label: `${formatPlatformLabel(post.platform)} ${timeLabel}`,
    };
  });

  const plannedPostsCount = selectedEntityPosts.filter(
    (post) => post.status === "planned"
  ).length;

  const yearOptions = Array.from(
    { length: 2030 - Number(berlinNow.year) + 1 },
    (_, index) => Number(berlinNow.year) + index
  );

  return (
    <main style={pageStyle()}>
      <div style={shellStyle()}>
        <header style={heroStyle()}>
          <div style={heroEyebrowStyle()}>YPLORE Workspace</div>
          <h1 style={heroTitleStyle()}>YPLORE Tool</h1>
          <p style={heroTextStyle()}>
            Social-Media-Planung, Upload und Veröffentlichung in einer klaren,
            aufgeräumten Oberfläche.
          </p>
        </header>

        <section style={topBarStyle()}>
          <div>
            <h2 style={sectionTitleStyle()}>Einheit auswählen</h2>
            <p style={{ ...mutedTextStyle(), marginTop: "8px", marginBottom: 0 }}>
              Immer nur eine Einheit gleichzeitig im Fokus.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {entityNames.map((entityName) => (
              <Link
                key={entityName}
                href={buildFilterHref({
                  entity: entityName,
                  year: String(selectedYear),
                  month: String(selectedMonthIndex),
                  platform: selectedPlatformLabel,
                  create: showCreateForm ? "1" : undefined,
                  copy: showCopyPanel ? "1" : undefined,
                })}
                style={pillStyle(entityName === selectedEntityName)}
              >
                {entityName}
              </Link>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gap: "14px",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            <div style={metricCardStyle()}>
              <small style={{ ...mutedTextStyle(), display: "block" }}>
                Aktive Einheit
              </small>
              <strong style={{ display: "block", marginTop: "6px", fontSize: "18px" }}>
                {selectedEntity?.name ?? "Keine Einheit"}
              </strong>
            </div>

            <div style={metricCardStyle()}>
              <small style={{ ...mutedTextStyle(), display: "block" }}>
                Verknüpfte Accounts
              </small>
              <strong style={{ display: "block", marginTop: "6px", fontSize: "24px" }}>
                {selectedEntity?.accounts?.length ?? 0}
              </strong>
            </div>

            <div style={metricCardStyle()}>
              <small style={{ ...mutedTextStyle(), display: "block" }}>
                Sichtbare Posts
              </small>
              <strong style={{ display: "block", marginTop: "6px", fontSize: "24px" }}>
                {visiblePosts.length}
              </strong>
            </div>

            <div style={metricCardStyle()}>
              <small style={{ ...mutedTextStyle(), display: "block" }}>
                Geplante Posts
              </small>
              <strong style={{ display: "block", marginTop: "6px", fontSize: "24px" }}>
                {plannedPostsCount}
              </strong>
            </div>
          </div>
        </section>

        <section style={sectionStyle()}>
          <div style={cardStyle()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2 style={sectionTitleStyle()}>{selectedEntity?.name}</h2>
                <p
                  style={{
                    ...mutedTextStyle(),
                    marginTop: "8px",
                    marginBottom: 0,
                  }}
                >
                  API Key: ••••••••••••••••
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link
                  href={buildFilterHref({
                    entity: selectedEntityName,
                    year: String(selectedYear),
                    month: String(selectedMonthIndex),
                    platform: selectedPlatformLabel,
                    create: showCreateForm ? undefined : "1",
                    copy: showCopyPanel ? "1" : undefined,
                  })}
                  style={primaryButtonStyle()}
                >
                  {showCreateForm ? "Formular schließen" : "Post erstellen"}
                </Link>

                <Link
                  href={buildFilterHref({
                    entity: selectedEntityName,
                    year: String(selectedYear),
                    month: String(selectedMonthIndex),
                    platform: selectedPlatformLabel,
                    create: showCreateForm ? "1" : undefined,
                    copy: showCopyPanel ? undefined : "1",
                  })}
                  style={secondaryButtonStyle()}
                >
                  {showCopyPanel ? "Kopieren schließen" : "Monat kopieren"}
                </Link>
              </div>
            </div>

            <div
              style={{
                marginTop: "18px",
                display: "grid",
                gap: "14px",
                gridTemplateColumns: "1.05fr 1fr",
              }}
            >
              <div style={softCardStyle()}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>Accounts</h3>
                <div style={{ display: "grid", gap: "10px" }}>
                  {(selectedEntity?.accounts ?? []).map((account) => (
                    <div
                      key={account.id}
                      style={{
                        border: "1px solid #334155",
                        borderRadius: "12px",
                        padding: "12px",
                        background: "#111827",
                      }}
                    >
                      <strong style={{ display: "block" }}>{account.platform}</strong>
                      <small style={{ color: "#cbd5e1" }}>{account.handle}</small>
                    </div>
                  ))}
                </div>
              </div>

              <div style={softCardStyle()}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>
                  Filter & Zeitraum
                </h3>

                <div style={{ display: "grid", gap: "14px" }}>
                  <div>
                    <small
                      style={{
                        ...mutedTextStyle(),
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      Jahr
                    </small>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {yearOptions.map((year) => (
                        <Link
                          key={year}
                          href={buildFilterHref({
                            entity: selectedEntityName,
                            year: String(year),
                            month: String(year === selectedYear ? selectedMonthIndex : 0),
                            platform: selectedPlatformLabel,
                            create: showCreateForm ? "1" : undefined,
                            copy: showCopyPanel ? "1" : undefined,
                          })}
                          style={pillStyle(year === selectedYear)}
                        >
                          {year}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div>
                    <small
                      style={{
                        ...mutedTextStyle(),
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      Monat
                    </small>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {monthNames.map((monthName, index) => (
                        <Link
                          key={`${selectedYear}-${monthName}`}
                          href={buildFilterHref({
                            entity: selectedEntityName,
                            year: String(selectedYear),
                            month: String(index),
                            platform: selectedPlatformLabel,
                            create: showCreateForm ? "1" : undefined,
                            copy: showCopyPanel ? "1" : undefined,
                          })}
                          style={pillStyle(index === selectedMonthIndex)}
                        >
                          {monthName}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div>
                    <small
                      style={{
                        ...mutedTextStyle(),
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      Plattform
                    </small>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {platformOptions.map((platform) => (
                        <Link
                          key={platform}
                          href={buildFilterHref({
                            entity: selectedEntityName,
                            year: String(selectedYear),
                            month: String(selectedMonthIndex),
                            platform,
                            create: showCreateForm ? "1" : undefined,
                            copy: showCopyPanel ? "1" : undefined,
                          })}
                          style={pillStyle(platform === selectedPlatformLabel)}
                        >
                          {platform}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {showCreateForm && (
              <div style={sectionCardStyle()}>
                <h3 style={{ margin: "0 0 14px 0", color: "#f9fafb" }}>
                  Post erstellen
                </h3>

                <form method="post" action="/api/posts" encType="multipart/form-data">
                  <div
                    style={{
                      display: "grid",
                      gap: "14px",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    }}
                  >
                    <div>
                      <label style={labelStyle()}>Einheit</label>
                      <select
                        name="entityId"
                        defaultValue={selectedEntity?.id}
                        style={inputStyle()}
                      >
                        {entities.map((entity) => (
                          <option key={entity.id} value={entity.id}>
                            {entity.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle()}>Titel</label>
                      <input
                        name="title"
                        defaultValue="Neuer Post"
                        style={inputStyle()}
                      />
                    </div>

                    <div>
                      <label style={labelStyle()}>Plattform</label>
                      <select
                        name="platform"
                        defaultValue={"tiktok" satisfies CreatePlatformOption}
                        style={inputStyle()}
                      >
                        <option value="tiktok">TikTok</option>
                        <option value="instagram">Instagram Reel</option>
                        <option value="youtube">YouTube Short</option>
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle()}>Datum</label>
                      <input
                        name="date"
                        type="date"
                        defaultValue={berlinNow.isoDate}
                        style={inputStyle()}
                      />
                    </div>

                    <div>
                      <label style={labelStyle()}>Uhrzeit</label>
                      <input
                        name="time"
                        type="time"
                        defaultValue="10:00"
                        style={inputStyle()}
                      />
                    </div>

                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle()}>Caption</label>
                      <textarea
                        name="caption"
                        defaultValue="Hier kommt die Caption hin"
                        rows={4}
                        style={inputStyle()}
                      />
                    </div>

                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle()}>Video-Datei</label>
                      <input
                        name="videoFile"
                        type="file"
                        accept="video/*"
                        style={inputStyle()}
                      />
                    </div>

                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle()}>
                        Öffentliche Video-URL (optional)
                      </label>
                      <input
                        name="publicVideoUrl"
                        type="url"
                        placeholder="https://..."
                        style={inputStyle()}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "16px",
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <SubmitButton
                      idleText="Post speichern"
                      pendingText="Speichert..."
                      style={primaryButtonStyle()}
                    />
                    <button type="button" style={secondaryButtonStyle()}>
                      Als Entwurf speichern
                    </button>
                  </div>
                </form>
              </div>
            )}

            {showCopyPanel && (
              <div style={sectionCardStyle()}>
                <h3 style={{ margin: "0 0 14px 0", color: "#f9fafb" }}>
                  Monat kopieren
                </h3>

                <form method="post" action="/api/posts/copy-month">
                  <div
                    style={{
                      display: "grid",
                      gap: "14px",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    }}
                  >
                    <div>
                      <label style={labelStyle()}>Quell-Einheit</label>
                      <select
                        name="sourceEntityId"
                        defaultValue={selectedEntity?.id}
                        style={inputStyle()}
                      >
                        {entities.map((entity) => (
                          <option key={entity.id} value={entity.id}>
                            {entity.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle()}>Quell-Monat</label>
                      <select
                        name="sourceMonth"
                        defaultValue={selectedMonthLabel}
                        style={inputStyle()}
                      >
                        {yearOptions.flatMap((year) =>
                          monthNames.map((monthName, index) => {
                            const value = formatMonthLabelFromIndex(index, year);
                            return (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            );
                          })
                        )}
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle()}>Ziel-Einheit</label>
                      <select
                        name="targetEntityId"
                        defaultValue={selectedEntity?.id}
                        style={inputStyle()}
                      >
                        {entities.map((entity) => (
                          <option key={entity.id} value={entity.id}>
                            {entity.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle()}>Ziel-Monat</label>
                      <select
                        name="targetMonth"
                        defaultValue={selectedMonthLabel}
                        style={inputStyle()}
                      >
                        {yearOptions.flatMap((year) =>
                          monthNames.map((monthName, index) => {
                            const value = formatMonthLabelFromIndex(index, year);
                            return (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            );
                          })
                        )}
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "16px",
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <SubmitButton
                      idleText="Monat duplizieren"
                      pendingText="Dupliziert..."
                      style={primaryButtonStyle()}
                    />
                    <button type="button" style={secondaryButtonStyle()}>
                      Nur Zeiten kopieren
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </section>

        <section style={sectionStyle()}>
          <div style={cardStyle()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "14px",
                flexWrap: "wrap",
              }}
            >
              <h2 style={sectionTitleStyle()}>Kalender</h2>
              <small style={mutedTextStyle()}>
                {selectedPlatformLabel} · {selectedMonthLabel}
              </small>
            </div>

            <div
              style={{
                marginTop: "18px",
                display: "grid",
                gap: "12px",
                gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
              }}
            >
              {calendarDays.map((day) => {
                const dayPosts = filteredCalendarPosts.filter((post) => post.day === day);

                return (
                  <div
                    key={day}
                    style={{
                      border: "1px solid #334155",
                      borderRadius: "16px",
                      padding: "12px",
                      minHeight: "126px",
                      background: "#111827",
                    }}
                  >
                    <strong style={{ color: "#f8fafc" }}>Tag {day}</strong>

                    <div style={{ marginTop: "10px", display: "grid", gap: "6px" }}>
                      {dayPosts.map((post) => (
                        <div
                          key={post.id}
                          style={{
                            fontSize: "12px",
                            borderRadius: "10px",
                            padding: "7px 8px",
                            background: "#1f2937",
                            color: "#f8fafc",
                            border: "1px solid #374151",
                          }}
                        >
                          {post.label}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section style={sectionStyle()}>
          <div style={cardStyle()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "14px",
                flexWrap: "wrap",
              }}
            >
              <h2 style={sectionTitleStyle()}>Geplante Posts</h2>
              <small style={mutedTextStyle()}>
                {selectedEntity?.name} · {selectedMonthLabel}
              </small>
            </div>

            <div
              style={{
                marginTop: "16px",
                display: "grid",
                gap: "12px",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              }}
            >
              {visiblePosts.length === 0 ? (
                <div style={softCardStyle()}>
                  <small style={mutedTextStyle()}>
                    Für diese Auswahl sind noch keine Posts vorhanden.
                  </small>
                </div>
              ) : (
                visiblePosts.map((post) => (
                  <div
                    key={post.id}
                    style={{
                      border: "1px solid #334155",
                      borderRadius: "16px",
                      padding: "14px",
                      background: "#0f172a",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      <strong>{formatPlatformLabel(post.platform)}</strong>
                      <span style={statusBadgeStyle(post.status)}>
                        {formatStatusLabel(post.status)}
                      </span>
                    </div>

                    {post.title ? (
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#f8fafc",
                          marginBottom: "6px",
                        }}
                      >
                        {post.title}
                      </div>
                    ) : null}

                    <div
                      style={{
                        color: "#dbe4ee",
                        fontSize: "14px",
                        lineHeight: 1.5,
                        minHeight: "44px",
                      }}
                    >
                      {post.caption}
                    </div>

                    <div style={{ ...mutedTextStyle(), marginTop: "10px", fontSize: "13px" }}>
                      {new Date(post.scheduledAt).toLocaleString("de-DE")}
                    </div>

                    {post.videoFileName ? (
                      <div style={{ ...mutedTextStyle(), marginTop: "6px", fontSize: "13px" }}>
                        Datei: {post.videoFileName}
                      </div>
                    ) : null}

                    <div
                      style={{
                        marginTop: "14px",
                        display: "grid",
                        gap: "8px",
                        gridTemplateColumns: "1fr 1fr",
                      }}
                    >
                      <form method="post" action="/api/posts/update-status">
                        <input type="hidden" name="id" value={post.id} />
                        <input type="hidden" name="status" value="sending" />
                        <button type="submit" style={smallButtonStyle()}>
                          Auf sending setzen
                        </button>
                      </form>

                      <form method="post" action="/api/posts/update-status">
                        <input type="hidden" name="id" value={post.id} />
                        <input type="hidden" name="status" value="send-now" />
                        <button type="submit" style={smallPrimaryButtonStyle()}>
                          Jetzt senden
                        </button>
                      </form>

                      <form method="post" action="/api/posts/update-status">
                        <input type="hidden" name="id" value={post.id} />
                        <input type="hidden" name="status" value="sent" />
                        <button type="submit" style={smallButtonStyle()}>
                          Auf sent setzen
                        </button>
                      </form>

                      <form method="post" action="/api/posts/update-status">
                        <input type="hidden" name="id" value={post.id} />
                        <input type="hidden" name="status" value="failed" />
                        <button type="submit" style={smallButtonStyle()}>
                          Auf failed setzen
                        </button>
                      </form>

                      <form
                        method="post"
                        action="/api/posts/delete"
                        style={{ gridColumn: "1 / -1" }}
                      >
                        <input type="hidden" name="id" value={post.id} />
                        <button type="submit" style={dangerButtonStyle()}>
                          Post löschen
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}