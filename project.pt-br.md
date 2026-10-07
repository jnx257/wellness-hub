# Lista de Tarefas (ToDo List)

## Visão Geral

A Lista de Tarefas é um dos módulos centrais do Wellness Hub, construído em torno de dois focos complementares:

- **Tarefas Diárias** — itens de curto prazo e acionáveis, ligados à rotina do dia a dia do usuário.
- **Tarefas Anuais / Mensais (Metas)** — objetivos de longo prazo aos quais as tarefas diárias e semanais devem se conectar.

O principal diferencial dessa Lista de Tarefas é que ela não apenas acompanha a conclusão — ela acompanha o _desvio_. Toda tarefa pode ser vinculada a uma meta de nível superior (Mensal ou Anual) e, quando o usuário não conclui uma tarefa ligada a essa meta, o app trata isso como um sinal, não apenas como uma simples falha.

## Ciclo de Feedback de Falha

Quando uma tarefa ligada a uma meta não é concluída, o usuário é solicitado a responder uma pergunta curta: "Por que você não conseguiu concluir isso?". Essa resposta alimenta duas coisas:

1. **Ajuste Diário** — com base no motivo informado, o app sugere um ajuste nas tarefas diárias do usuário (por exemplo, reduzir o escopo, reagendar ou dividir a tarefa em etapas menores) para ajudar a realinhar com a meta original sem abandoná-la. Quando o ajuste é recusado pelo usuário e ocorrem três falhas, a tarefa é ajustada automaticamente.
2. **Vínculo com o Diário** — o motivo da falha pode ser vinculado a uma entrada no módulo de Diário (Journaling), permitindo que o usuário reflita mais profundamente sobre padrões recorrentes de falha e conecte notas emocionais/contextuais a tarefas específicas não cumpridas.

Isso cria um ciclo fechado entre **Meta → Tarefa → Falha → Reflexão → Ajuste**, mantendo o usuário dentro do seu "fluxo de vida" pretendido, em vez de apenas acumular caixas de seleção não marcadas.

## Estrutura das Tarefas

- **Tarefa Diária**: atômica, marcável (checkable), opcionalmente recorrente, pode opcionalmente referenciar uma meta pai.
- **Meta Mensal/Anual**: objetivo mais amplo, composto por tarefas aninhadas (semanais/diárias) que contribuem para seu progresso.
- **Relação**: uma Tarefa Diária pode ser "órfã" (sem meta vinculada) ou um "marco" (milestone, vinculada a uma Meta Mensal/Anual). Apenas tarefas marco disparam o fluxo de motivo de falha.

## UI (Interface do Usuário)

- Um menu hambúrguer lateral esquerdo com as opções: **ToDo**, **Diário (Journaling)** e **Início** (o dashboard).
- A tela de ToDo possui um controle de alternância/segmentado para trocar entre **Visão Diária** e **Visão de Metas (Mensal/Anual)**.
  - **Visão Diária**: lista estilo checklist, agrupada por período do dia ou prioridade.
  - **Visão de Metas**: cards de meta mostrando progresso (ex.: % concluído com base nas subtarefas vinculadas), com tarefas diárias ou semanais aninhadas/colapsáveis abaixo de cada meta.
- Quando uma tarefa marco é marcada como falha/incompleta, um modal ou input inline aparece pedindo o motivo da falha, com um atalho opcional para vinculá-la a uma entrada do Diário.
- Suporta modo **Escuro** e **Claro**.
  - Modo Claro: cor primária verde suave `#1D4533`, fundo/superfície `#F7EAE0`.
  - Modo Escuro: cor secundária `#5E3122` (paleta/superfície do modo escuro ainda a ser definida).

### UI do ToDo

A UI do ToDo é estruturada em torno do objetivo central do app: manter o usuário alinhado com seus objetivos de longo prazo e revelar _por que_ ele se desvia, para que possa se corrigir — não apenas marcar caixas de seleção.

