import { useState, useCallback, useEffect } from 'react';
import type { Criterion, Alternative, CriterionValue, SAWResult } from '../../types';
import { calculateSAW } from '../../lib/saw';
import ResultsView from './ResultsView';
import { toast } from '../ui/Toast';

function NilaiInput({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [local, setLocal] = useState(value);
  useEffect(() => { setLocal(value); }, [value]);
  return (
    <input
      type="number"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => onSave(local)}
      className="brutal-input px-2 py-1.5 text-sm text-center w-full"
      placeholder="0"
    />
  );
}

function ScaleInput({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const current = parseInt(value) || 0;
  return (
    <div className="flex gap-1 justify-center">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onSave(String(n))}
          className={`w-8 h-8 text-sm font-bold border-2 border-[#1A1A1A] transition-colors ${
            current === n
              ? 'bg-[#FF3D00] text-white'
              : 'bg-white text-[#1A1A1A] hover:bg-[#F0F0F0]'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

type Tab = 'faktor' | 'pilihan' | 'nilai' | 'hasil';

interface Props {
  projectId: string;
  initialCriteria: Criterion[];
  initialAlternatives: Alternative[];
  initialValues: CriterionValue[];
}

export default function ProjectEditor({ projectId, initialCriteria, initialAlternatives, initialValues }: Props) {
  const [tab, setTab] = useState<Tab>('faktor');
  const [criteria, setCriteria] = useState<Criterion[]>(initialCriteria);
  const [alternatives, setAlternatives] = useState<Alternative[]>(initialAlternatives);
  const [values, setValues] = useState<CriterionValue[]>(initialValues);
  const [savingId, setSavingId] = useState<string | null>(null);

  const totalWeight = criteria.reduce((s, c) => s + Number(c.weight), 0);
  const weightValid = Math.abs(totalWeight - 1) < 0.001;

  // ── Faktor (Kriteria) ──
  const addCriterion = () => {
    const draft: Criterion = {
      id: `draft-${Date.now()}`,
      projectId,
      name: '',
      weight: 0,
      type: 'benefit',
      input_type: 'number',
      position: criteria.length,
    };
    setCriteria((prev) => [...prev, draft]);
  };

  const updateCriterion = (id: string, field: keyof Criterion, val: any) => {
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: val } : c)));
  };

  const saveCriterion = async (c: Criterion) => {
    if (!c.name.trim()) return;
    setSavingId(c.id);
    const res = await fetch(`/api/projects/${projectId}/criteria`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...c, id: c.id.startsWith('draft-') ? undefined : c.id }),
    });
    if (res.ok) {
      const { id } = await res.json();
      setCriteria((prev) => prev.map((x) => (x.id === c.id ? { ...x, id } : x)));
      toast('Faktor disimpan');
    } else {
      toast('Gagal menyimpan faktor', 'error');
    }
    setSavingId(null);
  };

  const removeCriterion = async (c: Criterion) => {
    if (!c.id.startsWith('draft-')) {
      const res = await fetch(`/api/projects/${projectId}/criteria`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criterionId: c.id }),
      });
      if (!res.ok) { toast('Gagal menghapus faktor', 'error'); return; }
      setValues((prev) => prev.filter((v) => v.criterionId !== c.id));
    }
    setCriteria((prev) => prev.filter((x) => x.id !== c.id));
    toast('Faktor dihapus', 'info');
  };

  // ── Pilihan (Alternatif) ──
  const addAlternative = () => {
    const draft: Alternative = {
      id: `draft-${Date.now()}`,
      projectId,
      name: '',
      position: alternatives.length,
    };
    setAlternatives((prev) => [...prev, draft]);
  };

  const updateAlternative = (id: string, val: string) => {
    setAlternatives((prev) => prev.map((a) => (a.id === id ? { ...a, name: val } : a)));
  };

  const saveAlternative = async (a: Alternative) => {
    if (!a.name.trim()) return;
    setSavingId(a.id);
    const res = await fetch(`/api/projects/${projectId}/alternatives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...a, id: a.id.startsWith('draft-') ? undefined : a.id }),
    });
    if (res.ok) {
      const { id } = await res.json();
      setAlternatives((prev) => prev.map((x) => (x.id === a.id ? { ...x, id } : x)));
      toast('Pilihan disimpan');
    } else {
      toast('Gagal menyimpan pilihan', 'error');
    }
    setSavingId(null);
  };

  const removeAlternative = async (a: Alternative) => {
    if (!a.id.startsWith('draft-')) {
      const res = await fetch(`/api/projects/${projectId}/alternatives`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alternativeId: a.id }),
      });
      if (!res.ok) { toast('Gagal menghapus pilihan', 'error'); return; }
      setValues((prev) => prev.filter((v) => v.alternativeId !== a.id));
    }
    setAlternatives((prev) => prev.filter((x) => x.id !== a.id));
    toast('Pilihan dihapus', 'info');
  };

  // ── Nilai ──
  const getValue = (altId: string, critId: string): string => {
    const found = values.find((v) => v.alternativeId === altId && v.criterionId === critId);
    return found !== undefined ? String(found.value) : '';
  };

  const handleValueChange = useCallback(
    async (altId: string, critId: string, raw: string) => {
      const num = parseFloat(raw);
      if (isNaN(num)) return;

      setValues((prev) => {
        const existing = prev.findIndex((v) => v.alternativeId === altId && v.criterionId === critId);
        const updated = { id: '', alternativeId: altId, criterionId: critId, value: num };
        if (existing >= 0) {
          const next = [...prev];
          next[existing] = { ...next[existing], value: num };
          return next;
        }
        return [...prev, updated];
      });

      const res = await fetch(`/api/projects/${projectId}/values`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alternativeId: altId, criterionId: critId, value: num }),
      });
      if (!res.ok) toast('Gagal menyimpan nilai', 'error');
    },
    [projectId]
  );

  // ── Hasil ──
  const savedCriteria = criteria.filter((c) => !c.id.startsWith('draft-'));
  const savedAlternatives = alternatives.filter((a) => !a.id.startsWith('draft-'));
  const results: SAWResult[] = tab === 'hasil'
    ? calculateSAW(savedCriteria, savedAlternatives, values)
    : [];

  const hasCriteria = savedCriteria.length > 0;
  const hasAlternatives = savedAlternatives.length > 0;
  const canViewHasil = hasCriteria && hasAlternatives && weightValid;

  const tabs: { key: Tab; label: string; badge?: string }[] = [
    { key: 'faktor', label: 'Faktor', badge: hasCriteria ? `${savedCriteria.length}` : undefined },
    { key: 'pilihan', label: 'Pilihan', badge: hasAlternatives ? `${savedAlternatives.length}` : undefined },
    { key: 'nilai', label: 'Nilai' },
    { key: 'hasil', label: 'Hasil' },
  ];

  const handleTabClick = (key: Tab) => {
    if (key === 'hasil' && !canViewHasil) {
      if (!hasCriteria) toast('Tambahkan faktor dulu ya!', 'error');
      else if (!weightValid) toast('Total kepentingan harus pas di 1.00', 'error');
      else if (!hasAlternatives) toast('Tambahkan pilihan dulu ya!', 'error');
      return;
    }
    setTab(key);
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex border-2 border-[#1A1A1A] bg-white mb-8 w-fit max-w-full overflow-x-auto">
        {tabs.map((t, i) => {
          const locked = t.key === 'hasil' && !canViewHasil;
          return (
            <button
              key={t.key}
              onClick={() => handleTabClick(t.key)}
              title={locked ? 'Lengkapi faktor, kepentingan=1.00, dan pilihan dulu' : undefined}
              className={`relative px-6 py-3 font-bold text-sm transition-colors ${i > 0 ? 'border-l-2 border-[#1A1A1A]' : ''} ${
                tab === t.key
                  ? 'bg-[#FF3D00] text-white'
                  : locked
                  ? 'bg-white text-[#333333] opacity-50 cursor-not-allowed'
                  : 'bg-white text-[#1A1A1A] hover:bg-[#F0F0F0]'
              }`}
            >
              {t.label}
              {t.badge && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 font-bold border border-current ${tab === t.key ? 'border-white/60' : 'border-[#1A1A1A]'}`}>
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab: Faktor ── */}
      {tab === 'faktor' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-[#333333]">
                Total kepentingan:{' '}
                <span className={`font-bold ${weightValid ? 'text-green-600' : 'text-[#FF3D00]'}`}>
                  {totalWeight.toFixed(2)}
                </span>
                {' '}/ 1.00
              </p>
              {!weightValid && criteria.length > 0 && (
                <p className="text-xs text-[#FF3D00] mt-1">Pastikan total kepentingan pas di 1.00</p>
              )}
            </div>
            <button onClick={addCriterion} className="brutal-btn px-4 py-2 bg-[#1A1A1A] text-white text-sm font-bold">
              + Tambah Faktor
            </button>
          </div>

          {criteria.length === 0 ? (
            <div className="brutal-card p-10 text-center flex flex-col items-center gap-4">
              <span className="text-4xl">⚖️</span>
              <div>
                <p className="font-bold text-lg mb-1">Apa yang penting buat kamu?</p>
                <p className="text-[#333333] text-sm max-w-sm mx-auto">
                  Faktor adalah kriteria yang kamu pakai buat menilai pilihan — misalnya Harga, Jarak, Rating, atau apapun yang relevan buat kamu.
                </p>
              </div>
              <div className="flex flex-col gap-2 text-sm text-left bg-[#F0F0F0] border-2 border-[#1A1A1A] p-4 w-full max-w-sm">
                <p className="font-bold text-xs uppercase tracking-widest text-[#333333] mb-1">Tips</p>
                <p>• <strong>Seberapa penting?</strong> — bobot 0.00–1.00, total harus pas di 1.00</p>
                <p>• <strong>Arah nilai</strong> — "makin besar makin baik" (Rating) atau "makin kecil makin baik" (Harga)</p>
                <p>• <strong>Cara nilai</strong> — angka bebas atau skala 1–5 kalau susah dikuantifikasi</p>
              </div>
              <button onClick={addCriterion} className="brutal-btn px-6 py-2.5 bg-[#FF3D00] text-white font-bold">
                + Tambah Faktor Pertama
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {criteria.map((c) => (
                <div key={c.id} className={`brutal-card p-4 flex flex-wrap gap-3 items-end transition-opacity ${savingId === c.id ? 'opacity-60' : ''}`}>
                  <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                    <label className="text-xs font-bold text-[#1A1A1A]">Nama Faktor</label>
                    <input
                      value={c.name}
                      onChange={(e) => updateCriterion(c.id, 'name', e.target.value)}
                      onBlur={() => saveCriterion(c)}
                      placeholder="cth: Harga, Jarak, Rating..."
                      className="brutal-input px-3 py-2 text-sm w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-28">
                    <label className="text-xs font-bold text-[#1A1A1A]">Seberapa penting?</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={c.weight}
                      onChange={(e) => updateCriterion(c.id, 'weight', parseFloat(e.target.value) || 0)}
                      onBlur={() => saveCriterion(c)}
                      placeholder="0.00 – 1.00"
                      className="brutal-input px-3 py-2 text-sm w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-44">
                    <label className="text-xs font-bold text-[#1A1A1A]">Arah nilai</label>
                    <select
                      value={c.type}
                      onChange={(e) => { updateCriterion(c.id, 'type', e.target.value); saveCriterion({ ...c, type: e.target.value as 'benefit' | 'cost' }); }}
                      className="brutal-input px-3 py-2 text-sm w-full"
                    >
                      <option value="benefit">↑ Makin besar makin baik</option>
                      <option value="cost">↓ Makin kecil makin baik</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 w-36">
                    <label className="text-xs font-bold text-[#1A1A1A]">Cara nilai</label>
                    <select
                      value={c.input_type ?? 'number'}
                      onChange={(e) => { updateCriterion(c.id, 'input_type', e.target.value); saveCriterion({ ...c, input_type: e.target.value as 'number' | 'scale5' }); }}
                      className="brutal-input px-3 py-2 text-sm w-full"
                    >
                      <option value="number">Angka bebas</option>
                      <option value="scale5">Skala 1–5</option>
                    </select>
                  </div>
                  <button
                    onClick={() => removeCriterion(c)}
                    className="brutal-btn px-3 py-2 bg-white text-red-600 border-red-600 text-sm font-bold"
                    style={{ boxShadow: '3px 3px 0px #dc2626' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Pilihan ── */}
      {tab === 'pilihan' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={addAlternative} className="brutal-btn px-4 py-2 bg-[#1A1A1A] text-white text-sm font-bold">
              + Tambah Pilihan
            </button>
          </div>

          {alternatives.length === 0 ? (
            <div className="brutal-card p-10 text-center flex flex-col items-center gap-4">
              <span className="text-4xl">🗂️</span>
              <div>
                <p className="font-bold text-lg mb-1">Apa aja pilihannya?</p>
                <p className="text-[#333333] text-sm max-w-sm mx-auto">
                  Masukin semua kandidat yang lagi kamu pertimbangin — laptop, kos, tempat makan, apapun. Minimal 2 pilihan biar bisa dibanding-bandingin.
                </p>
              </div>
              <button onClick={addAlternative} className="brutal-btn px-6 py-2.5 bg-[#FF3D00] text-white font-bold">
                + Tambah Pilihan Pertama
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {alternatives.map((a, i) => (
                <div key={a.id} className={`brutal-card p-4 flex gap-3 items-center transition-opacity ${savingId === a.id ? 'opacity-60' : ''}`}>
                  <span className="font-bold text-[#FF3D00] w-8 text-center">{i + 1}</span>
                  <input
                    value={a.name}
                    onChange={(e) => updateAlternative(a.id, e.target.value)}
                    onBlur={() => saveAlternative(a)}
                    placeholder="cth: Laptop A, Kos B, Opsi C..."
                    className="brutal-input px-3 py-2 text-sm flex-1"
                  />
                  <button
                    onClick={() => removeAlternative(a)}
                    className="brutal-btn px-3 py-2 bg-white text-red-600 border-red-600 text-sm font-bold"
                    style={{ boxShadow: '3px 3px 0px #dc2626' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Nilai ── */}
      {tab === 'nilai' && (
        <div>
          {savedCriteria.length === 0 || savedAlternatives.length === 0 ? (
            <div className="brutal-card p-10 text-center flex flex-col items-center gap-4">
              <span className="text-4xl">✏️</span>
              <div>
                <p className="font-bold text-lg mb-1">Hampir sampai!</p>
                <p className="text-[#333333] text-sm max-w-sm mx-auto">
                  Sebelum bisa ngasih nilai, lengkapin dulu tab berikut:
                </p>
              </div>
              <div className="flex gap-3 flex-wrap justify-center">
                {savedCriteria.length === 0 && (
                  <button
                    onClick={() => setTab('faktor')}
                    className="brutal-btn px-5 py-2 bg-[#1A1A1A] text-white font-bold text-sm"
                  >
                    → Isi Faktor dulu
                  </button>
                )}
                {savedAlternatives.length === 0 && (
                  <button
                    onClick={() => setTab('pilihan')}
                    className="brutal-btn px-5 py-2 bg-[#1A1A1A] text-white font-bold text-sm"
                  >
                    → Isi Pilihan dulu
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-2 border-[#1A1A1A] bg-white">
                <thead>
                  <tr>
                    <th className="border-2 border-[#1A1A1A] px-4 py-3 text-left text-sm font-bold bg-[#1A1A1A] text-white">
                      Pilihan
                    </th>
                    {savedCriteria.map((c) => (
                      <th key={c.id} className="border-2 border-[#1A1A1A] px-4 py-3 text-center text-sm font-bold bg-[#F0F0F0]">
                        <div>{c.name}</div>
                        <div className="text-xs font-normal text-[#333333]">
                          {c.type === 'benefit' ? '↑ makin besar' : '↓ makin kecil'} · {c.weight}
                        </div>
                        {c.input_type === 'scale5' && (
                          <div className="text-xs font-normal text-[#FF3D00] mt-0.5">skala 1–5</div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {savedAlternatives.map((a) => (
                    <tr key={a.id}>
                      <td className="border-2 border-[#1A1A1A] px-4 py-3 font-bold text-sm">{a.name}</td>
                      {savedCriteria.map((c) => (
                        <td key={c.id} className="border-2 border-[#1A1A1A] px-2 py-2">
                          {c.input_type === 'scale5' ? (
                            <ScaleInput
                              value={getValue(a.id, c.id)}
                              onSave={(val) => handleValueChange(a.id, c.id, val)}
                            />
                          ) : (
                            <NilaiInput
                              value={getValue(a.id, c.id)}
                              onSave={(val) => handleValueChange(a.id, c.id, val)}
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-[#333333] mt-3">Klik di luar kotak untuk menyimpan.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Hasil ── */}
      {tab === 'hasil' && (
        <ResultsView
          results={results}
          criteria={savedCriteria}
          alternatives={savedAlternatives}
          weightValid={weightValid}
        />
      )}
    </div>
  );
}
