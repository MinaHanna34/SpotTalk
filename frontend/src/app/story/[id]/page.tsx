import StoryClient from './StoryClient';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function StoryPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <StoryClient id={resolvedParams.id} />;
} 