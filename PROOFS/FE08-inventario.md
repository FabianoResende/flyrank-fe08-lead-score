Inventário de Falhas — FE-08

1. Falha de rede antes de enviar (offline)
2. Falha de rede no meio da requisição
3. Erro 500 da API
4. Erro 429 (rate limit)
5. JSON malformado vindo da ferramenta
6. Entrada vazia (form sem dados)
7. Sem resultados (reasons vazias)
8. Estado vazio na primeira execução
9. Resposta lenta (delay artificial)
10. Mapeamento de Estados Visuais

### 1. Falha de rede antes de enviar (offline)
- Estado visual: ErrorCard
- Mensagem: “Sem conexão com a internet.”
- Botão: “Tentar novamente”
- Ação do retry: Reexecuta a última chamada com o mesmo payload
- Estado do componente: error

### 2. Falha de rede no meio da requisição
- Estado visual: ErrorCard
- Mensagem: “A conexão caiu durante o processamento.”
- Botão: “Tentar novamente”
- Ação do retry: Reenvia o payload anterior
- Estado do componente: error

### 3. Erro 500 da API
- Estado visual: ErrorCard
- Mensagem: “Erro interno no servidor.”
- Botão: “Tentar novamente”
- Ação do retry: Reexecuta a chamada
- Estado do componente: error

### 4. Erro 429 (rate limit)
- Estado visual: ErrorCard
- Mensagem: “Muitas requisições. Aguarde alguns segundos.”
- Botão: “Tentar novamente”
- Ação do retry: Reexecuta após pequeno delay
- Estado do componente: error

### 5. JSON malformado vindo da ferramenta
- Estado visual: ErrorCard
- Mensagem: “Resposta inválida da ferramenta.”
- Botão: “Tentar novamente”
- Ação do retry: Reexecuta a chamada
- Estado do componente: error

### 6. Entrada vazia (form sem dados)
- Estado visual: InputCard
- Mensagem: “Preencha todos os campos antes de continuar.”
- Botão: nenhum (o próprio form impede)
- Estado do componente: idle

### 7. Sem resultados (reasons vazias)
- Estado visual: ResultCard vazio
- Mensagem: “Nenhuma razão encontrada.”
- Botão: “Nova tentativa”
- Estado do componente: success (mas com empty state)

### 8. Estado vazio na primeira execução
- Estado visual: InputCard com mensagem auxiliar
- Mensagem: “Ainda não há resultados — envie uma lead para começar.”
- Botão: nenhum
- Estado do componente: idle

### 9. Resposta lenta (delay artificial)
- Estado visual: LoadingCard (skeleton)
- Mensagem: “Processando…”
- Botão: nenhum
- Estado do componente: loading

### 10. Mapeamento de Estados Visuais
- O que o usuário vê na tela
- Qual mensagem aparece
- Se existe botão de retry
- O que acontece ao clicar no retry
- Qual estado do componente é usado (idle, loading, error, success)

### 11. Estados Existentes e Ajustes Necessários

- Quais estados já existem no seu projeto
- Quais falhas do inventário já são cobertas por esses estados
- Quais falhas ainda precisam de ajustes ou novos comportamentos

### Estados já existentes no projeto
- idle → LeadScoreInputCard
- loading → LeadScoreLoadingCard
- success → LeadScoreResultCard
- error → LeadScoreErrorCard

### Falhas já cobertas pelos estados existentes
- Entrada vazia → idle (form impede envio)
- Estado vazio na primeira execução → idle
- Resposta lenta → loading (já existe)
- Erro 500 → error (já existe)
- JSON malformado → error (já existe)
- Falha de rede antes de enviar → error (já existe)
- Falha de rede no meio da requisição → error (já existe)

### Falhas que precisam de ajustes
- Erro 429 (rate limit) → precisa mensagem específica
- Sem resultados (reasons vazias) → precisa empty state dentro do success
- Retry inteligente → precisa garantir que reenvia o último payload
- Loading skeleton → precisa garantir que não causa salto de layout

### Por que esses ajustes são necessários
Esses ajustes garantem que cada falha tenha um tratamento visual distinto, conforme exigido pelo FE-08. O erro 429 precisa de uma mensagem específica para diferenciar limite de taxa de outros erros. O estado “sem resultados” exige um empty state dentro do success para evitar confusão com erro. O retry inteligente garante que o usuário não perca a entrada anterior. O skeleton precisa evitar salto de layout para manter a experiência suave durante respostas lentas.

