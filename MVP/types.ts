// Solo Sonar - 核心数据类型定义
// 这是整个项目的"地基"，所有数据都基于这些类型

// ============================================
// 基础类型
// ============================================

/** 支持的平台 */
export type Platform = 
  | 'royal-road'      // Royal Road - Progression Fantasy 大本营
  | 'spacebattles'    // SpaceBattles - 论坛格式，硬科幻
  | 'sufficient-velocity' // Sufficient Velocity - Quest互动小说
  | 'scribble-hub'    // Scribble Hub - 女性向/日系
  | 'ao3'             // Archive of Our Own - 同人文
  | 'personal-site';  // 作者独立站

/** 平台显示信息 */
export const PLATFORM_INFO: Record<Platform, { name: string; shortName: string; color: string }> = {
  'royal-road': { name: 'Royal Road', shortName: 'RR', color: 'bg-blue-600' },
  'spacebattles': { name: 'SpaceBattles', shortName: 'SB', color: 'bg-orange-500' },
  'sufficient-velocity': { name: 'Sufficient Velocity', shortName: 'SV', color: 'bg-gray-600' },
  'scribble-hub': { name: 'Scribble Hub', shortName: 'SH', color: 'bg-pink-500' },
  'ao3': { name: 'Archive of Our Own', shortName: 'AO3', color: 'bg-red-600' },
  'personal-site': { name: 'Author Site', shortName: 'Site', color: 'bg-emerald-600' },
};

/** 主题标签 */
export type Theme = 
  | 'time-loop'
  | 'progression'
  | 'litrpg'
  | 'rational'
  | 'kingdom-building'
  | 'dungeon-core'
  | 'slice-of-life'
  | 'sci-fi'
  | 'cultivation'
  | 'isekai'
  | 'portal-fantasy'
  | 'base-building'
  | 'completed';

/** 主题显示信息 */
export const THEME_INFO: Record<Theme, { name: string; icon: string }> = {
  'time-loop': { name: 'Time Loop', icon: '⏳' },
  'progression': { name: 'Progression', icon: '📈' },
  'litrpg': { name: 'LitRPG', icon: '🎮' },
  'rational': { name: 'Rational', icon: '🧠' },
  'kingdom-building': { name: 'Kingdom Building', icon: '👑' },
  'dungeon-core': { name: 'Dungeon Core', icon: '🏰' },
  'slice-of-life': { name: 'Slice of Life', icon: '☕' },
  'sci-fi': { name: 'Sci-Fi', icon: '🚀' },
  'cultivation': { name: 'Cultivation', icon: '🧘' },
  'isekai': { name: 'Isekai', icon: '🌀' },
  'portal-fantasy': { name: 'Portal Fantasy', icon: '🚪' },
  'base-building': { name: 'Base Building', icon: '🔨' },
  'completed': { name: 'Completed', icon: '✅' },
};

/** 作品状态 */
export type NovelStatus = 'ongoing' | 'completed' | 'hiatus' | 'dropped';

// ============================================
// 策展人 (Curator)
// ============================================

export interface Curator {
  id: string;                    // 唯一标识，如 "looplord"
  name: string;                  // 显示名称，如 "LoopLord"
  avatar?: string;               // 头像 URL（可选）
  bio?: string;                  // 简介（可选）
  specialties: Theme[];          // 擅长领域
  stackCount: number;            // 创建的书单数量
  joinedAt: string;              // 加入时间 ISO 格式
}

// ============================================
// 作品 (Novel)
// ============================================

/** 作品在某个平台的链接 */
export interface NovelLink {
  platform: Platform;
  url: string;
  isCanonical: boolean;          // 是否为主要/官方链接
}

export interface Novel {
  id: string;                    // 唯一标识，如 "mother-of-learning"
  title: string;                 // 作品名称
  author: string;                // 作者名
  
  // 描述信息
  synopsis: string;              // 简介（1-2段）
  themes: Theme[];               // 主题标签（最多5个）
  
  // 外部链接（核心！不托管内容）
  links: NovelLink[];            // 各平台链接
  
  // 元数据
  status: NovelStatus;           // 连载状态
  wordCount?: number;            // 字数（可选）
  chapterCount?: number;         // 章节数（可选）
  startedAt?: string;            // 开始连载时间
  completedAt?: string;          // 完结时间（如果已完结）
  
  // 封面
  coverImage?: string;           // 封面图 URL
  coverGradient?: string;        // 备用渐变色，如 "from-violet-600 to-indigo-900"
  
  // 统计（来自 Solo Sonar 内部）
  stackCount: number;            // 被收录进多少个书单
  savedCount: number;            // 被多少用户收藏
}

// ============================================
// 书单 (Stack)
// ============================================

/** 书单中的单个作品条目 */
export interface StackEntry {
  novelId: string;               // 关联的作品 ID
  curatorNote?: string;          // 策展人点评（核心功能！）
  addedAt: string;               // 添加时间
  order: number;                 // 排序位置
}

export interface Stack {
  id: string;                    // 唯一标识，如 "mother-of-learning-similar"
  
  // 基本信息
  title: string;                 // 书单标题
  description: string;           // 书单描述
  
  // 策展人
  curatorId: string;             // 创建者 ID
  curatorNote?: string;          // 书单整体的编者按（Editor's Note）
  
  // 作品列表
  entries: StackEntry[];         // 书单中的作品
  
  // 分类
  themes: Theme[];               // 主题标签
  platforms: Platform[];         // 涉及的平台（自动从作品计算）
  
  // 样式
  coverGradient: string;         // 封面渐变色
  
  // 元数据
  createdAt: string;             // 创建时间
  updatedAt: string;             // 最后更新时间
  
  // 统计
  savedCount: number;            // 被多少用户收藏
  viewCount: number;             // 浏览量
  
  // 状态
  isEditorPick: boolean;         // 是否为编辑精选
  isFeatured: boolean;           // 是否首页推荐
}

// ============================================
// 用户书架 (Shelf) - Phase 2
// ============================================

/** 用户创建的个人书架（不计入作品收录数） */
export interface Shelf {
  id: string;
  userId: string;
  title: string;
  description?: string;
  novelIds: string[];            // 简化版，只存作品ID
  isPublic: boolean;             // 是否公开
  createdAt: string;
  updatedAt: string;
}

// ============================================
// API 响应类型
// ============================================

/** 首页数据 */
export interface HomePageData {
  editorPicks: Stack[];          // 编辑精选书单
  featuredStacks: Stack[];       // 推荐书单
  recentStacks: Stack[];         // 最新书单
  popularNovels: Novel[];        // 热门作品
}

/** 书单详情页数据（包含完整的作品信息） */
export interface StackDetailData {
  stack: Stack;
  curator: Curator;
  novels: Novel[];               // 书单中所有作品的完整信息
  relatedStacks: Stack[];        // 相关书单推荐
}

/** 作品详情页数据 */
export interface NovelDetailData {
  novel: Novel;
  stacks: Stack[];               // 包含该作品的所有书单
  similarNovels: Novel[];        // 相似作品推荐
}
