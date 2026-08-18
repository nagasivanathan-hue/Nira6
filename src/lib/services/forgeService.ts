import { ForgeProduct, ForgePrinter, ForgeFilament, ForgeCustomOrder, ForgeDesignRequest, ForgeSavedConfig } from '@/types';

/* ═══════════════════════════════════════════════════════════
   Forge Your Ideas (FYI) — Seed Data & Service Abstraction
   ═══════════════════════════════════════════════════════════ */

export const SAMPLE_FORGE_PRODUCTS: ForgeProduct[] = [
  {
    id: 'fp-101',
    name: 'Ergonomic Headphone Stand (Matte Finish)',
    slug: 'ergonomic-headphone-stand',
    description: 'Minimalist industrial headphone stand custom 3D printed with reinforced honeycomb infill for maximum stability.',
    category: 'Desk Accessories',
    price: 1299,
    originalPrice: 1699,
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    ],
    printTimeMinutes: 240,
    weightGrams: 180,
    dimensions: '140 × 120 × 240 mm',
    defaultMaterial: 'PLA',
    availableMaterials: ['PLA', 'PETG', 'ABS'],
    availableColors: ['Matte Black', 'Cyber White', 'Signal Red'],
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 28,
  },
  {
    id: 'fp-102',
    name: 'Precision Lens Cap Clip Holder',
    slug: 'precision-lens-cap-holder',
    description: 'Never lose your camera lens caps again. Clips onto your camera strap securely. 3D printed in impact-resistant PETG.',
    category: 'Photography Gear',
    price: 699,
    originalPrice: 899,
    images: [
      'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=800&q=80',
    ],
    printTimeMinutes: 90,
    weightGrams: 45,
    dimensions: '85 × 85 × 25 mm',
    defaultMaterial: 'PETG',
    availableMaterials: ['PETG', 'TPU'],
    availableColors: ['Matte Black', 'Safety Yellow'],
    inStock: true,
    featured: true,
    rating: 4.8,
    reviewCount: 42,
  },
  {
    id: 'fp-103',
    name: 'Modular Cybernetic Cable Management Spine',
    slug: 'cybernetic-cable-spine',
    description: 'Interlocking 3D printed cable guide clips for clean studio desk setups. Includes 10 magnetic links.',
    category: 'Desk Accessories',
    price: 499,
    originalPrice: 699,
    images: [
      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80',
    ],
    printTimeMinutes: 75,
    weightGrams: 60,
    dimensions: '110 × 45 × 30 mm',
    defaultMaterial: 'PLA',
    availableMaterials: ['PLA', 'PETG'],
    availableColors: ['Matte Black', 'Cyber White', 'Neon Green'],
    inStock: true,
    featured: false,
    rating: 4.7,
    reviewCount: 19,
  },
  {
    id: 'fp-104',
    name: 'Collector Cyber Mech Art Figurine',
    slug: 'collector-cyber-mech-figurine',
    description: 'High-detail 3D printed art piece featuring intricate mechanical aesthetics. Ultra fine 0.12mm layer height.',
    category: 'Miniatures & Art',
    price: 2499,
    originalPrice: 2999,
    images: [
      'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80',
    ],
    printTimeMinutes: 420,
    weightGrams: 260,
    dimensions: '120 × 100 × 180 mm',
    defaultMaterial: 'PLA',
    availableMaterials: ['PLA', 'Resin'],
    availableColors: ['Matte Black', 'Gunmetal Gray'],
    inStock: true,
    featured: true,
    rating: 5.0,
    reviewCount: 15,
  },
];

