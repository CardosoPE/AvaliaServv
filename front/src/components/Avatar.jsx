import { initial } from '../api/format.js';

export default function Avatar({ name, photo, className = '' }) {
  return (
    <div className={className}>
      {photo ? <img src={photo} alt={name || 'Foto de perfil'} /> : initial(name)}
    </div>
  );
}
