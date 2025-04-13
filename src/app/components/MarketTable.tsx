'use client'

import { useState, useEffect } from 'react'

type Market = {
    id: string
    question: string
    yesPrice: number
    noPrice: number
    volume: number
    updatedAt: string
    igProbability?: number
    delta?: number
}

export default function MarketTable() {
    const [markets, setMarkets] = useState<Market[]>([])

    useEffect(() => {
        async function fetchMarkets() {
            try {
                const [polyRes, igRes] = await Promise.all([
                    fetch('/api/polymarkets'),
                    fetch('https://ifgames.win/api/v2/events'),
                ])

                const [polyData, igData] = await Promise.all([
                    polyRes.json(),
                    igRes.json(),
                ])

                // Log igData to see what it looks like
                console.log('Infinite Games API Response:', igData)

                // Check if igData is an array
                if (!Array.isArray(igData)) {
                    console.error('Expected igData to be an array, but got:', igData)
                    return
                }

                const formatted = polyData.map((m: any) => {
                    const igMatch = igData.find((ig: any) =>
                        m.title.toLowerCase().includes(ig.title.toLowerCase().slice(0, 15)) // fuzzy match
                    )

                    const igProbability = igMatch?.probability ?? null
                    const delta = igProbability !== null ? (igProbability - (m.prices?.yes ?? 0)) : null

                    return {
                        id: m.id,
                        question: m.title,
                        yesPrice: m.prices?.yes ?? 0,
                        noPrice: m.prices?.no ?? 0,
                        volume: m.volumeUSD,
                        updatedAt: m.updatedAt,
                        igProbability,
                        delta,
                    }
                })

                setMarkets(formatted)
            } catch (err) {
                console.error('Failed to fetch market data:', err)
            }
        }

        fetchMarkets()
    }, [])

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Polymarket × Infinite Games Signal Table</h2>
            <table className="w-full border rounded-lg overflow-hidden text-left text-sm">
                <thead className="bg-gray-100 text-gray-600">
                    <tr>
                        <th className="p-3">Market</th>
                        <th className="p-3">YES</th>
                        <th className="p-3">IG Forecast</th>
                        <th className="p-3">Δ (Signal)</th>
                        <th className="p-3">Volume</th>
                        <th className="p-3">Updated</th>
                    </tr>
                </thead>
                <tbody>
                    {markets.map((m) => (
                        <tr key={m.id} className="border-t hover:bg-gray-50">
                            <td className="p-3 font-medium">{m.question}</td>
                            <td className="p-3 text-green-600">{(m.yesPrice * 100).toFixed(1)}%</td>
                            <td className="p-3 text-blue-500">
                                {m.igProbability !== undefined ? (m.igProbability * 100).toFixed(1) + '%' : '—'}
                            </td>
                            <td className="p-3 font-semibold text-purple-600">
                                {m.delta !== undefined ? ((m.delta * 100).toFixed(1) + '%') : '—'}
                            </td>
                            <td className="p-3">${(m.volume / 1000).toFixed(1)}K</td>
                            <td className="p-3">{new Date(m.updatedAt).toLocaleTimeString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
