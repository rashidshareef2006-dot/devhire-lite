import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'public', 'jobs');
fs.mkdirSync(OUT, { recursive: true });

const items = [
  // Frontend (1-8)
  { code: 'JS',  label: 'JavaScript',   colors: ['#f7df1e', '#c9a800'] },
  { code: 'TS',  label: 'TypeScript',   colors: ['#3178c6', '#1d4a7a'] },
  { code: 'RE',  label: 'React',        colors: ['#61dafb', '#1e6b8a'] },
  { code: 'NX',  label: 'Next.js',      colors: ['#000000', '#434343'] },
  { code: 'VU',  label: 'Vue.js',       colors: ['#42b883', '#1f6b48'] },
  { code: 'NG',  label: 'Angular',      colors: ['#dd0031', '#8b001f'] },
  { code: 'SV',  label: 'Svelte',       colors: ['#ff3e00', '#a82800'] },
  { code: 'TW',  label: 'Tailwind CSS', colors: ['#06b6d4', '#076e80'] },

  // Backend (9-18)
  { code: 'ND',  label: 'Node.js',      colors: ['#68a063', '#3d5e3a'] },
  { code: 'EX',  label: 'Express.js',   colors: ['#1a1a1a', '#4d4d4d'] },
  { code: 'PY',  label: 'Python',       colors: ['#3776ab', '#1f4866'] },
  { code: 'DJ',  label: 'Django',       colors: ['#092e20', '#1b5c40'] },
  { code: 'JV',  label: 'Java',         colors: ['#f89820', '#a35d00'] },
  { code: 'SP',  label: 'Spring Boot',  colors: ['#6db33f', '#3d7a1e'] },
  { code: 'GO',  label: 'Golang',       colors: ['#00add8', '#006f8c'] },
  { code: 'RS',  label: 'Rust',         colors: ['#ce422b', '#8a2818'] },
  { code: 'PHP', label: 'PHP',          colors: ['#777bb4', '#464a80'] },
  { code: 'RB',  label: 'Ruby on Rails',colors: ['#cc0000', '#7a0000'] },

  // Database (19-24)
  { code: 'PG',  label: 'PostgreSQL',   colors: ['#336791', '#1c3d5a'] },
  { code: 'MG',  label: 'MongoDB',      colors: ['#47a248', '#255a25'] },
  { code: 'MY',  label: 'MySQL',        colors: ['#00758f', '#004e60'] },
  { code: 'RD',  label: 'Redis',        colors: ['#dc382d', '#8f1810'] },
  { code: 'ES',  label: 'Elasticsearch',colors: ['#005571', '#003347'] },
  { code: 'SQ',  label: 'SQL',          colors: ['#4479a1', '#2a4d68'] },

  // DevOps (25-33)
  { code: 'DK',  label: 'Docker',       colors: ['#2496ed', '#0b5d9e'] },
  { code: 'K8',  label: 'Kubernetes',   colors: ['#326ce5', '#1a3f8f'] },
  { code: 'AWS', label: 'AWS',          colors: ['#ff9900', '#a35f00'] },
  { code: 'AZ',  label: 'Azure',        colors: ['#0078d4', '#004578'] },
  { code: 'GC',  label: 'Google Cloud', colors: ['#4285f4', '#1a52a8'] },
  { code: 'CI',  label: 'CI/CD',        colors: ['#6b46c1', '#3f2585'] },
  { code: 'LX',  label: 'Linux',        colors: ['#333333', '#000000'] },
  { code: 'TF',  label: 'Terraform',    colors: ['#7b42bc', '#4d2280'] },
  { code: 'AN',  label: 'Ansible',      colors: ['#ee0000', '#8a0000'] },

  // Mobile (34-38)
  { code: 'RN',  label: 'React Native', colors: ['#61dafb', '#0a5a76'] },
  { code: 'FL',  label: 'Flutter',      colors: ['#02569b', '#013866'] },
  { code: 'iOS', label: 'iOS / Swift',  colors: ['#fa7343', '#a83f1a'] },
  { code: 'AN',  label: 'Android',      colors: ['#3ddc84', '#0e8c48'] },
  { code: 'KT',  label: 'Kotlin',       colors: ['#7f52ff', '#4a2ba8'] },

  // Data / AI (39-44)
  { code: 'ML',  label: 'Machine Learning', colors: ['#ff6b6b', '#b33232'] },
  { code: 'AI',  label: 'AI Engineer',  colors: ['#9333ea', '#5b1f8f'] },
  { code: 'DS',  label: 'Data Science', colors: ['#0ea5e9', '#075a80'] },
  { code: 'TF',  label: 'TensorFlow',   colors: ['#ff6f00', '#a34700'] },
  { code: 'PT',  label: 'PyTorch',      colors: ['#ee4c2c', '#8f2b15'] },
  { code: 'PD',  label: 'Pandas',       colors: ['#150458', '#0a0230'] },

  // Design (45-49)
  { code: 'FG',  label: 'Figma',        colors: ['#f24e1e', '#8c2a0d'] },
  { code: 'UX',  label: 'UI / UX',      colors: ['#ec4899', '#8d2360'] },
  { code: 'SK',  label: 'Sketch',       colors: ['#fdb300', '#a57500'] },
  { code: 'XD',  label: 'Adobe XD',     colors: ['#ff61f6', '#a0339c'] },
  { code: 'PS',  label: 'Photoshop',    colors: ['#31a8ff', '#0a5f9e'] },

  // Product / Other (50-60)
  { code: 'PM',  label: 'Product Manager', colors: ['#6366f1', '#3739a8'] },
  { code: 'SC',  label: 'Scrum',        colors: ['#0891b2', '#045367'] },
  { code: 'AG',  label: 'Agile',        colors: ['#84cc16', '#4d7a0d'] },
  { code: 'QA',  label: 'QA Engineer',  colors: ['#ef4444', '#8f1f1f'] },
  { code: 'SEC', label: 'Security',     colors: ['#1f2937', '#0b1219'] },
  { code: 'BC',  label: 'Blockchain',   colors: ['#f7931a', '#9c5b0d'] },
  { code: 'W3',  label: 'Web3',         colors: ['#8b5cf6', '#4c2ba8'] },
  { code: 'GT',  label: 'Git / GitHub', colors: ['#181717', '#4a4a4a'] },
  { code: 'API', label: 'REST API',     colors: ['#10b981', '#067250'] },
  { code: 'GQ',  label: 'GraphQL',      colors: ['#e10098', '#8a005c'] },
  { code: 'MK',  label: 'Marketing',    colors: ['#f59e0b', '#a35c00'] },
];

items.forEach((item, i) => {
  const [c1, c2] = item.colors;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
    <pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <rect width="800" height="600" fill="url(#p)"/>
  <circle cx="700" cy="100" r="200" fill="rgba(255,255,255,0.08)"/>
  <circle cx="100" cy="520" r="150" fill="rgba(255,255,255,0.06)"/>
  <text x="400" y="320" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="160" font-weight="800" fill="rgba(255,255,255,0.97)" text-anchor="middle" letter-spacing="-6">${item.code}</text>
  <text x="400" y="410" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="30" font-weight="500" fill="rgba(255,255,255,0.85)" text-anchor="middle">${item.label}</text>
</svg>`;
  fs.writeFileSync(path.join(OUT, `${i + 1}.svg`), svg);
});

console.log(`✅ Generated ${items.length} SVG images in ${OUT}`);