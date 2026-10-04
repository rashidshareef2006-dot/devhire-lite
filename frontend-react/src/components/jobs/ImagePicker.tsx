import { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import {
  JOB_IMAGE_LIBRARY,
  JOB_IMAGE_CATEGORIES,
  type JobImageOption,
} from '@/lib/jobImages';

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  error?: string;
}

export function ImagePicker({ value, onChange, error }: ImagePickerProps) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = JOB_IMAGE_LIBRARY;
    if (activeCategory !== 'All') {
      list = list.filter((i) => i.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.label.toLowerCase().includes(q) ||
          i.code.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q),
      );
    }
    return list;
  }, [activeCategory, search]);

  const selected = JOB_IMAGE_LIBRARY.find((i) => i.url === value);

  const handleSelect = (img: JobImageOption) => {
    onChange(img.url);
    setOpen(false);
    setSearch('');
    setActiveCategory('All');
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-ink-soft">
        Job Cover Image{' '}
        <span className="text-ink-mute font-normal">(pick one)</span>
      </label>

      {/* Selected preview or picker trigger */}
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-line group">
          <img
            src={value}
            alt={selected?.label ?? 'Selected'}
            className="w-full h-44 sm:h-56 object-cover"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-ink text-[12px] font-semibold hover:bg-white transition shadow-sm"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label="Remove image"
              className="p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {selected && (
            <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold">
              {selected.label}
            </span>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full h-32 sm:h-40 rounded-2xl border-2 border-dashed border-line-strong hover:border-brand hover:bg-brand/5 transition-colors flex flex-col items-center justify-center gap-2 text-ink-mute hover:text-brand"
        >
          <span className="material-symbols-outlined text-[32px]">add_photo_alternate</span>
          <span className="text-[13px] font-semibold">Choose from library</span>
          <span className="text-[11px]">60 curated tech images</span>
        </button>
      )}

      {error && (
        <p className="text-sm text-danger mt-1.5">{error}</p>
      )}

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-surface rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-line">
              <div>
                <h3 className="text-lg font-bold text-ink">Choose Job Image</h3>
                <p className="text-[12px] text-ink-mute">
                  {filtered.length} image{filtered.length !== 1 ? 's' : ''} available
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="p-2 rounded-full text-ink-mute hover:text-ink hover:bg-soft transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 sm:px-5 border-b border-line">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-mute" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by tech (React, Python, Docker...)"
                  className="input-field pl-10 h-10"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="px-4 sm:px-5 py-3 border-b border-line overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 min-w-max">
                {JOB_IMAGE_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setActiveCategory(c)}
                    className={`chip text-[12px] ${
                      activeCategory === c ? 'chip-active' : ''
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="overflow-y-auto p-4 sm:p-5">
              {filtered.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filtered.map((img) => {
                    const isSelected = img.url === value;
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => handleSelect(img)}
                        className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.03] ${
                          isSelected
                            ? 'border-brand shadow-[0_0_0_3px_rgba(249,115,22,0.2)]'
                            : 'border-transparent hover:border-brand/40'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={img.label}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1.5 left-1.5 right-1.5 text-left text-[10px] font-semibold text-white bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-md truncate">
                          {img.label}
                        </span>
                        {isSelected && (
                          <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined text-[14px]">check</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-ink-mute">
                  <p className="text-4xl mb-2">🔍</p>
                  <p className="text-sm">No images match your search</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}