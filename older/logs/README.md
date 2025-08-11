# Sistema de Logs Administrativos

Este diretório contém os logs do painel administrativo do sistema.

## Estrutura de Diretórios

```
logs/
├── admin/
│   ├── admin-changes-2025-01.log    # Logs de alterações (mês atual)
│   └── admin-access-2025-01.log     # Logs de acesso (mês atual)
├── reports/                         # Relatórios gerados (criado automaticamente)
└── README.md                        # Este arquivo
```

## Tipos de Logs

### Logs de Alterações (`admin-changes-YYYY-MM.log`)
Registra todas as modificações feitas no painel administrativo:
- Alterações em configurações do site
- Criação, edição e exclusão de conteúdo
- Modificações em FAQ, serviços, depoimentos, etc.

### Logs de Acesso (`admin-access-YYYY-MM.log`)
Registra acessos ao painel administrativo:
- Tentativas de login (sucessos e falhas)
- Logout de usuários
- Acesso a seções do painel

## Formato dos Logs

Cada linha de log contém informações estruturadas:
- **Timestamp**: Data e hora da ação
- **IP**: Endereço IP do usuário
- **Ação**: Tipo de operação realizada
- **Seção**: Área do sistema afetada
- **Campo**: Campo específico alterado (quando aplicável)
- **Valores**: Valor anterior e novo (para alterações)
- **User-Agent**: Navegador utilizado (para acessos)

## Rotação de Arquivos

Os logs são organizados por mês. Um novo arquivo é criado automaticamente a cada mês:
- `admin-changes-2025-01.log` (Janeiro 2025)
- `admin-changes-2025-02.log` (Fevereiro 2025)
- E assim por diante...

## Como Acessar os Relatórios em Formato Texto

🔒 **IMPORTANTE: Todos os acessos aos logs requerem senha de autenticação.**

### Opção 1: Visualizar no Navegador
Acesse diretamente no navegador para ver o relatório (requer senha):
```
https://seu-site.com/api/admin/logs/view?password=24092002
https://seu-site.com/api/admin/logs/view/2025-01?password=24092002
```

### Opção 2: Baixar Arquivos de Relatório
Para baixar relatórios em formato .txt (requer senha):
```
https://seu-site.com/api/admin/logs/report?password=24092002        (mês atual)
https://seu-site.com/api/admin/logs/report/2025-01?password=24092002   (mês específico)
https://seu-site.com/api/admin/logs/summary?password=24092002       (resumo geral)
```

### Opção 3: Arquivos Gerados Automaticamente
Os relatórios são salvos automaticamente na pasta `logs/reports/`:
- `relatorio-logs-2025-01.txt` (relatório mensal)
- `resumo-geral-logs.txt` (resumo de todos os meses)

## Exemplo de Relatório Gerado

```
═══════════════════════════════════════════════════════════════
                    RELATÓRIO DE LOGS DO SISTEMA
═══════════════════════════════════════════════════════════════
Período: janeiro de 2025
Gerado em: 02/08/2025 11:30:15
Total de Alterações: 15
Total de Acessos: 8
═══════════════════════════════════════════════════════════════

📝 LOGS DE ALTERAÇÕES
─────────────────────────────────────────────────────────────
1. 2025-01-15 14:30:15
   IP: 192.168.1.100
   Ação: UPDATE
   Seção: site_config
   Campo: hero_title
   Detalhes: De: "Título Antigo" Para: "Título Novo"

🔐 LOGS DE ACESSO
─────────────────────────────────────────────────────────────
1. 2025-01-15 14:25:10
   IP: 192.168.1.100
   Ação: LOGIN
   Status: SUCCESS
   Navegador: Mozilla/5.0 (Windows NT 10.0; Win64; x64)...
```

## Acesso aos Logs

Os arquivos de log podem ser acessados:
1. **Diretamente**: Através dos arquivos `.log` na pasta `admin/`
2. **Relatórios**: Através das URLs mencionadas acima
3. **Download**: Baixando os arquivos `.txt` gerados

## Instruções para Download Fora do Replit

🔐 **Senha de Acesso: 24092002** (adicione `?password=24092002` ao final da URL)

1. **Acesse sua URL do site** seguida de `/api/admin/logs/report?password=24092002` para baixar o relatório do mês atual
2. **Para mês específico**: `/api/admin/logs/report/2025-01?password=24092002` (substitua pela data desejada)
3. **Resumo geral**: `/api/admin/logs/summary?password=24092002` para baixar resumo de todos os meses
4. **Visualizar no navegador**: `/api/admin/logs/view?password=24092002` para ver o relatório diretamente na tela

**Exemplos de URLs completas:**
- `https://meusite.com/api/admin/logs/report?password=24092002`
- `https://meusite.com/api/admin/logs/view/2025-01?password=24092002`

**Segurança:**
- Sem a senha correta, o acesso será negado com erro 401
- A senha pode ser enviada via parâmetro URL (?password=) ou header HTTP (X-Log-Password)

Os arquivos baixados estarão em formato `.txt` e podem ser abertos em qualquer editor de texto (Bloco de Notas, TextEdit, etc.).