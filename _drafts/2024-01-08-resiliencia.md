---
layout: post
image: assets/images/system-design/resiliencia-cover.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Resiliência
---

{% include latex.html %}

Nesse capitulo iremos revisitar praticamente tudo que já foi visto, porém com algumas óticas adicionais. 

# Definindo Resiliência

Resiliência é um termo muito comum em arquitetura e engenharia de software que normalmente refere-se à capacidade dos sistemas, processos e componentes de suportar uma maior variedade de cenários de falhas e manter sua operação, seja de forma total ou parcial. Esse conceito fala diretamente com diversas outras disciplinas e tópicos de engenharia, sempre com o objetivo de incrementar níveis adicionais de eficiência e segurança operacional das funcionalidades das aplicações e das jornadas dos clientes.

A preocupação com resiliência é um cenário muito comum no dia a dia dos times de desenvolvimento e operações, e o modo mais fácil de explicá-la de forma resumida, é propôr que quando algum serviço ou ponto específico do sistema falha, esse mesmo sistema teria formas de contornar a situação e minimizar o impacto no funcionamento geral. 

## Resiliência e Disponibilidade

Embora os termos resiliência e disponibilidade sejam muito proximos e andem juntos na maior parte do tempo, seus conceitos são um pouco diferentes em natureza e não devem ser confundidos. A disponibilidade pode ser descrita em dois cenários principais, sendo o primeiro deles metrificando o quanto das solicitações enviadas para o sistema foram realmente processadas com sucesso e o segundo metrificando o tempo que esse sistema ficou indisponível durante certos períodos de tempo. 

A resiliência por sua vez, são o conglomerado de estratégias que usamos para manter essa disponibilidade. 

Resumindo, quanto maiores forem os mecanismos de resiliência, maior tolerante a falhas o sistema em si é, e por tabela maior sua disponibilidade perante ao uso dos clientes. 

Vamos abordar diversos cenários e mecanismos de resiliência durante esse capítulo, e principalmente revisitar diversos outros patterns e conceitos que já foram abordados, mas agora com foco em garantir maior resiliência e disponibilidade. 

<br>

## Métricas de Resiliência e Disponibilidade

Um número muito grande de métricas pode ser usado para avaliar a disponibilidade e resiliência de aplicações, muitas delas já apareceram por aqui em capítulos anteriores como [Performance, Capacidade e Escalabilidade](/performance-capacidade-escalabilidade/). 

### Métrica de Disponibilidade de Uso

A forma mais comum de se medir a disponibilidade usando como parâmetro o a quantidade de uso de uma API é medir a taxa de erros, que se consiste basicamente em dividir dois contadores, um referente a quantidade de erros que ocorreram dentro do período e outro a soma total das requisições que ocorreram independente do resultado, somando sucesso e falha. 

\begin{equation}
\text{Taxa de Erros} = \left( \frac{\text{Número de Erros}}{\text{Número Total de Tentativas ou Eventos}} \right) \times 100
\end{equation}

Um exemplo, em uma API monitorada, podemos ver que dentro de 1 hora, tivemos um total de 1000 requisições, e 40 delas foram executadas com erros de responsabilidade do servidor. Dividimos a quantidade de erros pelo total de requisições e multiplicamos por 100 para gerar uma porcentagem mais visual. Nesse caso, tivemos 4% de erros durante o período. 


\begin{equation}
\text{Taxa de Erros} = \left( \frac{\text{40}}{\text{1000}} \right) \times 100
\end{equation}

\begin{equation}
\text{Taxa de Erros} = {\text{4%}}
\end{equation}

A seguir, sabendo o Error Rate, a disponibilidade pode ser calculada subtraindo o resultado dos 100% de disponibilidade. Como no exemplo chegamos a 4% de erros durante o período, nossa disponibilidade da aplicação é de 96%. 

\begin{equation}
\text{Disponibilidade} = \left( \text{100}-{\text{Taxa de Erros}} \right)\
\end{equation}

\begin{equation}
\text{Disponibilidade} = \left( \text{100}-{\text{4}} \right)\
\end{equation}

\begin{equation}
\text{Disponibilidade} = {\text{96%}}
\end{equation}

Esse método é utilizado para medir a disponibilidade do uso. Isso quer dizer que ele é especialmente adequado para responder o quanto das chamadas corresponderam em sucesso e falha. Esse é uma estratégia simples que faz sentido para sistemas que tem um modelo de uso inconstante ou muito variada, onde não faz muito sendo fazer essa metrificação baseada em tempo. 


### Métrica de Disponibilidade de Uptime

