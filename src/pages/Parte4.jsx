import ForceGraph3D from '../components/ForceGraph3D'

export default function Parte4() {
  return (
    <main className="flex min-h-0 w-full flex-1 flex-col" style={{ minHeight: 0 }}>
      <div
        className="flex min-h-0 w-full flex-1"
        style={{ minHeight: 0, height: '100%' }}
      >
        <ForceGraph3D partKey="parte4" />
      </div>
    </main>
  )
}
