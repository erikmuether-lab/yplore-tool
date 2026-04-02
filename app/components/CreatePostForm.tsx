"use client";

import { useState } from "react";

type Entity = {
  id: string;
  name: string;
};

type CreatePostFormProps = {
  entities: Entity[];
  selectedEntityId?: string;
  defaultDate: string;
};

export default function CreatePostForm({
  entities,
  selectedEntityId,
  defaultDate,
}: CreatePostFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [submitText, setSubmitText] = useState("Post speichern");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const entityId = String(formData.get("entityId") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const platform = String(formData.get("platform") ?? "").trim();
    const date = String(formData.get("date") ?? "").trim();
    const time = String(formData.get("time") ?? "").trim();
    const caption = String(formData.get("caption") ?? "").trim();
    const manualPublicVideoUrl = String(
      formData.get("publicVideoUrl") ?? ""
    ).trim();
    const file = formData.get("videoFile");

    if (!entityId || !platform || !date || !time || !caption) {
      setError("Bitte alle Pflichtfelder ausfüllen.");
      return;
    }

    let publicVideoUrl = manualPublicVideoUrl;
    let videoFileName = "";
    let localVideoUrl = "";

    try {
      setIsUploading(true);

      if (file instanceof File && file.size > 0) {
        setSubmitText("Upload läuft...");

        const presignResponse = await fetch("/api/uploads/r2-presign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type || "video/mp4",
          }),
        });

        const presignData = await presignResponse.json();

        if (!presignResponse.ok || !presignData.uploadUrl || !presignData.publicUrl) {
          throw new Error(presignData.error || "Presign fehlgeschlagen.");
        }

        const uploadResponse = await fetch(presignData.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type || "video/mp4",
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error("Direkter Upload zu R2 fehlgeschlagen.");
        }

        publicVideoUrl = presignData.publicUrl;
        videoFileName = file.name;
        localVideoUrl = presignData.publicUrl;
      }

      if (!publicVideoUrl) {
        throw new Error(
          "Bitte entweder eine Video-Datei auswählen oder eine öffentliche Video-URL eintragen."
        );
      }

      setSubmitText("Speichert...");

      const scheduledAt = new Date(`${date}T${time}:00`);

            alert(
            JSON.stringify(
                {
                date,
                time,
                scheduledAtLocal: scheduledAt.toString(),
                scheduledAtIso: scheduledAt.toISOString(),
                },
                null,
                2
            )
            );
            
        console.log("date", date);
        console.log("time", time);
        console.log("scheduledAt local", scheduledAt);
        console.log("scheduledAt iso", scheduledAt.toISOString());

      const createResponse = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entityId,
          platform,
          title,
          caption,
          videoUrl: localVideoUrl || publicVideoUrl,
          publicVideoUrl,
          videoFileName: videoFileName || null,
          scheduledAt: scheduledAt.toISOString(),
        }),
      });

      if (!createResponse.ok) {
        const createData = await createResponse.json().catch(() => null);
        throw new Error(createData?.error || "Post konnte nicht gespeichert werden.");
      }

      window.location.reload();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unbekannter Fehler beim Erstellen."
      );
      setSubmitText("Post speichern");
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          display: "grid",
          gap: "14px",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#cbd5e1",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            Einheit
          </label>
          <select
            name="entityId"
            defaultValue={selectedEntityId}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #334155",
              background: "#0b1220",
              color: "#f8fafc",
            }}
          >
            {entities.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#cbd5e1",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            Titel
          </label>
          <input
            name="title"
            defaultValue="Neuer Post"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #334155",
              background: "#0b1220",
              color: "#f8fafc",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#cbd5e1",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            Plattform
          </label>
          <select
            name="platform"
            defaultValue="tiktok"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #334155",
              background: "#0b1220",
              color: "#f8fafc",
            }}
          >
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram Reel</option>
            <option value="youtube">YouTube Short</option>
          </select>
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#cbd5e1",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            Datum
          </label>
          <input
            name="date"
            type="date"
            defaultValue={defaultDate}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #334155",
              background: "#0b1220",
              color: "#f8fafc",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#cbd5e1",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            Uhrzeit
          </label>
          <input
            name="time"
            type="time"
            defaultValue="10:00"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #334155",
              background: "#0b1220",
              color: "#f8fafc",
            }}
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#cbd5e1",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            Caption
          </label>
          <textarea
            name="caption"
            defaultValue="Hier kommt die Caption hin"
            rows={4}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #334155",
              background: "#0b1220",
              color: "#f8fafc",
            }}
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#cbd5e1",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            Video-Datei
          </label>
          <input
            name="videoFile"
            type="file"
            accept="video/*"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #334155",
              background: "#0b1220",
              color: "#f8fafc",
            }}
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#cbd5e1",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            Öffentliche Video-URL (optional)
          </label>
          <input
            name="publicVideoUrl"
            type="url"
            placeholder="https://..."
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #334155",
              background: "#0b1220",
              color: "#f8fafc",
            }}
          />
        </div>
      </div>

      {error ? (
        <div
          style={{
            marginTop: "14px",
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid rgba(239,68,68,0.35)",
            background: "rgba(127,29,29,0.22)",
            color: "#fecaca",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      ) : null}

      <div
        style={{
          marginTop: "16px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="submit"
          disabled={isUploading}
          style={{
            minWidth: "176px",
            minHeight: "44px",
            padding: "10px 16px",
            borderRadius: "12px",
            border: "1px solid #3b82f6",
            background: "#2563eb",
            color: "#ffffff",
            cursor: isUploading ? "not-allowed" : "pointer",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 22px rgba(37,99,235,0.24)",
            opacity: isUploading ? 0.7 : 1,
          }}
        >
          {submitText}
        </button>

        <button
          type="button"
          disabled={isUploading}
          style={{
            minWidth: "176px",
            minHeight: "44px",
            padding: "10px 16px",
            borderRadius: "12px",
            border: "1px solid #475569",
            background: "#1e293b",
            color: "#f8fafc",
            cursor: isUploading ? "not-allowed" : "pointer",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: isUploading ? 0.7 : 1,
          }}
        >
          Als Entwurf speichern
        </button>
      </div>
    </form>
  );
}