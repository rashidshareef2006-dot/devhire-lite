export interface JobImageOption {
  id: number;
  code: string;
  label: string;
  url: string;
  category: string;
}

export const JOB_IMAGE_LIBRARY: JobImageOption[] = [
  // Frontend
  { id: 1,  code: 'JS',  label: 'JavaScript',        category: 'Frontend', url: '/jobs/1.svg' },
  { id: 2,  code: 'TS',  label: 'TypeScript',        category: 'Frontend', url: '/jobs/2.svg' },
  { id: 3,  code: 'RE',  label: 'React',             category: 'Frontend', url: '/jobs/3.svg' },
  { id: 4,  code: 'NX',  label: 'Next.js',           category: 'Frontend', url: '/jobs/4.svg' },
  { id: 5,  code: 'VU',  label: 'Vue.js',            category: 'Frontend', url: '/jobs/5.svg' },
  { id: 6,  code: 'NG',  label: 'Angular',           category: 'Frontend', url: '/jobs/6.svg' },
  { id: 7,  code: 'SV',  label: 'Svelte',            category: 'Frontend', url: '/jobs/7.svg' },
  { id: 8,  code: 'TW',  label: 'Tailwind CSS',      category: 'Frontend', url: '/jobs/8.svg' },

  // Backend
  { id: 9,  code: 'ND',  label: 'Node.js',           category: 'Backend',  url: '/jobs/9.svg' },
  { id: 10, code: 'EX',  label: 'Express.js',        category: 'Backend',  url: '/jobs/10.svg' },
  { id: 11, code: 'PY',  label: 'Python',            category: 'Backend',  url: '/jobs/11.svg' },
  { id: 12, code: 'DJ',  label: 'Django',            category: 'Backend',  url: '/jobs/12.svg' },
  { id: 13, code: 'JV',  label: 'Java',              category: 'Backend',  url: '/jobs/13.svg' },
  { id: 14, code: 'SP',  label: 'Spring Boot',       category: 'Backend',  url: '/jobs/14.svg' },
  { id: 15, code: 'GO',  label: 'Golang',            category: 'Backend',  url: '/jobs/15.svg' },
  { id: 16, code: 'RS',  label: 'Rust',              category: 'Backend',  url: '/jobs/16.svg' },
  { id: 17, code: 'PHP', label: 'PHP',               category: 'Backend',  url: '/jobs/17.svg' },
  { id: 18, code: 'RB',  label: 'Ruby on Rails',     category: 'Backend',  url: '/jobs/18.svg' },

  // Database
  { id: 19, code: 'PG',  label: 'PostgreSQL',        category: 'Database', url: '/jobs/19.svg' },
  { id: 20, code: 'MG',  label: 'MongoDB',           category: 'Database', url: '/jobs/20.svg' },
  { id: 21, code: 'MY',  label: 'MySQL',             category: 'Database', url: '/jobs/21.svg' },
  { id: 22, code: 'RD',  label: 'Redis',             category: 'Database', url: '/jobs/22.svg' },
  { id: 23, code: 'ES',  label: 'Elasticsearch',     category: 'Database', url: '/jobs/23.svg' },
  { id: 24, code: 'SQ',  label: 'SQL',               category: 'Database', url: '/jobs/24.svg' },

  // DevOps
  { id: 25, code: 'DK',  label: 'Docker',            category: 'DevOps',   url: '/jobs/25.svg' },
  { id: 26, code: 'K8',  label: 'Kubernetes',        category: 'DevOps',   url: '/jobs/26.svg' },
  { id: 27, code: 'AWS', label: 'AWS',               category: 'DevOps',   url: '/jobs/27.svg' },
  { id: 28, code: 'AZ',  label: 'Azure',             category: 'DevOps',   url: '/jobs/28.svg' },
  { id: 29, code: 'GC',  label: 'Google Cloud',      category: 'DevOps',   url: '/jobs/29.svg' },
  { id: 30, code: 'CI',  label: 'CI/CD',             category: 'DevOps',   url: '/jobs/30.svg' },
  { id: 31, code: 'LX',  label: 'Linux',             category: 'DevOps',   url: '/jobs/31.svg' },
  { id: 32, code: 'TF',  label: 'Terraform',         category: 'DevOps',   url: '/jobs/32.svg' },
  { id: 33, code: 'AN',  label: 'Ansible',           category: 'DevOps',   url: '/jobs/33.svg' },

  // Mobile
  { id: 34, code: 'RN',  label: 'React Native',      category: 'Mobile',   url: '/jobs/34.svg' },
  { id: 35, code: 'FL',  label: 'Flutter',           category: 'Mobile',   url: '/jobs/35.svg' },
  { id: 36, code: 'iOS', label: 'iOS / Swift',       category: 'Mobile',   url: '/jobs/36.svg' },
  { id: 37, code: 'AN',  label: 'Android',           category: 'Mobile',   url: '/jobs/37.svg' },
  { id: 38, code: 'KT',  label: 'Kotlin',            category: 'Mobile',   url: '/jobs/38.svg' },

  // Data / AI
  { id: 39, code: 'ML',  label: 'Machine Learning',  category: 'Data / AI', url: '/jobs/39.svg' },
  { id: 40, code: 'AI',  label: 'AI Engineer',       category: 'Data / AI', url: '/jobs/40.svg' },
  { id: 41, code: 'DS',  label: 'Data Science',      category: 'Data / AI', url: '/jobs/41.svg' },
  { id: 42, code: 'TF',  label: 'TensorFlow',        category: 'Data / AI', url: '/jobs/42.svg' },
  { id: 43, code: 'PT',  label: 'PyTorch',           category: 'Data / AI', url: '/jobs/43.svg' },
  { id: 44, code: 'PD',  label: 'Pandas',            category: 'Data / AI', url: '/jobs/44.svg' },

  // Design
  { id: 45, code: 'FG',  label: 'Figma',             category: 'Design',   url: '/jobs/45.svg' },
  { id: 46, code: 'UX',  label: 'UI / UX',           category: 'Design',   url: '/jobs/46.svg' },
  { id: 47, code: 'SK',  label: 'Sketch',            category: 'Design',   url: '/jobs/47.svg' },
  { id: 48, code: 'XD',  label: 'Adobe XD',          category: 'Design',   url: '/jobs/48.svg' },
  { id: 49, code: 'PS',  label: 'Photoshop',         category: 'Design',   url: '/jobs/49.svg' },

  // Product / Other
  { id: 50, code: 'PM',  label: 'Product Manager',   category: 'Product',  url: '/jobs/50.svg' },
  { id: 51, code: 'SC',  label: 'Scrum',             category: 'Product',  url: '/jobs/51.svg' },
  { id: 52, code: 'AG',  label: 'Agile',             category: 'Product',  url: '/jobs/52.svg' },
  { id: 53, code: 'QA',  label: 'QA Engineer',       category: 'QA',       url: '/jobs/53.svg' },
  { id: 54, code: 'SEC', label: 'Security',          category: 'Security', url: '/jobs/54.svg' },
  { id: 55, code: 'BC',  label: 'Blockchain',        category: 'Web3',     url: '/jobs/55.svg' },
  { id: 56, code: 'W3',  label: 'Web3',              category: 'Web3',     url: '/jobs/56.svg' },
  { id: 57, code: 'GT',  label: 'Git / GitHub',      category: 'Tools',    url: '/jobs/57.svg' },
  { id: 58, code: 'API', label: 'REST API',          category: 'Backend',  url: '/jobs/58.svg' },
  { id: 59, code: 'GQ',  label: 'GraphQL',           category: 'Backend',  url: '/jobs/59.svg' },
  { id: 60, code: 'MK',  label: 'Marketing',         category: 'Marketing',url: '/jobs/60.svg' },
];

export const JOB_IMAGE_CATEGORIES = [
  'All', 'Frontend', 'Backend', 'Database', 'DevOps',
  'Mobile', 'Data / AI', 'Design', 'Product', 'QA',
  'Security', 'Web3', 'Tools', 'Marketing',
];