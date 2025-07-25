import UnicornAutoConnect from '@/components/UnicornAutoConnect';
import TrueUniversalBridge from '@/components/UniversalBridge';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🦄 Welcome to My Unicorn dApp
          </h1>
          <p className="text-xl text-gray-600">
            Connect your Unicorn wallet, bridge tokens, or buy directly with your debit card
          </p>
        </div>
        
        <div className="space-y-8">
          {/* Wallet Connection Section */}
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Wallet Connection
            </h2>
            <UnicornAutoConnect />
          </div>

          {/* True Universal Bridge Section */}
          <TrueUniversalBridge />
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-2">
            This app discovers cross-chain tokens, finds optimal bridge routes, and enables direct fiat purchases.
          </p>
          <p className="text-sm text-gray-500">
            Powered by Thirdweb Universal Bridge, Fiat On-Ramps, Unicorn.eth, and Next.js 14
          </p>
        </div>
      </div>
    </main>
  );
}