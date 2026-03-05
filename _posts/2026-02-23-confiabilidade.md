---
layout: post
image: assets/images/system-design/capa-confiabilidade.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering ]
title: System Design - Observabilidade e Monitoramento
---

{% include latex.html %}

# Definindo Confiabilidade

Confiabilidade, é a propriedade de um sistema **entregar comportamento correto ao longo do tempo**, sob condições esperadas e sob uma fração representativa de condições adversas. Confiabilidade vai muito além de uma aplicação “ficar de pé”, e não é sinônimo direto de “alta disponibilidade”. Um sistema pode estar tecnicamente disponível e ainda assim ser pouco confiável se responde com dados errados, se degrada de forma caótica, se apresenta latência imprevisível ou se não consegue manter invariantes essenciais do domínio quando pressionado. 

Confiabilidade portanto agrega o conceito de continuidade de serviço, integridade e previsibilidade em termos operacionais. 

A utilidade dessa definição é que ela coloca confiabilidade no lugar certo: como uma **restrição arquitetural** e um **contrato operacional**, e não como um “atributo desejável”. A partir daqui, todos os termos que irão ser abordados nesse capítulo como SLIs/SLOs, error budget, Four Golden Signals, RED, USE e demais estratégias abordadas em outros capítulos como estratégias de redundância, padrões de resiliência e práticas de incident response passam a ser consequência de um objetivo de reduzir a probabilidade e o impacto de comportamentos incorretos, reduzir o tempo para detectar e recuperar, e limitar o blast radius quando algo inevitavelmente falhar. 

A Confiabilidade então, é um conjunto de práticas e disciplinas da engenharia e arquitetura de software que busca atingir níveis cada vez maiores e auditáveis de continuidade operacional. 


<br>

# Observabilidade 

Observabilidade é a capacidade sistema de inferir o estado interno de um sistema a partir de suas saídas externas. O termo tem origem na Teoria de Controle, da década de 1960, introduzida academicamente por Rudolf E. Kalman através de publicações sobre a teoria de sistemas lineares. 

A Teoria do Controle é um ramo da engenharia e da matemática que estuda como modelar, analisar e regular o comportamento de sistemas dinâmicos para projetar sistemas complexos que se comportem de maneira estável ao longo do tempo, mesmo diante de perturbações externas ocasionais. Na teoria, um sistema é dito observável caso exista a capacidade de inferir o estado interno de um sistema apenas pelas suas saídas externas.

A observabilidade em sistemas de software depende de saídas, registros e métricas de desempenho para cumprir esse papel. Trata-se da capacidade de compreender o estado interno de um sistema complexo a partir dos eventos e sinais externos que ele emite. 

Esses eventos e sinais podem ser traduzidos inicialmente nos três pilares da observabilidade, como logs, traces e métricas. O objetivo é entender comportamento, padrões e construir estruturas que sejam "interrogáveis" através de padrões e dimensões conhecidas e não conhecidas. Podemos presumir que: **uma vez que conseguimos correlacionar logs, traces e métricas para elaborar questionamentos complexos sobre o sistema, temos observabilidade.** E ainda mais, **se podemos utilizar logs, traces e métricas para conduzir análises exploratórias, temos observabilidade**.  

Por mais que seja altamente dependente, a observabilidade é uma propriedade estrutural de um sistema, não um conjunto de ferramentais. É altamente possível de que empresas, produtos e estruturas inteiras disponham de ferramentais altamente complexos e caros, e mesmo assim não possuam observabilidade em essência. 

A medida que nosso ferramental é utilizado para interpretar comportamento, e podemos utilizá-lo tecnicamente e culturalmente para entender comportamentos e padrões escondidos de forma histórica, temos observabilidade. 


## Monitoramento e Observabilidade

O monitoramento e a observabilidade são conceitos que caminham juntos, de forma tão tênue, que normalmente são confundidos e referenciados como se fossem a mesma coisa. Entender a diferença dos dois pode ser de grande ajuda para elevar o nível de confiabilidade nos sistemas. Os dois conceitos não são excludentes, são complementares em essência. 

Monitoramento é a capacidade de coleta e análise de métricas pré-definidas, de contextos já vividos, para verificar o estado de um sistema a partir de dimensões já conhecidas. O monitoramento nos dá a capacidade de monitorar, verificar e alertar quando algo conhecido dá errado, por exemplo aumento de erros em API's especificas, saturação de recursos, locks em um banco de dados, aumentos no tempo de resposta e etc. 

