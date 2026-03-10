---
layout: post
image: assets/images/system-design/capa-confiabilidade.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering ]
title: System Design - Observabilidade e Monitoramento
---

Após elaborarmos diversos tópicos como [Performance, Capacidade, Escalabilidade](/performance-capacidade-escalabilidade/), [Métricas de Continuidade de Negócio](/single-point-of-failure) e diversos outros assuntos relacionados, esse capítulo tem o objetivo de fazer um "recap" de alguns conceitos de forma simplificada, dando o ponto de vista final de Observabilidade, Monitoramento e Confiabilidade. Nele vamos conceituar algumas pontas soltas referentes a Logs, Métricas, Traces, Alerting, APM e principalmente como utilizar a simplicidade de diversos frameworks de mercado como USE, RED e os Four Golden Signals alinhados a negócio para encontrar métricas comuns, de fácil entendimento e principalmente alinhadas entre times técnicos e de negócio. 

Aqui, vamos elucidar principalmente como os temas de Observabilidade, Monitoramento e Confiabilidade se correlacionam e se complementam entre si. Vamos entender cada um dos pilares da observabilidade e que tipo de entendimento estratégico precisamos ter sobre cada um deles. 

{% include latex.html %}

# Definindo Confiabilidade

**Confiabilidade** é a propriedade de um sistema **entregar comportamento correto ao longo do tempo**, sob condições esperadas e sob uma fração representativa de condições adversas. Confiabilidade vai muito além de uma aplicação “ficar de pé” e não é sinônimo direto de “alta disponibilidade”. Um sistema pode estar tecnicamente disponível e, ainda assim, ser pouco confiável se responde com dados errados, se degrada de forma caótica, se apresenta latência imprevisível ou se não consegue manter invariantes essenciais do domínio quando pressionado. 

Confiabilidade, portanto, agrega o conceito de continuidade de serviço, integridade e previsibilidade em termos operacionais. 

A utilidade dessa definição é que ela coloca confiabilidade no lugar certo: como uma **restrição arquitetural** e um **contrato operacional**, e não como um “atributo desejável”. A partir daqui, todos os termos que irão ser abordados neste capítulo, como SLIs/SLOs, error budget, Four Golden Signals, RED, USE e demais estratégias abordadas em outros capítulos, como estratégias de redundância, padrões de resiliência e práticas de incident response, passam a ser consequência de um objetivo de reduzir a probabilidade e o impacto de comportamentos incorretos, reduzir o tempo para detectar e recuperar, e limitar o blast radius quando algo inevitavelmente falhar. 

A confiabilidade, então, é um conjunto de práticas e disciplinas da engenharia e arquitetura de software que busca atingir níveis cada vez maiores e auditáveis de continuidade operacional.


<br>

# Observabilidade 

**Observabilidade** é a capacidade de inferir o estado interno de um sistema a partir de suas saídas externas. O termo tem origem na Teoria de Controle, da década de 1960, introduzida academicamente por Rudolf E. Kalman, através de publicações sobre a teoria de sistemas lineares. 

A Teoria do Controle é um ramo da engenharia e da matemática que estuda como modelar, analisar e regular o comportamento de sistemas dinâmicos para projetar sistemas complexos que se comportem de maneira estável ao longo do tempo, mesmo diante de perturbações externas ocasionais. Na teoria, um sistema é dito observável caso exista a capacidade de inferir o estado interno de um sistema apenas pelas suas saídas externas.

A observabilidade em sistemas de software depende de saídas, registros e métricas de desempenho para cumprir esse papel. Trata-se da capacidade de compreender o estado interno de um sistema complexo a partir dos eventos e sinais externos que ele emite. 

![Observability](/assets/images/system-design/observability.png)

Esses eventos e sinais podem ser traduzidos, inicialmente, nos três pilares da observabilidade, como logs, traces e métricas. O objetivo é entender comportamento, padrões e construir estruturas que sejam "interrogáveis" através de padrões e dimensões conhecidas e não conhecidas. Podemos presumir que: **uma vez que conseguimos correlacionar logs, traces e métricas para elaborar questionamentos complexos sobre o sistema, temos observabilidade.** E, ainda mais, **se podemos utilizar logs, traces e métricas para conduzir análises exploratórias, temos observabilidade**.  

Por mais que seja altamente dependente, a observabilidade é uma propriedade estrutural de um sistema, e não um conjunto de ferramentais. É altamente possível que empresas, produtos e estruturas inteiras disponham de ferramentais altamente complexos e caros e, mesmo assim, não possuam observabilidade em essência. 

À medida que nosso ferramental é utilizado para interpretar comportamento, e podemos utilizá-lo, tecnicamente e culturalmente, para entender comportamentos e padrões escondidos de forma histórica, temos observabilidade.


## Monitoramento e Observabilidade

**O monitoramento e a observabilidade** são conceitos que caminham juntos, de forma tão tênue que normalmente são confundidos e referenciados como se fossem a mesma coisa. Entender a diferença entre os dois pode ser de grande ajuda para elevar o nível de confiabilidade nos sistemas. Os dois conceitos não são excludentes, são complementares em essência. 

