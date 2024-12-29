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
    description: "A Day full of fun and team activities",
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
    description: "The Team celebrating the success of the event",
  },
  {
    id: 4,
    imageUrl: "/memories/core-team-2023.jpg",
    title: "Core Team 2023/2024",
    description: "The Team behind the scenes",
  },
  {
    id: 5,
    imageUrl: "/memories/hackwarts-v2.jpg",
    title: "Hackwarts v2.0",
    description: "A Magical Hackathon",
  },
  {
    id: 6,
    imageUrl: "/memories/secret-santa-2023.jpg",
    title: "Secret Santa 2023/2024",
    description: "A Day full of surprises",
  },
  {
    id: 7,
    imageUrl: "/memories/sogno-2024.jpg",
    title: "El Sogno Camp 2024",
    description: "The Usual Camping spot for the team",
  },
  {
    id: 8,
    imageUrl: "/memories/monastir-2024.jpg",
    title: "Monastir 2024",
    description: "A Day full of fun and team activities",
  }
];
