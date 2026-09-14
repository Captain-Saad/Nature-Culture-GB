import { Review } from "@/lib/types";
import { placeholderImage } from "@/lib/utils/image";

export const reviews: Review[] = [
  {
    id: "rev-01",
    name: "Ayesha K.",
    rating: 5,
    text: "Our Hunza trip was flawlessly planned — the cost estimate matched what we actually spent, almost to the rupee.",
    date: "2026-07-15",
    relatedTo: "7-Day Skardu + Hunza Explorer",
  },
  {
    id: "rev-02",
    name: "Bilal R.",
    rating: 4,
    text: "Deosai was the highlight of our trip. Guide was knowledgeable about the local wildlife and terrain.",
    photo: placeholderImage("review-bilal", 400, 400),
    date: "2026-06-28",
    relatedTo: "Deosai National Park",
  },
  {
    id: "rev-03",
    name: "Sana M.",
    rating: 5,
    text: "Booked our honeymoon package and it exceeded expectations — the Attabad Lake sunset cruise was magical.",
    date: "2026-06-10",
    relatedTo: "Honeymoon in Hunza",
  },
  {
    id: "rev-04",
    name: "Hamza T.",
    rating: 4,
    text: "Backpacker circuit was great value. Would appreciate more guesthouse options in Skardu though.",
    date: "2026-05-22",
    relatedTo: "Budget Backpacker GB Circuit",
  },
  {
    id: "rev-05",
    name: "Fatima Z.",
    rating: 5,
    text: "The K2 base camp approach trek was the adventure of a lifetime. Crew was professional and safety-focused.",
    photo: placeholderImage("review-fatima", 400, 400),
    date: "2026-08-02",
    relatedTo: "Adventure: K2 Base Camp Approach Trek",
  },
];
