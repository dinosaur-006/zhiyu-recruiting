# Alpha v0.1

## Completed

- DeepSeek local backend proxy.
- Real AI path for job truth analysis.
- Real AI path for HR Pro report generation.
- Mock fallback when the local AI server or DeepSeek call is unavailable.
- Lighter HR report first screen.
- Reduced candidate profile supplement flow.

## Current Limits

- No real database.
- No login or permission model.
- No ATS or enterprise messaging integration.
- No multi-tenant SaaS layer.
- AI output is interview-prep communication support only and does not make hiring decisions.

## Redesign: Candidate Experience v3 — "Crafted Transparency"

- Complete candidate-side visual redesign: new warm, professional design system with refined color palette, typography hierarchy, and spacing
- New candidate component library: `SceneProgress`, `TrustSignal`, `DigitalHumanCard`, `ChoiceCard`, `QuestionChip`, `SceneBriefing`, `DayInLifePreview`, `ChoiceBuilder`
- Redesigned `CandidateLayout` with clean top bar, ambient background, and smooth page transitions
- Redesigned `Home` with editorial job discovery, trust signals strip, and compelling hero
- Redesigned `JobDetail` with refined GravitySandbox, simplified consent modal, and trust architecture
- Redesigned `Chat` replacing military metaphor ("PenetrationTracker→SceneProgress", "TacticalCrucible→ChoiceBuilder", "IntelArchive→SceneBriefing", "EnvironmentBlueprint→DayInLifePreview")
- Redesigned `Profile` with conversational AI form, transparent extraction UX, and refined chat bubbles
- Redesigned `StoryPreview` as premium capability report with clean typography and card-based layout
- Redesigned `Success` with confetti celebration, step timeline, and evaluation ratings
- Terminology changes: "沙盘推演→实境体验", "隐形收割→智能画像分析", "战术工作台→选择构建器", "退出→暂停体验"
- New `candidate-redesign.css` with 500+ lines of candidate-specific design tokens and primitives

## Home Page Comprehensive Redesign

- **Hero 2.0**: Full-width immersive hero with animated floating stat badges (实时在线岗位数, 平均体验时长), larger typography (56px headline), dual CTAs (浏览岗位 + 快速匹配), scroll-to-jobs anchor
- **Quick Stats Bar**: 4-stat horizontal strip right below hero (AI辅助·HR决策 / <8分钟 / 92%满意度 / 50+企业), replaces old disconnected trust metrics
- **Skills Quiz**: Conditionally rendered as expandable section triggered by hero CTA or inline prompt. Hidden by default to reduce page length, shown on demand with "花30秒做个快速匹配" teaser
- **Job Search & Filter**: New search bar with real-time keyword filtering (title, department, skills, selling points). 6 category filter pills (全部/前端/后端/全栈/AI数据/管理) with emoji indicators
- **Richer Job Cards**: Match score badges (60-95% simulated), NEW/HOT ribbon labels, skill tag chips (up to 4 + overflow count), selling point with 💡 prefix, trending-up icon on match indicator
- **Empty State**: Search icon + "没有匹配的岗位" message with recovery guidance when no results
- **Footer**: Expanded with privacy policy, about links, dot separators

## Critical Fix: Blank Page on `/candidate`

- **Root cause**: `/candidate` route had no `index` child. CandidateLayout rendered with `<Outlet />` but nothing filled it, producing a completely empty page (just topbar + white space).
- **Fix**: Added `{ index: true, element: <Navigate to="/" replace /> }` to redirect `/candidate` → `/` (Home).
- All other child routes (`/candidate/job/:id`, `/candidate/chat/:id`, etc.) verified to have proper empty/error states:
  - JobDetail → "岗位不存在或已下架"  
  - Chat → "体验内容准备中"
  - Profile → "岗位不存在"
  - StoryPreview → "报告未找到"
  - Success → gracefully handles missing candidate with empty defaults

## Functional Innovation: 4 New Product Features

- **SkillsQuiz** (Home): Interactive 3-question skills matching quiz. Candidates answer about tech stack, priorities, and experience. Animated question transitions, icon-based options with selection feedback. On completion, triggers job matching callback. Full-width alternating section below HowItWorks.
- **BenefitsCalculator** (JobDetail): Total compensation calculator with expandable annual comp breakdown (monthly base, bonus, housing fund, learning fund, equipment, insurance). Category-tabbed benefits grid (薪酬保障/健康关怀/成长发展/工作方式) with 7 expandable benefit cards showing detailed descriptions.
- **CompetencyBadges** (Chat sidebar): Real-time achievement badge system. 6 badges (首次决策/好奇心/策略家/协作者/探索者/坚持者) with trigger conditions based on branchChoices, reverseAnswers, and sceneIndex. New badges animate in with spring physics and sparkle effects. Locked badges shown grayed out as motivation.
- **ApplicationTracker** (Success): 5-stage visual application pipeline (投递成功→HR审阅中→初步沟通→面试安排→Offer). Vertical timeline with animated dot indicators, status badges, estimated timeframes, and current-stage pulse animation.

## Page-Level Deep Optimization

