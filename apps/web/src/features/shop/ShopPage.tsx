import React, { useState, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ShopItem, ItemType } from '../../lib/types';
import { SEED_SHOP_ITEMS, supabase, localDb } from '../../lib/supabase';
import { Button } from '../../components/Button';
import { useAnnounce } from '../../components/Announcer';
import { sound } from '../../lib/sound';
import {
  Store,
  Coins,
  Shield,
  Palette,
  Award,
  Sparkles,
  Check,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const ShopPage: React.FC = () => {
  const { profile, inventory, refreshProfile, equipItem, isDemoMode, user } = useAuth();
  const { toast, announce } = useAnnounce();

  const [filterType, setFilterType] = useState<string>('all');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const ownedItemIds = useMemo(() => {
    return new Set(inventory.map((inv) => inv.item_id));
  }, [inventory]);

  const equippedItemIds = useMemo(() => {
    return new Set(inventory.filter((inv) => inv.equipped).map((inv) => inv.item_id));
  }, [inventory]);

  const filteredItems = useMemo(() => {
    if (filterType === 'all') return SEED_SHOP_ITEMS;
    return SEED_SHOP_ITEMS.filter((item) => item.item_type === filterType);
  }, [filterType]);

  const handlePurchase = async (item: ShopItem) => {
    if (purchasingId) return;

    if ((profile?.gold ?? 0) < item.price) {
      sound.playClick();
      toast(`Insufficient Gold! Requires ${item.price} Gold, but you possess ${profile?.gold ?? 0}.`, 'error');
      announce(`Cannot acquire ${item.name}. Insufficient gold.`, 'assertive');
      return;
    }

    setPurchasingId(item.id);
    try {
      if (isDemoMode) {
        localDb.purchaseItem(item.id);
      } else if (supabase && user) {
        const { error: rpcErr } = await supabase.rpc('purchase_item', {
          p_item_id: item.id,
        });
        if (rpcErr) throw rpcErr;
      }

      sound.playPurchase();
      await refreshProfile();
      toast(`Acquired ${item.name}! Added to your guild vault.`, 'gold');
      announce(`Successfully purchased ${item.name}`, 'polite');
    } catch (err: any) {
      toast(err.message || 'Purchase transaction failed', 'error');
    } finally {
      setPurchasingId(null);
    }
  };

  const handleEquipToggle = async (item: ShopItem) => {
    sound.playClick();
    await equipItem(item.id);
    const isNowEquipped = !equippedItemIds.has(item.id);
    toast(isNowEquipped ? `Equipped ${item.name}` : `Unequipped ${item.name}`, 'info');
  };

  const getItemTypeIcon = (type: ItemType) => {
    switch (type) {
      case 'theme':
        return <Palette className="w-4 h-4 text-cyan-400" />;
      case 'badge':
        return <Award className="w-4 h-4 text-amber-400" />;
      case 'avatar_frame':
        return <Shield className="w-4 h-4 text-purple-400" />;
      case 'effect':
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      default:
        return <Store className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Guild Emporium</span>
          </h2>
          <p className="text-xs text-slate-400">
            Exchange your hard-earned Gold for prestigious titles, ornate frames, and hall themes.
          </p>
        </div>

        {/* Current Gold Pill */}
        <div className="flex items-center space-x-2 bg-surface-card px-4 py-2 rounded-2xl border border-amber-400/40 text-amber-300 shadow-gold-glow self-start sm:self-auto">
          <Coins className="w-5 h-5 text-amber-400 fill-amber-400/20" />
          <span className="font-serif font-extrabold text-sm">
            {profile?.gold ?? 0} Gold Available
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-surface-border space-x-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Relics' },
          { id: 'theme', label: 'Hall Themes' },
          { id: 'badge', label: 'Honor Badges' },
          { id: 'avatar_frame', label: 'Avatar Frames' },
          { id: 'effect', label: 'Celebrations' },
        ].map((tab) => {
          const isActive = filterType === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                sound.playClick();
                setFilterType(tab.id);
              }}
              className={`py-2 px-3 text-xs font-semibold rounded-t-lg transition border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-amber-400 text-amber-300 bg-surface-light/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Item Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isOwned = ownedItemIds.has(item.id);
          const isEquipped = equippedItemIds.has(item.id);
          const canAfford = (profile?.gold ?? 0) >= item.price;
          const isPurchasing = purchasingId === item.id;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition duration-200 transform hover:-translate-y-1 ${
                isEquipped
                  ? 'bg-surface/90 border-cyan-400/60 shadow-moonlit'
                  : isOwned
                  ? 'bg-surface border-surface-border shadow-card'
                  : 'bg-surface/70 border-surface-border shadow-card hover:border-amber-500/40'
              }`}
            >
              <div>
                {/* Item Type & Status Tag */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 uppercase tracking-wider">
                    {getItemTypeIcon(item.item_type)}
                    <span className="text-[10px] font-semibold">{item.item_type.replace('_', ' ')}</span>
                  </div>

                  {isEquipped ? (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                      <Check className="w-3 h-3" />
                      <span>Equipped</span>
                    </span>
                  ) : isOwned ? (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-light text-slate-300 border border-surface-border">
                      <CheckCircle2 className="w-3 h-3 text-slate-400" />
                      <span>Vaulted</span>
                    </span>
                  ) : (
                    <div className="flex items-center space-x-1 text-amber-400 font-bold text-xs">
                      <Coins className="w-3.5 h-3.5" />
                      <span>{item.price} Gold</span>
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3 className="font-serif text-base font-bold text-slate-100 mb-1">
                  {item.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {item.description}
                </p>

                {/* Cosmetic Preview Box */}
                {item.item_type === 'avatar_frame' && (
                  <div className="py-2 flex items-center justify-center mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-serif text-sm font-bold text-cyan-300 bg-surface-light"
                      style={{
                        border: `2px solid ${item.metadata.borderColor || '#6ee7f9'}`,
                        boxShadow: item.metadata.glow || 'none',
                      }}
                    >
                      A
                    </div>
                  </div>
                )}

                {item.item_type === 'theme' && (
                  <div className="flex items-center space-x-2 py-2 mb-3">
                    <span
                      className="w-5 h-5 rounded-full border border-surface-border"
                      style={{ backgroundColor: item.metadata.primaryColor }}
                    />
                    <span
                      className="w-5 h-5 rounded-full border border-surface-border"
                      style={{ backgroundColor: item.metadata.bgColor }}
                    />
                    <span className="text-[10px] text-slate-400">Palette Preview</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-surface-border mt-auto">
                {isEquipped ? (
                  <Button
                    onClick={() => handleEquipToggle(item)}
                    variant="secondary"
                    size="sm"
                    className="w-full"
                  >
                    <span>Unequip</span>
                  </Button>
                ) : isOwned ? (
                  <Button
                    onClick={() => handleEquipToggle(item)}
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    <span>Equip Relic</span>
                  </Button>
                ) : (
                  <Button
                    onClick={() => handlePurchase(item)}
                    variant={canAfford ? 'gold' : 'secondary'}
                    size="sm"
                    className="w-full"
                    disabled={!canAfford || isPurchasing}
                    isLoading={isPurchasing}
                  >
                    {canAfford ? (
                      <span className="flex items-center space-x-1.5">
                        <Coins className="w-3.5 h-3.5" />
                        <span>Acquire for {item.price} Gold</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1.5 text-slate-400">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Need {item.price - (profile?.gold ?? 0)} More Gold</span>
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
