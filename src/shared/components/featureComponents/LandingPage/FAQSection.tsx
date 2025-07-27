import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";

const faqItems = [
  {
    question: "How do I book a futsal court?",
    answer:
      "You can book a futsal court by selecting your preferred location, date, and time slot. Then proceed to payment to confirm your booking.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept various payment methods including credit/debit cards, mobile wallets, and online banking through our secure payment gateway.",
  },
  {
    question: "Can I cancel or reschedule my booking?",
    answer:
      "Yes, you can cancel or reschedule your booking up to 2 hours before the scheduled time through the 'My Bookings' section.",
  },
  {
    question: "Do you offer membership plans?",
    answer:
      "Yes, we offer various membership plans with benefits like discounted rates, priority booking, and special offers. Check our pricing page for more details.",
  },
  {
    question: "What if it rains on the day of my booking?",
    answer:
      "In case of rain, our indoor facilities remain open. For outdoor courts, you'll be notified about any cancellations and offered rescheduling options.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Find answers to common questions about our booking system and
            services.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    {item.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 pt-0 text-gray-600 dark:text-gray-300">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
