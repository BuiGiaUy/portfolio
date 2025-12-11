import { Project } from '@/types/project';

/**
 * Mock project data for development and testing
 * Contains 10 realistic portfolio projects with varied tech stacks
 */
export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'E-Commerce Platform',
    description:
      'A full-stack e-commerce solution with real-time inventory management, payment integration, and advanced analytics. Built with scalability and performance in mind.',
    tags: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Redis'],
    views: 12453,
    imageUrl: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=600&fit=crop',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-11-20T14:22:00Z',
  },
  {
    id: '2',
    title: 'AI-Powered Task Manager',
    description:
      'Smart task management app leveraging machine learning to predict deadlines, prioritize tasks, and suggest optimal work schedules based on user behavior patterns.',
    tags: ['TypeScript', 'Next.js', 'Python', 'TensorFlow', 'MongoDB'],
    views: 8901,
    imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600&fit=crop',
    createdAt: '2024-02-10T09:15:00Z',
    updatedAt: '2024-12-01T11:45:00Z',
  },
  {
    id: '3',
    title: 'Real-Time Collaboration Tool',
    description:
      'A collaborative workspace featuring live document editing, video conferencing, and project management tools. Supports teams of up to 100 concurrent users.',
    tags: ['Vue.js', 'WebRTC', 'Socket.io', 'Express', 'Docker'],
    views: 15672,
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
    createdAt: '2024-03-05T13:20:00Z',
    updatedAt: '2024-11-28T16:10:00Z',
  },
  {
    id: '4',
    title: 'Fitness Tracking Mobile App',
    description:
      'Cross-platform mobile application for tracking workouts, nutrition, and health metrics. Integrates with popular wearable devices and provides personalized insights.',
    tags: ['React Native', 'Firebase', 'GraphQL', 'HealthKit'],
    views: 9834,
    imageUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop',
    createdAt: '2024-04-12T08:00:00Z',
    updatedAt: '2024-12-03T09:30:00Z',
  },
  {
    id: '5',
    title: 'Blockchain NFT Marketplace',
    description:
      'Decentralized marketplace for creating, buying, and selling NFTs. Features smart contract integration, wallet connectivity, and gas-optimized transactions.',
    tags: ['Solidity', 'Web3.js', 'React', 'Ethereum', 'IPFS'],
    views: 18290,
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop',
    createdAt: '2024-05-20T14:45:00Z',
    updatedAt: '2024-11-25T12:00:00Z',
  },
  {
    id: '6',
    title: 'Weather Forecast Dashboard',
    description:
      'Interactive weather dashboard with real-time data visualization, 10-day forecasts, and severe weather alerts. Features beautiful animations and dark mode support.',
    tags: ['Angular', 'D3.js', 'OpenWeather API', 'RxJS'],
    views: 6723,
    imageUrl: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=800&h=600&fit=crop',
    createdAt: '2024-06-08T11:30:00Z',
    updatedAt: '2024-12-04T10:15:00Z',
  },
  {
    id: '7',
    title: 'Social Media Analytics Platform',
    description:
      'Comprehensive analytics tool for tracking social media performance across multiple platforms. Provides actionable insights, competitor analysis, and automated reporting.',
    tags: ['Python', 'Django', 'Celery', 'Chart.js', 'AWS'],
    views: 11456,
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    createdAt: '2024-07-14T15:00:00Z',
    updatedAt: '2024-11-30T13:20:00Z',
  },
  {
    id: '8',
    title: 'Online Learning Platform',
    description:
      'Interactive e-learning platform with video courses, quizzes, certificates, and progress tracking. Supports both live and pre-recorded content with student-teacher interaction.',
    tags: ['Next.js', 'Prisma', 'tRPC', 'Tailwind CSS', 'Vercel'],
    views: 14523,
    imageUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=600&fit=crop',
    createdAt: '2024-08-22T09:45:00Z',
    updatedAt: '2024-12-02T14:30:00Z',
  },
  {
    id: '9',
    title: 'Restaurant Management System',
    description:
      'All-in-one solution for restaurant operations including POS, inventory management, table reservations, and staff scheduling. Cloud-based with offline capabilities.',
    tags: ['Flutter', 'Dart', 'MySQL', 'REST API', 'Kubernetes'],
    views: 7892,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
    createdAt: '2024-09-17T12:00:00Z',
    updatedAt: '2024-11-27T15:45:00Z',
  },
  {
    id: '10',
    title: 'Music Streaming Service',
    description:
      'Spotify-like music streaming platform with curated playlists, social features, artist profiles, and high-quality audio streaming. Supports offline downloads and lyrics sync.',
    tags: ['Swift', 'Kotlin', 'Microservices', 'Kafka', 'Elasticsearch'],
    views: 21045,
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop',
    createdAt: '2024-10-25T16:30:00Z',
    updatedAt: '2024-12-05T11:00:00Z',
  },
];

/**
 * Simulates API delay for realistic testing
 */
export const delay = (ms: number = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
