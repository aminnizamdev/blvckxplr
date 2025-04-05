
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  ExternalLink, 
  Wallet, 
  CopyIcon, 
  CheckIcon 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TokenData } from '@/types/token';
import { useTokenDetails } from '@/hooks/useTokenDetails';

interface TokenDetailsModalProps {
  token: TokenData | null;
  open: boolean;
  onClose: () => void;
}

const TokenDetailsModal = ({ token, open, onClose }: TokenDetailsModalProps) => {
  const { formatValue, getTrendIcon } = useTokenDetails();
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!token) return null;
  
  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>{token.name.toUpperCase()} ({token.symbol})</span>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                <a 
                  href={`https://solscan.io/tx/${token.signature}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  title="View Transaction"
                >
                  <ExternalLink size={16} />
                </a>
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                <a 
                  href={`https://solscan.io/account/${token.creator}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  title="View Creator Wallet"
                >
                  <Wallet size={16} />
                </a>
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            Created at {new Date(token.timestamp).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Token Contract</div>
            <div className="flex items-center justify-between bg-muted/20 p-2 rounded-md">
              <code className="text-xs break-all">{token.mint}</code>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => copyToClipboard(token.mint, 'mint')}
              >
                {copiedField === 'mint' ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Developer Wallet</div>
            <div className="flex items-center justify-between bg-muted/20 p-2 rounded-md">
              <code className="text-xs break-all">{token.creator}</code>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => copyToClipboard(token.creator, 'creator')}
              >
                {copiedField === 'creator' ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Market Cap</div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span>SOL:</span>
                  <span className="font-medium flex items-center gap-1">
                    {formatValue(token.marketCapSol, 4)}
                    {getTrendIcon(token.marketCapSol, token.prevMarketCapSol)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>USD:</span>
                  <span className="font-medium flex items-center gap-1">
                    ${formatValue(token.marketCapUsd, 2)}
                    {getTrendIcon(token.marketCapUsd, token.prevMarketCapUsd)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Dev Holdings</div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span>Balance:</span>
                  <span className="font-medium flex items-center gap-1">
                    {formatValue(token.devBalance, 4)}
                    {getTrendIcon(token.devBalance, token.prevDevBalance)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Value (USD):</span>
                  <span className="font-medium flex items-center gap-1">
                    ${formatValue(token.devValueUsd, 2)}
                    {getTrendIcon(token.devValueUsd, token.prevDevValueUsd)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="text-sm text-muted-foreground">Estimated Token Price</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span>SOL/Token:</span>
                <span className="font-medium flex items-center gap-1">
                  {formatValue(token.estTokenPriceSol, 8)} SOL
                  {getTrendIcon(token.estTokenPriceSol, token.prevEstTokenPriceSol)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>USD/Token:</span>
                <span className="font-medium flex items-center gap-1">
                  ${formatValue(token.estTokenPriceUsd, 8)}
                  {getTrendIcon(token.estTokenPriceUsd, token.prevEstTokenPriceUsd)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-start">
          <div className="flex gap-2 w-full">
            <Button 
              variant="secondary" 
              onClick={onClose} 
              className="w-full"
            >
              Close
            </Button>
            <Button 
              variant="default" 
              asChild 
              className="w-full"
            >
              <a 
                href={`https://www.pump.fun/token/${token.mint}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View on PumpFun
              </a>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TokenDetailsModal;
