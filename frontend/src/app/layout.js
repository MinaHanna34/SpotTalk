import '@/styles/globals.css';

export const metadata = {
    title: 'SpotTalk',
    description: 'Your platform for seamless communication',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                {/* Add navigation here if needed */}
                {children}
            </body>
        </html>
    );
}
