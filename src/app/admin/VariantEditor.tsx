'use client';
import { useEffect, useState } from 'react';
import type { Variant } from './adminTypes';

const makeId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export default function VariantEditor({
  value,
  onChange,
}: {
  value: Variant[];
  onChange: (v: Variant[]) => void;
}) {
  const [rows, setRows] = useState<Variant[]>(value?.length ? value : []);

  useEffect(() => {
    setRows(value?.length ? value : []);
  }, [value]);

  const sync = (next: Variant[]) => {
    setRows(next);
    onChange(next);
  };

  const add = () =>
    sync([
      ...rows,
      { id: makeId(), size: '', price: 0, stock: 0, active: true },
    ]);

  const update = (i: number, patch: Partial<Variant>) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    sync(next);
  };

  const remove = (i: number) => sync(rows.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold">사이즈 옵션(가격/재고)</div>

      <div className="grid grid-cols-12 gap-2 text-xs font-medium opacity-70">
        <div className="col-span-3">사이즈</div>
        <div className="col-span-4">가격 (AUD)</div>
        <div className="col-span-3">재고</div>
        <div className="col-span-2">판매</div>
      </div>

      {rows.map((r, i) => (
        <div key={r.id} className="grid grid-cols-12 gap-2 items-center">
          <input
            className="col-span-3 border p-2 rounded"
            placeholder="XS"
            value={r.size}
            onChange={(e) => update(i, { size: e.target.value })}
          />
          <input
            className="col-span-4 border p-2 rounded"
            type="number"
            step="0.01"
            placeholder="25"
            value={r.price}
            onChange={(e) => update(i, { price: Number(e.target.value) })}
          />
          <input
            className="col-span-3 border p-2 rounded"
            type="number"
            min={0}
            placeholder="0"
            value={r.stock ?? 0}
            onChange={(e) => update(i, { stock: Number(e.target.value) })}
          />
          <label className="col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={r.active ?? true}
              onChange={(e) => update(i, { active: e.target.checked })}
            />
            <span className="text-sm">활성</span>
          </label>

          <button
            className="col-span-12 md:col-span-12 justify-self-start text-red-600 text-sm"
            onClick={() => remove(i)}
          >
            삭제
          </button>
        </div>
      ))}

      <button className="border px-3 py-2 rounded" onClick={add}>
        + 옵션 추가
      </button>
    </div>
  );
}