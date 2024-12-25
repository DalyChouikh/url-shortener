export interface Memory {
  id: number;
  imageUrl: string;
  title: string;
  description?: string;
}

export const memories: Memory[] = [
  {
    id: 1,
    imageUrl: "/memories/benzart.jpg",
    title: "Benzart 2023",
    description: "A day full of fun and team activities",
  },
  {
    id: 2,
    imageUrl: "/memories/choose-your-destination-v4.jpg",
    title: "Choose Your Destination v4.0",
    description:
      "A Tech Talk event that helps students choose their career path",
  },
  {
    id: 3,
    imageUrl: "/memories/choose-your-destination-v4-after.jpg",
    title: "The After of the Choose Your Destination v4.0",
    description: "The team celebrating the success of the event",
  },
  {
    id: 4,
    imageUrl: "/memories/core-team-2023.jpg",
    title: "Core Team 2023/2024",
    description: "The team behind the scenes",
  },
  {
    id: 5,
    imageUrl: "/memories/hackwarts-v2.jpg",
    title: "Hackwarts v2.0",
    description: "A magical hackathon",
  },
  {
    id: 6,
    imageUrl: "/memories/secret-santa-2023.jpg",
    title: "Secret Santa 2023/2024",
    description: "A day full of surprises",
  },
  {
    id: 7,
    imageUrl: "/memories/sogno-2024.jpg",
    title: "El Sogno Camp 2024",
    description: "The usual camping spot for the team",
  },
];
