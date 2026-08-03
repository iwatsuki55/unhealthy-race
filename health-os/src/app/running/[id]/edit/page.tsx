import { redirect } from "next/navigation";

interface EditRunningRedirectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditRunningRedirectPage({ params }: EditRunningRedirectPageProps) {
  const { id } = await params;

  redirect(`/cardio/${id}/edit`);
}