Monitoramento é a capacidade de coleta e análise de métricas pré-definidas, de contextos já vividos, para verificar o estado de um sistema a partir de dimensões já conhecidas. O monitoramento nos dá a capacidade de monitorar, verificar e alertar quando algo conhecido dá errado, por exemplo, aumento de erros em APIs específicas, saturação de recursos, locks em um banco de dados, aumentos no tempo de resposta e etc. 

Monitoramento se desenvolve normalmente por medidas quantitativas, como, por exemplo, porcentagem de uso de CPU, latência de rede, quantidade de dados de entrada e saída de rede, taxas de erro, espaço em disco e etc., e, com base nisso, configurar thresholds para disparar alertas quando algo sai de um padrão estabelecido.  

Observabilidade, por outro lado, é a capacidade de investigar fenômenos desconhecidos através da exploração de dados contextuais mais amplos, e entender o "por que" algo inesperado aconteceu. Deixamos de observar um estado **determinístico** como "minha API está lenta" e expandimos isso para **"por que essa API está lenta agora?"**, e conseguimos analisar todos os sinais de forma correlacionada para entender comportamento. 

Resumindo, monitoramento está diretamente ligado a identificar e alertar sobre problemas conhecidos, e a observabilidade está ligada a comportamento. Uma vez que sua observabilidade te possibilita encontrar padrões e investigar problemas não óbvios, essas novas dimensões descobertas podem ser utilizadas como insumos para gerar monitoramento. **Observabilidade é correlacionada a comportamento e exploração, monitoramento é acompanhamento.**

### Monitoramento como Detecção de Sintomas 

**Monitoramento** é, em essência, a disciplina de detectar sintomas conhecidos de degradação, falha ou risco operacional. Antes de qualquer coisa, só monitoramos o que é claro e conhecido. Ter clareza sobre esse conceito é muito importante para a diferenciação do mesmo. Ele parte do princípio de que já sabemos, com algum grau de clareza, **quais sinais merecem ser acompanhados e quais desvios dos mesmos representam uma ameaça à saúde do sistema**. O monitoramento trabalha com métricas, eventos e thresholds previamente definidos, observando comportamentos esperados e disparando alertas quando algo sai da normalidade conhecida.

Quando configuramos alertas para dimensões conhecidas, como o aumento de taxa de erro, aumento de latência, saturação de CPU e memória, filas ou tópicos acumulando mensagens e eventos, locks em banco de dados ou falha em health checks, estamos modelando sintomas de que algo pode estar errado. **Não estamos necessariamente explicando a causa do problema, mas detectando que algo não está de acordo.**

Monitoramento pode ter sinais padronizados dentro de uma organização, mas é de extrema importância entender que o mesmo é evolutivo e amadurece junto ao sistema e ao time de engenharia. Sintomas conhecidos dependem de conhecimento prévio. Monitoramos aquilo que já aprendemos a medir, aquilo que já sabemos que pode falhar, ou aquilo que já identificamos historicamente como importante, e revisitamos esses critérios sempre que algo estrutural muda.

### Observabilidade como Comportamento

Como vimos, o monitoramento está orientado a sintomas conhecidos. A observabilidade, por sua vez, está orientada a comportamento. Ela é a capacidade de explorar os sinais emitidos por um sistema de forma correlacionada para compreender como ele está se comportando internamente, mesmo quando o problema ainda não foi previamente modelado como uma condição de alerta. Enquanto o monitoramento pergunta **“algo conhecido saiu do normal?”**, a observabilidade permite perguntar **“o que está acontecendo dentro do sistema para que esse comportamento esteja acontecendo agora?”**.

Em sistemas distribuídos, **uma degradação pode nascer em um ponto e se manifestar em outro**. Uma causa pequena pode produzir um efeito grande, dependendo da carga, da topologia e das dependências envolvidas. A observabilidade nos ajuda a correlacionar logs, métricas e traces emitidos por vários serviços envolvidos em uma transação para encontrar a origem do comportamento com desvio. 

Por isso, **dizer que observabilidade está ligada a comportamento é dizer que ela se interessa menos por valores isolados e mais pela forma como o sistema reage ao longo do tempo**, sob diferentes condições.

<br>

# Três Pilares da Observabilidade

**A observabilidade é a correlação direta de três pilares principais**, sendo eles **Métricas, Logs e Traces**. Ambos possuem valor individual e seu contexto **sistêmico**, porém, quando somados e correlacionados, podemos **estender** esses sinais de forma isolada para uma visão de comportamento ampla de ambientes complexos. **Nesta seção, temos o objetivo de abordar cada um dos três e explorar seus agregados, como Alerting e APM.**

<br>

## Métricas

**Métricas** são aspectos quantitativos e estatísticos do software que têm o objetivo de medir comportamentos, desempenho e demais estados de um sistema ao longo do tempo. Métricas, por si só, têm características temporais e fornecem uma visão de tendências durante períodos do dia. Métricas podem operar tanto no nível técnico quanto no de negócio. Existem métricas técnicas como tempo de resposta, quantidade de sucessos, quantidade de erros, contadores de status code, métricas de status de circuit breakers abertos e fechados, acionamentos de fallbacks e etc. As métricas de negócio operam em um nível mais característico e **específico** da aplicação, e podem ser variações de quantidade de vendas, quantidade de pagamentos aceitos, pagamentos recusados, quantidade de transações autorizadas, negadas, quantidade de vezes de recusas por falta de saldo e demais validações. 

