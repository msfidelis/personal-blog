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

Resiliência é um termo muito comum em arquitetura e engenharia de software que **refere-se à capacidade dos sistemas, processos e componentes de suportar uma ampla variedade de cenários de falhas e manter sua operação**, seja de forma total ou parcial. **Esse conceito está diretamente relacionado a diversas disciplinas e tópicos de engenharia**, sempre com o objetivo de elevar os níveis de eficiência e segurança operacional das funcionalidades das aplicações e das jornadas dos clientes.

A preocupação com resiliência é recorrente no dia a dia dos times de desenvolvimento e operações. A maneira mais simples de explicá-la, de forma resumida, é **propor que, quando algum serviço ou ponto específico do sistema falha, esse sistema teria mecanismos para contornar a situação e minimizar o impacto no funcionamento geral**.


## Resiliência e Disponibilidade

Embora os termos resiliência e disponibilidade sejam muito próximos e frequentemente caminhem juntos, **seus conceitos possuem diferenças fundamentais e não devem ser confundidos**. A disponibilidade pode ser descrita em dois cenários principais: o primeiro **mede quantas das solicitações enviadas para o sistema foram realmente processadas com sucesso**, enquanto o segundo **mede o tempo em que o sistema permaneceu indisponível em determinados períodos**.

A resiliência, por sua vez, **é o conjunto de estratégias que usamos para manter essa disponibilidade**.

Resumindo, **quanto mais robustos forem os mecanismos de resiliência, mais tolerante a falhas será o sistema, e, consequentemente, maior será sua disponibilidade para os usuários**.

Neste capítulo, abordaremos diversos cenários e mecanismos de resiliência e, **principalmente, revisitaremos vários outros padrões e conceitos já discutidos, agora com foco em garantir maior resiliência e disponibilidade**.


<br>

## Métricas de Resiliência e Disponibilidade

Uma grande variedade de métricas pode ser utilizada para avaliar a disponibilidade e resiliência de aplicações. Muitas delas já foram discutidas em capítulos anteriores, como em [Performance, Capacidade e Escalabilidade](/performance-capacidade-escalabilidade/).


### Métrica de Disponibilidade de Uso

A forma mais comum de medir a disponibilidade usando a quantidade de uso de uma API ou funcionalidade como parâmetro é calcular essa **disponibilidade usando como base a taxa de erros dos mesmos**. Isso basicamente consiste em **dividir dois contadores: um referente à quantidade de erros ocorridos dentro do período e outro representando a soma total das requisições** que ocorreram, independentemente do resultado (sucesso ou falha).

\begin{equation}
\text{Taxa de Erros} = \left( \frac{\text{Número de Erros}}{\text{Número Total de Tentativas ou Eventos}} \right) \times 100
\end{equation}

Por exemplo, em uma API monitorada, podemos observar que, dentro de 1 hora, houve um total de 1000 requisições, das quais 40 resultaram em erros causados pelo servidor. Dividimos o número de erros pelo total de requisições e multiplicamos por 100 para gerar uma porcentagem mais intuitiva. Nesse caso, a taxa de erros foi de 4% durante o período.

\begin{equation}
\text{Taxa de Erros} = \left( \frac{\text{40}}{\text{1000}} \right) \times 100
\end{equation}

\begin{equation}
\text{Taxa de Erros} = {\text{4%}}
\end{equation}

A partir da taxa de erros, a disponibilidade pode ser calculada subtraindo esse valor de 100%. Como no exemplo obtivemos 4% de erros, a disponibilidade da aplicação foi de 96%.

\begin{equation}
\text{Disponibilidade} = \left( \text{100} - {\text{Taxa de Erros}} \right)
\end{equation}

\begin{equation}
\text{Disponibilidade} = \left( \text{100} - {\text{4}} \right)
\end{equation}

\begin{equation}
\text{Disponibilidade} = {\text{96%}}
\end{equation}

Esse método **é utilizado para medir a disponibilidade com base no uso**. Ele é **especialmente adequado para indicar quantas chamadas resultaram em sucesso ou falha**. Essa é uma estratégia simples e faz sentido para sistemas com um modelo de uso inconstante ou muito variado, onde não é prático medir a disponibilidade baseada em tempo.


### Métrica de Disponibilidade de Uptime

O modelo mais tradicional para **medir a disponibilidade considera o tempo que o sistema permaneceu disponível**, conhecido como Uptime ou Tempo de Atividade. **O tempo de "indisponibilidade" pode ser total ou parcial**, dependendo da duração de um incidente. Assim, **se o sistema estiver sujeito a um alarme crítico ou incidente operacional, esse tempo até a resolução é desconsiderado no cálculo da disponibilidade**.