### Plano de Sabotagem (FE-08)

#### 1. Falha de rede antes de enviar
- Ação: Abrir DevTools → Network → Offline
- Momento: Antes de clicar no botão “Run”
- Resultado esperado: ErrorCard com retry

#### 2. Falha de rede no meio da requisição
- Ação: DevTools → Network → Online → clicar “Run” → mudar para Offline durante o loading
- Resultado esperado: ErrorCard com retry

#### 3. Erro 500 da API
- Ação: Alterar temporariamente o backend para: return res.status(500).json({ error: "Internal error" })
- Resultado esperado: ErrorCard com mensagem “Erro interno no servidor”

#### 4. Erro 429 (rate limit)
- Ação: Alterar temporariamente o backend para: return res.status(429).json({ error: "Too many requests" })
- Resultado esperado: ErrorCard com mensagem específica de limite de taxa

#### 5. JSON malformado vindo da ferramenta
- Ação: Alterar temporariamente o backend para retornar JSON incompleto:
  return res.status(200).json({ score: 80 }) // faltando category e reasons
- Resultado esperado: ErrorCard com mensagem “Resposta inválida da ferramenta”

#### 6. Entrada vazia
- Ação: Clicar “Run” sem preencher o formulário
- Resultado esperado: InputCard impede envio (estado idle)

#### 7. Sem resultados (reasons vazias)
- Ação: Alterar temporariamente o backend para:
  return res.status(200).json({ score: 50, category: "warm", reasons: [] })
- Resultado esperado: ResultCard com empty state

#### 8. Estado vazio na primeira execução
- Ação: Abrir a página pela primeira vez
- Resultado esperado: InputCard com mensagem auxiliar

#### 9. Resposta lenta (delay artificial)
- Ação: Adicionar temporariamente no backend:
  await new Promise(r => setTimeout(r, 4000))
- Resultado esperado: LoadingCard (skeleton) sem salto de layout

### Plano de Capturas (FE-08)

#### 1. Caminho feliz (obrigatório)
- Print da tela inicial (estado idle)
- Print do loading (skeleton)
- Print do resultado (success)
- Console aberto mostrando zero erros

#### 2. Falha de rede antes de enviar (obrigatório)
- Print do DevTools → Network → Offline
- Print do ErrorCard exibido
- Print do botão “Tentar novamente”

#### 3. Falha de rede no meio da requisição
- Print do loading
- Print do DevTools mudando para Offline
- Print do ErrorCard exibido

#### 4. Erro 500 da API
- Print do backend temporariamente retornando 500
- Print do ErrorCard com mensagem “Erro interno no servidor”

#### 5. Erro 429 (rate limit)
- Print do backend retornando 429
- Print do ErrorCard com mensagem específica de limite de taxa

#### 6. JSON malformado
- Print do backend retornando JSON incompleto
- Print do ErrorCard com mensagem “Resposta inválida da ferramenta”

#### 7. Sem resultados (empty state)
- Print do backend retornando reasons: []
- Print do ResultCard exibindo empty state

#### 8. Estado vazio na primeira execução
- Print da página recém-aberta
- Print do InputCard com mensagem auxiliar

#### 9. Resposta lenta (delay artificial)
- Print do backend com delay
- Print do skeleton carregando sem salto de layout

#### 10. Retry funcionando (obrigatório)
- Print do ErrorCard
- Print do clique no botão “Tentar novamente”
- Print do fluxo voltando para loading → success

#### 11. Console limpo (obrigatório)
- Print do DevTools → Console sem erros durante o caminho feliz

### Checklist de Execução (FE-08)

#### Estados visuais
- [ ] ErrorCard com mensagens específicas para cada falha
- [ ] ErrorCard com botão de retry funcional
- [ ] Retry reenvia o último payload corretamente
- [ ] LoadingCard com skeleton sem salto de layout
- [ ] Empty state dentro do ResultCard (reasons vazias)
- [ ] InputCard com estado vazio na primeira execução

#### Comportamento do fluxo
- [ ] Caminho feliz sem erros no console
- [ ] Loading aparece imediatamente ao enviar
- [ ] ErrorCard aparece para falhas de rede
- [ ] ErrorCard aparece para erros 500 e 429
- [ ] ErrorCard aparece para JSON malformado
- [ ] ResultCard aparece corretamente quando há dados válidos