### Contadores 

![Counters](/assets/images/system-design/counters.png)

**Contadores** são valores que só aumentam (ou **resetam** para zero, como na reinicialização de um serviço). **É útil contar o número de eventos**, como requisições totais, erros, itens processados com sucesso, itens processados com erro, circuitos abertos e etc. Durante a coleta, esses valores podem ser agregados em linhas temporais para entender comportamentos de utilização e picos. 

### Gauges 

![Gauges](/assets/images/system-design/gauges.png)

Um gauge representa um valor numérico que pode aumentar ou diminuir. **É perfeito para medir valores pontuais**, como uso de CPU, memória em uso, número de conexões ativas, tempos de resposta e etc. Ao contrário dos contadores, os gauges representam registros de valores absolutos que podem variar durante o tempo. 

### Histogramas

![Gauges](/assets/images/system-design/histogram.png)

Os histogramas agregam observações (como durações de requisições ou tamanhos de resposta) e as agrupam em baldes (buckets) configuráveis. **Eles permitem calcular quantis e percentis** (ex.: "99% de todas as requisições foram concluídas em menos de 300ms") e etc. Eles nos ajudam a explorar agregações de métricas de forma mais complexa e aprofundada, analisando a dispersão dos dados através de várias dimensões, como média, mediana, percentis, desvio padrão e etc.

## Traces

Em ambientes distribuídos de microserviços, uma **única** transação pode passar por dezenas de serviços diferentes para ser considerada concluída. **Traces** têm o objetivo de capturar amostras de solicitações, detalhando as mesmas de fim a fim, catalogando todas as entradas e saídas de uma transação através de **múltiplos** componentes de um sistema distribuído. 

![trace](/assets/images/system-design/trace.png)

Eles mostram o **caminho** fim a fim da transação, incluindo tempos de **processamento**, latência, erros de chamada entre serviços e etc. Diferentemente dos logs, que são isolados, traces conectam eventos em uma narrativa coesa, revelando como diferentes partes do sistema interagem.

Traces são utilizados para entender erros e desvios de tempos de resposta de uma transação, e **facilitam** entender o "porquê" de um problema em contextos complexos. **Num trace fim a fim, podemos compreender o tempo de execução em nível de funções, métodos, queries de bancos de dados e clientes HTTP** de todas as aplicações que interagem durante o funcionamento de uma transação.

<br>

## Logs 

**Logs** são registros textuais de eventos que ocorrem em um sistema. São a saída do runtime que representam algo que ocorreu. Um log é um registro imutável, vindo da aplicação que o emitiu, de um evento discreto que ocorreu em um ponto específico no tempo dentro de uma aplicação ou sistema, e normalmente vem acompanhado de metadados e um timestamp para comparação e ordenação histórica, para ser correlacionado em uma linha do tempo, isoladamente ou com outras aplicações, quando estruturado.

Eles capturam informações detalhadas sobre ações, erros e estados em momentos específicos, mensagens de erro, dados da transação, informação dos payloads ou dados dos usuários. Em essência, logs funcionam como um diário detalhado do sistema, permitindo que exista uma **investigação funcional de problemas**, e, diferentemente dos traces, ele possui uma característica de troubleshooting funcional, onde nem todo "problema" do software é necessariamente um "erro" ou um "desvio". Ele nos ajuda a responder coisas como **"O que aconteceu com a transação xxx?"**, **"O que um usuário específico fez?"**, **"Qual foi o erro exato que causou a falha desta requisição?"**, **"Quais foram os parâmetros de uma função quando ela foi chamada e qual foi seu retorno?"**. 

### Níveis de Severidade

Quando tratamos os logs como "diário detalhado" do sistema, a classificação de severidade é o componente semântico que traduz um fluxo textual qualquer em um componente de telemetria "interrogável". Os níveis de severidade classificam os registros imutáveis de log em criticidade e contexto, que dizem “o que esse evento significa” e “o que alguém deve fazer a respeito”. Os níveis mais comuns (TRACE, DEBUG, INFO, WARN, ERROR e FATAL/CRITICAL) existem para representar intenções diferentes, não só a gravidade do ocorrido. Nesta sessão, iremos abordar os critérios de classificação claros de cada um deles. 

| Level            | Intenção                                                        |
|------------------|-----------------------------------------------------------------|
| TRACE            | Rastrear passos internos muito finos para investigação pontual  |
| DEBUG            | Explicar decisões internas e facilitar troubleshooting          |
| INFO             | Registrar fatos relevantes do fluxo e do domínio                |
| WARN             | Registrar um desvio recuperável                                 |
| ERROR            | Falha de operação                                               |
| FATAL / CRITICAL | Falha terminal em nível de runtime                              |

<br>

#### Nível TRACE

