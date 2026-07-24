export const salons = [
  {
    id: 'urban-edge',
    name: 'Urban Edge Salon',
    area: 'Downtown',
    rating: 4.8,
    reviews: 248,
    price: 'From $25',
    image: '/src/assets/hero.png',
    services: ['Haircut', 'Beard trim', 'Color'],
  },
  {
    id: 'classic-cuts',
    name: 'Classic Cuts Studio',
    area: 'Riverside',
    rating: 4.6,
    reviews: 176,
    price: 'From $18',
    image: '/src/assets/hero.png',
    services: ['Fade', 'Shave', 'Kids cut'],
  },
  {
    id: 'luxe-grooming',
    name: 'Luxe Grooming House',
    area: 'Market Street',
    rating: 4.9,
    reviews: 312,
    price: 'From $35',
    image: '/src/assets/hero.png',
    services: ['Styling', 'Spa', 'Facial'],
  },
];

export const barbers = [
  { id: 'aria-khan', name: 'Aria Khan', specialty: 'Textured cuts', rating: 4.9, salon: 'Urban Edge Salon', slots: '6 slots today' },
  { id: 'noah-reed', name: 'Noah Reed', specialty: 'Skin fades', rating: 4.8, salon: 'Classic Cuts Studio', slots: '3 slots today' },
  { id: 'maya-stone', name: 'Maya Stone', specialty: 'Color and styling', rating: 4.7, salon: 'Luxe Grooming House', slots: '5 slots today' },
];

export const jobs = [
  { id: 'senior-barber', title: 'Senior Barber', salon: 'Urban Edge Salon', location: 'Downtown', type: 'Full time', pay: '$28-$35/hr' },
  { id: 'salon-manager', title: 'Salon Manager', salon: 'Luxe Grooming House', location: 'Market Street', type: 'Full time', pay: '$62k-$75k' },
  { id: 'junior-stylist', title: 'Junior Stylist', salon: 'Classic Cuts Studio', location: 'Riverside', type: 'Part time', pay: '$18-$24/hr' },
];
