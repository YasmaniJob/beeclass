import { EditNeePageClient } from './edit-nee-page-client';

type PageContext = {
  params: Promise<{ id: string }>;
};

export default async function EditNeePage(context: PageContext) {
  const { id } = await context.params;
  const entryId = decodeURIComponent(id);

  return <EditNeePageClient entryId={entryId} />;
}