**TRACE** é o nível de microscopia. Ele existe para quando você precisa observar o caminho exato que o código percorreu, com granularidade alta e verbosa, tipicamente em investigações pontuais, como ordem de decisões internas, **branches** condicionais, parâmetros intermediários, transformações de payload, detalhes de serialização/deserialização e qualquer nuance que ajude a reproduzir um comportamento que não aparece em logs mais altos, podendo ir até à verbosidade do protocolo de uma comunicação. 

#### Nível DEBUG

O **DEBUG** trabalha em nível de diagnóstico. Ele fica abaixo do “contar a história” e acima do “registrar absolutamente tudo”. A intenção do DEBUG é explicar o porquê de uma decisão do sistema, dando visibilidade a variáveis e estados relevantes para troubleshooting, como escolhas de fallback, printar parâmetros que levaram uma regra de negócio a seguir por um caminho, identificação de dependências chamadas e seus tempos, composição de requests para serviços downstream, resultados de validações e checkpoints do fluxo que ajudam a localizar o ponto exato de divergência. Geralmente, é utilizado durante períodos de crise para tratar condicionais muito específicas que levam a desvios não tão **óbvios**, sendo muito útil para sistemas que possuem **múltiplos** fluxos e uma visão "não tão" **determinística** em nível de conhecimento do time técnico e de **múltiplas** condicionais internas. 

#### Nível INFO

O **INFO** trabalha em um aspecto narrativo da transação. Ele registra eventos relevantes do ponto de vista do sistema e do domínio, de modo que, quando você costura o fluxo por um correlationId, você consegue ler uma história. O objetivo do INFO é rastrear uma transação de forma consistente e cronológica, como quando uma requisição entrou, quem é a entidade forte dela, se uma operação foi aceita/recusada, se um estado mudou, quando **um** job iniciou e finalizou, quando e como um evento de domínio foi publicado, como e quando uma transação completou com todas as informações relevantes para tratar um `Correlation` em nível de um agregado forte. 

#### Nível WARN

O **WARN** é o nível do desvio com continuidade. É quando algo saiu do ideal, mas o sistema ainda conseguiu seguir adiante, como uma dependência que respondeu de forma mais lenta e um retry foi necessário, um fallback foi acionado, um circuito abriu por proteção, um timeout quase estourou, uma fila começou a crescer, uma validação marginal foi aceita por regra de tolerância, um cache miss inesperado elevou latência, uma operação precisou degradar para manter disponibilidade. **Um bom WARN é acionável, deve carregar contexto para permitir triagem** e pode ser utilizado para confiabilidade porque ele frequentemente aparece antes do incidente. 

#### Nível ERROR

O **ERROR** é falha de operação. Aqui, a execução não atingiu o resultado esperado do ponto de vista daquela transação. A requisição falhou e retornou erro, um critério de domínio foi violado e o comando foi rejeitado, uma dependência falhou sem compensação possível, uma transação abortou, uma transação no banco de dados não foi concluída, uma conexão não conseguiu ser fechada, uma mensagem não pôde ser processada e foi para DLQ, um dado essencial estava ausente, ou um estado ficou inconsistente a ponto de impedir continuidade.

Um ERROR precisa ser pensado como “log de triagem” e deve dizer o que falhou, por que falhou, junto com sua possível causa, onde falhou e em qual componente, e como correlacionar com o resto do fluxo, respeitando **Correlation IDs**. 

#### Nível FATAL

**FATAL** (ou CRITICAL, dependendo do ecossistema) é falha terminal, aquela que compromete a continuidade do processo ou do serviço. É quando o runtime não consegue seguir, o processo cai, o serviço não inicia, uma configuração essencial é inválida, um recurso crítico não está acessível na inicialização, ou uma condição irrecuperável foi atingida e a única resposta segura é encerrar. Como por exemplo um NullPointer crítico, uma dependência crítica que não pode ser acessada, falta de variáveis e parametrizações necessárias para iniciar a aplicação e etc. Logs FATAL são geralmente associados a operações de runtime, e impedem a aplicação de funcionar.

<br>

### Correlação de Logs 

A principal função dos logs está no seu nível de detalhes úteis. Uma métrica pode mostrar a quantidade de erros dentro de um período específico, porém um log tem o objetivo de mostrar os outputs da aplicação que indicam quais erros, exceções e em que cenários aqueles erros aconteceram. Em ambientes cada vez mais distribuídos, com **múltiplos** serviços dentro de uma mesma transação, podemos estabelecer padrões de campos que se repetem em todos os serviços pelos quais uma determinada transação passa, para que seja possível correlacionar os logs de diversas aplicações e gerar uma "história" de uma transação. 

![Log Correlation Search](/assets/images/system-design/log-correlation-search-min.png)

![Log Correlation Result](/assets/images/system-design/log-correlation-result.png)

**Os logs, para terem valor, precisam contar uma história**. Conceitualmente, **trabalhamos uma transação como um agregado, e as linhas de log como itens decorrentes desse agregado.** Quando bem estruturado, esse padrão nos permite, através de identificadores únicos como `trace_id`, `correlation_id`, `order_id`, correlacionar os logs de diversas fontes para explicar como uma determinada transação ocorreu, como o extrato de uma história. **Talvez esse seja o cenário onde os logs vão, de fato, gerar todo o seu potencial e justificar seus altos custos de ingestão, armazenamento e retenção.**

