'use client'
import { useRouter } from 'next/navigation'
import { codigoDemo, guardar } from '../lib/local'

export default function EntrarDemo() {
  const router = useRouter()
  return (
    <button className="boton w-full" onClick={() => { const c = codigoDemo(); guardar({ codigo: c, etapa: 'inicio' }); router.push(`/caso?c=${c}`) }}>
      Vengo de mi banco: empezar mi caso
    </button>
  )
}
