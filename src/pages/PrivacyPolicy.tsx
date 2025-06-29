import React from 'react';
import { Header } from '@/components/Header';

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <div className="py-8 px-4 sm:px-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Your Privacy</h2>
        <p className="text-gray-700">We value your privacy. This page describes how we handle your data and protect your information when you use our service.</p>
      </section>
      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Information Collection</h2>
        <p className="text-gray-700">We collect only the information necessary to provide our services, such as your name, email, and booking details. We never sell your data to third parties.</p>
      </section>
      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Data Security</h2>
        <p className="text-gray-700">We use industry-standard security measures to protect your data. If you have any questions, please contact us.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Contact</h2>
        <p className="text-gray-700">For privacy-related inquiries, email us at <a href="mailto:support@stayfinder.com" className="text-blue-600 underline">support@stayfinder.com</a>.</p>
      </section>
    </div>
  </div>
);

export default PrivacyPolicy; 