### Estruturação e Indexação de Logs

O maior desafio da ingestão de logs está em custo. Aplicações podem gerar gigabytes ou terabytes de logs por dia, tornando o armazenamento e a análise uma tarefa muito complicada. Podem conter uma variedade imensa de informações e valores únicos e despadronizados, como IDs de usuário, IDs de requisição, mensagens de erro detalhadas, stack traces gigantes, que são, sim, dados úteis, mas, quando trabalhamos por indexação utilizando os valores desses campos, podemos sofrer com alguns problemas relacionados a performance e custo. 

![Logs](/assets/images/system-design/log-json.png)

Logs de texto puro são difíceis de analisar em escala. Logs estruturados e padronizados, por exemplo, em JSON, permitem que ferramentas de agregação de logs realizem a indexação por campos específicos mais buscados, filtros e agregações de forma menos **custosa** computacionalmente e financeiramente. Podemos indexar a partir de **Correlation IDs**, IDs de conta, level de criticidade e afins. Ter um formato e campos padronizados pode ser, sim, um desafio em ambientes maiores, porém torna o pilar de logs altamente mais eficiente em custos de armazenamento, escala e busca.

<br>

## Agregados dos Pilares 

Além dos três pilares, temos dois outros termos que nos ajudam a agregar confiabilidade **aos** sistemas, sendo eles **alerting** e **APM**. 

### Alerting 

**Alerting**, ou alertas, são os mecanismos que transformam os números e dimensões já conhecidos de degradação de um sistema em sinais para intervenção humana. É a disciplina responsável por observar sinais emitidos por logs, métricas, traces ou agregados desses pilares e decidir quando uma condição saiu do campo da simples medição e foi para um campo onde será necessária uma intervenção. É uma forma de saber, de maneira automatizada, que um determinado comportamento do sistema atingiu um nível de risco, desvio ou impacto e que o mesmo merece reação humana ou automatizada.

Do ponto de vista de confiabilidade, o maior valor do alerting está em acelerar feedback loops sobre o comportamento do sistema. Quanto mais cedo um comportamento degradado é percebido pelo time de engenharia responsável, menor tende a ser o tempo de detecção, menor a chance de amplificação do dano para o cliente e maior a possibilidade de contenção do impacto antes de um impacto sistêmico maior para todo o ambiente. **Alertas bem definidos reduzem MTTD (Mean Time To Detect), ajudam a proteger o error budget, orientam war rooms e criam um senso de prioridade operacional.**

### APM 

**APM**, ou Application Performance Monitoring, é a camada de observabilidade voltada a compreender como uma aplicação se comporta durante a execução de trabalho útil, visando entender a experiência do cliente. Enquanto métricas de infraestrutura ajudam a enxergar o estado de recursos alocados, métricas de aplicação ajudam a entender o estado operacional de negócio e os traces ajudam a reconstruir o caminho de uma transação fim a fim, o APM organiza esses sinais ao redor da experiência da própria aplicação, destacando operações, endpoints, dependências, tempos de resposta, throughput, taxas de erro e fragmentos relevantes de execução para que seja possível observar a saúde do software com mais proximidade do uso real. 

O APM tenta responder perguntas como **"quais operações estão mais lentas agora"**, **"quais delas regrediram após uma mudança"**, **"quais endpoints concentram mais erro"**, **"quais dependências estão consumindo mais tempo da transação"**, **"onde estão os gargalos de latência"**, **"qual parte do fluxo ficou mais cara sob carga"** e **"quais jornadas estão sofrendo de forma mais perceptível"**. Ele busca agregar todos os sinais de observabilidade através de um guarda-chuva de experiência de uso.

<br>

# Service Levels

Os **Service Levels** são o principal framework de mercado para engenharia de confiabilidade. Tendo seu **início** na engenharia da Google, eles nos dão direcionamentos simples de como **transformar** métricas técnicas em "estrelas-guia" de produto que são capazes de serem interpretadas por diversos níveis de uma empresa. Na prática, eles viram a interface comum de linguagem entre engenharia e negócio, onde encontramos um comum acordo claro de **qual é a experiência mínima aceitável**, **quais são as tolerâncias operacionais** e **qual é o custo de sustentar esse patamar desejado**.

Um sistema pode ter dashboards **extremamente detalhados** e, ainda assim, operar no escuro, se não houver um referencial explícito de “normalidade” e “aceitável” para a jornada do usuário, e é exatamente esse vácuo que SLA, SLO, SLI e Error Budget preenchem em sistemas maduros.

## SLI - Service Level Indicator

O **SLI**, ou Service Level Indicator, é o indicador mensurável que materializa o SLA e o SLO. O SLI é o dado que será observado, como por exemplo Availability/Uptime, Latency, Throughput, Error Rate, Saturation, Recovery Time e etc. Ele indica qual será a métrica observada em ambos os casos. A escolha e a maturidade de um SLI devem ser bem criteriosas e evolutivas junto aos times de engenharia e junto aos próprios **SLOs** e **SLAs**. Podem tanto ser métricas técnicas como as citadas, como também métricas de negócio ou específicas de um produto, como por exemplo acurácia de um modelo, taxas de aprovação de transações, redução de fraudes e etc. 

