import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  supabase,
  isSupabaseConfigured,
  localDb,
  SEED_SHOP_ITEMS,
} from '../../lib/supabase';
import { Profile, Attributes, InventoryItem, ShopItem } from '../../lib/types';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  attributes: Attributes | null;
  inventory: InventoryItem[];
  equippedTheme: ShopItem | null;
  equippedBadge: ShopItem | null;
  equippedFrame: ShopItem | null;
  equippedEffect: ShopItem | null;
  isLoading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  enterDemoMode: () => void;
  refreshProfile: () => Promise<void>;
  equipItem: (itemId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [attributes, setAttributes] = useState<Attributes | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    // Default to demo mode if Supabase credentials are not configured or demo mode is saved
    const savedDemo = localStorage.getItem('questbound_is_demo');
    if (savedDemo !== null) return savedDemo === 'true';
    return !isSupabaseConfigured;
  });

  const loadDemoData = useCallback(() => {
    const prof = localDb.getProfile();
    const attrs = localDb.getAttributes();
    const inv = localDb.getInventory();
    setUser({ id: prof.id, email: 'adventurer@guild.realm' });
    setProfile(prof);
    setAttributes(attrs);
    setInventory(inv);
    setIsLoading(false);
  }, []);

  const loadSupabaseData = useCallback(async (userId: string) => {
    if (!supabase) return;
    try {
      // 1. Profile
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profErr) {
        console.warn('Profile fetch error, using local fallback:', profErr);
      } else if (prof) {
        setProfile(prof as Profile);
      }

      // 2. Attributes
      const { data: attrs, error: attrErr } = await supabase
        .from('attributes')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (attrErr) {
        console.warn('Attributes fetch error:', attrErr);
      } else if (attrs) {
        setAttributes(attrs as Attributes);
      }

      // 3. Inventory
      const { data: invData, error: invErr } = await supabase
        .from('inventory')
        .select('*, item:items(*)')
        .eq('user_id', userId);

      if (invErr) {
        console.warn('Inventory fetch error:', invErr);
      } else if (invData) {
        setInventory(invData as InventoryItem[]);
      }
    } catch (err) {
      console.error('Error loading Supabase user data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (isDemoMode) {
      loadDemoData();
      return;
    }
    if (user && supabase) {
      await loadSupabaseData(user.id);
    }
  }, [isDemoMode, user, loadDemoData, loadSupabaseData]);

  useEffect(() => {
    if (isDemoMode) {
      loadDemoData();
      return;
    }

    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email || '' });
          loadSupabaseData(session.user.id);
        } else {
          setIsLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email || '' });
            loadSupabaseData(session.user.id);
          } else {
            setUser(null);
            setProfile(null);
            setAttributes(null);
            setInventory([]);
            setIsLoading(false);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Supabase is not configured, fall back to demo mode seamlessly
      setIsDemoMode(true);
      loadDemoData();
    }
  }, [isDemoMode, loadDemoData, loadSupabaseData]);

  const enterDemoMode = () => {
    setIsDemoMode(true);
    localStorage.setItem('questbound_is_demo', 'true');
    loadDemoData();
  };

  const signIn = async (email: string, password: string) => {
    if (isDemoMode) {
      enterDemoMode();
      return;
    }
    if (!supabase) throw new Error('Supabase client not initialized');

    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setIsLoading(false);
      throw error;
    }
    if (data.user) {
      setUser({ id: data.user.id, email: data.user.email || '' });
      await loadSupabaseData(data.user.id);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    if (isDemoMode) {
      enterDemoMode();
      return;
    }
    if (!supabase) throw new Error('Supabase client not initialized');

    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0],
          username: email.split('@')[0] + '_' + Math.floor(Math.random() * 1000),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
        },
      },
    });

    if (error) {
      setIsLoading(false);
      throw error;
    }

    if (data.user) {
      setUser({ id: data.user.id, email: data.user.email || '' });
      await loadSupabaseData(data.user.id);
    }
  };

  const signOut = async () => {
    if (isDemoMode) {
      localStorage.removeItem('questbound_is_demo');
      setIsDemoMode(false);
      setUser(null);
      setProfile(null);
      setAttributes(null);
      setInventory([]);
      return;
    }
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setAttributes(null);
    setInventory([]);
  };

  const equipItem = async (itemId: string) => {
    if (isDemoMode) {
      const updatedInv = localDb.toggleEquipItem(itemId);
      setInventory(updatedInv);
      return;
    }

    if (supabase && user) {
      // Find item details to know what type it is
      const targetItem = inventory.find((i) => i.item_id === itemId)?.item;
      if (!targetItem) return;

      const currentEquippedState = inventory.find((i) => i.item_id === itemId)?.equipped;

      // Unequip any existing item of same type
      for (const inv of inventory) {
        if (inv.item?.item_type === targetItem.item_type && inv.equipped) {
          await supabase
            .from('inventory')
            .update({ equipped: false })
            .match({ user_id: user.id, item_id: inv.item_id });
        }
      }

      // Toggle new item
      await supabase
        .from('inventory')
        .update({ equipped: !currentEquippedState })
        .match({ user_id: user.id, item_id: itemId });

      await refreshProfile();
    }
  };

  // Compute currently equipped cosmetics
  const equippedTheme =
    inventory.find((inv) => inv.equipped && (inv.item?.item_type === 'theme' || SEED_SHOP_ITEMS.find((s) => s.id === inv.item_id)?.item_type === 'theme'))?.item ||
    SEED_SHOP_ITEMS[0];

  const equippedBadge =
    inventory.find((inv) => inv.equipped && (inv.item?.item_type === 'badge' || SEED_SHOP_ITEMS.find((s) => s.id === inv.item_id)?.item_type === 'badge'))?.item ||
    null;

  const equippedFrame =
    inventory.find((inv) => inv.equipped && (inv.item?.item_type === 'avatar_frame' || SEED_SHOP_ITEMS.find((s) => s.id === inv.item_id)?.item_type === 'avatar_frame'))?.item ||
    null;

  const equippedEffect =
    inventory.find((inv) => inv.equipped && (inv.item?.item_type === 'effect' || SEED_SHOP_ITEMS.find((s) => s.id === inv.item_id)?.item_type === 'effect'))?.item ||
    null;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        attributes,
        inventory,
        equippedTheme,
        equippedBadge,
        equippedFrame,
        equippedEffect,
        isLoading,
        isDemoMode,
        signIn,
        signUp,
        signOut,
        enterDemoMode,
        refreshProfile,
        equipItem,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
