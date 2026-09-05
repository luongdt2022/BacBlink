import { useParams } from 'react-router-dom';
import { StoryFormPage } from './StoryFormPage';

export function EditStoryPage() {
  const { id } = useParams<{ id: string }>();
  return <StoryFormPage storyId={id} isEdit backPath="/stories" />;
}