Monitoramento se desenvolve normalmente por medidas quantitativas, como por exemplo porcentagem de uso de CPU, latência de rede, quantidade de dados de entrada e saída de rede, taxas de erro, espaço em disco e etc, e com base nisso configurar thresholds para disparar alertas quando algo sai de um padrão estabelecido.  

Observabilidade por outro lado, é a capacidade de investigar fenômenos desconhecidos através da exploração de dados contextuais mais amplos, e entender o "por que" algo inesperado aconteceu. Deixamos de observar um estado deterministico como "minha API está lenta" e expandimos isso para "por que essa API está lenta agora?", e conseguimos analisar todos os sinais de forma correlacionada para entender comportamento. 

Resumindo, monitoramento está diretamente ligado a identificar e alertar sobre problemas conhecidos, e a observabilidade está ligada a comportamento. Uma vez que sua observabilidade te possibilita encontrar padrões e investigar problemas não obvios, essas novas dimensões descobertas podem ser utilizadas como insumos para gerar monitoramento.  Observabilidade é correlacionada a comportamento e exploração, monitoramento é acompanhamento. 

### Monitoramento como Detecção de Sintomas 

### Observabilidade como Comportamento

### Sistemas Determinísticos vs Sistemas Distribuídos

<br>

# Três Pilares da Observabilidade

## Métricas

Métricas são aspectos quantitativos e estatísticos do software que tem o objetivo de medir comportamentos, desempenho e demais estados de um sistema a longo do tempo. Métricas por si só tem características temporais e fornecem uma visão de tendências durante períodos do dia. Métricas podem operar tanto no nível técnico quanto no de negócio. Existem métricas técnicas como tempo de resposta, quantidade de sucessos, quantidade de erros, contadores de status code, métricas de status de circuit breakers abertos e fechados, acionamentos de fallbacks e etc. As métricas de negócio operam num nível mais característico e especifico da aplicação, e podem ser variações de quantidade de vendas, quantidade de pagamentos aceitos, pagamentos recusados, quantidade de transações autorizadas, negadas, quantidade de vezes recusas por falta de saldo e demais validações. 

### Contadores 

Um valor que só aumenta (ou reseta para zero, como na reinicialização de um serviço). É útil para contar o número de eventos, como requisições totais, erros, itens processados com sucesso, itens processados com erro, circuitos abertos e etc

### Gauges 

Representa um valor numérico que pode aumentar ou diminuir. É perfeito para medir valores pontuais, como uso de CPU, memória em uso, número de conexões ativas, tempos de resposta e etc.

### Histogramas

Amostra observações (como durações de requisições ou tamanhos de resposta) e as agrupa em baldes (buckets) configuráveis. Ele permite calcular quantis e percentis (ex: "99% de todas as requisições foram concluídas em menos de 300ms").

## Traces

Em ambientes distribuídos de microserviços, uma unica transação pode passar por dezenas de serviços diferentes para ser considerada concluída. Traces tem o objetivo de capturar amostras de solicitações detalhando as mesmas de fim a fim, catalogando todas as entradas e saídas de uma transação através de multiplos componentes de um sistema distribuído. 

![trace](/assets/images/system-design/trace.png)

Eles mostram o campinho fim a fim da transação, incluindo tempos de precessamento, latência, erros de chamada entre serviços e etc. Diferente dos logs, que são isolados, traces conectam eventos em uma narrativa coesa, revelando como diferentes partes do sistema interagem.

Traces são utilizados para entender erros e desvios de tempos de resposta de uma transação, e facilita entender o "porquê" de um problema em contextos complexos.. Num trace fim a fim podemos compreender o tempo de execução a nível de funções, métodos, queries de bancos de dados, clientes HTTP de todas as aplicações que interagem durante o funcionamento de uma transação. 


## Logs 

Logs são registros textuais de eventos que ocorrem em um sistema. São a saída do runtime que representam algo que ocorreu.  Um log é um registro imutável vindo da aplicação que o emitiu de um evento discreto que ocorreu em um ponto específico no tempo dentro de uma aplicação ou sistema, e normalmente vem acompanhado de metadados e um timestamp para comparação e ordenação histórica para ser correlacionado numa linha de tempo isoladamente ou com outras aplicações quando estruturado.

