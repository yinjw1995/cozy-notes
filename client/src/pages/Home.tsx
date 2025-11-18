import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, Heart, PenLine } from "lucide-react";
import { APP_TITLE, getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* 导航栏 - 毛玻璃效果 */}
      <header className="sticky top-0 z-40 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between rounded-3xl border border-white/40 bg-white/70 px-6 py-4 shadow-sm">
            <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <BookOpen className="h-5 w-5 text-primary" />
              {APP_TITLE}
            </Link>
            <nav className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
              <Link
                to="/"
                className="rounded-full bg-primary text-primary-foreground px-4 py-2 shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                主页
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/notes"
                    className="rounded-full bg-white/60 px-4 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow"
                  >
                    分类笔记
                  </Link>
                  <Link
                    to="/notes/new"
                    className="rounded-full bg-white/60 px-4 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow"
                  >
                    新建笔记
                  </Link>
                </>
              ) : (
                <a href={getLoginUrl()}>
                  <Button
                    size="sm"
                    className="rounded-full"
                  >
                    登录
                  </Button>
                </a>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero区域 - 渐变背景和插画 */}
      <section className="relative overflow-hidden flex-1">
        {/* 渐变背景 */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#F9F6F0] via-[#F4F0EB] to-[#E7DED4]"
          aria-hidden="true"
        />
        {/* 装饰性模糊圆圈 */}
        <div
          className="pointer-events-none absolute -top-32 -right-28 h-96 w-96 rounded-full bg-[#BFD8D5]/60 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-40 -left-24 h-[28rem] w-[28rem] rounded-full bg-[#DFC9B8]/70 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 pt-20 pb-24 lg:grid-cols-2">
          {/* 左侧文字内容 */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Mindful Notes
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl font-bold leading-tight text-foreground lg:text-6xl">
                在宁静中
                <br />
                <span className="text-primary">记录生活</span>
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground max-w-xl">
                用温柔的文字和图片捕捉每一个灵感瞬间。在这个安静的空间里,让思绪自由流淌,构建属于你的知识花园。
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link to="/notes/new">
                    <Button size="lg" className="gap-2 rounded-full shadow-lg hover:-translate-y-1 transition-all duration-200">
                      <PenLine className="h-5 w-5" />
                      开始书写
                    </Button>
                  </Link>
                  <Link to="/notes">
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2 rounded-full bg-white/80 hover:-translate-y-1 transition-all duration-200"
                    >
                      <BookOpen className="h-5 w-5" />
                      浏览笔记
                    </Button>
                  </Link>
                </>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg" className="gap-2 rounded-full shadow-lg hover:-translate-y-1 transition-all duration-200">
                    <Heart className="h-5 w-5" />
                    开始使用
                  </Button>
                </a>
              )}
            </div>

            {/* 统计数据 */}
            <div className="flex flex-wrap items-center gap-8 pt-8 text-sm">
              <div>
                <div className="text-2xl font-bold text-primary">简洁</div>
                <div className="text-muted-foreground">专注书写</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">温馨</div>
                <div className="text-muted-foreground">柔和设计</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">宁静</div>
                <div className="text-muted-foreground">安心记录</div>
              </div>
            </div>
          </div>

          {/* 右侧插画 */}
          <div className="relative">
            <div className="relative rounded-3xl bg-white/30 p-8 backdrop-blur-sm">
              <img
                src="/calm-workspace-illustration.png"
                alt="宁静的工作空间"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 功能特性区域 */}
      <section className="relative py-20 bg-white/50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">为什么选择我们</h2>
            <p className="text-muted-foreground">简单、优雅、专注于记录的本质</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "分类管理",
                description: "创建自定义分类,让你的笔记井井有条。工作、生活、学习,各归其位。",
                icon: "📚",
                accent: "#F0E6D9",
              },
              {
                title: "富文本编辑",
                description: "支持文字和图片混排,让你的笔记更加生动有趣。轻松插入图片,记录精彩瞬间。",
                icon: "✨",
                accent: "#E3F2EF",
              },
              {
                title: "宁静设计",
                description: "精心设计的界面,柔和的色彩,让你在记录生活的同时,享受视觉的愉悦。",
                icon: "🌿",
                accent: "#F4EAF5",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group rounded-3xl border border-white/50 bg-white/70 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                style={{ backgroundColor: `${feature.accent}40` }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="border-t border-white/40 py-8 bg-white/30">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 {APP_TITLE}. 在宁静中记录生活的每一刻。
          </p>
        </div>
      </footer>
    </div>
  );
}
