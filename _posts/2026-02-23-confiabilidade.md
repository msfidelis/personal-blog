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

## Disponibilidade, Durabilidade e Resiliência

## Confiabilidade e Feedback Loops

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

## Four Golden Signals

![Four Golden Signals](/assets/images/system-design/four-golden-signals.png)

## RED Method

![RED](/assets/images/system-design/red-metrics.png)

## USE Method 

![USED](/assets/images/system-design/use-resources.png)

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

# Modelagem de Telemetria

Observabilidade implica geração massiva de dados de telemetria, o que exige decisões arquiteturais sobre amostragem, retenção, cardinalidade e agregação.

## Modelagem de Transporte e Coleta (Push & Pull)

## Cardinalidade de Métricas

## Estruturação de Logs 

## Correlation ID's 

## Context Propagation

## Sampling (Head, Tail, Adaptative)


<br>

# Observabilidade em Arquiteturas Modernas

## Microservices 

## Event Driven Architectures

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

[4 SRE Golden Signals (What they are and why they matter) ](https://firehydrant.com/blog/4-sre-golden-signals-what-they-are-and-why-they-matter/)

[USE and RED Method](https://pagertree.com/learn/devops/what-is-observability/use-and-red-method)

[The RED Method: How to Instrument Your Services](https://grafana.com/blog/the-red-method-how-to-instrument-your-services/)

[Monitoring Methodologies: RED and USE ](https://thenewstack.io/monitoring-methodologies-red-and-use/)

[Monitoring and Observability With USE and RED](https://www.solarwinds.com/blog/monitoring-and-observability-with-use-and-red)

[SLOs: a guide to setting and benefiting from service level objectives](https://grafana.com/blog/slos-a-guide-to-setting-and-benefiting-from-service-level-objectives/)

[What Are Feedback Loops?](https://www.splunk.com/en_us/blog/learn/feedback-loops.html)

[SLI's, SLA's e SLO's :: Não sabe por onde começar com suas métricas? Comece por aqui! ](https://www.nanoshots.com.br/2019/12/sre-slo-slis-nao-sabe-por-onde-comecar.html)