## SLA - Service Level Agreement

O **SLA**, ou Service Level Agreement, é o indicador mais importante em nível do cliente. O SLA é um **compromisso contratual** de nível de serviço, normalmente formalizado com clientes, áreas internas ou parceiros. Esse compromisso atua na esfera contratual de um provedor de algum **serviço**, seja interno ou externo. 

Quando contratamos algum serviço, seja ele IaaS, SaaS ou PaaS, ele está inerente a um contrato de disponibilidade. Quando esse contrato é quebrado, podem existir **consequências jurídicas** ao prestador do serviço. Por isso, SLA não é o lugar para “fidelidade técnica”, e sim para **accountability**. Ele tende a ser mais estável, mais conservador e menos granular, porque precisa ser mensurável, auditável e defensável. Ele está além de uma métrica do time técnico, que deve trabalhar com margens menores que o SLA como um objetivo operacional.  

Um SLA está inerente a tudo que permeia a operação do cliente final. Pode ser considerado a partir de disponibilidade, tempo de resposta, tempo de recuperação de desastre e etc. Os **SLAs** podem ser definidos como "Ter 99.99% de uptime, 99.9% de disponibilidade nas requisições, responder uma transação de cartão de crédito em menos de 600ms, ter um data-loss de no máximo 2h em RPO, ter um tempo de **recuperação** de falhas de até 1h" e etc.

Quando estabelecemos **SLAs** de disponibilidade, a definição dessa métrica nunca deve ser 100%, pois qualquer variação ou desvio pode comprometer o contrato. Ao invés disso, adicionamos "9's" ao mesmo, como por exemplo 99%, 99.9%, 99.99% e etc., mas nunca 100%. 

Os **SLAs** precisam ser **declarados** e conhecidos por todas as camadas do produto, times técnicos, negócios, marketing e suporte, e devem ter um escopo claro, como disponibilidade mensal, disponibilidade anual, disponibilidade diária, tempos de resposta e etc. O SLA, inclusive, pode ser granular em nível de serviço ou feature do sistema, medido de forma isolada em uma jornada, endpoint e etc. 

## SLO - Service Level Objective 

O **SLO**, Service Level Objective, é o seu “contrato interno” de confiabilidade. O SLO, sim, é uma métrica inerente ao time técnico, o critério que o time de engenharia usa para operar, decidir e tomar riscos. 

Um SLO pode ser "responder em menos de 600ms em p99 e 500ms em p95", "garantir replicação de dados em 3 fatores", "ter uma média diária de error rate abaixo de 1%" ou herdar diretamente os critérios do SLA. 

Caso os **SLIs** dos **SLOs** forem os mesmos do SLA, eles devem ser mais apertados que o SLA, pois o mesmo também considera uma blindagem técnica do contrato. Por exemplo, se o SLA estabelecido por contrato é de uma disponibilidade mensal de 99.9%, com um tempo de resposta de p99 de 800ms, o SLO precisa ser mais apertado, considerando, em exemplo, 99.95% de disponibilidade e um p99 de 500ms. A longo prazo, o objetivo de um SLO deveria virar o SLA do produto, e apertar ainda mais os critérios do time técnico com objetivo de excelência operacional. 

## Error Budget

O **Error Budget** é o orçamento de erros a respeito de um contrato. Se o SLO define “quanto erro é aceitável”, o Error Budget define “quanto erro você ainda pode gastar antes de entrar em risco". Se nosso SLO é 99.95% de disponibilidade e nossos **SLIs** apontam para 99.98% de disponibilidade, isso significa que temos **0.03%** de margem para erros dentro do sistema. 

O objetivo do Error Budget, além de mostrar o quanto de margem ainda temos para errar dentro das metas técnicas, funciona como um indicador de feedback loop dentro das releases de software. Quando o budget está saudável e **possui** margens consideráveis, você pode acelerar mudanças e deploys em produção. Ao inverso disso, quando o budget está sendo consumido e muito **próximo** de atingir o limite, você desacelera, prioriza correções, reduz blast radius e aumenta rigor de release e revisões. Se o budget estourou, você **congela releases não essenciais**, direciona capacidade para estabilidade e direciona war rooms de observabilidade e acompanhamento.

<br>

# Frameworks de Mercado

Antes de entrar nos frameworks de mercado, vale estabelecer o porquê **de eles existirem** e qual problema real eles resolvem. Pois, a **princípio**, perante **vários** cases de uso complexos com **múltiplos** níveis de observabilidade e operação, em um primeiro momento, eles podem parecer bem simplistas. Mas não são. O objetivo dos frameworks de mercado é dar "estrelas-guia" simplificadas para os times de engenharia e produto. Dentro de produtos de tecnologia, a maior parte das discussões operacionais degrada por dois caminhos previsíveis: ou o time se afoga em centenas de métricas desconexas, sem conseguir distinguir sintoma de causa, ou se apega a uma ou duas métricas “fáceis”, como CPU média, 5xx, latência média, e toma decisões erradas com muita confiança. 

