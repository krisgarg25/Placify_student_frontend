import React from 'react';

export default function ProgressRing({
    progress = 65,
    size = 160,
    strokeWidth = 14,
    segments: propSegments
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;
    const defaultSegments = [
        { value: 32, color: '#E8A5A5' },
        { value: 10, color: '#8FD38F' },
        { value: 23, color: '#D9CC9A' }
    ];

    const segments = propSegments?.length > 0 ? propSegments : defaultSegments;
    const safeProgress = Math.min(100, Math.max(0, progress || 0));

    const totalValue = segments.reduce((acc, seg) => acc + (seg.value || 0), 0);

    const gapAngle = 10;
    const totalGapAngle = segments.length * gapAngle;
    const availableAngle = 360 - totalGapAngle;

    let currentAngle = 90;
    currentAngle = 0;

    const dynamicSegments = segments.map(seg => {
        const fraction = (seg.value || 0) / 100;
        const sweep = fraction * availableAngle;

        const segment = {
            startAngle: currentAngle,
            sweepAngle: sweep,
            color: seg.color
        };

        currentAngle += sweep + gapAngle;
        return segment;
    });

    const angleToOffset = (startAngle) => circumference * (1 - startAngle / 360);
    const sweepToLength = (sweepAngle) => (sweepAngle / 360) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    viewBox={`0 0 ${size} ${size}`}
                    className="transform -rotate-90"
                    style={{ width: size, height: size }}
                >
                    {/* Background track */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke="#404040"
                        strokeWidth={strokeWidth}
                        fill="none"
                        opacity="0.3"
                    />
                    {dynamicSegments.map((seg, index) => (
                        <circle
                            key={index}
                            cx={center}
                            cy={center}
                            r={radius}
                            stroke={seg.color}
                            strokeWidth={strokeWidth}
                            fill="none"
                            strokeDasharray={`${sweepToLength(seg.sweepAngle)} ${circumference - sweepToLength(seg.sweepAngle)}`}
                            strokeDashoffset={angleToOffset(seg.startAngle)}
                            strokeLinecap="round"
                            style={{ transition: 'all 1s ease-out' }}
                        />
                    ))}
                </svg>

                {/* Center percentage */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                        {safeProgress > 0 ? `${Math.round(safeProgress)}%` : '—'}
                    </span>
                </div>
            </div>


            <div className="flex items-center justify-center gap-4 mt-5">
                {segments.map((seg, index) => (
                    seg.value > 0 && (
                        <div key={index} className="flex items-center gap-2">
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: seg.color }}
                            />

                            {seg.label && (
                                <span className="text-xs text-gray-400 font-medium">
                                    {seg.label}
                                </span>
                            )}
                        </div>
                    )
                ))}
            </div>
        </div>
    );
}
