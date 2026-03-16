import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "@/shared/components/seo/SEO";
import {
  ArrowLeft,
  Copy,
  Check,
  Download,
  Plus,
  Loader2,
  Ticket,
  Info,
  AlertTriangle,
  Trash2,
  CalendarClock,
  Hash,
  Globe,
  GraduationCap,
  Building2,
  University,
  Sparkles,
  CircleDot,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import { Checkbox } from "@/shared/ui/checkbox";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Separator } from "@/shared/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createPrepaidCode } from "../api";
import type { PrepaidCode, CreatePrepaidCodeRequest } from "../types";

const LS_KEY = "ecampus:prepaid-codes-session";

const SCOPE_LABELS: Record<number, string> = {
  0: "Course",
  1: "Faculty",
  2: "University",
  3: "Global",
};

const SCOPE_COLORS: Record<number, string> = {
  0: "text-primary",
  1: "text-blue-500",
  2: "text-violet-500",
  3: "text-emerald-500",
};

const ManagePrepaidCodesPage = () => {
  const navigate = useNavigate();

  // ── Form state ──
  const [value, setValue] = useState<string>("0");
  const [quantity, setQuantity] = useState<string>("1");
  const [scopeType, setScopeType] = useState<"0" | "1" | "2" | "3">("3");
  const [scopeReferenceId, setScopeReferenceId] = useState<string>("");
  const [isReusable, setIsReusable] = useState(false);
  const [expirationDate, setExpirationDate] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Codes — seeded from localStorage so they survive refresh ──
  const [allCodes, setAllCodes] = useState<PrepaidCode[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as PrepaidCode[]) : [];
    } catch {
      return [];
    }
  });

  const [lastBatchIds, setLastBatchIds] = useState<Set<number>>(new Set());
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Persist to localStorage whenever codes change
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(allCodes));
    } catch {
      /* storage full */
    }
  }, [allCodes]);

  // Warn before closing/refreshing when codes are present
  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (allCodes.length > 0) {
        e.preventDefault();
      }
    },
    [allCodes.length],
  );

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [handleBeforeUnload]);

  const isScopeGlobal = scopeType === "3";

  // ── Handlers ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedValue = parseFloat(value);
    const parsedQty = parseInt(quantity);

    if (isNaN(parsedValue) || parsedValue < 0) {
      toast.error("Please enter a valid value (≥ 0).");
      return;
    }
    if (isNaN(parsedQty) || parsedQty < 1) {
      toast.error("Quantity must be at least 1.");
      return;
    }
    if (!isScopeGlobal && !scopeReferenceId.trim()) {
      toast.error("Scope Reference ID is required for non-global scopes.");
      return;
    }

    const payload: CreatePrepaidCodeRequest = {
      value: parsedValue,
      quantity: parsedQty,
      scopeType: parseInt(scopeType) as 0 | 1 | 2 | 3,
      scopeReferenceId: isScopeGlobal ? undefined : parseInt(scopeReferenceId),
      isReusable,
      expirationDate: expirationDate
        ? new Date(expirationDate).toISOString()
        : undefined,
    };

    setLoading(true);
    try {
      const codes = await createPrepaidCode(payload);
      const newIds = new Set(codes.map((c) => c.id));
      setAllCodes((prev) => [...codes, ...prev]);
      setLastBatchIds(newIds);
      toast.success(
        `${codes.length} prepaid code${codes.length > 1 ? "s" : ""} generated!`,
      );
      setValue("0");
      setQuantity("1");
    } catch {
      toast.error("Failed to generate prepaid codes.");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async (code: PrepaidCode) => {
    try {
      await navigator.clipboard.writeText(code.code);
      setCopiedId(code.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy.");
    }
  };

  const copyAll = async () => {
    if (allCodes.length === 0) return;
    try {
      await navigator.clipboard.writeText(
        allCodes.map((c) => c.code).join("\n"),
      );
      toast.success(`Copied ${allCodes.length} codes.`);
    } catch {
      toast.error("Failed to copy.");
    }
  };

  const clearAll = () => {
    setAllCodes([]);
    setLastBatchIds(new Set());
    localStorage.removeItem(LS_KEY);
    toast.success("Code list cleared.");
  };

  const downloadPdf = () => {
    if (allCodes.length === 0) return;

    const totalVal = allCodes.reduce((s, c) => s + c.value, 0);
    const activeCount = allCodes.filter((c) => c.isActive).length;
    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const scopeColor: Record<number, string> = {
      0: "#f97316",
      1: "#3b82f6",
      2: "#1e293b",
      3: "#10b981",
    };

    const rows = allCodes
      .map(
        (c, i) => `<tr class="${i % 2 === 0 ? "even" : ""}">
          <td class="num">${i + 1}</td>
          <td class="code">${c.code}</td>
          <td class="val">${c.value.toFixed(2)} JD</td>
          <td><span class="scope-pill" style="background:${scopeColor[c.scopeType] ?? "#71717a"}15;color:${scopeColor[c.scopeType] ?? "#71717a"};border:1px solid ${scopeColor[c.scopeType] ?? "#71717a"}30">${SCOPE_LABELS[c.scopeType] ?? c.scopeType}${c.scopeReferenceId != null ? ` #${c.scopeReferenceId}` : ""}</span></td>
          <td class="center">${c.remainingUses}</td>
          <td class="center"><span class="status ${c.isActive ? "active" : "inactive"}">${c.isActive ? "Active" : "Inactive"}</span></td>
          <td>${c.expirationDate ? new Date(c.expirationDate).toLocaleDateString() : "—"}</td>
        </tr>`,
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Prepaid Codes — eCampus</title>
  <style>
    @page { margin: 18mm 14mm; size: A4 landscape; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #18181b; background: #fff; }

    /* Header */
    .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 2px solid #1e293b; margin-bottom: 18px; }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand-logo { height: 40px; width: auto; }
    .brand h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #1e293b; }
    .brand span { color: #f97316; }
    .meta { text-align: right; font-size: 11px; color: #71717a; line-height: 1.6; }
    .meta strong { color: #18181b; font-weight: 600; }

    /* Summary cards */
    .summary { display: flex; gap: 12px; margin-bottom: 20px; }
    .stat-card { flex: 1; border: 1px solid #e4e4e7; border-radius: 10px; padding: 12px 16px; }
    .stat-card .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; color: #a1a1aa; font-weight: 600; margin-bottom: 2px; }
    .stat-card .value { font-size: 20px; font-weight: 700; color: #18181b; }
    .stat-card .value .unit { font-size: 12px; font-weight: 500; color: #71717a; }
    .stat-card.highlight { background: linear-gradient(135deg, #fff7ed, #ffedd5); border-color: #fdba74; }
    .stat-card.highlight .value { color: #ea580c; }

    /* Table */
    table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 11.5px; border: 1px solid #e4e4e7; border-radius: 10px; overflow: hidden; }
    thead th { background: #fafafa; padding: 10px 12px; text-align: left; font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #71717a; border-bottom: 1.5px solid #e4e4e7; }
    tbody td { padding: 9px 12px; border-bottom: 1px solid #f4f4f5; vertical-align: middle; }
    tr.even td { background: #fafafa; }
    tbody tr:last-child td { border-bottom: none; }
    .num { color: #a1a1aa; font-size: 10px; font-weight: 500; width: 30px; }
    .code { font-family: 'SF Mono', 'Consolas', 'Monaco', monospace; font-weight: 700; font-size: 12px; letter-spacing: 0.3px; color: #18181b; }
    .val { font-weight: 600; font-variant-numeric: tabular-nums; }
    .center { text-align: center; }
    .scope-pill { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; white-space: nowrap; }
    .status { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; }
    .status.active { background: #dcfce7; color: #15803d; }
    .status.inactive { background: #f4f4f5; color: #71717a; }

    /* Footer */
    .footer { margin-top: 20px; padding-top: 14px; border-top: 1px solid #e4e4e7; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #a1a1aa; }
    .footer .conf { font-style: italic; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .stat-card.highlight { background: #fff7ed !important; }
      tr.even td { background: #fafafa !important; }
      thead th { background: #fafafa !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <img src="/logo.png" class="brand-logo" alt="eCampus" />
      <h1>e<span>Campus</span></h1>
    </div>
    <div class="meta">
      <div>Prepaid Codes Report</div>
      <div>Generated: <strong>${dateStr}</strong></div>
    </div>
  </div>

  <div class="summary">
    <div class="stat-card">
      <div class="label">Total Codes</div>
      <div class="value">${allCodes.length}</div>
    </div>
    <div class="stat-card highlight">
      <div class="label">Active</div>
      <div class="value">${activeCount}</div>
    </div>
    <div class="stat-card">
      <div class="label">Total Value</div>
      <div class="value">${totalVal.toFixed(2)} <span class="unit">JD</span></div>
    </div>
    <div class="stat-card">
      <div class="label">Avg Value / Code</div>
      <div class="value">${allCodes.length > 0 ? (totalVal / allCodes.length).toFixed(2) : "0.00"} <span class="unit">JD</span></div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Code</th>
        <th>Value</th>
        <th>Scope</th>
        <th>Uses Left</th>
        <th>Status</th>
        <th>Expires</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="footer">
    <div class="conf">This document is confidential — do not share publicly.</div>
    <div style="text-align:center; line-height:1.6; font-size:10px; color:#71717a;">
      <div style="font-weight:600; color:#18181b;">ecampusjo.com</div>
      <div>For inquiries: +962795441474</div>
    </div>
    <div>eCampus Platform &bull; ${new Date().getFullYear()}</div>
  </div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) {
      toast.error("Popup blocked — please allow popups.");
      return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  // ── Computed stats ──
  const totalValue = allCodes.reduce((s, c) => s + c.value, 0);
  const activeCodes = allCodes.filter((c) => c.isActive).length;

  return (
    <>
      <SEO title="Manage Prepaid Codes | eCampus" noIndex hreflang={false} />

      <div className="min-h-[80vh] space-y-6 pb-12">
        {/* ━━━ Hero header ━━━ */}
        <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          {/* Decorative blobs */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

          <div className="relative px-5 sm:px-8 py-6 sm:py-8">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 cursor-pointer text-white/60 hover:text-white hover:bg-white/10 mb-4 -ml-2"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
                  <Ticket className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Prepaid Codes
                  </h1>
                  <p className="text-white/50 text-xs sm:text-sm mt-0.5">
                    Generate, distribute & track enrollment codes
                  </p>
                </div>
              </div>

              {/* Quick stats */}
              {allCodes.length > 0 && (
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <StatChip
                    label="Total codes"
                    value={allCodes.length.toString()}
                  />
                  <StatChip label="Active" value={activeCodes.toString()} />
                  <StatChip
                    label="Total value"
                    value={`${totalValue.toFixed(2)} JD`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ━━━ Warning banner ━━━ */}
        {allCodes.length > 0 && (
          <Alert className="border-amber-300/50 bg-amber-50/80 dark:bg-amber-950/20 dark:border-amber-800/40">
            <AlertTriangle className="h-4 w-4 text-amber-500!" />
            <AlertDescription className="text-amber-800 dark:text-amber-300 text-xs sm:text-sm leading-relaxed">
              <strong>Important:</strong> Codes are cached in your browser only.
              Download the PDF or copy before leaving — the backend{" "}
              <strong>cannot recover</strong> them after you navigate away.
            </AlertDescription>
          </Alert>
        )}

        {/* ━━━ Main grid ━━━ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
          {/* ── Generate Form ── */}
          <div className="lg:col-span-4 xl:col-span-4">
            <Card className="sticky top-20 border-border/50 shadow-sm">
              <div className="px-5 pt-5 pb-3 flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Generate New Codes</h2>
                  <p className="text-xs text-muted-foreground">
                    Configure & create codes
                  </p>
                </div>
              </div>

              <Separator />

              <CardContent className="pt-5 pb-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Value + Quantity side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Value (JD)" required>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        required
                        className="h-9"
                        placeholder="0.00"
                      />
                    </FormField>
                    <FormField label="Quantity" required>
                      <Input
                        type="number"
                        min="1"
                        max="500"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                        className="h-9"
                        placeholder="1"
                      />
                    </FormField>
                  </div>

                  {/* Scope Type */}
                  <FormField label="Scope" required>
                    <Select
                      value={scopeType}
                      onValueChange={(v) =>
                        setScopeType(v as "0" | "1" | "2" | "3")
                      }
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">
                          <span className="flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5 text-emerald-500" />
                            Global — any course
                          </span>
                        </SelectItem>
                        <SelectItem value="0">
                          <span className="flex items-center gap-2">
                            <GraduationCap className="h-3.5 w-3.5 text-primary" />
                            Course — specific course
                          </span>
                        </SelectItem>
                        <SelectItem value="1">
                          <span className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-blue-500" />
                            Faculty — any course in faculty
                          </span>
                        </SelectItem>
                        <SelectItem value="2">
                          <span className="flex items-center gap-2">
                            <University className="h-3.5 w-3.5 text-violet-500" />
                            University — any course in uni
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  {/* Scope Reference ID */}
                  {!isScopeGlobal && (
                    <FormField
                      label={
                        scopeType === "0"
                          ? "Course ID"
                          : scopeType === "1"
                            ? "Faculty ID"
                            : "University ID"
                      }
                      required
                    >
                      <div className="relative">
                        <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                        <Input
                          type="number"
                          min="1"
                          value={scopeReferenceId}
                          onChange={(e) => setScopeReferenceId(e.target.value)}
                          placeholder="Enter numeric ID"
                          required
                          className="h-9 pl-8"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 flex items-start gap-1">
                        <Info className="h-3 w-3 mt-0.5 shrink-0" />
                        {scopeType === "0"
                          ? "Only works for this specific course."
                          : scopeType === "1"
                            ? "Works for any course in this faculty."
                            : "Works for any course in this university."}
                      </p>
                    </FormField>
                  )}

                  {/* Expiration Date */}
                  <FormField label="Expiration" optional>
                    <div className="relative">
                      <CalendarClock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                      <Input
                        type="date"
                        value={expirationDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setExpirationDate(e.target.value)}
                        className="h-9 pl-8"
                      />
                    </div>
                  </FormField>

                  {/* Reusable toggle */}
                  <div className="flex items-start gap-3 rounded-lg border bg-muted/20 px-3.5 py-3">
                    <Checkbox
                      id="pc-reusable"
                      checked={isReusable}
                      onCheckedChange={(c) => setIsReusable(c === true)}
                      className="mt-0.5"
                    />
                    <div className="space-y-0.5">
                      <Label
                        htmlFor="pc-reusable"
                        className="cursor-pointer text-sm font-medium leading-tight"
                      >
                        Reusable code
                      </Label>
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        Code stays active after all uses are consumed.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full cursor-pointer h-10 text-sm font-medium"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating…
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Generate{" "}
                        {parseInt(quantity) > 1 ? `${quantity} Codes` : "Code"}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* ── Codes Panel ── */}
          <div className="lg:col-span-8 xl:col-span-8 space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-base">Codes</h2>
                {allCodes.length > 0 && (
                  <Badge variant="secondary" className="text-xs tabular-nums">
                    {allCodes.length}
                  </Badge>
                )}
              </div>

              {allCodes.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer gap-1.5 h-8 text-xs"
                        onClick={copyAll}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span className="hidden xs:inline">Copy All</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy all codes to clipboard</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer gap-1.5 h-8 text-xs"
                        onClick={downloadPdf}
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span className="hidden xs:inline">PDF</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download as printable PDF</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer gap-1.5 h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={clearAll}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="hidden xs:inline">Clear</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Clear all stored codes</TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>

            {/* Empty state */}
            {allCodes.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-20 sm:py-24">
                  <div className="relative mb-5">
                    <div className="h-16 w-16 rounded-2xl bg-muted/80 flex items-center justify-center">
                      <Ticket className="h-7 w-7 text-muted-foreground/30" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-background">
                      <Plus className="h-3 w-3 text-primary" />
                    </div>
                  </div>
                  <p className="text-sm font-medium">No codes yet</p>
                  <p className="text-xs text-muted-foreground mt-1 text-center max-w-[220px]">
                    Fill in the form and generate your first batch of prepaid
                    codes.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* ── Desktop table ── */}
                <Card className="hidden md:block shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="text-xs font-semibold">
                              Code
                            </TableHead>
                            <TableHead className="text-xs font-semibold">
                              Value
                            </TableHead>
                            <TableHead className="text-xs font-semibold">
                              Scope
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-center">
                              Uses
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-center">
                              Status
                            </TableHead>
                            <TableHead className="text-xs font-semibold">
                              Expires
                            </TableHead>
                            <TableHead className="w-9" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allCodes.map((c) => {
                            const isNew = lastBatchIds.has(c.id);
                            return (
                              <TableRow
                                key={c.id}
                                className={cn(
                                  "group transition-colors",
                                  isNew &&
                                    "bg-emerald-50/60 dark:bg-emerald-950/10",
                                )}
                              >
                                <TableCell className="font-mono text-xs font-semibold tracking-wide">
                                  <div className="flex items-center gap-1.5">
                                    {isNew && (
                                      <CircleDot className="h-3 w-3 text-emerald-500 shrink-0" />
                                    )}
                                    {c.code}
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm tabular-nums">
                                  {c.value.toFixed(2)}{" "}
                                  <span className="text-muted-foreground text-xs">
                                    JD
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={cn(
                                      "text-xs font-medium",
                                      SCOPE_COLORS[c.scopeType],
                                    )}
                                  >
                                    {SCOPE_LABELS[c.scopeType] ?? c.scopeType}
                                  </span>
                                  {c.scopeReferenceId != null && (
                                    <span className="text-muted-foreground text-xs ml-1">
                                      #{c.scopeReferenceId}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center text-sm tabular-nums">
                                  {c.remainingUses}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge
                                    variant={
                                      c.isActive ? "default" : "secondary"
                                    }
                                    className={cn(
                                      "text-[10px] px-2",
                                      c.isActive &&
                                        "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15",
                                    )}
                                  >
                                    {c.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {c.expirationDate
                                    ? new Date(
                                        c.expirationDate,
                                      ).toLocaleDateString()
                                    : "—"}
                                </TableCell>
                                <TableCell>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => copyCode(c)}
                                      >
                                        {copiedId === c.id ? (
                                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                                        ) : (
                                          <Copy className="h-3.5 w-3.5" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left">
                                      Copy code
                                    </TooltipContent>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* ── Mobile cards ── */}
                <div className="md:hidden space-y-2.5">
                  {allCodes.map((c) => {
                    const isNew = lastBatchIds.has(c.id);
                    return (
                      <Card
                        key={c.id}
                        className={cn(
                          "overflow-hidden transition-colors",
                          isNew &&
                            "ring-1 ring-emerald-400/40 bg-emerald-50/40 dark:bg-emerald-950/10",
                        )}
                      >
                        <CardContent className="p-3.5 space-y-2.5">
                          {/* Code + copy */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {isNew && (
                                <CircleDot className="h-3 w-3 text-emerald-500 shrink-0" />
                              )}
                              <span className="font-mono font-bold text-sm break-all leading-tight">
                                {c.code}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0 cursor-pointer"
                              onClick={() => copyCode(c)}
                            >
                              {copiedId === c.id ? (
                                <Check className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <Copy className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>

                          {/* Meta row */}
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-[11px] tabular-nums gap-1 font-medium"
                            >
                              {c.value.toFixed(2)} JD
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[11px] gap-1",
                                SCOPE_COLORS[c.scopeType],
                              )}
                            >
                              {SCOPE_LABELS[c.scopeType]}
                              {c.scopeReferenceId != null &&
                                ` #${c.scopeReferenceId}`}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-[11px] gap-1"
                            >
                              {c.isReusable ? (
                                <RefreshCw className="h-2.5 w-2.5" />
                              ) : null}
                              {c.remainingUses} use
                              {c.remainingUses !== 1 ? "s" : ""}
                            </Badge>
                          </div>

                          {/* Bottom row */}
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-muted-foreground">
                              {c.expirationDate
                                ? `Exp. ${new Date(c.expirationDate).toLocaleDateString()}`
                                : "No expiry"}
                            </span>
                            <Badge
                              variant={c.isActive ? "default" : "secondary"}
                              className={cn(
                                "text-[10px] px-2",
                                c.isActive &&
                                  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15",
                              )}
                            >
                              {c.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ── Small helper components ──

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 ring-1 ring-white/10">
      <span className="text-white/50 text-[11px]">{label}</span>
      <span className="text-white text-sm font-semibold tabular-nums">
        {value}
      </span>
    </div>
  );
}

function FormField({
  label,
  required,
  optional,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
        {optional && (
          <span className="text-muted-foreground font-normal ml-1">
            (optional)
          </span>
        )}
      </Label>
      {children}
    </div>
  );
}

export default ManagePrepaidCodesPage;
