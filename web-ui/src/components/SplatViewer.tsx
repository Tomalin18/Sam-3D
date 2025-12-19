"use client";

import { useEffect, useRef } from "react";
// @ts-ignore
import * as GaussianSplats3D from "@mkkellogg/gaussian-splats-3d";

interface SplatViewerProps {
    url: string;
}

export default function SplatViewer({ url }: SplatViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const currentContainer = containerRef.current;
        let viewer: any = null;
        let mountPoint: HTMLDivElement | null = null;
        let isDisposed = false;

        const initViewer = async () => {
            if (!currentContainer || isDisposed) return;

            // Create a dedicated inner element that React doesn't know about
            mountPoint = document.createElement("div");
            mountPoint.style.width = "100%";
            mountPoint.style.height = "100%";
            currentContainer.appendChild(mountPoint);

            viewer = new GaussianSplats3D.Viewer({
                selfContained: false,
                useBuiltInControls: true,
                rootElement: mountPoint,
                cameraUp: [0, -1, 0],
                initialCameraPosition: [0, 0, -5],
                initialCameraLookAt: [0, 0, 0],
            });

            try {
                await viewer.addSplatScene(url, {
                    splatAlphaRemovalThreshold: 5,
                    showLoadingUI: true,
                });
                if (!isDisposed) {
                    viewer.start();
                }
            } catch (err) {
                if (!isDisposed) {
                    console.error("Error loading splat scene:", err);
                }
            }
        };

        initViewer();

        return () => {
            isDisposed = true;

            // Synchronously dispose the viewer - wrap everything in try/catch
            // to ignore errors from React Strict Mode's double-invocation  
            if (viewer) {
                try { viewer.stop(); } catch (e) { /* ignore */ }
                try { viewer.dispose(); } catch (e) { /* ignore */ }
                viewer = null;
            }

            // Safely remove the mount point
            if (mountPoint && currentContainer) {
                try {
                    if (currentContainer.contains(mountPoint)) {
                        currentContainer.removeChild(mountPoint);
                    }
                } catch (e) { /* ignore */ }
                mountPoint = null;
            }
        };
    }, [url]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full rounded-2xl overflow-hidden bg-black border border-white/10"
            style={{ minHeight: "500px" }}
        />
    );
}
