import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Image as ImageIcon, Loader2, Save, Trash2, BookOpen } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { APP_TITLE } from "@/const";
import { Link } from "wouter";

export default function NoteEditor() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: categories = [] } = trpc.categories.list.useQuery();
  const { data: note, isLoading: noteLoading } = trpc.notes.getById.useQuery(
    { id: parseInt(id || "0") },
    { enabled: !!id && id !== "new" }
  );

  const createNoteMutation = trpc.notes.create.useMutation({
    onSuccess: (data) => {
      utils.notes.invalidate();
      toast.success("笔记创建成功");
      setLocation(`/notes/${data.id}`);
    },
    onError: (error) => {
      toast.error(`创建失败: ${error.message}`);
    },
  });

  const updateNoteMutation = trpc.notes.update.useMutation({
    onSuccess: () => {
      utils.notes.invalidate();
      toast.success("笔记保存成功");
    },
    onError: (error) => {
      toast.error(`保存失败: ${error.message}`);
    },
  });

  const deleteNoteMutation = trpc.notes.delete.useMutation({
    onSuccess: () => {
      utils.notes.invalidate();
      toast.success("笔记删除成功");
      setLocation("/notes");
    },
    onError: (error) => {
      toast.error(`删除失败: ${error.message}`);
    },
  });

  const uploadImageMutation = trpc.upload.image.useMutation({
    onSuccess: (data) => {
      if (editorRef.current) {
        const img = document.createElement("img");
        img.src = data.url;
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.style.borderRadius = "1rem";
        img.style.margin = "1rem 0";
        editorRef.current.appendChild(img);
        setContent(editorRef.current.innerHTML);
      }
      toast.success("图片上传成功");
    },
    onError: (error) => {
      toast.error(`上传失败: ${error.message}`);
    },
  });

  useEffect(() => {
    if (note && id !== "new") {
      setTitle(note.title);
      setContent(note.content);
      setCategoryId(note.categoryId || undefined);
      if (editorRef.current) {
        editorRef.current.innerHTML = note.content;
      }
    }
  }, [note, id]);

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("请输入标题");
      return;
    }

    const finalContent = editorRef.current?.innerHTML || content;

    if (id === "new") {
      createNoteMutation.mutate({ title, content: finalContent, categoryId });
    } else {
      updateNoteMutation.mutate({ id: parseInt(id), title, content: finalContent, categoryId });
    }
  };

  const handleDelete = () => {
    if (id !== "new" && confirm("确定要删除这篇笔记吗?")) {
      deleteNoteMutation.mutate({ id: parseInt(id) });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("图片大小不能超过5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      uploadImageMutation.mutate({ base64, filename: file.name });
    };
    reader.readAsDataURL(file);
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  if (authLoading || (noteLoading && id !== "new")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md rounded-3xl border border-white/50 bg-white/70 p-8 text-center shadow-sm">
          <p className="text-muted-foreground">请先登录才能编辑笔记</p>
        </div>
      </div>
    );
  }

  const selectedCategoryData = categories.find((c) => c.id === categoryId);

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
                className="rounded-full bg-white/60 px-4 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow"
              >
                分类笔记
              </Link>
              <Link
                to="/notes/new"
                className="rounded-full bg-primary text-primary-foreground px-4 py-2 shadow-md"
              >
                新建笔记
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* 操作按钮 */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/notes")}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
          <div className="flex gap-2">
            {id !== "new" && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteNoteMutation.isPending}
                className="rounded-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={createNoteMutation.isPending || updateNoteMutation.isPending}
              className="rounded-full shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              {createNoteMutation.isPending || updateNoteMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              保存
            </Button>
          </div>
        </div>

        {/* 编辑器卡片 */}
        <div
          className="rounded-3xl border border-white/50 bg-white/70 p-8 shadow-sm"
          style={{
            backgroundColor: selectedCategoryData ? `${selectedCategoryData.color}40` : "rgba(255,255,255,0.7)",
          }}
        >
          <div className="space-y-6">
            {/* 标题输入 */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-muted-foreground">
                标题
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="在此输入笔记标题..."
                className="text-3xl font-bold border-none bg-transparent px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
              />
            </div>

            {/* 分类选择 */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-muted-foreground">
                分类
              </Label>
              <Select
                value={categoryId?.toString() || "none"}
                onValueChange={(val) => setCategoryId(val === "none" ? undefined : parseInt(val))}
              >
                <SelectTrigger id="category" className="rounded-2xl bg-white/60">
                  <SelectValue placeholder="选择分类(可选)" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="none">无分类</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 内容编辑器 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-muted-foreground">内容</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadImageMutation.isPending}
                  className="rounded-full bg-white/60"
                >
                  {uploadImageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ImageIcon className="h-4 w-4 mr-2" />
                  )}
                  插入图片
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
              <div
                ref={editorRef}
                contentEditable
                onInput={handleEditorInput}
                className="min-h-[400px] rounded-2xl bg-white/60 p-6 focus:outline-none focus:ring-2 focus:ring-ring prose prose-sm max-w-none"
                style={{
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}
                data-placeholder="开始书写你的想法..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