O modelo mais tradicional de como a disponibilidade é medida leva em consideração o quanto tempo o sistema ficou disponível, esse modelo é conhecido como Uptime ou Tempo de Atividade. O tempo de "indisponibilidade" pode ser total ou parcial, ou durante a duração de um incidente. Baseado nisso, se o sistema em questão estiver a mercê de um alarme crítico ou incidente operacional, esse tempo até a resolução é desconsiderado do tempo de disponibilidade. 

A equação para metrificar o uptime, ou tempo de atividade, até simples. Basta dividir tempo operacional do tempo total de atividade esperado. O tempo operacional é calculado subtraindo do tempo total de atividade, a soma de todos os períodos de downtime, incidentes e afins. 

\begin{equation}
\text{Tempo Operacional} = \left( \text{Tempo Total} - (\text{Incidente 1}+{\text{Incidente 2}}+{\text{...}})\right)\
\end{equation}

\begin{equation}
\text{Uptime} = \frac{\text{Tempo Operacional}}{\text{Tempo Total}} \times 100\%
\end{equation}

Vamos propor um exemplo no qual durante o mês, que tem uma média de 43.200 minutos, tivemos uma soma total de 3 horas de downtime, correspondendo a 180 minutos. Podemos subtrair o tempo de downtime do tempo total do período observado para chegar no `Tempo Operacional`, chegando no total de 43.020 minutos de tempo de atividade. 

\begin{equation}
\text{Tempo Operacional} = \text{43.200} - \text{180}
\end{equation}

\begin{equation}
\text{Tempo Operacional} = \text{43.020}
\end{equation}

Sabendo o Tempo Operacional do meu sistema, dividimos ele pelo tempo total para chegar na porcentagem de disponibilidade do período, resultando em 99.58% de Uptime. 

\begin{equation}
\text{Uptime} = \frac{\text{Tempo Operacional}}{\text{Tempo Total}} \times 100\%
\end{equation}

\begin{equation}
\text{Uptime} = \frac{\text{43.020}}{\text{43.200}} \times 100\%
\end{equation}

\begin{equation}
\text{Uptime} = {\text{99.58%}} 
\end{equation}

Essa é a abordagem mais tradicional de metrificação de Disponibilidade, ainda mais em sistemas onde não é possível metrificar diretamente pelo uso. Essa abordagem é encontrada em Status Pages de sistemas abertos, serviços de datacenters de clouds públicas e privadas e afins. 

<br>

## Blast Radius

O Blast Radius é um **conceito inicialmente bélico**, que **descreve de forma estimativa as zonas afetadas pelo impacto de uma bomba hipotética em determinada região**. Esse experimento propõe estimar em mapas do mundo real, em caso de detonação de certos tipos de bombas conhecidas, quais zonas dentro do raio de detonacão seriam afetadas pelo fogo direto, quais serão afetadas pelo deslocamento de ar, radiação termica e etc. 

![Blast Radius](/assets/images/system-design/blast-radius.png)

Por mais que seja uma herança militar que carrega um certo peso contraditório, ele pode ser encontrado também em alguns debates de arquitetura de sistemas e engenharia de confiabilidade para **estimar o impacto da falha de algum componente de um sistema distribuído**. Esse termo é empregado para **identificar pontos de dor e oportunidades de melhoria de resiliência**, e propõe por meio de **exercícios de simulação de falhas** ou **perguntas "cretinas" em revisões arquiteturais**, estimar o tamanho dos **impactos das falhas de determinados pontos críticos do sistema**, e gerar discussões de como **minimizar as avarias desses cenários**, criando fallbacks, aplicando estratégias, implementando certos patterns de resiliência e etc. 

Os questionamentos utilizados para estimar esses danos podem vir em formas de **"Se o componente X parar, o que acontece?"**, caminhar para **"se esse cara aqui estiver em downtime, esse outro continua funcionando?"** e ir até **"se essa API cair, o que para de funcionar? O que continua funcionando parcialmente? O que continua normalmente? Em quanto tempo eu me recupero se ela voltar? Gero inconsistência em alguma parte do meu processo?"** e evoluir pra uma infinidade de cenários. O ponto que eu gostaria de ressaltar é que **as "perguntas cretinas" devem ser realizadas sempre que possível**, e deve ser criado um ambiente de discussão seguro e aberto pra que elas sejam feitas sem complexidades e cerimônias. Considero essa prática uma das mais dinâmicas e eficiêntes para sair do zero para alguma coisa em um review arquitetural de resiliência, e indico a experimentação para todos.

<br>

# Estratégias e Patterns de Resiliência

