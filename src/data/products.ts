// Mock product data
export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  brand?: string;
  image: string;
  images: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  color: string;
  dimensions: string;
  material: string;
  madeIn: string;
  sizes?: string[];
}

// Added new categories and brands inspired by negosiodelux.store
export const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'handbags', name: 'Handbags' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'wallets', name: 'Wallets' },
  { id: 'collections', name: 'Collections' },
  { id: 'footwear', name: 'Footwear' },
  { id: 'clothing', name: 'Clothing' },
  { id: 'tshirts', name: 'T-shirts' },
  { id: 'jeans', name: 'Jeans' },
  { id: 'luggage', name: 'Luggage' }
];

export const brands = [
  { id: 'all', name: 'All Brands' },
  { id: 'zegna', name: 'ZEGNA' },
  { id: 'loro-piana', name: 'Loro Piana' },
  { id: 'louis-vuitton', name: 'Louis Vuitton' },
  { id: 'dior', name: 'Dior' },
  { id: 'gucci', name: 'Gucci' },
  { id: 'prada', name: 'Prada' },
  { id: 'hermes', name: 'Hermès' },
  { id: 'dolce-gabbana', name: 'Dolce & Gabbana' },
  { id: 'givenchy', name: 'Givenchy' },
  { id: 'fendi', name: 'Fendi' },
  { id: 'loewe', name: 'Loewe' },
  { id: 'armani', name: 'Armani' }
];

