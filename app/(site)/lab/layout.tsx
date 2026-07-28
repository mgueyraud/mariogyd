// Exists only to scope lab.css to the lab routes — the index and every
// experiment page — instead of loading demo styles site-wide.
import "./lab.css";

export default function LabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
