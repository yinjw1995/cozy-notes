import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { BookOpen, FolderPlus, Loader2, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { APP_TITLE } from "@/const";

const CATEGORY_COLORS = ["#F0E6D9", "#E3F2EF", "#F4EAF5", "#E9F1F4", "#FDEEE2"];

export default function Notes() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);

  const utils = trpc.useUtils();
  const { data: categories = [], isLoading: categoriesLoading } = trpc.categories.list.useQuery();
  const { data: notes = [], isLoading: notesLoading } = trpc.notes.list.useQuery({ categoryId: selectedCategory });

  const createCategoryMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      utils.categories.invalidate();
      setCategoryDialogOpen(false);
      setNewCategoryName("");
      toast.success("分类创建成功");
    },
    onError: (error) => {
      toast.error(`创建失败: ${error.message}`);
    },
  });

  const deleteCategoryMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      utils.categories.invalidate();
      if (selectedCategory) {
        setSelectedCategory(undefined);
      }
      toast.success("分类删除成功");
    },
    onError: (error) => {
      toast.error(`删除失败: ${error.message}`);
    },
  });

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("请输入分类名称");
      return;
    }
    const colorIndex = categories.length % CATEGORY_COLORS.length;
    createCategoryMutation.mutate({ name: newCategoryName, color: CATEGORY_COLORS[colorIndex] });
  };

  const handleDeleteCategory = (id: number) => {
    if (confirm("确定要删除这个分类吗?")) {
      deleteCategoryMutation.mutate({ id });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md rounded-3xl border-white/50 bg-white/70">
          <CardHeader>
            <CardTitle>请先登录</CardTitle>
            <CardDescription>您需要登录才能查看和管理笔记</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
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
                className="rounded-full bg-white/60 px-4 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow"
              >
                主页
              </Link>
              <Link
                to="/notes"
                className="rounded-full bg-primary text-primary-foreground px-4 py-2 shadow-md"
              >
                分类笔记
              </Link>
              <Link
                to="/notes/new"
                className="rounded-full bg-white/60 px-4 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow"
              >
                新建笔记
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* 页面标题 */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="rounded-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回主页
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">我的笔记</h1>
              <p className="text-muted-foreground">在宁静中整理思绪</p>
            </div>
            <Link to="/notes/new">
              <Button size="lg" className="gap-2 rounded-full shadow-md hover:-translate-y-1 transition-all duration-200">
                <Plus className="h-5 w-5" />
                新建笔记
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧分类栏 */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl border border-white/50 bg-white/70 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">分类</h2>
                <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <FolderPlus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-3xl">
                    <DialogHeader>
                      <DialogTitle>创建新分类</DialogTitle>
                      <DialogDescription>为您的笔记创建一个新的分类</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="category-name">分类名称</Label>
                        <Input
                          id="category-name"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="例如:工作、生活、学习"
                          className="rounded-2xl"
                        />
                      </div>
                      <Button
                        onClick={handleCreateCategory}
                        disabled={createCategoryMutation.isPending}
                        className="w-full rounded-full"
                      >
                        {createCategoryMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "创建"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-2">
                <Button
                  variant={selectedCategory === undefined ? "default" : "ghost"}
                  className="w-full justify-start rounded-full"
                  onClick={() => setSelectedCategory(undefined)}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  全部笔记
                </Button>
                {categoriesLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  categories.map((category) => (
                    <div key={category.id} className="flex items-center gap-2">
                      <Button
                        variant={selectedCategory === category.id ? "default" : "ghost"}
                        className="flex-1 justify-start rounded-full"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <div
                          className="h-3 w-3 rounded-full mr-2"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={deleteCategoryMutation.isPending}
                        className="rounded-full"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 右侧笔记列表 */}
          <div className="lg:col-span-3">
            {notesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : notes.length === 0 ? (
              <div className="rounded-3xl border border-white/50 bg-white/70 p-12 text-center shadow-sm">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">还没有笔记</h3>
                <p className="text-muted-foreground mb-4">点击右上角的"新建笔记"按钮开始记录吧</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes.map((note) => {
                  const category = categories.find((c) => c.id === note.categoryId);
                  return (
                    <Link key={note.id} href={`/notes/${note.id}`}>
                      <div
                        className="group h-full rounded-3xl border border-white/50 bg-white/70 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                        style={{
                          backgroundColor: category ? `${category.color}40` : "rgba(255,255,255,0.7)",
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-foreground line-clamp-1 flex-1">
                            {note.title}
                          </h3>
                          {category && (
                            <div
                              className="h-3 w-3 rounded-full ml-2 flex-shrink-0"
                              style={{ backgroundColor: category.color }}
                            />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          {new Date(note.updatedAt).toLocaleDateString("zh-CN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <div
                          className="text-sm text-muted-foreground line-clamp-3 prose prose-sm"
                          dangerouslySetInnerHTML={{ __html: note.content }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
