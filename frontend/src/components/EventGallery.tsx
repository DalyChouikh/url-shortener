import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Event, eventCategories, EventCategory } from "@/data/events";
import { Card, CardContent } from "@/components/ui/card";
import { showToast } from "@/utils/toast";

interface EventGalleryProps {
  itemsPerPage?: number;
}

export default function EventGallery({ itemsPerPage = 6 }: EventGalleryProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>(
    EventCategory.All,
  );
  const [events, setEvents] = useState<Event[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const getEvents = async () => {
    try {
      const response = await fetch(
        "https://gdg.community.dev/api/event_slim/for_chapter/2817?status=Completed&fields=title%2Cevent_type_title%2Cdescription_short%2Cstart_date%2Ccropped_picture_url%2Curl",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setEvents(data.results);
      } else {
        throw new Error("Failed to fetch events");
      }
    } catch (error) {
      showToast("Failed to fetch events", "error");
    }
  };

  useEffect(() => {
    getEvents();
  }, []);

  const filteredEvents = events.filter(
    (event) =>
      selectedCategory === EventCategory.All ||
      event.event_type_title === selectedCategory,
  );
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const currentEvents = filteredEvents.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
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
          {currentEvents.map((event, index) => (
            <CarouselItem key={index} className="md:basis-1/2">
              <Card>
                <CardContent className="flex aspect-video items-center justify-center p-6">
                  <div className="text-center">
                    <div className="relative w-full h-48 mb-4">
                      <img
                        src={event.cropped_picture_url}
                        alt={event.title}
                        className="w-full h-full rounded-lg object-cover"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm text-gray-600">
                      {event.event_type_title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(event.start_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
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
