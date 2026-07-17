"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Edit3, RefreshCw, Save, Trash2, X } from "lucide-react";
import { GlassPanel } from "@/components/glass-panel";

type FieldType = "text" | "number" | "textarea" | "select" | "checkbox";

export type AdminField = {
  name: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string | boolean }[];
  nullable?: boolean;
  hiddenOnTable?: boolean;
  imageHint?: string;
};

export type AdminColumn = {
  key: string;
  label: string;
  render?: (item: Record<string, unknown>) => string;
};

type AdminCrudResourceProps = {
  title: string;
  endpoint: string;
  itemPath?: string;
  fields?: AdminField[];
  columns: AdminColumn[];
  createEnabled?: boolean;
  editEnabled?: boolean;
  deleteEnabled?: boolean;
  refreshLabel?: string;
  emptyText?: string;
  getRowId?: (item: Record<string, unknown>) => string;
  updatePayload?: (values: Record<string, unknown>, item?: Record<string, unknown>) => Record<string, unknown>;
};

function getValue(item: Record<string, unknown>, path: string) {
  return path.split(".").reduce<unknown>((value, key) => {
    if (value && typeof value === "object" && key in value) return (value as Record<string, unknown>)[key];
    return undefined;
  }, item);
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "فعال" : "غیرفعال";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).toLocaleString("fa-IR");
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      const roleNames = value
        .map((item) => item && typeof item === "object" ? (item as { role?: { name?: string } }).role?.name : null)
        .filter(Boolean);
      return roleNames.length ? roleNames.join("، ") : `${value.length} مورد`;
    }
    return "جزئیات";
  }
  return String(value);
}

function normalizeForInput(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value;
  return String(value);
}

function prepareValues(fields: AdminField[], values: Record<string, unknown>) {
  return Object.fromEntries(
    fields.map((field) => {
      const value = values[field.name];
      if (field.type === "number") return [field.name, value === "" || value === undefined ? (field.nullable ? null : 0) : Number(value)];
      if (field.type === "checkbox") return [field.name, Boolean(value)];
      if (field.nullable && value === "") return [field.name, null];
      return [field.name, value];
    }),
  );
}

