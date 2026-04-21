
# DIÁRIO DUO TRZ — Plataforma de Campeonatos Free Fire

## Design
- **Tema dark gamer**: fundo #1a1a2e / #2d2d2d, amarelo dourado #f0a500, branco #ffffff
- **Tipografia**: Bebas Neue (headings) + Barlow (body)
- **Layout hero-grid** na home com banner impactante + cards informativos
- **Logo** do usuário integrada no header/navbar
- **Efeitos**: gradientes sutis, bordas com glow dourado, animações de entrada

## Site Público (6 páginas)
1. **Home** — Hero com CTA para inscrição (WhatsApp), seções de premiações, próximos horários, ranking resumido
2. **Premiações** — Detalhes completos de prêmios por colocação/kills
3. **Regras** — Regras formatadas em accordion/cards organizados
4. **Ranking** — Tabela dinâmica com dados dos jogadores (kills, vitórias, pontos)
5. **Horários / Inscrição** — Grade de horários com vagas disponíveis + botão WhatsApp pré-formatado
6. **Grupos** — Cards com links de WhatsApp/Telegram gerenciáveis pelo admin
7. **Contato** — Info de contato + link WhatsApp

**Navbar** fixa com logo + links das páginas. **Footer** com links e redes sociais.

## Painel Administrativo (rota protegida simples)
- **Dashboard** — Métricas: partidas, arrecadação, jogadores, lucro
- **Configurações** — Nome do campeonato, valores, descrições gerais
- **Horários** — CRUD de horários com controle de vagas
- **Premiações** — Configurar prêmios por posição e por kill
- **Regras** — Editor de regras
- **Grupos** — CRUD de links de grupos (nome, descrição, link, plataforma)
- **Resultados** — Upload de prints de partida → IA extrai jogadores/kills/colocação → salva no banco
- **Rankings** — Visualização e gestão dos rankings gerados
- **Assistente IA** — System prompt editável, base de conhecimento, FAQ, histórico de conversas

## Resultados com IA (Lovable AI)
- Upload de screenshot da partida no admin
- Edge function envia imagem ao modelo de visão (Gemini) para extrair dados estruturados (jogadores, kills, colocação)
- Dados retornados preenchem formulário para revisão antes de salvar
- Cálculo automático de premiação baseado nas regras configuradas
- Atualização do ranking em tempo real

## Assistente IA no Site
- Chat flutuante estilo WhatsApp no canto inferior direito
- Streaming de respostas via Edge Function + Lovable AI
- Contexto carregado dinamicamente: system prompt, FAQ, base de conhecimento do admin
- Respostas curtas, naturais e humanizadas
- Botões de ação rápida (inscrição, regras, horários)

## Backend (Lovable Cloud + Supabase)
- **Tabelas**: championships, schedules, prizes, rules, groups, match_results, player_rankings, ai_config (system prompt, knowledge base), faq, chat_history
- **Edge Functions**: chat (assistente IA), analyze-match (leitura de print com IA)
- **Storage**: bucket para prints de partidas

## Fases de implementação
1. **Fase 1**: Setup do banco, design system, navbar/footer, Home, páginas estáticas (Premiações, Regras, Contato, Grupos)
2. **Fase 2**: Painel admin com CRUD completo (config, horários, premiações, regras, grupos)
3. **Fase 3**: Ranking dinâmico, upload de resultados com IA, cálculo automático
4. **Fase 4**: Assistente IA com chat, config editável no admin, FAQ, histórico