A equação para calcular o uptime, ou tempo de atividade, é simples: basta dividir o tempo operacional pelo tempo total de atividade esperado. O tempo operacional é calculado subtraindo o tempo total de atividade pela soma de todos os períodos de downtime, incidentes e afins.

\begin{equation}
\text{Tempo Operacional} = \left( \text{Tempo Total} - (\text{Incidente 1} + \text{Incidente 2} + \text{...}) \right)
\end{equation}

\begin{equation}
\text{Uptime} = \frac{\text{Tempo Operacional}}{\text{Tempo Total}} \times 100\%
\end{equation}

Por exemplo, suponha que em um mês, com uma média de 43.200 minutos, houve um total de 3 horas de downtime, correspondendo a 180 minutos. Subtraímos o tempo de downtime do tempo total do período para obter o `Tempo Operacional`, resultando em 43.020 minutos de atividade.

\begin{equation}
\text{Tempo Operacional} = \text{43.200} - \text{180}
\end{equation}

\begin{equation}
\text{Tempo Operacional} = \text{43.020}
\end{equation}

Sabendo o Tempo Operacional do sistema, dividimos esse valor pelo tempo total para obter a porcentagem de disponibilidade no período, resultando em 99,58% de Uptime.

\begin{equation}
\text{Uptime} = \frac{\text{Tempo Operacional}}{\text{Tempo Total}} \times 100\%
\end{equation}

\begin{equation}
\text{Uptime} = \frac{\text{43.020}}{\text{43.200}} \times 100\%
\end{equation}

\begin{equation}
\text{Uptime} = {\text{99,58\%}} 
\end{equation}

Essa é a abordagem mais **tradicional para metrificar a disponibilidade**, especialmente em sistemas onde não é viável medir diretamente pelo uso. Essa abordagem é comumente utilizada em Status Pages de sistemas abertos, serviços de data centers de clouds públicas e privadas, entre outros.

<br>

## Blast Radius

O Blast Radius é um **conceito originalmente bélico**, que **descreve, de forma estimativa, as zonas afetadas pelo impacto de uma explosão em uma determinada região**. Esse experimento propõe estimar, em mapas do mundo real, quais áreas dentro do raio de detonação de certos tipos de bombas seriam afetadas pelo fogo direto, deslocamento de ar, radiação térmica, entre outros fatores.

![Blast Radius](/assets/images/system-design/blast-radius.png)

Embora tenha origens militares e traga uma conotação contraditória, o conceito também é utilizado em discussões de arquitetura de sistemas e engenharia de confiabilidade para **estimar o impacto da falha de um componente em um sistema distribuído**. Esse termo é aplicado para **identificar pontos críticos e oportunidades de melhoria na resiliência**, e sugere, por meio de **exercícios de simulação de falhas** ou **"perguntas provocativas" em revisões arquiteturais**, a estimativa dos **impactos das falhas em pontos críticos do sistema**. A partir dessas estimativas, busca-se discutir como **minimizar os danos nesses cenários** através de fallbacks, aplicação de estratégias e implementação de padrões de resiliência, entre outros.

Os questionamentos utilizados para estimar esses danos podem vir na forma de **"Se o componente X parar, o que acontece?"**, avançando para **"Se este componente estiver em downtime, aquele outro continuará funcionando?"** e indo até perguntas como **"Se essa API cair, o que para de funcionar? O que continua funcionando parcialmente? O que permanece funcionando normalmente? Em quanto tempo me recupero se ela voltar? Gero inconsistências em alguma parte do meu processo?"**, evoluindo assim para uma variedade de cenários. O ponto que quero destacar é que **essas "perguntas provocativas" devem ser feitas sempre que possível**. É essencial criar um ambiente seguro e aberto para que esses questionamentos sejam feitos sem barreiras ou cerimônias. Considero essa prática uma das mais dinâmicas e eficientes para partir do zero a algo concreto em um review arquitetural de resiliência, e recomendo sua experimentação a todos.


<br>

# Estratégias e Patterns de Resiliência

A seguir, iremos catalogar não todas, mas as principais estratégias e padrões de implementação em engenharia que ajudam a contornar falhas e adicionar vários níveis de resiliência em diferentes cenários conhecidos. O objetivo é expandir nossa "caixa de ferramentas" com opções arquiteturais inteligentes e aplicáveis. Muitos desses conceitos já foram apresentados anteriormente, e a ideia é reaproveitá-los, agora com um foco em características de resiliência e disponibilidade. 

