# 🔒 Sistema de Acesso aos Logs Administrativos

## Visão Geral
Os logs administrativos estão disponíveis através de um servidor dedicado que roda na **porta 5001**, separado do servidor principal para evitar conflitos com o Vite durante desenvolvimento.

## Informações de Acesso
- **URL Base**: http://localhost:5001
- **Senha de Acesso**: 24092002
- **Autenticação**: Via parâmetro `?password=SENHA` na URL

## Endpoints Disponíveis

### 1. Teste de Conectividade
```
GET /test?password=24092002
```
Verifica se o servidor e a autenticação estão funcionando.

### 2. Visualizar Logs no Navegador
```
GET /view?password=24092002
```
Exibe os logs do mês atual em formato HTML no navegador.

```
GET /view/2025-08?password=24092002
```
Exibe os logs de um mês específico (formato YYYY-MM).

### 3. Baixar Relatórios
```
GET /report?password=24092002
```
Baixa o relatório do mês atual como arquivo .txt.

```
GET /report/2025-08?password=24092002
```
Baixa o relatório de um mês específico como arquivo .txt.

### 4. Resumo dos Logs
```
GET /summary?password=24092002
```
Retorna um resumo JSON com estatísticas de todos os meses disponíveis.

## Como Usar

### 1. Iniciar o Servidor de Logs
```bash
npx tsx server/logServer.ts &
```

### 2. Acessar via Navegador
Abra no navegador:
```
http://localhost:5001/view?password=24092002
```

### 3. Baixar Relatórios
Use curl ou wget:
```bash
curl "http://localhost:5001/report?password=24092002" -o logs_admin.txt
```

## Segurança
- ✅ Autenticação obrigatória por senha
- ✅ Servidor isolado na porta 5001
- ✅ Logs gravados em arquivos separados por mês
- ✅ Acesso negado sem autenticação
- ✅ Mensagens de erro informativas

## Estrutura dos Logs
- **Logs de Alterações**: Modificações no painel administrativo
- **Logs de Acesso**: Login, logout e navegação no painel
- **Formato**: Timestamp, IP, Ação, Seção, Campo e Detalhes

## Rotação de Logs
Os logs são organizados automaticamente por mês no formato YYYY-MM e ficam disponíveis em:
```
logs/admin/changes/YYYY-MM.log
logs/admin/access/YYYY-MM.log
```

## Troubleshooting

**Problema**: Servidor não responde
**Solução**: Verificar se está rodando com `pgrep -f logServer`

**Problema**: Acesso negado
**Solução**: Verificar se a senha 24092002 está sendo passada corretamente

**Problema**: Logs vazios
**Solução**: Verificar se há atividade administrativa registrada no período