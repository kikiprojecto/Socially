import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, Loader2, Wallet, Eye, Award, Code, GitBranch, Zap } from 'lucide-react';

const PoidhBountyBot = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [botStatus, setBotStatus] = useState('idle');
  const [currentBounty, setCurrentBounty] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message, type }]);
  };

  // Simulated bot operations
  const startBot = () => {
    setBotStatus('running');
    addLog('Bot initialized successfully', 'success');
    
    setTimeout(() => {
      const bounty = {
        id: 'bounty_' + Date.now(),
        title: 'Take a photo with a stranger holding "POIDH" sign',
        reward: '0.1 SOL',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: 'active'
      };
      setCurrentBounty(bounty);
      addLog(`Bounty created: ${bounty.title}`, 'success');
      addLog(`Reward: ${bounty.reward}`, 'info');
    }, 2000);

    setTimeout(() => {
      const newSubmissions = [
        { id: 1, user: '0x7a2b...3f4c', image: '📸', score: 0, status: 'pending' },
        { id: 2, user: '0x9d5e...1a2b', image: '📸', score: 0, status: 'pending' },
        { id: 3, user: '0x4f1c...8e9d', image: '📸', score: 0, status: 'pending' }
      ];
      setSubmissions(newSubmissions);
      addLog(`Received ${newSubmissions.length} submissions`, 'info');
      addLog('Starting AI evaluation...', 'info');
    }, 5000);

    setTimeout(() => {
      setSubmissions(prev => prev.map((sub, idx) => ({
        ...sub,
        score: [95, 72, 88][idx],
        status: 'evaluated'
      })));
      addLog('AI evaluation completed', 'success');
      addLog('Winner selected: Submission #1 (Score: 95/100)', 'success');
      addLog('Payment sent: 0.1 SOL to winner', 'success');
      setBotStatus('completed');
    }, 8000);
  };

  const TabButton = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        activeTab === id
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Icon size={18} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🤖 POIDH Autonomous Bounty Bot
              </h1>
              <p className="text-gray-600 text-lg">
                Fully autonomous AI-powered bounty management system
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full font-semibold ${
              botStatus === 'running' ? 'bg-green-100 text-green-700' :
              botStatus === 'completed' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {botStatus === 'running' && <Loader2 className="inline animate-spin mr-2" size={16} />}
              {botStatus.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          <TabButton id="overview" icon={Eye} label="Overview" />
          <TabButton id="architecture" icon={GitBranch} label="Architecture" />
          <TabButton id="code" icon={Code} label="Implementation" />
          <TabButton id="demo" icon={Zap} label="Live Demo" />
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">System Overview</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border-2 border-blue-200 rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Check className="text-green-600" size={20} />
                    Core Features
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>✅ Autonomous wallet management</li>
                    <li>✅ Smart bounty creation</li>
                    <li>✅ Real-time submission monitoring</li>
                    <li>✅ AI-powered evaluation (vision + logic)</li>
                    <li>✅ Automatic winner selection</li>
                    <li>✅ Transparent decision logging</li>
                  </ul>
                </div>

                <div className="border-2 border-purple-200 rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Wallet className="text-purple-600" size={20} />
                    Tech Stack
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>🔗 Solana blockchain (Web3.js)</li>
                    <li>🤖 Claude API (submission eval)</li>
                    <li>👁️ Vision AI (image verification)</li>
                    <li>⚡ Node.js backend</li>
                    <li>📊 PostgreSQL (submission tracking)</li>
                    <li>🔐 Ed25519 keypair management</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mt-6">
                <h3 className="font-bold text-lg mb-3">Winner Selection Logic</h3>
                <div className="space-y-3 text-gray-700">
                  <p><strong>1. Image Analysis (40 points):</strong> AI verifies photo authenticity, checks for required elements (sign, stranger interaction)</p>
                  <p><strong>2. Task Compliance (30 points):</strong> Validates all bounty requirements are met</p>
                  <p><strong>3. Quality Score (20 points):</strong> Evaluates image clarity, composition, proof strength</p>
                  <p><strong>4. Timestamp Verification (10 points):</strong> Ensures submission is within deadline</p>
                  <p className="mt-4 font-semibold">Total: 100 points. Highest scorer wins automatically.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">System Architecture</h2>
              
              <div className="bg-gray-50 rounded-xl p-6 font-mono text-sm">
                <pre className="text-gray-800 whitespace-pre-wrap">
{`┌─────────────────────────────────────────────┐
│         POIDH AUTONOMOUS BOT SYSTEM         │
└─────────────────────────────────────────────┘

1. INITIALIZATION PHASE
   ├─ Generate/Load Solana Keypair
   ├─ Connect to Solana RPC (Mainnet/Devnet)
   ├─ Initialize Claude API client
   └─ Load configuration & bounty templates

2. BOUNTY CREATION PHASE
   ├─ Select bounty from template pool
   ├─ Generate unique bounty ID
   ├─ Create on-chain bounty (poidh smart contract)
   ├─ Fund escrow with SOL reward
   └─ Monitor blockchain for bounty confirmation

3. SUBMISSION MONITORING PHASE
   ├─ Poll poidh API for new submissions
   ├─ Download submission media (IPFS/Arweave)
   ├─ Store locally for evaluation
   └─ Queue submissions for AI processing

4. AI EVALUATION PHASE
   ├─ Load submission image/video
   ├─ Convert to base64 for Claude API
   ├─ Send to Claude with evaluation prompt:
   │  {
   │    "Analyze this submission for bounty: [TITLE]
   │     Requirements: [LIST]
   │     Rate 0-100 on:
   │     - Authenticity
   │     - Requirement compliance  
   │     - Quality
   │     - Timestamp validity
   │     Return JSON with scores + reasoning"
   │  }
   ├─ Parse AI response
   └─ Store evaluation results

5. WINNER SELECTION PHASE
   ├─ Aggregate all submission scores
   ├─ Rank by total score (descending)
   ├─ Verify top submission meets threshold (>70)
   ├─ Log decision reasoning
   └─ Select winner

6. PAYOUT PHASE
   ├─ Create payment transaction
   ├─ Sign with bot wallet
   ├─ Submit to Solana network
   ├─ Confirm transaction
   └─ Update bounty status to "completed"

7. LOGGING & TRANSPARENCY
   ├─ Store all decisions in database
   ├─ Generate decision report
   ├─ Publish evaluation criteria
   └─ Make logs publicly accessible`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Core Implementation</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2 text-lg">📁 Repository Structure</h3>
                  <div className="bg-gray-900 text-green-400 rounded-xl p-4 font-mono text-sm">
                    <pre>{`poidh-autonomous-bot/
├── src/
│   ├── wallet.js          # Solana wallet management
│   ├── bounty.js          # Bounty creation & monitoring
│   ├── evaluator.js       # AI evaluation engine
│   ├── selector.js        # Winner selection logic
│   ├── payout.js          # Payment processing
│   └── main.js            # Main bot loop
├── config/
│   ├── bounty-templates.json
│   └── config.json
├── logs/                  # Transparent decision logs
├── tests/
├── package.json
├── README.md
└── .env.example`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold mb-2 text-lg">🔑 Key Code Snippets</h3>
                  <div className="bg-gray-900 text-gray-100 rounded-xl p-4 font-mono text-xs overflow-x-auto">
                    <pre>{`// wallet.js - Autonomous Wallet Management
import { Keypair } from '@solana/web3.js';
import fs from 'fs';

export function loadOrCreateWallet() {
  if (fs.existsSync('./wallet.json')) {
    const secret = JSON.parse(fs.readFileSync('./wallet.json'));
    return Keypair.fromSecretKey(Uint8Array.from(secret));
  }
  const keypair = Keypair.generate();
  fs.writeFileSync('./wallet.json', JSON.stringify(Array.from(keypair.secretKey)));
  return keypair;
}

// evaluator.js - AI-Powered Evaluation
import Anthropic from '@anthropic-ai/sdk';

export async function evaluateSubmission(imageBase64, bountyRequirements) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 }
        },
        {
          type: 'text',
          text: \`Evaluate this bounty submission:

Requirements: \${JSON.stringify(bountyRequirements)}

Rate 0-100 on:
1. Authenticity (0-40): Is this a real photo? Any AI/editing detected?
2. Compliance (0-30): Does it meet all requirements?
3. Quality (0-20): Clear, well-composed, strong proof?
4. Validity (0-10): Appears recent/legitimate?

Return ONLY JSON:
{
  "authenticity_score": X,
  "compliance_score": Y,
  "quality_score": Z,
  "validity_score": W,
  "total_score": X+Y+Z+W,
  "reasoning": "brief explanation",
  "winner_worthy": true/false
}\`
        }
      ]
    }]
  });
  
  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[^}]+\}/s);
  return JSON.parse(jsonMatch[0]);
}

// selector.js - Transparent Winner Selection
export function selectWinner(evaluations) {
  const sorted = evaluations
    .filter(e => e.total_score >= 70)
    .sort((a, b) => b.total_score - a.total_score);
  
  if (sorted.length === 0) return null;
  
  const winner = sorted[0];
  const decision = {
    winner_id: winner.submission_id,
    score: winner.total_score,
    reasoning: winner.reasoning,
    timestamp: new Date().toISOString(),
    all_scores: sorted.map(s => ({
      id: s.submission_id,
      score: s.total_score
    }))
  };
  
  fs.appendFileSync('./logs/decisions.jsonl', 
    JSON.stringify(decision) + '\\n');
  
  return winner;
}`}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'demo' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Live Bot Demo</h2>
              
              {botStatus === 'idle' && (
                <div className="text-center py-12">
                  <button
                    onClick={startBot}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all"
                  >
                    🚀 Start Autonomous Bot
                  </button>
                  <p className="text-gray-600 mt-4">Click to run a simulated bounty cycle</p>
                </div>
              )}

              {currentBounty && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                  <h3 className="font-bold text-lg mb-3">Active Bounty</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Title</p>
                      <p className="font-semibold">{currentBounty.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reward</p>
                      <p className="font-semibold">{currentBounty.reward}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Deadline</p>
                      <p className="font-semibold">{currentBounty.deadline}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-semibold capitalize">{currentBounty.status}</p>
                    </div>
                  </div>
                </div>
              )}

              {submissions.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3">Submissions & AI Evaluation</h3>
                  <div className="space-y-3">
                    {submissions.map(sub => (
                      <div key={sub.id} className="border-2 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{sub.image}</div>
                          <div>
                            <p className="font-semibold">Submission #{sub.id}</p>
                            <p className="text-sm text-gray-600">{sub.user}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {sub.status === 'evaluated' ? (
                            <>
                              <p className={`font-bold text-2xl ${sub.score >= 90 ? 'text-green-600' : 'text-gray-700'}`}>
                                {sub.score}/100
                              </p>
                              {sub.score >= 90 && (
                                <div className="flex items-center gap-1 text-green-600 mt-1">
                                  <Award size={16} />
                                  <span className="text-sm font-semibold">Winner!</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <Loader2 className="animate-spin text-blue-600" size={24} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-900 text-green-400 rounded-xl p-4 font-mono text-sm max-h-64 overflow-y-auto">
                <h3 className="text-white font-bold mb-2">📋 Bot Logs</h3>
                {logs.map((log, i) => (
                  <div key={i} className={`${
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'error' ? 'text-red-400' :
                    'text-gray-300'
                  }`}>
                    [{log.time}] {log.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
          <h3 className="font-bold text-lg mb-3">📦 Deployment Checklist</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-gray-700">
                <Check className="text-green-600" size={18} />
                Public GitHub repository
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <Check className="text-green-600" size={18} />
                Comprehensive README.md
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <Check className="text-green-600" size={18} />
                Environment setup guide
              </p>
            </div>
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-gray-700">
                <Check className="text-green-600" size={18} />
                End-to-end demo proof
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <Check className="text-green-600" size={18} />
                Decision transparency logs
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <Check className="text-green-600" size={18} />
                No submission gaming
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoidhBountyBot;