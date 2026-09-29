import { useEffect, useState } from 'react';
import { Plus, Trash2, Save, Loader2, ClipboardPaste, Sparkles } from 'lucide-react';
import { aboutService } from '@/services/about.service';
import type { AboutProfile, SocialLink } from '@/types';

// ═══════════════════════════════════════════════════════════════
//  PRESET: DevHire Lite project ke saare skills (69 total)
//  Exact duplicates hata diye, same-purpose-different-name rakhe
// ═══════════════════════════════════════════════════════════════
const DEVHIRE_SKILLS: string[] = [
  // ═══ FRONTEND (23) ═══
  'React 19',
  'TypeScript',
  'Vite',
  'Tailwind CSS v4',
  'React Router',
  'Zustand',
  'React Context API',
  'react-hook-form',
  'Zod',
  '@hookform/resolvers',
  'Framer Motion',
  'Recharts',
  'Lucide React',
  'React Hooks',
  'Custom Hooks',
  'useDebounce',
  'useKeyboardShortcut',
  'Canvas API',
  'FileReader API',
  'FormData API',
  'Accessibility (A11y)',
  'Keyboard Navigation',
  'Focus Management',

  // ═══ BACKEND (4) ═══
  'Node.js',
  'Express',
  'Socket.IO',
  'Multer',

  // ═══ DATABASE (5) ═══
  'PostgreSQL',
  'Neon',
  'Prisma',
  'Prisma Client Singleton',
  'Connection Pooling',

  // ═══ AUTH & SECURITY (6) ═══
  'JWT Authentication',
  'bcryptjs',
  'RBAC',
  'Helmet',
  'CORS',
  'express-rate-limit',

  // ═══ API & ARCHITECTURE (13) ═══
  'REST API',
  'MVC Pattern',
  'Service Layer Pattern',
  'Middleware Pattern',
  'Centralized Error Handling',
  'AppError',
  'Pagination',
  'Optimistic UI',
  'Protected Routes',
  'Error Boundaries',
  'Axios Interceptors',
  'Path Aliases',
  'Component Composition',

  // ═══ TESTING (3) ═══
  'Vitest',
  'React Testing Library',
  'Unit Testing',

  // ═══ DEVOPS / CONFIG (4) — npm removed ═══
  'Environment Variables',
  'ESM Modules',
  'Monorepo Structure',
  'Git',

  // ═══ UI / UX (5) ═══
  'Dark Mode',
  'Loading Skeletons',
  'Toast Notifications',
  'Empty States',
  'Responsive Design',

  // ═══ SOFT SKILLS (5) ═══
  'Debugging',
  'Code Review',
  'Performance Optimization',
  'Security Awareness',
  'Clean Code',
];




