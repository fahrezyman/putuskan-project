import { useState, useRef, useEffect } from 'react';
import { toast } from '../ui/Toast';
import { confirmModal } from '../ui/ConfirmModal';

function getRelativeTime(date: string | Date): string {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 3600) return 'baru saja';
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return 'kemarin';
  if (days < 7) return `${days} hari lalu`;
  if (days < 30) return `${Math.floor(days / 7)} minggu lalu`;
  if (days < 365) return `${Math.floor(days / 30)} bulan lalu`;
  return `${Math.floor(days / 365)} tahun lalu`;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  conclusion: string | null;
  createdAt: string | Date;
}

interface Props {
  project: Project;
  onDeleted: (id: string) => void;
}

export default function ProjectCard({ project, onDeleted }: Props) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDelete = async () => {
    const ok = await confirmModal({
      title: 'Hapus project?',
      message: `Hapus "${project.name}"? Data akan hilang permanen.`,
      confirmLabel: 'Hapus',
      danger: true,
    });
    if (!ok) return;
    setDeleting(true);
    setOpen(false);

    const res = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' });
    if (res.ok) {
      toast(`"${project.name}" dihapus`, 'info');
      onDeleted(project.id);
    } else {
      toast('Gagal hapus project', 'error');
      setDeleting(false);
    }
  };

  return (
    <div className={`brutal-card p-6 flex flex-col transition-opacity ${deleting ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="brutal-border px-2 py-0.5 text-xs font-bold bg-[#F0F0F0]">SAW</span>

        {/* Three-dot menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.preventDefault(); setOpen((o) => !o); }}
            className="w-7 h-7 flex items-center justify-center font-bold text-[#333333] hover:text-[#1A1A1A] hover:bg-[#F0F0F0] border-2 border-transparent hover:border-[#1A1A1A] transition-colors text-lg leading-none"
            aria-label="Opsi"
          >
            ···
          </button>
          {open && (
            <div className="absolute right-0 top-9 z-20 bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] min-w-[140px]">
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2.5 text-sm font-bold text-left text-red-600 hover:bg-red-50 transition-colors"
              >
                Hapus project
              </button>
            </div>
          )}
        </div>
      </div>

      <a href={`/project/${project.id}`} className="flex-1 block group">
        <h2 className="font-bold text-lg leading-tight mb-2 group-hover:text-[#FF3D00] transition-colors break-words">
          {project.name}
        </h2>
        {project.description && (
          <p className="text-sm text-[#333333] line-clamp-2">{project.description}</p>
        )}
        {project.conclusion && (
          <p className="text-sm text-[#333333] italic line-clamp-2 mt-2 border-l-2 border-[#FF3D00] pl-2">
            {project.conclusion}
          </p>
        )}
      </a>

      <div className="mt-4 pt-3 border-t-2 border-[#F0F0F0] flex items-baseline gap-2">
        <span className="text-xs font-bold text-[#1A1A1A]">{getRelativeTime(project.createdAt)}</span>
        <span className="text-xs text-[#333333]">
          · {new Date(project.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
}
