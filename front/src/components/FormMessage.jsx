export default function FormMessage({ text, type }) {
  if (!text) return <div className="form-message" />;
  return (
    <div className={`form-message ${type || ''}`} role={type === 'error' ? 'alert' : 'status'}>
      {text}
    </div>
  );
}