#### Sabotagens a testar
- [ ] Rede offline antes de enviar
- [ ] Rede offline no meio da requisição
- [ ] Backend retornando 500
- [ ] Backend retornando 429
- [ ] Backend retornando JSON malformado
- [ ] Backend retornando reasons: []
- [ ] Backend com delay artificial
- [ ] Entrada vazia bloqueada pelo form

#### Capturas obrigatórias
- [ ] Caminho feliz completo
- [ ] Dois estados de falha resolvidos
- [ ] Retry funcionando
- [ ] Console limpo no caminho feliz

### Revisão Final da Estratégia (FE-08)

Após revisar todo o planejamento, confirmo que:

1. O inventário de falhas está completo e cobre todos os cenários exigidos pelo FE-08.
2. Cada falha possui um estado visual definido, com mensagem, botão (quando aplicável) e ação de retry.
3. Os estados existentes do projeto foram analisados e os ajustes necessários foram identificados.
4. O plano de sabotagem cobre todas as falhas, incluindo rede, API, JSON, empty state e delays.
5. O plano de capturas inclui todas as provas obrigatórias: caminho feliz, falhas, retry e console limpo.
6. O checklist de execução está completo e servirá como guia durante a implementação.
7. A estratégia está pronta para ser implementada sem necessidade de revisões adicionais.

Conclusão: o FE-08 está totalmente planejado e pronto para execução.

### Implementação (FE-08)

#### 1. Ajustes no ErrorCard
- Implementar mensagens específicas para:
  - Falha de rede antes de enviar
  - Falha de rede no meio da requisição
  - Erro 500
  - Erro 429
  - JSON malformado
- Implementar botão de retry
- Garantir que o retry reenvia o último payload corretamente

#### 2. Ajustes no LoadingCard (skeleton)
- Garantir que o skeleton aparece imediatamente
- Garantir que não causa salto de layout
- Garantir que permanece durante delays artificiais

#### 3. Ajustes no ResultCard
- Implementar empty state quando reasons = []
- Garantir que o ResultCard aparece corretamente quando há dados válidos

#### 4. Ajustes no InputCard
- Garantir que o estado vazio aparece na primeira execução
- Garantir que o form impede envio com campos vazios

#### 5. Ajustes no fluxo principal
- Implementar transição correta:
  idle → loading → success
  idle → loading → error
- Garantir que o console permanece limpo no caminho feliz
- Garantir que erros são tratados sem quebrar o fluxo

#### 6. Preparação para testes
- Garantir que o backend aceita sabotagens temporárias (500, 429, JSON malformado, delay)
- Garantir que o frontend reage corretamente a cada sabotagem

#### 7. Arquivos que serão modificados
- components/LeadScoreInputCard.tsx
- components/LeadScoreLoadingCard.tsx
- components/LeadScoreResultCard.tsx
- components/LeadScoreErrorCard.tsx
- hooks/useLeadScoreRunner.ts
- utils/leadScoreParser.ts
- pages/tools/lead-score-runner.tsx

### Passo 8 — Implementação Real (FE-08)

#### 8.1 Implementar ErrorCard
- Criar mensagens específicas para:
  - offline antes do envio
  - offline durante o envio
  - erro 500
  - erro 429
  - JSON malformado
- Implementar botão de retry
- Garantir que o retry reenvia o último payload (armazenar payload em estado)

#### 8.2 Implementar LoadingCard (skeleton)
- Garantir que o skeleton aparece imediatamente ao clicar “Run”
- Garantir que não causa salto de layout (altura fixa)
- Garantir que permanece durante delays artificiais

#### 8.3 Implementar ResultCard
- Adicionar empty state quando reasons = []
- Garantir que o ResultCard renderiza corretamente com dados válidos

#### 8.4 Implementar InputCard
- Garantir que o estado inicial é idle com mensagem auxiliar
- Garantir que o form bloqueia envio vazio

#### 8.5 Implementar fluxo principal
- idle → loading → success
- idle → loading → error
- Garantir que erros não quebram o fluxo
- Garantir console limpo no caminho feliz

#### 8.6 Preparar backend para sabotagens
- Adicionar handlers temporários para:
  - 500
  - 429
  - JSON malformado
  - reasons: []
  - delay artificial

### Passo 9 — Testes Reais com Sabotagem (FE-08)