export const SAMPLE_FORGE_PRINTERS: ForgePrinter[] = [
  {
    id: 'pr-01',
    name: 'Bambu Lab A1',
    model: 'Bambu Lab A1 Combo',
    buildVolumeX: 256,
    buildVolumeY: 256,
    buildVolumeZ: 256,
    nozzleDiameter: 0.4,
    maxPrintSpeed: 500,
    hourlyCost: 150,
    status: 'IDLE',
  },
  {
    id: 'pr-02',
    name: 'Prusa MK4S',
    model: 'Original Prusa MK4S',
    buildVolumeX: 250,
    buildVolumeY: 210,
    buildVolumeZ: 220,
    nozzleDiameter: 0.4,
    maxPrintSpeed: 300,
    hourlyCost: 180,
    status: 'IDLE',
  },
];

export const SAMPLE_FORGE_FILAMENTS: ForgeFilament[] = [
  {
    id: 'fil-01',
    material: 'PLA',
    color: 'Matte Black',
    colorHex: '#1e1e1e',
    pricePerKg: 1499,
    stockGrams: 1000,
    lowStockThresholdGrams: 200,
    density: 1.24,
  },
  {
    id: 'fil-02',
    material: 'PETG',
    color: 'Signal Red',
    colorHex: '#ef4444',
    pricePerKg: 1799,
    stockGrams: 1000,
    lowStockThresholdGrams: 200,
    density: 1.27,
  },
  {
    id: 'fil-03',
    material: 'PLA',
    color: 'Cyber White',
    colorHex: '#f8fafc',
    pricePerKg: 1499,
    stockGrams: 850,
    lowStockThresholdGrams: 200,
    density: 1.24,
  },
];

class ForgeService {
  private products: ForgeProduct[] = [...SAMPLE_FORGE_PRODUCTS];
  private printers: ForgePrinter[] = [...SAMPLE_FORGE_PRINTERS];
  private filaments: ForgeFilament[] = [...SAMPLE_FORGE_FILAMENTS];
  private customOrders: ForgeCustomOrder[] = [];
  private designRequests: ForgeDesignRequest[] = [];
  private savedConfigs: ForgeSavedConfig[] = [];

  // Products
  async getProducts(category?: string, query?: string): Promise<ForgeProduct[]> {
    let result = [...this.products];
    if (category && category !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (query && query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return result;
  }

  async getProductById(id: string): Promise<ForgeProduct | null> {
    return this.products.find(p => p.id === id || p.slug === id) || null;
  }

  // Printers
  async getPrinters(): Promise<ForgePrinter[]> {
    return this.printers;
  }

  // Filaments
  async getFilaments(): Promise<ForgeFilament[]> {
    return this.filaments;
  }

  // Custom Orders
  async createCustomOrder(order: Omit<ForgeCustomOrder, 'id' | 'createdAt'>): Promise<ForgeCustomOrder> {
    const newOrder: ForgeCustomOrder = {
      ...order,
      id: `fco-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.customOrders.unshift(newOrder);
    return newOrder;
  }

  async getUserCustomOrders(userId: string): Promise<ForgeCustomOrder[]> {
    return this.customOrders.filter(o => o.userId === userId);
  }

  // Design Requests
  async createDesignRequest(req: Omit<ForgeDesignRequest, 'id' | 'createdAt' | 'status'>): Promise<ForgeDesignRequest> {
    const newReq: ForgeDesignRequest = {
      ...req,
      id: `fdr-${Date.now()}`,
      status: 'RECEIVED',
      createdAt: new Date().toISOString(),
    };
    this.designRequests.unshift(newReq);
    return newReq;
  }

  async getUserDesignRequests(userId: string): Promise<ForgeDesignRequest[]> {
    return this.designRequests.filter(r => r.userId === userId);
  }

  // Saved Configs
  async saveConfig(config: Omit<ForgeSavedConfig, 'id' | 'createdAt'>): Promise<ForgeSavedConfig> {
    const newConfig: ForgeSavedConfig = {
      ...config,
      id: `fsc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.savedConfigs.unshift(newConfig);
    return newConfig;
  }

  async getUserSavedConfigs(userId: string): Promise<ForgeSavedConfig[]> {
    return this.savedConfigs.filter(c => c.userId === userId);
  }
}

export const forgeService = new ForgeService();
