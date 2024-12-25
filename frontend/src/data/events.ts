export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  category: string;
}

export const events: Event[] = [
  {
    id: "1",
    title: "Pitching Workshop",
    description:
      "Master the techniques to effectively communicate and present your ideas ",
    date: "2024-12-14",
    imageUrl: "/events/pitching-workshop.jpg",
    category: "Workshop",
  },
  {
    id: "2",
    title: "Design Thinking Workshop",
    description:
      "Thinking: Develop innovative solutions with structured, user-focused methodologies",
    date: "2024-12-14",
    imageUrl: "/events/design-thinking-workshop.jpg",
    category: "Workshop",
  },
  {
    id: "3",
    title: "Project Management Workshop",
    description:
      "Management: Learn to plan, organize, and execute projects efficiently",
    date: "2024-12-14",
    imageUrl: "/events/project-management-workshop.jpg",
    category: "Workshop",
  },
  {
    id: "4",
    title: "Hackwarts v2.0",
    description:
      "✨ Hackwarts 2.0: The Chamber of Code ✨ invites witches, wizards, and tech sorcerers to a magical hackathon where innovation meets enchantment! 💻🪄⚡",
    date: "2024-12-14",
    imageUrl: "/events/hackwarts.jpg",
    category: "Hackathon",
  },
  {
    id: "5",
    title: "Becoming a UI/UX Designer",
    description:
      "Learn the principles of UI/UX design and how to create user-friendly interfaces",
    date: "2024-12-04",
    imageUrl: "/events/becoming-ui-ux-designer.jpg",
    category: "Workshop",
  },
  {
    id: "6",
    title: "Flutter Foundations: Picking Up the Pace",
    description:
      "Take your Flutter skills to the next level with advanced concepts and techniques",
    date: "2024-11-29",
    imageUrl: "/events/flutter-foundations.jpg",
    category: "Workshop",
  },
  {
    id: "7",
    title: "Building & Deploying Your First Website",
    description: "Learn how to build and deploy a website from scratch",
    date: "2024-11-27",
    imageUrl: "/events/build-deploy-website.jpg",
    category: "Workshop",
  },
  {
    id: "8",
    title: "Kickoff to Supervised Learning: Linear Regression",
    description:
      "Dive into the world of machine learning with linear regression models",
    date: "2024-11-27",
    imageUrl: "/events/linear-regression.jpg",
    category: "Workshop",
  },
  {
    id: "9",
    title: "Getting Hooked By React",
    description:
      "Explore the fundamentals of React and build interactive web applications",
    date: "2024-11-29",
    imageUrl: "/events/getting-hooked-react.jpg",
    category: "Workshop",
  },
  {
    id: "10",
    title: "The AI Edge: Enter the World of Machine Learning",
    description:
      "Discover the power of AI and machine learning in transforming industries",
    date: "2024-11-20",
    imageUrl: "/events/machine-learning.jpg",
    category: "Workshop",
  },
  {
    id: "11",
    title: "Interactive Web Mastery: React in Action",
    description: "Learn to build interactive web applications with React",
    date: "2024-11-21",
    imageUrl: "/events/web-mastery-react.jpg",
    category: "Workshop",
  },
  {
    id: "12",
    title: "Flutter Foundations: Building Your First App",
    description:
      "Get started with Flutter and build your first mobile application",
    date: "2024-11-21",
    imageUrl: "/events/flutter-building-first-app.jpg",
    category: "Workshop",
  },
  {
    id: "13",
    title: "Building Your First Page with HTML, CSS, and JS",
    description:
      "Learn the basics of web development by building your first web page",
    date: "2024-11-20",
    imageUrl: "/events/building-first-webpage.jpg",
    category: "Workshop",
  },
  {
    id: "14",
    title: "Technical Bootcamp Info Session",
    description:
      "Join us for an information session on our upcoming technical bootcamp",
    date: "2024-11-08",
    imageUrl: "/events/bootcamp-infosession.jpg",
    category: "Tech Talk",
  },
  {
    id: "15",
    title: "Choose Your Destination v4.0",
    description:
      "We invite you to embark on a journey beyond the ordinary, where we'll explore the limitless possibilities in AI, Web Development, Cybersecurity, Mobile Development, and more 🚀",
    date: "2024-10-18",
    imageUrl: "/events/choose-your-destination-4.png",
    category: "Tech Talk",
  },
];

export const eventCategories = ["All", "Workshop", "Hackathon", "Tech Talk"];
