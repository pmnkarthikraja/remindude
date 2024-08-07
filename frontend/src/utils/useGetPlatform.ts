import { useEffect, useState } from "react";

export type Platform = 'Windows'|'Android'|'IOS'|'Mac'|'Unknown'

export function useGetPlatform(onPlatformChange:(platform:Platform)=>void):Platform {
    const [platform,setPlatform]=useState<Platform>('Windows')

    useEffect(()=>{
        const detectPlatform = () => {
            const userAgent = navigator.userAgent;
            const p = getPlatform(userAgent);
            setPlatform(p);
            onPlatformChange(p);  
        };

        detectPlatform()
        window.addEventListener('resize',detectPlatform)
        return () => {
            window.removeEventListener('resize', detectPlatform);  
        };
    },[onPlatformChange])

   return platform
}


function getPlatform(userAgent:string):Platform{
    if (/windows/i.test(userAgent)) {
        return "Windows";
    }

    if (/android/i.test(userAgent)) {
        return "Android";
    }

    if (/iPad|iPhone|iPod/.test(userAgent)) {
        return "IOS";
    }

    if (/Mac|Macintosh/.test(userAgent)){
        return 'Mac'
    }

    return 'Unknown';
}