// ---------- Toast helper ----------
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// ---------- Mobile menu toggle ----------
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('hidden') === false;
    menuBtn.setAttribute('aria-expanded', String(isOpen));
  });
}
// ---------- Mobile menu toggle ----------
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('hidden') === false;
    menuBtn.setAttribute('aria-expanded', String(isOpen));
  });
}

// ---------- Mock jobs data (Phase 2 me API se aayega) ----------
const mockJobs = [
  { id: 1, title: 'Frontend Developer', company: 'TechNova',   location: 'Remote',   type: 'Full-time', salary: '₹8–12 LPA', tags: ['React', 'TS'] },
  { id: 2, title: 'Backend Engineer',   company: 'DataFlow',   location: 'Bangalore', type: 'Full-time', salary: '₹10–16 LPA', tags: ['Node', 'Postgres'] },
  { id: 3, title: 'Full Stack Developer', company: 'CloudNine', location: 'Hyderabad', type: 'Hybrid',    salary: '₹9–14 LPA',  tags: ['React', 'Node'] },
  { id: 4, title: 'React Native Dev',   company: 'AppWorks',   location: 'Remote',   type: 'Contract',  salary: '₹6–10 LPA',  tags: ['RN', 'TS'] },
  { id: 5, title: 'DevOps Engineer',    company: 'InfraLab',   location: 'Pune',     type: 'Full-time', salary: '₹12–18 LPA', tags: ['AWS', 'Docker'] },
  { id: 6, title: 'UI Engineer',        company: 'PixelCraft', location: 'Remote',   type: 'Full-time', salary: '₹7–11 LPA',  tags: ['CSS', 'Tailwind'] },
];

// ---------- Render job cards ----------
function jobCard(job) {
  return `
    <article class="bg-slate-50 border border-slate-200 rounded-2xl p-5
                    hover:shadow-md hover:border-indigo-300 transition">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="font-semibold text-slate-900">${job.title}</h3>
          <p class="text-sm text-slate-600 mt-0.5">${job.company}</p>
        </div>
        <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 whitespace-nowrap">
          ${job.type}
        </span>
      </div>

      <ul class="flex flex-wrap gap-2 mt-4">
        ${job.tags.map(t => `
          <li class="text-xs px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-700">${t}</li>
        `).join('')}
      </ul>

      <div class="flex items-center justify-between mt-5 text-sm">
        <span class="text-slate-500">📍 ${job.location}</span>
        <span class="font-semibold text-slate-800">${job.salary}</span>
      </div>

      <a href="job-detail.html?id=${job.id}"
         class="mt-5 block text-center px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold
                hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500
                focus:ring-offset-2 transition">
        View Details
      </a>
    </article>
  `;
}

const jobList = document.getElementById('jobList');
if (jobList) {
  jobList.innerHTML = mockJobs.map(jobCard).join('');
}