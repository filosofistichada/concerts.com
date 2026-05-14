import Button from "./Button";

type Props = {
  title: string,
  type: "empty" | "loading" | "error",
  description?: string,
  extraCss?: string,
  actionText?: string,
  onAction?: () => void
}
export default function StateMessage({ title, type, description, extraCss, actionText, onAction }: Props) {
    const ring =
        type === "error"
        ? "border-red-200 bg-red-50 text-danger-600"
        : type === "loading"
        ? "border-brand-200 bg-brand-50 text-brand-700"
        : "border-border bg-white text-muted";

  return (
    <div className={`rounded-card border border-dashed border-border p-6 text-center shadow-card ${ring} ${extraCss}`}>
      <h2 className="m-0 text-base font-semibold">{title}</h2>

      {description && <p className="mt-2 text-sm text-muted">{description}</p>}

      {actionText && onAction && (
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}