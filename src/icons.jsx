// Set de iconos SVG profesionales (trazo limpio, estilo moderno). Sin dependencias.
// Heredan el color del texto (currentColor) y el tamaño por prop `size`.

const S = ({ size = 22, fill = 'none', children, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {children}
  </svg>
)

export const Flash = (p) => <S {...p}><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></S>

export const Bike = (p) => <S {...p}><circle cx="18.5" cy="17.5" r="3.5" /><circle cx="5.5" cy="17.5" r="3.5" /><circle cx="15" cy="5" r="1" /><path d="M12 17.5V14l-3-3 4-3 2 3h2" /></S>

export const Package = (p) => <S {...p}><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" /><path d="M3.3 7 12 12l8.7-5" /><path d="M12 22V12" /></S>

export const Bag = (p) => <S {...p}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></S>

export const Star = ({ filled, ...p }) => <S fill={filled ? 'currentColor' : 'none'} {...p}><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.68a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z" /></S>

export const Pin = (p) => <S {...p}><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></S>

export const Locate = (p) => <S {...p}><line x1="2" x2="5" y1="12" y2="12" /><line x1="19" x2="22" y1="12" y2="12" /><line x1="12" x2="12" y1="2" y2="5" /><line x1="12" x2="12" y1="19" y2="22" /><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="1" fill="currentColor" /></S>

export const Clock = (p) => <S {...p}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></S>

export const Shield = (p) => <S {...p}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></S>

export const Wallet = (p) => <S {...p}><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></S>

export const Cash = (p) => <S {...p}><rect width="20" height="12" x="2" y="6" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></S>

export const Phone = (p) => <S {...p}><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384z" /></S>

export const Send = (p) => <S {...p}><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" /><path d="m21.854 2.147-10.94 10.939" /></S>

export const Check = (p) => <S {...p}><path d="M20 6 9 17l-5-5" /></S>

export const CheckCircle = (p) => <S {...p}><path d="M21.801 10A10 10 0 1 1 17 3.335" /><path d="m9 11 3 3L22 4" /></S>

export const X = (p) => <S {...p}><path d="M18 6 6 18M6 6l12 12" /></S>

export const ChevronRight = (p) => <S {...p}><path d="m9 18 6-6-6-6" /></S>

export const ArrowRight = (p) => <S {...p}><path d="M5 12h14M12 5l7 7-7 7" /></S>

export const Plus = (p) => <S {...p}><path d="M5 12h14M12 5v14" /></S>

export const User = (p) => <S {...p}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></S>

export const Settings = (p) => <S {...p}><path d="M20 7h-9M14 17H5" /><circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" /></S>

export const Lock = (p) => <S {...p}><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></S>

export const Refresh = (p) => <S {...p}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></S>

export const Play = (p) => <S {...p}><circle cx="12" cy="12" r="10" /><path d="m10 8 6 4-6 4z" fill="currentColor" stroke="none" /></S>

export const Power = (p) => <S {...p}><path d="M12 2v10" /><path d="M18.4 6.6a9 9 0 1 1-12.77.04" /></S>

export const ChartBar = (p) => <S {...p}><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="M7 16v-3M12 16v-6M17 16v-9" /></S>

export const Alert = (p) => <S {...p}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></S>

export const Store = (p) => <S {...p}><path d="M3 9l1.2-4.2A1 1 0 0 1 5.2 4h13.6a1 1 0 0 1 1 .8L21 9" /><path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9" /><path d="M3 9h18" /><path d="M10 20v-5h4v5" /></S>

export const Bell = (p) => <S {...p}><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /><path d="M3.26 15.3A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.7C19.4 14 18 12.5 18 8a6 6 0 1 0-12 0c0 4.5-1.4 6-2.74 7.3" /></S>

export const Minus = (p) => <S {...p}><path d="M5 12h14" /></S>

export const Camera = (p) => <S {...p}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z" /><circle cx="12" cy="13" r="3" /></S>

// Logo de marca reutilizable.
export function Logo() {
  return (
    <span className="logo">
      <span className="brand-ico"><Flash size={18} /></span>
      Flash<span className="moto">rider</span>
    </span>
  )
}

// Icono según el tipo de servicio.
export function TipoIco({ tipo, size = 22 }) {
  if (tipo === 'delivery') return <Bag size={size} />
  return <Bike size={size} />
}
