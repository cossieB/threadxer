import { useLocation } from "@solidjs/router";
import { Show } from "solid-js";

export default function NotFound() {
    const location = useLocation()
    return (
        <>
            <main
                style={{
                    height: '100vh',
                    display: 'flex',
                    "justify-content": 'center',
                    "align-items": 'center'
                }}
            >
                <h1
                    style={{
                        "font-size": 'clamp(10rem, 25vw, 100vw)',
                        padding: '0',
                        margin: '0'
                    }}
                >
                    404
                </h1>
            </main>
        </>
    );
}
