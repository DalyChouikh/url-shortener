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
import { TeamMember, roleTypes, teamCategories } from "@/data/team";
import { Card, CardContent } from "@/components/ui/card";
//import { Github, Linkedin } from "lucide-react"; // Add this import
import { FaGithub, FaLinkedin } from "react-icons/fa";

type CategoryType = (typeof teamCategories)[number];

interface TeamCarouselProps {
  members: TeamMember[];
  itemsPerPage?: number;
}

export default function TeamCarousel({
  members,
  itemsPerPage = 9,
}: TeamCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(
    roleTypes.CORE
  );
  const [currentPage, setCurrentPage] = useState(0);

  const filteredMembers = members.filter((member) => {
    if (selectedCategory === roleTypes.CORE) return true;

    // Check if member is a lead of the corresponding committee
    const isCommitteeLead = Object.values(roleTypes.LEAD).some(
      (leadRole) =>
        member.mainRole === leadRole &&
        leadRole.includes(selectedCategory.split(" ")[0]) // Match committee prefix (TM, MKT, EER)
    );

    // Include if they're either the lead or a regular committee member
    return (
      isCommitteeLead ||
      member.mainRole === selectedCategory ||
      (member.otherRoles.includes(selectedCategory) && !isCommitteeLead)
    );
  });

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    const getRoleWeight = (member: TeamMember) => {
      if (member.mainRole === roleTypes.LEAD.GDG) return 1;
      if (member.otherRoles.includes(roleTypes.CORE)) return 2;
      if (
        Object.values(roleTypes.LEAD).some(
          (leadRole) => member.mainRole === leadRole
        )
      )
        return 3;
      if (member.mainRole === roleTypes.MENTOR) return 4;
      return 5;
    };
    return getRoleWeight(a) - getRoleWeight(b);
  });

  const totalPages = Math.ceil(sortedMembers.length / itemsPerPage);
  const currentMembers = sortedMembers.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    e.currentTarget.src = "/placeholder-avatar-boy.png";
  };

  const handlePageChange = (index: number) => {
    setCurrentPage(index);
    api?.scrollTo(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-center">
        {teamCategories.map((category) => (
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
          {currentMembers.map((member) => (
            <CarouselItem key={member.id} className="md:basis-1/3 lg:basis-1/3">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <img
                        src={`${member.imageUrl}`}
                        alt={member.name}
                        className="w-full h-full rounded-full object-cover"
                        loading="lazy"
                        onError={handleImageError}
                      />
                    </div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.mainRole}</p>
                    {member.otherRoles
                      .filter((role) => {
                        if (role === roleTypes.CORE) return true;

                        const isCommitteeLead = Object.values(
                          roleTypes.LEAD
                        ).some(
                          (leadRole) =>
                            member.mainRole === leadRole &&
                            leadRole.includes(role.split(" ")[0])
                        );

                        return !isCommitteeLead;
                      })
                      .map((role, index) => (
                        <p key={index} className="text-xs text-gray-400">
                          {role}
                        </p>
                      ))}
                    {/* Add social links */}
                    <div className="flex justify-center gap-2 mt-2">
                      {member.socialLinks?.linkedin && (
                        <a
                          href={member.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-blue-600"
                        >
                          <FaLinkedin className="w-5 h-5" />
                        </a>
                      )}
                      {member.socialLinks?.github && (
                        <a
                          href={member.socialLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-blue-600"
                        >
                          <FaGithub className="w-5 h-5" />
                        </a>
                      )}
                    </div>
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
