import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/api";
import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Phone,
  Mail,
  MapPin
} from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "How do I book a property?",
    answer: "To book a property, first create an account or log in. Then, browse available properties, select your desired dates, and click 'Book Now'. Follow the prompts to complete your booking."
  },
  {
    question: "What is the cancellation policy?",
    answer: "Our standard cancellation policy allows free cancellation up to 24 hours before check-in. Some properties may have different policies, which will be clearly stated in the property details."
  },
  {
    question: "How do I contact a host?",
    answer: "You can contact a host through the messaging system on the property page. Click the 'Contact Host' button to start a conversation."
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept all major credit cards, PayPal, and bank transfers. Payment is processed securely through our platform."
  },
  {
    question: "How do I leave a review?",
    answer: "After your stay, you'll receive an email invitation to leave a review. You can also access the review option from your bookings page."
  }
];

interface HelpProps {
  hideHeader?: boolean;
}

const Help = ({ hideHeader }: HelpProps) => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleFaqClick = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/support/contact', contactForm);
      toast.success("Your message has been sent. We'll get back to you soon.");
      setContactForm({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      toast.error("Failed to send message. Please try again later.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error("Please fill in all fields.");
      return;
    }

    // Simulate form submission
    setTimeout(() => {
      toast.success("Message sent successfully! We'll get back to you soon.");
      setContactForm({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      {!hideHeader && <Header />}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {!hideHeader && <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Help & Support</h1>}

        {/* FAQs Section */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="overflow-hidden">
                <button
                  onClick={() => handleFaqClick(index)}
                  className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-muted"
                >
                  <span className="font-medium text-sm sm:text-base">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                  )}
                </button>
                {expandedFaq === index && (
                  <CardContent className="p-3 sm:p-4 pt-0">
                    <p className="text-gray-600 text-sm sm:text-base">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Contact Support</h2>
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleContactSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    required
                    rows={4}
                  />
                </div>
                <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* Contact Information */}
        <section>
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Other Ways to Reach Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <Card>
              <CardContent className="p-4 sm:p-6 text-center">
                <Phone className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-3 sm:mb-4 text-teal-500" />
                <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Phone Support</h3>
                <p className="text-gray-600 text-sm sm:text-base">+1 (555) 123-4567</p>
                <p className="text-xs sm:text-sm text-gray-500">Mon-Fri, 9am-6pm EST</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6 text-center">
                <Mail className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-3 sm:mb-4 text-teal-500" />
                <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Email Support</h3>
                <p className="text-gray-600 text-sm sm:text-base">support@stayfinder.com</p>
                <p className="text-xs sm:text-sm text-gray-500">24/7 response</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6 text-center">
                <MapPin className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-3 sm:mb-4 text-teal-500" />
                <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Office Location</h3>
                <p className="text-gray-600 text-sm sm:text-base">123 Stay Street</p>
                <p className="text-xs sm:text-sm text-gray-500">New York, NY 10001</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Help; 