---
layout: post
image: assets/images/system-design/capa-resiliencia.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Resiliência
---

{% include latex.html %}

Nesse capitulo iremos **revisitar praticamente tudo que já foi visto, e dar pequenos spoilers de capítulos que ainda vão vir, porém com algumas óticas adicionais**. A maioria, beirando **todos os tópicos já forma tratados em capítulos anteriores**. Então caso tenha sentido falta de uma maior profundidade conceitual, **recomendo fortemente voltar alguns passos atrás e ler sobre nos materiais**. 

Esse material talvez seja **um dos mais importantes dessa série**, porque além de tratar de um dos tópicos mais importantes de sistemas distribuídos, encaminha a minha proposta principal que é **entender conceitualmente algo, e conseguir remoldar esse algo para diferentes pontos de vista**. Veremos que por mais que, a partir dessa linha, **tudo que veremos será abordado com tons de resiliência, mas mesmo assim não irão perder em nada seus propósitos originais de implementação**. 

Essa talvez seja a lição mais valiosa pelo qual estou me esforçando para passar nesse livro. Um grande exercício para mim como escritor, e para você como leitor. 

<br>

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

Por exemplo, em uma API monitorada, podemos observar que, **dentro de 1 hora, houve um total de 1000 requisições**, das quais **40 resultaram em erros causados pelo servidor**. Dividimos o número de erros pelo total de requisições e multiplicamos por 100 para gerar uma porcentagem mais intuitiva. Nesse caso, a taxa de erros foi de 4% durante o período.

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

A equação para calcular o uptime, ou tempo de atividade, é simples: **basta dividir o tempo operacional pelo tempo total de atividade esperado**. O tempo operacional é calculado subtraindo o tempo total de atividade pela soma de todos os períodos de downtime, incidentes e afins.

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
\text{Uptime} = {\text{99,58%}} 
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

![Healthcheck](/assets/images/system-design/healthcheck.drawio.png)

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

## Timeouts 

Timeouts **definem um tempo limite para certas operações**, atuando como um **método preventivo para evitar que o sistema fique preso em chamadas de longa duração**. Eles podem **interromper operações tanto do lado do cliente quanto do servidor**. Os timeouts **permitem que os sistemas interpretem e contornem erros de forma rápida e dinâmica**, impedindo que, durante uma falha relacionada à performance de dependências, **várias conexões permaneçam abertas e fiquem em espera, o que poderia levar o sistema a falhas em cascata devido à sobrecarga de capacidade**.

Ao arquitetar sistemas resilientes a falhas, **é ideal que sejam performáticos, consigam lidar com erros de forma eficiente e acionem mecanismos de fallback o mais rapidamente possível** em caso de falhas. Quando configurados de forma inteligente e adequada ao ambiente, os timeouts tornam tudo isso possível, sendo geralmente aplicados por meio de parametrizações simples em bibliotecas e componentes.

Um exemplo importante é o Connection Timeout, que define o tempo limite para estabelecer uma conexão entre cliente e servidor, independentemente do protocolo. Esse timeout é utilizado para **evitar que o cliente fique indefinidamente aguardando por uma conexão que pode nunca se estabelecer**. Esse problema é comum ao tentar conexões TCP com bancos de dados sobrecarregados ou indisponíveis, ou com servidores HTTP degradados, por exemplo.

Outro timeout comum é o Read e o Write Timeout, que define limites de espera para receber ou enviar dados a um serviço específico. Esse timeout ocorre quando a conexão é estabelecida com sucesso, mas o sistema **encontra um tempo de espera excessivo para obter uma resposta** de alguma operação solicitada.

Além disso, há o Idle Timeout, que define o tempo máximo que uma conexão pode permanecer aberta, mas ociosa. Esse timeout é útil para **evitar que conexões previamente estabelecidas por clientes que mantêm conexões de longa duração ocupem recursos do sistema sem necessidade**, liberando essas conexões quando inativas.

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

## Throttling e Rate Limiting

