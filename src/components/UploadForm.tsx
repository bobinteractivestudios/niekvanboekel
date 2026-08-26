"use client";

import { useActionState, useRef, useState } from "react";
import { uploadPresigned } from "@vercel/blob/client";
import { submitMemory, type SubmitState } from "@/app/deel/actions";
import { MAX_FILES_PER_POST, extensionFor, kindForType } from "@/lib/uploadShared";

const initialState: SubmitState = { status: "idle" };

export function UploadForm({ blobEnabled }: { blobEnabled: boolean }) {
  const [state, formAction, isPending] = useActionState(submitMemory, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [previews, setPreviews] = useState<{ url: string; isVideo: boolean }[]>([]);
  const [uploadStatus, setUploadStatus] = useState<{ busy: boolean; error?: string }>({
    busy: false,
  });
  // Belt-and-suspenders against double submits: disabling the button via
  // React state still leaves a brief window — between the click and the
  // re-render that actually sets the disabled attribute — where a fast
  // double-tap fires the handler twice. This ref is checked synchronously,
  // before any state update or async work, so it closes that gap.
  const isSubmittingRef = useRef(false);

  function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setPreviews(
      files.map((file) => ({
        url: URL.createObjectURL(file),
        isVideo: file.type.startsWith("video/"),
      }))
    );
  }

  if (state.status === "success") {
    return (
      <div className="rounded-2xl bg-surface p-8 text-center ring-1 ring-border">
        <p className="font-serif text-xl text-foreground">Bedankt.</p>
        <p className="mt-2 text-sm text-muted">{state.message}</p>
      </div>
    );
  }

  const busy = isPending || uploadStatus.busy;

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;

        try {
          setUploadStatus({ busy: false, error: undefined });

          if (blobEnabled) {
            // Photos/videos go straight from the browser to Vercel Blob —
            // server actions on Vercel cap request bodies at ~4.5MB, which
            // real photos blow past. Only the resulting URLs travel through
            // the server action below.
            const files = formData
              .getAll("files")
              .filter((entry): entry is File => entry instanceof File && entry.size > 0);
            formData.delete("files");

            if (files.length > MAX_FILES_PER_POST) {
              setUploadStatus({
                busy: false,
                error: `Je kan maximaal ${MAX_FILES_PER_POST} bestanden per keer delen.`,
              });
              return;
            }

            if (files.length > 0) {
              setUploadStatus({ busy: true });
              const uploaded = [];
              try {
                for (const file of files) {
                  const kind = kindForType(file.type);
                  if (!kind) {
                    throw new Error(`Bestandstype niet ondersteund: ${file.type || "onbekend"}`);
                  }
                  const pathname = `${crypto.randomUUID()}.${extensionFor(file.type)}`;
                  const blob = await uploadPresigned(pathname, file, {
                    access: "public",
                    handleUploadUrl: "/api/blob-upload",
                    contentType: file.type,
                  });
                  uploaded.push({ url: blob.url, mimeType: file.type, kind });
                }
              } catch (error) {
                setUploadStatus({
                  busy: false,
                  error:
                    error instanceof Error
                      ? error.message
                      : "Uploaden is niet gelukt. Probeer het opnieuw.",
                });
                return;
              }
              formData.set("uploadedMedia", JSON.stringify(uploaded));
              setUploadStatus({ busy: false });
            }
          }

          await formAction(formData);
          formRef.current?.reset();
          previews.forEach((p) => URL.revokeObjectURL(p.url));
          setPreviews([]);
        } finally {
          isSubmittingRef.current = false;
        }
      }}
      className="space-y-6"
    >
      <div>
        <label htmlFor="authorName" className="block text-sm font-medium text-foreground">
          Naam <span className="text-muted font-normal">(optioneel)</span>
        </label>
        <input
          id="authorName"
          name="authorName"
          type="text"
          maxLength={80}
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent"
          placeholder="Jouw naam"
        />
      </div>

      <div>
        <label htmlFor="body" className="block text-sm font-medium text-foreground">
          Jouw herinnering
        </label>
        <textarea
          id="body"
          name="body"
          rows={6}
          maxLength={4000}
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent"
          placeholder="Deel een herinnering, gedachte of foto..."
        />
      </div>

      <div>
        <label htmlFor="files" className="block text-sm font-medium text-foreground">
          Foto&apos;s of video&apos;s <span className="text-muted font-normal">(optioneel, max 6)</span>
        </label>
        <input
          id="files"
          name="files"
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFilesChange}
          className="mt-1.5 w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent-foreground file:cursor-pointer"
        />
        {previews.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {previews.map((preview, index) =>
              preview.isVideo ? (
                <video
                  key={index}
                  src={preview.url}
                  className="h-24 w-full rounded-lg object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={index}
                  src={preview.url}
                  alt=""
                  className="h-24 w-full rounded-lg object-cover"
                />
              )
            )}
          </div>
        )}
      </div>

      {(state.status === "error" || uploadStatus.error) && (
        <p className="text-sm text-red-600">{uploadStatus.error ?? state.message}</p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {uploadStatus.busy
          ? "Bezig met uploaden..."
          : isPending
            ? "Bezig met versturen..."
            : "Herinnering delen"}
      </button>
    </form>
  );
}
