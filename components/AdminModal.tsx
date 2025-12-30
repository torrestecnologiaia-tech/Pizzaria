
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

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, products, addons, settings, onUpdateProducts, onUpdateAddons, onUpdateSettings }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'addons' | 'settings'>('products');
  const [editingAddonsFor, setEditingAddonsFor] = useState<string | null>(null);
  
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

  if (!isOpen) return null;

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
      reader.onloadend = () => {
        if (target === 'product') {
          setNewProduct(prev => ({ ...prev, imageUrl: reader.result as string }));
        } else {
          onUpdateSettings({ ...settings, logoUrl: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleProductFlag = (id: string, flag: 'isPromo' | 'isBestSeller') => {
    onUpdateProducts(products.map(p => {
      if (p.id === id) {
        const newVal = !p[flag];
        return { 
          ...p, 
          [flag]: newVal,
          promoText: flag === 'isPromo' && newVal ? 'Promoção' : (flag === 'isBestSeller' && newVal ? 'Destaque' : p.promoText)
        };
      }
      return p;
    }));
  };

  const toggleAddonForProduct = (productId: string, addonId: string) => {
    onUpdateProducts(products.map(p => {
      if (p.id === productId) {
        const currentAddons = p.addons || [];
        const newAddons = currentAddons.includes(addonId)
          ? currentAddons.filter(id => id !== addonId)
          : [...currentAddons, addonId];
        return { ...p, addons: newAddons };
      }
      return p;
    }));
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price) {
        alert("Preencha ao menos Nome e Preço!");
        return;
    }
    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name!,
      description: newProduct.description || '',
      price: Number(newProduct.price),
      category: newProduct.category as Category,
      imageUrl: newProduct.imageUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
      addons: []
    };
    onUpdateProducts([...products, product]);
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

  const removeProduct = (id: string) => {
    if(confirm("Excluir produto?")) onUpdateProducts(products.filter(p => p.id !== id));
  };

  const addAddon = () => {
    if (!newAddon.name || !newAddon.price) return;
    onUpdateAddons([...addons, { id: Date.now().toString(), name: newAddon.name!, price: Number(newAddon.price) }]);
    setNewAddon({});
  };

  const removeAddon = (id: string) => {
    if(confirm("Excluir sub-produto?")) {
      onUpdateAddons(addons.filter(a => a.id !== id));
      onUpdateProducts(products.map(p => ({
        ...p,
        addons: p.addons?.filter(aid => aid !== id)
      })));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="bg-surface-dark w-full max-w-sm rounded-3xl p-8 border border-white/10 text-center">
          <h2 className="text-2xl font-black text-white mb-6">Painel Rossi</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" className="w-full bg-background-dark border border-white/10 rounded-2xl h-14 px-5 text-white text-center text-xl tracking-widest outline-none" />
            <button className="w-full bg-primary text-white h-14 rounded-2xl font-bold">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative bg-white dark:bg-surface-dark w-full max-w-2xl h-[90vh] rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-black dark:text-white uppercase tracking-tighter">Administração</h2>
          <button onClick={onClose} className="p-2 text-neutral-400"><span className="material-symbols-outlined">close</span></button>
        </div>

        <div className="flex bg-gray-50 dark:bg-black/20 p-2 gap-2">
          <button onClick={() => setActiveTab('products')} className={`flex-1 h-12 rounded-xl font-bold transition-all ${activeTab === 'products' ? 'bg-primary text-white' : 'text-neutral-500'}`}>Produtos</button>
          <button onClick={() => setActiveTab('addons')} className={`flex-1 h-12 rounded-xl font-bold transition-all ${activeTab === 'addons' ? 'bg-primary text-white' : 'text-neutral-500'}`}>Sub-produtos</button>
          <button onClick={() => setActiveTab('settings')} className={`flex-1 h-12 rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-primary text-white' : 'text-neutral-500'}`}>Configurações</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'products' && (/* ... mantido ... */
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-black/20 p-5 rounded-3xl space-y-4 border border-white/5">
                <h3 className="font-bold text-primary flex items-center gap-2"><span className="material-symbols-outlined">add_circle</span> Novo Produto</h3>
                
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer overflow-hidden relative group">
                  {newProduct.imageUrl ? (
                    <img src={newProduct.imageUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                        <span className="material-symbols-outlined text-neutral-400">image</span>
                        <span className="text-[10px] text-neutral-500 uppercase font-bold">Foto do Produto</span>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'product')} />
                </label>

                <div className="space-y-3">
                    <input 
                        placeholder="Nome do Produto (Ex: Pizza Calabresa)" 
                        value={newProduct.name || ''} 
                        onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
                        className="w-full bg-white dark:bg-background-dark rounded-xl h-12 px-4 text-white outline-none focus:ring-1 focus:ring-primary/50" 
                    />
                    
                    <textarea 
                        placeholder="Descrição / Ingredientes (Ex: Molho, mussarela, calabresa e cebola...)" 
                        value={newProduct.description || ''} 
                        onChange={e => setNewProduct({...newProduct, description: e.target.value})} 
                        className="w-full bg-white dark:bg-background-dark rounded-xl p-4 text-white outline-none focus:ring-1 focus:ring-primary/50 min-h-[100px] resize-none text-sm" 
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <input 
                            type="number" 
                            placeholder="Preço (Ex: 45.90)" 
                            value={newProduct.price || ''} 
                            onChange={e => setNewProduct({...newProduct, price: e.target.value})} 
                            className="bg-white dark:bg-background-dark rounded-xl h-12 px-4 text-white outline-none focus:ring-1 focus:ring-primary/50" 
                        />
                        <select 
                            value={newProduct.category} 
                            onChange={e => setNewProduct({...newProduct, category: e.target.value as Category})} 
                            className="bg-white dark:bg-background-dark rounded-xl h-12 px-4 text-white outline-none focus:ring-1 focus:ring-primary/50"
                        >
                            <option value="Pizzas">Pizzas</option>
                            <option value="Combos">Combos</option>
                            <option value="Bebidas">Bebidas</option>
                            <option value="Sobremesas">Sobremesas</option>
                        </select>
                    </div>
                </div>

                <button onClick={addProduct} className="w-full bg-green-600 hover:bg-green-700 text-white h-14 rounded-xl font-bold shadow-lg transition-all active:scale-95">
                  Adicionar ao Cardápio
                </button>
              </div>

              <div className="space-y-3 pb-10">
                <h3 className="font-bold dark:text-white uppercase text-xs tracking-widest opacity-50 px-2">Itens Ativos ({products.length})</h3>
                {products.map(p => (
                  <div key={p.id} className="p-4 bg-white dark:bg-background-dark rounded-2xl border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <p className="font-bold text-white text-sm">{p.name}</p>
                          <p className="text-primary font-bold text-xs">R$ {p.price.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                         <button onClick={() => toggleProductFlag(p.id, 'isBestSeller')} className={`p-2 rounded-lg border ${p.isBestSeller ? 'bg-orange-500/20 border-orange-500 text-orange-500' : 'border-white/10 text-neutral-500'}`}><span className="material-symbols-outlined text-sm">star</span></button>
                         <button onClick={() => removeProduct(p.id)} className="text-red-500 p-2"><span className="material-symbols-outlined">delete</span></button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                       <button 
                        onClick={() => setEditingAddonsFor(editingAddonsFor === p.id ? null : p.id)}
                        className={`w-full flex items-center justify-between px-4 h-10 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${editingAddonsFor === p.id ? 'bg-primary text-white' : 'bg-white/5 text-neutral-400 hover:text-white'}`}
                       >
                         <span className="flex items-center gap-2">
                           <span className="material-symbols-outlined text-sm">widgets</span>
                           Gerenciar Sub-produtos
                         </span>
                         <span className="material-symbols-outlined text-sm">
                           {editingAddonsFor === p.id ? 'expand_less' : 'expand_more'}
                         </span>
                       </button>

                       {editingAddonsFor === p.id && (
                         <div className="grid grid-cols-1 gap-2 p-3 bg-black/20 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
                           <p className="text-[10px] text-neutral-500 font-bold uppercase mb-1">Selecione os adicionais permitidos:</p>
                           {addons.length > 0 ? addons.map(addon => (
                             <button 
                               key={addon.id}
                               onClick={() => toggleAddonForProduct(p.id, addon.id)}
                               className={`flex items-center justify-between p-2 rounded-lg text-xs transition-all ${p.addons?.includes(addon.id) ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-neutral-500 border border-transparent'}`}
                             >
                               <span>{addon.name}</span>
                               <span className="font-bold">R$ {addon.price.toFixed(2)}</span>
                             </button>
                           )) : (
                             <p className="text-[10px] text-neutral-600 italic">Nenhum sub-produto cadastrado. Vá até a aba "Sub-produtos".</p>
                           )}
                         </div>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'addons' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="bg-gray-50 dark:bg-black/20 p-5 rounded-3xl space-y-4 border border-white/5">
                <h3 className="font-bold text-primary flex items-center gap-2"><span className="material-symbols-outlined">widgets</span> Novo Sub-produto (Adicional)</h3>
                <div className="flex flex-col gap-3">
                  <input placeholder="Ex: Borda Recheada Catupiry" value={newAddon.name || ''} onChange={e => setNewAddon({...newAddon, name: e.target.value})} className="w-full bg-white dark:bg-background-dark rounded-xl h-12 px-4 text-white outline-none focus:ring-1 focus:ring-primary/50" />
                  <div className="flex gap-3">
                    <input type="number" placeholder="Preço Adicional R$" value={newAddon.price || ''} onChange={e => setNewAddon({...newAddon, price: e.target.value})} className="flex-1 bg-white dark:bg-background-dark rounded-xl h-12 px-4 text-white outline-none focus:ring-1 focus:ring-primary/50" />
                    <button onClick={addAddon} className="flex-[2] bg-primary text-white h-12 rounded-xl font-bold active:scale-95 transition-transform">Criar Sub-produto</button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold dark:text-white uppercase text-xs tracking-widest opacity-50 px-2">Sub-produtos Cadastrados</h3>
                {addons.length > 0 ? addons.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-4 bg-white dark:bg-background-dark rounded-2xl border border-white/5">
                    <div>
                      <p className="font-bold dark:text-white">{a.name}</p>
                      <p className="text-primary font-bold text-sm">+ R$ {a.price.toFixed(2)}</p>
                    </div>
                    <button onClick={() => removeAddon(a.id)} className="text-red-500 p-2 rounded-xl hover:bg-red-500/10 transition-colors"><span className="material-symbols-outlined">delete</span></button>
                  </div>
                )) : (
                  <div className="py-10 text-center text-neutral-500 text-sm italic">Crie sub-produtos acima (Ex: Bordas, Ingredientes Extras).</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8 animate-in fade-in">
               <div className="bg-gray-50 dark:bg-black/20 p-6 rounded-3xl space-y-6 border border-white/5">
                 <h3 className="font-bold text-primary flex items-center gap-2"><span className="material-symbols-outlined">storefront</span> Identidade da Loja</h3>
                 <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-background-dark border-2 border-primary/30 overflow-hidden relative group">
                      {settings.logoUrl ? <img src={settings.logoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-neutral-500"><span className="material-symbols-outlined text-4xl">store</span></div>}
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                         <span className="text-[10px] text-white font-bold uppercase">Trocar</span>
                         <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                      </label>
                    </div>
                    {settings.logoUrl && <button onClick={() => onUpdateSettings({...settings, logoUrl: ''})} className="text-[10px] text-red-500 font-bold uppercase">Remover Logo</button>}
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-neutral-400 uppercase ml-1">Nome da Loja</label>
                       <input value={settings.shopName} onChange={(e) => onUpdateSettings({ ...settings, shopName: e.target.value })} className="w-full bg-white dark:bg-background-dark rounded-xl h-14 px-5 text-white outline-none focus:ring-1 focus:ring-primary/50" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-primary uppercase ml-1 flex items-center gap-2">
                         <span className="material-symbols-outlined text-sm">campaign</span> Aviso de Promoção (Topo)
                       </label>
                       <input value={settings.promoBanner || ''} onChange={(e) => onUpdateSettings({ ...settings, promoBanner: e.target.value })} placeholder="Ex: Entrega grátis hoje!" className="w-full bg-primary/5 border border-primary/20 rounded-xl h-14 px-5 text-primary font-bold outline-none focus:ring-1 focus:ring-primary/50" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-green-500 uppercase ml-1 flex items-center gap-2">
                         <span className="material-symbols-outlined text-sm">phone_iphone</span> WhatsApp da Loja (Para receber pedidos)
                       </label>
                       <input value={settings.whatsappNumber || ''} onChange={(e) => onUpdateSettings({ ...settings, whatsappNumber: e.target.value })} placeholder="Ex: 5511999999999" className="w-full bg-green-500/5 border border-green-500/20 rounded-xl h-14 px-5 text-green-500 font-bold outline-none focus:ring-1 focus:ring-green-500/50" />
                       <p className="text-[9px] text-neutral-500 ml-1">Insira apenas números com DDD (Ex: 5511...)</p>
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
