"use client";

// Temporary UI kit preview — replaced by the real workspace in the next steps.
import { useState } from "react";
import { Download, Heart, Image as ImageIcon, Sparkles, Video } from "lucide-react";
import Accordion from "@/components/ui/Accordion";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Select from "@/components/ui/Select";
import Skeleton from "@/components/ui/Skeleton";

export default function HomePage() {
  const [mode, setMode] = useState("image");
  const [count, setCount] = useState(4);
  const [model, setModel] = useState("fomi-v2");

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold">UI kit</h1>
      <SegmentedControl
        label="Generation type"
        value={mode}
        onChange={setMode}
        options={[
          { value: "image", label: "Image", icon: ImageIcon },
          { value: "video", label: "Video", icon: Video },
        ]}
      />
      <div className="flex gap-2">
        <Button icon={Sparkles}>Generate</Button>
        <Button variant="secondary">Gallery</Button>
        <Button loading>Working</Button>
      </div>
      <div className="flex gap-2">
        <IconButton icon={Heart} label="Favourite" />
        <IconButton icon={Download} label="Download" variant="surface" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Select
          label="Number of images"
          prefix="#"
          value={count}
          onChange={setCount}
          options={[1, 2, 4, 8].map((n) => ({ value: n, label: String(n) }))}
        />
        <Select
          label="Model"
          prefix="Model:"
          value={model}
          onChange={setModel}
          options={[
            { value: "fomi-v2", label: "Fomi v2", description: "Balanced" },
            { value: "fomi-xl", label: "Fomi XL", description: "Highest detail" },
          ]}
        />
      </div>
      <Accordion title="Advance">Advanced settings go here.</Accordion>
      <Skeleton className="aspect-[3/4] w-32" />
    </main>
  );
}
