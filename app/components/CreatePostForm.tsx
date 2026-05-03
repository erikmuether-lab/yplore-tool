"use client";

import { useState } from "react";

export default function CreatePostForm({
  entities,
  selectedEntityId,
  defaultDate,
}: {
  entities: { id: string; name: string }[];
  selectedEntityId?: string;
  defaultDate: string;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <form
      method="post"
      action="/api/posts"
      encType="multipart/form-data"
      onSubmit={() => setLoading(true)}
      style={{ display: "grid", gap: "14px" }}
    >
      {/* ENTITY */}
      <select name="entityId" defaultValue={selectedEntityId}>
        {entities.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}
          </option>
        ))}
      </select>

      {/* 🔥 MULTI PLATFORM */}
      <div>
        <strong>Plattformen auswählen:</strong>

        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          <label>
            <input type="checkbox" name="platforms" value="tiktok" /> TikTok
          </label>

          <label>
            <input type="checkbox" name="platforms" value="instagram" /> Instagram
          </label>

          <label>
            <input type="checkbox" name="platforms" value="youtube" /> YouTube
          </label>
        </div>
      </div>

      {/* TITLE */}
      <input name="title" placeholder="Titel (optional)" />

      {/* CAPTION */}
      <textarea name="caption" placeholder="Caption" required />

      {/* DATE + TIME */}
      <div style={{ display: "flex", gap: "10px" }}>
        <input type="date" name="date" defaultValue={defaultDate} required />
        <input type="time" name="time" required />
      </div>

      {/* VIDEO UPLOAD */}
      <div>
        <strong>Video hochladen:</strong>
        <input type="file" name="videoFile" accept="video/*" />
      </div>

      {/* ODER URL */}
      <input
        name="publicVideoUrl"
        placeholder="ODER: öffentliche Video URL (z. B. R2)"
      />

      {/* SUBMIT */}
      <button type="submit" disabled={loading}>
        {loading ? "Wird erstellt..." : "Post erstellen"}
      </button>
    </form>
  );
}