Eles capturam informações detalhadas sobre ações, erros e estados em momentos específicos, mensagens de erro, dados da transação, informação dos payloads ou dados do usuário usuários. Em essência, logs funcionam como um diário detalhado do sistema, permitindo que exita uma investigacão funcional de problemas, e diferente dos traces ele possui uma característica de troubleshooting funcional, onde nem todo "problema" do software é necessariamente um "erro" ou um "desvio". Ele nos ajuda a responder coisas como "O que aconteceu com a transação xxx?", "O que um usuário específico fez?", "Qual foi o erro exato que causou a falha desta requisição?", "Quais foram os parâmetros de uma função quando ela foi chamada e qual foi seu retorno?". 

### Níveis de Severidade

Quando tratamos os logs como "diário detalhado" do sistema, a classificação de severidade é o componente semântico que traduz um fluxo textual qualquer em um componente de telemetria "interrogável". Os níveis de severidade classificam os registros imutáveis de log em criticidade e contexto que diz “o que esse evento significa” e “o que alguém deve fazer a respeito”. Os níveis mais comuns (TRACE, DEBUG, INFO, WARN, ERROR e FATAL/CRITICAL) existem para representar intenções diferentes, não só gravidade do ocorrido. Nesta sessão iremos abordar os critérios de classificação claros de cada um deles. 

| Level            | Intenção                                                                 |
|------------------|---------------------------------------------------------------------------|
| TRACE            | Rastrear passos internos muito finos para investigação pontual |
| DEBUG            | Explicar decisões internas e facilitar troubleshooting         |
| INFO             | Registrar fatos relevantes do fluxo e do domínio                 |
| WARN             | Registrar um desvio recuperável                   |
| ERROR            | Falha de operação    |
| FATAL / CRITICAL | Falha terminal a nível de runtime                   |

<br>

#### Nível TRACE

TRACE é o nível de microscopia. Ele existe para quando você precisa observar o caminho exato que o código percorreu, com granularidade alta e verbosa, tipicamente em investigações pontuais, como ordem de decisões internas, branchs condicionais, parâmetros intermediários, transformações de payload, detalhes de serialização/deserialização, e qualquer nuance que ajude a reproduzir um comportamento que não aparece em logs mais altos, podendo ir até na verbosidade do protocolo de uma comunicação. 

#### Nível DEBUG

O Debug trabalha a nível de diagnóstico. Ele fica abaixo do “contar a história” e acima do “registrar absolutamente tudo”. A intenção do DEBUG é explicar o porquê de uma decisão do sistema, dando visibilidade a variáveis e estados relevantes para troubleshooting, como escolhas de fallback, printar parâmetros que levaram a uma regra de negócio a seguir por um caminho, identificação de dependências chamadas e seus tempos, composição de requests para serviços downstream, resultados de validações, e checkpoints do fluxo que ajudam a localizar o ponto exato de divergência. Geralmente utilizado durante períodos de crise para tratar condicionais muito específicas que levam a desvios não tão obvios, muito útil para sistemas que possuem multiplos fluxos e uma visão "não tão" deterministica a nível de conhecimento do time técnico e de multiplas condicionais internas. 

#### Nível INFO

O INFO trabalha num aspecto narrativo da transação. Ele registra eventos relevantes do ponto de vista do sistema e do domínio, de modo que, quando você costura o fluxo por um correlationId, você consegue ler uma história. O objetivo do INFO é rastrear uma transação de forma consistente e cronológica, como quando uma requisição entrou, quem é a entidade forte dela, se uma operação foi aceita/recusada, se um estado mudou, quando job iniciou e finalizou, quando e como um evento de domínio foi publicado, como e quando uma transação completou com todas as informações relevantes para tratar um `Correlation` a nível de um agregado forte. 

#### Nível WARN

O WARN é o nível do desvio com continuidade. É quando algo saiu do ideal, mas o sistema ainda conseguiu seguir adiante, como uma dependência que respondeu de forma mais lenta e um retry foi necessário, um fallback foi acionado, um circuito abriu por proteção, um timeout quase estourou, uma fila começou a crescer, uma validação marginal foi aceita por regra de tolerância, um cache miss inesperado elevou latência, uma operação precisou degradar para manter disponibilidade. Um bom WARN é acionável deve carregar contexto para permitir triagem, e pode ser utilizado para confiabilidade porque ele frequentemente aparece antes do incidente. 

#### Nível ERROR

