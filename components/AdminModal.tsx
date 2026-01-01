import { supabase } from '../lib/supabase';
import { triggerGitHubSync } from "../lib/github";
import React, { useState, useRef } from 'react';
import { Product, Category, Addon, AppSettings } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  addons: Addon[];
  settings: AppSettings;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateAddons: (addons: Addon[]) => void;
  onUpdateSettings: (settings: AppSettings) => void;
}

const ADMIN_PASSWORD = "116289";
const CATEGORIES: Category[] = ["Pizzas", "Pastéis", "Combos", "Bebidas", "Sobremesas"];

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, products, addons, settings, onUpdateProducts, onUpdateAddons, onUpdateSettings }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'addons' | 'settings'>('products');
  const [editingAddonsFor, setEditingAddonsFor] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<{loading: boolean, error?: string, success?: boolean}>({ loading: false });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ 
    name: '',
    description: '',
    price: 0,
    category: 'Pizzas', 
    imageUrl: '', 
    addons: [] 
  });
  const [newAddon, setNewAddon] = useState<Partial<Addon>>({});
  const [inlineAddon, setInlineAddon] = useState<{name: string, price: string}>({ name: '', price: '' });

  if (!isOpen) return null;

  const handleSync = async () => {
    setSyncStatus({ loading: true });
    const result = await triggerGitHubSync();
    if (result.success) {
      setSyncStatus({ loading: false, success: true });
      setTimeout(() => setSyncStatus({ loading: false }), 3000);
    } else {
      setSyncStatus({ loading: false, error: result.error });
      setTimeout(() => setSyncStatus({ loading: false }), 5000);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Senha incorreta!");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'logo') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (target === 'product') {
          setNewProduct(prev => ({ ...prev, imageUrl: reader.result as string }));
        } else {
          const updated = { ...settings, logoUrl: reader.result as string }; 
          // Tentamos salvar nos dois formatos para garantir compatibilidade com qualquer schema
          const { error } = await supabase.from("settings").upsert({ 
              id: 1,
              shopName: updated.shopName,
              logoUrl: updated.logoUrl,
              logourl: updated.logoUrl, // Fallback p/ lowercase
              promoBanner: updated.promoBanner,
              whatsappNumber: updated.whatsappNumber
          });
          
          if (error) {
              console.error("ERRO COMPLETO AO SALVAR LOGO:", error);
              alert("Erro ao salvar logo. Verifique se você rodou o script SQL das permissões. Detalhe: " + error.message);
              return;
          }
          onUpdateSettings(updated); 
          handleSync();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleProductFlag = async (id: string, flag: 'isPromo' | 'isBestSeller') => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const newVal = !product[flag];
    const promoText = flag === 'isPromo' && newVal ? 'Promoção' : (flag === 'isBestSeller' && newVal ? 'Destaque' : product.promoText);
    
    const updateData: any = { promoText, promotext: promoText };
    if (flag === 'isPromo') { updateData.isPromo = newVal; updateData.ispromo = newVal; }
    if (flag === 'isBestSeller') { updateData.isBestSeller = newVal; updateData.isbestseller = newVal; }

    const { error } = await supabase.from("products").update(updateData).eq("id", id);
    if (error) {
        console.error("ERRO AO ATUALIZAR FLAG:", error);
        alert("Falha ao salvar. Você rodou o SQL de permissões? Erro: " + error.message);
        return;
    }
    
    onUpdateProducts(products.map(p => p.id === id ? { ...p, [flag]: newVal, promoText } : p));
    handleSync();
  };

  const updateProductCategory = async (id: string, newCategory: Category) => {
    const { error } = await supabase.from("products").update({ category: newCategory }).eq("id", id);
    if (error) {
        console.error("ERRO AO ATUALIZAR CATEGORIA:", error);
        alert("Erro Supabase: " + error.message);
        return;
    }
    onUpdateProducts(products.map(p => p.id === id ? { ...p, category: newCategory } : p));
    handleSync();
  };

  const toggleAddonForProduct = async (productId: string, addonId: string) => {
    const p = products.find(prod => prod.id === productId);
    if (!p) return;

    const currentAddons = p.addons || [];
    const newAddons = currentAddons.includes(addonId)
      ? currentAddons.filter(id => id !== addonId)
      : [...currentAddons, addonId];

    const { error } = await supabase.from("products").update({ addons: newAddons }).eq("id", productId);
    if (error) {
        console.error("ERRO AO VINCULAR ADICIONAL:", error);
        alert("Erro: " + error.message);
        return;
    }

    onUpdateProducts(products.map(prod => prod.id === productId ? { ...prod, addons: newAddons } : prod));
    handleSync();
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
        alert("Preencha ao menos Nome e Preço!");
        return;
    }
    const productData: any = {
      id: Date.now().toString(),
      name: newProduct.name,
      description: newProduct.description || '',
      price: Number(newProduct.price),
      category: newProduct.category as Category,
      imageUrl: newProduct.imageUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
      imageurl: newProduct.imageUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
      addons: []
    };
    
    console.log("Tentando inserir no Supabase:", productData);
    const { error } = await supabase.from("products").insert([productData]);
    
    if (error) {
        console.error("ERRO CRÍTICO AO INSERIR PRODUTO:", error);
        alert("PRODUTO NÃO FOI SALVO! Verifique se você executou o script SQL das permissões no Supabase. Erro: " + error.message);
        return;
    }

    console.log("Inserção bem sucedida!");
    handleSync();
    onUpdateProducts([...products, { ...productData as Product }]);
    
    setNewProduct({ 
        name: '',
        description: '',
        price: 0,
        category: 'Pizzas', 
        imageUrl: '', 
        addons: [] 
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeProduct = async (id: string) => {
    if (confirm("Deseja excluir este produto?")) {
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) {
            console.error("ERRO AO EXCLUIR:", error);
            alert("Erro ao excluir: " + error.message);
            return;
        }
        handleSync();
        onUpdateProducts(products.filter(p => p.id !== id));
    }
  };

  const addAddon = async () => {
    if (!newAddon.name || !newAddon.price) return;
    const addon = {
      id: Date.now().toString(),
      name: newAddon.name,
      price: Number(newAddon.price)
    };
    const { error } = await supabase.from("addons").insert([addon]);
    if (error) {
        console.error("ERRO AO CRIAR ADICIONAL:", error);
        alert("Erro: " + error.message);
        return;
    }
    handleSync();
    onUpdateAddons([...addons, addon]);
    setNewAddon({});
  };

  const removeAddon = async (id: string) => {
    if (confirm("Excluir este sub-produto?")) {
      const { error } = await supabase.from("addons").delete().eq("id", id);
      if (error) {
          console.error("ERRO AO EXCLUIR ADICIONAL:", error);
          alert("Erro: " + error.message);
          return;
      }
      handleSync();
      const updatedProducts = products.map(p => ({
          ...p,
          addons: p.addons?.filter(aid => aid !== id)
      }));
      onUpdateProducts(updatedProducts);
      onUpdateAddons(addons.filter(a => a.id !== id));
    }
  };

  const addInlineAddon = async (productId: string) => {
    if (!inlineAddon.name || !inlineAddon.price) {
        alert("Preencha Nome e Preço!");
        return;
    }
    const newId = Date.now().toString();
    const addon = {
      id: newId,
      name: inlineAddon.name,
      price: Number(inlineAddon.price)
    };
    
    const { error: addonError } = await supabase.from("addons").insert([addon]);
    if (addonError) {
        console.error("ERRO AO CRIAR ADICIONAL INLINE:", addonError);
        alert("Erro ao criar: " + addonError.message);
        return;
    }

    const p = products.find(prod => prod.id === productId);
    const newAddonsArr = [...(p?.addons || []), newId];
    
    const { error: updateError } = await supabase.from("products").update({ addons: newAddonsArr }).eq("id", productId);
    if (updateError) {
        console.error("ERRO AO VINCULAR ADICIONAL INLINE:", updateError);
        alert("Erro ao vincular: " + updateError.message);
        return;
    }

    onUpdateProducts(products.map(prod => prod.id === productId ? { ...prod, addons: newAddonsArr } : prod));
    onUpdateAddons([...addons, addon]);
    handleSync();
    
    setInlineAddon({ name: '', price: '' });
  };

  const updateSettings = async (updated: AppSettings) => {
      const { error } = await supabase.from("settings").upsert({ 
          id: 1,
          shopName: updated.shopName,
          shopname: updated.shopName,
          logoUrl: updated.logoUrl,
          logourl: updated.logoUrl,
          promoBanner: updated.promoBanner,
          promobanner: updated.promoBanner,
          whatsappNumber: updated.whatsappNumber,
          whatsappnumber: updated.whatsappNumber
      });
      if (error) {
          console.error("ERRO AO SALVAR SETTINGS:", error);
          alert("Erro Supabase: " + error.message);
          return;
      }
      onUpdateSettings(updated);
      handleSync();
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[100] bg-background-dark/95 backdrop-blur-xl flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-surface-dark border border-white/10 rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">shield_person</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Área Privada</h2>
            <p className="text-neutral-500 text-sm mt-1">Identifique-se para gerenciar o cardápio</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Digite a senha" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 px-6 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all text-center text-xl tracking-[0.5em]"
              autoFocus
            />
            <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white h-14 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
              Entrar no Painel
            </button>
            <button type="button" onClick={onClose} className="w-full text-neutral-500 font-bold py-2 text-sm uppercase tracking-widest hover:text-white transition-colors">Voltar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background-dark flex flex-col animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-surface-dark/50 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Painel de Controle</h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Sistema Operacional</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {syncStatus.loading && (
            <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-full border border-yellow-500/20">
              <div className="w-3 h-3 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"></div>
              <span className="text-[10px] font-black uppercase">Sincronizando...</span>
            </div>
          )}
          {syncStatus.success && (
            <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-3 py-1.5 rounded-full border border-green-500/20 animate-in fade-in zoom-in-95">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span className="text-[10px] font-black uppercase">Salvo no GitHub</span>
            </div>
          )}
          {syncStatus.error && (
            <div className="flex items-center gap-2 bg-red-500/10 text-red-500 px-3 py-1.5 rounded-full border border-red-500/20" title={syncStatus.error}>
              <span className="material-symbols-outlined text-sm">error</span>
              <span className="text-[10px] font-black uppercase">Erro de Sinc</span>
            </div>
          )}
          <button onClick={onClose} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-95">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-background-dark custom-scrollbar">
        <div className="flex p-4 gap-2 sticky top-0 bg-background-dark z-20 overflow-x-auto hide-scrollbar border-b border-white/5">
          <button onClick={() => setActiveTab('products')} className={`flex-1 min-w-max px-6 h-12 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-neutral-500 hover:text-white'}`}>Produtos</button>
          <button onClick={() => setActiveTab('addons')} className={`flex-1 min-w-max px-6 h-12 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'addons' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-neutral-500 hover:text-white'}`}>Sub-produtos</button>
          <button onClick={() => setActiveTab('settings')} className={`flex-1 min-w-max px-6 h-12 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-neutral-500 hover:text-white'}`}>Loja</button>
        </div>

        <div className="p-4 max-w-4xl mx-auto w-full">
          {activeTab === 'products' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-gradient-to-br from-surface-dark to-black p-6 rounded-[32px] border border-white/10 shadow-xl space-y-6">
                <h3 className="font-black text-white text-lg flex items-center gap-3"><span className="material-symbols-outlined text-primary">add_circle</span> NOVO PRODUTO</h3>
                
                <label className="w-full aspect-video bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all overflow-hidden">
                  {newProduct.imageUrl ? (
                    <img src={newProduct.imageUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                        <span className="material-symbols-outlined text-neutral-400 text-3xl">image</span>
                        <span className="text-[10px] text-neutral-500 uppercase font-black tracking-widest">Carregar Foto</span>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'product')} />
                </label>

                <div className="space-y-4">
                    <input 
                        placeholder="Nome do Produto (Ex: Pizza Calabresa)" 
                        value={newProduct.name || ''} 
                        onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 px-6 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" 
                    />
                    
                    <textarea 
                        placeholder="Descrição / Ingredientes (Ex: Molho, mussarela, calabresa e cebola...)" 
                        value={newProduct.description || ''} 
                        onChange={e => setNewProduct({...newProduct, description: e.target.value})} 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[120px] resize-none text-sm leading-relaxed" 
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-bold">R$</span>
                          <input 
                              type="number" 
                              placeholder="0,00" 
                              value={newProduct.price || ''} 
                              onChange={e => setNewProduct({...newProduct, price: e.target.value})} 
                              className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 pl-14 pr-6 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" 
                          />
                        </div>
                        <select 
                            value={newProduct.category} 
                            onChange={e => setNewProduct({...newProduct, category: e.target.value as Category})} 
                            className="bg-white/5 border border-white/10 rounded-2xl h-14 px-6 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold uppercase text-xs tracking-widest appearance-none"
                        >
                            {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-background-dark text-white">{cat}</option>)}
                        </select>
                    </div>
                </div>

                <button onClick={addProduct} className="w-full bg-primary hover:bg-primary-hover text-white h-16 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3">
                  <span className="material-symbols-outlined">check_circle</span>
                  Adicionar ao Cardápio
                </button>
              </div>

              <div className="space-y-4 pb-20">
                <div className="flex items-center justify-between px-2">
                  <h3 className="font-black text-white uppercase text-xs tracking-[0.2em] opacity-50">Itens Ativos ({products.length})</h3>
                  <div className="h-[1px] flex-1 bg-white/5 mx-4"></div>
                </div>
                
                {products.map(p => (
                  <div key={p.id} className="group p-5 bg-surface-dark/50 border border-white/5 rounded-[32px] hover:border-white/10 hover:bg-surface-dark transition-all duration-300">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/5">
                          <img src={p.imageUrl} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-black text-white text-base leading-none group-hover:text-primary transition-colors">{p.name}</p>
                          <div className="flex items-center gap-3">
                            <p className="text-primary font-bold text-sm">R$ {p.price.toFixed(2).replace('.', ',')}</p>
                            <span className="w-1 h-1 rounded-full bg-white/10"></span>
                            <select 
                              value={p.category}
                              onChange={(e) => updateProductCategory(p.id, e.target.value as Category)}
                              className="bg-transparent text-neutral-500 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:text-white transition-colors appearance-none"
                            >
                              {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-background-dark">{cat}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                         <button 
                          onClick={() => toggleProductFlag(p.id, 'isBestSeller')} 
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${p.isBestSeller ? 'bg-orange-500/20 border-orange-500/50 text-orange-500 shadow-lg shadow-orange-500/10' : 'border-white/5 text-white/20 hover:text-white/40'}`}
                         >
                           <span className="material-symbols-outlined text-lg">star</span>
                         </button>
                         <button 
                          onClick={() => removeProduct(p.id)} 
                          className="w-10 h-10 rounded-xl border border-white/5 flex items-center justify-center text-white/20 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
                         >
                           <span className="material-symbols-outlined text-lg">delete</span>
                         </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5">
                       <button 
                        onClick={() => setEditingAddonsFor(editingAddonsFor === p.id ? null : p.id)}
                        className={`w-full flex items-center justify-between px-5 h-12 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${editingAddonsFor === p.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-neutral-500 hover:text-white'}`}
                       >
                         <span className="flex items-center gap-2">
                           <span className="material-symbols-outlined text-base">widgets</span>
                           Gerenciar Sub-produtos
                         </span>
                         <span className="material-symbols-outlined text-base transition-transform duration-300" style={{ transform: editingAddonsFor === p.id ? 'rotate(180deg)' : 'none' }}>
                           expand_more
                         </span>
                       </button>

                       {editingAddonsFor === p.id && (
                         <div className="mt-4 p-4 bg-black/20 rounded-[24px] space-y-4 border border-white/5 animate-in slide-in-from-top-2 duration-300">
                           <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                             <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-3">Criar Rápido</p>
                             <div className="flex gap-2">
                               <input placeholder="Nome" value={inlineAddon.name} onChange={e => setInlineAddon({...inlineAddon, name: e.target.value})} className="flex-[3] bg-background-dark border border-white/5 rounded-xl h-10 px-4 text-xs text-white outline-none focus:ring-1 focus:ring-primary/50" />
                               <input type="number" placeholder="Preço" value={inlineAddon.price} onChange={e => setInlineAddon({...inlineAddon, price: e.target.value})} className="flex-[1] bg-background-dark border border-white/5 rounded-xl h-10 px-4 text-xs text-white outline-none focus:ring-1 focus:ring-primary/50" />
                               <button 
                                 onClick={() => addInlineAddon(p.id)}
                                 className="bg-primary hover:bg-primary-hover text-white px-4 rounded-xl flex items-center justify-center transition-all active:scale-95"
                               >
                                 <span className="material-symbols-outlined text-lg">add</span>
                               </button>
                             </div>
                           </div>
                           
                           <div className="space-y-2">
                             <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest ml-1">Vincular Adicionais</p>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                               {addons.length > 0 ? addons.map(addon => (
                                 <button 
                                   key={addon.id}
                                   onClick={() => toggleAddonForProduct(p.id, addon.id)}
                                   className={`flex items-center justify-between p-4 rounded-2xl text-xs font-bold transition-all border ${p.addons?.includes(addon.id) ? 'bg-primary/10 text-primary border-primary/30 shadow-lg shadow-primary/5' : 'bg-white/5 text-neutral-500 border-transparent hover:border-white/10'}`}
                                 >
                                   <span>{addon.name}</span>
                                   <span className="bg-black/20 px-2 py-1 rounded-lg">+ R$ {addon.price.toFixed(2)}</span>
                                 </button>
                               )) : (
                                 <div className="col-span-2 py-4 text-center text-[10px] text-neutral-600 font-bold uppercase tracking-widest italic bg-white/5 rounded-2xl">Nenhum sub-produto cadastrado</div>
                               )}
                             </div>
                           </div>
                         </div>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'addons' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-gradient-to-br from-surface-dark to-black p-6 rounded-[32px] border border-white/10 shadow-xl space-y-6">
                <h3 className="font-black text-white text-lg flex items-center gap-3"><span className="material-symbols-outlined text-primary">widgets</span> NOVO SUB-PRODUTO</h3>
                <div className="flex flex-col gap-4">
                  <input placeholder="Ex: Borda Recheada Catupiry" value={newAddon.name || ''} onChange={e => setNewAddon({...newAddon, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 px-6 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" />
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-bold">R$</span>
                      <input type="number" placeholder="0,00" value={newAddon.price || ''} onChange={e => setNewAddon({...newAddon, price: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 pl-14 pr-6 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" />
                    </div>
                    <button onClick={addAddon} className="flex-[2] bg-primary hover:bg-primary-hover text-white h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95">Criar</button>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pb-20">
                <div className="flex items-center justify-between px-2">
                  <h3 className="font-black text-white uppercase text-xs tracking-[0.2em] opacity-50">Sub-produtos Cadastrados</h3>
                  <div className="h-[1px] flex-1 bg-white/5 mx-4"></div>
                </div>
                
                {addons.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {addons.map(a => (
                      <div key={a.id} className="flex items-center justify-between p-5 bg-surface-dark/50 border border-white/5 rounded-[24px] hover:border-white/10 hover:bg-surface-dark transition-all">
                        <div>
                          <p className="font-black text-white text-sm uppercase italic">{a.name}</p>
                          <p className="text-primary font-bold text-xs uppercase">+ R$ {a.price.toFixed(2).replace('.', ',')}</p>
                        </div>
                        <button onClick={() => removeAddon(a.id)} className="w-10 h-10 rounded-xl border border-white/5 flex items-center justify-center text-white/20 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-all">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center bg-white/5 rounded-[32px] border border-dashed border-white/10">
                    <span className="material-symbols-outlined text-4xl text-white/10 mb-2">widgets</span>
                    <p className="text-xs text-neutral-600 font-bold uppercase tracking-widest italic">Nenhum item cadastrado ainda</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
               <div className="bg-gradient-to-br from-surface-dark to-black p-8 rounded-[40px] border border-white/10 shadow-xl space-y-10">
                 <h3 className="font-black text-white text-lg flex items-center gap-3"><span className="material-symbols-outlined text-primary">storefront</span> IDENTIDADE DA LOJA</h3>
                 
                 <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-[32px] bg-background-dark border-2 border-white/5 overflow-hidden relative group shadow-2xl">
                        {settings.logoUrl ? <img src={settings.logoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/10"><span className="material-symbols-outlined text-5xl">store</span></div>}
                        <label className="absolute inset-0 bg-primary/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all duration-300">
                           <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                           <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                        </label>
                      </div>
                      {settings.logoUrl && (
                        <button 
                          onClick={() => { const updated = {...settings, logoUrl: ''}; updateSettings(updated); }} 
                          className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
                        >
                          <span className="material-symbols-outlined text-sm font-bold">close</span>
                        </button>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Logotipo da Marca</p>
                      <p className="text-[9px] text-neutral-500 uppercase font-bold mt-1 tracking-widest">Formatos aceitos: JPG, PNG, WEBP</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-neutral-500 uppercase ml-2 tracking-widest flex items-center gap-2">
                         <span className="material-symbols-outlined text-sm">badge</span> Nome Comercial
                       </label>
                       <input value={settings.shopName} onChange={(e) => { const updated = { ...settings, shopName: e.target.value }; onUpdateSettings(updated); }} onBlur={() => updateSettings(settings)} className="w-full bg-white/5 border border-white/10 rounded-2xl h-16 px-6 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all font-black text-lg uppercase tracking-wider" />
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-primary uppercase ml-2 tracking-widest flex items-center gap-2">
                         <span className="material-symbols-outlined text-sm">campaign</span> Banner Promocional (Topo)
                       </label>
                       <input value={settings.promoBanner || ''} onChange={(e) => { const updated = { ...settings, promoBanner: e.target.value }; onUpdateSettings(updated); }} onBlur={() => updateSettings(settings)} placeholder="Ex: Entrega grátis hoje!" className="w-full bg-primary/5 border border-primary/20 rounded-2xl h-16 px-6 text-primary outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold italic" />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-green-500 uppercase ml-2 tracking-widest flex items-center gap-2">
                         <span className="material-symbols-outlined text-sm">phone_iphone</span> WhatsApp Central (Recebimento de Pedidos)
                       </label>
                       <div className="relative">
                         <span className="absolute left-6 top-1/2 -translate-y-1/2 text-green-500 font-bold">+</span>
                         <input value={settings.whatsappNumber || ''} onChange={(e) => { const updated = { ...settings, whatsappNumber: e.target.value.replace(/\D/g, '') }; onUpdateSettings(updated); }} onBlur={() => updateSettings(settings)} placeholder="5511999999999" className="w-full bg-green-500/5 border border-green-500/20 rounded-2xl h-16 pl-10 pr-6 text-green-500 outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-black text-sm tracking-[0.2em]" />
                       </div>
                       <p className="text-[9px] text-neutral-600 ml-2 font-bold uppercase tracking-widest">* APENAS NÚMEROS COM DDD (EX: 55119992525810)</p>
                    </div>
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
