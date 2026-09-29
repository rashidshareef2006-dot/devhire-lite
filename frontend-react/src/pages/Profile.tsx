import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Globe,
  Linkedin,
  Github,
  FileText,
  Pencil,
  Camera,
  Save,
  X,
  Plus,
  Briefcase,
  Loader2,
  User as UserIcon,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useToast } from '@/contexts/ToastContext';
import { usersService } from '@/services/users.service';
import type { User } from '@/types';

// ... baaki file bilkul same

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(
  /\/api\/?$/,
  '',
);

function resolveAvatar(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_ORIGIN}${url}`;
}

/** Compress an image file via canvas → JPEG blob (max 512px, q=0.85) */
async function compressImage(file: File, maxSize = 512, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('File read failed'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image'));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
          'image/jpeg',
          quality,
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export function Profile() {
  const { user, updateUser } = useAuthStore();
  const { toast } = useToast();

  const [profile, setProfile] = useState<User | null>(user);
  const [draft, setDraft] = useState<User | null>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch fresh profile on mount
  useEffect(() => {
    usersService
      .getProfile()
      .then((u) => {
        setProfile(u);
        setDraft(u);
        updateUser(u);
      })
      .catch(() => toast('Failed to load profile', 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const avatarSrc = useMemo(() => resolveAvatar(profile?.avatar), [profile?.avatar]);
  const initial = (profile?.name || 'U').charAt(0).toUpperCase();

  /* ─────────────  EDIT ACTIONS  ───────────── */

  const startEdit = () => {
    setDraft(profile);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(profile);
    setIsEditing(false);
    setSkillInput('');
  };

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const updated = await usersService.updateProfile({
        name: draft.name,
        phone: draft.phone ?? '',
        bio: draft.bio ?? '',
        location: draft.location ?? '',
        headline: draft.headline ?? '',
        company: draft.company ?? '',
        skills: draft.skills ?? [],
        website: draft.website ?? '',
        linkedin: draft.linkedin ?? '',
        github: draft.github ?? '',
        resumeUrl: draft.resumeUrl ?? '',
      });
      setProfile(updated);
      setDraft(updated);
      updateUser(updated);
      setIsEditing(false);
      toast('Profile updated', 'success');
    } catch (err: any) {
      toast(err?.response?.data?.error?.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking same file
    if (!file) return;

    if (file.size > MAX_AVATAR_BYTES) {
      toast('Image must be under 2MB', 'error');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast('Please select an image file', 'error');
      return;
    }

    setUploadingAvatar(true);
    try {
      const blob = await compressImage(file);
      const compressed = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      const updated = await usersService.uploadAvatar(compressed);
      setProfile(updated);
      setDraft(updated);
      updateUser(updated);
      toast('Profile photo updated', 'success');
    } catch (err: any) {
      toast(err?.response?.data?.error?.message || 'Upload failed', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const addSkill = () => {
    if (!draft) return;
    const s = skillInput.trim();
    if (!s) return;
    if ((draft.skills?.length ?? 0) >= 30) return toast('Max 30 skills', 'warning');
    if (draft.skills?.includes(s)) return setSkillInput('');
    setDraft({ ...draft, skills: [...(draft.skills ?? []), s] });
    setSkillInput('');
  };

  const removeSkill = (s: string) => {
    if (!draft) return;
    setDraft({ ...draft, skills: (draft.skills ?? []).filter((x) => x !== s) });
  };

  /* ─────────────  LOADING  ───────────── */

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="skeleton h-48 rounded-2xl mb-6" />
        <div className="skeleton h-32 rounded-2xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-500">Profile not found.</p>
      </div>
    );
  }

  const data = isEditing ? draft! : profile;

  /* ─────────────  RENDER  ───────────── */

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
      >
        {/* ── Cover / Avatar ── */}
        <div className="relative h-32 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500" />

        <div className="px-6 sm:px-8 pb-8 -mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full ring-4 ring-white dark:ring-slate-900 bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl font-bold text-slate-500 dark:text-slate-300">
                    {initial}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-indeed-blue hover:bg-indeed-hover text-white flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-slate-900 transition disabled:opacity-60"
                title="Change photo"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={handleAvatarChange}
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={cancelEdit}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indeed-blue hover:bg-indeed-hover text-white text-sm font-semibold transition disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save
                  </button>
                </>
              ) : (
                <button
                  onClick={startEdit}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indeed-blue hover:bg-indeed-hover text-white text-sm font-semibold transition"
                >
                  <Pencil className="w-4 h-4" /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* ── Name + Role ── */}
          <div className="mt-5">
            {isEditing ? (
              <input
                value={data.name}
                onChange={(e) => setDraft({ ...draft!, name: e.target.value })}
                className="text-2xl sm:text-3xl font-bold bg-transparent border-b-2 border-indeed-blue outline-none text-slate-900 dark:text-white w-full max-w-md"
              />
            ) : (
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {data.name}
              </h1>
            )}

            <div className="mt-1 flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-indeed-blue dark:text-indigo-400 font-semibold text-xs">
                {data.role === 'RECRUITER'
                  ? '🏢 Recruiter'
                  : data.role === 'ADMIN'
                  ? '🛡️ Admin'
                  : '👤 Candidate'}
              </span>
              {data.email && (
                <span className="text-slate-500 dark:text-slate-400 truncate">
                  {data.email}
                </span>
              )}
            </div>

            {/* Headline */}
            <div className="mt-4">
              {isEditing ? (
                <input
                  value={data.headline ?? ''}
                  onChange={(e) => setDraft({ ...draft!, headline: e.target.value })}
                  placeholder="Full Stack Developer @ XYZ"
                  maxLength={120}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indeed-blue outline-none"
                />
              ) : data.headline ? (
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  {data.headline}
                </p>
              ) : isEditing ? null : (
                <p className="text-slate-400 dark:text-slate-500 text-sm italic">
                  No headline yet
                </p>
              )}
            </div>
          </div>

          {/* ── Info Row ── */}
          <div className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
            <InfoField
              icon={<MapPin className="w-4 h-4" />}
              label="Location"
              value={data.location}
              editing={isEditing}
              onChange={(v) => setDraft({ ...draft!, location: v })}
              placeholder="City, Country"
            />
            <InfoField
              icon={<Phone className="w-4 h-4" />}
              label="Phone"
              value={data.phone}
              editing={isEditing}
              onChange={(v) => setDraft({ ...draft!, phone: v })}
              placeholder="+91 98765 43210"
            />
            <InfoField
              icon={<Briefcase className="w-4 h-4" />}
              label="Company"
              value={data.company}
              editing={isEditing}
              onChange={(v) => setDraft({ ...draft!, company: v })}
              placeholder="Where you work"
            />
            <InfoField
              icon={<UserIcon className="w-4 h-4" />}
              label="Email"
              value={data.email}
              editing={false}
              onChange={() => {}}
            />
          </div>

          {/* ── Bio ── */}
          <Section title="About">
            {isEditing ? (
              <textarea
                value={data.bio ?? ''}
                onChange={(e) => setDraft({ ...draft!, bio: e.target.value })}
                placeholder="Tell recruiters about yourself…"
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indeed-blue outline-none resize-none"
              />
            ) : data.bio ? (
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {data.bio}
              </p>
            ) : (
              <p className="text-slate-400 dark:text-slate-500 text-sm italic">
                No bio yet
              </p>
            )}
          </Section>

          {/* ── Skills ── */}
          <Section title="Skills">
            <div className="flex flex-wrap gap-2">
              {(data.skills ?? []).map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold"
                >
                  {s}
                  {isEditing && (
                    <button
                      onClick={() => removeSkill(s)}
                      className="hover:text-red-600 transition"
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
              {!isEditing && (data.skills ?? []).length === 0 && (
                <p className="text-slate-400 dark:text-slate-500 text-sm italic">
                  No skills added
                </p>
              )}
            </div>

            {isEditing && (
              <div className="mt-3 flex gap-2 max-w-sm">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="e.g. React, Node.js (Enter to add)"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indeed-blue outline-none"
                />
                <button
                  onClick={addSkill}
                  type="button"
                  className="px-3 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </Section>

          {/* ── Links ── */}
          <Section title="Links">
            <div className="grid sm:grid-cols-2 gap-3">
              <LinkField
                icon={<Globe className="w-4 h-4" />}
                label="Website"
                value={data.website}
                editing={isEditing}
                onChange={(v) => setDraft({ ...draft!, website: v })}
                placeholder="https://yoursite.com"
              />
              <LinkField
                icon={<Linkedin className="w-4 h-4" />}
                label="LinkedIn"
                value={data.linkedin}
                editing={isEditing}
                onChange={(v) => setDraft({ ...draft!, linkedin: v })}
                placeholder="https://linkedin.com/in/you"
              />
              <LinkField
                icon={<Github className="w-4 h-4" />}
                label="GitHub"
                value={data.github}
                editing={isEditing}
                onChange={(v) => setDraft({ ...draft!, github: v })}
                placeholder="https://github.com/you"
              />
              <LinkField
                icon={<FileText className="w-4 h-4" />}
                label="Resume URL"
                value={data.resumeUrl}
                editing={isEditing}
                onChange={(v) => setDraft({ ...draft!, resumeUrl: v })}
                placeholder="https://drive.google.com/…"
              />
            </div>
          </Section>
        </div>
      </motion.div>
    </div>
  );
}

/* ════════════════  Helpers  ════════════════ */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}

function InfoField({
  icon,
  label,
  value,
  editing,
  onChange,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  editing: boolean;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  if (editing) {
    return (
      <label className="block">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
          {label}
        </span>
        <input
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indeed-blue outline-none"
        />
      </label>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-slate-400 dark:text-slate-500">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-slate-800 dark:text-slate-200 truncate">
          {value || <span className="italic text-slate-400">Not set</span>}
        </p>
      </div>
    </div>
  );
}

function LinkField({
  icon,
  label,
  value,
  editing,
  onChange,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  editing: boolean;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  if (editing) {
    return (
      <label className="block">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
          {icon} {label}
        </span>
        <input
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indeed-blue outline-none"
        />
      </label>
    );
  }

  if (!value) return null;

  const href = value.startsWith('http') ? value : `https://${value}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indeed-blue hover:text-white dark:hover:bg-indigo-600 transition text-sm font-medium"
    >
      {icon}
      <span className="truncate">{label}</span>
    </a>
  );
}