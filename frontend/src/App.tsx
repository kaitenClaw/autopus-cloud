import React from 'react';
import { Sidebar } from './components/chat/Sidebar';
import { MessageList } from './components/chat/MessageList';
import { PromptInput } from './components/chat/PromptInput';
import StatusBar from './components/StatusBar';
import AgentsMatrix from './components/AgentsMatrix';
import AuthModal from './components/Auth/AuthModal';
import KaitenLaunchWizard from './components/KaitenLaunchWizard';
import { Settings, Menu, X, Rocket, CloudOff, Loader2, CheckCircle2, CircleDollarSign } from 'lucide-react';
import { cn } from './utils';
import { useChatState } from './hooks/useChatState'; // We'll create this next

export default function App() {
  const {
    agents, selectedAgent, setSelectedAgent,
    sessions, selectedSession, setSelectedSession,
    messages, input, setInput,
    config, setConfig, isConfigSaving, lastSaved,
    isLoading, isSidebarOpen, setIsSidebarOpen,
    isRightPanelOpen, setIsRightPanelOpen,
    activeRightPanelTab, setActiveRightPanelTab,
    error, setError, isAuthenticated,
    showAuthModal, setShowAuthModal,
    isAutoRefreshEnabled, setIsAutoRefreshEnabled,
    playgroundMode, setPlaygroundMode,
    showLaunchWizard, setShowLaunchWizard,
    matrixRefreshKey,
    handleCreateSession, handleSend, handleLogout,
    handleLoginSuccess, handleSignUpSuccess, handleLaunchSuccess,
    applyGuidedPreset, toggleSidebar, toggleRightPanel
  } = useChatState();

  return (
    <div className="flex flex-col h-screen bg-[#0b0b0b] text-zinc-200 overflow-hidden font-sans selection:bg-indigo-500/30">
      <StatusBar />
      <AgentsMatrix refreshKey={matrixRefreshKey} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen}
          toggle={toggleSidebar}
          agents={agents}
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
          sessions={sessions}
          selectedSession={selectedSession}
          setSelectedSession={setSelectedSession}
          onCreateSession={handleCreateSession}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          onAuthOpen={() => setShowAuthModal(true)}
          user={{ name: 'Alton Cheng', plan: 'Free Plan' }}
        />

        <main className="flex-1 flex flex-col relative bg-[#0b0b0b] min-w-0">
          <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 sticky top-0 bg-[#0b0b0b]/80 backdrop-blur-xl z-20">
            <div className="flex items-center gap-3">
              {!isSidebarOpen && (
                <button onClick={toggleSidebar} className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                  <Menu size={20}/>
                </button>
              )}
              <div className="flex flex-col">
                <span className="font-bold text-sm text-zinc-100 tracking-tight">{selectedAgent?.name || 'New Conversation'}</span>
                {selectedSession && <span className="text-[10px] text-zinc-500 font-medium truncate max-w-[150px]">{selectedSession.title}</span>}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center rounded-xl border border-white/5 bg-[#171717] p-1 shadow-inner">
                <button
                  onClick={() => setPlaygroundMode('guided')}
                  className={cn(
                    "px-3 py-1 text-[11px] font-bold rounded-lg transition-all",
                    playgroundMode === 'guided' ? "bg-white text-black shadow-md" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  Guided
                </button>
                <button
                  onClick={() => setPlaygroundMode('pro')}
                  className={cn(
                    "px-3 py-1 text-[11px] font-bold rounded-lg transition-all",
                    playgroundMode === 'pro' ? "bg-white text-black shadow-md" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  Pro
                </button>
              </div>
              
              {isAuthenticated && (
                <button
                  onClick={() => setShowLaunchWizard(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-300 transition-all hover:bg-indigo-500/20 active:scale-95 shadow-sm"
                >
                  <Rocket size={14} />
                  Launch
                </button>
              )}
              
              <button 
                onClick={toggleRightPanel} 
                className={cn(
                  "p-2 rounded-xl transition-all hover:bg-white/5",
                  isRightPanelOpen ? "text-white bg-white/10" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <Settings size={18} />
              </button>
            </div>
          </header>

          {error && (
            <div className="bg-red-500/10 border-b border-red-500/20 text-red-400 px-4 py-2.5 flex items-center justify-between text-xs font-medium animate-in slide-in-from-top duration-300">
              <div className="flex items-center gap-2">
                <CloudOff size={14} />
                <span>{error}</span>
              </div>
              <button onClick={() => setError(null)} className="p-1 hover:bg-red-500/10 rounded-md transition-colors"><X size={14}/></button>
            </div>
          )}

          <MessageList 
            messages={messages}
            isLoading={isLoading}
            playgroundMode={playgroundMode}
            onPromptSelect={setInput}
            isAuthenticated={isAuthenticated}
            onAuthOpen={() => setShowAuthModal(true)}
          />

          <PromptInput 
            input={input}
            setInput={setInput}
            onSend={handleSend}
            isLoading={isLoading}
          />
        </main>

        <aside className={cn(
          "bg-[#171717] border-l border-white/5 transition-all duration-300 flex flex-col z-30 shadow-2xl",
          isRightPanelOpen ? "w-80 max-md:w-full max-md:absolute max-md:h-full" : "w-0 overflow-hidden"
        )}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-1 bg-[#0b0b0b] p-1 rounded-xl shadow-inner">
              <button 
                onClick={() => setActiveRightPanelTab('settings')} 
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all",
                  activeRightPanelTab === 'settings' ? "bg-[#212121] text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                Settings
              </button>
              <button 
                onClick={() => setActiveRightPanelTab('interactions')} 
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all",
                  activeRightPanelTab === 'interactions' ? "bg-[#212121] text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                Interactions
              </button>
            </div>
            <button onClick={toggleRightPanel} className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition-colors"><X size={18}/></button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeRightPanelTab === 'settings' && config && (
              <div className="p-5 space-y-8">
                {playgroundMode === 'guided' ? (
                  <>
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-sm">
                      <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Guided Mode</p>
                      <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                        Optimized settings for builder workflows. Focus on outcomes over parameters.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em]">Model</label>
                      <div className="relative group">
                        <select
                          value={config.model}
                          onChange={e => setConfig({ ...config, model: e.target.value })}
                          className="w-full bg-[#212121] border border-white/5 rounded-xl p-3 focus:outline-none text-sm appearance-none cursor-pointer hover:bg-[#262626] hover:border-white/10 transition-all font-medium text-zinc-200"
                        >
                          <option value="gpt-4o">GPT-4o</option>
                          <option value="gpt-4-turbo">GPT-4 Turbo</option>
                          <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                          <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 group-hover:text-zinc-300 transition-colors">
                          <Settings size={14} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em]">Response Style</label>
                      <div className="grid grid-cols-1 gap-2">
                        {['balanced', 'creative', 'precise'].map((preset) => (
                          <button
                            key={preset}
                            onClick={() => applyGuidedPreset(preset as any)}
                            className="w-full rounded-xl border border-white/5 bg-[#212121] px-4 py-3 text-left text-xs font-semibold text-zinc-300 hover:bg-[#2f2f2f] hover:text-white hover:border-white/10 transition-all shadow-sm active:scale-[0.98] capitalize"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em]">Model</label>
                      <select 
                        value={config.model} 
                        onChange={e => setConfig({...config, model: e.target.value})}
                        className="w-full bg-[#212121] border border-white/5 rounded-xl p-3 focus:outline-none text-sm font-medium text-zinc-200 hover:bg-[#262626] transition-all"
                      >
                        <option value="gpt-4o">GPT-4o</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                        <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em]">Temperature</label>
                        <span className="text-[10px] font-bold text-white bg-indigo-500/20 px-2 py-0.5 rounded-lg border border-indigo-500/30">{config.temperature}</span>
                      </div>
                      <input 
                        type="range" min="0" max="2" step="0.1" 
                        value={config.temperature} 
                        onChange={e => setConfig({...config, temperature: parseFloat(e.target.value)})}
                        className="w-full h-1.5 bg-[#212121] rounded-full appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em]">Max Tokens</label>
                      <input 
                        type="number" 
                        value={config.maxTokens} 
                        onChange={e => setConfig({...config, maxTokens: parseInt(e.target.value)})}
                        className="w-full bg-[#212121] border border-white/5 rounded-xl p-3 focus:outline-none text-sm font-medium text-zinc-200 hover:bg-[#262626] transition-all"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em]">System Prompt</label>
                      <textarea 
                        value={config.systemPrompt} 
                        onChange={e => setConfig({...config, systemPrompt: e.target.value})}
                        className="w-full bg-[#212121] border border-white/5 rounded-2xl p-4 focus:outline-none h-64 resize-none text-sm leading-relaxed text-zinc-300 hover:bg-[#262626] transition-all scrollbar-thin"
                        placeholder="Define agent behavior..."
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {activeRightPanelTab === 'interactions' && selectedAgent && selectedSession && (
              <div className="p-5 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em]">Events</span>
                  <div className="flex items-center gap-2">
                    <label htmlFor="auto-refresh" className="text-[10px] font-bold text-zinc-500 cursor-pointer">Live</label>
                    <input 
                      type="checkbox" 
                      id="auto-refresh" 
                      checked={isAutoRefreshEnabled} 
                      onChange={(e) => setIsAutoRefreshEnabled(e.target.checked)}
                      className="h-3.5 w-3.5 rounded bg-[#212121] border-white/10 text-indigo-500 focus:ring-0 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  {messages.slice(-5).reverse().map(m => (
                    <div key={m.id} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md",
                          m.role === 'user' ? "bg-indigo-500/20 text-indigo-300" : "bg-white/10 text-white"
                        )}>
                          {m.role}
                        </span>
                        <span className="text-[9px] text-zinc-600 font-medium">{new Date(m.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-zinc-400 text-xs line-clamp-3 leading-relaxed group-hover:text-zinc-300 transition-colors">{m.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/5 bg-[#1a1a1a]/50 backdrop-blur-sm">
            {activeRightPanelTab === 'settings' ? (
              <div className="flex items-center gap-2.5 px-1">
                {isConfigSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-indigo-400" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Syncing...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Synced {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </>
                ) : (
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Cloud Auto-save</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5 px-1">
                <CircleDollarSign size={14} className="text-indigo-400" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Usage: $0.00 this session</span>
              </div>
            )}
          </div>
        </aside>
      </div>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
        onSignUpSuccess={handleSignUpSuccess}
      />

      <KaitenLaunchWizard
        isOpen={showLaunchWizard}
        onClose={() => setShowLaunchWizard(false)}
        onSuccess={handleLaunchSuccess}
      />
    </div>
  );
}
