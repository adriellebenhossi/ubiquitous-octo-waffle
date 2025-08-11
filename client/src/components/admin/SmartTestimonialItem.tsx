import React, { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Star, Edit, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import type { Testimonial } from "@shared/schema";

interface SmartTestimonialItemProps {
  testimonial: Testimonial;
  index: number;
  total: number;
  onEdit: (testimonial: Testimonial) => void;
  onDelete: (id: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onToggleActive: (id: number, isActive: boolean) => void;
}

// Componente individual otimizado que só re-renderiza quando seus dados específicos mudam
export const SmartTestimonialItem = memo(({
  testimonial,
  index,
  total,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onToggleActive
}: SmartTestimonialItemProps) => {
  console.log(`🎯 Renderizando testimonial ID: ${testimonial.id} - apenas este card`);

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <Card 
      className={`transition-all duration-200 ${!testimonial.isActive ? 'opacity-50' : ''}`}
      data-testimonial-id={testimonial.id}
      data-item-order={index}
      style={{
        transform: 'translateZ(0)', // Hardware acceleration
        backfaceVisibility: 'hidden', // Prevent flickering
        willChange: 'transform', // Optimize for animations
        isolation: 'isolate' // Isolate rendering context
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold" data-field="name">{testimonial.name}</h4>
              <Badge variant="secondary" className="text-xs" data-field="service">
                {testimonial.service}
              </Badge>
              <div className="flex items-center">
                {renderStars(testimonial.rating)}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-3" data-field="testimonial">
              {testimonial.testimonial}
            </p>
            
            {testimonial.photo && (
              <div className="mb-3">
                <img
                  src={testimonial.photo}
                  alt={`Foto de ${testimonial.name}`}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    console.log("Erro ao carregar foto do depoimento:", testimonial.photo);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={testimonial.isActive}
                  onCheckedChange={(checked) => onToggleActive(testimonial.id, checked)}
                />
                <span className="text-sm text-gray-500">
                  {testimonial.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMoveUp(index)}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMoveDown(index)}
                  disabled={index === total - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(testimonial)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(testimonial.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // ULTRA STRICT: Bloqueia TODOS os re-renders desnecessários
  const dataChanged = (
    prevProps.testimonial.name !== nextProps.testimonial.name ||
    prevProps.testimonial.service !== nextProps.testimonial.service ||
    prevProps.testimonial.testimonial !== nextProps.testimonial.testimonial ||
    prevProps.testimonial.rating !== nextProps.testimonial.rating ||
    prevProps.testimonial.photo !== nextProps.testimonial.photo ||
    prevProps.testimonial.isActive !== nextProps.testimonial.isActive
  );

  if (dataChanged) {
    console.log(`🎯 ULTRA LOCAL: Item ${prevProps.testimonial.id} teve dados alterados - única atualização permitida`);
    return false; // Permite re-render apenas para mudança de dados reais
  }

  // BLOCK ALL: Bloqueia re-renders por mudança de posição, total, etc.
  console.log(`🚫 ULTRA LOCAL: Item ${prevProps.testimonial.id} bloqueando re-render - dados idênticos`);
  return true; // Bloqueia re-render
});

SmartTestimonialItem.displayName = 'SmartTestimonialItem';