import { redirect } from "next/navigation";

export default async function ChannelsPage() {
  // Redirect to general channel by default
  redirect("/channels/general");
} 