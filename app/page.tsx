import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import SubmitButton from "./components/SubmitButton";
import CreatePostForm from "./components/CreatePostForm";

type PlatformOption =
  | "Alle Plattformen"
  | "TikTok"
  | "Instagram Reel"
  | "YouTube Short";

type SearchParams = {
  entity?: string;
  year?: string;
  month?: string;
  platform?: string;
  create?: string;
  copy?: string;
  copyDay?: string;
  copyYear?: string;
};

type SocialAccount = {
  id: string;
  platform: string;
  handle: string;
  externalAccountId?: string | null;
};

type Entity = {
  id: string;
  name: string;
  apiKey: string | null;
  accounts: SocialAccount[];
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
  scheduledAt: string | Date;
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
    },
  });
}

async function getPosts(entityId: string, year: number, monthIndex: number) {
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 1);

  return prisma.scheduledPost.findMany({
    where: {
      entityId,
      scheduledAt: {
        gte: start,
        lt: end,
      },
    },
    orderBy: {
      scheduledAt: "asc",
    },
    include: {
      entity: true,
      account: true,
    },
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
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

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
  copyDay?: string;
  copyYear?: string;
}) {
  const search = new URLSearchParams();

  if (params.entity) search.set("entity", params.entity);
  if (params.year) search.set("year", params.year);
  if (params.month) search.set("month", params.month);
  if (params.platform) search.set("platform", params.platform);
  if (params.create) search.set("create", params.create);
  if (params.copy) search.set("copy", params.copy);
  if (params.copyDay) search.set("copyDay", params.copyDay);
  if (params.copyYear) search.set("copyYear", params.copyYear);

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
    textDecoration: "none",
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

function calendarDayDeleteButtonStyle() {
  return {
    width: "100%",
    minHeight: "34px",
    padding: "6px 10px",
    borderRadius: "10px",
    border: "1px solid #ef4444",
    background: "#7f1d1d",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "10px",
  } as const;
}

function monthDeleteButtonStyle() {
  return {
    minHeight: "42px",
    padding: "8px 14px",
    borderRadius: "10px",
    border: "1px solid #ef4444",
    background: "#7f1d1d",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  } as const;
}

function sectionCardStyle() {
  return {
    ...cardStyle(),
    marginTop: "16px",
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

function fieldLabelStyle() {
  return {
    display: "block",
    marginBottom: "8px",
    color: "#cbd5e1",
    fontWeight: 600,
    fontSize: "14px",
  } as const;
}

function fieldStyle() {
  return {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #334155",
    background: "#0b1220",
    color: "#f8fafc",
  } as const;
}

function checkboxGridStyle() {
  return {
    display: "grid",
    gap: "8px",
    maxHeight: "220px",
    overflowY: "auto" as const,
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #334155",
    background: "#0b1220",
  } as const;
}

function checkboxItemStyle() {
  return {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#f8fafc",
    fontSize: "14px",
  } as const;
}

function bulkBarStyle() {
  return {
    ...softCardStyle(),
    marginTop: "16px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap" as const,
    alignItems: "center",
    justifyContent: "space-between",
  };
}

function bulkButtonStyle() {
  return {
    minHeight: "42px",
    padding: "8px 14px",
    borderRadius: "10px",
    border: "1px solid #475569",
    background: "#1f2937",
    color: "#f9fafb",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 700,
  } as const;
}

function bulkPrimaryButtonStyle() {
  return {
    ...bulkButtonStyle(),
    border: "1px solid #3b82f6",
    background: "#2563eb",
  } as const;
}

function bulkDangerButtonStyle() {
  return {
    ...bulkButtonStyle(),
    border: "1px solid #ef4444",
    background: "#7f1d1d",
  } as const;
}

function getBerlinDateParts(dateInput: string | Date) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const year = Number(parts.find((part) => part.type === "year")?.value ?? "1970");
  const month = Number(parts.find((part) => part.type === "month")?.value ?? "01");
  const day = Number(parts.find((part) => part.type === "day")?.value ?? "01");
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "00");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "00");

  return {
    year,
    monthIndex: month - 1,
    day,
    hour,
    minute,
  };
}

function formatBerlinTime(dateInput: string | Date) {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(dateInput instanceof Date ? dateInput : new Date(dateInput));
}

