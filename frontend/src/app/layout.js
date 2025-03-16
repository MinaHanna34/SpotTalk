import '@/styles/globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
    title: 'SpotTalk',
    description: 'Your platform for seamless communication',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <Navbar />
                {/* Add navigation here if needed */}
                {children}
            </body>
        </html>
    );
}