**Layout**

- Um controle segmentado no topo alterna entre dois focos:
  - **Diário** — tarefas acionáveis de hoje.
  - **Metas** — objetivos Mensais/Anuais e suas tarefas aninhadas.
- Um menu hambúrguer lateral esquerdo (navegação global) dá acesso a `ToDo`, `Diário` e `Início`.

**Visão Diária**

- Checklist simples agrupado por período do dia ou prioridade (Manhã / Tarde / Noite, ou Alta/Média/Baixa).
- Cada item de tarefa mostra:
  - Caixa de seleção / estado de conclusão.
  - Título da tarefa.
  - Um pequeno **selo/tag de meta** (ex.: 🎵 "Piano") se a tarefa for uma _tarefa marco_ vinculada a uma Meta Mensal/Anual. Tarefas órfãs (sem meta) não têm selo, visualmente mais leves/com menos destaque que as tarefas marco — reforçando que tarefas vinculadas a metas importam mais para o propósito do app.
- Deslizar (swipe) ou pressionar e manter (long-press) em uma tarefa revela ações rápidas: concluir, reagendar, editar, desvincular da meta.

**Visão de Metas**

- Lista de **Cards de Meta** (Mensal/Anual), cada um mostrando:
  - Título da meta e ícone de categoria (ex.: 🎹, 🏃, 📚).
  - Barra de progresso / % concluído, calculada a partir das subtarefas vinculadas.
  - Um pequeno indicador de sequência/consistência (ex.: "3 semanas no caminho certo", "2 falhas este mês").
- Tocar em um Card de Meta o expande em uma lista aninhada de suas tarefas Semanais/Diárias (árvore colapsável), para que o usuário sempre veja como as tarefas de hoje se conectam ao objetivo maior.

**Fluxo de Feedback de Falha (diferencial central)**

- Quando uma _tarefa marco_ (vinculada a uma meta) é perdida ou marcada como incompleta no final do dia, o app não apenas a reprova silenciosamente — ele dispara um prompt leve e não punitivo:
  - **Modal/bottom-sheet**: "Não conseguiu concluir '[Tarefa]' — o que impediu?"
  - Seleção rápida de motivos comuns (ex.: "Sem tempo", "Muito cansado", "Perdeu a motivação", "Evento inesperado") + opção de texto livre.
  - CTA opcional: "Vincular isso a uma entrada do Diário" — leva ao Diário com a tarefa/motivo pré-preenchidos como contexto.
- Com base no motivo selecionado, o app apresenta um **ajuste sugerido** inline (ex.: "Quer reduzir a prática de amanhã para 1h em vez de pular?" ou "Mover essa tarefa para o fim de semana?").
- Isso transforma uma tarefa perdida de um beco sem saída em um redirecionamento ativo de volta à meta — visualmente distinto de um simples estado de "tachado" concluído/falhado (ex.: um marcador laranja/âmbar suave em vez de vermelho, para manter um tom de apoio em vez de punitivo).

**Tom visual**

- Usa o verde suave do app (`#1D4533`) para estados concluídos/no caminho certo, e um terracota/marrom quente (`#5E3122`) como destaque para selos de meta e indicadores de sequência — evitando o vermelho forte para falhas, para manter o tom emocional alinhado ao bem-estar em vez de culpa.

### UI do Diário (Journaling)

A UI do Diário serve como a contraparte reflexiva da Lista de Tarefas — o espaço onde o usuário dá sentido ao _por que_ as coisas aconteceram, não apenas _o que_ aconteceu. Seu principal diferencial é a capacidade de vincular entradas a tarefas específicas do ToDo (especialmente tarefas marco que falharam), transformando o diário em uma ferramenta de diagnóstico em vez de um diário desconectado.

**Layout**