export function AdminAboutEditor() {
  const [data, setData] = useState<AboutProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [newSkill, setNewSkill] = useState('');
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [newLink, setNewLink] = useState<SocialLink>({
    label: '',
    url: '',
    icon: 'Link',
  });

  useEffect(() => {
    aboutService
      .get()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    setMsg(null);
    try {
      const updated = await aboutService.update({
        name: data.name,
        title: data.title,
        photoUrl: data.photoUrl || null,
        location: data.location,
        email: data.email,
        bio: data.bio,
        skills: data.skills,
        education: data.education,
        educationUrl: data.educationUrl || null,
        socialLinks: data.socialLinks,
        projects: data.projects,
      });
      setData(updated);
      setMsg({ type: 'ok', text: 'Saved successfully!' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      setMsg({
        type: 'err',
        text: err?.response?.data?.error?.message || 'Failed to save',
      });
    } finally {
      setSaving(false);
    }
  };

  // ─── Add single skill ───
  const addSkill = () => {
    const s = newSkill.trim();
    if (!s || !data) return;
    if (data.skills.includes(s)) return;
    setData({ ...data, skills: [...data.skills, s] });
    setNewSkill('');
  };

  const removeSkill = (s: string) => {
    if (!data) return;
    setData({ ...data, skills: data.skills.filter((x) => x !== s) });
  };

  // ─── Bulk add: comma/newline se split, trim, dedupe, add ───
  const handleBulkAdd = (raw: string) => {
    if (!data) return;
    const items = raw
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!items.length) return;

    const existing = new Set(data.skills);
    const toAdd = items.filter((s) => !existing.has(s));
    if (!toAdd.length) {
      setMsg({ type: 'ok', text: 'All skills already added' });
      setTimeout(() => setMsg(null), 2500);
      return;
    }
    setData({ ...data, skills: [...data.skills, ...toAdd] });
    setBulkText('');
    setBulkOpen(false);
    setMsg({ type: 'ok', text: `Added ${toAdd.length} new skill(s)` });
    setTimeout(() => setMsg(null), 2500);
  };

  // ─── Load all preset skills ───
  const loadPresetSkills = () => {
    if (!data) return;
    const existing = new Set(data.skills);
    const toAdd = DEVHIRE_SKILLS.filter((s) => !existing.has(s));
    if (!toAdd.length) {
      setMsg({
        type: 'ok',
        text: `All ${DEVHIRE_SKILLS.length} preset skills already added`,
      });
      setTimeout(() => setMsg(null), 2500);
      return;
    }
    setData({ ...data, skills: [...data.skills, ...toAdd] });
    setMsg({
      type: 'ok',
      text: `Loaded ${toAdd.length} preset skill(s). Click Save to persist.`,
    });
    setTimeout(() => setMsg(null), 3500);
  };

  const addSocialLink = () => {
    if (!data || !newLink.label.trim() || !newLink.url.trim()) return;
    setData({ ...data, socialLinks: [...data.socialLinks, newLink] });
    setNewLink({ label: '', url: '', icon: 'Link' });
  };

  const removeSocialLink = (idx: number) => {
    if (!data) return;
    setData({
      ...data,
      socialLinks: data.socialLinks.filter((_, i) => i !== idx),
    });
  };

  if (loading) {
    return <div className="skeleton h-64" />;
  }
  if (!data) {
    return <p className="text-slate-400">Failed to load about profile</p>;
  }

  const inputCls =
    'w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 text-sm';

  return (
    <div className="space-y-6">
      {msg && (
        <div
          className={`px-4 py-3 rounded-xl text-sm ${
            msg.type === 'ok'
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* ═══ PROFILE PHOTO ═══ */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Profile Photo</h3>
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shrink-0 ring-2 ring-slate-700">
            {data.photoUrl ? (
              <img
                src={data.photoUrl}
                alt={data.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span>{data.name.charAt(0).toUpperCase()}</span>
            )}
          </div>

          <div className="flex-1 w-full">
            <label className="block text-xs text-slate-400 mb-1.5">
              Photo URL (local path ya external link)
            </label>
            <input
              value={data.photoUrl || ''}
              onChange={(e) => setData({ ...data, photoUrl: e.target.value })}
              placeholder="/rashi.jpg  OR  https://i.imgur.com/xxx.jpg"
              className={inputCls}
            />
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              💡 Local file: photo ko{' '}
              <code className="text-blue-400">frontend-react/public/</code> me rakho,
              phir yahan <code className="text-blue-400">/filename.jpg</code> likho.
            </p>

            {data.photoUrl && (
              <button
                onClick={() => setData({ ...data, photoUrl: '' })}
                className="mt-2 text-xs text-red-400 hover:text-red-300 inline-flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Remove photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══ BASIC INFO ═══ */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Basic Info</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Name</label>
            <input
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Title</label>
            <input
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Location</label>
            <input
              value={data.location}
              onChange={(e) => setData({ ...data, location: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Email</label>
            <input
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs text-slate-400 mb-1.5">Bio</label>
          <textarea
            value={data.bio}
            onChange={(e) => setData({ ...data, bio: e.target.value })}
            rows={5}
            className={inputCls + ' resize-y'}
          />
        </div>
      </div>

      {/* ═══ SKILLS ═══ */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-white font-semibold">
            Skills ({data.skills.length})
          </h3>

          <div className="flex gap-2 flex-wrap">
            {/* Preset: load all project skills */}
            <button
              onClick={loadPresetSkills}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 text-xs font-medium transition"
              title={`DevHire Lite ke saare ${DEVHIRE_SKILLS.length} project skills ek saath add karo`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load {DEVHIRE_SKILLS.length} Preset Skills
            </button>

            {/* Bulk paste toggle */}
            <button
              onClick={() => setBulkOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 text-xs font-medium transition"
              title="Ek saath multiple skills paste karo"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              Bulk Paste
            </button>
          </div>
        </div>

        {/* Bulk paste textarea */}
        {bulkOpen && (
          <div className="mb-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <label className="block text-xs text-slate-400 mb-2">
              Skills ko comma <code className="text-blue-400">,</code> ya newline se
              alag karke paste karo:
            </label>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={`React 19, TypeScript, Vite, Tailwind CSS\nNode.js\nExpress\n...`}
              rows={6}
              className={inputCls + ' resize-y font-mono text-xs'}
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleBulkAdd(bulkText)}
                disabled={!bulkText.trim()}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Add All
              </button>
              <button
                onClick={() => {
                  setBulkText('');
                  setBulkOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Skills chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {data.skills.length === 0 && (
            <p className="text-xs text-slate-500 italic">
              No skills added yet. Use "Load {DEVHIRE_SKILLS.length} Preset Skills" or
              add manually.
            </p>
          )}
          {data.skills.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs"
            >
              {s}
              <button
                onClick={() => removeSkill(s)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Single add */}
        <div className="flex gap-2">
          <input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="Add a skill (e.g. GraphQL)"
            className={inputCls}
          />
          <button
            onClick={addSkill}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ═══ EDUCATION ═══ */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Education</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Degree</label>
            <input
              value={data.education}
              onChange={(e) => setData({ ...data, education: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">College URL</label>
            <input
              value={data.educationUrl || ''}
              onChange={(e) => setData({ ...data, educationUrl: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* ═══ SOCIAL LINKS ═══ */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">
          Social Links ({data.socialLinks.length})
        </h3>

        {data.socialLinks.length > 0 && (
          <div className="space-y-2 mb-4">
            {data.socialLinks.map((l, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700"
              >
                <span className="text-sm text-white font-medium min-w-[80px]">
                  {l.label}
                </span>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-400 hover:underline truncate flex-1"
                >
                  {l.url}
                </a>
                <button
                  onClick={() => removeSocialLink(i)}
                  className="text-red-400 hover:text-red-300 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-2">
          <input
            value={newLink.label}
            onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
            placeholder="Label (GitHub)"
            className={inputCls}
          />
          <input
            value={newLink.url}
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            placeholder="https://github.com/..."
            className={inputCls + ' sm:col-span-2'}
          />
        </div>
        <button
          onClick={addSocialLink}
          className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Link
        </button>
      </div>

      {/* ═══ SAVE (sticky) ═══ */}
      <div className="sticky bottom-4 flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}