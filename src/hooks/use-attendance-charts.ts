import { useQuery } from "@tanstack/react-query";
import { BACKEND_BASE_URL } from "@/constants";

export type DaySummary = {
  date: string;
  byStatus: Record<string, number>;
  total: number;
};

export type SummaryResponse = {
  data: {
    classId: number;
    date: string;
    byStatus: Record<string, number>;
    total: number;
  };
};

export type MonthlyResponse = {
  data: {
    classId: number;
    year: number;
    month: number;
    days: DaySummary[];
  };
};

const getBaseUrl = () => (BACKEND_BASE_URL ?? "").replace(/\/$/, "");

async function fetchSummary(classId: string, date: string): Promise<SummaryResponse["data"]> {
  const url = `${getBaseUrl()}/attendance/class/${classId}/summary?date=${encodeURIComponent(date)}`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch summary");
  const json: SummaryResponse = await res.json();
  return json.data;
}

async function fetchMonthly(
  classId: string,
  year: number,
  month: number
): Promise<MonthlyResponse["data"]> {
  const url = `${getBaseUrl()}/attendance/class/${classId}/summary/month?year=${year}&month=${month}`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch monthly summary");
  const json: MonthlyResponse = await res.json();
  return json.data;
}

export function useAttendanceSummary(classId: string, date: string, enabled: boolean) {
  return useQuery({
    queryKey: ["attendance", "summary", classId, date],
    queryFn: () => fetchSummary(classId, date),
    enabled: Boolean(classId && date && enabled),
  });
}

export function useAttendanceMonthly(
  classId: string,
  year: number,
  month: number,
  enabled: boolean
) {
  return useQuery({
    queryKey: ["attendance", "monthly", classId, year, month],
    queryFn: () => fetchMonthly(classId, year, month),
    enabled: Boolean(classId && enabled),
  });
}