- Uma superfície de escrita simples e livre de distrações (interface mínima, bastante espaço em branco) — escrever no diário deve parecer calmo, não mais uma tarefa a cumprir.
- As entradas são organizadas em um feed cronológico inverso, com filtros opcionais: `Todas`, `Vinculadas a Metas`, `Entradas livres`.
- Um botão de ação flutuante (`+`) inicia uma nova entrada.

**Estrutura da Entrada**

- Cada entrada possui:
  - Selo de data/hora (automático).
  - Tag opcional de humor/emoção (ícone pequeno ou ponto de cor, reutilizado visualmente em todo o app, ex.: no Dashboard).
  - Corpo de texto livre.
  - **Chip opcional de tarefa/meta vinculada** no topo da entrada (ex.: 🎹 "Praticar Fur Elise — não concluído"), exibido quando a entrada se originou de, ou foi manualmente vinculada a, um item do ToDo.

**Fluxo de Vinculação (diferencial central)**

- Entradas podem ser vinculadas a itens do ToDo de duas formas:
  1. **De entrada a partir do ToDo**: quando uma tarefa marco falha, o usuário pode ir direto para uma nova entrada de Diário com a tarefa e o motivo da falha pré-preenchidos como contexto (a partir do fluxo de falha do ToDo).
  2. **Vinculação manual**: dentro de uma entrada, o usuário pode buscar e anexar qualquer tarefa ou meta existente (ex.: escrever uma reflexão primeiro e depois perceber que ela se relaciona a "Aprender Piano").
- Entradas vinculadas aparecem como um pequeno marcador na linha do tempo no **Card de Meta** correspondente na Visão de Metas, para que o usuário veja rapidamente quais metas acumularam reflexão ao longo do tempo e quais não.

**Modo de Revisão**

- Uma visão secundária (acessível via filtro ou aba) agrupa entradas **por meta vinculada**, permitindo que o usuário percorra todas as reflexões ligadas a um único objetivo — ex.: toda entrada conectada a "Aprender Piano" — para identificar padrões recorrentes de desvio.

**Tom visual**

- Usa uma paleta mais suave e neutra do que a UI do ToDo (superfície de fundo `#F7EAE0` no modo claro, com texto suave) para sinalizar uma mudança do "modo ação" para o "modo reflexão". O verde primário (`#1D4533`) é reservado para entradas vinculadas/marcadas com meta, mantendo a continuidade visual com o módulo ToDo.

### UI do Dashboard/Início

O Dashboard é o ponto de entrada do app — uma visão sintetizada dos dados da Lista de Tarefas e do Diário, projetada para responder a uma pergunta de imediato: _"Ainda estou avançando em direção às minhas metas, ou me desviei?"_

**Layout**

- Seção superior: uma **saudação + resumo diário** (ex.: "Bom dia, [Nome]" + contagem das tarefas de hoje, quantas são vinculadas a metas).
- Seção do meio: **Visão Geral de Metas** — Cards de Meta roláveis horizontalmente (mesmo componente da Visão de Metas), cada um mostrando % de progresso e um pequeno "indicador de desvio".
- Seção inferior: **Feed de Atividade Recente** — um feed cronológico combinado de conclusões, falhas e entradas de diário recentes, para que o usuário veja a atividade do ToDo e do Diário lado a lado em vez de isoladas.

**Indicador de Desvio (diferencial central)**

- Cada Card de Meta no Dashboard inclui um sinal visual compacto — não apenas % de progresso, mas _tendência_:
  - 🟢 **No caminho certo**: conclusão consistente, poucas/nenhuma falha recente.
  - 🟠 **Desviando**: falhas recentes em tarefas marco, especialmente aquelas sem um ciclo de feedback/ajuste concluído (ou seja, motivo da falha informado, mas sem ação de acompanhamento).
  - Tocar em uma meta em desvio revela um breve resumo: motivos de falha mais comuns registrados naquele mês, e um atalho para revisar entradas de Diário relacionadas ou ajustar tarefas futuras.
