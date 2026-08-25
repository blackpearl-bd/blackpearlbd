import { create } from 'zustand';
import type { TourDeal } from '@/types';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const BOOKMARKS_STORAGE_KEY = 'blackpearl-bookmarks';

// ── Storage helpers ──────────────────────────────────────────────
function loadFromStorage(): TourDeal[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(bookmarks: TourDeal[]) {
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
  } catch {
    /* localStorage unavailable */
  }
}

function clearStorage() {
  try {
    localStorage.removeItem(BOOKMARKS_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

// ── State ────────────────────────────────────────────────────────
interface BookmarkState {
  bookmarks: TourDeal[];
  /** Whether the current session is authenticated (server-backed). */
  isAuthenticated: boolean;
  isInitialized: boolean;

  addBookmark: (deal: TourDeal) => Promise<void>;
  removeBookmark: (dealId: string) => Promise<void>;
  isBookmarked: (dealId: string) => boolean;
  clearBookmarks: () => void;

  /** Called once on app mount. */
  initialize: (authenticated: boolean) => Promise<void>;
  /** Called when the user logs in mid-session. */
  onLogin: () => Promise<void>;
  /** Called when the user logs out. */
  onLogout: () => void;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  // ── Initial state ─────────────────────────────────────────────
  bookmarks: loadFromStorage(),
  isAuthenticated: false,
  isInitialized: false,

  // ── Add ───────────────────────────────────────────────────────
  addBookmark: async (deal) => {
    const { bookmarks, isAuthenticated } = get();
    if (bookmarks.some((b) => b.id === deal.id)) return;

    // Optimistic local update
    const next = [...bookmarks, deal];
    set({ bookmarks: next });

    if (!isAuthenticated) {
      saveToStorage(next);
      toast.success('Bookmarked!');
      return;
    }

    try {
      await api.saveDeal(deal.id);
      toast.success('Bookmarked!');
    } catch {
      toast.error('Failed to save bookmark');
    }
  },

  // ── Remove ────────────────────────────────────────────────────
  removeBookmark: async (dealId) => {
    const { bookmarks, isAuthenticated } = get();
    const next = bookmarks.filter((b) => b.id !== dealId);
    set({ bookmarks: next });

    if (!isAuthenticated) {
      saveToStorage(next);
      toast.success('Bookmark removed');
      return;
    }

    try {
      const { savedDeals } = await api.getSavedDeals();
      const saved = savedDeals.find((sd) => sd.deal_id === dealId);
      if (saved) await api.unsaveDeal(saved.id);
      toast.success('Bookmark removed');
    } catch {
      toast.error('Failed to remove bookmark');
    }
  },

  // ── Query ─────────────────────────────────────────────────────
  isBookmarked: (dealId) => get().bookmarks.some((b) => b.id === dealId),

  // ── Clear ─────────────────────────────────────────────────────
  clearBookmarks: () => {
    set({ bookmarks: [] });
    clearStorage();
  },

  // ── App-load initialization ───────────────────────────────────
  initialize: async (authenticated) => {
    if (get().isInitialized) return;

    if (authenticated) {
      set({ isAuthenticated: true });
      await fetchFromServer(set);
    }
    // Guest: bookmarks already loaded from localStorage in the initial state

    set({ isInitialized: true });
  },

  // ── Mid-session login ─────────────────────────────────────────
  onLogin: async () => {
    const { bookmarks: localBookmarks } = get();

    set({ isAuthenticated: true });

    // Push every local guest bookmark to the server (best-effort)
    for (const deal of localBookmarks) {
      try {
        await api.saveDeal(deal.id);
      } catch {
        /* non-blocking */
      }
    }

    // Pull the merged server list (includes everything just synced
    // plus any bookmarks that already existed on the server)
    await fetchFromServer(set);

    // Local storage is no longer the source of truth
    clearStorage();
  },

  // ── Mid-session logout ────────────────────────────────────────
  onLogout: () => {
    clearStorage();
    set({ isAuthenticated: false, bookmarks: [] });
  },
}));

// ── Helper: fetch bookmarks from server → state ──────────────────
async function fetchFromServer(
  set: (partial: Partial<BookmarkState>) => void,
) {
  try {
    const { savedDeals } = await api.getSavedDeals();
    const serverBookmarks = savedDeals
      .filter((sd) => sd.deal)
      .map((sd) => sd.deal as TourDeal);
    set({ bookmarks: serverBookmarks });
  } catch (error) {
    console.error('Failed to load bookmarks from server:', error);
  }
}
