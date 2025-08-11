/**
 * DragAndDropItem.tsx
 * 
 * Componente base para itens com drag-and-drop
 * Interface padronizada com setas e controles uniformes
 * Usado por todos os managers do painel admin
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GripVertical, ChevronUp, ChevronDown, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DragAndDropItemProps {
  id: string | number;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  onToggleActive: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
  children: React.ReactNode;
  className?: string;
  isPending?: boolean; // Indica se há uma atualização pendente
}

export function DragAndDropItem({
  id,
  isActive,
  isFirst,
  isLast,
  onToggleActive,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  children,
  className = "",
  isPending = false
}: DragAndDropItemProps) {


  
  const handleToggleActive = () => {
    console.log("🎨🎨🎨 DRAG_DROP_ITEM TOGGLE 🎨🎨🎨");
    console.log("🎨 ID:", id);
    console.log("🎨 Estado atual isActive:", isActive);
    console.log("🎨 Chamando onToggleActive...");
    console.log("🎨 Timestamp:", Date.now());
    
    onToggleActive();
    
    console.log("🎨 onToggleActive executado");
  };
  // Hook useSortable condicionado para desktop apenas
  const sortableProps = useSortable({ 
    id: id.toString(),
    disabled: false // Sempre habilitado, mas listeners serão condicionais
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = sortableProps;

  // Style aplicado apenas no desktop (transform só funciona se houver drag)
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testimonial-id={id}
      className={`
        w-full max-w-full overflow-hidden
        border border-gray-200 rounded-lg p-2 sm:p-3 bg-white 
        hover:shadow-md transition-all duration-200 
        ${isDragging ? 'shadow-lg ring-2 ring-blue-200' : ''} 
        ${isPending ? 'ring-2 ring-green-200 bg-green-50' : ''} 
        mobile-optimized-item
        ${className}
      `}
    >
      {/* Layout para Desktop */}
      <div className="hidden sm:flex items-start gap-3 w-full">
        {/* Área de arrastar - APENAS DESKTOP */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:cursor-grabbing p-2 rounded hover:bg-gray-100 transition-colors touch-manipulation flex-shrink-0"
        >
          <Tooltip>
            <TooltipTrigger>
              <GripVertical className="w-4 h-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>Arraste para reordenar</TooltipContent>
          </Tooltip>
        </div>

        {/* Controles de setas */}
        <div className="flex flex-col gap-0.5 flex-shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onMoveUp}
                disabled={isFirst}
                className="h-4 w-4 p-0"
              >
                <ChevronUp className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Mover para cima</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onMoveDown}
                disabled={isLast}
                className="h-4 w-4 p-0"
              >
                <ChevronDown className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Mover para baixo</TooltipContent>
          </Tooltip>
        </div>

        {/* Conteúdo do item - Expandido para ocupar espaço disponível */}
        <div className="flex-1 min-w-0 w-full overflow-hidden">
          {children}
        </div>

        {/* Controles de ativo/inativo */}
        <div className="flex items-center gap-2 flex-shrink-0 h-8">
          {isActive ? (
            <Eye className="w-4 h-4 text-green-600" />
          ) : (
            <EyeOff className="w-4 h-4 text-gray-400" />
          )}
          <Switch 
            checked={isActive} 
            onCheckedChange={handleToggleActive}
          />
        </div>

        {/* Botões de ação */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onEdit}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Editar</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onDelete}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Excluir</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Layout para Mobile - Completamente Redesenhado */}
      <div className="sm:hidden space-y-3 w-full max-w-full overflow-hidden mobile-drag-item">
        {/* Conteúdo principal */}
        <div className="w-full max-w-full overflow-hidden">
          {children}
        </div>

        {/* Controles móveis - APENAS SETAS (sem drag-and-drop) */}
        <div className="w-full max-w-full pt-3 border-t border-gray-100 space-y-3 overflow-hidden">
          {/* Linha 1: Status de visibilidade */}
          <div className="flex items-center justify-start w-full">
            <span className="text-xs font-medium text-gray-700 mr-3 flex-shrink-0">
              Visível:
            </span>
            <div className="flex items-center gap-2">
              {isActive ? (
                <Eye className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              )}
              <Switch 
                checked={isActive} 
                onCheckedChange={handleToggleActive}
                className="flex-shrink-0"
              />
              <span className="text-xs text-gray-500 ml-2">
                {isActive ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>

          {/* Linha 2: Botões de posição - Largura completa */}
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={onMoveUp}
              disabled={isFirst}
              className="
                h-9 text-xs font-medium w-full
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <ChevronUp className="w-3 h-3 mr-1.5" />
              Subir
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onMoveDown}
              disabled={isLast}
              className="
                h-9 text-xs font-medium w-full
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <ChevronDown className="w-3 h-3 mr-1.5" />
              Descer
            </Button>
          </div>

          {/* Linha 3: Botões de ação - Largura completa */}
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEdit}
              className="h-9 text-xs font-medium w-full"
            >
              <Edit className="w-3 h-3 mr-1.5" />
              Editar
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDelete}
              className="
                h-9 text-xs font-medium w-full
                text-red-600 hover:text-red-700 hover:bg-red-50
                border-red-200 hover:border-red-300
              "
            >
              <Trash2 className="w-3 h-3 mr-1.5" />
              Excluir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}