Os conceitos de throttling e rate limiting são técnicas discutidas em maior profundidade no [Capítulo de API Gateways](/api-gateway/). Quando aplicados sob a ótica da resiliência, ambos **podem ser usados para controlar o fluxo de requisições e o uso de recursos em um sistema**, seja em API Gateways ou em outros componentes. O objetivo é **evitar sobrecarga e garantir que a infraestrutura suporte as requisições sem comprometer o desempenho geral**.

O **rate limiting define um número máximo de requisições permitidas em um intervalo de tempo específico**, como **100 requisições por minuto, 10 transações por segundo, ou 1 milhão de transações por mês**. Quando o cliente ultrapassa esse limite, as operações de throttling entram em ação, e **as requisições adicionais são rejeitadas ou atrasadas, com uma resposta indicando que o limite foi atingido**.

Essas técnicas **podem ser aplicadas individualmente ou em conjunto para garantir que os limites conhecidos dos sistemas não sejam ultrapassados**, evitando problemas maiores. Uma boa implementação desses patterns **exige que os times de engenharia compreendam bem os pontos de limitação dos sistemas envolvidos**. Normalmente, esses limites são definidos com base em estudos práticos e [testes de carga e estresse](/load-testing/).

<br>

## Padrões de Fallback

Os fallbacks são **padrões de resiliência diversificados** que buscam permitir que, em cenários de falha, as aplicações consigam continuar operando, seja de forma completa, parcial ou degradada. A ideia dos fallbacks é **fornecer fluxos alternativos para atingir o mesmo resultado**, ainda que esses processos alternativos **sacrifiquem alguns níveis de desempenho, tempo de processamento, consistência, custo ou funcionalidades**.

Praticamente todos os conceitos discutidos neste capítulo podem ser utilizados para acionar ou atuar como fallback. Abaixo, apresentamos alguns cenários ilustrativos para mostrar possibilidades, mas é importante não se limitar a esses exemplos na criação de fluxos de fallback.

### Exemplo: Fallback Sistêmico de Redundância

Os fallbacks sistêmicos são o tipo "comum" de fallback. Essencialmente, **criar um fallback sistêmico consiste em acionar um fluxo secundário de forma pragmática quando o fluxo principal falha**.

Para ilustrar esse conceito, vamos examinar um cenário simples de fallback em um sistema de pagamento. Imagine um e-commerce que se conecta a gateways de pagamento para processar compras. Temos sempre uma opção primária de gateway, mas, **para adicionar mais resiliência, mantemos um segundo gateway pronto para ser acionado em caso de falha do principal**. Em situações de downtime ocasional ou programado do primeiro gateway, podemos redirecionar os pagamentos para o segundo até que o principal seja restabelecido.

![Fallback Gateway Pagamento](/assets/images/system-design/fallback-pagamentos-simples.png)

Embora simples, **esse exemplo ilustra bem o funcionamento de um mecanismo de fallback**. Com essa compreensão, o restante deste capítulo será como um "lego", onde as diversas combinações possibilitam construir soluções de alta disponibilidade de forma instigante e eficaz.


### Exemplo: Fallback com Snapshot de Dados

Teremos um tópico específico para explorar estratégias de fallbacks na camada de dados neste capítulo, mas para ilustrar o conceito, vamos imaginar um cenário onde é necessário consultar um dado próximo de tempo real, como o limite de crédito de um cartão fornecido por uma instituição financeira. Tanto as operações de saldo quanto as de crédito precisam estar sempre atualizadas para evitar permitir compras sem saldo suficiente em débito ou aprovar compras em crédito sem limites. Diante de falhas, a instituição pode decidir entre aprovar compras com o risco de alguma negativação pontual ou bloquear todas as transações até que o serviço seja restabelecido.

Para fins de ilustração, abordaremos a solução para o primeiro cenário, onde, **diante da indisponibilidade do dado "quente", podemos usar snapshots atualizados periodicamente em cache ou em uma base de dados mais acessível que permita verificações básicas**.

![Fallback Snapshot](/assets/images/system-design/fallback-snapshot.png)

