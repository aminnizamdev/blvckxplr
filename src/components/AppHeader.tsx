
import React from 'react';
import { Button } from '@/components/ui/button';
import { Activity, ChevronDown, Github, Info, MenuIcon, Moon, Settings, Sun } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from '@/hooks/use-mobile';

const AppHeader = () => {
  const isMobile = useIsMobile();
  
  const NavigationItems = () => (
    <>
      <div className="flex items-center gap-4">
        <a href="/" className="text-sm font-medium hover:text-cyan-500 transition-colors">Dashboard</a>
        <a href="#about" className="text-sm font-medium hover:text-cyan-500 transition-colors">About</a>
        <a href="https://github.com/solana-labs" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-cyan-500 transition-colors">Github</a>
      </div>
    </>
  );
  
  return (
    <header className="bg-gradient-to-r from-background via-black to-background border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm">
      <div className="container mx-auto py-4 px-4 md:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity size={26} className="text-cyan-500" />
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gradient-primary">BLVCK XPLR</h1>
              <p className="text-xs text-muted-foreground hidden md:block">Solana Token Analytics Platform</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavigationItems />
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Settings size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Sun size={16} className="mr-2" />
                  Light Mode
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Moon size={16} className="mr-2" />
                  Dark Mode
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings size={16} className="mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Info size={16} className="mr-2" />
                  About
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Github size={16} className="mr-2" />
                  GitHub
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Mobile Menu */}
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden h-9 w-9">
                    <MenuIcon size={20} />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>BLVCK XPLR</SheetTitle>
                    <SheetDescription>
                      Solana Token Analytics Platform
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-6 flex flex-col gap-4">
                    <a href="/" className="flex items-center gap-2 py-2 hover:text-cyan-500 transition-colors">
                      Dashboard
                    </a>
                    <a href="#about" className="flex items-center gap-2 py-2 hover:text-cyan-500 transition-colors">
                      About
                    </a>
                    <a href="https://github.com/solana-labs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-2 hover:text-cyan-500 transition-colors">
                      <Github size={16} />
                      GitHub
                    </a>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
