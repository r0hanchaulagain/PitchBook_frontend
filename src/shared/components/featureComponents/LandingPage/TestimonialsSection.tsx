"use client";
import { TestimonialCards } from "@ui/infinite-moving-cards";

const testimonials = [
  {
    quote:
      "Booking a futsal court has never been easier! The location filter helped me find a great spot close to home, and the reviews were spot on.",
    name: "Ravi Kumar",
    rating: 5,
    image: "https://picsum.photos/id/1/200/",
  },
  {
    quote:
      "The half-court booking feature is amazing. I got matched with a group of players, and we had a fantastic game together!",
    name: "Sofia Mendes",
    rating: 4,
    image: "https://picsum.photos/id/2/200/",
  },
  {
    quote:
      "Love how secure and quick the payment process is. PitchBook made organizing our weekly futsal games so much simpler.",
    name: "Ethan Brown",
    rating: 5,
    image: "https://picsum.photos/id/3/200/",
  },
  {
    quote:
      "The player matching feature worked perfectly! I found new teammates for a half-court game, and we’ve been playing together ever since.",
    name: "Aisha Khan",
    rating: 4,
    image: "https://picsum.photos/id/4/200/",
  },
  {
    quote:
      "Found a highly rated court and booked it in minutes. The whole process was seamless, and I’ll definitely use PitchBook again!",
    name: "Lucas Silva",
    rating: 5,
    image: "https://picsum.photos/id/5/200/",
  },
];

const TestimonialsSection = () => {
  return (
    <div className="relative flex h-[40rem] w-full flex-col items-center justify-center gap-20 overflow-hidden rounded-md py-12 antialiased">
      <h1 className="text-3xl text-center font-bold sm:text-5xl">
        What people say about PitchBook
      </h1>
      <div className="w-full max-w-[95vw] overflow-hidden px-4">
        <TestimonialCards
          className="w-full"
          items={testimonials}
          direction="right"
          speed="fast"
        />
      </div>
    </div>
  );
};
export default TestimonialsSection;