Se nossa aplicação utiliza [databases transacionais](/teorema-cap/) e o serviço estiver indisponível, podemos **criar uma camada de snapshot que é atualizada periodicamente e realizar checagens mais simples**, **sacrificando a consistência forte por uma consistência eventual**, mas ainda assim evitando que compras ultrapassem -muito- os limites durante o período de indisponibilidade. Nesse cenário, **aceitamos um risco calculado de aprovar algumas transações além do permitido em troca de manter o sistema operacional**.


### Exemplo: Fallback com Fluxos Assíncronos

Um fallback pode também incluir uma **alternativa de mensageria para fluxos que normalmente requerem uma resposta imediata**, substituindo **consistência forte por consistência eventual em caso de falha ou indisponibilidade temporária**. Esse tipo de fallback é **muito útil em cenários onde a confirmação imediata das operações é importante, mas há alguma flexibilidade para aceitar atrasos temporários**. A ideia central é ter a capacidade de tornar fluxos síncronos em assíncronos quando necessário.

![Fallback Async](/assets/images/system-design/fallback-pagamentos-async.png)
> Fallback Sync/Async

Por exemplo, **considere uma API interna que ativa vários tipos de serviços de notificação, como envio de e-mails aos clientes**. Embora as notificações devam, na maior parte do tempo, **ser executadas de forma sequencial, atrasos ocasionais não representam um problema significativo quando ocorrem temporariamente**. Em caso de falhas de componentes, como bancos de dados ou servidores SMTP, em vez de retornar um erro para o cliente da API, **o fluxo secundário é ativado, enviando a solicitação de e-mail para uma fila de mensageria**. Essa mensagem será **reprocessada diversas vezes até que o serviço seja completamente restabelecido**, permitindo que as **operações sejam concluídas assim que a disponibilidade for retomada**.

### Exemplo: Fallback Contratual

Imagine que, em sua solução hipotética, você tenha um sistema parceiro que oferece serviços de consulta de endereço ou CEP, calculando diversas opções de frete e estimativas de entrega com várias transportadoras. Este parceiro cobra R$ 0,03 por consulta e oferece um preço diferenciado por contrato, sendo a sua primeira opção devido ao melhor custo-benefício e desempenho. No entanto, v**ocê possui um segundo parceiro que fornece as mesmas funcionalidades**, mas com algumas limitações e a um custo mais elevado, cerca de R$ 0,10 por consulta.

![Fallback Contratual](/assets/images/system-design/fallback-contratual.png)

Esse segundo parceiro, **embora não seja a opção mais viável financeiramente**, representa um **fallback contratual válido**. Em caso de **falha no sistema principal, a integração pode ser redirecionada temporariamente para essa segunda opção**. Ainda que seja uma alternativa mais cara, ela garante que o serviço continue disponível até que a funcionalidade principal seja restabelecida.

<br>

### Acionamento de Fallback Proativo

A estratégia de acionar um fallback de forma reativa, em resposta a erros e indisponibilidades, já é bastante valiosa para sistemas que precisam ser tolerantes a falhas. No entanto, **podemos dar um passo adiante para garantir que a qualidade e a estabilidade do próprio fallback sejam validadas regularmente**, e não apenas durante cenários adversos no fluxo principal.

![Fallback Proativo](/assets/images/system-design/fallback-proativo.png)

Não é incomum que **fallbacks acionados com pouca frequência também se tornem pontos de falha quando ativados de forma repentina**. Para mitigar esse risco, podemos **acionar proativamente os fluxos alternativos, direcionando uma porcentagem mínima de tráfego para eles** — seja por meio de injeção de falhas, seja intencionalmente, conforme definido pelo próprio algoritmo. Dessa forma, **garantimos que nossos fallbacks estejam saudáveis e prontos para funcionar quando necessário**.
 
<br>

## Graceful Degradation

Graceful Degradation refere-se à **capacidade de um sistema de continuar operando com funcionalidades essenciais de forma preventiva**, mesmo quando partes significativas do sistema estejam degradadas, sob alta carga ou indisponíveis. Embora esse conceito esteja diretamente relacionado ao de Fallback, **o Graceful Degradation pode ser ativado de forma pragmática ou por meio de toggles**.

