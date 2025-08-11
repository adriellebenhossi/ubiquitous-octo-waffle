/**
 * terms-of-use.tsx
 * 
 * Página de Termos de Uso
 * Conteúdo dinâmico gerenciado pelo painel administrativo
 */

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TermsOfUse {
  id: number;
  title: string;
  content: string;
  lastUpdated: string;
  isActive: boolean;
  updatedAt: string;
}

export default function TermsOfUsePage() {
  const { data: terms, isLoading, error } = useQuery<TermsOfUse>({
    queryKey: ['/api/terms-of-use'],
    staleTime: 1000 * 60 * 10, // 10 minutos
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <Skeleton className="h-10 w-32 mb-4" />
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Card className="p-8">
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-6" />
            <Skeleton className="h-6 w-2/3 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6" />
          </Card>
        </div>
      </div>
    );
  }

  if (error || !terms) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <FileText className="mx-auto mb-4 text-gray-400" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Termos não encontrados
          </h2>
          <p className="text-gray-600 mb-6">
            Não foi possível carregar os termos de uso no momento.
          </p>
          <Link href="/">
            <Button className="w-full">
              <ArrowLeft size={16} className="mr-2" />
              Voltar ao início
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const lastUpdatedDate = format(new Date(terms.lastUpdated), "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Header da página */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <Link href="/">
            <Button variant="ghost" className="mb-4 hover:bg-purple-50">
              <ArrowLeft size={16} className="mr-2" />
              Voltar ao site
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Cabeçalho */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <FileText className="text-white" size={28} />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {terms.title}
          </h1>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Calendar size={16} />
            <span>Última atualização: {lastUpdatedDate}</span>
          </div>
        </div>

        {/* Conteúdo */}
        <Card className="overflow-hidden shadow-xl">
          <div className="p-8 md:p-12">
            <div 
              className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: terms.content }}
            />
          </div>
        </Card>

        {/* Footer da página */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Estes termos de uso funcionam em conjunto com nossa{' '}
            <Link href="/privacy-policy">
              <a className="text-blue-600 hover:text-blue-700 underline">
                Política de Privacidade
              </a>
            </Link>
          </p>
          
          <Link href="/">
            <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
              <ArrowLeft size={16} className="mr-2" />
              Voltar ao site principal
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}