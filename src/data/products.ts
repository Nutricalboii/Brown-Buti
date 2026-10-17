import { PRODUCT_PRICES_INR } from '../../shared/product-prices.mjs';

export interface Product {
  id: number | string;
  name: string;
  motif: string;
  price: number;
  priceUsd?: number;
  category: 'Blouses' | 'Sarees' | 'Underskirt';
  collection?: 'The Occasion Edit' | 'The Café Collection';
  personality: string[];
  keywords: string[];
  story: string;
  wearFor: string;
  description?: string[];
  details?: string[];
  fabric?: string;
  washingInstructions?: string;
  modelSize?: string;
  sizes?: string[];
  image: string;
  images: string[];
  color: string;
  shopifyVariantId?: string;
}

const productMedia = (slug: string, filename: string) => `/product-media/${slug}/${filename}`;

export const products: Product[] = [
  {
    id: 7,
    name: 'SAPPHIRE MOGRA',
    motif: 'Cage',
    price: PRODUCT_PRICES_INR['7'],
    priceUsd: 200,
    category: 'Sarees',
    collection: 'The Occasion Edit',
    sizes: ['One Size'],
    personality: ['Independent', 'Bold', 'Contemporary'],
    keywords: ['Silk', 'Cage Motif', 'Deep Blue', 'Statement'],
    story:
      'The cage motif was my little way of playing with the idea of freedom — because what’s more fun than putting a cage on a saree and then wearing it exactly how you want?',
    wearFor: 'I see this one on the woman who likes her classics with a little bit of edge. Dinner dates, cocktails, gallery evenings — basically anywhere you want someone to stop and ask, “Wait, is that a cage on your saree?”',
    image: productMedia('sapphire-mogra', 'DSC08199.webp'),
    images: [productMedia('sapphire-mogra', 'DSC08199.webp'), productMedia('sapphire-mogra', 'DSC08227.webp'), productMedia('sapphire-mogra', 'C5795.browser.webm'), productMedia('sapphire-mogra', 'C5813.browser.webm')],
    color: '#8898B8',
    shopifyVariantId: '48988074541305', // SAPPHIRE MOGRA
  },
  {
    id: 6,
    name: 'BUTTER MOGRA',
    motif: 'Pineapple',
    price: PRODUCT_PRICES_INR['6'],
    priceUsd: 200,
    category: 'Sarees',
    collection: 'The Occasion Edit',
    sizes: ['One Size'],
    personality: ['Sunny', 'Fresh', 'Effortless'],
    keywords: ['Silk', 'Pineapple Motif', 'Butter Yellow', 'Contemporary'],
    story:
      'Can we talk about how butter yellow is having such a moment right now? Gen Z, millennials — everyone seems to be obsessed with it. And then there’s the pineapple. Somehow, the two together just made perfect sense to me. It gives this saree that fresh, playful energy without making it feel too young.',
    wearFor: 'Haldi? Absolutely. Brunch date? Of course. Day wedding? Take her. She’s basically made for happy occasions.',
    image: productMedia('butter-mogra', 'DSC08136.webp'),
    images: [productMedia('butter-mogra', 'DSC08136.webp'), productMedia('butter-mogra', 'DSC08139(1).webp'), productMedia('butter-mogra', 'DSC08139.webp'), productMedia('butter-mogra', 'DSC08167.webp'), productMedia('butter-mogra', 'DSC08129.webp'), productMedia('butter-mogra', 'DSC08166.webp'), productMedia('butter-mogra', 'DSC08100.webp'), productMedia('butter-mogra', 'C5770.browser.webm'), productMedia('butter-mogra', 'C5756.browser.webm'), productMedia('butter-mogra', 'C5775.browser.webm')],
    color: '#D4C08A',
    shopifyVariantId: '48991334367481', // BUTTER MOGRA
  },
  {
    id: 5,
    name: 'RUBY DOE',
    motif: 'Deer',
    price: PRODUCT_PRICES_INR['5'],
    priceUsd: 200,
    category: 'Sarees',
    collection: 'The Occasion Edit',
    sizes: ['One Size'],
    personality: ['Soft', 'Romantic', 'Graceful'],
    keywords: ['Silk', 'Deer Motif', 'Ruby Tones', 'Romantic'],
    story:
      'I imagined Ruby Doe on the girl who has just become a bride — not in a heavy bridal saree, but in that beautiful new-bride phase where you want to wear colour, dress up and still feel like yourself. The little deer motif makes the red feel softer and more playful.',
    wearFor: 'Wear her to a wedding, a bridesmaid moment, an intimate dinner or that first wedding season after you say “I do.”',
    image: productMedia('ruby-doe', 'DSC07551.webp'),
    images: [productMedia('ruby-doe', 'DSC07551.webp'), productMedia('ruby-doe', 'DSC07544.webp'), productMedia('ruby-doe', 'DSC07537.webp'), productMedia('ruby-doe', 'DSC07540.webp'), productMedia('ruby-doe', 'DSC07528.webp'), productMedia('ruby-doe', 'DSC07541.webp'), productMedia('ruby-doe', 'DSC07593.webp'), productMedia('ruby-doe', 'DSC07525.webp'), productMedia('ruby-doe', 'C5705.browser.webm'), productMedia('ruby-doe', 'C5706.browser.webm'), productMedia('ruby-doe', 'C5710.browser.webm')],
    color: '#B89090',
    shopifyVariantId: '48991348293881', // RUBY DOE
  },
  {
    id: 1,
    name: 'JALPARIÉ',
    motif: 'Seahorse',
    price: PRODUCT_PRICES_INR['1'],
    priceUsd: 200,
    category: 'Sarees',
    collection: 'The Occasion Edit',
    sizes: ['One Size'],
    personality: ['Elegant', 'Refined', 'Quiet Luxury'],
    keywords: ['Silk', 'Seahorse Motif', 'Artisan Embroidery', 'Premium'],
    story:
      'Think destination wedding by the sea. Barely-there breeze, cocktails at sunset, your hair doing its own thing — and a silk saree with tiny seahorses. This is exactly why I wanted the seahorse on it. It’s unexpected, but somehow feels completely at home.',
    wearFor: 'And honestly? This is the one I’d wear if I wanted people to ask me, “Where is that saree from?”',
    image: productMedia('jalparie', 'DSC01061.webp'),
    images: [productMedia('jalparie', 'DSC01061.webp'), productMedia('jalparie', 'DSC01143.webp'), productMedia('jalparie', 'C9144.browser.webm'), productMedia('jalparie', 'C9153.browser.webm')],
    color: '#D4C5B0',
    shopifyVariantId: '48991392628985', // JALPARIE
  },
  {
    id: 2,
    name: 'ROSÉ MOGRA',
    motif: 'Owl',
    price: PRODUCT_PRICES_INR['2'],
    priceUsd: 200,
    category: 'Sarees',
    collection: 'The Occasion Edit',
    sizes: ['One Size'],
    personality: ['Confident', 'Intelligent', 'Playful'],
    keywords: ['Silk', 'Owl Motif', 'Rose Tones', 'Artisan Embroidery'],
    story:
      'I wanted something soft and feminine, but then I thought — why should pretty always mean predictable? So came the owl. A little unusual, a little mysterious and definitely not the motif you expect to find on a saree.',
    wearFor: 'I see this one at intimate dinners, date nights, sundowners and those occasions where you want to look pretty but still have something interesting going on.',
    image: productMedia('rose-mogra', 'DSC09558.webp'),
    images: [productMedia('rose-mogra', 'DSC09558.webp'), productMedia('rose-mogra', 'DSC09557.webp'), productMedia('rose-mogra', 'DSC09572.webp'), productMedia('rose-mogra', 'C6947.browser.webm'), productMedia('rose-mogra', 'C6972.browser.webm'), productMedia('rose-mogra', 'C6981.browser.webm')],
    color: '#C9B5A8',
    shopifyVariantId: '48991405605113', // ROSÉ MOGRA
  },
  {
    id: 3,
    name: 'RIWAAYAT',
    motif: 'Elephant',
    price: PRODUCT_PRICES_INR['3'],
    priceUsd: 200,
    category: 'Sarees',
    collection: 'The Occasion Edit',
    sizes: ['One Size'],
    personality: ['Heritage', 'Regal', 'Timeless'],
    keywords: ['Silk', 'Elephant Motif', 'Heritage', 'Regal'],
    story:
      'This one is very close to my heart. The elephant felt like the perfect place to start — deeply Indian, instantly recognisable, but playful enough to become something completely new through our patchwork. And you clearly agreed. Riwayaat is our best-seller. The saree that made people stop, ask questions and discover the label for the first time.',
    wearFor: 'A little bit of our riwayaat, with a lot of our personality.',
    image: productMedia('riwaayat', 'NGD_2247_Original.webp'),
    images: [productMedia('riwaayat', 'NGD_2247_Original.webp'), productMedia('riwaayat', 'NGD_2325.webp'), productMedia('riwaayat', 'NGD_2225_Original.webp'), productMedia('riwaayat', 'NGD_2200_Original.webp'), productMedia('riwaayat', 'NGD_2229_Original.webp'), productMedia('riwaayat', 'NGD_2282_Original.webp'), productMedia('riwaayat', 'NGD_2358_Original.webp'), productMedia('riwaayat', 'NGD_2181_Original.webp'), productMedia('riwaayat', 'IMG_0995.webp'), productMedia('riwaayat', 'IMG_1023.webp')],
    color: '#B8A898',
    shopifyVariantId: '48996869701881', // RIWAAYAT
  },
  {
    id: 4,
    name: 'SUNDOWNER SILK',
    motif: 'Fish',
    price: PRODUCT_PRICES_INR['4'],
    priceUsd: 200,
    category: 'Sarees',
    collection: 'The Occasion Edit',
    sizes: ['One Size'],
    personality: ['Playful', 'Artistic', 'Free-Spirited'],
    keywords: ['Silk', 'Fish Motif', 'Warm Tones', 'Artisan'],
    story:
      'Two little fish swimming across a silk saree. I don’t know — I just loved the idea. There’s something about this one that feels like holiday energy. A sunset dinner, a beachside celebration, a long evening with nowhere to be.',
    wearFor: 'Basically, the saree equivalent of saying, “Let’s stay for one more drink.”',
    image: productMedia('sundowner-silk', 'DSC09621.webp'),
    images: [productMedia('sundowner-silk', 'DSC09621.webp'), productMedia('sundowner-silk', 'DSC09619.webp'), productMedia('sundowner-silk', 'C6936.browser.webm'), productMedia('sundowner-silk', 'C6987.browser.webm')],
    color: '#C4A882',
    shopifyVariantId: '48996873732345', // SUNDOWNER SILK
  },
  {
    id: 'pistachio',
    name: 'Pistachio',
    motif: 'Polka dot',
    price: PRODUCT_PRICES_INR.pistachio,
    priceUsd: 200,
    category: 'Sarees',
    collection: 'The Café Collection',
    sizes: ['One Size'],
    personality: ['Playful', 'Easy-going', 'Daytime'],
    keywords: ['Polka dot', 'Daytime', 'Soft fabric', 'Delicate detailing'],
    story:
      'A soft, playful polka-dot saree made for the daytime.',
    wearFor:
      'Its comfortable fabric and delicate detailing make it easy to wear from work to brunch, lunch dates and daytime events. Pair it with a statement blouse for a more contemporary look or keep it classic and understated.',
    description: [
      'A soft, playful polka-dot saree made for the daytime.',
      'Its comfortable fabric and delicate detailing make it easy to wear from work to brunch, lunch dates and daytime events. Pair it with a statement blouse for a more contemporary look or keep it classic and understated.',
      'A saree you can actually reach for often — not just save for special occasions.',
    ],
    image: productMedia('pistachio', 'model-cover.webp'),
    images: [productMedia('pistachio', 'model-cover.webp'), productMedia('pistachio', 'C8907.browser.webm'), productMedia('pistachio', 'C8919.browser.webm'), productMedia('pistachio', 'C8925.browser.webm')],
    color: '#B9C6A0',
  },
  {
    id: 'strawberry-latte',
    name: 'Strawberry Latte',
    motif: 'Polka dot',
    price: PRODUCT_PRICES_INR['strawberry-latte'],
    priceUsd: 200,
    category: 'Sarees',
    collection: 'The Café Collection',
    sizes: ['One Size'],
    personality: ['Feminine', 'Playful', 'Effortless'],
    keywords: ['Pink polka dot', 'Daytime', 'Soft fabric', 'Easy-going'],
    story:
      'Our pink polka-dot saree — feminine, playful and effortlessly easy to style.',
    wearFor:
      'Made for coffee dates, brunches, work days and daytime celebrations, it combines a soft fabric with delicate detailing and an easy-going silhouette.',
    description: [
      'Our pink polka-dot saree — feminine, playful and effortlessly easy to style.',
      'Made for coffee dates, brunches, work days and daytime celebrations, it combines a soft fabric with delicate detailing and an easy-going silhouette.',
      'Pair it with a statement blouse, a metallic blouse or your favourite classic blouse to create a completely different look each time.',
    ],
    image: productMedia('strawberry-latte', 'DSC03388.webp'),
    // The shared album has no model-worn Strawberry Latte photos or video yet.
    images: [productMedia('strawberry-latte', 'DSC03388.webp'), productMedia('strawberry-latte', 'DSC03421.webp')],
    color: '#D5A6A7',
  },
  {
    id: 8,
    name: 'Chandini',
    motif: 'Designer Underskirt',
    price: PRODUCT_PRICES_INR['8'],
    priceUsd: 120,
    category: 'Underskirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    personality: ['Regal', 'Elegant'],
    keywords: ['Underskirt', 'Silk Lining', 'Petticoat', 'Essential'],
    story:
      'I wanted the saree to move. So I made the underskirt ridiculously flared. The kind that gives your saree that gorgeous swish when you walk, sit, twirl — basically whenever you feel like being a little dramatic.',
    wearFor: 'You won’t necessarily see Chaandini. But you’ll definitely notice what she does.',
    image: productMedia('chandini', 'DSC03169.webp'),
    images: [productMedia('chandini', 'DSC03169.webp'), productMedia('chandini', 'C9236.browser.webm'), productMedia('chandini', 'DSC03186.webp'), productMedia('chandini', 'DSC03155.webp'), productMedia('chandini', 'DSC03193.webp')],
    color: '#D8D0C4',
    shopifyVariantId: '48996875534585', // CHAANDINI
  },
  {
    id: 'chandi',
    name: 'Chandi — Silver',
    motif: 'Metallic',
    price: PRODUCT_PRICES_INR.chandi,
    priceUsd: 100,
    category: 'Blouses',
    personality: ['Versatile', 'Easy to style', 'Polished'],
    keywords: ['Metallic finish', 'Silver', 'Versatile', 'Easy to style'],
    story:
      'A versatile metallic blouse designed to work with almost any saree. The silver finish adds just the right amount of shine without overpowering the saree, making it easy to dress up or down.',
    wearFor:
      'Pair it with silk, prints, solids or even your everyday sarees. Wear it for weddings, cocktails, festive celebrations or simply when you want to give an old saree a completely new look.',
    description: [
      'A versatile metallic blouse designed to work with almost any saree. The silver finish adds just the right amount of shine without overpowering the saree, making it easy to dress up or down.',
      'Pair it with silk, prints, solids or even your everyday sarees. Wear it for weddings, cocktails, festive celebrations or simply when you want to give an old saree a completely new look.',
    ],
    details: ['Metallic finish', 'Versatile', 'Easy to style', 'Pairs with multiple sarees'],
    fabric: 'Metallic gota v',
    washingInstructions: 'Dry Clean Only',
    modelSize: 'Small',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    image: productMedia('chandi', '360DD99D-9A11-435F-BAAA-D11394AB83E1.webp'),
    images: [productMedia('chandi', '360DD99D-9A11-435F-BAAA-D11394AB83E1.webp'), productMedia('chandi', 'DSC03248.webp'), productMedia('chandi', 'DSC03228.webp'), productMedia('chandi', 'DSC03277.webp')],
    color: '#C4904E',
  },
  {
    id: 'tamara',
    name: 'Tamara — Copper',
    motif: 'Metallic',
    price: PRODUCT_PRICES_INR.tamara,
    priceUsd: 100,
    category: 'Blouses',
    personality: ['Warm', 'Versatile', 'Effortless'],
    keywords: ['Metallic finish', 'Copper', 'Versatile', 'Easy to style'],
    story:
      'A warm metallic copper blouse that brings an effortless richness to any saree. Designed as a versatile wardrobe piece, Tamara works beautifully with both traditional and contemporary sarees.',
    wearFor:
      'From weddings and cocktails to Garba, Dandiya and evening celebrations, it is the kind of blouse you can keep coming back to — simply change the saree and create an entirely new look each time.',
    description: [
      'A warm metallic copper blouse that brings an effortless richness to any saree. Designed as a versatile wardrobe piece, Tamara works beautifully with both traditional and contemporary sarees.',
      'From weddings and cocktails to Garba, Dandiya and evening celebrations, it is the kind of blouse you can keep coming back to — simply change the saree and create an entirely new look each time.',
    ],
    details: ['Metallic finish', 'Versatile', 'Easy to style', 'Pairs with multiple sarees'],
    fabric: 'Metallic gota v',
    washingInstructions: 'Dry Clean Only',
    modelSize: 'Small',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    image: productMedia('tamara', 'BB012038-BE11-42CC-A53E-F99B9F0C9FF0.webp'),
    images: [productMedia('tamara', 'BB012038-BE11-42CC-A53E-F99B9F0C9FF0.webp'), productMedia('tamara', 'DSC03596.webp'), productMedia('tamara', 'C9275.browser.webm'), productMedia('tamara', 'C9274.browser.webm'), productMedia('tamara', 'C9277.browser.webm')],
    color: '#A67340',
  },
];
