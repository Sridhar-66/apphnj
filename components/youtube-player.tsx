export function YouTubePlayer({ url, title }: { url?: string | null; title: string }) {
  if (!url) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 p-6 text-center text-slate-500">
        <div>
          <p className="text-sm">No video recording attached to this lesson.</p>
          <p className="mt-1 text-xs text-slate-600">Review lesson text and attached materials below.</p>
        </div>
      </div>
    );
  }

  // Extract YouTube ID
  let videoId = "";
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].slice(0, 11);
    }
  } catch {
    videoId = "";
  }

  if (!videoId) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 p-6 text-center text-slate-400">
        <p className="text-sm">Invalid or unsupported video URL format.</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}
