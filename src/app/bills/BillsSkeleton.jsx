export default function BillsSkeleton() {
  return (
    <div className="container section-padding">
      <div className="placeholder-glow">
        {[1, 2, 3].map(i => (
          <div key={i} className="placeholder col-12 mb-3" />
        ))}
      </div>
    </div>
  );
}
