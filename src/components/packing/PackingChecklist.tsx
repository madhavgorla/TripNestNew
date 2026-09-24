import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Shirt,
  FileCheck,
  HeartPulse,
  Laptop,
  Compass,
  Tag,
  Star,
  CloudSun,
  ShieldCheck,
  ChevronDown,
  X,
  ListFilter,
  RotateCcw,
} from 'lucide-react';
import { Trip, ItineraryDay, DestinationWeather, PackingItem, PackingCategory } from '../../types';
import { generateSmartPackingList } from '../../services/packingGenerator';

interface PackingChecklistProps {
  trip: Trip;
  itineraryDays: ItineraryDay[];
  weatherData?: DestinationWeather | null;
  onRefreshWeather?: () => void;
}

export const PackingChecklist: React.FC<PackingChecklistProps> = ({
  trip,
  itineraryDays,
  weatherData,
  onRefreshWeather,
}) => {
  const storageKey = `tripnest_packing_${trip.id}`;

  const [items, setItems] = useState<PackingItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading stored packing list:', e);
    }
    // Default initial seed
    return generateSmartPackingList(trip, itineraryDays, weatherData || null);
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unpacked' | 'packed' | 'essential'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<PackingCategory>('Essentials & Documents');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemReason, setNewItemReason] = useState('');
  const [newItemIsEssential, setNewItemIsEssential] = useState(false);

  // Save to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving packing list:', e);
    }
  }, [items, storageKey]);

  // Handler to toggle an item's packed status
  const toggleItemPacked = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isPacked: !item.isPacked } : item
      )
    );
  };

  // Adjust quantity
  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  // Delete an item
  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Reset or Regenerate packing list from weather & activities
  const handleRegenerate = (preserveCustom: boolean = true) => {
    if (confirm('Regenerate packing list based on the latest destination climate and scheduled activities?')) {
      const generated = generateSmartPackingList(trip, itineraryDays, weatherData || null);
      if (preserveCustom) {
        const customItems = items.filter((i) => i.custom);
        setItems([...generated, ...customItems]);
      } else {
        setItems(generated);
      }
    }
  };

  // Mark all packed or unpacked
  const setAllPackedState = (packed: boolean) => {
    setItems((prev) => prev.map((item) => ({ ...item, isPacked: packed })));
  };

  // Add a new custom item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: PackingItem = {
      id: `pack-${trip.id}-custom-${Date.now()}`,
      tripId: trip.id,
      name: newItemName.trim(),
      category: newItemCategory,
      quantity: newItemQuantity,
      reason: newItemReason.trim() || undefined,
      isEssential: newItemIsEssential,
      isPacked: false,
      custom: true,
    };

    setItems((prev) => [newItem, ...prev]);
    setNewItemName('');
    setNewItemQuantity(1);
    setNewItemReason('');
    setNewItemIsEssential(false);
    setIsAddModalOpen(false);
  };

  // Metrics computation
  const totalItems = items.length;
  const packedItems = items.filter((i) => i.isPacked).length;
  const percentage = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;
  const essentialCount = items.filter((i) => i.isEssential).length;
  const essentialPacked = items.filter((i) => i.isEssential && i.isPacked).length;

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (filterMode === 'unpacked' && item.isPacked) return false;
      if (filterMode === 'packed' && !item.isPacked) return false;
      if (filterMode === 'essential' && !item.isEssential) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.reason && item.reason.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [items, selectedCategory, filterMode, searchQuery]);

  // Group filtered items by category
  const categoriesList: PackingCategory[] = [
    'Essentials & Documents',
    'Clothing & Apparel',
    'Toiletries & Health',
    'Electronics & Tech',
    'Activity Gear',
    'Custom',
  ];

  const groupedItems = useMemo(() => {
    const map: Record<string, PackingItem[]> = {};
    filteredItems.forEach((item) => {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    });
    return map;
  }, [filteredItems]);

  const getCategoryIcon = (category: PackingCategory | string) => {
    switch (category) {
      case 'Essentials & Documents':
        return <FileCheck className="w-4 h-4 text-rose-500" />;
      case 'Clothing & Apparel':
        return <Shirt className="w-4 h-4 text-sky-500" />;
      case 'Toiletries & Health':
        return <HeartPulse className="w-4 h-4 text-emerald-500" />;
      case 'Electronics & Tech':
        return <Laptop className="w-4 h-4 text-purple-500" />;
      case 'Activity Gear':
        return <Compass className="w-4 h-4 text-amber-500" />;
      default:
        return <Tag className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Progress & Climate Hero Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-indigo-50/20 to-sky-50/30 p-6 shadow-xs dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Title & Climate Highlights */}
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-600 text-white shadow-xs">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                  <span>Smart Packing Checklist</span>
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                    Climate & Activity Aware
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Curated checklist tailored for {trip.destination} ({itineraryDays.length} days)
                </p>
              </div>
            </div>

            {/* Weather & Activity context pill */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              {weatherData && (
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-sky-100 bg-sky-50/80 px-2.5 py-1 text-sky-800 dark:border-sky-900/40 dark:bg-sky-950/40 dark:text-sky-300 font-medium">
                  <CloudSun className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    {weatherData.currentTemp}°C • {weatherData.condition}
                    {weatherData.precipitationChance ? ` • ${weatherData.precipitationChance}% Rain` : ''}
                  </span>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-100 bg-indigo-50/80 px-2.5 py-1 text-indigo-800 dark:border-indigo-900/40 dark:bg-indigo-950/40 dark:text-indigo-300 font-medium">
                <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>
                  {itineraryDays.reduce((acc, d) => acc + (d.activities?.length || 0), 0)} Scheduled Activities
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50/80 px-2.5 py-1 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>
                  {essentialPacked} of {essentialCount} Essentials Ready
                </span>
              </span>
            </div>
          </div>

          {/* Right: Progress Meter & Quick Action Buttons */}
          <div className="w-full md:w-72 rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-800/60 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-600 dark:text-slate-300">Packing Progress</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                {packedItems} / {totalItems} ({percentage}%)
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden mb-3">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  percentage === 100
                    ? 'bg-emerald-500'
                    : percentage > 50
                    ? 'bg-indigo-600'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>

              <button
                type="button"
                onClick={() => handleRegenerate(true)}
                className="flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Regenerate AI recommendations"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </button>

              <button
                type="button"
                onClick={() => setAllPackedState(percentage < 100)}
                className="flex items-center justify-center px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 text-xs font-medium transition-colors cursor-pointer"
                title={percentage === 100 ? 'Unpack all' : 'Pack all'}
              >
                {percentage === 100 ? 'Unpack All' : 'Pack All'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter & Category Tabs Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items, notes, or gear..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Toggle */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium dark:border-slate-800 dark:bg-slate-900 self-start sm:self-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
              filterMode === 'all'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setFilterMode('unpacked')}
            className={`rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
              filterMode === 'unpacked'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Unpacked ({items.length - packedItems})
          </button>
          <button
            onClick={() => setFilterMode('packed')}
            className={`rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
              filterMode === 'packed'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Packed ({packedItems})
          </button>
          <button
            onClick={() => setFilterMode('essential')}
            className={`rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
              filterMode === 'essential'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Essentials ({essentialCount})
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium shrink-0 transition-colors cursor-pointer border ${
            selectedCategory === 'All'
              ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold'
              : 'border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
          }`}
        >
          <span>All Categories</span>
          <span className="text-[10px] opacity-70 font-mono">({items.length})</span>
        </button>

        {categoriesList.map((cat) => {
          const count = items.filter((i) => i.category === cat).length;
          if (count === 0 && cat === 'Custom') return null;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium shrink-0 transition-colors cursor-pointer border ${
                selectedCategory === cat
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold'
                  : 'border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
              }`}
            >
              {getCategoryIcon(cat)}
              <span>{cat}</span>
              <span className="text-[10px] opacity-70 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* 3. Items Grouped Sections */}
      {filteredItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 mx-auto mb-3">
            <CheckSquare className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No packing items found
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No items match "${searchQuery}". Try clearing your search.`
              : 'No items in this filter view. Add a custom item or reset to recommendations.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setFilterMode('all');
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, catItems]) => {
            const catPacked = catItems.filter((i) => i.isPacked).length;

            return (
              <div
                key={category}
                className="rounded-2xl border border-slate-200/80 bg-white p-4.5 dark:border-slate-800 dark:bg-slate-900 shadow-xs"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                      {getCategoryIcon(category as PackingCategory)}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {category}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                      {catPacked} / {catItems.length} packed
                    </span>
                    <button
                      onClick={() => {
                        setNewItemCategory(category as PackingCategory);
                        setIsAddModalOpen(true);
                      }}
                      className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  {catItems.map((item) => {
                    return (
                      <div
                        key={item.id}
                        className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
                          item.isPacked
                            ? 'border-slate-100 bg-slate-50/60 dark:border-slate-800/40 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500'
                            : 'border-slate-200/70 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {/* Checkbox and Item Name */}
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => toggleItemPacked(item.id)}
                            className="mt-0.5 shrink-0 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-transform active:scale-95 cursor-pointer"
                          >
                            {item.isPacked ? (
                              <CheckSquare className="w-5 h-5 fill-indigo-600/10 dark:fill-indigo-400/20" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                onClick={() => toggleItemPacked(item.id)}
                                className={`text-xs font-semibold cursor-pointer select-none ${
                                  item.isPacked ? 'line-through text-slate-400 dark:text-slate-500' : ''
                                }`}
                              >
                                {item.name}
                              </span>

                              {item.isEssential && (
                                <span className="inline-flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.2 text-[9px] font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                  <span>Essential</span>
                                </span>
                              )}

                              {item.custom && (
                                <span className="rounded bg-indigo-50 px-1.5 py-0.2 text-[9px] font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                                  Custom
                                </span>
                              )}
                            </div>

                            {item.reason && (
                              <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-500/80 shrink-0" />
                                <span>{item.reason}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Quantity and Controls */}
                        <div className="flex items-center gap-3 shrink-0 ml-3">
                          {/* Quantity Switcher */}
                          <div className="flex items-center rounded-lg border border-slate-200/80 bg-slate-50 px-1 py-0.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-800">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="px-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer disabled:opacity-30"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="px-1.5 font-bold text-slate-800 dark:text-slate-200">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="px-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          {/* Delete Item */}
                          <button
                            type="button"
                            onClick={() => deleteItem(item.id)}
                            className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Add Custom Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Add Item to Packing List
                </h3>
                <p className="text-[11px] text-slate-400">
                  Custom item for {trip.destination}
                </p>
              </div>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scuba diving mask, Travel journal, Extra memory card"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as PackingCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason or Context Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Recommended for catamaran boat excursion"
                  value={newItemReason}
                  onChange={(e) => setNewItemReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="essentialCheckbox"
                  checked={newItemIsEssential}
                  onChange={(e) => setNewItemIsEssential(e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600 cursor-pointer"
                />
                <label
                  htmlFor="essentialCheckbox"
                  className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Mark as High-Priority / Essential Item
                </label>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Checklist</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
