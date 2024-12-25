import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";

import { teamMembers } from "@/data/team";
import { events } from "@/data/events";
import TeamCarousel from "./TeamCarousel";
import EventGallery from "./EventGallery";

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">About GDG ISSATSo</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Google Developer Groups on Campus ISSATSo is a community of
            passionate students and developers who come together to learn,
            share, and grow in the field of technology.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                We aim to create an inclusive environment where students can
                develop their technical skills, connect with like-minded
                individuals, and prepare for their future careers in technology.
              </p>
              <p className="text-gray-600">
                Through workshops, events, and hands-on projects, we help
                students bridge the gap between academic learning and real-world
                applications.
              </p>
            </div>
            <div className="aspect-video rounded-xl overflow-hidden shadow-xl">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/lIdTw6GEXw0"
                title="GDG ISSATSo Introduction"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
          <TeamCarousel members={teamMembers} itemsPerPage={9} />
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What We Do</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {events.map((event, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="text-4xl mb-4">{event.imageUrl}</div>
                  <CardTitle>{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{event.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Event Photos Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Event Highlights
          </h2>
          <EventGallery events={events} itemsPerPage={6} />
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
          <p className="text-lg text-gray-600 mb-8">
            Whether you're a beginner or an experienced developer, there's
            always room for growth and learning in our community. Join us in our
            next event!
          </p>
          <Button size="lg" variant="default">
            Become a Member
          </Button>
        </div>
      </section>
    </div>
  );
}
