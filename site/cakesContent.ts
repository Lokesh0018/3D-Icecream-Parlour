import { hero as icecreamHero } from "./icecreamContent";

export const STUDIO = "Triozen Tech";

export const FLAVOUR = {
  pistachio: "#bfe3a6",
  mango: "#ffcf4d",
  strawberry: "#ffc2d4",
  coffee: "#ecd3b4",
  cocoa: "#6b3a2a",
  meetha: "#ffe2ad",
  blueberry: "#a9bfff",
};

export const nav = {
  logo: "Melt Theory",
  links: [
    { label: "Flavours", href: "#flavours" },
    { label: "Build a cake", href: "#build" },
    { label: "Treats", href: "#treats" },
    { label: "Deals", href: "#deals" },
    { label: "Patisseries", href: "#patisseries" },
  ],
  cta: { label: "Order", href: "#build" },
};

export const hero = {
  word: "BAKE",
  pill: { label: "Cake of the week", value: "Dark Chocolate Truffle" },
  heading: ["Small Bakes.", "*Big* Moments."],
  text: "Baked fresh in Hyderabad every morning. Real butter, premium chocolate, no shortcuts.",
  ctas: [
    { label: "Pick your cake", href: "#flavours" },
    { label: "Find a patisserie", href: "#parlours" },
  ],
  cone: "/images/bake/cake-hero.webp", // Would be a cake image
  toppings: icecreamHero.toppings,
};

export const wave = {
  top: ["Black Forest", "Red Velvet", "Chocolate Truffle", "Pineapple", "Butterscotch", "Fruit Cake"],
  bottom: ["Baked fresh daily", "Custom designs", "Made in Hyderabad", "No shortcuts"],
};

export type Flavour = {
  id: string;
  name: string;
  note: string;
  price: number;
  tag?: string;
  fill: string;
  ink: string;
  image: string;
};

export const flavours: Flavour[] = [
  { id: "black-forest", name: "Black Forest", note: "Classic chocolate sponge, cherries, and whipped cream", price: 1200, tag: "Bestseller", fill: FLAVOUR.pistachio, ink: "#2b1233", image: "/images/bake/black-forest.webp" },
  { id: "red-velvet", name: "Red Velvet", note: "Rich red velvet sponge with cream cheese frosting", price: 1400, tag: "Seasonal", fill: FLAVOUR.mango, ink: "#2b1233", image: "/images/bake/red-velvet.webp" },
  { id: "chocolate-truffle", name: "Chocolate Truffle", note: "Dense chocolate cake with dark chocolate ganache", price: 1500, tag: "Kids' pick", fill: FLAVOUR.strawberry, ink: "#2b1233", image: "/images/bake/chocolate.webp" },
  { id: "pineapple", name: "Pineapple", note: "Vanilla sponge with fresh pineapple and cream", price: 1100, tag: "New", fill: FLAVOUR.coffee, ink: "#2b1233", image: "/images/bake/pine-apple.webp" },
  { id: "butterscotch", name: "Butterscotch", note: "Caramel sponge with crunchy butterscotch praline", price: 1300, tag: "Vegan options", fill: FLAVOUR.cocoa, ink: "#fff1e6", image: "/images/bake/butter-scotch.webp" },
  { id: "fruit-cake", name: "Fruit Cake", note: "Mixed fresh fruit layered with light vanilla cream", price: 1600, tag: "Only here", fill: FLAVOUR.meetha, ink: "#2b1233", image: "/images/bake/fruit.webp" },
];

export const shelf = {
  eyebrow: "Today's display",
  heading: ["Today's", "*bakes*"],
  text: "Six signature cakes in the display today. Baked this morning, gone by tonight.",
  unit: "/ kg",
};

const byId = (id: string) => flavours.find((f) => f.id === id)!;

export const builder = {
  eyebrow: "Build your cake",
  heading: ["Build your", "*cake*"],
  text: "Pick your layers, fillings, and frosting. We bake it fresh for your celebration.",
  cone: "/images/melt/cone-empty.webp", // Replace with empty cake stand
  coneLine: { name: "Cake stand", price: "Free" },
  scoops: [byId("black-forest"), byId("red-velvet"), byId("chocolate-truffle")], // Used as layers
  tints: ["#fff1f4", "#e9f5e0", "#fff2c9", "#f6e3d8"],
  cta: "Add to order",
};

export const slow = {
  eyebrow: "How it's baked",
  heading: ["Baked the", "*slow* way"],
  text: "No premix, no powder. Ovens turn on at 4 AM and the first batch is ready by noon.",
  frames: "/frames/melt-pour",
  alt: "Warm chocolate poured over a cake, topped with pistachios",
  panel: "linear-gradient(180deg, #e2c4c6, #ebd7dd)",
  focus: [
    [0, 0.74],
    [0.33, 0.66],
    [0.66, 0.57],
    [1, 0.52],
  ] as [number, number][],
  captions: [
    { title: "Real butter", text: "in every single batch", at: 0.1, pos: "md:left-[4%] md:bottom-[24%]", fill: "#ffffff" },
    { title: "45 minutes", text: "of slow baking", at: 0.35, pos: "md:left-[13%] md:bottom-[6%]", fill: FLAVOUR.mango },
    { title: "Hand frosted", text: "with love and care", at: 0.6, pos: "md:left-[21%] md:bottom-[33%]", fill: FLAVOUR.pistachio },
  ],
};

