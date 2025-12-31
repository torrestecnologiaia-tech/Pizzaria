// Add Category to imports to fix type error
import { Product, Category } from './types';

export const products: Product[] = [
  // Highlights (Destaques) are also products
  {
    id: 'p-combo-familia',
    name: 'Combo Família',
    description: 'Pizza Grande + Refri 2L por apenas R$ 89,90',
    price: 89.90,
    category: 'Combos',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaPHj8BKzUJ-Pan8QIDzAGUA9A7U2Nl0-NymiGx3f2aylhMbr-giClvI-s6j4KtUP2XI1sChJOM3zGhszDZSVmTvf1o6aWKKWmxVgWHeTwlbCw4ua_kDTWSVxVfaJW-wqWt9yfPdQ8sQ4cnYkyF1EgHhgOiT48PjnoetK56Iu5lQp9wDkeWeWd67qEYO2S1mxozTmybrChxq-FX-rJdFhcmuZ3Nqi4CqKx9cODJ7pz5FzP9DuX_glFdK65023vwvFT1J9PiJir-x0',
    isPromo: true,
    promoText: 'Promoção'
  },
  {
    id: 'p-margherita-especial',
    name: 'Margherita Especial',
    description: 'Molho caseiro, mussarela de búfala e manjericão.',
    price: 55.00,
    category: 'Pizzas',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAH0QZ5FJM1cjb1rBRh75ygrXBYn9V_p60uwO83pO1cJ6_tNMZ5vwS4S0rvB77xTGIn14djugz9W977No9wyaFitCOJJIyYaFpfnu7MWUgZO2Dd90JExk1IGfVaUm_fCO8EvoOZthM9wngecbN0-zI62u_CTdTK6U-pvMOeZ6HTgr6hAPtaKokMsQeQoeuFU1tJDJFubhhS_yQLTmoxPj68kHQ1l9eLrdKybxpOqBv56XhVnX5K1d39X4VTSlTkUfguzfbf8peb-t8',
    isBestSeller: true,
    promoText: 'Mais Pedida'
  },
  {
    id: 'p-calabresa',
    name: 'Calabresa Acebolada',
    description: 'Molho de tomate artesanal, mussarela, calabresa fatiada, cebola roxa e orégano.',
    price: 45.90,
    category: 'Pizzas',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqmhpxeoxLpEby-uk56OvdAvmf8a0aa20on5D-7V_QFHmipJ4VO_l2OO-XA1GipcMirS06kmqUD2fGzg4B-1PTE-pVYWv9DonNcPO53mbu1tqBSl81UcJw0eUYtf7E_jKeRr8oVTulRwBEYNWI-BtDn29NrSHSB6zWFquIrYHJYIpAVGkrQ4BdTTXM_Y3u1YUucHSKGyAXyZswx2RQ5osJKmRsmovLKIfnHXxaHjeFetEVjwOfGEc58U6rCsUOPKSVTcW3iMqjlak'
  },
  {
    id: 'p-quatro-queijos',
    name: 'Quatro Queijos',
    description: 'Mussarela, provolone, gorgonzola e catupiry original gratinados.',
    price: 52.90,
    category: 'Pizzas',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGIfNAy8X0pRWBtDcUnz12JlAJytQO2blf0yL0qi0-nhVpLBlGBHXR4hQNKrWAsEfz3evlB4a44wY4DZUNWZ0gUSB9039JqQJvdVhcYhQKh7CN8zPn08un0pk8ht4a9PKsHFRtKhlXJdSp8qEi7Ace9VoK6--wkkv31tbhkYV6XEAXDUcZ8VERCpBEAcY_XyCTEtCresFWy8fUF1AVH5hfhuibLJ_YrHhVRHyaHvHG8WDHyMkTwicQxBJS8ga3kY-HUBOzw1KsTRE'
  },
  {
    id: 'p-portuguesa',
    name: 'Portuguesa',
    description: 'Presunto, ovos cozidos, ervilha, cebola, azeitonas pretas e cobertura de mussarela.',
    price: 48.90,
    category: 'Pizzas',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeZmoPgg_V85KF3PcMwVfzszGa83yc_sdf7ij9s0xXUeUsJ6E1f5UgJuP2BGQu152w4RUF10n14UHU4nKlRoVUjnXQ6t7Z9gw2V01JpNPCNM_aa9mQmNG1gCkqC2oXG565TmZ84D5gueZfBOQyQ3kRWkebXCYC_VwLNMN8gcw69WvHorLsqH0gDvr2lSlGXp7CpIq2uJn_XDQM5A7VyNiqrTRJMV7leX_xf7QtGpUS8Sx09-ynvKkJxlV37vpAOY6-t8-lYNidsqA'
  },
  {
    id: 'b-coca-2l',
    name: 'Coca-Cola 2L',
    description: 'Refrigerante Coca-Cola Garrafa 2 Litros',
    price: 14.90,
    category: 'Bebidas',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgap4d0p-lh0r3KtPcYpqqxk1vUwzm4ZPxKqVdHGn1Answcu9nKGlpfq_2qMGTLuv6jafIvo3f04jPKC1WWeBiSSo2RQDXU84gDXZEGQ2uGfqdlW_r-8dsc1FmykNYjBzOTisLrILJGRVwA71CHqIwuCUIQ_LJOAm0n-QF1ykGr_nxZwVRseR3UPk4hV6iX3gHCpTBBdqX5WErr6pOO_qT8OwqxDmChTLya3rheuST4d0QtegPbWMT3rlysRuIre69F3gruSUnW78'
  },
  {
    id: 'b-guarana-lata',
    name: 'Guaraná Lata',
    description: 'Lata 350ml',
    price: 6.00,
    category: 'Bebidas',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjtE0HbfmhQpDLuT6cmARilR3_-JA2jxdeJxPRc83aTBtcW_EMz-kifdDb9XMGrKME9ic1wZjSJycVxoIMpCc1MuQa0C4n-hwZ88JTTvbqlUE6Dva7dH79pjdmjyELFws1M1top-Nm7CmWtudj4tdR6jF5xI8zdOhNONkyrCDhtmZHy0jNWDunZV9JOIBZQ5eGaN77TG2L1mNsreNjCFT9FAh7iJboU6ROEu-gJ1hwL4EnuZ5576nxD45ynZc4VOt6Kix295YH-BE'
  },
  {
    id: 's-petit-gateau',
    name: 'Petit Gâteau',
    description: 'Bolo de chocolate quente com sorvete de baunilha.',
    price: 24.90,
    category: 'Sobremesas',
    imageUrl: 'https://picsum.photos/400/400?random=1'
  },
  {
    id: 'pt-carne',
    name: 'Pastel de Carne',
    description: 'Carne moída temperada com especiarias da casa.',
    price: 12.00,
    category: 'Pastéis',
    imageUrl: 'https://images.unsplash.com/photo-1626379616459-b2ce1d9decbb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pt-queijo',
    name: 'Pastel de Queijo',
    description: 'Mussarela derretida com um toque de orégano.',
    price: 11.00,
    category: 'Pastéis',
    imageUrl: 'https://images.unsplash.com/photo-1626379616459-b2ce1d9decbb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  }
];

export const categories: Category[] = ['Pizzas', 'Pastéis', 'Combos', 'Bebidas', 'Sobremesas'];
