import React from "react";

export const FAQSection = ({ faqs }) => (
  <section className="py-12">
    <h2 className="text-2xl font-semibold mb-6">FAQs</h2>
    <div className="space-y-4">
      {faqs.map((faq, i) => (
        <details key={i} className="p-4 border rounded">
          <summary className="font-medium cursor-pointer">{faq.question}</summary>
          <p className="mt-2 text-gray-600">{faq.answer}</p>
        </details>
      ))}
    </div>
  </section>
);

export default FAQSection;