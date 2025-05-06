import { useEffect, useRef } from 'react';
import '../styles/meter.css';

interface MeterProps {
    value: number;
    title?: string;
    subtitle?: string;
}

const Meter: React.FC<MeterProps> = ({ value, title = '今月の貯蓄率', subtitle }) => {
    // Fix the TypeScript warning by using the correct type
    const needleRef = useRef<SVGSVGElement | null>(null);

    // Calculate rotation angle based on percentage (0-40% maps to -70 to 70 degrees)
    const calculateRotation = (percentage: number) => {
        // Handle negative values - treat them as 0 for rotation
        const adjustedPercentage = percentage < 0 ? 0 : percentage;

        const minRotation = -70;
        const maxRotation = 70;
        const maxPercentage = 40;

        // Limit the percentage to the 0-40 range
        const limitedPercentage = Math.min(adjustedPercentage, maxPercentage);

        return minRotation + (limitedPercentage / maxPercentage) * (maxRotation - minRotation);
    };

    // Get color based on savings rate
    const getSavingsRateColor = (rate: number) => {
        if (rate < 0) return '#E85C5C';
        if (rate < 15) return '#F5A623';
        if (rate < 30) return '#A5D45F';
        return '#27AC70'; // Green for excellent
    };

    const getSavingsRateLabel = (rate: number) => {
        if (rate < 0) return '赤字';
        if (rate < 15) return '低貯蓄';
        if (rate < 30) return '中貯蓄';
        return '高貯蓄';
    };

    useEffect(() => {
        if (needleRef.current) {
            // Set the needle rotation
            const rotation = calculateRotation(value);
            if ("style" in needleRef.current) {
                needleRef.current.style.transform = `rotate(${rotation}deg)`;
            }

            // Animate the needle
            if ("style" in needleRef.current) {
                needleRef.current.style.transition = 'transform 1.5s ease-in-out';
            }
        }
    }, [value]);

    return (
        <div className="meter-container w-full">
            {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}

            <div className="flex flex-col items-center justify-center gap-4">
                {/* Meter - Increased size */}
                <div className="meter-gauge relative w-full max-w-md mx-auto">
                    {/* Meter Background with increased size */}
                    <svg width="100%" height="250" viewBox="0 0 328 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                        <defs>
                            {/* Gradient definition */}
                            <linearGradient id="bearBullGradient" x1="30" y1="150" x2="297" y2="150" gradientUnits="userSpaceOnUse">
                                <stop offset="0" stopColor="#E85C5C" />
                                <stop offset="0.33" stopColor="#F5A623" />
                                <stop offset="1" stopColor="#27AC70" />
                            </linearGradient>
                        </defs>

                        {/* Full semicircle with gradient - Fixed coordinates */}
                        <mask id="meter-mask" fill="white">
                            <path d="M281.037 173.621C290.28 173.621 297.88 166.1 296.728 156.93C295.239 145.084 292.169 133.465 287.581 122.389C280.853 106.146 270.992 91.387 258.56 78.956C246.129 66.5238 231.37 56.6625 215.127 49.9345C198.885 43.2065 181.476 39.7437 163.895 39.7437C146.314 39.7437 128.905 43.2065 112.662 49.9345C96.4191 56.6625 81.6606 66.5238 69.2289 78.956C56.7972 91.387 46.9359 106.146 40.2079 122.389C35.6198 133.465 32.5502 145.084 31.0617 156.93C29.9094 166.1 37.5095 173.621 46.7518 173.621V173.621C55.9941 173.621 63.3446 166.078 64.8778 156.964C66.1313 149.513 68.2246 142.21 71.1296 135.197C76.1756 123.015 83.5716 111.946 92.8953 102.622C102.219 93.298 113.288 85.902 125.47 80.856C137.652 75.81 150.709 73.213 163.895 73.213C177.08 73.213 190.137 75.81 202.319 80.856C214.501 85.902 225.57 93.298 234.894 102.622C244.218 111.946 251.614 123.015 256.66 135.197C259.565 142.21 261.658 149.513 262.911 156.964C264.445 166.078 271.795 173.621 281.037 173.621V173.621Z" />
                        </mask>
                        <path d="M281.037 173.621C290.28 173.621 297.88 166.1 296.728 156.93C295.239 145.084 292.169 133.465 287.581 122.389C280.853 106.146 270.992 91.387 258.56 78.956C246.129 66.5238 231.37 56.6625 215.127 49.9345C198.885 43.2065 181.476 39.7437 163.895 39.7437C146.314 39.7437 128.905 43.2065 112.662 49.9345C96.4191 56.6625 81.6606 66.5238 69.2289 78.956C56.7972 91.387 46.9359 106.146 40.2079 122.389C35.6198 133.465 32.5502 145.084 31.0617 156.93C29.9094 166.1 37.5095 173.621 46.7518 173.621V173.621C55.9941 173.621 63.3446 166.078 64.8778 156.964C66.1313 149.513 68.2246 142.21 71.1296 135.197C76.1756 123.015 83.5716 111.946 92.8953 102.622C102.219 93.298 113.288 85.902 125.47 80.856C137.652 75.81 150.709 73.213 163.895 73.213C177.08 73.213 190.137 75.81 202.319 80.856C214.501 85.902 225.57 93.298 234.894 102.622C244.218 111.946 251.614 123.015 256.66 135.197C259.565 142.21 261.658 149.513 262.911 156.964C264.445 166.078 271.795 173.621 281.037 173.621V173.621Z"
                              fill="url(#bearBullGradient)"
                              stroke="white"
                              strokeWidth="2.5"
                              mask="url(#meter-mask)" />
                    </svg>

                    {/* Needle - Adjusted position for larger meter */}
                    <svg
                        width="30"
                        height="144"
                        viewBox="0 0 30 144"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="meter-needle absolute left-[45%] top-[25%]"
                        style={{ transformOrigin: '50% calc(100% - 15px)' }}
                        ref={needleRef}
                    >
                        <circle cx="15.2089" cy="128.608" r="10.9086" fill="white" stroke="#01C738" strokeWidth="7" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M17.3486 0.920656L25.3277 127.679L25.3166 127.679C25.322 127.833 25.3239 127.988 25.322 128.144C25.2587 133.535 20.8377 137.853 15.4474 137.79C10.0571 137.726 5.73875 133.305 5.80203 127.915C5.80386 127.759 5.80934 127.604 5.81838 127.45L5.80766 127.45L17.3486 0.920656ZM19.2238 134.487C22.4036 132.316 23.2212 127.978 21.0498 124.798C18.8784 121.618 14.5404 120.801 11.3606 122.972C8.18076 125.144 7.36323 129.482 9.53459 132.661C11.706 135.841 16.044 136.659 19.2238 134.487Z" fill="url(#paint0_linear_498_1180)" />
                        <defs>
                            <linearGradient id="paint0_linear_498_1180" x1="8.57715" y1="129.079" x2="18.8019" y2="129.199" gradientUnits="userSpaceOnUse">
                                <stop offset="0.7" stopColor="#3F4142" />
                                <stop offset="0.7" stopColor="#2C2C2C" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Redesigned: Value information below the meter instead of side-by-side */}
                <div className="meter-value flex items-center justify-center gap-4 mt-2">
                    {/* Value Display */}
                    <div
                        className="meter-percentage text-5xl font-bold"
                        style={{ color: getSavingsRateColor(value) }}
                    >
                        {Math.round(value)}%
                    </div>

                    {/* Label Display - now side by side with percentage */}
                    <div
                        className="meter-label text-3xl font-semibold"
                        style={{ color: getSavingsRateColor(value) }}
                    >
                        {getSavingsRateLabel(value)}
                    </div>
                </div>

                {/* Subtitle/Explanation - moved below both percentage and label */}
                {subtitle && (
                    <div className="meter-subtitle mt-2 text-sm text-center text-muted max-w-md">
                        {subtitle}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Meter;