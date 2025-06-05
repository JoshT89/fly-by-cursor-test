import PlaneGame from '@/components/PlaneGame';

export default function Home() {
  return (
    <main className="relative">
      <div className="absolute top-4 left-4 z-10 bg-black/50 text-white p-4 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Fly By</h1>
        <p className="mb-2">Controls:</p>
        <ul className="list-disc list-inside">
          <li>↑ - Increase Speed</li>
          <li>↓ - Decrease Speed</li>
          <li>← - Turn Left</li>
          <li>→ - Turn Right</li>
        </ul>
      </div>
      <PlaneGame />
    </main>
  );
}