A seguir iremos catalogar, não todas, mas as principais estratégias e patterns de implementações de engenharia que nos ajudam a contornar falhas e adicionar vários níveis de resiliência em vários cenários conhecidos. O objetivo é aumentar nossas caixas de ferramentas com possibilidades arquiteturais inteligentes e aplicáveis. Muitas delas serão tópicos já revisitados anteriormente, a ideia é reaproveitar conceitos já apresentados e adicionar características 

## Replicação de Serviços, Balanceamento de Carga e Healthchecks

A principal e mais simples estratégia de resiliência é revisitar os conceitos de [Distribuição e Balancemento de Carga](/load-balancing/) e [Escalabilidade Horizontal](/performance-capacidade-escalabilidade/). Escalar e distribuir carga é talvez a estratégia que mais **reflita resiliência e performance a curto prazo**. Mecanismos de balanceamento **devem andar em conjunto com os mecanismos de autoscaling, para que seja possível adicionar e remover replicas sob demanda** com a maior segurança e resiliência possível, para que as aplicações consigam se adaptar a cargas variáveis. 

As aplicações independente do seu protocolo principal **devem expor URL's de healthcheck que reflitam o estado da mesma**, e caso alguma dependência ou mau funcionamento ocorra, essa URL deve refletir por meio do status code que consigam ser checados de tempos em tempos. 

Igualmente os **balanceadores devem ser capazes de checar essas URL's de tempos em tempos para liberar ou restringir o tráfego para essas replicas do pool** mediante a respostas saudáveis ou não das URL's de healthcheck. Isso é, **caso a replica comece a responder erros, ou até mesmo não responder dentro dos tempos limites de espera, o balanceador deve entender que a replica em questão está morta ou não está saudável para receber tráfego**. 

## Idempotencia

### Chaves de Idempotencia

<br>

## Estratégias de Retry (Retentativas)

As estratégias de retry, ou retentativas, como próprio nome diz, **refere-se ao ato de refazer a requisição mediante a uma falha de dependência**. Assim como balanceamento de carga, é uma estratégia simples e que tem seus benefícios a curto prazo. Existem alguns modelos e estratégias de retentativas, mas todas elas tem o principio de ajudar a **vencer adversidades referentes a indisponibilidades temporárias, falhas ocasionais e intermitência de dependências ou de rede**. 

Independente da estratégia escolhida, os retries **devem ser implementados de forma criteriosa e responsável**, e é inestimável que **os sistemas que estão recebendo essas retentativas tenham uma consistência sólida a implementações inteligentes de idempotencia**, para que seja possivel repetir o request inumeras vezes sem gerar efeitos adversos ou duplicidades. 

### Retries Imediatos em Memória

Os **retries imediatos são executados em memória e geralmente na mesma thread que a tentativa original**. Esse é o tipo mais simples de retentiva, que normalmente está **presente de forma configurável em diversos clients de requisições HTTP ou de consumo de serviços e protocolos específicos**. 

Imagine que sua aplicação tem uma dependência direta de outra aplicação e as mesmas se comuniquem por meio de requisições gRPC. Imagine que durante uma requisição entre as duas, temos algumas intermitências de disponibilidade no endpoint do server. **Podemos implementar uma lógica de retentativa que define um número máximo de tentativas sequenciais que reenvia requisição até que seja retornada uma resposta válida**. 

![Retry Imediato](/assets/images/system-design/patterns-retry-imediato.png)

É de **extrema importância que esse número maximo de requisições seja de fato algo viável para o cenário**, pois **tentativas muito longas pode até mesmo piorar um cenário de indisponibilidade da dependência**. Nos próximos tópicos iremos abordar algumas outras estratégias derivadas que nos ajudam a contornar também esses cenários. 

Essa é a estratégia mais simples de implementação de retentativas sincronas. Por mais que ainda possua certas limitações, como estar em memória e em caso da finalização do runtime as tentativas não sejam completadas em sua totalidade, ou **sejam feitas de forma sequencial e imediata podendo gerar, ou agravar gargalos de capacidade do momento**, ainda assim é de extremo valor e pode ajudar e resolver a maioria dos casos.
 
<br>

### Retries Assincronos

Uma das formas mais conhecidas e eficientes de implementação de retentativas são as efetuadas de forma assincrona. Essa estratégia ainda pode se encontrar em diversas variações. Por si só a **comunicação assincrona já oferece naturalmente alguns níveis de resiliência por permitirem um desacoplamento facilitado**, quando **aplicada junto a técnicas de retentativas, torna-se uma implementação poderosa e extensível**. 

Uma dessas formas são implementações em cenários de requisições que **começam sincronas, mas terminam de forma assincrona**, podendo trocar um status code definitivo esperado por um que remeta um processamento tardio, como por exemplo de `201 Created`  para `202 Accepted`, **indicando que a solicitação não foi concluída ainda de forma imediata, mas será retantada posteriormente sem necessidade de espera do cliente**. 

