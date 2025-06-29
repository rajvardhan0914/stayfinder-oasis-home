import React from 'react';
import { Header } from '@/components/Header';

const TermsOfService = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <div className="py-8 px-4 sm:px-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Acceptance of Terms</h2>
        <p className="text-gray-700">By using StayFinder, you agree to these terms. Please read them carefully before using our service.</p>
      </section>
      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">User Responsibilities</h2>
        <p className="text-gray-700">You are responsible for your account and all activity under it. Do not misuse the platform or violate any laws.</p>
      </section>
      <section className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Changes to Terms</h2>
        <p className="text-gray-700">We may update these terms from time to time. Continued use of the service means you accept the new terms.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Contact</h2>
        <p className="text-gray-700">For questions about these terms, email us at <a href="mailto:support@stayfinder.com" className="text-blue-600 underline">support@stayfinder.com</a>.</p>
      </section>
    </div>
  </div>
);

export default TermsOfService; 