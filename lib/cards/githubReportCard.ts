import type { Theme } from "../themes";
import { escapeXml, truncateText } from "../text";
import { appGlyph, thumbShadowFilter } from "./shared";
import type { GithubProfile, GithubRepo } from "../github";

const WIDTH = 340;
const PADDING = 18;
const PHOTO_SIZE = 56;
const HEADER_HEIGHT = 84;
const ROW_HEIGHT = 30;
const GPA_HEIGHT = 46;
const COMMENT_HEIGHT = 52;
const FOOTER_HEIGHT = 36;

interface Grade {
  letter: string;
  points: number;
}

function gradeFor(normalized: number): Grade {
  const v = Math.min(Math.max(normalized, 0), 1);
  if (v >= 0.97) return { letter: "A+", points: 4.3 };
  if (v >= 0.93) return { letter: "A", points: 4.0 };
  if (v >= 0.9) return { letter: "A-", points: 3.7 };
  if (v >= 0.87) return { letter: "B+", points: 3.3 };
  if (v >= 0.8) return { letter: "B", points: 3.0 };
  if (v >= 0.7) return { letter: "B-", points: 2.7 };
  if (v >= 0.6) return { letter: "C+", points: 2.3 };
  if (v >= 0.5) return { letter: "C", points: 2.0 };
  if (v >= 0.35) return { letter: "D", points: 1.0 };
  return { letter: "F", points: 0 };
}

export function buildGithubReportCard(profile: GithubProfile, repos: GithubRepo[], avatar: string | null, theme: Theme): string {
  const totalStars = repos.reduce((sum, r) => sum + (r.isFork ? 0 : r.stars), 0);
  const languageCount = new Set(repos.filter((r) => !r.isFork && r.language).map((r) => r.language)).size;
  const accountAgeYears = Math.max(0, (Date.now() - new Date(profile.createdAt).getTime()) / (365.25 * 24 * 3600 * 1000));

  const subjects = [
    { label: "OPEN SOURCE OUTPUT", grade: gradeFor(profile.publicRepos / 150) },
    { label: "COMMUNITY STANDING", grade: gradeFor(profile.followers / 500) },
    { label: "CODE QUALITY", grade: gradeFor(totalStars / 300) },
    { label: "LANGUAGE STUDIES", grade: gradeFor(languageCount / 8) },
    { label: "CONSISTENCY", grade: gradeFor(accountAgeYears / 8) },
  ];

  const gpa = subjects.reduce((sum, s) => sum + s.grade.points, 0) / subjects.length;
  const comment =
    gpa >= 3.7
      ? "Outstanding work — a model contributor to the class."
      : gpa >= 3.0
        ? "Solid, consistent effort. Keep it up."
        : gpa >= 2.0
          ? "Shows promise — more consistent practice recommended."
          : "Just getting started. Lots of room to grow!";

  const height = HEADER_HEIGHT + subjects.length * ROW_HEIGHT + GPA_HEIGHT + COMMENT_HEIGHT + FOOTER_HEIGHT + PADDING;
  const name = escapeXml(truncateText(profile.login, 15, WIDTH - PADDING * 2 - PHOTO_SIZE - 12));
  const rowsY = HEADER_HEIGHT;

  const rows = subjects
    .map((s, i) => {
      const y = rowsY + i * ROW_HEIGHT;
      return `<g transform="translate(0, ${y})">
    <text x="${PADDING}" y="20" class="subject">${s.label}</text>
    <text x="${WIDTH - PADDING}" y="20" text-anchor="end" class="grade">${s.grade.letter}</text>
    ${i < subjects.length - 1 ? `<line x1="${PADDING}" y1="${ROW_HEIGHT}" x2="${WIDTH - PADDING}" y2="${ROW_HEIGHT}" stroke="${theme.border}" stroke-opacity="0.35" />` : ""}
  </g>`;
    })
    .join("\n  ");

  const gpaY = rowsY + subjects.length * ROW_HEIGHT + 8;
  const commentY = gpaY + GPA_HEIGHT;
  const footerY = commentY + COMMENT_HEIGHT;

  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Report card for ${name} — GPA ${gpa.toFixed(2)}">
  <title>Report Card — ${name} — GPA ${gpa.toFixed(2)}</title>
  <defs>
    <clipPath id="reportPhoto"><rect x="${PADDING}" y="16" width="${PHOTO_SIZE}" height="${PHOTO_SIZE}" rx="6" /></clipPath>
    ${thumbShadowFilter()}
    <style>
      .title { font: 700 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; letter-spacing: 1.6px; }
      .name { font: 700 16px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
      .term { font: 400 11px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
      .subject { font: 600 11px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
      .grade { font: 700 13px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.accent}; }
      .gpa-label { font: 700 10px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1px; }
      .gpa-value { font: 700 22px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.primaryText}; }
      .comment { font: 400 italic 11px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; }
      .brand { font: 600 9px 'Segoe UI', Helvetica, Arial, sans-serif; fill: ${theme.secondaryText}; letter-spacing: 1px; }
    </style>
  </defs>

  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="16" fill="${theme.background}" stroke="${theme.border}" />

  <g filter="url(#thumbShadow)">
    ${avatar
      ? `<image href="${avatar}" x="${PADDING}" y="16" width="${PHOTO_SIZE}" height="${PHOTO_SIZE}" clip-path="url(#reportPhoto)" preserveAspectRatio="xMidYMid slice" />`
      : `<rect x="${PADDING}" y="16" width="${PHOTO_SIZE}" height="${PHOTO_SIZE}" rx="6" fill="${theme.border}" />
      <g transform="translate(${PADDING + PHOTO_SIZE / 2 - 6}, ${16 + PHOTO_SIZE / 2 - 7})">${appGlyph(theme.secondaryText)}</g>`}
  </g>
  <rect x="${PADDING + 0.5}" y="16.5" width="${PHOTO_SIZE - 1}" height="${PHOTO_SIZE - 1}" rx="6" fill="none" stroke="${theme.accent}" stroke-opacity="0.4" />

  <text x="${PADDING + PHOTO_SIZE + 14}" y="32" class="title">REPORT CARD</text>
  <text x="${PADDING + PHOTO_SIZE + 14}" y="52" class="name">${name}</text>
  <text x="${PADDING + PHOTO_SIZE + 14}" y="68" class="term">OPEN SOURCE ACADEMY</text>

  <line x1="${PADDING}" y1="${HEADER_HEIGHT - 6}" x2="${WIDTH - PADDING}" y2="${HEADER_HEIGHT - 6}" stroke="${theme.border}" stroke-opacity="0.6" />
  ${rows}

  <text x="${PADDING}" y="${gpaY + 16}" class="gpa-label">GPA</text>
  <text x="${PADDING + 44}" y="${gpaY + 22}" class="gpa-value">${gpa.toFixed(2)}</text>

  <text x="${PADDING}" y="${commentY + 10}" class="comment">${escapeXml(truncateText(comment, 11, WIDTH - PADDING * 2))}</text>

  <line x1="${PADDING}" y1="${footerY}" x2="${WIDTH - PADDING}" y2="${footerY}" stroke="${theme.border}" stroke-opacity="0.6" />
  <g transform="translate(${PADDING}, ${footerY + 10})" opacity="0.85">
    ${appGlyph(theme.secondaryText)}
    <text x="18" y="12" class="brand">README CARDS</text>
  </g>
</svg>`;
}