#### 9.1 Teste: Rede offline antes de enviar
- Abrir DevTools → Network → Offline
- Clicar “Run”
- Verificar ErrorCard com mensagem correta
- Verificar botão de retry funcionando

#### 9.2 Teste: Rede offline no meio da requisição
- DevTools → Network → Online
- Clicar “Run”
- Durante o loading, mudar para Offline
- Verificar ErrorCard com mensagem correta

#### 9.3 Teste: Erro 500
- Backend temporário: return res.status(500)
- Clicar “Run”
- Verificar ErrorCard com mensagem “Erro interno no servidor”

#### 9.4 Teste: Erro 429
- Backend temporário: return res.status(429)
- Clicar “Run”
- Verificar ErrorCard com mensagem específica de limite de taxa

#### 9.5 Teste: JSON malformado
- Backend temporário: retornar JSON incompleto
- Clicar “Run”
- Verificar ErrorCard com mensagem “Resposta inválida da ferramenta”

#### 9.6 Teste: Sem resultados (reasons vazias)
- Backend temporário: reasons: []
- Clicar “Run”
- Verificar ResultCard com empty state

#### 9.7 Teste: Estado vazio na primeira execução
- Recarregar a página
- Verificar InputCard com mensagem auxiliar

#### 9.8 Teste: Resposta lenta (delay artificial)
- Backend temporário: delay de 4 segundos
- Clicar “Run”
- Verificar skeleton sem salto de layout

#### 9.9 Teste: Retry funcionando
- Forçar qualquer erro
- Clicar “Tentar novamente”
- Verificar fluxo: error → loading → success

### Passo 10 — Preparação das Capturas e da Gravação (FE-08)

#### 10.1 URL de pré-visualização
- Gerar build de produção
- Implantar no Vercel ou Netlify
- Obter URL pública acessível pelo revisor

#### 10.2 Captura do Caminho Feliz (obrigatório)
- Tela inicial (estado idle)
- Tela de loading (skeleton)
- Tela de resultado (success)
- Console aberto mostrando zero erros

#### 10.3 Capturas de Falhas (mínimo 2 obrigatórias)
- Falha de rede antes de enviar (offline)
  - DevTools → Offline
  - ErrorCard exibido
  - Botão de retry visível

- Falha no meio do fluxo (offline durante loading)
  - Loading visível
  - DevTools mudando para Offline
  - ErrorCard exibido

- Erro 500
  - Backend temporário retornando 500
  - ErrorCard com mensagem correta

- Erro 429
  - Backend temporário retornando 429
  - ErrorCard com mensagem específica

- JSON malformado
  - Backend retornando JSON incompleto
  - ErrorCard exibido

- Empty state (reasons vazias)
  - ResultCard exibindo estado vazio

#### 10.4 Captura do Retry funcionando
- ErrorCard exibido
- Clique no botão “Tentar novamente”
- Fluxo retornando para loading → success

#### 10.5 Captura do Estado Vazio na primeira execução
- Página recém-carregada
- InputCard com mensagem auxiliar

#### 10.6 Captura da Resposta Lenta
- Backend com delay artificial
- Skeleton exibido sem salto de layout

#### 10.7 Gravação (opcional, mas recomendada)
- Gravar um vídeo curto mostrando:
  - Caminho feliz completo
  - Pelo menos duas falhas resolvidas
  - Retry funcionando
  - Console limpo

#### 10.8 Organização das provas
- Criar pasta “FE08-Proofs”
- Incluir:
  - prints organizados por falha
  - vídeo (se houver)
  - URL pública

### Passo 11 — Submissão Oficial (FE-08)

#### 11.1 Preparar o pacote de submissão
Criar a pasta:
- FE08-Proofs/
  - caminho-feliz/
  - falhas/
  - retry/
  - console/
  - video/ (opcional)
  - URL.txt

#### 11.2 Conteúdo obrigatório da submissão
- URL pública da aplicação (Vercel ou Netlify)
- Capturas do caminho feliz:
  - idle
  - loading (skeleton)
  - success
  - console limpo
- Capturas de pelo menos duas falhas resolvidas:
  - offline antes de enviar
  - offline no meio do fluxo
  - erro 500
  - erro 429
  - JSON malformado
  - empty state
- Captura do retry funcionando
- Captura do estado vazio na primeira execução
- Captura da resposta lenta (delay artificial)

