// BondFi Hackathon MVP
import { useState, useEffect } from "react";

interface WeilChainStatus {
  connected: boolean;
  txId: string;
  oracleScore: number;
  timestamp: string;
}

const HackathonDemo = () => {
  const [weilChainStatus, setWeilChainStatus] = useState<WeilChainStatus>({
    connected: false,
    txId: "",
    oracleScore: 0,
    timestamp: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // BondFi Hackathon MVP - Simulate WeilChain connection
  useEffect(() => {
    const timer = setTimeout(() => {
      setWeilChainStatus((prev) => ({
        ...prev,
        connected: true,
      }));
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // BondFi Hackathon MVP - Handle compliance submission
  const handleComplianceSubmit = () => {
    setIsProcessing(true);
    setFormSubmitted(true);

    // Simulate WeilChain transaction
    setTimeout(() => {
      const txId = `weil-tx-${Date.now().toString(36).toUpperCase()}`;
      setWeilChainStatus({
        connected: true,
        txId,
        oracleScore: 98,
        timestamp: new Date().toISOString(),
      });
      setIsProcessing(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* BondFi Hackathon MVP - Header */}
      <header className="border-b border-gray-700 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00D4AA] to-[#00A88A] flex items-center justify-center font-bold text-xl">
              B
            </div>
            <div>
              <h1 className="text-xl font-bold">BondFi</h1>
              <p className="text-xs text-gray-400">Weilliptic Hackathon MVP</p>
            </div>
          </div>
          
          {/* WeilChain Connection Status */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 border border-gray-700">
            <div className={`w-2 h-2 rounded-full ${weilChainStatus.connected ? 'bg-[#00D4AA] animate-pulse' : 'bg-yellow-500'}`} />
            <span className="text-sm">
              {weilChainStatus.connected ? 'WeilChain Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00D4AA]/10 border border-[#00D4AA]/30 text-[#00D4AA] text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse" />
            Live Demo - Weilliptic Hackathon
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Decentralized Bond <span className="text-[#00D4AA]">Compliance</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            On-chain oracle verification powered by WeilChain. Submit issuer details for instant compliance scoring.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Compliance Form Section */}
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <svg className="w-5 h-5 text-[#00D4AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Compliance Form
              </h3>
              <span className="text-xs text-gray-400">Powered by Typeform</span>
            </div>
            
            {/* Typeform Iframe Embed */}
            <div className="relative" style={{ height: '500px' }}>
              <iframe
                src="https://form.typeform.com/to/BWNQtpIL"
                className="w-full h-full border-0"
                title="BondFi Compliance Form"
                allow="camera; microphone; autoplay; encrypted-media;"
              />
            </div>
            
            {/* Manual Submit Button for Demo */}
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={handleComplianceSubmit}
                disabled={isProcessing}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-[#00D4AA] to-[#00A88A] text-black font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing on WeilChain...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verify on WeilChain (Demo)
                  </>
                )}
              </button>
            </div>
          </div>

          {/* WeilChain Status Panel */}
          <div className="space-y-6">
            {/* Oracle Score Card */}
            <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#00D4AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Oracle Compliance Score
              </h3>
              
              <div className="flex items-center justify-center py-8">
                <div className="relative">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="12"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="#00D4AA"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={440}
                      strokeDashoffset={440 - (440 * weilChainStatus.oracleScore) / 100}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-[#00D4AA]">
                      {weilChainStatus.oracleScore}
                    </span>
                    <span className="text-sm text-gray-400">/ 100</span>
                  </div>
                </div>
              </div>

              {formSubmitted && weilChainStatus.oracleScore >= 97 && (
                <div className="flex items-center justify-center gap-2 text-[#00D4AA] bg-[#00D4AA]/10 py-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Compliance Verified - Approved
                </div>
              )}
            </div>

            {/* Transaction Details */}
            <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#00D4AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                WeilChain Transaction
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    weilChainStatus.txId 
                      ? 'bg-[#00D4AA]/20 text-[#00D4AA]' 
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {weilChainStatus.txId ? 'Confirmed' : 'Pending'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Transaction ID</span>
                  <span className="font-mono text-sm text-[#00D4AA]">
                    {weilChainStatus.txId || '---'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Network</span>
                  <span className="text-white">WeilChain Mainnet</span>
                </div>
                
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-400">Timestamp</span>
                  <span className="text-white text-sm">
                    {weilChainStatus.timestamp 
                      ? new Date(weilChainStatus.timestamp).toLocaleString()
                      : '---'
                    }
                  </span>
                </div>
              </div>

              {/* Explorer Link */}
              {weilChainStatus.txId && (
                <a
                  href={`https://explorer.weilliptic.ai/tx/${weilChainStatus.txId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full py-3 rounded-lg border border-[#00D4AA] text-[#00D4AA] font-semibold hover:bg-[#00D4AA]/10 transition-all flex items-center justify-center gap-2"
                >
                  View on WeilChain Explorer
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>

            {/* Tech Stack */}
            <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
              <h3 className="font-semibold mb-4">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {['React 18', 'TypeScript', 'WeilChain', 'Rust WASM', 'Tailwind CSS', 'Vercel'].map((tech) => (
                  <span key={tech} className="px-3 py-1 rounded-full bg-gray-700 text-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>BondFi × WeilChain | Weilliptic Hackathon 2026</p>
          <p className="text-sm mt-2">Built by BIT Sindri Team</p>
        </footer>
      </main>
    </div>
  );
};

export default HackathonDemo;
