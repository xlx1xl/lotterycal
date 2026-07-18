import type { ExportRow } from "./types";

/**
 * 将选中投注行导出为 CSV 文件（UTF-8 with BOM，确保 Excel 正确显示中文）。
 */
export function exportToCsv(rows: ExportRow[]): void {
  const headers = [
    "类型",
    "选项描述",
    "赔率",
    "概率",
    "凯利比例",
    "凯利模式",
    "建议金额",
    "预期回报",
    "导出时间",
    "总资金",
  ];

  const escapeCell = (val: string | number): string => {
    const s = String(val);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(
      [
        escapeCell(row.type),
        escapeCell(row.label),
        escapeCell(row.odds.toFixed(2)),
        escapeCell((row.probability * 100).toFixed(1) + "%"),
        escapeCell((row.kelly * 100).toFixed(2) + "%"),
        escapeCell(row.kellyMode),
        escapeCell(row.suggestedAmount.toFixed(2)),
        escapeCell(row.expectedReturn.toFixed(2)),
        escapeCell(row.exportedAt),
        escapeCell(row.totalBankroll.toFixed(2)),
      ].join(","),
    );
  }

  const csv = "\uFEFF" + lines.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `betting_sheet_${timestampForFilename()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function timestampForFilename(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    "_" +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}
