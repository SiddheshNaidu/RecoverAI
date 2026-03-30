import { Logos3 } from './logos3';

const demoData = {
  heading: 'Trusted by these companies',
  logos: [
    {
      id: 'logo-1',
      description: 'Team collaboration',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      className: 'h-12 w-20 rounded-md object-cover',
    },
    {
      id: 'logo-2',
      description: 'Healthcare analytics',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
      className: 'h-12 w-20 rounded-md object-cover',
    },
    {
      id: 'logo-3',
      description: 'AI dashboard',
      image: 'https://images.unsplash.com/photo-1551281044-8b8e7f3b7c2f?auto=format&fit=crop&w=800&q=80',
      className: 'h-12 w-20 rounded-md object-cover',
    },
    {
      id: 'logo-4',
      description: 'Clinical workflow',
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
      className: 'h-12 w-20 rounded-md object-cover',
    },
    {
      id: 'logo-5',
      description: 'Voice AI',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
      className: 'h-12 w-20 rounded-md object-cover',
    },
    {
      id: 'logo-6',
      description: 'Hospital systems',
      image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
      className: 'h-12 w-20 rounded-md object-cover',
    },
    {
      id: 'logo-7',
      description: 'Cloud platform',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      className: 'h-12 w-20 rounded-md object-cover',
    },
    {
      id: 'logo-8',
      description: 'Trusted deployment',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
      className: 'h-12 w-20 rounded-md object-cover',
    },
  ],
};

function Logos3Demo() {
  return <Logos3 {...demoData} />;
}

export { Logos3Demo };