Em outras palavras, diante de um pico de tráfego, **o sistema consegue priorizar suas funcionalidades principais, desativando as demais e operando apenas com o necessário**. Isso pode ocorrer automaticamente ou ser ativado manualmente para ajudar a lidar com sobrecarga ou outras adversidades.

Diferentemente dos fallbacks, que permitem que o sistema opere parcialmente em condições adversas mediante falhas já ocorridas, **o conceito de Graceful Degradation permite acioná-lo de forma preventiva e intencional**. Isso ocorre quando o sistema detecta, por si só, condições adversas, como falhas em um serviço externo com acoplamento forte, um microserviço crítico, sobrecarga de tráfego ou falhas de componentes essenciais, e **reduz automaticamente sua funcionalidade para um nível que ainda permita uma operação mínima e apenas com os fluxos prioritários**.

![Graceful](/assets/images/system-design/graceful.drawio.png)

Para ilustrar, considere um sistema que funciona como um gateway de pagamento, oferecendo opções de **crédito, débito, boletos, PIX e uma funcionalidade de consulta**. Embora todas as opções sejam importantes, o time de negócios define que **as opções prioritárias são sempre PIX e crédito**, pois representam o maior volume de uso dos clientes. Com estratégias de Graceful Degradation, em momentos de alta demanda, as opções de boleto, débito e consultas **podem ser temporariamente desativadas, permitindo que o sistema direcione mais recursos para os métodos de pagamento de maior prioridade**.

<br>

## Resiliência na Camada de Dados

Quando falamos de dados, **estamos lidando com a camada mais complexa de escalar e desenvolver mecanismos de tolerância a falhas**. Projetar **estratégias que garantam resiliência na camada de dados torna a aplicação dos outros patterns consideravelmente mais simples**. Nesta seção, assim como nas demais, vamos compilar muitos cenários já abordados anteriormente, pois esse assunto tem sido talvez o maior foco de estudo deste livro.

### Read-Write Splitting

Realizar o Read-Write Splitting, ou seja, **segregar as operações de escrita e leitura em instâncias diferentes de bancos de dados** oferece, além de um ganho significativo de performance, alguns mecanismos ocasionais de fallback.

![Replicas](/assets/images/system-design/db-read-replicas.drawio.png)

O conceito de utilizar [réplicas de leitura]() é amplamente adotado na indústria de desenvolvimento de software. **O impacto direto dessa prática está na performance**, pois permite que **as operações de escrita sejam realizadas em uma instância** enquanto **as consultas, relatórios e acessos a dados básicos são direcionados para uma infraestrutura segregada, distribuindo o gargalo de I/O**.

![Horizontal](/assets/images/system-design/db-scale-balancers.drawio.png)

Esse tipo de arquitetura, especialmente em clouds públicas, permite **[escalar horizontalmente](/performance-capacidade-escalabilidade/) o número de réplicas de leitura** para atender demandas específicas ou para facilitar a recuperação em caso de falha de alguma delas. O mecanismo de **fallback entre réplicas de leitura é amplamente conhecido e implementado**, diferentemente das instâncias responsáveis por escrita, que geralmente são pontos únicos de contato para inserções e atualizações de dados.

![Promote](/assets/images/system-design/db-scale-promote.drawio.png)

Um recurso interessante de fallback é que **é possível promover réplicas de leitura para instâncias principais de escrita em muitas implementações**. Em caso de falha da instância principal que recebe os comandos de escrita, alguma réplica de leitura, ou uma instância de stand-by, pode ser automaticamente promovida ao endpoint principal. Essa prática é altamente recomendada em arquiteturas resilientes e representa um importante passo para aumentar a tolerância a falhas na camada de dados.


### Caching de Dados como Resiliência

Os padrões de caching são muito versáteis e podem ser empregados para gerar uma ampla gama de benefícios para arquiteturas de solução. Estratégias de caching **buscam criar cópias mais performáticas e econômicas de dados**, sejam eles de backend, dependências externas, bancos de dados transacionais, não transacionais ou até dados estáticos de páginas frontend.

Como o **conceito de cache se baseia em criar versões do mesmo dado em locais com acesso mais rápido e barato**, esses dados podem ser usados para **criar um mecanismo de resiliência para a fonte original**.

