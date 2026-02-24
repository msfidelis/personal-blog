---
layout: post
image: assets/images/system-design/capa-confiabilidade.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering ]
title: System Design - Observabilidade e Monitoramento
---

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

Um valor que só aumenta (ou reseta para zero, como na reinicialização de um serviço). É útil para contar o número de eventos, como requisições totais, erros, itens processados.

### Gauges 

Representa um valor numérico que pode aumentar ou diminuir. É perfeito para medir valores pontuais, como uso de CPU, memória em uso, número de conexões ativas ou a temperatura atual.

### Histogramas

Amostra observações (como durações de requisições ou tamanhos de resposta) e as agrupa em baldes (buckets) configuráveis. Ele permite calcular quantis e percentis (ex: "99% de todas as requisições foram concluídas em menos de 300ms").

## Traces

Em ambientes distribuídos de microserviços, uma unica transação pode passar por dezenas de serviços diferentes para ser considerada concluída. Traces tem o objetivo de capturar amostras de solicitações detalhando as mesmas de fim a fim, catalogando todas as entradas e saídas de uma transação através de multiplos componentes de um sistema distribuído. Eles mostram o campinho fim a fim da transação, incluindo tempos de precessamento, latência, erros de chamada entre serviços e etc. Diferente dos logs, que são isolados, traces conectam eventos em uma narrativa coesa, revelando como diferentes partes do sistema interagem.

Traces são utilizados para entender erros e desvios de tempos de resposta de uma transação, e facilita entender o "porquê" de um problema em contextos complexos.. Num trace fim a fim podemos compreender o tempo de execução a nível de funções, métodos, queries de bancos de dados, clientes HTTP de todas as aplicações que interagem durante o funcionamento de uma transação. 


## Logs 

Logs são registros textuais de eventos que ocorrem em um sistema. São a saída do runtime que representam algo que ocorreu.  Um log é um registro imutável vindo da aplicação que o emitiu de um evento discreto que ocorreu em um ponto específico no tempo dentro de uma aplicação ou sistema, e normalmente vem acompanhado de metadados e um timestamp para comparação e ordenação histórica para ser correlacionado numa linha de tempo isoladamente ou com outras aplicações quando estruturado.

Eles capturam informações detalhadas sobre ações, erros e estados em momentos específicos, mensagens de erro, dados da transação, informação dos payloads ou dados do usuário usuários. Em essência, logs funcionam como um diário detalhado do sistema, permitindo que exita uma investigacão funcional de problemas, e diferente dos traces ele possui uma característica de troubleshooting funcional, onde nem todo "problema" do software é necessariamente um "erro" ou um "desvio". Ele nos ajuda a responder coisas como "O que aconteceu com a transação xxx?", "O que um usuário específico fez?", "Qual foi o erro exato que causou a falha desta requisição?", "Quais foram os parâmetros de uma função quando ela foi chamada e qual foi seu retorno?". 

### Níveis de Severidade

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

## RED Method

## USE Method 

<br>

# Service Levels

## SLA

## SLO

## SLI

## Error Budget

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