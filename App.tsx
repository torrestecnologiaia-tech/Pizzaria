import { supabase } from "./lib/supabase";

import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import CategoryBar from './components/CategoryBar';
import CartModal from './components/CartModal';
import AdminModal from './components/AdminModal';
import { products as initialProducts, categories } from './data';
import { Product, CartItem, Category, Addon, AppSettings } from './types';

const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('Pizzas');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('hott_rossi_settings', JSON.stringify(settings));
    if (!loading) {
      supabase.from("settings").upsert({ ...settings, id: 1 }).then(({ error }) => {
        if (error) console.error("Error syncing settings:", error);
      });
    }
  }, [settings, loading]);

  const filteredProducts = useMemo(() => {
    let result = allProducts;
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      result = result.filter(p => p.category === selectedCategory);
    }
    return result;
  }, [selectedCategory, searchQuery, allProducts]);

  const highlightProducts = useMemo(() => {
    return allProducts.filter(p => p.isPromo || p.isBestSeller);
  }, [allProducts]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  return (
    <div className="relative flex min-h-screen w-full flex-col pb-32 overflow-x-hidden">
      {settings.promoBanner && (
        <div className="bg-primary py-2 px-4 text-center">
          <p className="text-[10px] font-black uppercase text-white tracking-[0.2em] animate-pulse">
            {settings.promoBanner}
          </p>
        </div>
      )}

      <Header 
        searchActive={searchActive} 
        onSearchClick={() => {
            setSearchActive(!searchActive);
            if(searchActive) setSearchQuery('');
        }}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        settings={settings}
      />
      
      <button 
        onClick={() => setIsAdminOpen(true)}
        className="fixed top-28 right-4 z-30 w-10 h-10 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center text-white/40 hover:text-primary border border-white/10"
      >
        <span className="material-symbols-outlined text-sm">shield_person</span>
      </button>

      {!searchActive && (
        <CategoryBar 
          categories={categories} 
          selected={selectedCategory} 
          onSelect={setSelectedCategory} 
        />
      )}

      <main className="flex flex-col gap-8 pt-4">
        {!searchQuery && !searchActive && highlightProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between px-4 mb-3">
              <h2 className="text-neutral-900 dark:text-white text-lg font-bold">Destaques</h2>
            </div>
            <div className="flex overflow-x-auto hide-scrollbar px-4 gap-4 snap-x snap-mandatory">
              {highlightProducts.map((p) => (
                <div key={p.id} onClick={() => addToCart(p)} className="snap-center shrink-0 w-[85vw] md:w-[320px] rounded-2xl overflow-hidden relative group cursor-pointer active:scale-95 transition-transform">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                  <div className="w-full aspect-[16/9] bg-cover bg-center" style={{ backgroundImage: `url(${p.imageUrl})` }} />
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                    {p.promoText && (
                      <span className={`inline-block px-2 py-0.5 rounded text-white text-[10px] font-bold uppercase tracking-wider mb-1 ${p.isPromo ? 'bg-primary' : 'bg-orange-500'}`}>
                        {p.promoText}
                      </span>
                    )}
                    <h3 className="text-white text-xl font-bold leading-tight">{p.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="px-4">
          <h3 className="text-neutral-900 dark:text-white text-xl font-bold mb-4">
            {searchQuery ? `Resultados para "${searchQuery}"` : selectedCategory}
          </h3>
          <div className={selectedCategory === 'Bebidas' ? "grid grid-cols-2 gap-4" : "flex flex-col gap-6"}>
            {filteredProducts.map((product) => (
              <div key={product.id} className="flex gap-4 group cursor-pointer" onClick={() => addToCart(product)}>
                <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-surface-dark">
                  <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${product.imageUrl})` }} />
                </div>
                <div className="flex flex-1 flex-col justify-between py-1">
                  <div>
                    <h4 className="text-neutral-900 dark:text-white font-bold text-base">{product.name}</h4>
                    <p className="text-neutral-500 dark:text-gray-400 text-xs mt-1 line-clamp-2">{product.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-primary font-bold text-base">R$ {product.price.toFixed(2).replace('.', ',')}</span>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-dark text-white hover:bg-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50 bg-gradient-to-t from-background-dark pt-8">
          <button onClick={() => setIsCartOpen(true)} className="w-full bg-primary text-white rounded-xl h-14 px-5 flex items-center justify-between shadow-lg active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center bg-black/20 rounded-full h-8 w-8"><span className="text-sm font-bold">{cartCount}</span></div>
              <span className="font-bold">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
            </div>
            <span className="font-bold text-sm uppercase">Ver Carrinho</span>
          </button>
        </div>
      )}

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onUpdateQuantity={updateCartQuantity} total={cartTotal} settings={settings} />
      <AdminModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} products={allProducts} addons={allAddons} settings={settings} onUpdateProducts={setAllProducts} onUpdateAddons={setAllAddons} onUpdateSettings={setSettings} />
    </div>
  );
};

export default App;
