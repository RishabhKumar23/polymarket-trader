'use client';
import React, { useEffect, useState } from 'react';

type Market = {
    title: string;
    yesPrice: number;
    noPrice: number;
    signalStrength: number;
    action: string;
};

export default function MarketTable() {
    const [markets, setMarkets] = useState<Market[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMarkets() {
            try {
                // Only call the internal API endpoint for both sources
                const polyRes = await fetch('/api/markets');

                // Check if the response is successful
                if (!polyRes.ok) {
                    throw new Error(`Failed to fetch data: ${polyRes.statusText}`);
                }

                const { polyData, igData } = await polyRes.json();

                console.log('Full Infinite Games API Response:', igData);

                // Extract events from the response
                const igEvents = igData.items || []; // Ensure igEvents is an array

                // Map over the Polymarket data and match it with Infinite Games events
                const formatted = polyData.map((m: any) => {
                    const igMatch = igEvents.find((ig: any) =>
                        m.title.toLowerCase().includes(ig.title.toLowerCase().slice(0, 15)) // fuzzy match
                    );

                    const igProbability = igMatch?.probability ?? null;
                    const delta = igProbability !== null ? (igProbability - (m.prices?.yes ?? 0)) : null;

                    // Calculate signal strength and action based on delta
                    let signalStrength = 0;
                    let action = 'No Trade';

                    if (delta !== null) {
                        signalStrength = Math.abs(delta);

                        if (signalStrength > 0.03) {
                            action = delta > 0 ? 'Buy YES' : 'Buy NO';
                        }
                    }

                    return {
                        id: m.id,
                        title: m.title,
                        yesPrice: m.prices?.yes ?? 0,
                        noPrice: m.prices?.no ?? 0,
                        signalStrength: signalStrength,
                        action: action,
                    };
                });

                setMarkets(formatted);
            } catch (err) {
                console.error('Failed to fetch market data:', err);
            } finally {
                setLoading(false); // Set loading to false when the data is fetched
            }
        }

        fetchMarkets();
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Polymarket Trading Bot</h1>
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2 border">Market</th>
                        <th className="p-2 border">Yes Price</th>
                        <th className="p-2 border">No Price</th>
                        <th className="p-2 border">Signal Strength</th>
                        <th className="p-2 border">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {markets.map((market, idx) => (
                        <tr key={idx} className="text-center">
                            <td className="p-2 border">{market.title}</td>
                            <td className="p-2 border">{market.yesPrice}</td>
                            <td className="p-2 border">{market.noPrice}</td>
                            <td className="p-2 border">{market.signalStrength}</td>
                            <td className="p-2 border font-semibold">{market.action}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
