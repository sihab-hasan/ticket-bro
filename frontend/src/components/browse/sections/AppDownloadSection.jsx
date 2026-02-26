import React from "react";

export const AppDownloadSection = () => (
  <section className="py-12 text-center bg-gray-50">
    <h2 className="text-2xl font-semibold mb-4">Get Our App</h2>
    <p className="mb-6">Book events anytime, anywhere.</p>
    <div className="flex justify-center gap-4">
      <button className="px-6 py-2 bg-black text-white rounded">App Store</button>
      <button className="px-6 py-2 bg-green-600 text-white rounded">Google Play</button>
    </div>
  </section>
);

export default AppDownloadSection;