![Cache OK](/assets/images/system-design/cache-ok.drawio.png)

Ao acessar dados diretamente no cache, **o número de consultas ao backend ou ao banco de dados é significativamente reduzido**, o que, além de **aumentar a performance**, **diminui a carga sobre a origem dos dados**. Esse impacto é especialmente valioso em momentos de alta demanda, prevenindo que a camada de dados atinja seu limite e falhe. Além disso, é possível projetar mecanismos para que o cache suporte uma eventual falha total da camada de dados.

Recomendo fortemente a leitura do capítulo sobre estratégias de cacheamento, revisitando conceitos como **Write-Behind, Write-Through, Lazy Load e Cache Distribuído**, agora com essa perspectiva de resiliência.

Quando **mecanismos mantêm a fonte original e o cache sincronizados com as mesmas versões, essas camadas tornam-se altamente redundantes**.

![Cache Error](/assets/images/system-design/cache-error.drawio.png)

Por exemplo, uma **CDN bem atualizada pode ser suficiente para sustentar uma longa indisponibilidade dos servidores de origem em frontends**, enquanto **caches inteligentes de dados de um banco de dados podem permitir que o sistema continue funcionando total, parcial ou razoavelmente**, conforme as necessidades e os critérios de operação definidos.


<br>

## Sharding e Particionamento de Clientes em Resiliência

**Não colocar todos os ovos na mesma cesta** é a analogia perfeita para explicar como funciona a implementação de [sharding](/sharding/). O capítulo onde detalhamos sharding, particionamento e distribuição por hashing é, talvez, um dos meus favoritos nesta coleção de textos, e foi ao qual dediquei mais atenção para reunir referências e escrever a revisão bibliográfica das implementações arquiteturais sobre o tema.

O objetivo de segregar um grande conjunto de dados em conjuntos menores é, por si só, muito intuitivo quando o assunto é resiliência. Dividir contextos, inclusive os já fragmentados em domínios de microserviços, é um caminho evolutivo interessante em cenários de alta demanda e missão crítica.

![Sharding](/assets/images/system-design/sharding.drawio.png)

A estratégia de **direcionar o particionamento tanto de dados quanto de workloads completos** — *(veremos uma implementação mais detalhada no tópico a seguir sobre Bulkheads)* — em **dimensões significativas**, como tenants, clientes, lojas e afins, de forma a possibilitar a segregação total da operação dessas dimensões dentro de um único shard, é essencial. Embora essa abordagem possa gerar hot partitions ocasionais, ela permite que experimentemos novas features com controle mais granular, sem propagá-las completamente para todos os clientes. Além disso, esse particionamento **ajuda a dispersar um eventual blast radius** de componentes do shard, isolando possíveis impactos e aumentando a resiliência do sistema.

<br>

## Bulkhead Pattern

O Bulkhead é um pattern que se conecta diretamente com vários outros conceitos, como **sharding**, **hashing consistente**, **arquitetura celular** e **estabilidade estática**. A origem do termo vem do transporte marítimo, onde os **compartimentos dos navios são isolados de modo que, caso haja dano em uma seção ou compartimento, esse dano não afete as outras seções**, prevenindo que o navio todo se inunde por uma reação em cadeia de falhas sucessivas.

![Bulkhead Primeiro Exemplo](/assets/images/system-design/bulkhead.drawio.png)

O Bulkhead é, talvez, uma **evolução na implementação de sharding**. Enquanto o sharding é comumente associado a dados, o Bulkhead leva o conceito de particionamento a um nível mais complexo, estendendo a segregação para componentes adicionais de infraestrutura, e não apenas para a camada de dados.

O objetivo dos Bulkheads é **isolar infraestruturas específicas para determinados tipos de funcionalidades**, como **pools de conexões, bancos de dados, balanceadores de carga, versões de uma mesma aplicação, separação por prioridades de requisições, segmentação de clientes, entre outros**.

![Bulkhead Sharding](/assets/images/system-design/bulkhead-shard.png)