ERROR é falha de operação. Aqui a execução não atingiu o resultado esperado do ponto de vista daquela transação. A requisição falhou e retornou erro, um critério de domínio foi violado e o comando foi rejeitado, uma dependência falhou sem compensação possível, uma transação abortou, uma transação no banco de dados não foi concluída, uma conexão não conseguiu ser fechada, uma mensagem não pôde ser processada e foi para DLQ, um dado essencial estava ausente, ou um estado ficou inconsistente a ponto de impedir continuidade.

Um ERROR precisa ser pensado como “log de triagem” e deve dizer o que falhou, por que falhou junto com usa possível causa, onde falhou e em qual componente, e como correlacionar com o resto do fluxo respeitando Correlation ID's. 

#### Nível FATAL

FATAL (ou CRITICAL, dependendo do ecossistema) é falha terminal, aquela que compromete a continuidade do processo ou do serviço. É quando o runtime não consegue seguir, o processo cai, o serviço não inicia, uma configuração essencial é inválida, um recurso crítico não está acessível na inicialização, ou uma condição irrecuperável foi atingida e a única resposta segura é encerrar. Como por exemplo um NullPointer crítico, uma dependência crítica que não pode ser acessada, falta de variáveis e parametrizações necessárias para iniciar a aplicação e etc. Logs FATAL são geralmente associados a operações de runtime, e que impedem da aplicação de funcionar. 

<br>

### Correlação de Logs 

A principal função dos logs está no seu nível de detalhes úteis. Uma métrica pode mostrar a quantidade de erros dentro de um período específico, porém um log tem o objetivo de mostrar os outputs da aplicação que indicam quais erros, exceções e em que cenários aqueles erros aconteceram. Em ambientes cada vez mais distribuídos com multiplos serviços dentro de uma mesma transação, podemos estabelecer padrões de campos que se repetem em todos os serviços pelos quais uma determinada transação passa, para que seja possível correlacionar os logs de diversas aplicações e gerar uma "história" de uma transação. 

![Log Correlation Search](/assets/images/system-design/log-correlation-search-min.png)

![Log Correlation Result](/assets/images/system-design/log-correlation-result.png)

**Os Logs para terem valor, precisam contar uma história**. Conceitualmente, **trabalhamos uma transação como um agregado, e as linhas de log como itens decorrentes desse agregado.** Quando bem estruturado, esse padrão nos permite através de identificadores únicos como `trace_id`, `correlation_id`, `order_id` e através dos mesmos correlacionar os logs de diversas fontes para explicar como uma determinada transação ocorreu, como o extrato de uma história. **Talvez esse seja o cenário onde, os logs vão de fato, gerar todo o seu potencial e justificar seus altos custos de ingestão, armazenamento e retenção.**

### Estruturação e Indexação de Logs

O maior desafio da ingestão de logs, está em essência em custo. Aplicações podem gerar gigabytes ou terabytes de logs por dia, tornando o armazenamento e a análise uma tarefa muito complicada. Podem conter uma variedade imensa de informações e valores únicos e despadronizados como IDs de usuário, IDs de requisição, mensagens de erro detalhadas, stack traces gigantes, que são sim dados úteis, mas quando trabalhamos por indexação utilizando os valores desses campos, podemos sofrer com alguns problemas relacionados a performance e custo. 

Logs de texto puro são difíceis de analisar em escala. Logs estruturados e padronizados, por exemplo, em JSON permitem que ferramentas de agregação de logs realize a indexação por campos específicos mais buscados, filtros e agregações de forma menos custoza computacionalmente e financeiramente. 



<br>


## Agregados dos Pilares 

### Alerting 

### APM 

<br>

# Frameworks de Mercado

Antes de entrar nos frameworks de mercado, vale estabelecer o porquê eles existem e qual problema real eles resolvem. Pois a princio, perante a vários cases de uso complexos com multiplos níveis de observabilidade e operação, de primeiro momento eles podem parecer bem simplistas. Mas não são. O objetivo dos frameworks de mercado é dar "estrelas guia" simplificadas para os times de engenharia e produto. Dentro de produtos de tecnologia, a maior parte das discussões operacionais degrada por dois caminhos previsíveis: ou o time se afoga em centenas de métricas desconexas, sem conseguir distinguir sintoma de causa, ou se apega a uma ou duas métricas “fáceis” como CPU média, 5xx, latência média e toma decisões erradas com muita confiança. 