## Replicação de Serviços, Balanceamento de Carga e Healthchecks

A principal e mais simples estratégia de resiliência é revisitar os conceitos de [Distribuição e Balanceamento de Carga](/load-balancing/) e [Escalabilidade Horizontal](/performance-capacidade-escalabilidade/). Escalar e distribuir a carga é, talvez, a estratégia que mais **reflete resiliência e desempenho a curto prazo**. Mecanismos de balanceamento **devem operar em conjunto com mecanismos de autoscaling, para que seja possível adicionar e remover réplicas sob demanda** com a máxima segurança e resiliência, permitindo que as aplicações se adaptem a cargas variáveis.

As aplicações, independentemente de seu protocolo principal, **devem expor URLs de healthcheck que reflitam seu estado**, e, caso ocorra alguma falha ou mau funcionamento, essa URL deve indicar o status por meio de códigos de resposta que possam ser monitorados periodicamente.

Os **balanceadores também devem ser capazes de verificar essas URLs regularmente para liberar ou restringir o tráfego para as réplicas do pool**, de acordo com as respostas obtidas nos healthchecks. Ou seja, **se a réplica começar a responder com erros ou deixar de responder dentro do tempo limite, o balanceador deve identificar que essa réplica está inativa ou sem condições de receber tráfego**.

Os balanceadores são responsáveis por garantir o paralismo externo de requisições sincronas, afim de dispersar o tráfego das chamadas e garantir maior aproveitamento de recursos, aumentando assim a resiliência diminuindo a chance de falhas graves decorrentes de um único host do pool se ficar indisponível indisponível. 

<br>

## Idempotência

Idempotência é, talvez, **o passo mais importante para criar sistemas resilientes em ambientes distribuídos**. A implementação de padrões de idempotência **permite que várias outras estratégias possam ser implementadas com segurança**. Como abordado anteriormente, ao detalhar as possibilidades de [comunicação síncrona, como APIs REST](/padroes-de-comunicacao-sincronos/), o conceito deve ser aplicado e **funcionar bem independentemente do modelo e do protocolo utilizado**. O objetivo é **permitir que a mesma operação seja executada várias vezes, sempre produzindo o mesmo resultado, sem gerar consequências indesejadas, como duplicidades**.

Essa capacidade permite que, durante **falhas ocasionais de rede, falhas de réplicas, manutenções programadas ou intermitências inesperadas, a mesma solicitação possa ser repetida a qualquer momento** para sincronizar domínios, receber respostas que não foram retornadas, se recuperar de erros, entre outras situações.

### Chaves de Idempotência

O processo de idempotência precisa se **apoiar em dados específicos da requisição para garantir que a mesma não seja duplicada ou cause efeitos indesejados**. Normalmente, escolhem-se chaves de idempotência que **identifiquem a requisição, objetivo de domínio ou comando, permitindo verificar se a operação já foi realizada ou não**. Esse controle é conhecido como Chave de Idempotência.

![Idempotência Fluxo](/assets/images/system-design/patterns-idempotencia.png)

Vamos ilustrar um cenário com uma API de pagamentos, onde o cliente **realiza uma solicitação de cobrança através de diferentes métodos de pagamento**. Caso o cliente reenvie a solicitação devido a uma falha, seja no cliente ou no servidor, **a operação idempotente garante que o valor seja cobrado apenas uma vez**. Para identificar essa requisição, o cliente pode enviar, via headers ou parâmetros, uma chave de idempotência única que será verificada e armazenada antes de processar a solicitação. Essa chave pode ser gerada diretamente pelo cliente ou ser uma combinação de valores presentes na requisição.

Esse padrão permite que a mesma solicitação seja repetida várias vezes com segurança. Sem idempotência, o cliente poderia ser cobrado várias vezes, causando inconsistências e graves falhas financeiras no processo.

<br>

## Estratégias de Retry (Retentativas)

As estratégias de retry, ou retentativas, como o próprio nome indica, **referem-se ao ato de refazer a requisição diante de uma falha de dependência**. Assim como o balanceamento de carga, essa é uma estratégia simples, com benefícios no curto prazo. Existem alguns modelos e estratégias de retentativas, mas todas compartilham o princípio de ajudar a **superar indisponibilidades temporárias, falhas ocasionais e intermitências de dependências ou de rede**.

Independentemente da estratégia escolhida, os retries **devem ser implementados de forma criteriosa e responsável**, e é essencial que **os sistemas que recebem essas retentativas tenham uma consistência sólida com implementações inteligentes de idempotência**, permitindo repetir a requisição inúmeras vezes sem gerar efeitos adversos ou duplicidades.

