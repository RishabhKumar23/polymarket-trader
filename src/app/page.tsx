import MarketTable from './components/MarketTable'

export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Polymarket Trading Bot</h1>
      <MarketTable />
    </main>
  )
}
