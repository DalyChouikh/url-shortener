import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Event, eventCategories } from "@/data/events";
import { Card, CardContent } from "@/components/ui/card";

interface EventGalleryProps {
  events: Event[];
  itemsPerPage?: number;
}

export default function EventGallery({
  events,
  itemsPerPage = 6,
}: EventGalleryProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);

  const filteredEvents = events.filter(
    (event) => selectedCategory === "All" || event.category === selectedCategory
  );

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const currentEvents = filteredEvents.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (index: number) => {
    setCurrentPage(index);
    api?.scrollTo(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-center">
        {eventCategories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => {
              setSelectedCategory(category);
              setCurrentPage(0);
            }}
          >
            {category}
          </Button>
        ))}
      </div>

      <Carousel className="w-full max-w-5xl mx-auto" setApi={setApi}>
        <CarouselContent>
          {currentEvents.map((event) => (
            <CarouselItem key={event.id} className="md:basis-1/2">
              <Card>
                <CardContent className="flex aspect-video items-center justify-center p-6">
                  <div className="text-center">
                    <div className="relative w-full h-48 mb-4">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full rounded-lg object-cover"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm text-gray-600">{event.date}</p>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <Button
              key={index}
              variant={currentPage === index ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(index)}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