### Retries Imediatos em Memória

Os **retries imediatos são executados em memória, geralmente na mesma thread da tentativa original**. Esse é o tipo mais simples de retentativa, que normalmente está **presente de forma configurável em diversos clientes de requisições HTTP ou de consumo de serviços e protocolos específicos**.

Imagine que sua aplicação dependa diretamente de outra aplicação, e ambas se comuniquem por meio de requisições gRPC. Suponha que, durante uma requisição entre as duas, ocorram intermitências de disponibilidade no endpoint do servidor. **Podemos implementar uma lógica de retentativa que define um número máximo de tentativas sequenciais, reenvia a requisição até que uma resposta válida seja obtida**.

![Retry Imediato](/assets/images/system-design/patterns-retry-imediato.png)

É **extremamente importante que esse número máximo de tentativas seja adequado ao cenário**, pois **tentativas excessivas podem até agravar um cenário de indisponibilidade da dependência**. Nos próximos tópicos, abordaremos algumas estratégias derivadas que ajudam a contornar esses cenários.

Essa é a estratégia mais simples de implementação de retentativas síncronas. Apesar de ter certas limitações, como estar em memória (e, caso o runtime seja finalizado, as tentativas não são completadas) ou ser executada de forma sequencial e imediata (o que pode gerar ou agravar gargalos de capacidade momentâneos), ainda assim, essa estratégia é extremamente útil e resolve a maioria dos casos.
 
<br>

### Retries Assíncronos

Uma das formas mais conhecidas e eficientes de implementar retentativas é por meio de processos assíncronos. Essa estratégia pode ser aplicada de várias formas e variações. A **comunicação assíncrona, por si só, já oferece naturalmente alguns níveis de resiliência ao permitir um desacoplamento facilitado**. Quando combinada com técnicas de retentativas, torna-se uma implementação poderosa e extensível.

Um exemplo é o uso de retentativas em cenários onde as **requisições começam de forma síncrona, mas são concluídas de forma assíncrona**. Nesse caso, o sistema pode trocar o status code definitivo esperado por um que indique processamento tardio, como substituir `201 Created` por `202 Accepted`. Isso **indica que a solicitação não foi concluída imediatamente, mas será processada e tentada novamente sem que o cliente precise aguardar**.

![Async](/assets/images/system-design/patterns-retries-async-semi-sync.png)

Quando possível, **essa estratégia é uma ótima alternativa de fallback para o fluxo principal**, permitindo **armazenar as requisições que falharam durante um período de indisponibilidade para serem completadas posteriormente**.

Outra estratégia mais simples é aplicada em **processos que são naturalmente assíncronos**, os quais **começam e terminam dentro de brokers de mensagens ou eventos**. Nesse caso, o **produtor da mensagem publica a mensagem contando com mecanismos de retentativas** e recebe sua **resposta após a conclusão do processamento do comando**.

![Async](/assets/images/system-design/patterns-retries-async.png)

Essa implementação pode **enfileirar a requisição em uma fila ou tópico de processamento**, que será consumido por um processo especializado em **realizar a retentativa e retomar o fluxo**. Normalmente, **brokers de mensagens já possuem mecanismos de retentativas para o consumo de mensagens**: caso não recebam um `ack` de confirmação do consumidor, a mensagem é colocada de volta na fila para ser consumida novamente. Isso torna essa abordagem um **mecanismo de retry muito poderoso, apesar de sua complexidade e dos componentes adicionais envolvidos**.


<br>

### Retries com Backoff Exponencial

Em vez de realizar retries consecutivos em intervalos regulares, seja de forma síncrona ou assíncrona, existe a **estratégia de backoff exponencial, ou exponencial backoff das retentativas**. Essa abordagem consiste em **aumentar o tempo de espera entre as tentativas de forma exponencial** (por exemplo, 1 segundo, 2 segundos, 4 segundos, 8 segundos, 16 segundos e assim por diante). Isso ajuda a **aliviar a pressão sobre o sistema em que a retentativa está sendo realizada e reduz o risco de sobrecarga, que pode ser agravada, ou até mesmo causada, pelo número elevado de retentativas**.

![Exponencial Backoff](/assets/images/system-design/patterns-exponencial-backoff.png)

Essa estratégia **pode ser implementada tanto de forma síncrona quanto assíncrona**. A implementação de uma lógica de backoff em clientes de comunicação entre serviços é simples e pode ser **extremamente valiosa em cenários de sistemas distribuídos**. Muitos brokers de mensagens oferecem estratégias nativas ou facilitam a implementação de consumo de mensagens com backoff exponencial. Essa é uma evolução direta das estratégias de retentativas e é altamente recomendada sempre que possível.

