import { Button } from "./ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { FaYoutube, FaSpotify, FaInstagram } from "react-icons/fa";

import { teamMembers } from "@/data/team";
import { memories } from "@/data/memories";
import TeamCarousel from "./TeamCarousel";
import EventGallery from "./EventGallery";
import { useAuth } from "@/contexts/AuthContext";

export default function About() {
  const { user } = useAuth();
  const handleLogin = () => {
    window.location.href = "/auth/login";
  };
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

      {/* Memories Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            Our Memories
          </h2>
          <Carousel className="w-full">
            <CarouselContent>
              {memories.map((memory) => (
                <CarouselItem key={memory.id} className="basis-full">
                  <div className="aspect-[2/1] relative rounded-xl overflow-hidden">
                    <img
                      src={memory.imageUrl}
                      alt={memory.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                      <h3 className="text-white text-xl font-semibold">
                        {memory.title}
                      </h3>
                      <p className="text-white/80">{memory.description}</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="text-white" />
            <CarouselNext className="text-white" />
          </Carousel>
        </div>
      </section>

      {/* Podcast Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Tawla W Kressi Podcast
              </h2>
              <p className="text-gray-600 mb-6">
                Join us in our exciting podcast series where we discuss
                technology, share experiences, and interview inspiring people
                from the tech community. Each episode brings unique insights and
                valuable discussions.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" className="gap-2" asChild>
                  <a
                    href="https://www.youtube.com/@googledeveloperstudentclub7820"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaYoutube className="w-5 h-5" />
                    YouTube
                  </a>
                </Button>
                <Button variant="outline" className="gap-2" asChild>
                  <a
                    href="https://open.spotify.com/show/3wrC7hOR6OIImXuEkMqmPm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaSpotify className="w-5 h-5" />
                    Spotify
                  </a>
                </Button>
                <Button variant="outline" className="gap-2" asChild>
                  <a
                    href="https://www.instagram.com/tawla_w_kressi"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaInstagram className="w-5 h-5" />
                    Instagram
                  </a>
                </Button>
              </div>
            </div>
            <div className="aspect-video rounded-xl overflow-hidden shadow-xl">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/pO5rr6PQmqs"
                title="Tawla W Kressi Latest Episode"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Event Photos Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Event Highlights
          </h2>
          <EventGallery itemsPerPage={6} />
        </div>
      </section>

      {/* Join Us Section */}
      {!user && (
        <section className="py-16">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
            <p className="text-lg text-gray-600 mb-8">
              Whether you're a beginner or an experienced developer, there's
              always room for growth and learning in our community. Join us in
              our next event!
            </p>
            <Button size="lg" variant="default" onClick={handleLogin}>
              Become a Member
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
