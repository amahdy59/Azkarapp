import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import "./accessible-combobox.css";
import { ChevronDown, Search, Check, X } from "./icons";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

export interface ComboboxOption {
  id: number | string;
  label: string;
  secondaryLabel?: string;
  badge?: number | string;
  keywords?: readonly string[];
}

export interface AccessibleComboboxProps {
  id?: string;
  label: string;
  options: readonly ComboboxOption[];
  value: number | string;
  onChange: (value: number | string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  direction?: "ltr" | "rtl";
  language?: AppLanguage;
  className?: string;
}

export function AccessibleCombobox({
  id: externalId,
  label,
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  direction = "rtl",
  language = "ar",
  className = "",
}: AccessibleComboboxProps) {
  const generatedId = useId();
  const comboboxId = externalId ?? generatedId;
  const listboxId = `${comboboxId}-listbox`;

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const selectedOption = useMemo(() => options.find((opt) => String(opt.id) === String(value)), [options, value]);

  const filteredOptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return options;
    return options.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(query);
      const matchSecondary = opt.secondaryLabel?.toLowerCase().includes(query) ?? false;
      const matchBadge = opt.badge ? String(opt.badge).includes(query) : false;
      const matchId = String(opt.id).includes(query);
      const matchKeywords = opt.keywords ? opt.keywords.some((k) => k.toLowerCase().includes(query)) : false;
      return matchLabel || matchSecondary || matchBadge || matchId || matchKeywords;
    });
  }, [options, searchQuery]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setActiveIndex(-1);
    }
  }, [isOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && activeIndex >= 0 && listboxRef.current) {
      const itemElement = listboxRef.current.children[activeIndex] as HTMLElement | undefined;
      itemElement?.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, activeIndex]);

  const handleSelect = (option: ComboboxOption) => {
    onChange(option.id);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (event.key === "Tab") {
      setIsOpen(false);
      // Anchor native Tab/Shift+Tab traversal before the focused popup unmounts.
      triggerRef.current?.focus();
      return;
    }
    if ((event.key === "Home" || event.key === "End") && event.target === searchInputRef.current) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0 && filteredOptions[activeIndex]) {
        handleSelect(filteredOptions[activeIndex]!);
      }
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(filteredOptions.length - 1);
    }
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <div className={`relative flex min-w-0 flex-col gap-1.5 ${className}`} dir={direction}>
        <label
          id={`${comboboxId}-label`}
          htmlFor={`${comboboxId}-trigger`}
          className="text-xs font-bold text-muted-foreground"
        >
          {label}
        </label>

        <Popover.Trigger asChild>
          <button
            ref={triggerRef}
            id={`${comboboxId}-trigger`}
            type="button"
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls={listboxId}
            aria-labelledby={`${comboboxId}-label ${comboboxId}-trigger`}
            onKeyDown={handleKeyDown}
            className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-3.5 py-2 text-start transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
              {selectedOption ? (
                <>
                  {selectedOption.badge !== undefined && (
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-black text-primary">
                      {selectedOption.badge}
                    </span>
                  )}
                  <span className="min-w-0 break-words text-sm font-bold text-foreground">{selectedOption.label}</span>
                  {selectedOption.secondaryLabel && (
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">
                      ({selectedOption.secondaryLabel})
                    </span>
                  )}
                </>
              ) : (
                <span className="text-sm font-medium text-muted-foreground">{placeholder ?? label}</span>
              )}
            </span>

            <span className="shrink-0 text-muted-foreground transition-transform">
              <ChevronDown
                size={18}
                className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </span>
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            data-slot="combobox-content"
            data-dropdown-surface=""
            aria-labelledby={`${comboboxId}-label`}
            dir={direction}
            align="start"
            sideOffset={6}
            collisionPadding={8}
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              searchInputRef.current?.focus();
            }}
            className="accessible-combobox-popup z-50 flex flex-col overflow-hidden rounded-2xl border border-border-control p-2 text-popover-foreground shadow-overlay"
          >
            {/* Search bar inside dropdown */}
            <div className="relative mb-2 shrink-0">
              <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-muted-foreground">
                <Search size={16} aria-hidden="true" />
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder ?? label}
                aria-label={searchPlaceholder ?? label}
                aria-controls={listboxId}
                aria-activedescendant={
                  activeIndex >= 0 && filteredOptions[activeIndex]
                    ? `${comboboxId}-option-${filteredOptions[activeIndex]!.id}`
                    : undefined
                }
                className="accessible-combobox-search min-h-11 w-full rounded-xl border border-border/80 bg-background pe-12 ps-9 py-2 text-xs font-bold text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveIndex(-1);
                    searchInputRef.current?.focus();
                  }}
                  className="absolute inset-y-0 end-0 flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                  aria-label={t(language, "common.clear")}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Options listbox */}
            <ul
              ref={listboxRef}
              id={listboxId}
              role="listbox"
              aria-label={label}
              onKeyDown={handleKeyDown}
              className="accessible-combobox-options flex min-h-0 flex-col gap-1 overflow-y-auto overscroll-contain pe-1 focus:outline-none"
              tabIndex={-1}
            >
              {filteredOptions.length === 0 ? (
                <li role="presentation" className="px-3 py-4 text-center text-xs font-medium text-muted-foreground">
                  {emptyMessage ?? t(language, "mushaf.noResultsFound")}
                </li>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = String(option.id) === String(value);
                  const isActive = index === activeIndex;

                  return (
                    <li
                      key={option.id}
                      id={`${comboboxId}-option-${option.id}`}
                      role="option"
                      tabIndex={-1}
                      aria-selected={isSelected}
                      onClick={() => handleSelect(option)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSelect(option);
                        }
                      }}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`flex min-h-11 shrink-0 cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-start transition-colors ${
                        isSelected
                          ? "bg-primary/10 text-primary font-bold"
                          : isActive
                            ? "bg-muted text-foreground"
                            : "text-foreground hover:bg-muted/60"
                      }`}
                    >
                      <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                        {option.badge !== undefined && (
                          <span
                            className={`flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                              isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {option.badge}
                          </span>
                        )}
                        <span className="min-w-0 break-words text-xs font-bold">{option.label}</span>
                        {option.secondaryLabel && (
                          <span className="text-2xs font-semibold text-muted-foreground">
                            ({option.secondaryLabel})
                          </span>
                        )}
                      </div>

                      {isSelected && (
                        <span className="shrink-0 text-primary">
                          <Check size={16} strokeWidth={2.5} aria-hidden="true" />
                        </span>
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </Popover.Content>
        </Popover.Portal>
      </div>
    </Popover.Root>
  );
}
