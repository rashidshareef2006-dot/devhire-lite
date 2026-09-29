import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  MapPin,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  GraduationCap,
  Briefcase,
  Code2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { aboutService } from '@/services/about.service';
import type { AboutProfile } from '@/types';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(
  /\/api\/?$/,
  '',
);

function resolvePhoto(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_ORIGIN}${url}`;
}

function SocialIcon({ label }: { label: string }) {
  const l = label.toLowerCase();
  if (l.includes('github')) return <Github className="w-4 h-4" />;
  if (l.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
  if (l.includes('mail') || l.includes('email')) return <Mail className="w-4 h-4" />;
  if (l.includes('web') || l.includes('portfolio')) return <Globe className="w-4 h-4" />;
  return <ExternalLink className="w-4 h-4" />;
}

export function About() {
  const [profile, setProfile] = useState<AboutProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    aboutService
      .get()
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err?.response?.data?.error?.message ||
              err?.message ||
              'Failed to load profile',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indeed-blue animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {error || 'About page not available'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
          This profile hasn't been set up yet.
        </p>
      </div>
    );
  }

  const photoSrc = resolvePhoto(profile.photoUrl);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* HERO */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="shrink-0">
              {photoSrc ? (
                <img
                  src={photoSrc}
                  alt={profile.name}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover ring-4 ring-indeed-blue/20"
                />
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-5xl font-bold ring-4 ring-indeed-blue/20">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                {profile.name}
              </h1>
              <p className="text-indeed-blue dark:text-indigo-400 font-semibold mt-2 text-lg">
                {profile.title}
              </p>

              <div className="mt-4 flex flex-wrap gap-4 justify-center sm:justify-start text-sm text-slate-600 dark:text-slate-400">
                {profile.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </span>
                )}
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex items-center gap-1.5 hover:text-indeed-blue transition"
                  >
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </a>
                )}
              </div>

              {profile.socialLinks?.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2 justify-center sm:justify-start">
                  {profile.socialLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indeed-blue hover:text-white dark:hover:bg-indigo-600 transition text-xs font-semibold"
                    >
                      <SocialIcon label={link.label} />
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* BIO */}
        {profile.bio && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 mt-6 shadow-sm"
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indeed-blue" />
              About Me
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>
          </motion.section>
        )}

        {/* SKILLS */}
        {profile.skills?.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 mt-6 shadow-sm"
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indeed-blue" />
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-sm font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.section>
        )}

        {/* PROJECTS */}
        {profile.projects?.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 mt-6 shadow-sm"
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indeed-blue" />
              Projects
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {profile.projects.map((project, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-indeed-blue dark:hover:border-indigo-500 transition group"
                >
                  <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indeed-blue dark:group-hover:text-indigo-400 transition">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {project.description}
                  </p>

                  {project.techStack && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {project.techStack.map((tech, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {(project.liveUrl || project.repoUrl) && (
                    <div className="flex gap-3 mt-4 text-xs font-semibold">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indeed-blue dark:text-indigo-400 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Live Demo
                        </a>
                      )}
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:underline"
                        >
                          <Github className="w-3.5 h-3.5" />
                          Code
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* EDUCATION */}
        {profile.education && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 mt-6 shadow-sm"
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indeed-blue" />
              Education
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {profile.educationUrl ? (
                <a
                  href={profile.educationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indeed-blue dark:text-indigo-400 hover:underline"
                >
                  {profile.education}
                </a>
              ) : (
                profile.education
              )}
            </p>
          </motion.section>
        )}

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-8 mt-6 text-white text-center shadow-lg"
        >
          <h2 className="text-2xl font-bold">Let's work together</h2>
          <p className="text-indigo-100 mt-2 text-sm">
            Open to opportunities, collaborations, and interesting conversations.
          </p>
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex items-center gap-2 mt-5 px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition"
          >
            <Mail className="w-4 h-4" />
            Get in touch
          </a>
        </motion.section>

      </div>
    </div>
  );
}