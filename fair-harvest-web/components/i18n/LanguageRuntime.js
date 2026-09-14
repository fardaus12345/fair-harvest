"use client";

import { useEffect } from "react";
import { translations } from "../../lib/i18nDictionary.js";

const LANGUAGE_KEY = "fairHarvestLanguage";
const originalText = new WeakMap();
const originalAttr = new WeakMap();
let isApplying = false;
let scheduled = null;

export default function LanguageRuntime() {
  useEffect(() => {
    const applyCurrentLanguage = () => scheduleApplyLanguage(getLanguage());
    applyCurrentLanguage();

    const observer = new MutationObserver(() => applyCurrentLanguage());
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    window.addEventListener("fairharvest:language", applyCurrentLanguage);
    window.addEventListener("storage", applyCurrentLanguage);

    return () => {
      observer.disconnect();
      window.removeEventListener("fairharvest:language", applyCurrentLanguage);
      window.removeEventListener("storage", applyCurrentLanguage);
    };
  }, []);

  return null;
}

export function getLanguage() {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem(LANGUAGE_KEY) || "en";
}

export function setLanguage(language) {
  window.localStorage.setItem(LANGUAGE_KEY, language);
  window.dispatchEvent(new Event("fairharvest:language"));
}

function applyLanguage(language) {
  if (isApplying) return;
  isApplying = true;
  document.documentElement.lang = language === "bn" ? "bn" : "en";
  document.documentElement.dataset.language = language;
  translateTextNodes(document.body, language);
  translateAttributes(language);
  isApplying = false;
}

function scheduleApplyLanguage(language) {
  if (scheduled) window.clearTimeout(scheduled);
  scheduled = window.setTimeout(() => {
    scheduled = null;
    applyLanguage(language);
  }, 30);
}

function translateTextNodes(root, language) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach((node) => {
    // React updates a text node in place (textInstance.nodeValue = next) rather
    // than replacing it, so a node we have already cached can legitimately hold
    // new application data. We therefore remember both the English source and
    // the value we ourselves last wrote: if the node no longer holds what we
    // wrote, React (or any other code) changed it, and the new value becomes
    // the source. Without this the cached value was written back over every
    // live update — the farmer dashboard's metrics stayed frozen at their
    // first-render placeholders while the rest of the page showed real data.
    const cached = originalText.get(node);
    if (!cached || cached.applied !== node.nodeValue) {
      originalText.set(node, { source: node.nodeValue, applied: node.nodeValue });
    }

    const entry = originalText.get(node);
    const nextValue = translateValue(entry.source, language);
    if (node.nodeValue !== nextValue) node.nodeValue = nextValue;
    entry.applied = nextValue;
  });
}

function translateAttributes(language) {
  document.querySelectorAll("[placeholder], [aria-label], [title]").forEach((element) => {
    ["placeholder", "aria-label", "title"].forEach((attr) => {
      if (!element.hasAttribute(attr)) return;
      const key = `${attr}:${element.getAttribute(attr)}`;
      if (!originalAttr.has(element)) originalAttr.set(element, {});
      const store = originalAttr.get(element);
      if (!store[attr]) store[attr] = element.getAttribute(attr);
      const nextValue = translateValue(store[attr], language);
      if (element.getAttribute(attr) !== nextValue) element.setAttribute(attr, nextValue);
    });
  });
}

function translateValue(value, language) {
  if (language !== "bn") return value;
  const dictionary = translations.bn;
  const leading = value.match(/^\s*/)?.[0] || "";
  const trailing = value.match(/\s*$/)?.[0] || "";
  const trimmed = value.trim();
  if (!trimmed) return value;

  if (dictionary[trimmed]) return `${leading}${dictionary[trimmed]}${trailing}`;

  for (const [english, bangla] of Object.entries(dictionary)) {
    if (trimmed.startsWith(`${english} `)) {
      return `${leading}${bangla}${trimmed.slice(english.length)}${trailing}`;
    }
    if (trimmed.startsWith(`${english},`)) {
      return `${leading}${bangla}${trimmed.slice(english.length)}${trailing}`;
    }
  }

  return value;
}