export function AdminCrudResource({
  title,
  endpoint,
  itemPath,
  fields = [],
  columns,
  createEnabled = true,
  editEnabled = true,
  deleteEnabled = true,
  refreshLabel = "به‌روزرسانی",
  emptyText = "هنوز داده‌ای ثبت نشده است.",
  getRowId = (item) => String(item.id),
  updatePayload,
}: AdminCrudResourceProps) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const canSubmit = createEnabled || Boolean(editingItem);
  const effectiveItemEndpoint = (item: Record<string, unknown>) => itemPath ? itemPath.replace(":id", encodeURIComponent(getRowId(item))) : `${endpoint}/${encodeURIComponent(getRowId(item))}`;

  const blankValues = useMemo(
    () => Object.fromEntries(fields.map((field) => [field.name, field.type === "checkbox" ? false : ""])),
    [fields],
  );

  async function load() {
    setMessage("");
    const response = await fetch(endpoint, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error ?? "دریافت اطلاعات ناموفق بود.");
      return;
    }
    setItems((result.items ?? []) as Record<string, unknown>[]);
  }

  useEffect(() => {
    setValues(blankValues);
    load().catch(() => setMessage("دریافت اطلاعات ناموفق بود."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  function startEdit(item: Record<string, unknown>) {
    setEditingItem(item);
    setValues(Object.fromEntries(fields.map((field) => [field.name, normalizeForInput(getValue(item, field.name))])));
  }

  function resetForm() {
    setEditingItem(null);
    setValues(blankValues);
  }

  function submit() {
    if (!canSubmit) return;
    setMessage("");
    startTransition(async () => {
      const rawPayload = prepareValues(fields, values);
      const payload = updatePayload ? updatePayload(rawPayload, editingItem ?? undefined) : rawPayload;
      const response = await fetch(editingItem ? effectiveItemEndpoint(editingItem) : endpoint, {
        method: editingItem ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error ? "اطلاعات وارد شده معتبر نیست یا عملیات مجاز نیست." : "ذخیره ناموفق بود.");
        return;
      }
      setMessage(editingItem ? "تغییرات ذخیره شد." : "رکورد جدید ثبت شد.");
      resetForm();
      await load();
    });
  }

  function remove(item: Record<string, unknown>) {
    if (!deleteEnabled) return;
    const label = columns[0]?.render?.(item) ?? displayValue(getValue(item, columns[0]?.key ?? "id"));
    if (!window.confirm(`حذف «${label}» انجام شود؟`)) return;
    setMessage("");
    startTransition(async () => {
      const response = await fetch(effectiveItemEndpoint(item), { method: "DELETE" });
      if (!response.ok) {
        setMessage("حذف ناموفق بود. شاید این رکورد به داده‌های دیگری وابسته باشد.");
        return;
      }
      setMessage("رکورد حذف شد.");
      await load();
    });
  }

  return (
    <div className="grid gap-5">
      {fields.length > 0 && (createEnabled || editingItem) && (
        <GlassPanel>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">{editingItem ? `ویرایش ${title}` : `افزودن ${title}`}</h2>
            {editingItem && <button className="btn" type="button" onClick={resetForm}><X size={18} /> انصراف از ویرایش</button>}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {fields.map((field) => (
              <label key={field.name} className={field.type === "textarea" ? "grid gap-2 md:col-span-2" : "grid gap-2"}>
                <span className="text-sm text-[#6F6256]">{field.label}</span>
                {field.type === "textarea" ? (
                  <textarea
                    className="field min-h-28 py-3"
                    value={String(values[field.name] ?? "")}
                    onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                ) : field.type === "select" ? (
                  <select
                    className="field"
                    value={String(values[field.name] ?? "")}
                    onChange={(event) => {
                      const option = field.options?.find((item) => String(item.value) === event.target.value);
                      setValues((current) => ({ ...current, [field.name]: option?.value ?? event.target.value }));
                    }}
                    required={field.required}
                  >
                    <option value="">انتخاب کنید</option>
                    {field.options?.map((option) => <option key={String(option.value)} value={String(option.value)}>{option.label}</option>)}
                  </select>
                ) : field.type === "checkbox" ? (
                  <span className="flex min-h-11 items-center gap-2 rounded-2xl border border-[#B8874B]/20 bg-white px-4">
                    <input
                      type="checkbox"
                      checked={Boolean(values[field.name])}
                      onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.checked }))}
                    />
                    فعال
                  </span>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      className="field min-w-0 flex-1"
                      type={field.type === "number" ? "number" : "text"}
                      value={String(values[field.name] ?? "")}
                      onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                      placeholder={field.placeholder}
                      required={field.required}
                      dir={field.name.toLowerCase().includes("url") || field.name.toLowerCase().includes("slug") || field.name.toLowerCase().includes("sku") ? "ltr" : undefined}
                    />
                    {field.imageHint && <span className="rounded-2xl border border-[#B8874B]/45 bg-[#FFF4DF] px-3 py-2 text-xs leading-6 text-[#6F6256] sm:max-w-[240px]">{field.imageHint}</span>}
                  </div>
                )}
              </label>
            ))}
          </div>
          <button className="btn-primary btn mt-4" type="button" onClick={submit} disabled={isPending || !canSubmit}>
            <Save size={18} /> {isPending ? "در حال ذخیره..." : "ذخیره"}
          </button>
        </GlassPanel>
      )}

      <GlassPanel>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">لیست {title}</h2>
          <button className="btn" type="button" onClick={() => startTransition(() => void load())}><RefreshCw size={18} /> {refreshLabel}</button>
        </div>
        {message && <p className="mb-4 rounded-2xl bg-[#FFF4DF] p-4 text-sm text-[#4A2F1B]">{message}</p>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-right text-[#6F6256]">
                {columns.map((column) => <th key={column.key} className="px-4 pb-2 font-medium">{column.label}</th>)}
                {(editEnabled || deleteEnabled) && <th className="px-4 pb-2 font-medium">عملیات</th>}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td className="rounded-2xl bg-[#FFF4DF] p-4 text-center text-[#6F6256]" colSpan={columns.length + 1}>{emptyText}</td></tr>
              )}
              {items.map((item) => (
                <tr key={getRowId(item)} className="bg-[#FFF4DF]">
                  {columns.map((column) => <td key={column.key} className="max-w-[260px] truncate p-4 first:rounded-r-2xl">{column.render ? column.render(item) : displayValue(getValue(item, column.key))}</td>)}
                  {(editEnabled || deleteEnabled) && (
                    <td className="p-4 last:rounded-l-2xl">
                      <span className="flex gap-2">
                        {editEnabled && fields.length > 0 && <button className="btn" type="button" onClick={() => startEdit(item)}><Edit3 size={16} /> ویرایش</button>}
                        {deleteEnabled && <button className="btn" type="button" onClick={() => remove(item)}><Trash2 size={16} /> حذف</button>}
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}