- Isso faz o Dashboard funcionar como um sistema de alerta precoce, revelando _padrões_ (não apenas dias perdidos) antes que o usuário se desvie demais do seu fluxo pretendido.

**Widgets Secundários**

- **Mini-gráfico de humor/consistência**: uma visualização leve (ex.: faixa de 7 ou 30 dias) combinando taxa de conclusão de tarefas e tags de humor do diário, para correlacionar o estado emocional com o progresso das metas ao longo do tempo.
- **Ações rápidas**: atalhos para "Adicionar Tarefa Diária", "Nova Entrada de Diário" e "Revisar uma Meta em Desvio".

**Tom visual**

- Funciona como a âncora visual de toda a paleta do app: verde primário (`#1D4533`) para estados no caminho certo, terracota/marrom (`#5E3122`) para destaques de meta e avisos de desvio (em vez de vermelho, mantendo o tom de apoio/não punitivo estabelecido na UI do ToDo), e a superfície de fundo clara (`#F7EAE0`) unificando o dashboard com o resto do Hub.

## Decisões de Stack Tecnológico

- **Banco de dados: Neon (Postgres serverless).** Escolhido em vez do Supabase (empacota auth/storage que ainda não precisamos), Turso/SQLite (menos recursos relacionais para aprender) e Postgres autogerenciado (overhead de infraestrutura que não vale a pena para um projeto solo implantado na Vercel). O Neon oferece Postgres de verdade sem vendor lock-in e se integra bem com a Vercel.
- **ORM: Drizzle.** Escolhido em vez do Prisma (runtime mais pesado, historicamente pior em cold starts serverless) e do Kysely (mais manual, sem schema declarativo). O Drizzle é SQL-first, type-safe de ponta a ponta, e mantém as migrações simples via `drizzle-kit`.

# Coisas para pensar depois:

1. Sobre o "Ciclo de Feedback de Falha": você menciona que o app sugere ajustes (ex.: "reduzir a prática de amanhã para 1h"), mas quem decide se aceita ou rejeita essa sugestão? Existe um custo de atrito se o usuário ignorar a sugestão? Isso poderia criar um ciclo de falha secundário, em que usuários descartam ajustes e depois voltam a perder a tarefa?
2. Assimetria entre Marco (milestone) e Órfã: você diz que tarefas órfãs são "visualmente mais leves/com menos destaque" para sinalizar que importam menos. Mas isso não criará uma pressão de design para que os usuários vinculem tudo a uma meta, mesmo tarefas de baixo risco, só para obter paridade visual? Como evitar o inchaço de metas (goal bloat)?
3. O "indicador de desvio" no Dashboard: você menciona que ele revela padrões de falhas, mas qual é o mínimo de dados necessário para disparar um sinal de "desviando"? Uma falha? Duas? Uma porcentagem? Se o limiar for muito sensível, ele se torna ruído; se for muito alto, pode perder sinais de alerta precoce?
4. Vinculação de Diário em ambas as direções: entradas podem ser vinculadas a partir de falhas no ToDo ou vinculadas manualmente depois. Mas se um usuário escreve uma entrada de diário primeiro e a vincula retroativamente, ele já fez a reflexão — ainda há valor em o app sugerir um "ajuste" para uma tarefa que já passou?
5. O mini-gráfico de humor/consistência: você diz que ele correlaciona tags de humor com a conclusão de tarefas, mas correlação não é causalidade. Se humor e conclusão não forem correlacionados, o gráfico simplesmente se torna ruído? Como evitar que seja mal interpretado como "seja mais feliz para concluir tarefas"?
6. Cálculo de progresso %: para uma Meta com tarefas aninhadas, como o progresso é calculado? É simplesmente "tarefas concluídas / total de tarefas"? E se um usuário concluir 3 tarefas fáceis mas perder 1 crítica — ele deveria se sentir 75% concluído?
