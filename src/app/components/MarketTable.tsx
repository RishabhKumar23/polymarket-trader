'use client';
import React, { useEffect, useState } from 'react';

type Market = {
    id: string;
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
                const res = await fetch('/api/markets');
                if (!res.ok) {
                    throw new Error(`Failed to fetch data: ${res.statusText}`);
                }

                const { polyData, igData } = await res.json();
                const igEvents = igData.items || [];
                console.log("Data for api", polyData.markets);

                const formatted = polyData.map((m: any) => {
                    // console.log("Data for api", polyData);
                    const market = Array.isArray(m.markets) ? m.markets[0] : null;
                    console.log("Market Data", market); // -- Working

                    const outcomes: { name: string;[key: string]: any }[] = Array.isArray(market?.outcomes) ? market.outcomes : [];
                    console.log("outcome",outcomes);

                    const yesOutcome = outcomes.find((o) => o.name === 'Yes');
                    const noOutcome = outcomes.find((o) => o.name === 'No');
                    console.log(yesOutcome, noOutcome);

                    const yesPrice = yesOutcome?.lastPrice ?? yesOutcome?.price ?? 0;
                    const noPrice = noOutcome?.lastPrice ?? noOutcome?.price ?? 0;

                    const igMatch = igEvents.find((ig: any) =>
                        m.title.toLowerCase().includes(ig.title.toLowerCase().slice(0, 15))
                    );

                    const igProbability = igMatch?.probability ?? null;
                    const delta = igProbability !== null ? igProbability - yesPrice : null;

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
                        yesPrice, 
                        noPrice,
                        signalStrength,
                        action,
                    };
                });

                setMarkets(formatted);
            } catch (err) {
                console.error('Failed to fetch market data:', err);
            } finally {
                setLoading(false);
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
                    <tr className="">
                        <th className="p-2 border">Market</th>
                        <th className="p-2 border">Yes Price</th>
                        <th className="p-2 border">No Price</th>
                        <th className="p-2 border">Signal Strength</th>
                        <th className="p-2 border">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {markets.map((market) => (
                        <tr key={market.id} className="text-center">
                            <td className="p-2 border">{market.title}</td>
                            <td className="p-2 border">{market.yesPrice.toFixed(2)}</td>
                            <td className="p-2 border">{market.noPrice.toFixed(2)}</td>
                            <td className="p-2 border">{market.signalStrength.toFixed(2)}</td>
                            <td className="p-2 border font-semibold">{market.action}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
