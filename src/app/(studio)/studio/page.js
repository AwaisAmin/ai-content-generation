import StudioShell from "@/components/studio/StudioShell";
import { StudioProvider } from "@/components/studio/StudioProvider";

export const metadata = {
  title: "Studio",
  description: "Branch, compare and refine image directions in a version tree.",
};

export default function StudioPage() {
  return (
    <StudioProvider>
      <StudioShell />
    </StudioProvider>
  );
}
