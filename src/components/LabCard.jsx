export default function LabCard({ icon, title, desc, onClick }) {
  return (
    <div className="lab-card" onClick={onClick}>
      <div className="lab-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <span className="enter">Enter Lab →</span>
    </div>
  );
}