O objetivo dos frameworks como Four Golden Signals, RED e USE sugerem métricas simples e fácilmente entendiveis que vão atuar como bussolas de navegação do sistema em produção. Usar eles, de forma alguma, descaracteriza a necessidade de observar dimensões mais detalhadas, apenas simplifica o entendimento da saúde do serviço através de métricas direcionadas. 


<br>

## USE Method 

![USED](/assets/images/system-design/use-resources.png)

O USE Method surge no contexto de engenharia de performance de sistemas, popularizado e formalizado pelo Brendan Gregg no artigo "Thinking Methodically about Performance" como uma estratégia de checagem sistemática e padronizada da “saúde” de recursos físicos alocados. 

O objetivo do Metodo Use é dar visibilidade para cada recurso como CPU, memória, disco, rede, e outros recursos como filas e pools e observar os mesmos em três dimensões principais: Utilization, Saturation e Errors. Esses recursos como  podem ser recursos alocados para aplicações dentro de containers ou servidores quanto de suas dependências como Databases, Caches, Filas e etc.

Ele descreve o USE como um método para começar uma investigação de queda de performance de forma simples e objetiva para monitorar sinais vitais e identificar gargalos sistêmicos com velocidade.

### Utilization (Utilização)

Utilization é quanto do recurso está sendo consumido em um intervalo de tempo. Em CPU pode ser percentual de tempo em execução, ou percentual utilizado perante ao alocado. Em memória pode ser o alocado perante ao provisionado, em disco pode ser busy time / throughput perante ao limite de IOPs, em rede pode ser bandwidth consumida perante ao total permitido, em pools pode ser conexões em uso perante ao limite do banco e afins. Utilization é um indicador de carga e tendência. Ele é útil para capacity planning, para detecção de regressão e para “contextualizar” saturação. 


### Saturation (Saturação)

A Saturação é o estado de superalocação de um recurso computacional como CPU, Memória, Thread Pools e Connection Pools. Geralmente é monitorado pela utilização percentual atual de um recurso alocado. Por exemplo, "quantos % das CPUs disponíveis estão sendo utilizada agora". Quando esse recurso começa a degradar por operar próximo da sua totalidade, ou em sua totalidade, entendemos que esse recurso está saturado. 

Em CPU, saturação pode aparecer como run queue (processos esperando CPU), como throttling de cgroup, e o comumente usado load average. Em memória, pode aparecer como swapping, Garbage Collector em excesso, alocação falhando e etc. Em disco, aparece como filas de I/O, iowait, latência de I/O, backlog de flush. Em rede, aparece como drops, retransmissões, filas no kernel e afins. 

### Errors (Erros)

Errors no USE são falhas diretamente associadas ao recurso monitorado. Em CPU, falhas por starvation, ou erros de scheduling. Em memória, OOMKills, allocation failures, crashes por falta de heap, evictions. Em disco, I/O errors, timeouts, corrupções, falhas de mount. Em rede, connection resets, TLS handshakes falhando por exaustão de recursos, packet loss, DNS failures. Em pools, “too many connections”, “thread pool exhausted”, “queue full”, “rate limit exceeded”. O valor desses erros é o sinal necessário para dizer que o recurso provisionado e alocado não está sendo suficiente para suportar a quantidade de trabalho. 


<br>

## RED Method

![RED](/assets/images/system-design/red-metrics.png)

O RED Method nasce da necessidade equivalente ao USE, mas para serviços e aplicações. Como vimos, o USE foi concebido para recursos e infraestrutura, enquanto microserviços pedem uma visão de métricas direcionadas para experiência e o comportamento do serviço em produção através de três dimensões básicas. O termo é associado a Tom Wilkie e Grafana  através de diversos artigos e apresentações técnicas direcionadas a instrumentação e e monitoramento de serviços, principalmente em sistemas distribuídos. 

O RED busca simplificar sinais vitais mais importantes para qualquer aplicações Web, sendo eles Rate, Errors e Duration. Em caso de duvidas do que monitorar, a base será isso. 


### Rate (Request Rate / Throughput)

O Rate representa a pressão de demanda sobre o serviço e a sua capacidade efetiva de processar demanda. Ele evidencia quantas transações estão chegando no sistema em um determinado agrupamento de tempo, com o "transações por segundo", "requests por minuto" e etc. Ele representa o quando do sistema está sendo requisitado pelos clientes. 

Essa métrica pode ser medida em um contexto global do sistema todo mas além disso deve ser medida de forma granular também a nível de endpoint e funcionalidade, como requisições por segundo por rota, por operação (GET/POST), por tenant, por região, por versão (canary vs stable) e etc. 