O objetivo de frameworks como Four Golden Signals, RED e USE é sugerir métricas simples e **facilmente entendíveis** que vão atuar como **bússolas** de navegação do sistema em produção. **Usá-los, de forma alguma, descaracteriza a necessidade de observar dimensões mais detalhadas, apenas simplifica o entendimento da saúde do serviço através de métricas direcionadas.**

<br>

## USE Method 

![USED](/assets/images/system-design/use-resources.png)

O **USE Method** surge no contexto de engenharia de performance de sistemas, popularizado e formalizado por Brendan Gregg no artigo "Thinking Methodically about Performance", como uma estratégia de checagem sistemática e padronizada da “saúde” de recursos físicos alocados. 

O objetivo do **Método USE** é dar visibilidade para cada recurso, como CPU, memória, disco, rede e outros recursos, como filas e pools, e observar os mesmos em três dimensões principais: Utilization, Saturation e Errors. Esses recursos podem ser tanto recursos alocados para aplicações dentro de containers ou servidores quanto recursos de suas dependências, como databases, caches, filas e etc.

Ele descreve o USE como um método para começar uma investigação de queda de performance de forma simples e objetiva, para monitorar sinais vitais e identificar gargalos sistêmicos com velocidade.

### Utilization (Utilização)

A **Utilization** é quanto do recurso está sendo consumido em um intervalo de tempo. Em CPU, pode ser percentual de tempo em execução, ou percentual utilizado perante o alocado. Em memória, pode ser o alocado perante o provisionado. Em disco, pode ser busy time / throughput perante o limite de IOPs. Em rede, pode ser bandwidth consumida perante o total permitido. Em pools, pode ser conexões em uso perante o limite do banco e afins. **Utilization é um indicador de carga e tendência.** Ele é útil para capacity planning, para detecção de regressão e para “contextualizar” saturação. 

### Saturation (Saturação)

A **Saturação** é o estado de superalocação de um recurso computacional, como CPU, memória, thread pools e connection pools. Geralmente, é monitorada pela utilização percentual atual de um recurso alocado. Por exemplo, "quantos % das CPUs disponíveis estão sendo utilizadas agora". Quando esse recurso começa a degradar por operar próximo da sua totalidade, ou em sua totalidade, entendemos que esse recurso está saturado. 

Em CPU, saturação pode aparecer como run queue (processos esperando CPU), como throttling de cgroup e o comumente usado load average. Em memória, pode aparecer como swapping, garbage collector em excesso, alocação falhando e etc. Em disco, aparece como filas de I/O, iowait, latência de I/O, backlog de flush. Em rede, aparece como drops, retransmissões, filas no kernel e afins. 

### Errors (Erros)

Os **Errors** no USE são falhas diretamente associadas ao recurso monitorado. Em CPU, falhas por starvation ou erros de scheduling. Em memória, OOMKills, allocation failures, crashes por falta de heap, evictions. Em disco, I/O errors, timeouts, corrupções, falhas de mount. Em rede, connection resets, TLS handshakes falhando por exaustão de recursos, packet loss, DNS failures. Em pools, “too many connections”, “thread pool exhausted”, “queue full”, “rate limit exceeded”. **O valor desses erros é o sinal necessário para dizer que o recurso provisionado e alocado não está sendo suficiente para suportar a quantidade de trabalho.**

<br>

## RED Method

![RED](/assets/images/system-design/red-metrics.png)

O **RED Method** nasce da necessidade equivalente ao USE, mas para serviços e aplicações. Como vimos, o USE foi concebido para recursos e infraestrutura, enquanto microserviços pedem uma visão de métricas direcionadas para experiência e comportamento do serviço em produção, através de três dimensões básicas. O termo é associado a Tom Wilkie e à Grafana, através de diversos artigos e apresentações técnicas direcionadas à instrumentação e ao monitoramento de serviços, principalmente em sistemas distribuídos. 

O RED busca simplificar os sinais vitais mais importantes para qualquer **aplicação Web**, sendo eles Rate, Errors e Duration. Em caso de **dúvidas** sobre o que monitorar, a base será isso. 

### Rate (Request Rate / Throughput)

O **Rate** representa a pressão de demanda sobre o serviço e a sua capacidade efetiva de processar demanda. Ele evidencia quantas transações estão chegando ao sistema em um determinado agrupamento de tempo, como "transações por segundo", "requests por minuto" e etc. Ele representa o quanto o sistema está sendo requisitado pelos clientes. 

Essa métrica pode ser medida em um contexto global do sistema todo, mas, além disso, deve ser medida de forma granular também em nível de endpoint e funcionalidade, como requisições por segundo por rota, por operação (GET/POST), por tenant, por região, por versão (canary vs stable) e etc. 

O request rate é a primeira métrica a ser monitorada, pois o aumento do rate de uma aplicação e funcionalidade pode acarretar saturação e aumento proporcional de erros e filas internas, caso **não trabalhe** com escalabilidade horizontal de forma responsiva. Ela também nos ajuda a identificar picos e tendências de uso do sistema, que podem ser insights valiosos para Capacity Planning e para aplicar estratégias de autoscaling. 

### Errors (Error Rate)