function formatBerlinDateTime(dateInput: string | Date) {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(dateInput instanceof Date ? dateInput : new Date(dateInput));
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

function getAllMonthOptions(yearOptions: number[]) {
  return yearOptions.flatMap((year) =>
    monthNames.map((monthName, index) => ({
      value: formatMonthLabelFromIndex(index, year),
      label: formatMonthLabelFromIndex(index, year),
    }))
  );
}

function getAllYearOptions(yearOptions: number[]) {
  return yearOptions.map((year) => ({
    value: String(year),
    label: String(year),
  }));
}

function getDefaultTargetMonthValues(
  selectedYear: number,
  selectedMonthIndex: number
) {
  const nextMonths: string[] = [];

  for (let offset = 1; offset <= 3; offset += 1) {
    const date = new Date(selectedYear, selectedMonthIndex + offset, 1);
    nextMonths.push(formatMonthLabelFromIndex(date.getMonth(), date.getFullYear()));
  }

  return nextMonths;
}

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function buildIsoDate(year: number, monthIndex: number, day: number) {
  const month = String(monthIndex + 1).padStart(2, "0");
  const paddedDay = String(day).padStart(2, "0");
  return `${year}-${month}-${paddedDay}`;
}

function buildIsoMonth(year: number, monthIndex: number) {
  const month = String(monthIndex + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getSelectedMonthDefaultDate(
  selectedYear: number,
  selectedMonthIndex: number,
  berlinNow: ReturnType<typeof getBerlinNowInfo>
) {
  const nowYear = Number(berlinNow.year);
  const nowMonthIndex = berlinNow.monthIndex;

  if (selectedYear === nowYear && selectedMonthIndex === nowMonthIndex) {
    return berlinNow.isoDate;
  }

  return buildIsoDate(selectedYear, selectedMonthIndex, 1);
}

function getTargetDayOptions(selectedYear: number, selectedMonthIndex: number) {
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonthIndex);

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const value = buildIsoDate(selectedYear, selectedMonthIndex, day);

    return {
      value,
      label: `${String(day).padStart(2, "0")}.${String(selectedMonthIndex + 1).padStart(2, "0")}.${selectedYear}`,
    };
  });
}

function getDefaultTargetDateValues(
  sourceDate: string,
  selectedYear: number,
  selectedMonthIndex: number
) {
  const source = new Date(`${sourceDate}T00:00:00`);
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonthIndex);
  const sourceDay = source.getDate();

  return [sourceDay + 1, sourceDay + 2, sourceDay + 3]
    .filter((day) => day >= 1 && day <= daysInMonth)
    .map((day) => buildIsoDate(selectedYear, selectedMonthIndex, day));
}

