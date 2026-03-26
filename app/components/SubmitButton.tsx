"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  idleText: string;
  pendingText: string;
  style?: React.CSSProperties;
};

export default function SubmitButton({
  idleText,
  pendingText,
  style,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} style={style}>
      {pending ? pendingText : idleText}
    </button>
  );
}