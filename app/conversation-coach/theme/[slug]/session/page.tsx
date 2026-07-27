import { notFound } from "next/navigation";
import { ConversationSession } from "@/app/conversation-coach/_components/conversation-session";
import { conversationCoachThemeMap } from "@/lib/conversation-coach-data";

export default async function ConversationSessionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const theme = conversationCoachThemeMap[slug];

  if (!theme) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <ConversationSession theme={theme} />
    </main>
  );
}
