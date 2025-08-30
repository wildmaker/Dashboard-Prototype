import React from 'react';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

export function HomeHeader() {
  return (
    <header className="bg-white border-b border-border mt-[100px]">
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-3 items-center">
        <div></div>
        <div className="justify-self-center text-center">
          <div className="mx-auto mb-2 w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <div className="w-7 h-7 bg-white rounded-sm"></div>
          </div>
          <h1 className="text-xl font-medium text-foreground">主轴误差分析仪</h1>
          <p className="text-sm text-muted-foreground">Spindle Error Analyzer System</p>
        </div>
        <div className="justify-self-end"></div>
      </div>
    </header>
  );
}
