import React, { useState, useEffect } from 'react';
import { Activity, ExternalLink, Github, Heart, Twitter } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const AppFooter = () => {
  const [opacity, setOpacity] = useState(1);
  
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      
      if (scrollTop + windowHeight >= documentHeight - 10) {
        setOpacity(1);
      } 
      else if (scrollTop > 100) {
        setOpacity(0.5);
      } 
      else {
        setOpacity(1);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <footer 
      className="bg-background border-t border-border/50 py-8 fixed bottom-0 left-0 right-0 z-10 transition-opacity duration-200"
      style={{ opacity }}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity size={20} className="text-cyan-500" />
              <h3 className="text-lg font-bold">BLVCK XPLR</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Advanced real-time analytics platform for monitoring Solana token activity, 
              providing critical market insights for traders and investors.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://twitter.com/solana" target="_blank" rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-cyan-500 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="https://github.com/solana-labs" target="_blank" rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-cyan-500 transition-colors">
                <Github size={18} />
              </a>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://solana.com" target="_blank" rel="noopener noreferrer" 
                  className="text-sm text-muted-foreground hover:text-cyan-500 transition-colors flex items-center gap-1">
                  Solana
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://www.pump.fun" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-cyan-500 transition-colors flex items-center gap-1">
                  PumpFun
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://pyth.network" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-cyan-500 transition-colors flex items-center gap-1">
                  Pyth Network
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://solscan.io" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-cyan-500 transition-colors flex items-center gap-1">
                  Solscan
                  <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">About</h3>
            <p className="text-sm text-muted-foreground">
              BLVCK XPLR is an industrial-grade analytics platform designed for professional traders, 
              researchers, and institutions in the Solana ecosystem. Our platform provides real-time 
              monitoring of token creation and trading activity with high-integrity data feeds.
            </p>
            <p className="text-sm text-muted-foreground">
              Built with reliable WebSocket connections to maintain data accuracy and 
              timeliness for critical trading decisions.
            </p>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} BLVCK XPLR. All rights reserved.
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <span>Made with</span>
            <Heart size={12} className="mx-1 text-pink-500" />
            <span>for the Solana community</span>
          </div>
          
          <div className="flex items-center gap-4">
            <a href="#privacy" className="text-xs text-muted-foreground hover:text-cyan-500 transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="text-xs text-muted-foreground hover:text-cyan-500 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