Com o particionamento em bulkheads, **se tivermos uma distribuição uniforme e controlada de clientes entre esses compartimentos, o Blast Radius pode ser facilmente calculado**. Por exemplo, se distribuirmos todos os clientes em 10 shards, uma eventual falha em um desses shards isolados impactará apenas 10% dos clientes. Com 100 shards, o impacto de uma falha em um único shard é reduzido a 1% dos clientes; com 1000 shards, o impacto é de apenas 0,1%, e assim por diante.

Uma implementação mais radical dos bulkheads consistiria em **isolar todas as dependências de uma solução ou domínio em shards completos e independentes**, incluindo microserviços, bancos de dados, caches, e até arquivos. Esse tipo de estratégia, embora pareça impraticável, é utilizado em várias soluções multi-tenant que adotam algum nível de federação ou implementações de arquiteturas celulares.

<br>

## Lease Pattern

O Lease Pattern, ou "Arrendamento", é um pattern presente em sistemas distribuídos que busca **definir concessões temporárias ou tempos de validade para o uso ou alocação de um recurso**. Esses recursos podem incluir **pools de conexões, tokens de acesso, alocação de consumo de mensagens, conexões persistentes entre clientes e servidores, entre outros**.

A implementação do Lease Pattern **ajuda a evitar que sistemas com um grande volume de acessos fiquem sobrecarregados por conexões ociosas**, impedindo que operações com propósito ativo sejam bloqueadas por recursos inativos.

![Leasing](/assets/images/system-design/leasing.png)

O leasing geralmente ocorre quando **um recurso inicia uma conexão com uma dependência**, como, por exemplo, um **consumidor se conectando a uma partição Kafka**, uma **conexão persistente a um banco de dados** ou uma **conexão gRPC em um ambiente com um número limitado de conexões simultâneas**. O servidor **concede essa conexão com um prazo de validade ou tempo máximo de inatividade, durante o qual o cliente precisa renovar o acesso para indicar que ainda está ativo**.

Caso essa renovação não seja realizada pelo cliente, o recurso é automaticamente liberado para ser assumido por outro processo.

Em pools de conexão de banco de dados, **cada cliente ou thread recebe um lease para uma conexão ou um número solicitado de conexões**. Se o cliente **não enviar um heartbeat ou não liberar a conexão ao final do uso, o lease expira** e a conexão é automaticamente **disponibilizada para novos clientes que precisem se conectar ao banco de dados**, evitando que conexões fiquem presas ou monopolizadas por clientes inativos. Bancos de dados são um exemplo claro de leasing, pois, na maioria dos bancos transacionais, o número máximo de conexões simultâneas é limitado, e quando o limite é excedido, ocorre uma rejeição automática da solicitação impedindo que ela mesmo se inicie.

<br>

## Shuffle Sharding

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

[What is Fallback?](https://botpenguin.com/glossary/fallback)

[Bulkhead Pattern — Distributed Design Pattern](https://medium.com/nerd-for-tech/bulkhead-pattern-distributed-design-pattern-c673d5e81523)

[Bulkhead Pattern](https://www.geeksforgeeks.org/bulkhead-pattern/)

[Bulkhead pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead)

[Como a estabilidade estática aumenta a resiliência da sua aplicação](https://medium.com/@robisson/como-a-estabilidade-est%C3%A1tica-aumenta-a-resili%C3%AAncia-da-sua-aplica%C3%A7%C3%A3o-2558247f27fa)

[Microservices - Resilience](https://badia-kharroubi.gitbooks.io/microservices-architecture/content/patterns/communication-patterns/bulkhead-pattern.html)

[Efficient Scalability and Concurrency implementing the Lease Management as a Locking Pattern](https://adria-arquimbau.medium.com/efficient-scalability-and-concurrency-implementing-the-lease-pattern-with-azure-storage-accounts-698dfe56458a)

[Leasing - Prashant Jain & Michael Kircher](https://hillside.net/plop/plop2k/proceedings/Jain-Kircher/Jain-Kircher.pdf)

[Conversation Patterns](https://www.enterpriseintegrationpatterns.com/patterns/conversation/Lease.html)

[graceful degradation](https://www.techtarget.com/searchnetworking/definition/graceful-degradation)