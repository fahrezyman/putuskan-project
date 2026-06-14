import { useState, useRef, useEffect } from 'react';
import { toast } from '../ui/Toast';

interface Project {
  id: string;
  name: string;
  description: string | null;
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
    if (!confirm(`Hapus "${project.name}"? Data akan hilang permanen.`)) return;
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
        <p className="text-xs text-[#333333] mt-3">
          {new Date(project.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </a>
    </div>
  );
}
