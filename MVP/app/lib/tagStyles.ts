// 统一的标签颜色配置系统
// 用于首页、书单详情页、书籍详情页

export interface TagStyle {
  bg: string;
  text: string;
  border: string;
}

// 主题标签颜色映射（完整版）- 使用 700 系列文字色 + 100 系列边框
export const TAG_COLORS: Record<string, TagStyle> = {
  // 流行度标签
  'trending': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border border-amber-100' },
  '🔥': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border border-amber-100' },
  'hidden-gem': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border border-rose-100' },
  '💎': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border border-rose-100' },

  // 核心类型标签
  'time-loop': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border border-blue-100' },
  'litrpg': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border border-purple-100' },
  'progression': { bg: 'bg-green-50', text: 'text-green-700', border: 'border border-green-100' },
  'rational': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border border-cyan-100' },
  'sci-fi': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border border-indigo-100' },
  'fantasy': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border border-emerald-100' },
  'cultivation': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border border-amber-100' },
  'xianxia': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border border-amber-100' },
  'isekai': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border border-rose-100' },
  'portal': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border border-violet-100' },
  'portal-fantasy': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border border-violet-100' },
  'magic-system': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border border-purple-100' },
  'comedy': { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border border-yellow-100' },
  'super-heroes': { bg: 'bg-red-50', text: 'text-red-700', border: 'border border-red-100' },
  'superhero': { bg: 'bg-red-50', text: 'text-red-700', border: 'border border-red-100' },
  'politics': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border border-amber-100' },

  // 科幻子类型
  'space-opera': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border border-indigo-100' },
  'hard-sci-fi': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border border-slate-200' },
  'military': { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border border-stone-200' },

  // 题材/设定
  'dark': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border border-gray-200' },
  'horror': { bg: 'bg-zinc-100', text: 'text-zinc-700', border: 'border border-zinc-200' },
  'psychological': { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border border-fuchsia-100' },
  'romance': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border border-pink-100' },
  'mystery': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border border-violet-100' },
  'urban-fantasy': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border border-teal-100' },

  // 角色类型
  'female-lead': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border border-pink-100' },
  'male-lead': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border border-blue-100' },
  'ensemble-cast': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border border-orange-100' },
  'oc': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border border-sky-100' },
  'non-human-lead': { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border border-lime-100' },
  'ai-protagonist': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border border-cyan-100' },
  'villain-lead': { bg: 'bg-red-50', text: 'text-red-700', border: 'border border-red-100' },
  'villain-protagonist': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border border-rose-100' },

  // 剧情风格
  'escalation': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border border-orange-100' },
  'slice-of-life': { bg: 'bg-green-50', text: 'text-green-700', border: 'border border-green-100' },
  'slow-burn': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border border-amber-100' },
  'fast-paced': { bg: 'bg-red-50', text: 'text-red-700', border: 'border border-red-100' },
  'character-driven': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border border-teal-100' },
  'fluff': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border border-pink-100' },
  'angst': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border border-slate-200' },
  'trauma-recovery': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border border-purple-100' },

  // 特殊能力/设定
  'alt-power': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border border-indigo-100' },
  'tech-uplift': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border border-cyan-100' },
  'tinker': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border border-blue-100' },
  'power-theft': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border border-violet-100' },
  'power-creep': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border border-purple-100' },
  'thinker': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border border-amber-100' },
  'stranger': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border border-slate-200' },
  'dungeon': { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border border-stone-200' },
  'op': { bg: 'bg-red-50', text: 'text-red-700', border: 'border border-red-100' },

  // 故事结构
  'canon-divergence': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border border-blue-100' },
  'au': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border border-indigo-100' },
  'role-swap': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border border-purple-100' },
  'multi-pov': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border border-teal-100' },
  'crossover': { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border border-fuchsia-100' },
  'fix-it': { bg: 'bg-green-50', text: 'text-green-700', border: 'border border-green-100' },
  'time-manipulation': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border border-blue-100' },

  // 基调/氛围
  'short': { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border border-gray-200' },
  'literary': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border border-amber-100' },
  'crack': { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border border-yellow-100' },
  'unpowered': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border border-slate-200' },

  // 角色定位
  'anti-hero': { bg: 'bg-zinc-100', text: 'text-zinc-700', border: 'border border-zinc-200' },
  'vigilante': { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border border-stone-200' },
  'post-canon': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border border-blue-100' },

  // 世界观/设定
  'biopunk': { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border border-lime-100' },
  'mecha': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border border-blue-100' },
  'academy': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border border-cyan-100' },
  'space': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border border-indigo-100' },
  'revenge': { bg: 'bg-red-50', text: 'text-red-700', border: 'border border-red-100' },
  'bureaucracy': { bg: 'bg-stone-50', text: 'text-stone-600', border: 'border border-stone-200' },
  'murderhobo': { bg: 'bg-red-50', text: 'text-red-700', border: 'border border-red-100' },

  // 同人圈标签
  'worm-fanfic': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border border-orange-100' },
  'asoiaf-fanfic': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border border-amber-100' },
  'rwby-fanfic': { bg: 'bg-red-50', text: 'text-red-700', border: 'border border-red-100' },
  'harry-potter-fanfic': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border border-rose-100' },
  'naruto-fanfic': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border border-orange-100' },
  'pokemon-fanfic': { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border border-yellow-100' },
  'overwatch-fanfic': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border border-sky-100' },
  'sailor-moon': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border border-pink-100' },
  'bloodborne': { bg: 'bg-red-50', text: 'text-red-700', border: 'border border-red-100' },
  'castlevania': { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border border-stone-200' },
  'gundam': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border border-blue-100' },
  'transformers': { bg: 'bg-red-50', text: 'text-red-700', border: 'border border-red-100' },
  'raildex': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border border-cyan-100' },
  'tolkien': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border border-amber-100' },
  'harry-potter': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border border-rose-100' },
  'stargate': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border border-blue-100' },
  'bsg': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border border-slate-200' },

  // 其他特殊标签
  'forum-fic': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border border-slate-200' },
  'quest': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border border-indigo-100' },
  'ck2': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border border-amber-100' },
  'strategy': { bg: 'bg-stone-50', text: 'text-stone-600', border: 'border border-stone-200' },
  'twist': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border border-purple-100' },
  'meta-narrative': { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border border-fuchsia-100' },
  'world-building': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border border-teal-100' },
  'dungeon-keeper': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border border-emerald-100' },
  'culture-clash': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border border-orange-100' },
  'ham': { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border border-yellow-100' },

  // 状态标签
  'completed': { bg: 'bg-green-50', text: 'text-green-700', border: 'border border-green-100' },
  'ongoing': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border border-blue-100' },
  'hiatus': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border border-amber-100' },
  'dead': { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border border-gray-200' },
};

// 获取主题标签样式的函数
export function getTagStyle(theme: string): TagStyle {
  return TAG_COLORS[theme] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border border-slate-200' };
}

// 获取主题标签的完整 className
export function getTagClassName(theme: string): string {
  const style = getTagStyle(theme);
  return `${style.bg} ${style.text} ${style.border}`;
}

// 格式化标签文本为 Title Case
// 例如: time-loop → Time Loop, worm-fanfic → Worm Fanfic
export function formatTagLabel(tag: string): string {
  return tag
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