![Async](/assets/images/system-design/patterns-retries-async-semi-sync.png)

Quando é possível de ser implementada, **esse estratégia é uma ótima alternativa de fallback para o fluxo principal**, **podendo represar as requisições falharam durante um período de indisponibilidade para serem completadas com o tempo**. 

Outra estratégia muito mais simples, **são de processos que são naturalmente assincronos**, que **começam e terminam dentro de brokers de mensagens ou eventos**. Onde o **produtor dessa mensagem já faz essa publicação contanto que o processo já tem mecanismos de retentativas** e vai receber sua r**esposta mediante a conclusão do processamento do comando**. 

![Async](/assets/images/system-design/patterns-retries-async.png)

Essa implementação pode c**olocar essa requisição em uma fila ou tópico de processamento que serão consumidas por um processo especializado** em **realizar a retentativa e retormar o processo**. Normalmente **brokers de mensagens já possuem mecanismos de retentativas de consumo das mensagens** que caso não recebam um `ack` de acordo do consumidor, colocam a mensagem de volta para ser consumida mais uma vez, se tornando um **mecanismo de retry muito poderoso apesar das suas complexidades e componentes adicionais**. 

<br>

### Retries com Backoff Exponencial

Ao invés de realizar retries consecutivos em intervalos regulares, de forma sincrona ou assincrona, existe a **estratégia do backoff exponencial, ou exponencial backoff das retentativas**. A estratégia consiste em **aumentar o tempo de espera entre as retentativas de forma exponencial** (por exemplo, 1 segundo, 2 segundos, 4 segundos, 8 segundos, 16 segundos e assim por diante). Isso ajuda a **aliviar a pressão sobre o sistema no qual a retentativa está sendo feita e reduz o risco de sobrecarga que pode ser agravado, ou até causado pelo número alto de retentativas**. 

![Exponencial Backoff](/assets/images/system-design/patterns-exponencial-backoff.png)

Essa estratégia **pode acontecer tanto de forma sincrona quanto de forma assincrona**. Implementar uma lógica de backoff em clients de comunincação entre serviços é simples e pode ser **extremamente valiosa para cenários de sistemas distribuídos**. Muitos brokers de mensagens oferecem estratégias nativas ou já facilitadas para implementação de consumo de mensagens por meio de backoff exponencial. Essa é uma evolução direta de todas as estratégias de retentativas e é extremamente recomendada em todos os sentidos que as mesmas se fizerem possíveis. 

### Retries com Estratégias de Jitter

<br>

## Circuit Breakers

## Timeouts 

Define um tempo limite para operações, prevenindo que o sistema fique preso em chamadas de longa duração.

## Throttling

## Rate Limiting

### Idempotencia

## Padrões de Fallback

### Fallbacks Estáticos

### Fallbacks Dinâmicos

## Resiliência na Camadas de Dados

### Caching em Resiliência 

### CQRS em Resiliência

### Replicas de Leitura

## Bulkhead

## Lease Pattern

## Health Check

## Graceful Degradation

## Estratégias de Caching

## Read-Write Splitting

## Sharding - Não sei se vale um texto só pra isso 

## Event Sourcing - Não sei se vale um texto só pra isso 

## Queueing Theory-based Designs - Não sei se vale um texto só pra isso 



### Referências 

[Best practices for retry pattern](https://harish-bhattbhatt.medium.com/best-practices-for-retry-pattern-f29d47cd5117)

[Retrying and Exponential Backoff: Smart Strategies for Robust Software](https://www.pullrequest.com/blog/retrying-and-exponential-backoff-smart-strategies-for-robust-software/)

[Tempos limite, novas tentativas e retirada com jitter](https://aws.amazon.com/pt/builders-library/timeouts-retries-and-backoff-with-jitter/)

[Better Retries with Exponential Backoff and Jitter](https://www.baeldung.com/resilience4j-backoff-jitter)

[NukeMap](https://nuclearsecrecy.com/nukemap/)

[How To Minimize Your Cloud Breach Blast Radius](https://sonraisecurity.com/blog/how-to-determine-blast-radius/)

[Guidance for Cell-Based Architecture on AWS](https://aws.amazon.com/pt/solutions/guidance/cell-based-architecture-on-aws/?did=sl_card&trk=sl_card)

[Terraform Module Blast Radius: Methods for Resilient IaC in Platform Engineering](https://www.firefly.ai/blog/terraform-module-blast-radius-methods-for-resilient-iac-in-platform-engineering)