Os **Errors** são diretamente **ligados** ao Request Rate, pois **têm** o objetivo de demonstrar a porcentagem das requisições que estão chegando ao sistema e estão falhando. A métrica tem o critério de medir falhas observáveis do ponto de vista do consumidor, mas **só** é útil se “erro” for definido de forma semântica. 

É comum que essa **semântica** considere apenas erros “HTTP 5xx”. Isso é insuficiente por dois motivos: primeiro, porque 4xx pode representar degradação com base em desvios, como autenticação falhando por clock skew, validações quebradas por mudança de contrato, “429” por rate limit excessivo e etc. Em confiabilidade, erro é tudo aquilo que viola a expectativa de sucesso do consumidor: falha de autorização indevida, timeout, resposta inválida, inconsistência, idempotência quebrada, duplicidade, e até sucesso tardio, quando o usuário já desistiu. 

Resumindo, todos os códigos de erro, sejam eles 4xx **ou** 5xx, devem ser monitorados e considerados, porém nem todos precisam ser considerados como **SLOs**, apenas observados em nível de serviço. 

### Duration (Request Duration / Latency)

**Duration** mede o tempo para completar uma operação do ponto de vista do consumidor. É o critério mais fácil de medir e o mais fácil de medir errado. O primeiro ponto de atenção é o uso apenas da média da latência em sistemas complexos. A média pode ser deturpada quando estamos tendo problemas de tempos de resposta em uma distribuição de cauda longa, e as caudas são onde a experiência degrada, os timeouts disparam e o retry começa a amplificar carga. Duration precisa ser analisada em percentis (p50/p95/p99) e, idealmente, com histogramas para ver a forma da distribuição. Quando **aplicada** também em nível granular por métodos ou endpoints, podemos entender quais funcionalidades estão apresentando desvios de tempos de resposta para acelerar o **troubleshooting** e o tempo de recuperação.

<br>

## Four Golden Signals

![Four Golden Signals](/assets/images/system-design/four-golden-signals.png)

Os **Four Golden Signals** são uma forma direcionada e **simplificada** de descrever a saúde operacional de um sistema user-facing, evitando o caos de métricas infinitas. O conceito foi popularizado pela literatura do Google a respeito de Site Reliability Engineering e tem o objetivo de realizar uma recomendação **explícita** de quatro métricas principais, os Sinais de Ouro, ou Sinais Dourados. Esses quatro sinais têm o objetivo até mesmo de indicar métricas de **SLOs** de forma simples.

O objetivo é padronizar métricas em escopos pequenos, médios e grandes, evitando o fenômeno de “monitoramento por acúmulo”, em que times passam a colecionar uma quantidade muito grande de métricas e dashboards, mas sem um modelo mental coeso, e mesmo com grande quantidade de ferramental acabam incapazes de responder rapidamente a perguntas simples como **“o sistema está saudável do ponto de vista do usuário?”**, **“quais os sistemas degradados agora?”** e etc. 

Os quatro sinais são **Latency, Traffic, Errors e Saturation**. 

### Latency

A **Latência** nos Four Golden Signals corresponde ao tempo que um sistema, transação ou funcionalidade leva para responder a uma requisição. No modelo, isso inclui tanto **respostas** bem-sucedidas quanto respostas com erro, porque, para uma experiência de usuário, "rápido e errado" ainda é um comportamento observável que tem muita importância, tanto quanto "lento e correto". 

A latência, assim como outras leituras de outros frameworks de mercado, também não deve considerar apenas a média, e **precisa** levar em consideração a leitura de **percentis** que podem dar visão a comportamentos escondidos de outliers, como p99, p95, p90, p50 e etc. 

### Traffic 

O **Traffic**, Tráfego ou Throughput, busca dar visibilidade à quantidade de solicitações que o sistema está recebendo dentro de um contexto de tempo, e pode ser ilustrado como Requisições por Segundo, Transações por Segundo, Queries por Segundo, Bytes, Mensagens e etc., ilustrando o "quanto de trabalho" está chegando ao sistema.  

Aqui, o objetivo também é dar visibilidade para comportamentos causais, como quando o tráfego sobe, e você precisa separar crescimento legítimo de uso do sistema das demandas de amplificação por mecanismos internos como retries, fanout, reprocessamento, loops, cache miss em massa, ou abuso indevido do serviço.

### Errors

Os **Errors** são a taxa de falhas percebidas perante o Traffic. Na definição do livro do Google, erros podem aparecer como códigos de erros internos, como 5xx, mas também como falhas explícitas de protocolo e falhas semânticas de resultado, dependendo do que faz sentido para o sistema. A **princípio**, também é **necessário** monitorar erros do cliente 4xx para entender comportamentos e desvios. 

### Saturation

**Saturation** é um sinal de proximidade de esgotamento dos recursos provisionados para a aplicação. Responde o quanto o sistema está “no limite” de algum recurso crítico, e, principalmente, o quanto trabalho está acumulando porque o recurso não consegue acompanhar. Por exemplo, o quanto do nosso tráfego está se aproximando dos níveis de rate limit estabelecidos na API, o quanto do uso das **CPUs** da aplicação está **próximo** de um limite de risco e etc.


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