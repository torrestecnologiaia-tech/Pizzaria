
import React, { useState } from 'react';
import { CartItem, AppSettings } from '../types';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  total: number;
  settings: AppSettings;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, items, onUpdateQuantity, total, settings }) => {
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [formData, setFormData] = useState({
    nome: '',
    rua: '',
    numero: '',
    bairro: '',
    referencia: '',
    pagamento: 'pix',
    troco: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const setPayment = (type: string) => {
    setFormData(prev => ({ ...prev, pagamento: type }));
  };

  const handleFinalize = () => {
    const separator = "---------------------------------------";
    const shopName = settings.shopName?.toUpperCase() || "HOTT ROSSI";
    
    const itemsList = items.map(item => {
      let addonText = "";
      if (item.selectedAddons && item.selectedAddons.length > 0) {
        addonText = "%0A   └─ _Adicionais: " + item.selectedAddons.map(a => a.name).join(", ") + "_";
      }
      return "• " + item.quantity + "x *" + item.name + "* - R$ " + (item.price * item.quantity).toFixed(2).replace(".", ",") + addonText;
    }).join("%0A%0A");
    
    let paymentLabel = "";
    switch(formData.pagamento) {
      case "pix": paymentLabel = "💠 *Pix (Chave CPF: 30507986881)*"; break;
      case "credito": paymentLabel = "💳 *Cartão de Crédito*"; break;
      case "debito": paymentLabel = "💳 *Cartão de Débito*"; break;
      case "dinheiro": paymentLabel = "💵 *Dinheiro* " + (formData.troco ? "(Troco para R$ " + formData.troco + ")" : "(Não precisa de troco)"); break;
    }

    const message = "🌟 *NOVO PEDIDO - " + shopName + "* 🌟" + "%0A" +
      separator + "%0A%0A" +
      "📋 *ITENS:*%0A" + itemsList + "%0A%0A" +
      separator + "%0A" +
      "💰 *TOTAL: R$ " + total.toFixed(2).replace(".", ",") + "*%0A" +
      separator + "%0A%0A" +
      "📍 *DADOS DE ENTREGA:*%0A" +
      "👤 *Nome:* " + formData.nome + "%0A" +
      "🏠 *Endereço:* " + formData.rua + ", nº " + formData.numero + "%0A" +
      "🏘️ *Bairro:* " + formData.bairro + "%0A" +
      "🎯 *Ref:* " + (formData.referencia || "N/A") + "%0A%0A" +
      "💳 *FORMA DE PAGAMENTO:*%0A" +
      paymentLabel + "%0A%0A" +
      separator + "%0A" +
      "🙏 _Obrigado pela preferência!_";

    const phone = settings.whatsappNumber || "5511999999999";
    window.open("https://wa.me/" + phone + "?text=" + message, "_blank");
  };

  const isFormValid = formData.nome && formData.rua && formData.numero && formData.bairro && formData.pagamento;

  const paymentOptions = [
    { id: 'pix', label: 'Pix', icon: 'payments' },
    { id: 'credito', label: 'Crédito', icon: 'credit_card' },
    { id: 'debito', label: 'Débito', icon: 'credit_score' },
    { id: 'dinheiro', label: 'Dinheiro', icon: 'money' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-surface-dark rounded-t-[2.5rem] max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mx-auto mt-4 mb-2" />
        
        <div className="px-6 flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            {step === 'checkout' && (
              <button onClick={() => setStep('cart')} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-neutral-600 dark:text-white">
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            )}
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {step === 'cart' ? 'Seu Carrinho' : 'Dados de Entrega'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {step === 'cart' ? (
            items.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-6">
                   <span className="material-symbols-outlined text-neutral-300 text-5xl">shopping_basket</span>
                </div>
                <p className="text-neutral-500 dark:text-gray-400 text-lg font-medium">Seu carrinho está vazio.</p>
                <button onClick={onClose} className="mt-6 text-primary font-bold">Voltar ao cardápio</button>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center bg-gray-50/50 dark:bg-white/[0.02] p-3 rounded-2xl border border-gray-100 dark:border-white/5">
                    <div className="w-20 h-20 rounded-xl bg-cover bg-center shrink-0 shadow-sm" style={{ backgroundImage: `url(${item.imageUrl})` }} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-neutral-900 dark:text-white font-bold text-base truncate">{item.name}</h4>
                      <p className="text-primary font-bold text-sm">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white dark:bg-background-dark shadow-sm border border-gray-100 dark:border-white/10 rounded-full p-1">
                      <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5">
                        <span className="material-symbols-outlined text-lg">remove</span>
                      </button>
                      <span className="text-neutral-900 dark:text-white font-bold text-sm w-4 text-center">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5">
                        <span className="material-symbols-outlined text-lg">add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="flex flex-col gap-5 py-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400 dark:text-gray-500 uppercase tracking-widest ml-1">Seu Nome</label>
                <input name="nome" value={formData.nome} onChange={handleInputChange} placeholder="Como quer ser chamado?" className="w-full bg-gray-50 dark:bg-background-dark border border-gray-100 dark:border-white/5 rounded-2xl h-14 px-5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all" />
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3 space-y-2">
                  <label className="text-xs font-bold text-neutral-400 dark:text-gray-500 uppercase tracking-widest ml-1">Rua</label>
                  <input name="rua" value={formData.rua} onChange={handleInputChange} placeholder="Rua, Avenida..." className="w-full bg-gray-50 dark:bg-background-dark border border-gray-100 dark:border-white/5 rounded-2xl h-14 px-5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-400 dark:text-gray-500 uppercase tracking-widest ml-1">Nº</label>
                  <input name="numero" value={formData.numero} onChange={handleInputChange} placeholder="123" className="w-full bg-gray-50 dark:bg-background-dark border border-gray-100 dark:border-white/5 rounded-2xl h-14 px-4 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400 dark:text-gray-500 uppercase tracking-widest ml-1">Bairro</label>
                <input name="bairro" value={formData.bairro} onChange={handleInputChange} placeholder="Nome do bairro" className="w-full bg-gray-50 dark:bg-background-dark border border-gray-100 dark:border-white/5 rounded-2xl h-14 px-5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400 dark:text-gray-500 uppercase tracking-widest ml-1">Ponto de Referência</label>
                <input name="referencia" value={formData.referencia} onChange={handleInputChange} placeholder="Opcional: Ex perto do posto" className="w-full bg-gray-50 dark:bg-background-dark border border-gray-100 dark:border-white/5 rounded-2xl h-14 px-5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all" />
              </div>

              <div className="space-y-3 pt-4">
                <label className="text-xs font-bold text-neutral-400 dark:text-gray-500 uppercase tracking-widest ml-1">Forma de Pagamento</label>
                <div className="grid grid-cols-2 gap-3">
                  {paymentOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setPayment(opt.id)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                        formData.pagamento === opt.id 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-background-dark text-neutral-500 dark:text-gray-400'
                      }`}
                    >
                      <span className="material-symbols-outlined">{opt.icon}</span>
                      <span className="font-bold text-sm">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {formData.pagamento === 'dinheiro' && (
                <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
                  <label className="text-xs font-bold text-neutral-400 dark:text-gray-500 uppercase tracking-widest ml-1">Troco para quanto?</label>
                  <input name="troco" value={formData.troco} onChange={handleInputChange} placeholder="Ex: R$ 100,00 (Deixe vazio se não precisar)" className="w-full bg-gray-50 dark:bg-background-dark border border-gray-100 dark:border-white/5 rounded-2xl h-14 px-5 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all" />
                </div>
              )}

              {formData.pagamento === 'pix' && (
                <div className="p-5 bg-primary/5 rounded-2xl border-2 border-primary/20 flex flex-col items-center gap-3 animate-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined text-sm">info</span>
                    <p className="text-[10px] font-black uppercase tracking-widest">Pagamento via Pix</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-neutral-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-1">Chave CPF:</p>
                    <p className="text-neutral-900 dark:text-white font-mono font-black text-2xl tracking-widest select-all">30507986881</p>
                  </div>
                  <p className="text-[10px] text-neutral-500 dark:text-gray-500 font-medium text-center italic">O comprovante deve ser enviado no WhatsApp após o pedido.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
          <div className="flex justify-between items-center mb-6 px-2">
            <span className="text-neutral-500 dark:text-gray-400 font-bold uppercase tracking-tighter text-sm">Total do Pedido</span>
            <span className="text-3xl font-black text-neutral-900 dark:text-white">R$ {total.toFixed(2).replace('.', ',')}</span>
          </div>
          
          {step === 'cart' ? (
            <button 
              disabled={items.length === 0}
              onClick={() => setStep('checkout')}
              className="w-full bg-primary hover:bg-red-600 disabled:opacity-40 disabled:grayscale text-white h-16 rounded-2xl font-black text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              Finalizar Pedido
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          ) : (
            <button 
              disabled={!isFormValid}
              onClick={handleFinalize}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:grayscale text-white h-16 rounded-2xl font-black text-lg shadow-xl shadow-green-600/20 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined">rocket_launch</span>
              Enviar para o WhatsApp
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;
