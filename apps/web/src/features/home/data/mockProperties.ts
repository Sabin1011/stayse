export interface StayProperty {
  id: number;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  badge?: string;
}

export const destinations = [
  { name: "Ooty", country: "Tamil Nadu, India", stays: "120+ stays", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85" },
  { name: "Coorg", country: "Karnataka, India", stays: "85+ stays", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=85" },
  { name: "Goa", country: "Goa, India", stays: "240+ stays", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=85" },
  { name: "Munnar", country: "Kerala, India", stays: "95+ stays", image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85" },
];

export const properties: StayProperty[] = [
  { id: 1, title: "The Quiet Pine Retreat", location: "Ooty, Tamil Nadu", price: 4200, rating: 4.92, reviews: 128, image: "https://images.unsplash.com/photo-1449158743715-0a90e7c8a9a8?auto=format&fit=crop&w=1000&q=85", category: "Cabin", badge: "Guest favourite" },
  { id: 2, title: "A little house in the hills", location: "Coonoor, Tamil Nadu", price: 3600, rating: 4.88, reviews: 96, image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1000&q=85", category: "Villa" },
  { id: 3, title: "Misty Valley Estate", location: "Coorg, Karnataka", price: 5100, rating: 4.95, reviews: 214, image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1000&q=85", category: "Cottage", badge: "Rare find" },
  { id: 4, title: "Palm Shore Hideaway", location: "Candolim, Goa", price: 6200, rating: 4.86, reviews: 173, image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1000&q=85", category: "Beach house" },
  { id: 5, title: "Tea Garden View Stay", location: "Munnar, Kerala", price: 3900, rating: 4.91, reviews: 82, image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1000&q=85", category: "Homestay" },
  { id: 6, title: "The Open Sky Villa", location: "Wayanad, Kerala", price: 5800, rating: 4.89, reviews: 147, image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=85", category: "Villa" },
];
