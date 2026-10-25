import { Folder } from "lucide-react";
import ComingSoon from "@/components/layout/ComingSoon";

export const metadata = { title: "Assets" };

export default function AssetsPage() {
  return (
    <ComingSoon
      icon={Folder}
      title="Your assets"
      description="Organise generations into folders, tag them and share collections with your team."
    />
  );
}
