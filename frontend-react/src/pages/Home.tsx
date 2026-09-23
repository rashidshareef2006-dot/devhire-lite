import { Link } from 'react-router-dom';
import { JobCard } from '@/components/jobs/JobCard';
import { mockJobs } from '@/data/mockJobs';

const features = [
  { icon: '📝', title: 'Post a Job', desc: 'Get started with a job post. Reach 20.1M unique monthly users.' },
  { icon: '🔍', title: 'Find Quality Applicants', desc: 'Customise your post with screening tools to narrow down candidates.' },
  { icon: '💬', title: 'Make Connections', desc: 'Track, message, invite and interview directly on DevHire Lite.' },
  { icon: '✅', title: 'Hire Confidently', desc: 'Helpful resources for every step of the hiring process.' },
];

export function Home() {
  return (
    <>
      <section className="bg-indeed-light">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-indeed-ink leading-tight">
              Let's hire your next <span className="text-indeed-blue">great developer</span>. Fast.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed">
              No matter the skills, experience or qualifications you're looking for, you'll find the right people here.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn-primary text-center">
                Post a Job — It's Free
              </Link>
              <Link to="/jobs" className="btn-outline text-center">
                Browse Jobs
              </Link>
            </div>

            <p className="mt-6 text-sm text-slate-500">
              ✅ 20.1M+ monthly users &nbsp;·&nbsp; ✅ 250M+ resumes
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-indeed-ink">
              Manage your hiring from start to finish
            </h2>
            <p className="mt-4 text-slate-600">
              Everything you need to find, attract, and hire the best developers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl border border-slate-200 bg-white hover:border-indeed-blue hover:shadow-lg transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-indeed-blue/10 flex items-center justify-center text-2xl mb-5 group-hover:bg-indeed-blue/20 transition">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-indeed-ink mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-indeed-light py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-indeed-ink">Featured Jobs</h2>
              <p className="text-slate-600 mt-1">Latest openings from top companies</p>
            </div>
            <Link to="/jobs" className="hidden sm:inline text-sm font-semibold text-indeed-blue hover:underline">
              View all →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockJobs.slice(0, 6).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-indeed-blue py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to find your next great developer?
          </h2>
          <p className="mt-4 text-indigo-100 text-lg">
            Join thousands of companies already hiring on DevHire Lite.
          </p>
          <Link
            to="/register"
            className="inline-block mt-8 px-8 py-4 bg-white text-indeed-blue font-bold rounded-xl hover:bg-indigo-50 transition"
          >
            Get Started for Free
          </Link>
        </div>
      </section>
    </>
  );
}