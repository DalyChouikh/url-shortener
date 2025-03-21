import { showToast } from "@/utils/toast";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import NumberTicker from "@/components/ui/number-ticker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FaGoogle } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info } from "lucide-react";

export default function Home() {
  const location = useLocation();
  const { user } = useAuth();
  const redirectedFrom = location.state?.from;
  const [openHoverCard, setOpenHoverCard] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");
    if (error === "invalid_short_url") {
      showToast("The requested short URL was not found", "error");
    }
  }, [location]);

  const handleFeatureClick = (feature: string) => {
    if (feature === "URL Shortener") {
      if (user) {
        window.location.href = "/shorten";
      } else {
        window.location.href = "/auth/login";
      }
    } else {
      showToast(`The ${feature} feature is coming soon!`, "info");
    }
  };

  const handleInfoClick = (e: React.MouseEvent, title: string) => {
    e.stopPropagation();
    setOpenHoverCard(openHoverCard === title ? null : title);
  };

  const features = [
    {
      title: "URL Shortener",
      description:
        "Transform long URLs into concise, shareable links instantly. Each shortened URL comes with a QR code for easy mobile access.",
      icon: "🔗",
      implemented: true,
    },
    {
      title: "Real-time Chat",
      description:
        "Connect with community members through instant messaging. Share ideas, code snippets, and collaborate in real-time.",
      icon: "💬",
      implemented: false,
    },
    {
      title: "Event Management",
      description:
        "Stay updated with upcoming workshops, hackathons, and tech talks. Never miss an opportunity to learn and grow.",
      icon: "📅",
      implemented: false,
    },
    {
      title: "Community Polls",
      description:
        "Voice your opinion and participate in community decisions. Help shape the future of our tech community.",
      icon: "📊",
      implemented: false,
    },
    {
      title: "Meeting Scheduler",
      description:
        "Seamlessly organize and coordinate team meetings. Integrated calendar ensures everyone stays in sync.",
      icon: "🗓️",
      implemented: false,
    },
    {
      title: "Resource Hub",
      description:
        "Access a curated collection of learning materials, documentation, and community resources.",
      icon: "📚",
      implemented: false,
    },
  ];

  const stats = [
    { number: 50, label: "Community Members", hasPlus: true },
    { number: 25, label: "Events Organized", hasPlus: true },
    { number: "24/7", label: "Community Support", hasPlus: false },
  ];

  return (
    <div className="min-h-screen">
      {redirectedFrom &&
        showToast(
          `You must be logged in to access ${(redirectedFrom as string).replace(
            "/",
            ""
          )}.`,
          "warning"
        )}

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Welcome to GDG on Campus ISSATSo
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join a thriving community of developers, innovators, and tech
            enthusiasts. Learn, share, and build amazing things together.
          </p>
          {!user && (
            <Button
              size="lg"
              variant="secondary"
              onClick={() => (window.location.href = "/auth/login")}
              className="gap-2"
            >
              <FaGoogle className="h-5 w-5" />
              Join with Google
            </Button>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stat.hasPlus ? (
                    <>
                      <NumberTicker
                        className="text-blue-600"
                        value={stat.number as number}
                      />
                      +
                    </>
                  ) : (
                    stat.number
                  )}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transition-transform duration-200 relative"
                onClick={() => handleFeatureClick(feature.title)}
              >
                {!feature.implemented && (
                  <div
                    className="absolute top-4 right-4 z-50"
                    onClick={(e) => handleInfoClick(e, feature.title)}
                  >
                    <HoverCard
                      open={openHoverCard === feature.title}
                      onOpenChange={(open) => !open && setOpenHoverCard(null)}
                    >
                      <HoverCardTrigger asChild>
                        <button className="cursor-pointer focus:outline-none">
                          <Info className="h-5 w-5 text-muted-foreground" />
                        </button>
                      </HoverCardTrigger>
                      <HoverCardContent
                        className="w-80 z-[60]"
                        side="top"
                        align="end"
                        sideOffset={5}
                      >
                        <div className="flex justify-between space-x-4">
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold">
                              Coming Soon
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              This feature is currently under development and
                              will be available soon. Stay tuned for updates!
                            </p>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                )}
                <CardHeader>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Join our community today and be part of something amazing. Connect
              with fellow developers, participate in events, and grow together.
            </p>
            {!user && (
              <Button
                size="lg"
                onClick={() => (window.location.href = "/auth/login")}
                className="gap-2"
              >
                <FaGoogle className="h-5 w-5" />
                Join Now
              </Button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