O request rate é a primeira métrica a ser monitorada, pois o aumento do rate de uma aplicação e funcionalidade pode acarretar em saturação e aumento proporcional de erros e filas internas caso não trabalhem com escalabilidade horizontal de forma responsiva. Ela também nos ajuda a identificar picos e tendências de uso do sistema, que podem ser insights valiosos para Capacity Planning e aplicar estratégias de autoscaling. 

### Errors (Error Rate)

Os Errors são diretamente ligadas ao Request Rate, pois tem o objetivo de demonstrar a porcentagem das requisições que estão chegando para o sistema estão falhando. A métrica tem o critério de medir falhas observáveis do ponto de vista do consumidor, mas ele só é útil se “erro” for definido de forma semântica. 

É comum que essa semantica considere apenas erros “HTTP 5xx”. Isso é insuficiente por dois motivos: primeiro porque 4xx pode representar degradação com base em desvios, como autenticação falhando por clock skew, validações quebradas por mudança de contrato, “429” por rate limit excessivo e etc. Em confiabilidade, erro é tudo aquilo que viola a expectativa de sucesso do consumidor: falha de autorização indevida, timeout, resposta inválida, inconsistência, idempotência quebrada, duplicidade, e até sucesso tardio quando o usuário já desistiu. 

Resumindo, todos os códigos de erro, sejam eles 4xx e 5xx devem ser monitorados e considerados, porém nem todos precisam ser considerados como SLO's, apenas observados a nível de serviço. 


### Duration (Request Duration / Latency)

Duration mede o tempo para completar uma operação do ponto de vista do consumidor. É o critério mais fácil de medir e o mais fácil de medir errado. O primeiro ponto de atenção, é o uso apenas da média da latência em sistemas complexos. A média pode ser deturpada quando estamos tendo problemas de tempos de resposta em uma distribuição de cauda longa, e as caudas são onde a experiência degrada, os timeouts disparam e o retry começa a amplificar carga. Duration precisa ser analisada em percentis (p50/p95/p99) e, idealmente, com histogramas para ver a forma da distribuição. Quando aplicados também a nível granular por métodos ou endpoints, podemos entender quais as funcionalidades que estão apresentando desvios de tempos de resposta para acelerar o troubleshotting e o tempo de recuperação. 

<br>

## Four Golden Signals

![Four Golden Signals](/assets/images/system-design/four-golden-signals.png)

Os Four Golden Signals são uma forma direcionada e simpliificada de descrever a saúde operacional de um sistema user-facing, evitando o caos de métricas infinitas. O conceito foi popularizado pela literatura do Google a respeito de Site Reliability Engineering e tem o objetivo de realizar uma recomendação explicita de quatro métricas principais, os Sinais de Ouro, ou Sinais Dourados. Esses quatro sinais tem o objetivo até mesmo de indicar métricas de SLO's de forma simples.

O objetivo é padronizar métricas em escopos pequenos, médios e grandes, evitando o fenômeno de “monitoramento por acúmulo”, em que times passam a colecionar uma quantidade muito grande de métricas e dashboards, mas sem um modelo mental coeso, e mesmo com grande quantidade de ferramental acabam incapazes de responder rapidamente à perguntas simples como “o sistema está saudável do ponto de vista do usuário?", "quais os sistemas degradados agora?" e etc. 

Os quatro sinais são Latency, Traffic, Errors e Saturation. 

### Latency

A Latência nos Four Golden Signals corresponde ao tempo que um sistema, transação ou funcionalidade leva pra responder uma requisição. No modelo, isso inclui tanto resposta bem-sucedidas quando respostas com erro, porque para uma experiência de usuário, "rápido e errado" ainda é um comportamento observável que tem muita importância, tanto quanto "lento e correto". 

A latência, assim como outras leituras de outros frameworks de mercado, também não deve considerar apenas a média, e precisam levar em consideração a leitura de percentís que podem dar visão a comportamentos escondidos de outliers, como p99, p95, p90, p50 e etc. 


### Traffic 

O Traffic, Trafego ou Throughput busca dar visibilidade na quantidade de solicitações que o sistema está recebendo dentro de um contexto de tempo, e pode ser ilustrado como Requisições por Segundo, Transações por Segundo, Queries por Segundo, Bytes, Mensagens e etc, ilustrando o "quanto de trabalho" está chegando ao sistema.  

