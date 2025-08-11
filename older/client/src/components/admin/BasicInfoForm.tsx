import React from "react";
import { Upload } from "lucide-react";
import { SiteIconUpload } from "./SiteIconUpload";

import type { SiteConfig } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BasicInfoFormProps {
  configs: SiteConfig[];
}

export function BasicInfoForm({ configs }: BasicInfoFormProps) {
  return (
    <div className="space-y-6">
      {/* Upload de Ícone do Site */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 shrink-0">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Ícone do Site</h3>
              <p className="text-xs sm:text-sm text-gray-600 font-normal">Favicon personalizado</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-3 sm:px-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg border border-blue-100 p-3 sm:p-4">
            <SiteIconUpload configs={configs} />
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                <strong>Dica:</strong> O favicon aparece na aba do navegador e nos favoritos. 
                <span className="hidden sm:inline"> Use imagens quadradas (mínimo 32x32px) para melhor qualidade.</span>
                <span className="sm:hidden block mt-1">Use imagens quadradas (32x32px+).</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}