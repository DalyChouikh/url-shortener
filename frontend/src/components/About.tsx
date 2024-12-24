import { showToast } from "@/utils/toast";
import { useLocation } from "react-router-dom";

export default function About() {
  const location = useLocation();
  const redirectedFrom = location.state?.from;

  const features = [
    {
      title: "URL Shortener",
      description:
        "Create short, memorable links for your long URLs with QR code generation.",
      icon: "🔗",
    },
    {
      title: "Chat",
      description: "Real-time communication platform for community members.",
      icon: "💬",
    },
    {
      title: "Events Calendar",
      description: "Stay updated with upcoming GDG events and activities.",
      icon: "📅",
    },
    {
      title: "Polls",
      description: "Participate in community polls and surveys.",
      icon: "📊",
    },
    {
      title: "Meetings Calendar",
      description: "Schedule and manage community meetings efficiently.",
      icon: "🗓️",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {redirectedFrom &&
        showToast("You must be logged in to access profile.", "warning")}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to GDG on Campus ISSATSo
        </h1>
        <p className="text-lg text-gray-600">
          A community of developers, innovators, and tech enthusiasts dedicated
          to learning and sharing knowledge.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-8 mb-12">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </section>

      <section className="text-center">
        <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
        <p className="text-gray-600 mb-6">
          Connect with fellow developers, participate in events, and grow
          together.
        </p>
        <a
          href="/auth/login"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Get Started
        </a>
      </section>
    </div>
  );
}