Aqui o objetivo também é dar visibilidade para comportamentos causais, como quando o tráfego sobe, você precisa separar crescimento legítimo de uso do sistema das demandas de amplificação por mecanismos internos como retries, fanout, reprocessamento, loops, cache miss em massa, ou abuso indevido do serviço.

### Errors

Os Errors é a taxa de falhas percebidas perante ao Traffic. Na definição do livro do Google, erros podem aparecer como códigos de erros internos como 5xx, mas também como falhas explícitas de protocolo e falhas semânticas de resultado, dependendo do que faz sentido para o sistema. A principio também é necessáro monitorar erros do cliente 4xx para entender comportamentos e desvios. 


### Saturation

Saturation é um sinal de proximidade de esgotamento dos recursos provisionados para a aplicação. Responde o quanto o sistema está “no limite” de algum recurso crítico, e, principalmente, o quanto trabalho está acumulando porque o recurso não consegue acompanhar. Por exemplo, o quanto do nosso tráfego está se aproximando dos níveis de rate limit estabelecidos na API, o quanto do uso das CPU's da aplicação está proximo de um limite de risco e etc. 

<br>

# Service Levels

Os Service Levels são o principal framework de mercado para engenharia de confiabilidade. Tendo seu Inicio na Engenharia da Google, eles nos dão direcionamentos simples de como trasformar métricas técnicas em "estrelas guia" de produto que são capazes de serem interpretadas por diversos níveis de uma empresa. Na prática, eles viram a interface comum de linguagem entre engenharia e negócio, onde encontramos um comum acordo claro de  **qual é a experiência mínima aceitável**, **quais são as tolerâncias operacionais** e **qual é o custo de sustentar esse patamar desejado**.

Um sistema pode ter dashboards extramamente detalhadas e ainda assim operar no escuro, se não houver um referencial explícito de “normalidade” e “aceitável” para a jornada do usuário, e é exatamente esse vácuo que SLA, SLO, SLI e Error Budget preenchem em sistemas maduros.

## SLI - Service Level Indicator

O SLI, ou Service Level Indicator, é o indicador mensurável que materializa o SLA e o SLO. O SLI é o dado que será observado, como por exemplo Availability/Uptime, Latency, Throughput, Error Rate, Saturation, Recovery Time e etc e etc. Ele indica qual será a métrica observada em ambos os casos. A escolha e a maturidade de um SLI deve ser bem criteriosa e evolutiva junto aos times de engenharia e junto aos próprios SLO's e SLA's. Podem tanto ser métricas técnicas como as citadas como também métricas de negócio ou específicas de um produto, como por exemplo acurácia de um modelo, taxas de aprovação de transações, redução de fraudes e etc. 

## SLA - Service Level Agreement

O SLA, ou Service Level Agreement, é o indicador mais importante a nível do cliente. O SLA é um **compromisso contratual** de nível de serviço, normalmente formalizado com clientes, áreas internas ou parceiros. Esse compromisso atua na esfera contratual de um provedor de algum servico, seja interno ou externo. 

Quando contratamos algum serviço seja ele IaaS, SaaS ou PaaS, ele está inerente a um contrato de disponibilidade. Quando esse contrato é quebrado, podem existir consequencias juridicas ao prestador do serviço.  Por isso, SLA não é o lugar para “fidelidade técnica” e sim para **accountability**, ele tende a ser mais estável, mais conservador e menos granular, porque precisa ser mensurável, auditável e defendível. Ele está além de uma métrica do time técnico, que deve trabalhar com margens menores que o SLA como um objetivo operacional.  

Um SLA está inerente a tudo que permeia a operação do cliente final, pode ser considerado a partir de disponibilidade, tempo de resposta, tempo de recuperação de desastre e etc. Os SLA's podem ser definidos como "Ter 99.99% de uptime, 99.9% de disponibilidade nas requisições, responder uma transação de cartão de crédito em menos de 600ms, ter um data-loss de no máximo 2h em RPO, ter um tempo de recuperacão de falhas de até 1h" e etc.

Quando estabelecemos SLA's de disponibilidade, a definição dessa métrica nunca deve ser 100%, pois qualquer variação ou desvio pode comprometer o contrato. Ao invés disso, adicionamos "9's" ao mesmo, como por exemplo 99%, 99.9%, 99.99% e etc, mas nunca 100%. 

