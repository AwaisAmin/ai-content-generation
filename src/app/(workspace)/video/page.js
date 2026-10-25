import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export const metadata = { title: "Video generation" };

export default function VideoPage() {
  return <WorkspaceShell title="Video generation" feedType="video" defaultType="video" />;
}
