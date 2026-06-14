import { useState } from 'react';
import ProjectCard from './ProjectCard';

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string | Date;
}

interface Props {
  initialProjects: Project[];
}

const STEPS = [
  {
    num: '1',
    title: 'Tentuin faktor',
    desc: 'Apa aja yang penting buat kamu? Harga, jarak, rating — masukin semua dan kasih bobot kepentingannya.',
  },
  {
    num: '2',
    title: 'Masukin pilihan',
    desc: 'Laptop A vs B? Kos ini vs itu? Masukin semua kandidat yang lagi kamu pertimbangin.',
  },
  {
    num: '3',
    title: 'Kasih nilai',
    desc: 'Nilai setiap pilihan berdasarkan faktor-faktor yang udah kamu tentuin. Bisa angka bebas atau skala 1–5.',
  },
  {
    num: '4',
    title: 'Lihat hasilnya',
    desc: 'Data bicara. Kamu dapet ranking lengkap dengan skor dan perbandingan visual — tinggal putuskan!',
  },
];

function EmptyState() {
  return (
    <div className="flex flex-col gap-10">
      {/* Hero */}
      <div className="brutal-card p-10 text-center">
        <p className="text-5xl mb-4">🤔</p>
        <h2 className="text-2xl font-bold mb-2">Lagi bingung mutusin sesuatu?</h2>
        <p className="text-[#333333] mb-8 max-w-md mx-auto">
          Putuskan bantu kamu milih dengan kepala dingin — bukan cuma feeling. Caranya gampang banget, cuma 4 langkah.
        </p>
        <a
          href="/project/new"
          className="brutal-btn px-8 py-3 bg-[#FF3D00] text-white font-bold inline-block text-base"
        >
          Mulai sekarang — gratis
        </a>
      </div>

      {/* Steps */}
      <div>
        <h3 className="text-sm font-bold text-[#333333] uppercase tracking-widest mb-4">Cara pakainya</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s, i) => (
            <div key={s.num} className="brutal-card p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-[#FF3D00] text-white font-bold text-sm flex items-center justify-center border-2 border-[#1A1A1A] flex-shrink-0">
                  {s.num}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="text-[#333333] font-bold hidden lg:block">→</span>
                )}
              </div>
              <p className="font-bold text-[#1A1A1A]">{s.title}</p>
              <p className="text-sm text-[#333333] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProjectList({ initialProjects }: Props) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  const handleDeleted = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  if (projects.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} onDeleted={handleDeleted} />
      ))}
    </div>
  );
}
