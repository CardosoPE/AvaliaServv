import { COUNTRIES, getCountry } from '../api/phone.js';

export default function PhoneField({ country, number, onChange, id = 'whatsapp' }) {
  const current = getCountry(country);

  return (
    <div className="ddi-wrapper">
      <select
        className="ddi-select"
        id={`ddi-${id}`}
        value={country}
        onChange={(e) => onChange({ country: e.target.value, number: '' })}
        aria-label="Código do país"
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} +{c.ddi} — {c.name}
          </option>
        ))}
      </select>
      <input
        type="tel"
        id={id}
        className="form-input"
        placeholder={current.mask}
        value={number}
        onChange={(e) => onChange({ country, number: e.target.value })}
      />
    </div>
  );
}
