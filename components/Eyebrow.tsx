export function Eyebrow({ num = "—", label }: { num?: string; label: string }) {
  return (
    <div className="eyebrow">
      <span className="eyebrow__num">{num}</span> {num === "—" ? label : `— ${label}`}
    </div>
  );
}