- **Home**: Hero section now has ambient radial glow background for visual depth. Page structure: Glow Hero → Trust Strip → HowItWorks → Two-panel (Job Grid + ContextPanel) → Metrics → Footer
- **JobDetail**: Added 5-step "Interview Process Timeline" (实境体验 → HR审阅 → 初步沟通 → 技术面试 → Offer) in full-width alternating section with emoji icons and color-coded steps
- **Chat**: Added cinematic scene intro overlay — each scene change triggers a 2-second fullscreen transition with emoji, title, and description. `useState(showSceneIntro)` + `useEffect` on `sceneIndex` change. `SCENE_EMOJI` array: 📋/🌤️/🎯
- **StoryPreview**: Added 4-metric "Key Dashboard" at the top of the report header — shows core highlights count, competency dimensions mapped, preference match ratio, and interview prep question count. Color-coded metric cards in a 4-column grid
- **Success**: Added "Browse More Jobs" CTA section encouraging candidates to continue exploring while waiting for HR response
- **Profile**: Widened to `--cr-content-xxl` (1400px) with two-panel layout (form + ContextPanel)

## Layout v2: True Full-Width Experience with Contextual Sidebars

- **CSS tokens**: `--cr-content-xxl` 1400px, `--cr-page-padding` 32px, `--cr-sidebar-w` 340px
- **New primitives**: `.cr-full-width` (viewport edge-to-edge), `.cr-full-width--contained`, `.cr-section-alt` (alternating backgrounds)
- **ContextPanel**: universal sidebar component with page-specific content (QuickStats, TipCards, contextual data rows). 6 variants: home/job/chat/profile/story/success
- **Home**: two-panel layout (main + ContextPanel with stats and tips), job grid spans full available width
- **JobDetail**: two-panel (GravitySandbox + ContextPanel with job at-a-glance), TeamConstellation in full-width alternating section
- **Profile**: two-panel (form + ContextPanel with stats and tips)
- **StoryPreview**: two-panel (report + ContextPanel with summary and next steps)
- **Chat**: retains dedicated two-panel with LiveInsightPanel and session stats
- **Success**: multi-column card grid within wider max-width
- All feature components (`HowItWorks`, `TeamConstellation`, `GrowthCompass`, `CapabilityMirror`, `FutureYou`) widened to `--cr-content-xxl` (1400px)

## Layout Expansion: Wide Desktop Experience

- **CSS token expansion**: `--cr-content-sm` 640→780px, `--cr-content-md` 720→900px, `--cr-content-lg` 880→1100px, new `--cr-content-xl` 1200px, new `--cr-sidebar-w` 320px
- **New layout primitives**: `.cr-two-panel` (main+sidebar), `.cr-two-panel--wide`, `.cr-side-panel` (sticky), `.cr-card-grid-3`, `.cr-card-grid-2`, `.cr-feature-grid` with responsive breakpoints
- **Chat page**: transformed from single 720px column to true two-panel layout (780px main + 320px sticky sidebar). LiveInsightPanel now persistent right panel with session summary card and quick tips
- **Home page**: wider job grid using `auto-fill, minmax(320px, 1fr)`, richer job cards with salary badges, selling points, and experience/education chips
- **JobDetail page**: GravitySandbox widened to 1200px, TeamConstellation and GrowthCompass widened to match
- **Profile page**: widened from 640px to 1100px for better form readability
- **StoryPreview page**: widened from 640px to 1100px, competency mapping and preference comparison now side-by-side two-column
- **Success page**: widened to 1100px, all content sections organized in two-column card grids (Highlights+Abilities, Interview+Rating, Culture+PrepKit)
- All 6 feature components (`HowItWorks`, `TeamConstellation`, `GrowthCompass`, `LiveInsightPanel`, `CapabilityMirror`, `FutureYou`) widened to `--cr-content-xl` (1200px) for maximum immersion

## Innovation Sprint: Rich Feature Components

- **HowItWorks** — animated 3-step journey explainer with auto-cycling illustration, particle effects, and progressive disclosure detail cards (Home page)
- **TeamConstellation** — organic-positioned team member map with connection lines, hover/click detail cards, and personal notes (JobDetail page)
- **GrowthCompass** — alternating timeline of 4 career milestones with skill badges, color-coded indicators (JobDetail page)
- **LiveInsightPanel** — collapsible transparent AI observation log showing real-time what the AI learns, with type-coded entries (Chat page)
- **CapabilityMirror** — interactive SVG radar chart comparing self-assessment vs AI-extracted skills, with adjustable sliders and gap analysis (Profile page)
- **FutureYou** — 4-stage career projection with tabbed stage selector, animated visuals, salary ranges, skill tags, and growth tips (StoryPreview page)
- **Success page enrichment** — added "While You Wait" culture preview grid and "Interview Prep Kit" with actionable preparation steps
- **Home page enrichment** — added trust metrics bar (3 stats) below HowItWorks section

## Next

- AI generation metadata.
- Safety filter hit records.
- Human review status for reports.
- Alpha eval samples for job and report output quality.

## Stabilization Updates

- Backend AI responses now include provider, model, request ID, latency, safety hits, human-review flag, and creation time.
- Frontend AI Provider preserves DeepSeek metadata and adds mock fallback metadata when the API is unavailable.
- HR Pro reports can show AI source metadata and be marked as manually reviewed.
- Alpha eval samples cover three jobs and three candidate concern profiles.