export const treats = {
  eyebrow: "The menu",
  heading: ["Pick a", "*treat*"],
  items: [
    { name: "Slices", count: "12 flavours", tone: FLAVOUR.strawberry, hint: "Cake slices", photo: "/images/melt/cat-scoops.webp" },
    { name: "Cupcakes", count: "8 varieties", tone: FLAVOUR.mango, hint: "Cupcakes", photo: "/images/melt/cat-sundae.webp" },
    { name: "Party Cakes", count: "1kg · 2kg", tone: FLAVOUR.pistachio, hint: "Whole cakes", photo: "/images/melt/cat-tub.webp" },
    { name: "Brownies", count: "6 types", tone: FLAVOUR.coffee, hint: "Brownies", photo: "/images/melt/cat-shake.webp" },
    { name: "Wedding Cakes", count: "Order 7 days ahead", tone: FLAVOUR.blueberry, hint: "Tiered cakes", photo: "/images/melt/cat-cake.webp" },
    { name: "Macarons", count: "Assorted boxes", tone: FLAVOUR.meetha, hint: "Macarons", photo: "/images/melt/cat-kulfi.webp" },
  ],
};

export const deals = {
  eyebrow: "Sweet deals",
  heading: ["Treat", "*everyone*"],
  text: "Something for the whole family, the date night and the 4 PM craving. At every patisserie.",
  items: [
    { id: "family", title: "Weekend Party Box", text: "Assorted box of 12 cupcakes and 6 brownies.", price: "₹999", was: "₹1,240", badge: "Every Weekend", tone: FLAVOUR.pistachio, hint: "Party box", photo: "/images/melt/deal-family.webp" },
    { id: "date", title: "Date-night dessert", text: "Two slices of rich chocolate cake, warm fudge.", price: "₹449", badge: "After 7 PM", tone: FLAVOUR.strawberry, hint: "Cake for two", photo: "/images/melt/deal-date.webp" },
    { id: "happy", title: "Second slice half price", text: "Every day between 4 and 6 PM.", price: "4–6 PM", badge: "Happy hour", tone: FLAVOUR.cocoa, hint: "" },
    { id: "cake", title: "Birthday specials", text: "Free candle set and custom message with every 1kg cake.", price: "from ₹1,199", badge: "Made to order", tone: FLAVOUR.blueberry, hint: "" },
  ],
};

export const notes = {
  eyebrow: "Love notes",
  heading: ["Sweet *moments*,", "happy hearts"],
  items: [
    { name: "Ananya & friends", where: "Gachibowli", text: "The rasmalai cake was the star of the party.", rating: 5, tone: FLAVOUR.mango, hint: "Friends with cake", photo: "/images/melt/note-friends.webp", tilt: -4 },
    { name: "Meher, age 7", where: "Jubilee Hills", text: "I want the strawberry cake for every birthday now.", rating: 5, tone: FLAVOUR.strawberry, hint: "Kid with cake", photo: "/images/melt/note-kid.webp", tilt: 3 },
    { name: "Rahul & Sana", where: "Banjara Hills", text: "Their tiramisu is out of this world.", rating: 5, tone: FLAVOUR.coffee, hint: "Couple at night", photo: "/images/melt/note-couple.webp", tilt: -2 },
    { name: "The Reddys", where: "Jubilee Hills", text: "Best chocolate truffle in Hyderabad.", rating: 5, tone: FLAVOUR.pistachio, hint: "Family on a bench", photo: "/images/melt/note-family.webp", tilt: 4 },
  ],
};

export const parlours = {
  eyebrow: "Our patisseries",
  heading: ["Come say", "*hi*"],
  text: "Three beautiful patisseries across Hyderabad. Walk in, enjoy a slice, take your time.",
  photo: { photo: "/images/melt/parlour.webp", tone: FLAVOUR.pistachio, hint: "Patisserie interior" },
  items: [
    { name: "Jubilee Hills", note: "The first one. Garden seating.", hours: "12 PM – 11 PM", late: "Till midnight Fri–Sun" },
    { name: "Gachibowli", note: "Near the offices. Fast queue.", hours: "11 AM – 11 PM", late: "Happy hour 4–6 PM" },
    { name: "Banjara Hills", note: "The big one. Custom cake counter.", hours: "12 PM – 12 AM", late: "Open late every day" },
  ],
};

export const footer = {
  word: "MELT THEORY",
  newsletter: {
    title: "Get the new bake first",
    text: "One email when a new cake hits the counter. That's it.",
    placeholder: "you@email.com",
  },
  columns: [
    { title: "Eat", links: ["Signatures", "Cupcakes", "Party Cakes", "Macarons"] },
    { title: "Visit", links: ["Jubilee Hills", "Gachibowli", "Banjara Hills"] },
    { title: "Hello", links: ["Instagram", "Weddings", "Careers"] },
  ],
  note: `Concept website by ${STUDIO}. Melt Theory is a design concept; cakes and prices are samples.`,
};