#### 11.3 Vídeo (opcional, recomendado)
Gravar um vídeo curto mostrando:
- caminho feliz completo
- duas falhas resolvidas
- retry funcionando
- console limpo

#### 11.4 Enviar no Portal FlyRank
No Portal:
- Abrir FE-08
- Clicar “Adicionar submissão”
- Enviar:
  - URL pública
  - pasta FE08-Proofs (zip)
  - vídeo (se houver)

#### 11.5 Verificação final antes de enviar
- [ ] URL abre no navegador do revisor
- [ ] Nenhum erro no console no caminho feliz
- [ ] Skeleton sem salto de layout
- [ ] ErrorCard com retry funcional
- [ ] Empty state útil
- [ ] Falhas sabotadas funcionando
- [ ] Fluxo responsivo no Safari móvel

### Passo 12 — Auditoria Final (QA) do FE-08)

#### 12.1 Teste em ambiente real (produção)
- Abrir a URL pública no navegador
- Testar fluxo completo (idle → loading → success)
- Confirmar que não há erros no console

#### 12.2 Teste de responsividade
- Testar em:
  - Desktop (Chrome)
  - Mobile (Safari real)
  - Modo responsivo do DevTools
- Verificar:
  - layout estável
  - skeleton sem salto de layout
  - input não quebra com teclado móvel

#### 12.3 Teste de microinterações
- Verificar animações suaves
- Verificar transições entre estados
- Verificar que o ErrorCard não “pisca” ou aparece abruptamente
- Verificar que o retry tem comportamento consistente

#### 12.4 Teste de estados vazios
- Página recém-aberta → InputCard com mensagem auxiliar
- reasons: [] → ResultCard com empty state útil

#### 12.5 Teste de sabotagens (repetição final)
- Rede offline antes de enviar
- Rede offline no meio do fluxo
- Erro 500
- Erro 429
- JSON malformado
- reasons vazias
- delay artificial

#### 12.6 Teste de fluxo contínuo
- Executar 3 chamadas seguidas:
  - sucesso → sucesso → sucesso
- Executar 3 chamadas com falha:
  - erro → retry → sucesso
  - erro → retry → erro
  - erro → retry → sucesso

#### 12.7 Teste de estabilidade
- Verificar que:
  - nenhum estado fica “preso”
  - loading sempre desaparece
  - error sempre permite retry
  - success sempre limpa o console

#### 12.8 Aprovação interna
- Confirmar que:
  - todos os prints estão corretos
  - vídeo (se houver) está claro
  - URL funciona em qualquer navegador
  - pasta FE08-Proofs está organizada

Conclusão: FE-08 auditado e pronto para submissão final.

### Passo 13 — Encerramento (FE-08)

#### 13.1 Revisão final do documento
- Confirmar que todos os passos (1 a 12) estão presentes
- Confirmar que não há seções duplicadas
- Confirmar que a numeração está correta
- Confirmar que todas as sabotagens estão descritas
- Confirmar que todas as capturas obrigatórias estão listadas
- Confirmar que o fluxo de implementação está completo

#### 13.2 Revisão final do código
- Verificar que todos os estados visuais foram implementados
- Verificar que o retry funciona em todos os cenários
- Verificar que o skeleton não causa salto de layout
- Verificar que o empty state é útil
- Verificar que o fluxo é responsivo no Safari móvel
- Verificar que não há erros no console

#### 13.3 Revisão final da submissão
- Confirmar que a pasta FE08-Proofs está organizada
- Confirmar que a URL pública está funcionando
- Confirmar que as capturas estão claras
- Confirmar que o vídeo (se houver) está legível
- Confirmar que o revisor consegue reproduzir o fluxo

#### 13.4 Declaração de conclusão
Declaro que:
- O FE-08 foi totalmente planejado, implementado, testado e auditado.
- Todas as falhas foram tratadas conforme exigido.
- O fluxo está estável, responsivo e sem erros.
- A submissão está pronta para ser enviada ao Portal FlyRank.

Conclusão: FE-08 concluído com sucesso.

### Passo 14 — Refinamento Final (FE-08)

#### 14.1 Revisão de microinterações
- Suavizar transições entre estados (idle → loading → success → error)
- Garantir que o ErrorCard não aparece abruptamente
- Garantir que o skeleton tem fade-in suave
- Garantir que o retry tem feedback visual claro

