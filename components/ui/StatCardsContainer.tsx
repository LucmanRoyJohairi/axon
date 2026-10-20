export default function StatCards({statCards}:any){
    return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card:any, i:number) => (
            <div
            key={card.label}
            className="card p-5 opacity-0 animate-fade-up"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'forwards' }}
            >
            <div className="text-ink-3 text-xs font-medium tracking-wide uppercase mb-2">{card.label}</div>
            <div className={`text-3xl font-display font-semibold ${card.color} leading-none mb-1`}>
                {card.value}
            </div>
            <div className="text-ink-3 text-xs">{card.sub}</div>
            </div>
        ))}
    </div>
}