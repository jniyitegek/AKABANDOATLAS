import React from 'react';
import { clsx } from 'clsx';

export default function Logo({ className = "", size = "normal", isDark = false }) {
    return (
        <div className={clsx("flex items-center group", className)}>
            <img 
                src="/AkabandoAtlas Logo .png" 
                alt="Akabando Atlas Logo"
                className={clsx(
                    "transition-all duration-500 group-hover:scale-105 object-contain",
                    size === "small" ? "h-[3.5rem]" : "h-20",
                    isDark && "brightness-0 invert"
                )}
            />
            <span className={clsx(
                "font-black tracking-tighter ml-4 leading-none transition-colors duration-500",
                size === "small" ? "hidden" : "block text-3xl",
                isDark ? "text-white" : "text-black" // Matches background contrast
            )}>
                AKABANDO<br /><span className="opacity-20 text-[0.4em] uppercase tracking-[0.4em] -mt-1 block">Atlas</span>
            </span>
        </div>
    );
}