export const products: Product[] = [
  {
    id: 1,
    name: "Classic Tote Bag",
    price: 1950,
    description: "Crafted from the finest leather, our Classic Tote Bag combines timeless design with modern functionality. Spacious enough for all your essentials, this versatile piece features a secure zip closure and an interior pocket.",
    category: "handbags",
    image: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg",
    images: [
      "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg",
      "https://images.pexels.com/photos/904350/pexels-photo-904350.jpeg",
      "https://images.pexels.com/photos/2002717/pexels-photo-2002717.jpeg"
    ],
    isNew: true,
    color: "Black",
    dimensions: "35 × 29 × 18 cm",
    material: "Full-grain calfskin leather",
    madeIn: "Italy"
  },
  {
    id: 2,
    name: "Signature Shoulder Bag",
    price: 2250,
    description: "Our Signature Shoulder Bag exemplifies luxury and sophistication. This iconic design features our distinctive pattern, premium hardware, and adjustable strap for versatile carrying options.",
    category: "handbags",
    image: "https://images.pexels.com/photos/8390642/pexels-photo-8390642.jpeg",
    images: [
      "https://images.pexels.com/photos/8390642/pexels-photo-8390642.jpeg",
      "https://images.pexels.com/photos/5234763/pexels-photo-5234763.jpeg",
      "https://images.pexels.com/photos/5699515/pexels-photo-5699515.jpeg"
    ],
    isBestSeller: true,
    color: "Cream",
    dimensions: "26 × 18 × 10 cm",
    material: "Premium leather with gold-tone hardware",
    madeIn: "France"
  },
  {
    id: 3,
    name: "Elegant Crossbody",
    price: 1650,
    description: "Perfect for everyday elegance, our Elegant Crossbody combines style with practicality. The sleek design houses multiple compartments while maintaining a slim profile.",
    category: "handbags",
    image: "https://images.pexels.com/photos/5699515/pexels-photo-5699515.jpeg",
    images: [
      "https://images.pexels.com/photos/5699515/pexels-photo-5699515.jpeg",
      "https://images.pexels.com/photos/8390642/pexels-photo-8390642.jpeg",
      "https://images.pexels.com/photos/1374910/pexels-photo-1374910.jpeg"
    ],
    color: "Burgundy",
    dimensions: "22 × 15 × 6 cm",
    material: "Grained calfskin leather",
    madeIn: "Italy"
  },
  {
    id: 4,
    name: "Mini Evening Clutch",
    price: 950,
    description: "Our Mini Evening Clutch is the perfect companion for sophisticated evenings. Crafted with exquisite attention to detail, it features a detachable chain strap and secure magnetic closure.",
    category: "handbags",
    image: "https://images.pexels.com/photos/4452526/pexels-photo-4452526.jpeg",
    images: [
      "https://images.pexels.com/photos/4452526/pexels-photo-4452526.jpeg",
      "https://images.pexels.com/photos/1374910/pexels-photo-1374910.jpeg",
      "https://images.pexels.com/photos/1374128/pexels-photo-1374128.jpeg"
    ],
    isNew: true,
    color: "Gold",
    dimensions: "20 × 12 × 4 cm",
    material: "Satin with crystal embellishments",
    madeIn: "France"
  },
  {
    id: 5,
    name: "Luxury Leather Wallet",
    price: 650,
    description: "Our Luxury Leather Wallet combines functionality with elegant design. Featuring multiple card slots, bill compartments, and a secure coin pocket, it's the perfect accessory for organizing your essentials.",
    category: "wallets",
    image: "https://images.pexels.com/photos/2252360/pexels-photo-2252360.jpeg",
    images: [
      "https://images.pexels.com/photos/2252360/pexels-photo-2252360.jpeg",
      "https://images.pexels.com/photos/4452526/pexels-photo-4452526.jpeg",
      "https://images.pexels.com/photos/1374128/pexels-photo-1374128.jpeg"
    ],
    isBestSeller: true,
    color: "Brown",
    dimensions: "19 × 10 × 2 cm",
    material: "Full-grain leather",
    madeIn: "Spain"
  },
  {
    id: 6,
    name: "Designer Sunglasses",
    price: 450,
    description: "Our Designer Sunglasses combine fashion with function. The distinctive silhouette features UV protection, luxurious materials, and our subtle logo embellishment.",
    category: "accessories",
    image: "https://images.pexels.com/photos/9982109/pexels-photo-9982109.jpeg",
    images: [
      "https://images.pexels.com/photos/9982109/pexels-photo-9982109.jpeg",
      "https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg",
      "https://images.pexels.com/photos/1374128/pexels-photo-1374128.jpeg"
    ],
    color: "Tortoiseshell",
    dimensions: "145mm temple length",
    material: "Acetate frame with gold-tone accents",
    madeIn: "Italy"
  },
  {
    id: 7,
    name: "Signature Silk Scarf",
    price: 350,
    description: "Our Signature Silk Scarf adds a touch of luxury to any outfit. Hand-printed with our exclusive patterns, this versatile accessory can be styled multiple ways.",
    category: "accessories",
    image: "https://images.pexels.com/photos/1374128/pexels-photo-1374128.jpeg",
    images: [
      "https://images.pexels.com/photos/1374128/pexels-photo-1374128.jpeg",
      "https://images.pexels.com/photos/9982109/pexels-photo-9982109.jpeg",
      "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg"
    ],
    color: "Multicolor",
    dimensions: "90 × 90 cm",
    material: "100% Silk twill",
    madeIn: "France"
  },
  {
    id: 8,
    name: "Leather Card Holder",
    price: 250,
    description: "Sleek and sophisticated, our Leather Card Holder is perfect for those who prefer a minimal approach. Despite its slim profile, it accommodates all your essential cards and features our distinctive gold embossing.",
    category: "wallets",
    image: "https://images.pexels.com/photos/4452526/pexels-photo-4452526.jpeg",
    images: [
      "https://images.pexels.com/photos/4452526/pexels-photo-4452526.jpeg",
      "https://images.pexels.com/photos/2252360/pexels-photo-2252360.jpeg",
      "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg"
    ],
    color: "Navy Blue",
    dimensions: "10 × 7 × 1 cm",
    material: "Saffiano leather",
    madeIn: "Italy"
  },
  {
    id: 9,
    name: "Limited Edition Weekend Bag",
    price: 3850,
    description: "Part of our exclusive collection, the Limited Edition Weekend Bag combines distinctive design with practical functionality. Perfect for short getaways, it features ample storage, premium materials, and our signature detailing.",
    category: "collections",
    image: "https://images.pexels.com/photos/2002717/pexels-photo-2002717.jpeg",
    images: [
      "https://images.pexels.com/photos/2002717/pexels-photo-2002717.jpeg",
      "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg",
      "https://images.pexels.com/photos/8390642/pexels-photo-8390642.jpeg"
    ],
    isNew: true,
    color: "Tan",
    dimensions: "55 × 35 × 25 cm",
    material: "Premium leather with canvas accents",
    madeIn: "France"
  },
  {
    id: 10,
    name: "Heritage Collection Watch",
    price: 5950,
    description: "Our Heritage Collection Watch represents the pinnacle of luxury timekeeping. Featuring Swiss movement, sapphire crystal, and hand-finished details, this exceptional timepiece combines traditional craftsmanship with modern technology.",
    category: "collections",
    image: "https://images.pexels.com/photos/9982109/pexels-photo-9982109.jpeg",
    images: [
      "https://images.pexels.com/photos/9982109/pexels-photo-9982109.jpeg",
      "https://images.pexels.com/photos/8390642/pexels-photo-8390642.jpeg",
      "https://images.pexels.com/photos/2002717/pexels-photo-2002717.jpeg"
    ],
    isBestSeller: true,
    color: "Silver/Gold",
    dimensions: "40mm case diameter",
    material: "Stainless steel with alligator leather strap",
    madeIn: "Switzerland"
  },
  {
    id: 11,
    name: "Classic Belt",
    price: 450,
    description: "Our Classic Belt is the perfect finishing touch for any outfit. Crafted from the finest leather and featuring our distinctive buckle, it offers both style and durability.",
    category: "accessories",
    image: "https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg",
    images: [
      "https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg",
      "https://images.pexels.com/photos/2252360/pexels-photo-2252360.jpeg",
      "https://images.pexels.com/photos/1374128/pexels-photo-1374128.jpeg"
    ],
    color: "Black",
    dimensions: "3.5cm width",
    material: "Full-grain leather with palladium-finish buckle",
    madeIn: "Italy"
  },
  {
    id: 12,
    name: "Exotic Skin Evening Bag",
    price: 4250,
    description: "Our Exotic Skin Evening Bag is the epitome of luxury. Meticulously crafted from the finest materials, this statement piece features a jeweled clasp and chain strap, perfect for special occasions.",
    category: "handbags",
    image: "https://images.pexels.com/photos/1374910/pexels-photo-1374910.jpeg",
    images: [
      "https://images.pexels.com/photos/1374910/pexels-photo-1374910.jpeg",
      "https://images.pexels.com/photos/5699515/pexels-photo-5699515.jpeg",
      "https://images.pexels.com/photos/4452526/pexels-photo-4452526.jpeg"
    ],
    color: "Emerald Green",
    dimensions: "18 × 10 × 5 cm",
    material: "Exotic leather with crystal embellishments",
    madeIn: "France"
  },
  // New products inspired by negosiodelux.store
  {
    id: 21,
    name: "ZEGNA TRIPLE STITCH",
    price: 2400,
    description: "Experience the luxurious world of Zegna Collection with these Triple Stitch shoes. Quality craftsmanship meets timeless style in this elegant footwear option.",
    category: "footwear",
    brand: "zegna",
    image: "https://images.pexels.com/photos/19090/pexels-photo.jpg",
    images: [
      "https://images.pexels.com/photos/19090/pexels-photo.jpg",
      "https://images.pexels.com/photos/267320/pexels-photo-267320.jpeg",
      "https://images.pexels.com/photos/292999/pexels-photo-292999.jpeg"
    ],
    isNew: true,
    color: "Black",
    dimensions: "EU 42",
    material: "Premium leather",
    madeIn: "Italy",
    sizes: ["40", "41", "42", "43", "44", "45"]
  },
  {
    id: 22,
    name: "ZEGNA BASKETS TRIPLE STITCH™ SECONDSKIN BLEU",
    price: 2400,
    description: "Discover the luxurious Zegna Triple Stitch™ Secondskin in a stunning deep teal blue. Combining comfort with sophisticated design, these baskets are perfect for the modern gentleman.",
    category: "footwear",
    brand: "zegna",
    image: "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg",
    images: [
      "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg",
      "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg",
      "https://images.pexels.com/photos/1240892/pexels-photo-1240892.jpeg"
    ],
    isNew: true,
    color: "Dark Teal Blue",
    dimensions: "EU 43",
    material: "Premium leather with Secondskin technology",
    madeIn: "Italy",
    sizes: ["40", "41", "42", "43", "44", "45"]
  },
  {
    id: 23,
    name: "Loro Piana Summer Walk Loafer",
    price: 2099,
    description: "Discover our exclusive Loro Piana Summer Walk Loafer collection featuring superior quality mocassins. These iconic loafers combine comfort and elegance for a sophisticated casual look.",
    category: "footwear",
    brand: "loro-piana",
    image: "https://images.pexels.com/photos/2562992/pexels-photo-2562992.png",
    images: [
      "https://images.pexels.com/photos/2562992/pexels-photo-2562992.png",
      "https://images.pexels.com/photos/267242/pexels-photo-267242.jpeg",
      "https://images.pexels.com/photos/293406/pexels-photo-293406.jpeg"
    ],
    isBestSeller: true,
    color: "Beige",
    dimensions: "EU 42",
    material: "Premium suede",
    madeIn: "Italy",
    sizes: ["40", "41", "42", "43", "44", "45"]
  },
  {
    id: 24,
    name: "Louis Vuitton Signature Estate Major Loafer",
    price: 2400,
    description: "The Louis Vuitton Signature Estate Major Loafer combines timeless elegance with modern design. Crafted with precision and care, these loafers feature the iconic LV signature detailing.",
    category: "footwear",
    brand: "louis-vuitton",
    image: "https://images.pexels.com/photos/186035/pexels-photo-186035.jpeg",
    images: [
      "https://images.pexels.com/photos/186035/pexels-photo-186035.jpeg",
      "https://images.pexels.com/photos/1159670/pexels-photo-1159670.jpeg",
      "https://images.pexels.com/photos/292999/pexels-photo-292999.jpeg"
    ],
    isNew: false,
    color: "Brown",
    dimensions: "EU 42",
    material: "Premium leather with LV monogram",
    madeIn: "France",
    sizes: ["40", "41", "42", "43", "44", "45"]
  },
  {
    id: 25,
    name: "TSHIRT DOLCE GABBANA",
    price: 650,
    description: "This premium Dolce & Gabbana t-shirt features exceptional quality materials and iconic design elements. Add a touch of luxury to your casual wardrobe with this sophisticated piece.",
    category: "tshirts",
    brand: "dolce-gabbana",
    image: "https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg",
    images: [
      "https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg",
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg",
      "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg"
    ],
    isNew: true,
    color: "Black",
    dimensions: "Standard fit",
    material: "100% Premium cotton",
    madeIn: "Italy"
  },
  {
    id: 26,
    name: "TSHIRT DIOR",
    price: 650,
    description: "Ce t-shirt Dior vous offre un style intemporel avec une qualité de fabrication exceptionnelle. Fabriqué à partir de matériaux de haute qualité, il offre un confort et une durabilité incomparables. Avec son design élégant et emblématique, ce t-shirt vous permettra de vous démarquer avec un look raffiné.",
    category: "tshirts",
    brand: "dior",
    image: "https://images.pexels.com/photos/2881785/pexels-photo-2881785.jpeg",
    images: [
      "https://images.pexels.com/photos/2881785/pexels-photo-2881785.jpeg",
      "https://images.pexels.com/photos/2881789/pexels-photo-2881789.jpeg",
      "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg"
    ],
    isNew: false,
    color: "White",
    dimensions: "Slim fit",
    material: "Premium cotton blend",
    madeIn: "France"
  },
  {
    id: 27,
    name: "Valise Horizon 55",
    price: 7200,
    description: "La valise cabine Horizon 55 associe du cuir grainé noir à des finitions métalliques également noires. Extrêmement fonctionnelle grâce à ses quatre doubles roues compactes et à sa grande poignée permettant de la manier aisément, elle séduit par sa grande capacité intérieure. Ce modèle de la collection Aerogram est sublimé par les LV Initiales emblématiques ton sur ton disposées à l'avant sur le coin inférieur.",
    category: "luggage",
    brand: "louis-vuitton",
    image: "https://images.pexels.com/photos/2421374/pexels-photo-2421374.jpeg",
    images: [
      "https://images.pexels.com/photos/2421374/pexels-photo-2421374.jpeg",
      "https://images.pexels.com/photos/5417837/pexels-photo-5417837.jpeg",
      "https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg"
    ],
    isNew: true,
    color: "Black",
    dimensions: "55 × 39 × 21 cm",
    material: "Grained leather with metal accents",
    madeIn: "France"
  },
  {
    id: 28,
    name: "Givenchy Jeans",
    price: 649,
    description: "Elevate your style with these premium Givenchy jeans. Combining luxurious materials with impeccable design, these jeans offer both comfort and a sophisticated aesthetic.",
    category: "jeans",
    brand: "givenchy",
    image: "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg",
    images: [
      "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg",
      "https://images.pexels.com/photos/52518/jeans-pants-blue-shop-52518.jpeg",
      "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg"
    ],
    isNew: false,
    color: "Dark Blue",
    dimensions: "Slim fit",
    material: "Premium denim with stretch",
    madeIn: "Italy"
  },
  {
    id: 29,
    name: "FENDI ROMA JEANS",
    price: 649,
    description: "Experience luxury with these FENDI ROMA JEANS. Made with premium denim and featuring the iconic Fendi detailing, these jeans combine comfort with high fashion sensibility.",
    category: "jeans",
    brand: "fendi",
    image: "https://images.pexels.com/photos/1346187/pexels-photo-1346187.jpeg",
    images: [
      "https://images.pexels.com/photos/1346187/pexels-photo-1346187.jpeg",
      "https://images.pexels.com/photos/934063/pexels-photo-934063.jpeg",
      "https://images.pexels.com/photos/981619/pexels-photo-981619.jpeg"
    ],
    isNew: true,
    color: "Medium Blue",
    dimensions: "Regular fit",
    material: "Premium denim with FENDI branding",
    madeIn: "Italy"
  },
  {
    id: 30,
    name: "JACKET PRADA",
    price: 3200,
    description: "Cette veste Prada noire de luxe offre un confort inégalé pour les amateurs de mode. Fabriquée avec des matériaux de haute qualité, elle est à la fois élégante et pratique. Son design intemporel vous permet de la porter pour une variété d'occasions, ajoutant une touche de sophistication à n'importe quelle tenue.",
    category: "clothing",
    brand: "prada",
    image: "https://images.pexels.com/photos/6770028/pexels-photo-6770028.jpeg",
    images: [
      "https://images.pexels.com/photos/6770028/pexels-photo-6770028.jpeg",
      "https://images.pexels.com/photos/15851562/pexels-photo-15851562/free-photo-of-homme-mode-costume-luxe.jpeg",
      "https://images.pexels.com/photos/16170/pexels-photo.jpg"
    ],
    isNew: true,
    color: "Black",
    dimensions: "Standard fit",
    material: "Premium wool and nylon blend",
    madeIn: "Italy"
  }
];