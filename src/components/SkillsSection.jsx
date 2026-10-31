import React, { useState } from 'react';

const skillsList = [
  // Development
  { name: 'HTML', category: 'Frontend Web', group: 'Development', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg' },
  { name: 'CSS', category: 'Frontend Web', group: 'Development', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' },
  { name: 'BOOTSTRAP', category: 'CSS Framework', group: 'Development', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg' },
  { name: 'TAILWIND', category: 'CSS Framework', group: 'Development', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg' },
  { name: 'JAVASCRIPT', category: 'Frontend & Logic', group: 'Development', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
  { name: 'REACT.JS', category: 'Frontend Library', group: 'Development', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
  { name: 'JAVA', category: 'OOP & Software', group: 'Development', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
  { name: 'C#', category: 'Software Development', group: 'Development', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg' },
  { name: 'PYTHON', category: 'Programming Language', group: 'Development', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
  { name: 'PHP', category: 'Backend Web', group: 'Development', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg' },
  { name: 'DART', category: 'Mobile & Software', group: 'Development', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-original.svg' },
  { name: 'CI3', category: 'PHP Framework', group: 'Development', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/codeigniter/codeigniter-plain.svg' },
  { name: 'CI4', category: 'PHP Framework', group: 'Development', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/codeigniter/codeigniter-plain.svg' },
  { name: 'LARAVEL', category: 'PHP Framework', group: 'Development', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg' },

  // Design
  { name: 'FIGMA', category: 'UI/UX Design', group: 'Design', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg' },
  { name: 'PHOTOSHOP', category: 'Graphic Design', group: 'Design', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-original.svg' },
  { name: 'CANVA', category: 'Visual & Media', group: 'Design', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/canva/canva-original.svg' },
  { name: 'CAPCUT', category: 'Video Editing', group: 'Design', logo: '/images/skills/capcut.svg' },

  // Tools & Environments
  { name: 'GIT', category: 'Version Control', group: 'Tools', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
  { name: 'GITHUB', category: 'Code Repository', group: 'Tools', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg' },
  { name: 'VS CODE', category: 'Code Editor', group: 'Tools', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg' },
  { name: 'NETBEANS', category: 'Integrated Dev Env', group: 'Tools', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apache/apache-original.svg' },
  { name: 'ANTIGRAVITY', category: 'Agentic AI IDE', group: 'Tools', logo: '/images/skills/antigravity.svg' },
];

const skillCategories = ['ALL', 'Development', 'Design', 'Tools'];
const INITIAL_SKILLS_COUNT = 8;

export default function SkillsSection() {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [showAllSkills, setShowAllSkills] = useState(false);

  const filteredSkills =
    activeCategory === 'ALL'
      ? skillsList
      : skillsList.filter((item) => item.group === activeCategory);

  const displayedSkills = showAllSkills
    ? filteredSkills
    : filteredSkills.slice(0, INITIAL_SKILLS_COUNT);

  const remainingCount = filteredSkills.length - INITIAL_SKILLS_COUNT;

  return (
    <div
      className="flex flex-col gap-6 mt-16 w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 mb-32 scroll-mt-28"
      id="skills"
    >
      {/* Header & Filter Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-4 border-on-surface pb-4">
        <div className="reveal-left">
          <div className="font-label-caps text-label-caps text-primary mb-2 font-bold uppercase">
            TECHNICAL ARSENAL
          </div>
          <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface uppercase">
            BRICKBOX <span className="text-brick-blue">// SKILLS</span>
          </h2>
        </div>

        <div className="flex flex-wrap gap-2 reveal-right">
          {skillCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setActiveCategory(cat);
                setShowAllSkills(false);
              }}
              className={`px-4 py-2 border-4 border-on-surface text-on-surface font-label-caps font-bold text-[12px] uppercase transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:-rotate-1.5 hover:shadow-[6px_6px_0px_0px_#1a1c1c] active:translate-y-0.5 active:rotate-0 ${
                activeCategory === cat ? 'bg-brick-yellow brick-shadow' : 'bg-white hover:bg-surface-container-high'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mt-4">
        {displayedSkills.map((skill, idx) => (
          <div
            key={skill.name}
            className={`bg-white border-2 sm:border-3 border-on-surface rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 flex items-center gap-2.5 sm:gap-3.5 brick-shadow hover:-translate-y-1 transition-transform group select-none min-w-0 reveal-pop delay-${
              ((idx % 4) + 1) * 100
            }`}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl border-2 border-on-surface bg-[#f3f4f6] flex items-center justify-center p-2 flex-shrink-0 group-hover:bg-surface transition-colors">
              <img
                src={skill.logo}
                alt={skill.name}
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col items-start min-w-0 flex-grow">
              <h3 className="font-button-text text-on-surface font-black text-[12px] sm:text-[14px] md:text-[15px] tracking-wide uppercase truncate w-full">
                {skill.name}
              </h3>
              <span className="bg-brick-yellow border border-on-surface/90 px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[11px] font-bold text-on-surface font-label-caps inline-block mt-0.5 truncate max-w-full">
                {skill.category}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* View All / Show Less Button */}
      {remainingCount > 0 && (
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={() => setShowAllSkills(!showAllSkills)}
            className="px-6 py-3.5 bg-white text-on-surface border-4 border-on-surface font-button-text text-sm font-bold uppercase brick-btn relative cursor-pointer"
          >
            <div className="absolute -top-2 left-0 w-full flex justify-around px-2 pointer-events-none">
              <span className="w-3 h-3 rounded-full bg-white border-2 border-on-surface" />
              <span className="w-3 h-3 rounded-full bg-white border-2 border-on-surface" />
              <span className="w-3 h-3 rounded-full bg-white border-2 border-on-surface" />
            </div>
            {showAllSkills ? '↑ SHOW LESS' : `↓ VIEW ALL SKILLS (${remainingCount} MORE)`}
          </button>
        </div>
      )}
    </div>
  );
}

