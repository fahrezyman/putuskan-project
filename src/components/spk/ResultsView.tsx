import { useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { SAWResult, Criterion, Alternative } from '../../types';

interface Props {
  projectId: string;
  initialConclusion: string | null;
  results: SAWResult[];
  criteria: Criterion[];
  alternatives: Alternative[];
  weightValid: boolean;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default function ResultsView({ projectId, initialConclusion, results, criteria, alternatives, weightValid }: Props) {
  const [conclusion, setConclusion] = useState(initialConclusion ?? '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveConclusion = async (text: string) => {
    setSaveStatus('saving');
    await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conclusion: text }),
    });
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleConclusionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setConclusion(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveConclusion(text), 800);
  };
  if (criteria.length === 0 || alternatives.length === 0) {
    return (
      <div className="brutal-card p-12 text-center text-[#333333]">
        Isi tab <strong>Faktor</strong>, <strong>Pilihan</strong>, dan <strong>Nilai</strong> dulu ya.
      </div>
    );
  }

  if (!weightValid) {
    return (
      <div className="brutal-card p-12 text-center">
        <p className="text-[#FF3D00] font-bold">Total kepentingan belum pas di 1.00</p>
        <p className="text-[#333333] text-sm mt-2">Atur ulang di tab <strong>Faktor</strong>.</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="brutal-card p-12 text-center text-[#333333]">
        Isi nilai dulu di tab <strong>Nilai</strong>.
      </div>
    );
  }

  const chartData = results.map((r) => ({
    name: r.alternativeName,
    score: r.score,
  }));

  return (
    <div className="flex flex-col gap-8">
      {/* Ranking */}
      <div>
        <h2 className="text-xl font-bold mb-4">Ini dia hasilnya<span className="text-[#FF3D00]">.</span></h2>
        <div className="flex flex-col gap-3">
          {results.map((r) => (
            <div
              key={r.alternativeId}
              className={`brutal-card p-4 flex items-center gap-4 ${r.rank === 1 ? 'brutal-shadow-accent' : ''}`}
            >
              <span className="text-2xl w-10 text-center">{MEDALS[r.rank - 1] ?? `#${r.rank}`}</span>
              <div className="flex-1">
                <p className="font-bold">{r.alternativeName}</p>
                <div className="w-full bg-[#F0F0F0] border border-[#1A1A1A] h-2 mt-2">
                  <div
                    className="h-full bg-[#FF3D00]"
                    style={{ width: `${(r.score / results[0].score) * 100}%` }}
                  />
                </div>
              </div>
              <span className="font-bold text-lg tabular-nums">{r.score.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="brutal-card p-6">
        <h2 className="text-xl font-bold mb-6">Perbandingan skor</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'Space Grotesk', fontWeight: 700 }} />
            <YAxis tick={{ fontSize: 12, fontFamily: 'Space Grotesk' }} domain={[0, 1]} />
            <Tooltip
              formatter={(val) => [typeof val === 'number' ? val.toFixed(2) : val, 'Skor']}
              contentStyle={{ border: '2px solid #1A1A1A', borderRadius: 0, fontFamily: 'Space Grotesk', fontWeight: 700 }}
            />
            <Bar
              dataKey="score"
              radius={0}
              fill="#1A1A1A"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Conclusion */}
      <div className="brutal-card p-6">
        <h2 className="text-xl font-bold mb-1">Apa keputusanmu<span className="text-[#FF3D00]">?</span></h2>
        <p className="text-sm text-[#333333] mb-4">Tulis kesimpulannya di sini — tersimpan otomatis bareng data ini.</p>
        <textarea
          value={conclusion}
          onChange={handleConclusionChange}
          placeholder="Contoh: Akhirnya pilih Laptop A karena skor tertinggi dan budget paling cocok."
          rows={3}
          className="brutal-input w-full px-4 py-3 text-sm resize-none"
        />
        <p className="text-xs text-[#333333] mt-2 h-4">
          {saveStatus === 'saving' && 'Menyimpan...'}
          {saveStatus === 'saved' && '✓ Tersimpan'}
        </p>
      </div>

      {/* Step-by-step — intentionally formal for academic use */}
      <div className="brutal-card p-6">
        <h2 className="text-xl font-bold mb-1">Detail Perhitungan</h2>
        <p className="text-sm text-[#333333] mb-4">Nilai ternormalisasi per kriteria (r<sub>ij</sub>) × bobot (w<sub>j</sub>)</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-2 border-[#1A1A1A] text-sm">
            <thead>
              <tr>
                <th className="border-2 border-[#1A1A1A] px-3 py-2 text-left bg-[#1A1A1A] text-white">Alternatif</th>
                {criteria.map((c) => (
                  <th key={c.id} className="border-2 border-[#1A1A1A] px-3 py-2 text-center bg-[#F0F0F0]">
                    {c.name}<br />
                    <span className="text-xs font-normal">w={c.weight}</span>
                  </th>
                ))}
                <th className="border-2 border-[#1A1A1A] px-3 py-2 text-center bg-[#FF3D00] text-white">Skor</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.alternativeId}>
                  <td className="border-2 border-[#1A1A1A] px-3 py-2 font-bold">{r.alternativeName}</td>
                  {criteria.map((c) => (
                    <td key={c.id} className="border-2 border-[#1A1A1A] px-3 py-2 text-center tabular-nums">
                      {(r.normalizedValues[c.id] ?? 0).toFixed(2)}
                    </td>
                  ))}
                  <td className="border-2 border-[#1A1A1A] px-3 py-2 text-center font-bold tabular-nums text-[#FF3D00]">
                    {r.score.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
