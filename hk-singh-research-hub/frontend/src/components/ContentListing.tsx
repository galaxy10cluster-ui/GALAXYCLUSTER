"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { ContentCard } from "@/components/ContentCard";
import { api } from "@/lib/api";
import type { Category, ListResponse } from "@/lib/types";

type CardType = "paper" | "video" | "audio" | "document";

interface BaseItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnailUrl?: string | null;
  views?: number;
  downloads?: number;
  category?: Category | null;
}

export function ContentListing<T extends BaseItem>({
  apiPath,
  type,
  title,
  subtitle,
}: {
  apiPath: string;
  type: CardType;
  title: string;
  subtitle: string;
}) {
  const [items, setItems] = useState<T[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.get<Category[]>("/api/categories").then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    params.set("sort", sort);
    params.set("limit", "24");

    const timeout = setTimeout(() => {
      api
        .get<ListResponse<T>>(`${apiPath}?${params.toString()}`)
        .then((res) => {
          setItems(res.items);
          setTotal(res.total);
        })
        .catch(() => {
          setItems([]);
          setTotal(0);
        })
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [apiPath, query, category, sort]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-paper sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-xl text-sm text-paper-dim">{subtitle}</p>
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="glass flex flex-1 items-center gap-2.5 rounded-xl px-4 py-2.5">
          <Search size={15} className="text-paper-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}...`}
            className="w-full bg-transparent text-sm text-paper placeholder:text-paper-faint focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          <div className="glass flex items-center gap-2 rounded-xl px-3 py-2.5">
            <SlidersHorizontal size={13} className="text-paper-faint" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent text-sm text-paper focus:outline-none [&>option]:bg-void-panel"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="glass flex items-center rounded-xl px-3 py-2.5">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-sm text-paper focus:outline-none [&>option]:bg-void-panel"
            >
              <option value="newest">Newest first</option>
              <option value="popular">Most popular</option>
            </select>
          </div>
        </div>
      </div>

      <p className="mb-5 mono-label text-paper-faint">
        {loading ? "Loading..." : `${total} item${total === 1 ? "" : "s"}`}
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <ContentCard
            key={item.id}
            type={type}
            slug={item.slug}
            title={item.title}
            description={item.description}
            thumbnailUrl={item.thumbnailUrl}
            views={item.views}
            downloads={item.downloads}
            categoryName={item.category?.name}
            index={i}
          />
        ))}
        {!loading && items.length === 0 && (
          <div className="glass col-span-full flex flex-col items-center gap-2 rounded-2xl py-16 text-center">
            <p className="text-sm text-paper-faint">No results found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
