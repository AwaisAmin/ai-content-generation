import { Headphones } from "lucide-react";
import ComingSoon from "@/components/layout/ComingSoon";

export const metadata = { title: "Support" };

export default function SupportPage() {
  return (
    <ComingSoon
      icon={Headphones}
      title="Help & support"
      description="Guides, prompt tips and direct chat with the Fomi team are on their way."
    />
  );
}
