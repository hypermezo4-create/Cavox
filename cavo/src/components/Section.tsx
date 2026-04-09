export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: 16, border: "1px solid #eee", borderRadius: 12, marginBottom: 12 }}>
      <h2 style={{ margin: 0, marginBottom: 10 }}>{title}</h2>
      {children}
    </section>
  );
}
