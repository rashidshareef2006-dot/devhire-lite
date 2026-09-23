// Jobs page — filter, sort, paginate

const allJobs = [
  { id: 1, title: 'Frontend Developer',   company: 'TechNova',    location: 'Remote',    type: 'Full-time', salary: '₹8–12 LPA',  salaryNum: 10, tags: ['React', 'TypeScript'], posted: '2d ago' },
  { id: 2, title: 'Backend Engineer',     company: 'DataFlow',    location: 'Bangalore', type: 'Full-time', salary: '₹10–16 LPA', salaryNum: 13, tags: ['Node.js', 'PostgreSQL'], posted: '1d ago' },
  { id: 3, title: 'Full Stack Developer', company: 'CloudNine',   location: 'Hyderabad', type: 'Hybrid',    salary: '₹9–14 LPA',  salaryNum: 11, tags: ['React', 'Node.js'], posted: '5h ago' },
  { id: 4, title: 'React Native Dev',     company: 'AppWorks',    location: 'Remote',    type: 'Contract',  salary: '₹6–10 LPA',  salaryNum: 8,  tags: ['React Native', 'TypeScript'], posted: '3d ago' },
  { id: 5, title: 'DevOps Engineer',      company: 'InfraLab',    location: 'Pune',      type: 'Full-time', salary: '₹12–18 LPA', salaryNum: 15, tags: ['AWS', 'Docker'], posted: '1d ago' },
  { id: 6, title: 'UI Engineer',          company: 'PixelCraft',  location: 'Remote',    type: 'Full-time', salary: '₹7–11 LPA',  salaryNum: 9,  tags: ['CSS', 'Tailwind'], posted: '4h ago' },
  { id: 7, title: 'Node.js Developer',    company: 'ServerStack', location: 'Bangalore', type: 'Full-time', salary: '₹9–13 LPA',  salaryNum: 11, tags: ['Express', 'Redis'], posted: '6h ago' },
  { id: 8, title: 'Junior React Dev',     company: 'StartupHub',  location: 'Remote',    type: 'Part-time', salary: '₹4–6 LPA',   salaryNum: 5,  tags: ['React', 'JS'], posted: '1w ago' },
  { id: 9, title: 'Senior Backend Dev',   company: 'ScaleUp',     location: 'Hyderabad', type: 'Full-time', salary: '₹18–25 LPA', salaryNum: 21, tags: ['Node', 'Postgres', 'AWS'], posted: '2d ago' },
  { id: 10, title: 'Frontend Intern',     company: 'LearnLabs',   location: 'Pune',      type: 'Part-time', salary: '₹2–3 LPA',   salaryNum: 2,  tags: ['HTML', 'CSS'], posted: '3h ago' },
];

const PER_PAGE = 5;
let state = {
  search: '',
  types: [],
  locations: [],
  sort: 'recent',
  page: 1,
};

const jobList    = document.getElementById('jobList');
const emptyState = document.getElementById('emptyState');
const pagination = document.getElementById('pagination');
const shownCount = document.getElementById('shownCount');
const jobCount   = document.getElementById('jobCount');

function getFiltered() {
  let list = [...allJobs];

  if (state.search) {
    const q = state.search.toLowerCase();
    list = list.filter(j =>
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  if (state.types.length)     list = list.filter(j => state.types.includes(j.type));
  if (state.locations.length) list = list.filter(j => state.locations.includes(j.location));

  if (state.sort === 'salary-high') list.sort((a, b) => b.salaryNum - a.salaryNum);
  if (state.sort === 'salary-low')  list.sort((a, b) => a.salaryNum - b.salaryNum);

  return list;
}

function card(job) {
  return `
    <article class="fade-in bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-indigo-300 transition">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="font-semibold text-lg text-slate-900">${job.title}</h3>
          <p class="text-sm text-slate-600 mt-0.5">${job.company} · 📍 ${job.location}</p>
        </div>
        <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 whitespace-nowrap">
          ${job.type}
        </span>
      </div>

      <ul class="flex flex-wrap gap-2 mt-4">
        ${job.tags.map(t => `<li class="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-700">${t}</li>`).join('')}
      </ul>

      <div class="flex items-center justify-between mt-5 text-sm">
        <span class="text-slate-500">Posted ${job.posted}</span>
        <span class="font-semibold text-slate-800">${job.salary}</span>
      </div>

      <a href="job-detail.html?id=${job.id}"
         class="mt-5 block text-center px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">
        View Details
      </a>
    </article>
  `;
}

function renderPagination(totalPages) {
  pagination.innerHTML = '';
  if (totalPages <= 1) return;

  const btn = (label, page, disabled = false, active = false) => `
    <button data-page="${page}"
      ${disabled ? 'disabled' : ''}
      class="px-4 py-2 text-sm rounded-lg border transition
        ${active
          ? 'bg-indigo-600 text-white border-indigo-600'
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}">
      ${label}
    </button>
  `;

  let html = btn('←', state.page - 1, state.page === 1);
  for (let i = 1; i <= totalPages; i++) html += btn(i, i, false, i === state.page);
  html += btn('→', state.page + 1, state.page === totalPages);
  pagination.innerHTML = html;

  pagination.querySelectorAll('button[data-page]').forEach(b => {
    b.addEventListener('click', () => {
      const p = Number(b.dataset.page);
      if (p >= 1 && p <= totalPages) {
        state.page = p;
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

function render() {
  const filtered = getFiltered();
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const start = (state.page - 1) * PER_PAGE;
  const pageItems = filtered.slice(start, start + PER_PAGE);

  jobList.innerHTML = pageItems.map(card).join('');
  shownCount.textContent = pageItems.length;
  jobCount.textContent = filtered.length;

  emptyState.classList.toggle('hidden', pageItems.length > 0);
  jobList.classList.toggle('hidden', pageItems.length === 0);

  renderPagination(totalPages);
}

// ---------- Event listeners ----------
document.getElementById('searchForm').addEventListener('submit', e => {
  e.preventDefault();
  state.search = document.getElementById('searchInput').value.trim();
  state.page = 1;
  render();
});

document.querySelectorAll('.filter-type').forEach(cb => {
  cb.addEventListener('change', () => {
    state.types = [...document.querySelectorAll('.filter-type:checked')].map(c => c.value);
    state.page = 1;
    render();
  });
});

document.querySelectorAll('.filter-location').forEach(cb => {
  cb.addEventListener('change', () => {
    state.locations = [...document.querySelectorAll('.filter-location:checked')].map(c => c.value);
    state.page = 1;
    render();
  });
});

document.getElementById('sortBy').addEventListener('change', e => {
  state.sort = e.target.value;
  render();
});

document.getElementById('clearFilters').addEventListener('click', () => {
  document.querySelectorAll('.filter-type, .filter-location').forEach(cb => (cb.checked = false));
  document.getElementById('searchInput').value = '';
  state = { search: '', types: [], locations: [], sort: 'recent', page: 1 };
  render();
});

render();