Os SLAs precisam ser declados e conhecidos por todas as camadas do produto, times técnicos, negócios, marketing e suporte, e deve ter um escopo claro, como disponibilidade mensal, disponibilidade anual, disponibilidade diária, tempos de resposta e etc. O SLA inclusive, pode ser granular a nível de serviço ou feature do sistema, medido de forma isolada em uma jornada, endpoint e etc. 


## SLO - Service Level Objective 

O SLO, Service Level Objective, é o seu “contrato interno” de confiabilidade. O SLO sim, é uma métrica inerente ao time técnico, o critério que o time de engenharia usa para operar, decidir e tomar riscos. 

Um SLO pode ser "responder em menos de 600ms em p99 e 500ms em p95. Garantir replicação de dados em 3 fatores. Ter uma média diária de error rate abaixo de 1% ou herdar diretamente os critérios do SLA. 

Caso os SLI's dos SLO's forem os mesmos do SLA, eles devem ser mais apertados que o SLA, pois o mesmo também considera uma blindagem técnica do contrato. Por exemplo, se o SLA estabelecido por contrato é de uma disponibilidade mensal de 99.9% com um tempo de resposta de p99 de 800ms, o SLO precisa ser mais apertado, considerando em exemplo 99.95% de disponibilidade e um p99 de 500ms. A longo prazo, o objetivo de um SLO deveria virar o SLA do produto, e apertar ainda mais os critérios do time técnico com objetivo de excelência operacional. 

## Error Budget

O Error Budget é o orçamento de erros a respeito de um contrato. Se o SLO define “quanto erro é aceitável”, o Error Budget define “quanto erro você ainda pode gastar antes de entrar em risco". Se nosso SLO é 99.95% de disponibilidade e nossos SLI's apontam para 99.98% de disponibilidade, isso significa que temos 00.03% de margem para erros dentro do sistema. 

O objetivo do error budget, além de mostrar o quanto de margem ainda temos para errar dentro das metas técnicas, funciona como um indicador de feedback loop dentro das releases de software. Quando o budget está saudável e possuem margens consideráveis, você pode acelerar mudanças e deploys em produção, ao inverso disso, quando o budget está sendo consumido e muito proximo de atingir o limite, você desacelera, prioriza correções, reduz blast radius e aumenta rigor de release e revisões. Se o budget estourou, você **congela releases não essenciais**, direciona capacidade para estabilidade e direciona war rooms de observabilidade e acompanhamento.


<br>

# Single Pane of Glass 

<br>

### Referências

[What is observability?](https://www.redhat.com/en/topics/devops/what-is-observability)

[What are SLOs, SLIs, and SLAs? ](https://newrelic.com/blog/observability/what-are-slos-slis-slas)

[Time, Clocks, and the Ordering of Events in a Distributed System](https://lamport.azurewebsites.net/pubs/time-clocks.pdf)

[Conceitos OpenTelemetry - Ezzio Moreira](https://dev.to/ezziomoreira/conceitos-opentelemetry-9k0)

[What is OpenTelemetry?](https://www.elastic.co/what-is/opentelemetry)

[Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)

[Service Level Objective](https://sre.google/sre-book/service-level-objectives/)

[Thinking Methodically about Performance](https://queue.acm.org/detail.cfm?id=2413037)

[4 SRE Golden Signals (What they are and why they matter) ](https://firehydrant.com/blog/4-sre-golden-signals-what-they-are-and-why-they-matter/)

[USE and RED Method](https://pagertree.com/learn/devops/what-is-observability/use-and-red-method)

[The RED Method: How to Instrument Your Services](https://grafana.com/blog/the-red-method-how-to-instrument-your-services/)

[Monitoring Methodologies: RED and USE ](https://thenewstack.io/monitoring-methodologies-red-and-use/)

[Monitoring and Observability With USE and RED](https://www.solarwinds.com/blog/monitoring-and-observability-with-use-and-red)

[SLOs: a guide to setting and benefiting from service level objectives](https://grafana.com/blog/slos-a-guide-to-setting-and-benefiting-from-service-level-objectives/)

[What Are Feedback Loops?](https://www.splunk.com/en_us/blog/learn/feedback-loops.html)

[SLI's, SLA's e SLO's :: Não sabe por onde começar com suas métricas? Comece por aqui! ](https://www.nanoshots.com.br/2019/12/sre-slo-slis-nao-sabe-por-onde-comecar.html)

[The RED Method: How to Instrument Your Services](https://grafana.com/blog/the-red-method-how-to-instrument-your-services/)