#### 14.2 Revisão de mensagens
- Verificar que todas as mensagens são claras, curtas e úteis
- Verificar que mensagens de erro não culpam o usuário
- Verificar que empty states incentivam ação (“Nova tentativa”, “Envie uma lead”)

#### 14.3 Revisão de acessibilidade
- Verificar contraste de cores
- Verificar tamanho mínimo de fonte
- Verificar que botões têm área de toque adequada
- Verificar que skeletons não piscam ou causam desconforto visual

#### 14.4 Revisão de performance
- Garantir que o loading aparece imediatamente
- Garantir que o skeleton não causa reflow
- Garantir que o retry não dispara múltiplas requisições simultâneas
- Garantir que o fluxo funciona com rede lenta (Fast 3G no DevTools)

#### 14.5 Revisão de estabilidade
- Testar fluxo com spam de cliques no botão “Run”
- Testar fluxo com spam de cliques no botão “Tentar novamente”
- Testar fluxo com mudança rápida de rede (offline ↔ online)
- Testar fluxo com backend alternando entre sucesso e erro

#### 14.6 Revisão de UX geral
- Verificar que o usuário sempre sabe o que está acontecendo
- Verificar que o estado atual é sempre claro
- Verificar que o fluxo nunca fica “travado”
- Verificar que o usuário nunca fica sem uma ação possível

#### 14.7 Revisão de documentação
- Confirmar que o documento FE-08 está completo
- Confirmar que todos os passos estão numerados corretamente
- Confirmar que não há seções repetidas
- Confirmar que todas as sabotagens estão descritas
- Confirmar que todas as capturas obrigatórias estão listadas

Conclusão: FE-08 refinado e pronto para submissão com qualidade máxima.

### Passo 15 — Encerramento Final (FE-08)

#### 15.1 Confirmação de conclusão
Declaro que:
- Todos os passos (1 a 14) foram concluídos com sucesso.
- O fluxo foi planejado, implementado, testado, auditado e refinado.
- Todas as falhas foram tratadas conforme os critérios do FE-08.
- Todas as capturas obrigatórias foram preparadas.
- A URL pública está funcional e pronta para revisão.
- A pasta FE08-Proofs está organizada e completa.
- O documento FE-08 está finalizado e pronto para submissão.

#### 15.2 Estado final do projeto
- Fluxo estável, responsivo e sem erros.
- Skeleton sem salto de layout.
- ErrorCard com retry funcional.
- Empty state útil e claro.
- Comportamento consistente em rede lenta, offline e sabotagens.
- Compatível com Safari móvel.

#### 15.3 Publicação
- Submissão enviada ao Portal FlyRank.
- Projeto publicado e disponível para revisão.

Conclusão: FE-08 finalizado e oficialmente encerrado.

### Passo 16 — Pós-Mortem Técnico (FE-08)

#### 16.1 O que funcionou bem
- Planejamento detalhado desde o início evitou retrabalho.
- Inventário de falhas completo facilitou a implementação.
- Sabotagens bem definidas tornaram os testes previsíveis.
- Skeleton estável garantiu boa experiência visual.
- Retry inteligente funcionou de forma consistente.
- Empty state claro evitou confusão com erros.

#### 16.2 O que poderia ser melhorado
- Criar mocks mais rápidos para testar falhas sem alterar o backend.
- Automatizar testes de sabotagem com scripts.
- Criar componentes de erro mais reutilizáveis para outros projetos.
- Melhorar animações de transição entre estados.

#### 16.3 Aprendizados técnicos
- Importância de tratar falhas de rede de forma explícita.
- Como projetar estados vazios que incentivam ação.
- Como evitar salto de layout com skeletons.
- Como garantir responsividade real no Safari móvel.
- Como estruturar um fluxo de IA resiliente a falhas.

#### 16.4 Aprendizados de UX
- Usuários precisam sempre saber o que está acontecendo.
- Mensagens curtas e claras reduzem frustração.
- Retry precisa ser confiável e previsível.
- Empty states são parte da experiência, não um detalhe.

#### 16.5 O que levar para o próximo projeto
- Criar inventário de falhas antes de escrever qualquer código.
- Testar primeiro as falhas, depois o caminho feliz.
- Documentar tudo em passos claros como neste FE-08.
- Manter skeletons e erros consistentes em toda a aplicação.

Conclusão: Pós-mortem concluído — FE-08 fechado com excelência.
