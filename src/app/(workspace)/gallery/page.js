import { Images } from "lucide-react";
import ComingSoon from "@/components/layout/ComingSoon";

export const metadata = { title: "Gallery" };

export default function GalleryPage() {
  return (
    <ComingSoon
      icon={Images}
      title="Community gallery"
      description="Discover what other creators are making and remix their prompts as a starting point."
    />
  );
}
