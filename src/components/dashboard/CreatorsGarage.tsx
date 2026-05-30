'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Camera, Sliders, Plus, Trash2, ShoppingCart,
  Package, Tag, ChevronDown, ChevronUp
} from 'lucide-react';

interface GearItem {
  id: string;
  _id?: string;
  name: string;
  category: 'camera' | 'lens' | 'lighting' | 'audio';
  image: string;
  buyPrice: number;
  rentRate: number;
}

const formatPrice = (p: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(p);

const CATEGORY_ICONS: Record<string, string> = {
  camera: '📷',
  lens: '🔭',
  lighting: '💡',
  audio: '🎙️',
};

export default function CreatorsGarage() {
  const [inventory, setInventory] = useState<GearItem[]>([]);
  const [garageItems, setGarageItems] = useState<GearItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [rentToggle, setRentToggle] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'camera' as GearItem['category'],
    buyPrice: 0,
    rentRate: 0,
  });

  useEffect(() => {
    const loadGear = async () => {
      try {
        const res = await fetch('/api/studio/gear');
        if (res.ok) {
          const data = await res.json();
          const normalized: GearItem[] = data.map((g: any) => ({
            ...g,
            id: g.id || g._id || '',
          }));
          setInventory(normalized);
          // Pre-fill garage with first 2 items for demo
          setGarageItems(normalized.slice(0, 2));
        }
      } catch (err) {
        console.warn('[CreatorsGarage] API unavailable:', err);
      } finally {
        setLoading(false);
      }
    };
    loadGear();
  }, []);

  const toggleGarageItem = (item: GearItem) => {
    setGarageItems(prev =>
      prev.some(x => x.id === item.id)
        ? prev.filter(x => x.id !== item.id)
        : [...prev, item]
    );
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || newItem.buyPrice <= 0) return;

    const created: GearItem = {
      id: `gear-${Date.now()}`,
      name: newItem.name,
      category: newItem.category,
      image: '/assets/product-camera.png',
      buyPrice: newItem.buyPrice,
      rentRate: newItem.rentRate || Math.round(newItem.buyPrice * 0.01),
    };
    setInventory(prev => [created, ...prev]);
    setNewItem({ name: '', category: 'camera', buyPrice: 0, rentRate: 0 });
    setShowAddForm(false);

    window.dispatchEvent(
      new CustomEvent('nira_notification', {
        detail: {
          type: 'push',
          title: '📦 Gear Added to Garage',
          content: `"${created.name}" has been added to your equipment inventory.`,
        },
      })
    );
  };

  const handleRemoveFromInventory = (id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id));
    setGarageItems(prev => prev.filter(i => i.id !== id));
  };

  const handleCheckout = () => {
    const total = rentToggle ? garageRentTotal : garageBuyTotal;
    window.dispatchEvent(
      new CustomEvent('nira_notification', {
        detail: {
          type: 'push',
          title: '🛒 Setup Order Compiled!',
          content: `Your Creator setup package totaling ${formatPrice(total)} is ready for checkout.`,
        },
      })
    );
  };

  const filteredInventory =
    activeCategory === 'all'
      ? inventory
      : inventory.filter(i => i.category === activeCategory);

  const garageBuyTotal = garageItems.reduce((sum, item) => sum + item.buyPrice, 0);
  const garageRentTotal = garageItems.reduce((sum, item) => sum + item.rentRate, 0) * 7;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-nira-gray-dark p-8 text-center">
        <Camera className="w-6 h-6 text-nira-text-secondary mx-auto animate-pulse mb-2" />
        <p className="text-xs text-nira-text-secondary">Loading your garage...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Equipment Inventory */}
      <div className="bg-white rounded-2xl shadow-sm border border-nira-gray-dark overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-sm font-black text-nira-dark uppercase tracking-wide flex items-center gap-2">
            <Package className="w-4 h-4 text-nira-yellow" /> My Gear Inventory
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-nira-gray text-nira-dark px-2 py-0.5 rounded-full border border-nira-gray-dark">
              {inventory.length} Items
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-1.5 bg-nira-yellow text-nira-dark rounded-lg hover:bg-nira-yellow/80 transition-colors cursor-pointer"
              aria-label="Add new gear"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Add Gear Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <form
                onSubmit={handleAddItem}
                className="p-5 bg-nira-gray/50 border-b border-nira-gray-dark space-y-3"
              >
                <h3 className="text-[10px] font-black text-nira-dark uppercase tracking-wider">
                  Add Equipment to Your Garage
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-nira-text-secondary uppercase block mb-1">
                      Equipment Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newItem.name}
                      onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="Sony FX6 Cinema Camera"
                      className="w-full px-3 py-2 bg-white border border-nira-gray-dark rounded-lg text-xs text-nira-dark focus:outline-none focus:border-nira-yellow"
                      aria-label="Equipment name"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-nira-text-secondary uppercase block mb-1">
                      Category
                    </label>
                    <select
                      value={newItem.category}
                      onChange={e =>
                        setNewItem({
                          ...newItem,
                          category: e.target.value as GearItem['category'],
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-nira-gray-dark rounded-lg text-xs text-nira-dark focus:outline-none focus:border-nira-yellow cursor-pointer"
                      aria-label="Equipment category"
                    >
                      <option value="camera">Camera</option>
                      <option value="lens">Lens</option>
                      <option value="lighting">Lighting</option>
                      <option value="audio">Audio</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-nira-text-secondary uppercase block mb-1">
                      Buy Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={newItem.buyPrice || ''}
                      onChange={e =>
                        setNewItem({ ...newItem, buyPrice: Number(e.target.value) })
                      }
                      placeholder="295000"
                      className="w-full px-3 py-2 bg-white border border-nira-gray-dark rounded-lg text-xs text-nira-dark focus:outline-none focus:border-nira-yellow"
                      aria-label="Buy price"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-nira-text-secondary uppercase block mb-1">
                      Rent Rate (₹/day)
                    </label>
                    <input
                      type="number"
                      value={newItem.rentRate || ''}
                      onChange={e =>
                        setNewItem({ ...newItem, rentRate: Number(e.target.value) })
                      }
                      placeholder="2500"
                      className="w-full px-3 py-2 bg-white border border-nira-gray-dark rounded-lg text-xs text-nira-dark focus:outline-none focus:border-nira-yellow"
                      aria-label="Rent rate per day"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-nira-dark hover:bg-nira-yellow hover:text-nira-dark text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                  >
                    Add to Garage
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-white border border-nira-gray-dark text-nira-text-secondary font-bold text-[10px] uppercase tracking-wider rounded-lg hover:bg-nira-gray transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Filter */}
        <div className="flex gap-2 p-4 overflow-x-auto border-b border-gray-100">
          {['all', 'camera', 'lens', 'lighting', 'audio'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                activeCategory === cat
                  ? 'bg-nira-dark text-white border-nira-dark'
                  : 'bg-white text-nira-text-secondary border-nira-gray-dark hover:border-nira-dark'
              }`}
            >
              {cat === 'all' ? 'All Gear' : `${CATEGORY_ICONS[cat] || ''} ${cat}`}
            </button>
          ))}
        </div>

        {/* Inventory Grid */}
        <div className="p-5">
          {filteredInventory.length === 0 ? (
            <div className="text-center py-10">
              <Camera className="w-8 h-8 text-nira-text-secondary/30 mx-auto mb-3" />
              <p className="text-xs text-nira-text-secondary font-bold">No gear found</p>
              <p className="text-[10px] text-nira-text-secondary mt-1">
                Add equipment to your garage to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredInventory.map(item => {
                const isInGarage = garageItems.some(x => x.id === item.id);
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                      isInGarage
                        ? 'border-nira-yellow bg-nira-yellow/5 shadow-sm'
                        : 'border-nira-gray-dark bg-nira-gray hover:border-neutral-300'
                    }`}
                  >
                    <div className="w-12 h-12 relative bg-white rounded-lg p-1 flex items-center justify-center shrink-0 border border-nira-gray-dark">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={40}
                        height={40}
                        unoptimized
                        className="object-contain max-h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-nira-dark truncate">
                        {item.name}
                      </h4>
                      <p className="text-[9px] font-bold text-nira-text-secondary uppercase mt-0.5">
                        {item.category} • {formatPrice(item.rentRate)}/day
                      </p>
                      <p className="text-[10px] font-black text-nira-dark mt-0.5">
                        {formatPrice(item.buyPrice)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={() => toggleGarageItem(item)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer text-xs font-bold ${
                          isInGarage
                            ? 'bg-nira-yellow text-nira-dark'
                            : 'bg-nira-gray-dark text-nira-text-secondary hover:bg-neutral-300'
                        }`}
                        aria-label={isInGarage ? 'Remove from setup' : 'Add to setup'}
                        title={isInGarage ? 'Remove from setup' : 'Add to setup'}
                      >
                        {isInGarage ? '✓' : '+'}
                      </button>
                      <button
                        onClick={() => handleRemoveFromInventory(item.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                        aria-label="Delete gear"
                        title="Delete from inventory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Active Garage Setup Canvas */}
      <div className="bg-white rounded-2xl shadow-sm border border-nira-gray-dark overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-sm font-black text-nira-dark uppercase tracking-wide flex items-center gap-2">
            <Sliders className="w-4 h-4 text-nira-yellow" /> My Workspace Setup
          </h2>
          <span className="text-[10px] font-bold bg-nira-yellow/20 text-nira-dark px-2 py-0.5 rounded-full border border-nira-yellow/30">
            {garageItems.length} Active Slots
          </span>
        </div>

        <div className="p-5">
          {garageItems.length === 0 ? (
            <div className="text-center py-10">
              <Sliders className="w-8 h-8 text-nira-text-secondary/30 mx-auto mb-3" />
              <p className="text-xs text-nira-text-secondary font-bold">
                No gear in your workspace
              </p>
              <p className="text-[10px] text-nira-text-secondary mt-1">
                Click the + button on any gear item above to add it to your workspace setup.
              </p>
            </div>
          ) : (
            <>
              {/* Setup Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-nira-gray p-4 rounded-xl border border-nira-gray-dark mb-5">
                {garageItems.map(item => (
                  <div
                    key={item.id}
                    className="bg-white border border-nira-gray-dark p-3 rounded-xl flex flex-col items-center text-center relative group"
                  >
                    <button
                      onClick={() => toggleGarageItem(item)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                      aria-label="Remove from workspace"
                    >
                      ✕
                    </button>
                    <div className="w-12 h-12 relative bg-nira-gray rounded-lg p-1.5 mb-2 flex items-center justify-center">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={40}
                        height={40}
                        unoptimized
                        className="object-contain max-h-full"
                      />
                    </div>
                    <p className="text-[9px] font-bold text-nira-dark truncate w-full">
                      {item.name}
                    </p>
                    <span className="text-[8px] text-nira-text-secondary capitalize">
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing & Checkout */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-nira-gray-dark">
                {/* Buy/Rent Toggle */}
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold transition-all ${
                      !rentToggle ? 'text-nira-dark' : 'text-nira-text-secondary'
                    }`}
                  >
                    Buy Outright
                  </span>
                  <button
                    onClick={() => setRentToggle(!rentToggle)}
                    className="w-12 h-6 bg-nira-gray rounded-full p-1 transition-all relative flex items-center border border-nira-gray-dark cursor-pointer"
                    aria-label="Toggle buy or rent pricing"
                  >
                    <motion.div
                      layout
                      className="w-4 h-4 bg-nira-yellow rounded-full shadow-sm"
                      animate={{ x: rentToggle ? 22 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                  <span
                    className={`text-[10px] font-bold transition-all ${
                      rentToggle ? 'text-nira-dark' : 'text-nira-text-secondary'
                    }`}
                  >
                    Rent (1 Week)
                  </span>
                </div>

                {/* Total */}
                <div className="text-center sm:text-right">
                  <p className="text-[9px] text-nira-text-secondary uppercase font-black tracking-wider">
                    Calculated Total
                  </p>
                  <h4 className="font-heading font-black text-2xl text-nira-dark mt-0.5">
                    {rentToggle
                      ? formatPrice(garageRentTotal)
                      : formatPrice(garageBuyTotal)}
                  </h4>
                  <p className="text-[8px] text-nira-text-secondary">
                    {rentToggle
                      ? 'For 7 days rental plan'
                      : 'Including standard warranty'}
                  </p>
                </div>
              </div>

              <button
                disabled={garageItems.length === 0}
                onClick={handleCheckout}
                className="w-full mt-5 py-3.5 bg-nira-dark hover:bg-nira-yellow hover:text-nira-dark text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" /> Deploy Workspace & Checkout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
