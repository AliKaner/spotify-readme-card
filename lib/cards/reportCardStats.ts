import type { GithubProfile, GithubRepo } from "../github";

export interface Grade {
  letter: string;
  points: number;
}

export interface Subject {
  label: string;
  grade: Grade;
}

export interface ReportCardStats {
  subjects: Subject[];
  gpa: number;
}

export function gradeFor(normalized: number): Grade {
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

/** Color-codes a letter grade for display — green for strong grades, amber mid, red weak. */
export function gradeColor(grade: Grade): string {
  if (grade.points >= 3.7) return "#4ade80";
  if (grade.points >= 3.0) return "#a3e635";
  if (grade.points >= 2.0) return "#f4c542";
  if (grade.points >= 1.0) return "#f97316";
  return "#ef4444";
}

export function honorsFor(gpa: number): string {
  if (gpa >= 3.7) return "Summa Cum Laude";
  if (gpa >= 3.3) return "Magna Cum Laude";
  if (gpa >= 3.0) return "Cum Laude";
  return "Honorable Mention";
}

export function computeReportCardStats(profile: GithubProfile, repos: GithubRepo[]): ReportCardStats {
  const totalStars = repos.reduce((sum, r) => sum + (r.isFork ? 0 : r.stars), 0);
  const languageCount = new Set(repos.filter((r) => !r.isFork && r.language).map((r) => r.language)).size;
  const accountAgeYears = Math.max(0, (Date.now() - new Date(profile.createdAt).getTime()) / (365.25 * 24 * 3600 * 1000));

  const subjects: Subject[] = [
    { label: "OPEN SOURCE OUTPUT", grade: gradeFor(profile.publicRepos / 150) },
    { label: "COMMUNITY STANDING", grade: gradeFor(profile.followers / 500) },
    { label: "CODE QUALITY", grade: gradeFor(totalStars / 300) },
    { label: "LANGUAGE STUDIES", grade: gradeFor(languageCount / 8) },
    { label: "CONSISTENCY", grade: gradeFor(accountAgeYears / 8) },
  ];

  const gpa = subjects.reduce((sum, s) => sum + s.grade.points, 0) / subjects.length;
  return { subjects, gpa };
}
