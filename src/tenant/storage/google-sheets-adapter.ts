import { a1SheetRange, SHEET_HEADERS, STANDARD_SHEET_TABS } from "./sheet-tabs";
import { getGoogleAccessToken } from "./google-auth";
import type { SheetTab, StorageAdapter } from "./types";
// industry tabs applied at provision time

type SheetsValuesResponse = {
  values?: string[][];
  error?: { message?: string };
};

async function sheetsFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getGoogleAccessToken();
  return fetch(`https://sheets.googleapis.com/v4${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

async function driveFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getGoogleAccessToken();
  return fetch(`https://www.googleapis.com/drive/v3${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

function camelToSnake(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();
}

/** Map app camelCase fields onto sheet snake_case headers; extras → notes/detail. */
function mapRowToHeaders(
  headers: string[],
  row: Record<string, string | number | boolean>,
): Record<string, string | number | boolean> {
  const headerSet = new Set(headers);
  const out: Record<string, string | number | boolean> = {};
  const extras: string[] = [];

  for (const [key, value] of Object.entries(row)) {
    if (headerSet.has(key)) {
      out[key] = value;
      continue;
    }
    const snake = camelToSnake(key);
    if (headerSet.has(snake)) {
      out[snake] = value;
      continue;
    }
    // Common aliases
    if (key === "orderId" && headerSet.has("order_id")) out.order_id = value;
    else if (key === "bookingId" && headerSet.has("booking_id")) out.booking_id = value;
    else if ((key === "customerName" || key === "name") && headerSet.has("name") && !headerSet.has("customer_name")) {
      out.name = value;
    } else if ((key === "customerPhone" || key === "phone") && headerSet.has("phone") && !headerSet.has("customer_phone")) {
      out.phone = value;
    }
    else if (key === "total" && headerSet.has("total_paise")) {
      out.total_paise = typeof value === "number" ? Math.round(value * 100) : value;
    } else if (key === "price" && headerSet.has("notes")) {
      extras.push(`price=${value}`);
    } else if (key === "items" && headerSet.has("items_json")) out.items_json = value;
    else if (key === "paymentStatus" && headerSet.has("payment_status")) out.payment_status = value;
    else if (key === "paymentMethod" && headerSet.has("payment_method")) out.payment_method = value;
    else if (key === "customerName" && headerSet.has("customer_name")) out.customer_name = value;
    else if (key === "customerPhone" && headerSet.has("customer_phone")) out.customer_phone = value;
    else if (key === "customerAddress" && headerSet.has("customer_address")) out.customer_address = value;
    else if (key === "orderStatus" && headerSet.has("status")) out.status = value;
    else if (key === "deliveryStatus" && headerSet.has("delivery_status")) out.delivery_status = value;
    else if (key === "deliveryPartner" && headerSet.has("delivery_partner")) out.delivery_partner = value;
    else if (key === "trackingId" && headerSet.has("tracking_id")) out.tracking_id = value;
    else if (key === "trackingUrl" && headerSet.has("tracking_url")) out.tracking_url = value;
    else if (key === "packageName" && headerSet.has("package_name")) out.package_name = value;
    else if (key === "tableLabel" && headerSet.has("table_label")) out.table_label = value;
    else if (key === "orderCode" && headerSet.has("order_id")) out.order_id = value;
    else if (key === "paymentMode" && headerSet.has("payment_mode")) out.payment_mode = value;
    else if (key === "leadType" && headerSet.has("lead_type")) out.lead_type = value;
    else if (key === "refId" && headerSet.has("ref_id")) out.ref_id = value;
    else if (key === "refTitle" && headerSet.has("ref_title")) out.ref_title = value;
    else if (key === "slotDate" || key === "slotTime") {
      if (headerSet.has("starts_at")) {
        const prev = String(out.starts_at ?? "");
        out.starts_at = [prev, String(value)].filter(Boolean).join(" ").trim();
      } else extras.push(`${key}=${value}`);
    } else {
      extras.push(`${key}=${value}`);
    }
  }

  if (extras.length) {
    const sink = headerSet.has("notes") ? "notes" : headerSet.has("detail") ? "detail" : null;
    if (sink) {
      const existing = out[sink] ? String(out[sink]) + " | " : "";
      out[sink] = existing + extras.join("; ");
    }
  }

  return out;
}

function rowToValues(
  headers: string[],
  row: Record<string, string | number | boolean>,
): string[] {
  return headers.map((h) => {
    const v = row[h];
    if (v === undefined || v === null) return "";
    return String(v);
  });
}

function valuesToRows(headers: string[], values: string[][]): Record<string, string | number | boolean>[] {
  return values.map((line) => {
    const obj: Record<string, string | number | boolean> = {};
    headers.forEach((h, i) => {
      obj[h] = line[i] ?? "";
    });
    return obj;
  });
}

function headersFromFirstRow(first: string[] | undefined, fallback: string[]): string[] {
  if (!first?.length) return fallback;
  const live = first.map((h) => String(h).trim()).filter((h) => h.length > 0);
  return live.length ? live : fallback;
}

/** Live Google Sheets adapter — end-customer PII only (never platform Postgres). */
export class GoogleSheetsAdapter implements StorageAdapter {
  constructor(private spreadsheetId: string) {}

  async ensureTabsAndHeaders(tabs: readonly SheetTab[] = STANDARD_SHEET_TABS): Promise<void> {
    const tabList = tabs.length ? tabs : STANDARD_SHEET_TABS;
    const metaRes = await sheetsFetch(`/spreadsheets/${this.spreadsheetId}?fields=sheets.properties.title`);
    const meta = (await metaRes.json()) as {
      sheets?: { properties?: { title?: string } }[];
      error?: { message?: string };
    };
    if (!metaRes.ok) {
      throw new Error(meta.error?.message ?? `Could not read spreadsheet (${metaRes.status})`);
    }

    const existing = new Set(
      (meta.sheets ?? []).map((s) => s.properties?.title).filter(Boolean) as string[],
    );

    const requests: unknown[] = [];
    for (const tab of tabList) {
      if (!existing.has(tab)) {
        requests.push({ addSheet: { properties: { title: tab } } });
      }
    }
    if (requests.length) {
      const batch = await sheetsFetch(`/spreadsheets/${this.spreadsheetId}:batchUpdate`, {
        method: "POST",
        body: JSON.stringify({ requests }),
      });
      if (!batch.ok) {
        const err = (await batch.json()) as { error?: { message?: string } };
        throw new Error(err.error?.message ?? "Failed to create sheet tabs");
      }
    }

    for (const tab of tabList) {
      const headers = SHEET_HEADERS[tab];
      const range = a1SheetRange(tab, "A1:Z1");
      const peek = await sheetsFetch(
        `/spreadsheets/${this.spreadsheetId}/values/${encodeURIComponent(range)}`,
      );
      const peekData = (await peek.json()) as SheetsValuesResponse;
      const first = peekData.values?.[0] ?? [];
      const live = first.map((h) => String(h).trim());
      const have = new Set(live.filter(Boolean));
      const missing = headers.filter((h) => !have.has(h));
      const next = !have.size ? headers : missing.length ? [...first.map(String), ...missing] : null;
      if (!next) continue;

      const write = await sheetsFetch(
        `/spreadsheets/${this.spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
        {
          method: "PUT",
          body: JSON.stringify({ values: [next] }),
        },
      );
      if (!write.ok) {
        const err = (await write.json()) as { error?: { message?: string } };
        throw new Error(err.error?.message ?? `Failed to write headers for ${tab}`);
      }
    }
  }

  private async liveHeaders(tab: SheetTab): Promise<string[]> {
    const range = a1SheetRange(tab, "A1:Z1");
    const peek = await sheetsFetch(
      `/spreadsheets/${this.spreadsheetId}/values/${encodeURIComponent(range)}`,
    );
    const peekData = (await peek.json()) as SheetsValuesResponse;
    return headersFromFirstRow(peekData.values?.[0], SHEET_HEADERS[tab]);
  }

  async readRows(tab: SheetTab): Promise<Record<string, string | number | boolean>[]> {
    const headers = SHEET_HEADERS[tab];
    const range = a1SheetRange(tab, "A:Z");
    const res = await sheetsFetch(
      `/spreadsheets/${this.spreadsheetId}/values/${encodeURIComponent(range)}`,
    );
    const data = (await res.json()) as SheetsValuesResponse;
    if (!res.ok) {
      throw new Error(data.error?.message ?? `Sheets read failed (${res.status})`);
    }
    const values = data.values ?? [];
    if (values.length <= 1) return [];
    const liveHeaders = headersFromFirstRow(values[0], headers);
    return valuesToRows(liveHeaders, values.slice(1));
  }

  async appendRow(tab: SheetTab, row: Record<string, string | number | boolean>): Promise<void> {
    const headers = await this.liveHeaders(tab);
    const normalized = mapRowToHeaders(headers, row);
    if (tab === "Activity Log" && !normalized.at) {
      normalized.at = new Date().toISOString();
    }
    if (tab !== "Activity Log" && !normalized.created_at) {
      normalized.created_at = new Date().toISOString();
    }

    const values = rowToValues(headers, normalized);
    const range = a1SheetRange(tab, "A:Z");
    const res = await sheetsFetch(
      `/spreadsheets/${this.spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        body: JSON.stringify({ values: [values] }),
      },
    );
    if (!res.ok) {
      const err = (await res.json()) as { error?: { message?: string } };
      throw new Error(err.error?.message ?? `Sheets append failed (${res.status})`);
    }
  }
}

export type ProvisionedWorkbook = {
  spreadsheetId: string;
  spreadsheetUrl: string;
};

/** Create workbook owned by service account, industry tabs, optional share with tenant email. */
export async function provisionTenantWorkbook(params: {
  businessName: string;
  handle: string;
  shareWithEmail?: string;
  /** Industry group or vertical — selects C2 sheet template tabs. */
  industryGroup?: string;
  industryType?: string | null;
}): Promise<ProvisionedWorkbook> {
  const { sheetTabsForIndustry } = await import("./industry-sheets");
  const tabs = params.industryGroup
    ? sheetTabsForIndustry(params.industryGroup, params.industryType)
    : STANDARD_SHEET_TABS;

  const title = `ALINKS · ${params.businessName} (${params.handle})`;
  const sheets = tabs.map((titleTab, i) => ({
    properties: { title: titleTab, index: i },
  }));

  const createRes = await sheetsFetch("/spreadsheets", {
    method: "POST",
    body: JSON.stringify({
      properties: { title },
      sheets,
    }),
  });
  const created = (await createRes.json()) as {
    spreadsheetId?: string;
    spreadsheetUrl?: string;
    error?: { message?: string };
  };
  if (!createRes.ok || !created.spreadsheetId) {
    const msg = created.error?.message ?? "Failed to create Google Spreadsheet";
    // Service accounts on consumer Gmail have 0 Drive storage — cannot own new files.
    if (/quota|permission|storage/i.test(msg)) {
      throw new Error(
        `${msg}. Create a Sheet in your own Google Drive, share it as Editor with the ALINKS service account, then use “Save sheet connection”. Auto-create needs a Google Workspace Shared Drive (optional later).`,
      );
    }
    throw new Error(msg);
  }

  const adapter = new GoogleSheetsAdapter(created.spreadsheetId);
  await adapter.ensureTabsAndHeaders(tabs);

  if (params.shareWithEmail?.includes("@")) {
    const perm = await driveFetch(`/files/${created.spreadsheetId}/permissions?sendNotificationEmail=true`, {
      method: "POST",
      body: JSON.stringify({
        role: "writer",
        type: "user",
        emailAddress: params.shareWithEmail.trim().toLowerCase(),
      }),
    });
    if (!perm.ok) {
      // Non-fatal: workbook still exists; tenant can request access or re-share manually
      await perm.text().catch(() => "");
    }
  }

  return {
    spreadsheetId: created.spreadsheetId,
    spreadsheetUrl:
      created.spreadsheetUrl ?? `https://docs.google.com/spreadsheets/d/${created.spreadsheetId}`,
  };
}

export async function verifySpreadsheetAccess(spreadsheetId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const adapter = new GoogleSheetsAdapter(spreadsheetId);
    await adapter.ensureTabsAndHeaders();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Cannot access spreadsheet" };
  }
}