function getDefaultTargetYearValues(selectedYear: number) {
  return [selectedYear + 1, selectedYear + 2, selectedYear + 3].map(String);
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const berlinNow = getBerlinNowInfo();
  const entities: Entity[] = await getEntities();

  const entityNames = entities.map((entity) => entity.name);
  const selectedEntityName =
    getSingleValue(resolvedSearchParams.entity) ?? entityNames[0] ?? "";

  const selectedYear =
    Number(getSingleValue(resolvedSearchParams.year) ?? berlinNow.year) ||
    Number(berlinNow.year);

  const selectedMonthIndex =
    Number(getSingleValue(resolvedSearchParams.month) ?? berlinNow.monthIndex) ||
    berlinNow.monthIndex;

  const rawPlatform = getSingleValue(resolvedSearchParams.platform);
  const selectedPlatformLabel: PlatformOption = isPlatformOption(rawPlatform)
    ? rawPlatform
    : "Alle Plattformen";

  const showCreateForm = getSingleValue(resolvedSearchParams.create) === "1";
  const showCopyPanel = getSingleValue(resolvedSearchParams.copy) === "1";
  const showCopyDayPanel = getSingleValue(resolvedSearchParams.copyDay) === "1";
  const showCopyYearPanel = getSingleValue(resolvedSearchParams.copyYear) === "1";

  const selectedEntity =
    entities.find((entity) => entity.name === selectedEntityName) ?? entities[0];

  const posts: ApiPost[] = selectedEntity
    ? await getPosts(selectedEntity.id, selectedYear, selectedMonthIndex)
    : [];

  const selectedMonthLabel = formatMonthLabelFromIndex(
    selectedMonthIndex,
    selectedYear
  );

  const selectedEntityPosts = posts;

  const visiblePosts = selectedEntityPosts
    .filter((post) => {
      const platformLabel = formatPlatformLabel(post.platform);
      const platformMatches =
        selectedPlatformLabel === "Alle Plattformen" ||
        platformLabel === selectedPlatformLabel;

      return platformMatches;
    })
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );

   const filteredCalendarPosts = visiblePosts.map((post) => {
    const berlinParts = getBerlinDateParts(post.scheduledAt);

    return {
      id: post.id,
      day: berlinParts.day,
      label: `${formatPlatformLabel(post.platform)} ${formatBerlinTime(post.scheduledAt)}`,
      status: post.status,
    };
  });

  const plannedListPosts = visiblePosts.filter((post) => post.status !== "sent");

  const plannedPostsCount = selectedEntityPosts.filter(
    (post) => post.status === "planned"
  ).length;

  const currentYear = Number(berlinNow.year);
  const yearOptions = Array.from({ length: 2030 - currentYear + 1 }, (_, index) => currentYear + index);

  const allMonthOptions = getAllMonthOptions(yearOptions);
  const allYearOptions = getAllYearOptions(yearOptions);
  const defaultTargetMonths = getDefaultTargetMonthValues(
    selectedYear,
    selectedMonthIndex
  );
  const selectedMonthDefaultDate = getSelectedMonthDefaultDate(
    selectedYear,
    selectedMonthIndex,
    berlinNow
  );
  const targetDayOptions = getTargetDayOptions(selectedYear, selectedMonthIndex);
  const defaultTargetDates = getDefaultTargetDateValues(
    selectedMonthDefaultDate,
    selectedYear,
    selectedMonthIndex
  );
  const defaultTargetYears = getDefaultTargetYearValues(selectedYear);

  const currentHref = buildFilterHref({
    entity: selectedEntityName,
    year: String(selectedYear),
    month: String(selectedMonthIndex),
    platform: selectedPlatformLabel,
    create: showCreateForm ? "1" : undefined,
    copy: showCopyPanel ? "1" : undefined,
    copyDay: showCopyDayPanel ? "1" : undefined,
    copyYear: showCopyYearPanel ? "1" : undefined,
  });

  const postsReturnTo = `${currentHref}#planned-posts`;
  const copyReturnTo = `${currentHref}#copy-tools`;
  const selectedMonthIso = buildIsoMonth(selectedYear, selectedMonthIndex);

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
                  copyDay: showCopyDayPanel ? "1" : undefined,
                  copyYear: showCopyYearPanel ? "1" : undefined,
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

        <section style={sectionStyle()} id="copy-tools">
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
                    copyDay: showCopyDayPanel ? "1" : undefined,
                    copyYear: showCopyYearPanel ? "1" : undefined,
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
                    copyDay: showCopyDayPanel ? "1" : undefined,
                    copyYear: showCopyYearPanel ? "1" : undefined,
                  })}
                  style={secondaryButtonStyle()}
                >
                  {showCopyPanel ? "Monat kopieren schließen" : "Monat kopieren"}
                </Link>

                <Link
                  href={buildFilterHref({
                    entity: selectedEntityName,
                    year: String(selectedYear),
                    month: String(selectedMonthIndex),
                    platform: selectedPlatformLabel,
                    create: showCreateForm ? "1" : undefined,
                    copy: showCopyPanel ? "1" : undefined,
                    copyDay: showCopyDayPanel ? undefined : "1",
                    copyYear: showCopyYearPanel ? "1" : undefined,
                  })}
                  style={secondaryButtonStyle()}
                >
                  {showCopyDayPanel ? "Tag kopieren schließen" : "Tag kopieren"}
                </Link>

                <Link
                  href={buildFilterHref({
                    entity: selectedEntityName,
                    year: String(selectedYear),
                    month: String(selectedMonthIndex),
                    platform: selectedPlatformLabel,
                    create: showCreateForm ? "1" : undefined,
                    copy: showCopyPanel ? "1" : undefined,
                    copyDay: showCopyDayPanel ? "1" : undefined,
                    copyYear: showCopyYearPanel ? undefined : "1",
                  })}
                  style={secondaryButtonStyle()}
                >
                  {showCopyYearPanel ? "Jahr kopieren schließen" : "Jahr kopieren"}
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
                            copyDay: showCopyDayPanel ? "1" : undefined,
                            copyYear: showCopyYearPanel ? "1" : undefined,
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
                            copyDay: showCopyDayPanel ? "1" : undefined,
                            copyYear: showCopyYearPanel ? "1" : undefined,
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
                            copyDay: showCopyDayPanel ? "1" : undefined,
                            copyYear: showCopyYearPanel ? "1" : undefined,
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

                <CreatePostForm
                  entities={entities.map((entity) => ({
                    id: entity.id,
                    name: entity.name,
                  }))}
                  selectedEntityId={selectedEntity?.id}
                  defaultDate={berlinNow.isoDate}
                />
              </div>
            )}

            {showCopyPanel && (
              <div style={sectionCardStyle()}>
                <h3 style={{ margin: "0 0 14px 0", color: "#f9fafb" }}>
                  Monat kopieren
                </h3>

                <form method="post" action="/api/posts/copy-month">
                  <input type="hidden" name="returnTo" value={copyReturnTo} />
                  <div
                    style={{
                      display: "grid",
                      gap: "14px",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    }}
                  >
                    <div>
                      <label style={fieldLabelStyle()}>Quell-Einheit</label>
                      <select
                        name="sourceEntityId"
                        defaultValue={selectedEntity?.id}
                        style={fieldStyle()}
                      >
                        {entities.map((entity) => (
                          <option key={entity.id} value={entity.id}>
                            {entity.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={fieldLabelStyle()}>Quell-Monat</label>
                      <select
                        name="sourceMonth"
                        defaultValue={selectedMonthLabel}
                        style={fieldStyle()}
                      >
                        {allMonthOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={fieldLabelStyle()}>Ziel-Einheit</label>
                      <select
                        name="targetEntityId"
                        defaultValue={selectedEntity?.id}
                        style={fieldStyle()}
                      >
                        {entities.map((entity) => (
                          <option key={entity.id} value={entity.id}>
                            {entity.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={fieldLabelStyle()}>Ziel-Monate</label>
                      <div style={checkboxGridStyle()}>
                        {allMonthOptions.map((option) => (
                          <label key={option.value} style={checkboxItemStyle()}>
                            <input
                              type="checkbox"
                              name="targetMonths"
                              value={option.value}
                              defaultChecked={defaultTargetMonths.includes(option.value)}
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
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
                      idleText="Monate duplizieren"
                      pendingText="Dupliziert..."
                      style={primaryButtonStyle()}
                    />
                  </div>
                </form>
              </div>
            )}

            {showCopyDayPanel && (
              <div style={sectionCardStyle()}>
                <h3 style={{ margin: "0 0 14px 0", color: "#f9fafb" }}>
                  Tag kopieren
                </h3>

                <form method="post" action="/api/posts/copy-day">
                  <input type="hidden" name="returnTo" value={copyReturnTo} />
                  <div
                    style={{
                      display: "grid",
                      gap: "14px",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    }}
                  >
                    <div>
                      <label style={fieldLabelStyle()}>Quell-Einheit</label>
                      <select
                        name="sourceEntityId"
                        defaultValue={selectedEntity?.id}
                        style={fieldStyle()}
                      >
                        {entities.map((entity) => (
                          <option key={entity.id} value={entity.id}>
                            {entity.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={fieldLabelStyle()}>Quell-Datum</label>
                      <input
                        name="sourceDate"
                        type="date"
                        defaultValue={selectedMonthDefaultDate}
                        style={fieldStyle()}
                      />
                    </div>

                    <div>
                      <label style={fieldLabelStyle()}>Ziel-Einheit</label>
                      <select
                        name="targetEntityId"
                        defaultValue={selectedEntity?.id}
                        style={fieldStyle()}
                      >
                        {entities.map((entity) => (
                          <option key={entity.id} value={entity.id}>
                            {entity.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={fieldLabelStyle()}>Ziel-Tage</label>
                      <div style={checkboxGridStyle()}>
                        {targetDayOptions.map((option) => (
                          <label key={option.value} style={checkboxItemStyle()}>
                            <input
                              type="checkbox"
                              name="targetDates"
                              value={option.value}
                              defaultChecked={defaultTargetDates.includes(option.value)}
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
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
                      idleText="Tage duplizieren"
                      pendingText="Dupliziert..."
                      style={primaryButtonStyle()}
                    />
                  </div>
                </form>
              </div>
            )}

            {showCopyYearPanel && (
              <div style={sectionCardStyle()}>
                <h3 style={{ margin: "0 0 14px 0", color: "#f9fafb" }}>
                  Jahr kopieren
                </h3>

                <form method="post" action="/api/posts/copy-year">
                  <input type="hidden" name="returnTo" value={copyReturnTo} />
                  <div
                    style={{
                      display: "grid",
                      gap: "14px",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    }}
                  >
                    <div>
                      <label style={fieldLabelStyle()}>Quell-Einheit</label>
                      <select
                        name="sourceEntityId"
                        defaultValue={selectedEntity?.id}
                        style={fieldStyle()}
                      >
                        {entities.map((entity) => (
                          <option key={entity.id} value={entity.id}>
                            {entity.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={fieldLabelStyle()}>Quell-Jahr</label>
                      <select
                        name="sourceYear"
                        defaultValue={String(selectedYear)}
                        style={fieldStyle()}
                      >
                        {allYearOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={fieldLabelStyle()}>Ziel-Einheit</label>
                      <select
                        name="targetEntityId"
                        defaultValue={selectedEntity?.id}
                        style={fieldStyle()}
                      >
                        {entities.map((entity) => (
                          <option key={entity.id} value={entity.id}>
                            {entity.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={fieldLabelStyle()}>Ziel-Jahre</label>
                      <div style={checkboxGridStyle()}>
                        {allYearOptions.map((option) => (
                          <label key={option.value} style={checkboxItemStyle()}>
                            <input
                              type="checkbox"
                              name="targetYears"
                              value={option.value}
                              defaultChecked={defaultTargetYears.includes(option.value)}
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
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
                      idleText="Jahre duplizieren"
                      pendingText="Dupliziert..."
                      style={primaryButtonStyle()}
                    />
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
                marginTop: "14px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <form method="post" action="/api/posts/delete-month">
                <input
                  type="hidden"
                  name="entityId"
                  value={selectedEntity?.id ?? ""}
                />
                <input type="hidden" name="month" value={selectedMonthIso} />
                <input type="hidden" name="returnTo" value={postsReturnTo} />
                <button type="submit" style={monthDeleteButtonStyle()}>
                  Diesen Monat löschen
                </button>
              </form>
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
                const dayIsoDate = buildIsoDate(selectedYear, selectedMonthIndex, day);

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
                            background:
                              post.status === "sent"
                                ? "rgba(16,185,129,0.15)"
                                : "#1f2937",
                            color:
                              post.status === "sent" ? "#6ee7b7" : "#f8fafc",
                            border:
                              post.status === "sent"
                                ? "1px solid rgba(16,185,129,0.4)"
                                : "1px solid #374151",
                            fontWeight: post.status === "sent" ? 700 : 500,
                          }}
                        >
                          {post.label}
                        </div>
                      ))}
                    </div>

                    {dayPosts.length > 0 ? (
                      <form method="post" action="/api/posts/delete-day">
                        <input
                          type="hidden"
                          name="entityId"
                          value={selectedEntity?.id ?? ""}
                        />
                        <input type="hidden" name="date" value={dayIsoDate} />
                        <input type="hidden" name="returnTo" value={postsReturnTo} />
                        <button type="submit" style={calendarDayDeleteButtonStyle()}>
                          Diesen Tag löschen
                        </button>
                      </form>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section style={sectionStyle()} id="planned-posts">
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
                          {plannedListPosts.length > 0 ? (
              <>
                <form method="post" action="/api/posts/update-status">
                  <input type="hidden" name="status" value="send-now" />
                  <input type="hidden" name="returnTo" value={postsReturnTo} />

                  <div style={bulkBarStyle()}>
                    <small style={mutedTextStyle()}>
                      Mehrere Checkboxen auswählen und dann gesammelt ausführen.
                    </small>

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button type="submit" style={bulkPrimaryButtonStyle()}>
                        Auswahl jetzt senden
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "16px",
                      display: "grid",
                      gap: "12px",
                      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    }}
                  >
                    {plannedListPosts.map((post) => (
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
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              fontWeight: 700,
                            }}
                          >
                            <input type="checkbox" name="ids" value={post.id} />
                            <span>{formatPlatformLabel(post.platform)}</span>
                          </label>

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

                        <div
                          style={{
                            ...mutedTextStyle(),
                            marginTop: "10px",
                            fontSize: "13px",
                          }}
                        >
                          {formatBerlinDateTime(post.scheduledAt)}
                        </div>

                        {post.videoFileName ? (
                          <div
                            style={{
                              ...mutedTextStyle(),
                              marginTop: "6px",
                              fontSize: "13px",
                            }}
                          >
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
                          <button
                            type="submit"
                            form={`sending-form-${post.id}`}
                            style={smallButtonStyle()}
                          >
                            Auf sending setzen
                          </button>

                          <button
                            type="submit"
                            form={`send-now-form-${post.id}`}
                            style={smallPrimaryButtonStyle()}
                          >
                            Jetzt senden
                          </button>

                          <button
                            type="submit"
                            form={`sent-form-${post.id}`}
                            style={smallButtonStyle()}
                          >
                            Auf sent setzen
                          </button>

                          <button
                            type="submit"
                            form={`failed-form-${post.id}`}
                            style={smallButtonStyle()}
                          >
                            Auf failed setzen
                          </button>

                          <button
                            type="submit"
                            form={`delete-form-${post.id}`}
                            style={dangerButtonStyle()}
                          >
                            Post löschen
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </form>

                {plannedListPosts.map((post) => (
                  <div key={`post-forms-${post.id}`} style={{ display: "none" }}>
                    <form
                      id={`sending-form-${post.id}`}
                      method="post"
                      action="/api/posts/update-status"
                    >
                      <input type="hidden" name="id" value={post.id} />
                      <input type="hidden" name="status" value="sending" />
                      <input type="hidden" name="returnTo" value={postsReturnTo} />
                    </form>

                    <form
                      id={`send-now-form-${post.id}`}
                      method="post"
                      action="/api/posts/update-status"
                    >
                      <input type="hidden" name="id" value={post.id} />
                      <input type="hidden" name="status" value="send-now" />
                      <input type="hidden" name="returnTo" value={postsReturnTo} />
                    </form>

                    <form
                      id={`sent-form-${post.id}`}
                      method="post"
                      action="/api/posts/update-status"
                    >
                      <input type="hidden" name="id" value={post.id} />
                      <input type="hidden" name="status" value="sent" />
                      <input type="hidden" name="returnTo" value={postsReturnTo} />
                    </form>

                    <form
                      id={`failed-form-${post.id}`}
                      method="post"
                      action="/api/posts/update-status"
                    >
                      <input type="hidden" name="id" value={post.id} />
                      <input type="hidden" name="status" value="failed" />
                      <input type="hidden" name="returnTo" value={postsReturnTo} />
                    </form>

                    <form
                      id={`delete-form-${post.id}`}
                      method="post"
                      action="/api/posts/delete"
                    >
                      <input type="hidden" name="id" value={post.id} />
                      <input type="hidden" name="returnTo" value={postsReturnTo} />
                    </form>
                  </div>
                ))}
              </>
            ) : (
              <div style={{ marginTop: "16px" }}>
                <div style={softCardStyle()}>
                  <small style={mutedTextStyle()}>
                    Für diese Auswahl sind noch keine Posts vorhanden.
                  </small>
                </div>
              </div>
            )}
          </div>
        </section>
                <footer
          style={{
            marginTop: "40px",
            paddingTop: "24px",
            borderTop: "1px solid #243041",
            textAlign: "center",
            fontSize: "13px",
            color: "#94a3b8",
          }}
        >
          <Link
            href="/terms"
            style={{
              color: "#93c5fd",
              marginRight: "16px",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Terms of Service
          </Link>

          <Link
            href="/privacy"
            style={{
              color: "#93c5fd",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Privacy Policy
          </Link>
        </footer>
      </div>
    </main>
  );
}