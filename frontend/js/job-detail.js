// Job detail page — URL se id leke job render karta hai

const jobsDB = {
  1: {
    title: 'Frontend Developer', company: 'TechNova', location: 'Remote', type: 'Full-time',
    salary: '₹8–12 LPA', posted: '2 days ago', tags: ['React', 'TypeScript', 'Tailwind'],
    description: [
      'We are looking for a passionate Frontend Developer to join our growing team at TechNova. You will build beautiful, performant UIs used by thousands of users.',
      'You will collaborate closely with designers and backend engineers to ship features end-to-end.',
    ],
    requirements: [
      '2+ years experience with React and TypeScript',
      'Strong understanding of HTML5, CSS3, and modern JS (ES6+)',
      'Experience with Tailwind CSS or similar utility frameworks',
      'Familiarity with REST APIs and Axios/Fetch',
      'Bonus: Next.js, testing with Jest',
    ],
  },
  2: {
    title: 'Backend Engineer', company: 'DataFlow', location: 'Bangalore', type: 'Full-time',
    salary: '₹10–16 LPA', posted: '1 day ago', tags: ['Node.js', 'PostgreSQL', 'Redis'],
    description: [
      'DataFlow is hiring a Backend Engineer to design and scale APIs that power our analytics platform.',
      'You will work on high-throughput services, database design, and caching strategies.',
    ],
    requirements: [
      '3+ years with Node.js and Express',
      'Strong SQL skills and PostgreSQL experience',
      'Experience with Redis and job queues',
      'Understanding of JWT auth and security best practices',
    ],
  },
  3: {
    title: 'Full Stack Developer', company: 'CloudNine', location: 'Hyderabad', type: 'Hybrid',
    salary: '₹9–14 LPA', posted: '5 hours ago', tags: ['React', 'Node.js', 'Prisma'],
    description: [
      'Join CloudNine as a Full Stack Developer and own features from UI to DB.',
    ],
    requirements: [
      'Experience building full-stack apps with React + Node',
      'Comfortable with Prisma ORM and PostgreSQL',
      'Good understanding of REST and authentication flows',
    ],
  },
};

// Default fallback for demo
const fallback = {
  title: 'Frontend Developer', company: 'TechNova', location: 'Remote', type: 'Full-time',
  salary: '₹8–12 LPA', posted: '2 days ago', tags: ['React', 'TypeScript'],
  description: ['This is a sample job listing for DevHire Lite.'],
  requirements: ['Sample requirement 1', 'Sample requirement 2'],
};

const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const job = jobsDB[id] || fallback;

document.getElementById('jobTitle').textContent = job.title;
document.getElementById('jobCompany').textContent = job.company;

document.getElementById('jobMeta').innerHTML = `
  <span class="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">${job.type}</span>
  <span>📍 ${job.location}</span>
  <span>💰 ${job.salary}</span>
  <span>🕒 ${job.posted}</span>
`;

document.getElementById('jobTags').innerHTML = job.tags
  .map(t => `<span class="text-xs px-3 py-1 rounded-md bg-slate-100 text-slate-700">${t}</span>`)
  .join('');

document.getElementById('jobDescription').innerHTML = job.description
  .map(p => `<p>${p}</p>`).join('');

document.getElementById('jobRequirements').innerHTML = job.requirements
  .map(r => `<li>${r}</li>`).join('');

// Apply button (Phase 4 me real API call hoga)
const applyHandler = () => {
  if (typeof showToast === 'function') {
    showToast('✅ Application submitted! (demo)', 'success');
  } else {
    alert('Application submitted! (demo)');
  }
};
document.getElementById('applyBtn')?.addEventListener('click', applyHandler);
document.getElementById('applyBtn2')?.addEventListener('click', applyHandler);