import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3,
  ImagePlus,
  Upload,
  Quote,
  Link,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  Underline,
  Type,
  Eye,
  FileText,
  HelpCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  uploadingImage?: boolean;
  onImageUpload?: (file: File) => void;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Digite o conteúdo aqui...", 
  rows = 12,
  uploadingImage = false,
  onImageUpload 
}: RichTextEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Função para inserir texto no cursor
  const insertAtCursor = (beforeText: string, afterText: string = "", defaultText: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || defaultText;
    
    const newValue = 
      value.substring(0, start) + 
      beforeText + textToInsert + afterText + 
      value.substring(end);
    
    onChange(newValue);

    // Reposicionar cursor
    setTimeout(() => {
      const newCursorPos = start + beforeText.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  // Funções de formatação
  const formatBold = () => insertAtCursor("<strong>", "</strong>", "texto em negrito");
  const formatItalic = () => insertAtCursor("<em>", "</em>", "texto em itálico");
  const formatUnderline = () => insertAtCursor("<u>", "</u>", "texto sublinhado");
  const formatH1 = () => insertAtCursor("<h1>", "</h1>", "Título Principal");
  const formatH2 = () => insertAtCursor("<h2>", "</h2>", "Subtítulo");
  const formatH3 = () => insertAtCursor("<h3>", "</h3>", "Subtítulo Menor");
  const formatParagraph = () => insertAtCursor("<p>", "</p>", "parágrafo");
  const formatQuote = () => insertAtCursor("<blockquote>", "</blockquote>", "citação importante");
  const formatUL = () => insertAtCursor("<ul>\n  <li>", "</li>\n  <li>item 2</li>\n  <li>item 3</li>\n</ul>", "item 1");
  const formatOL = () => insertAtCursor("<ol>\n  <li>", "</li>\n  <li>item 2</li>\n  <li>item 3</li>\n</ol>", "item 1");
  const formatCenter = () => insertAtCursor('<div style="text-align: center;">', "</div>", "texto centralizado");
  const formatJustify = () => insertAtCursor('<div style="text-align: justify;">', "</div>", "texto justificado");
  
  const formatLink = () => {
    const url = prompt("Digite a URL do link:");
    if (url) {
      insertAtCursor(`<a href="${url}" target="_blank">`, "</a>", "texto do link");
    }
  };

  const insertLineBreak = () => {
    insertAtCursor("<br>\n", "");
  };

  const insertDivider = () => {
    insertAtCursor("\n<hr>\n", "");
  };

  // Função para upload de imagem
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  // Instruções de uso
  const HelpDialog = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HelpCircle className="h-4 w-4 mr-2" />
          Ajuda
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📝 Guia completo do editor</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Seção de Botões */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🎨 Botões de Formatação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><strong>Negrito (B):</strong> Deixa o texto em <strong>negrito</strong></div>
                <div><strong>Itálico (I):</strong> Deixa o texto em <em>itálico</em></div>
                <div><strong>Sublinhado (U):</strong> <u>Sublinha o texto</u></div>
                <div><strong>H1:</strong> Título principal (maior)</div>
                <div><strong>H2:</strong> Subtítulo médio</div>
                <div><strong>H3:</strong> Subtítulo menor</div>
                <div><strong>Lista (•):</strong> Cria lista com bolinhas</div>
                <div><strong>Lista (1,2,3):</strong> Cria lista numerada</div>
                <div><strong>Citação:</strong> Para citações importantes</div>
                <div><strong>Link:</strong> Criar links clicáveis</div>
                <div><strong>Centralizar:</strong> Centraliza o texto</div>
                <div><strong>Justificar:</strong> Alinha o texto dos dois lados</div>
              </div>
            </CardContent>
          </Card>

          {/* Seção de Imagens */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📸 Como Inserir Imagens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">✅ Conversão Automática para WebP</h4>
                <p className="text-sm text-blue-700">
                  Todas as imagens são automaticamente convertidas para formato WebP 
                  (mais leve e rápido). Qualidade otimizada para web (90%).
                </p>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Clique no botão <strong>"Inserir Imagem"</strong></li>
                <li>Escolha uma imagem do seu computador (JPG, PNG, WebP)</li>
                <li>A imagem será enviada e convertida automaticamente</li>
                <li>Ela aparecerá no texto como <code>&lt;img src="..."&gt;</code></li>
                <li>Você pode mover este código para qualquer lugar do texto</li>
              </ol>
              <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                <p className="text-sm"><strong>💡 Dica:</strong> Cole o código da imagem onde quiser que ela apareça no artigo.</p>
              </div>
            </CardContent>
          </Card>

          {/* Seção de Exemplos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📋 Exemplos Práticos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Como criar um parágrafo simples:</h4>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                  &lt;p&gt;Este é um parágrafo normal do artigo.&lt;/p&gt;
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Como criar uma lista:</h4>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                  &lt;ul&gt;<br/>
                  &nbsp;&nbsp;&lt;li&gt;Primeiro item&lt;/li&gt;<br/>
                  &nbsp;&nbsp;&lt;li&gt;Segundo item&lt;/li&gt;<br/>
                  &lt;/ul&gt;
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Como criar um título:</h4>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                  &lt;h2&gt;Título da Seção&lt;/h2&gt;
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dicas Importantes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⚠️ Dicas Importantes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Selecione texto</strong> antes de clicar nos botões para formatar texto existente</li>
                <li>• <strong>Use o Preview</strong> para ver como ficará o resultado final</li>
                <li>• <strong>Organize bem:</strong> Use títulos (H2, H3) para dividir o conteúdo</li>
                <li>• <strong>Parágrafos:</strong> Sempre coloque texto dentro de &lt;p&gt;&lt;/p&gt;</li>
                <li>• <strong>Imagens:</strong> Ficarão responsivas automaticamente (se ajustam ao tamanho da tela)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-4">
      {/* Barra de Ferramentas */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">🎨 Ferramentas de Formatação</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={showPreview ? "default" : "outline"}
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? "Editar" : "Preview"}
              </Button>
              <HelpDialog />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
            {/* Formatação Básica */}
            <Button type="button" variant="outline" size="sm" onClick={formatBold} title="Negrito">
              <Bold className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={formatItalic} title="Itálico">
              <Italic className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={formatUnderline} title="Sublinhado">
              <Underline className="h-4 w-4" />
            </Button>

            {/* Títulos */}
            <Button type="button" variant="outline" size="sm" onClick={formatH1} title="Título principal (H1)">
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={formatH2} title="Subtítulo (H2)">
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={formatH3} title="Subtítulo menor (H3)">
              <Heading3 className="h-4 w-4" />
            </Button>

            {/* Listas */}
            <Button type="button" variant="outline" size="sm" onClick={formatUL} title="Lista com bolinhas">
              <List className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={formatOL} title="Lista numerada">
              <ListOrdered className="h-4 w-4" />
            </Button>

            {/* Alinhamento */}
            <Button type="button" variant="outline" size="sm" onClick={formatCenter} title="Centralizar">
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={formatJustify} title="Justificar">
              <AlignJustify className="h-4 w-4" />
            </Button>

            {/* Outros */}
            <Button type="button" variant="outline" size="sm" onClick={formatQuote} title="Citação">
              <Quote className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={formatLink} title="Inserir link">
              <Link className="h-4 w-4" />
            </Button>

            {/* Parágrafo */}
            <Button type="button" variant="outline" size="sm" onClick={formatParagraph} title="Parágrafo">
              <Type className="h-4 w-4" />
            </Button>

            {/* Upload de Imagem */}
            {onImageUpload && (
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingImage}
                  asChild
                  title="Inserir imagem"
                >
                  <span>
                    <ImagePlus className="h-4 w-4" />
                  </span>
                </Button>
              </label>
            )}
          </div>

          {/* Informações sobre upload de imagem */}
          {onImageUpload && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <Upload className="h-4 w-4" />
                <span className="font-medium">✅ Conversão Automática WebP:</span>
                <span>Imagens otimizadas para web com qualidade 90%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editor ou Preview */}
      {showPreview ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">👁️ Visualização</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose max-w-none p-4 border rounded-lg bg-white min-h-[300px]"
              dangerouslySetInnerHTML={{ __html: value || "<p class='text-gray-400'>Nenhum conteúdo para visualizar</p>" }}
            />
          </CardContent>
        </Card>
      ) : (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="font-mono text-sm"
        />
      )}

      {/* Ações rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={insertLineBreak}
          className="text-xs"
        >
          + Quebra de Linha
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={insertDivider}
          className="text-xs"
        >
          + Linha Divisória
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => insertAtCursor('\n<p>', '</p>', 'Novo parágrafo')}
          className="text-xs"
        >
          + Parágrafo
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange('')}
          className="text-xs text-red-600 hover:text-red-700"
        >
          🗑️ Limpar Tudo
        </Button>
      </div>
    </div>
  );
}