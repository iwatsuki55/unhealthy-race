import { redirect } from "next/navigation";

interface RunningRedirectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RunningRedirectPage({ params }: RunningRedirectPageProps) {
  const { id } = await params;

  redirect(`/cardio/${id}`);
}
