import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Respaldo',
  description: 'Qué hacer después de un fraude, paso por paso, sin darnos tus datos. México.',
}

// Persona test (Doña Lety): "Operador" in this menu read as "a person who'll help me" and led her to the staff
// dashboard, where she quit. Staff pages now live only behind the footer link.
const NAV = [
  ['/caso', 'Mi caso'],
  ['/documentos', 'Mis papeles'],
  ['/es-real', '¿Me escribió Respaldo?'],
]

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <header className="bg-azul text-white">
          <div className="mx-auto max-w-3xl px-4 py-3">
            <Link href="/" className="text-lg font-bold">Respaldo</Link>
            <nav className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {NAV.map(([h, t]) => <Link key={h} href={h} className="opacity-90 underline-offset-4 hover:underline">{t}</Link>)}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-5">{children}</main>
        <footer className="mx-auto max-w-3xl border-t border-arena px-4 pb-8 pt-4 text-xs text-neutral-600">
          <p className="mb-2"><Link className="underline" href="/reglas">Qué guardamos de ti</Link> · <Link className="underline" href="/operador">Solo para empleados que atienden casos</Link></p>
          Proyecto de clase (Crystal Ball Studio, semana 8), no es un servicio oficial ni de ningún banco. La conexión con bancos es SIMULADA.
          Los papeles son modelos, no asesoría legal: confírmalos con la institución. Emergencias: 911 · Denuncia anónima: 089 · CONDUSEF: 55 5340 0999.
        </footer>
      </body>
    </html>
  )
}
