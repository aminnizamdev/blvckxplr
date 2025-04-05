
import React from 'react';
import { Activity, ExternalLink, Github, Twitter } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Custom Solana Icon component
const SolanaIcon = ({ size = 12, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 397 311" 
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M64.6582 237.252C67.4565 234.453 71.3428 232.883 75.4344 232.883H395.004C401.808 232.883 405.211 241.151 400.544 245.818L333.008 313.354C330.209 316.153 326.323 317.722 322.231 317.722H2.66197C-4.14163 317.722 -7.5443 309.454 -2.87728 304.787L64.6582 237.252Z" />
    <path d="M64.6582 2.76572C67.5618 -0.13787 71.4481 -1.70762 75.4344 -1.70762H395.004C401.808 -1.70762 405.211 6.56042 400.544 11.2274L333.008 78.7633C330.209 81.5616 326.323 83.1313 322.231 83.1313H2.66197C-4.14163 83.1313 -7.5443 74.8633 -2.87728 70.1963L64.6582 2.76572Z" />
    <path d="M333.008 119.507C330.209 116.709 326.323 115.139 322.231 115.139H2.66197C-4.14163 115.139 -7.5443 123.407 -2.87728 128.074L64.6582 195.61C67.4565 198.408 71.3428 199.978 75.4344 199.978H395.004C401.808 199.978 405.211 191.71 400.544 187.043L333.008 119.507Z" />
  </svg>
);

const AppFooter = () => {
  return (
    <footer 
      className="bg-background border-t border-border/50 py-8"
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
            <SolanaIcon size={12} className="mx-1 text-cyan-500" />
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
