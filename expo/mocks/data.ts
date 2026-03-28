import { User } from '@/types';

export const ACTIVITY_TYPES = [
  { value: 'walking', label: 'Walking', emoji: '🚶', icon: 'https://r2-pub.rork.com/generated-images/a8511b46-03a5-461b-9c11-a3284386b3fe.png', color: '#10B981' },
  { value: 'running', label: 'Running', emoji: '🏃', icon: 'https://r2-pub.rork.com/generated-images/78848b82-ae17-4ee3-a100-1af1b5a6749b.png', color: '#3B82F6' },
  { value: 'swimming', label: 'Swimming', emoji: '🏊', icon: 'https://r2-pub.rork.com/generated-images/8f302b3f-1c35-4fd0-b863-91caf4b55ce1.png', color: '#06B6D4' },
  { value: 'cycling', label: 'Cycling', emoji: '🚴', icon: 'https://r2-pub.rork.com/generated-images/e48cbb6d-ac54-4127-ab48-a2fb4ad58c1d.png', color: '#8B5CF6' },
  { value: 'dance', label: 'Dance', emoji: '💃', icon: 'https://r2-pub.rork.com/generated-images/dbfa3068-81ca-4116-bfb1-b5c48d234f17.png', color: '#EC4899' },
  { value: 'zumba', label: 'Zumba', emoji: '🎵', icon: 'https://r2-pub.rork.com/generated-images/9ed3ce10-770a-41e5-89a1-b5d5d0d8c76b.png', color: '#F59E0B' },
  { value: 'martial_arts', label: 'Martial Arts', emoji: '🥋', icon: 'https://r2-pub.rork.com/generated-images/05b6b5f1-7d4c-4346-8e1e-4df39054c382.png', color: '#EF4444' },
  { value: 'strength_training', label: 'Strength Training', emoji: '💪', icon: 'https://r2-pub.rork.com/generated-images/773554b6-51a1-437d-b6a9-abee03f4a77d.png', color: '#F97316' },
  { value: 'pilates', label: 'Pilates', emoji: '🧘', icon: 'https://r2-pub.rork.com/generated-images/d302777d-2818-408e-a142-b6920a834b65.png', color: '#A855F7' },
  { value: 'tai_chi', label: 'Tai Chi', emoji: '🧘‍♀️', icon: 'https://r2-pub.rork.com/generated-images/4ac2c3c8-41ca-4c7b-849a-5cec63cb4ab6.png', color: '#14B8A6' },
  { value: 'yoga', label: 'Yoga', emoji: '🧘‍♂️', icon: 'https://r2-pub.rork.com/generated-images/470bd552-405c-4850-a8f3-99c40640e9ce.png', color: '#8B5CF6' },
  { value: 'hiking', label: 'Hiking', emoji: '⛰️', icon: 'https://r2-pub.rork.com/generated-images/41db99ff-d5be-485d-855c-794293b218d1.png', color: '#10B981' },
  { value: 'other', label: 'Other', emoji: '🏋️', icon: '🏋️', color: '#64748B' },
] as const;

export const MOOD_OPTIONS = [
  { emoji: '😄', label: 'Great', color: '#10B981' },
  { emoji: '😊', label: 'Good', color: '#3B82F6' },
  { emoji: '😐', label: 'Okay', color: '#F59E0B' },
  { emoji: '😔', label: 'Low', color: '#F97316' },
  { emoji: '😢', label: 'Bad', color: '#EF4444' },
] as const;

export const AVATAR_OPTIONS = [
  '🦁', '🐯', '🦊', '🐻', '🐼', '🐨', '🐸', '🦄', '🐲', '🦅', '🦋', '🐝'
];

export const AI_AVATAR_OPTIONS = [
  { id: 'ai-avatar-1', url: 'https://r2-pub.rork.com/generated-images/1c02ad0e-2a15-4ad5-afd5-b76c26d9c8e3.png', category: 'fitness' },
  { id: 'ai-avatar-2', url: 'https://r2-pub.rork.com/generated-images/f28f5457-8342-4d6c-bf4c-ca722a644449.png', category: 'fitness' },
  { id: 'ai-avatar-3', url: 'https://r2-pub.rork.com/generated-images/a63c9ee5-deb6-4f68-acf0-37d893cb2cc0.png', category: 'fitness' },
  { id: 'ai-avatar-4', url: 'https://r2-pub.rork.com/generated-images/ac0395aa-a0e2-471b-a6f6-3d263ed20434.png', category: 'fitness' },
  { id: 'ai-avatar-5', url: 'https://r2-pub.rork.com/generated-images/f0b8e4bb-ce29-40be-848b-1b2f57c119c9.png', category: 'nature' },
  { id: 'ai-avatar-6', url: 'https://r2-pub.rork.com/generated-images/da7cee60-23ca-4cec-8c74-2aa173726b36.png', category: 'nature' },
  { id: 'ai-avatar-7', url: 'https://r2-pub.rork.com/generated-images/b1643042-5396-4262-a783-7d0ff06a955c.png', category: 'abstract' },
  { id: 'ai-avatar-8', url: 'https://r2-pub.rork.com/generated-images/050d8e2e-b212-4cca-8b76-61848a094919.png', category: 'fitness' },
];

export const currentUser: User = {
  id: 'user-1',
  name: 'Alex Thompson',
  email: 'alex@example.com',
  avatar: '🦁',
  weight: 165,
  height: 170,
  age: 28,
  gender: 'other',
  friends: ['user-2', 'user-3', 'user-4', 'user-5', 'user-6'],
};

export const mockUsers: User[] = [
  currentUser,
  {
    id: 'user-2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: '🦄',
    weight: 140,
    height: 165,
    age: 25,
    gender: 'female',
    friends: ['user-1', 'user-3'],
  },
  {
    id: 'user-3',
    name: 'Mike Chen',
    email: 'mike@example.com',
    avatar: '🐲',
    weight: 180,
    height: 178,
    age: 32,
    gender: 'male',
    friends: ['user-1', 'user-2', 'user-4'],
  },
  {
    id: 'user-4',
    name: 'Emma Davis',
    email: 'emma@example.com',
    avatar: '🦋',
    weight: 130,
    height: 162,
    age: 27,
    gender: 'female',
    friends: ['user-1', 'user-3'],
  },
  {
    id: 'user-5',
    name: 'James Wilson',
    email: 'james@example.com',
    avatar: '🦅',
    weight: 175,
    height: 180,
    age: 30,
    gender: 'male',
    friends: ['user-1', 'user-6'],
  },
  {
    id: 'user-6',
    name: 'Lisa Anderson',
    email: 'lisa@example.com',
    avatar: '🐝',
    weight: 135,
    height: 168,
    age: 26,
    gender: 'female',
    friends: ['user-1', 'user-5'],
  },
];

export const MOTIVATIONAL_QUOTES = [
  "The only bad workout is the one you didn't do.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Take care of your body. It's the only place you have to live.",
  "Fitness is not about being better than someone else. It's about being better than you used to be.",
  "The hardest step is the first one. You've got this!",
  "Progress, not perfection.",
  "Every workout counts. Every step matters.",
  "You are stronger than you think.",
  "Don't stop when you're tired. Stop when you're done.",
  "The pain you feel today will be the strength you feel tomorrow.",
];
