"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LanguageButton } from "@/components/ui/languageButton";
import { useTranslations } from "@/components/hooks/useTranlations";
import { useLanguage } from "@/app/context/LanguageContext";
import { useNotifications } from "@/components/hooks/useNotifications";
import type { AppNotification } from "@/lib/api";

const DISMISSED_KEY = "agrimarket-dismissed-notifications";

function loadDismissed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveDismissed(ids: Set<string>) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]));
}

const TopActionControls = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLSpanElement>(null);

  const t = useTranslations();
  const { language } = useLanguage();
  const n = t.dashboard.notifications;
  const { data, isLoading, isError, refetch, isReady } = useNotifications();

  useEffect(() => {
    setDismissed(loadDismissed());
  }, []);

  const resolveText = useCallback(
    (item: AppNotification) => {
      const copy = n.items[item.id];
      const count = item.count ?? 0;
      if (copy) {
        return {
          title: copy.title,
          message: copy.message.replace(/\{\{count\}\}/g, String(count)),
        };
      }
      return { title: item.id, message: "" };
    },
    [n.items]
  );

  const visible =
    data?.notifications.filter((item) => !dismissed.has(item.id)) ?? [];
  const unreadCount = visible.length;

  const updatePanelPosition = useCallback(() => {
    const el = bellRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPanelStyle({
      position: "fixed",
      top: rect.bottom + 8,
      right: Math.max(12, window.innerWidth - rect.right),
      zIndex: 9999,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePanelPosition();
    const onScrollOrResize = () => updatePanelPosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [isOpen, updatePanelPosition]);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current?.contains(target) ||
        document.getElementById("notification-panel")?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  const toggleOpen = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        if (isReady) {
          void refetch();
        }
        requestAnimationFrame(updatePanelPosition);
      }
      return next;
    });
  };

  const dismissOne = (id: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveDismissed(next);
      return next;
    });
  };

  const dismissAll = () => {
    const next = new Set(dismissed);
    visible.forEach((item) => next.add(item.id));
    setDismissed(next);
    saveDismissed(next);
  };

  const typeStyles: Record<string, string> = {
    warning: "border-amber-200 bg-amber-50",
    error: "border-red-200 bg-red-50",
    success: "border-emerald-200 bg-emerald-50",
    action: "border-blue-200 bg-blue-50",
    tip: "border-[#5B8C51]/30 bg-[#F5F9F5]",
    info: "border-gray-200 bg-gray-50",
  };

  const panel =
    isOpen &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        id="notification-panel"
        style={panelStyle}
        className={`w-[min(100vw-1.5rem,22rem)] rounded-xl border border-black/10 bg-white shadow-xl ${language === "am" ? "amharic" : ""}`}
        role="dialog"
        aria-label={n.title}
      >
        <div className="flex items-center justify-between border-b border-black/5 px-3 py-2.5">
          <h3 className="text-sm font-semibold text-black/80">{n.title}</h3>
          {visible.length > 0 && (
            <button
              type="button"
              onClick={dismissAll}
              className="text-xs font-medium text-[#2A5A2A] hover:underline"
            >
              {n.markAllRead}
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-black/50">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
          {isError && !isLoading && (
            <p className="py-6 text-center text-sm text-red-600">{n.loadError}</p>
          )}
          {!isLoading && !isError && visible.length === 0 && (
            <p className="py-6 text-center text-sm text-black/50">{n.empty}</p>
          )}
          {!isLoading &&
            visible.map((item) => {
              const { title, message } = resolveText(item);
              return (
                <div
                  key={item.id}
                  className={`mb-2 rounded-lg border p-3 last:mb-0 ${typeStyles[item.type] ?? typeStyles.info}`}
                >
                  <p className="text-sm font-semibold text-black/85">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-black/65">{message}</p>
                  {item.note && (
                    <p className="mt-1 text-xs italic text-black/50">{item.note}</p>
                  )}
                  <div className="mt-2 flex gap-2">
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="text-xs font-medium text-[#2A5A2A] hover:underline"
                    >
                      {n.viewAll} →
                    </Link>
                    <button
                      type="button"
                      onClick={() => dismissOne(item.id)}
                      className="text-xs text-black/40 hover:text-black/70"
                    >
                      {n.dismiss}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>,
      document.body
    );

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center gap-2 ${language === "am" ? "amharic" : ""}`}
    >
      <LanguageButton />
      <span ref={bellRef} className="relative inline-flex">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={n.ariaLabel}
          aria-expanded={isOpen}
          onClick={(e) => {
            e.stopPropagation();
            toggleOpen();
          }}
          className="h-9 w-9 border-[#2A5A2A]/30 text-[#2A5A2A] hover:bg-[#2A5A2A] hover:text-white"
        >
          <Bell size={18} />
        </Button>
        {unreadCount > 0 && (
          <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </span>
      {panel}
    </div>
  );
};

export default TopActionControls;