<br>

### Retries com Estratégias de Jitter

A estratégia de **jitter é uma alternativa avançada para retentativas com backoff exponencial**. A ideia do jitter é **introduzir intervalos de tempo aleatórios entre as retentativas, com o objetivo de dispersá-las e reduzir ainda mais o risco de gargalos e sobrecarga**. Esse método é especialmente útil em cenários com **alto volume de tráfego, onde uma grande quantidade de retentativas pode ser iniciada ao mesmo tempo** durante uma falha eventual.

Há várias estratégias de jitter que podem ser aplicadas. Uma abordagem completa e radical, por exemplo, **atribui a cada retentativa um valor de espera totalmente aleatório entre 0 e o tempo máximo definido para o backoff**. Também é possível configurar intervalos de jitter que **aumentam de forma incremental a cada retentativa**. Nesse modelo de implementação, a primeira tentativa de retry pode variar entre 0 e 4 segundos, a segunda varia entre 2 e 6 segundos, a terceira entre 6 e 10 segundos, e assim por diante.

![Jitter](/assets/images/system-design/patterns-retry-jitter.png)

Independentemente do modelo, o objetivo da estratégia de jitter é **dispersar o volume de retentativas** para evitar que elas agravem problemas que já estejam acontecendo.

<br>

## Circuit Breakers

O pattern de Circuit Breaker é uma estratégia de resiliência projetada para **proteger serviços e componentes de sobrecarga** e **evitar que problemas de indisponibilidade se agravem e provoquem falhas em cascata**.

A ilustração do Circuit Breaker é similar a um **disjuntor de energia**, onde ele **interrompe a comunicação ao "desarmar" o fluxo de chamadas para determinado serviço ou componente quando identifica uma sequência elevada de falhas**, prevenindo que problemas maiores aconteçam.

A implementação do Circuit Breaker normalmente utiliza três estados de comunicação: **fechado**, **aberto** e **semi-aberto**. O **estado inicial do circuito é fechado**, permitindo que **todas as requisições passem normalmente**. Nesse estado, o **circuito monitora continuamente as requisições e suas respostas**.

![Closed](/assets/images/system-design/circuit-closed-1.drawio.png)

Caso **certos limites configurados de timeout ou de erros sejam excedidos**, o circuito muda automaticamente para o estado **aberto**. Nesse estado, o **disjuntor "desarma" e todas as comunicações com o sistema ou dependência subsequente são bloqueadas** para evitar uma sobrecarga ainda maior no sistema em falha e para proteger o serviço, evitando um número excessivo de conexões abertas que poderiam esgotar seus recursos.

![Open](/assets/images/system-design/circuit-open-2.drawio.png)

O circuito **permanece aberto por um período configurado**, como um "tempo de resfriamento", para permitir que o **serviço tenha um tempo adequado para se recuperar**. Após esse período, o circuito passa para o estado **semi-aberto**, onde **um número limitado de requisições começa a ser direcionado de forma controlada**. Se as respostas forem positivas, o circuito retorna ao estado **fechado** e **o funcionamento normal é retomado**, permitindo o fluxo de comunicações com a dependência. Se as respostas ainda forem negativas, o circuito volta ao estado **aberto** e espera pelo próximo intervalo de checagem no estado semi-aberto.

![Half-Open](/assets/images/system-design/circuit-half-open-3.drawio.png)

Essa estratégia é fundamental para sistemas distribuídos, pois **ajuda a manter a estabilidade do sistema ao controlar o impacto de falhas temporárias** e impedir que uma dependência instável degrade ainda mais o desempenho ou a disponibilidade do serviço. Existem algumas opiniões contraditóras a respeito de circuit breakers em termos de resiliência. Algumas pessoas podem entender que os circuitos servem para *"dar erro mais rápido"*, porém podemos **implementar a checagem desses estados proativamente para acionar fallbacks diretamente sem lidar com exceptions** a todo momento para **enviar as solicitações para fluxos alternativos**. Isso faz com que seja possível **extender os circuit breakers para ativar fallbacks, e não apenas permitir ou negar a comunicação com a dependência principal**. Essa é uma estratégia avançada para esse pattern que pode complementar a solução arquitetural de forma impressionante. 

<br>

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

[Circuit Breaker](https://martinfowler.com/bliki/CircuitBreaker.html)

[Pattern: Circuit Breaker](https://microservices.io/patterns/reliability/circuit-breaker.html)