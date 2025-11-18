import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // 笔记分类路由
  categories: router({
    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      const { getUserCategories } = await import("./db");
      return getUserCategories(ctx.user.id);
    }),
    create: publicProcedure
      .input((raw: unknown) => {
        const input = raw as { name: string; color?: string };
        if (!input.name || typeof input.name !== "string") {
          throw new Error("Invalid category name");
        }
        return input;
      })
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        const { createCategory } = await import("./db");
        await createCategory({ userId: ctx.user.id, name: input.name, color: input.color });
        return { success: true };
      }),
    delete: publicProcedure
      .input((raw: unknown) => {
        const input = raw as { id: number };
        if (typeof input.id !== "number") {
          throw new Error("Invalid category id");
        }
        return input;
      })
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        const { deleteCategory } = await import("./db");
        await deleteCategory(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // 笔记路由
  notes: router({
    list: publicProcedure
      .input((raw: unknown) => {
        const input = raw as { categoryId?: number } | undefined;
        return input || {};
      })
      .query(async ({ ctx, input }) => {
        if (!ctx.user) return [];
        const { getUserNotes } = await import("./db");
        return getUserNotes(ctx.user.id, input.categoryId);
      }),
    getById: publicProcedure
      .input((raw: unknown) => {
        const input = raw as { id: number };
        if (typeof input.id !== "number") {
          throw new Error("Invalid note id");
        }
        return input;
      })
      .query(async ({ ctx, input }) => {
        if (!ctx.user) return null;
        const { getNoteById } = await import("./db");
        return getNoteById(input.id, ctx.user.id);
      }),
    create: publicProcedure
      .input((raw: unknown) => {
        const input = raw as { title: string; content: string; categoryId?: number };
        if (!input.title || typeof input.title !== "string") {
          throw new Error("Invalid title");
        }
        if (typeof input.content !== "string") {
          throw new Error("Invalid content");
        }
        return input;
      })
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        const { createNote } = await import("./db");
        const result = await createNote({
          userId: ctx.user.id,
          title: input.title,
          content: input.content,
          categoryId: input.categoryId,
        });
        return { success: true, id: result[0]?.insertId };
      }),
    update: publicProcedure
      .input((raw: unknown) => {
        const input = raw as { id: number; title?: string; content?: string; categoryId?: number };
        if (typeof input.id !== "number") {
          throw new Error("Invalid note id");
        }
        return input;
      })
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        const { updateNote } = await import("./db");
        const { id, ...data } = input;
        await updateNote(id, ctx.user.id, data);
        return { success: true };
      }),
    delete: publicProcedure
      .input((raw: unknown) => {
        const input = raw as { id: number };
        if (typeof input.id !== "number") {
          throw new Error("Invalid note id");
        }
        return input;
      })
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        const { deleteNote } = await import("./db");
        await deleteNote(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // 图片上传路由
  upload: router({
    image: publicProcedure
      .input((raw: unknown) => {
        const input = raw as { base64: string; filename: string };
        if (!input.base64 || typeof input.base64 !== "string") {
          throw new Error("Invalid base64 data");
        }
        if (!input.filename || typeof input.filename !== "string") {
          throw new Error("Invalid filename");
        }
        return input;
      })
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        const { storagePut } = await import("./storage");
        
        // 解析base64
        const matches = input.base64.match(/^data:(.+);base64,(.+)$/);
        if (!matches) throw new Error("Invalid base64 format");
        
        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, "base64");
        
        // 生成随机文件名
        const ext = input.filename.split(".").pop() || "jpg";
        const randomSuffix = Math.random().toString(36).substring(2, 15);
        const fileKey = `${ctx.user.id}/images/${Date.now()}-${randomSuffix}.${ext}`;
        
        const { url } = await storagePut(fileKey, buffer, mimeType);
        return { url };
      }),
  }),
});

export type AppRouter = typeof appRouter;
