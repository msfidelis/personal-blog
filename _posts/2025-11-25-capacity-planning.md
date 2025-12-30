---
layout: post
image: assets/images/system-design/capa-event-source.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering ]
title: System Design - Dimensões de Capacity Planning
---

{% include latex.html %}

Passei os ultimos 3 meses do ano de 2025 procurando modelos matemáticos para me guiar nos assuntos de capacity planning e performance para minha caixa de ferramentas. Aqui, guardo um compilado dos conceitos e fórmulas mais relevantes que encontrei. 

# Planejamento de Capacidade

Em termos práticos, operar continuamente próximo a 100% de utilização elimina qualquer margem para absorver variações naturais da carga, transformando flutuações normais em incidentes operacionais.

- Capacidade como problema probabilístico, não determinístico
- Diferença entre capacidade nominal, efetiva e sustentável
- Planejamento defensivo vs. planejamento ofensivo
- Capacidade como função de risco aceitável
- Limitações históricas de estimativas baseadas apenas em médias


<br>

# Teoria das Filas

![Teoria das Filas](/assets/images/system-design/teoria-das-filas-conceitual.png)

A teoria das filas é um dos fundamentos mais importantes e ao mesmo tempo mais mal compreendidos em capacity planning. Em termos simples, a teoria estuda como **sistemas se comportam quando múltiplas demandas competem por recursos finitos** de uma aplicação e suas dependências. Em engenharia de software podemos utilizar como base comportamentos comuns de arquitetura como requisições sincronas aguardando processamento, mensagens acumuladas em filas, multiplos itens sendo processados em memória, conexões disputando pools limitados em bancos de dados ou operações de I/O esperando acesso a um recurso compartilhado.

De forma conceitual, toda fila pode ser entendida a partir de três dimensões: **como as demandas chegam ao sistema, como elas são processadas e em que ordem são atendidas.** O objetivo é transformar arquiteturas complexas em modelos matematicamente e probabilisticamente analisáveis, principalmente em arquiteturas distribuídas onde taxas de uso estáveis e tempos de resposta previsíveis raramente se sustentam. 

A "filas" não existem apenas onde há estruturas literais de enfileiramento assincronos como brokers de mensagens e eventos. Embora a teoria das filas seja apenas como uma abstração acadêmica, ela nos dá formas de compreender gargalos, throughput real, tempo de resposta, latências em cascata decorrentes de pools de threads, conexões de banco de dados, locks em recursos compartilhados e mecanismos de retry de forma isolada, mas sobretudo em arquiteturas distribuídas, onde cada hop, cada requisição, cada buffer e cada microserviço se comporta como uma fila independente, com sua própria taxa de chegada, taxa de processamento, saturação e congestionamento.

![Teoria das Filas](/assets/images/system-design/teoria-das-filas-simples.png)

Da forma mais simples, uma fila é um mecanismo onde **solicitações chegam `(λ)`, e são processados `(μ)`**, e o sistema **oscila continuamente entre estados de ociosidade, equilíbrio e saturação** dentro desses dois parâmetros. **Quando a taxa de chegada `(λ)` se aproxima ou ultrapassa da taxa de processamento `(μ)`, a gera um gargalo físico**, onde tempos de resposta aumentam e o throughput degrada por ter uma taxa de envio maior que o a taxa de vazão. É por esse tipo de detalhe técnico que um microsserviço em p95 saudável pode degradar em uma dimensão de p99 sob picos inesperados mesmo com CPU e outros recursos disponível. No geral, o problema não é falta de capacidade física, mas sim variabilidade temporal, bursts e o custo de espera entre as chamadas e processos.

Isso explica porque o autoscaling normalmente não resolve todos os problemas de capacidade, uma vez que o mesmo normalmente só reage a aumento de uso ou saturação dos recursos para adicionar e remover réplicas de um serviço. **O Autoscaling, superficialmente, aumenta a taxa de processamento `(μ)` de forma momentânea**, permitindo que a taxa de vazão aumente, mas ainda funciona com base a gatilhos temporais, ainda deixando o sistema sensível a bursts e picos de uso. Em outras palavras, **um sistema não sofre porque recebe “muitas requisições”, mas porque recebe requisições de forma imprevisível ou não uniformes**.

A teoria das filas propõe o **uso da variabilidade do coeficiente de variação ou do desvio padrão ao invés de medidas como percentís, mínimos, máximos e médias na taxa de processamento**. Analisamos então a variação da taxa de chegada `(λ)` e variação da taxa de processamento `(μ)`. Essa visão explica por que sistemas com a mesma capacidade de recursos podem ter comportamentos completamente distintos sob carga real. Dois serviços com a mesma taxa média de atendimento podem apresentar curvas de latência radicalmente diferentes se um deles processar requests com desvio padrão alto.

Estratégias já vistas anteriormente como sharding, bulkheads, caching, escalabilidade vertical e horizontal, desacoplamento a nível de filas e eventos, aumento de consumidores, estratégias de concorrência e paralelismo nos ajudam a lidar com estabilidade de sistemas quando a taxa de chegada supera a taxa de processamento. 

<br>

## A Lei de Little na Teoria das Filas

A Lei de Little, ou Little's Law, é um principio matematico simples integrado a Teoria das Filas apresentado por John D. C. Little na década de 1960 que nos fornece insights valiosos para entender qualquer comportamento de qualquer sistema sob carga. A lei não foi inicialmente formulada para conceitos computacionais complexos, ela pode ser utilizada para analisar a pressão de qualquer tipo de sistema sob a ótica da média de três variáveis, sendo elas o **número médio de itens em processamento no sistema (L)**, a **taxa média de chegada (λ)** e o **tempo médio de processamento e permanência desses itens (W) no sistema**. Essa relação é expressa pela equação:

\begin{equation}
L = \lambda \times W
\end{equation}

Esse calculo, por mais que seja simples, é valido para interpretar qualquer sistema estável, pois independe de estatisticas complexas e valores exatos da taxa de processamento e permanencia `(W)` e da taxa de chegada de itens ao sistema `(λ)`, **desde que suas médias sejam bem definidas**. 

![Lei de Little](/assets/images/system-design/little-law.png)

Em sistemas distribuídos, a Lei de Little **nos ajuda a interpretar a capacidade de forma granular, a nível de cada componente, dependência ou microserviço**, ou de forma mais ampla **analisando um fluxo completo em cenários onde estimar as capacidades exatas de todos os componentes pode ser muito complexo ou inviável**. 


Em termos práticos, ela se resume a uma interpretação de capacidade adicional sobre o throughput e latência. Para uma taxa de chegada fixa `(λ)`, **qualquer aumento no tempo médio de resposta** `(W)` implica, de forma imediata, **um aumento proporcional no número de processos simultâneos** `(L)` no sistema.

Considere um sistema de assincrono que recebe uma taxa média de `1.500` mensagens por segundo, com tempo médio de processamento por mensagem de `50ms`, aplicando a Little's Law, podemos encontrar o número de processos concorrentes dentro do mesmo segundo: 

\begin{equation}
L = 1.500 \times 0.05
\end{equation}
\begin{equation}
L = 75
\end{equation}

Neste cenário o sistema mantém em média, `75` mensagens simultaneamente em processamento ou espera. **Esse valor representa a concorrência média interna do sistema e pode ser utilizado como base para dimensionamento de consumidores, threads de processamento, partições de filas ou limites de paralelismo**, servindo como **fator base para saber de uma eventual degradação ou otimização proativamente sem depender de saturação**. Lembrando que, com base interpretativa do modelo, quanto menor o valor de `L`, melhor. 

**Pequenos aumentos no tempo médio de processamento impactariam diretamente o número de mensagens acumuladas**, aumentando o **risco de atraso e crescimento não controlado da fila**, por exemplo um aumento de tempo de processamento para `85ms`: 

\begin{equation}
L = 1.500 \times 0.085
\end{equation}

\begin{equation}
L = 127
\end{equation}


Ao **elevar o tempo médio de processamento**, mesmo para um **aumento aparentemente pequeno** e plausível em cenários reais causado por variação de payload, latência de dependências externas, I/O ou demais contenções externas, o número médio de mensagens em voo salta para `127` de concorrência interna, **o aumento absoluto de 52 mensagens simultâneas por segundo**, que pode representar uma **elevação significativa da saturação e enfileiramento interno**, ampliando o uso de recursos compartilhados e aumentando a probabilidade de contenção, retries e atrasos adicionais. 

A capacidade não pode ser avaliada utilizando apenas a taxa de consumo, mas deve ter formas de considerar a sensibilidade do sistema a latência de processamento. Um sistema que não possui margem o suficiente para absorver variações temporais está declaradamente em um estado de subdimensionamento.

<br>

### Lei de Little e o "Ponto Saudável"

A Lei de Little nos fornece um critério de avaliação para **encontrar um "ponto saudável" de operação de um sistema**, no qual entendemos que com o crescimento da carga `(λ)`, **não teremos aumento descontrolado da concorrência interna** `(L)`. 

![L-Alvo](/assets/images/system-design/law-guardrail.png)

Para tornar isso paupável, podemos adotar um `L(Alvo)` para o sistema, como um Service Level de engenharia, que representa um **número maximo desejável de itens em concorrência interna**, sendo esse compatível com os **limites físicos e operacionais da solução**, nos levando a busca por otimizações constantes para reduzir o tempo de processamento `(W)`.

Considere uma API REST que possui **um `L(Alvo)` de `150`**. O sistema recebe `500` requisições por segundo com um tempo médio de resposta de `300ms`. Pela Lei de Little: 

\begin{equation}
L = 500 \times 0.3
\end{equation}

\begin{equation}
L = 150
\end{equation}

Esse cenário caracteriza o contrato do "Ponto Saudável", **onde o sistema opera dentro do limite planejado de concorrência interna** e mantem uma certa previsibilidade e margem para absorver suas variações. A medida que a carga cresce no sistema para `1000` requisicões por segundo, o `L` vai para `300`, ultrapassando o `L(Alvo)` e podendo levar o sistema para uma região de saturação e risco. 

Uma progressão saudável te leva a pesquisa interna para lidar com uma redução propocional do tempo de processamento `W`. Aqui aplicamos diversas técnicas de otimização para diminuir o tempo de processamento dos requests. Podemos descobrir o tempo alvo para otimização `(W)`, dividindo nosso `L(Alvo)` pela taxa de requisições recebidas `(λ)` atual e multiplicando categoricamente para chegar na mesma unidade de tempo que estamos utilizando, no caso do exemplo, milisegundos: 

\begin{equation}
W = \frac{\text{L(Alvo)}}{\lambda} * 1000
\end{equation}

Convertendo para o exemplo da nossa API 

\begin{equation}
W = \frac{150}{1000} * 1000
\end{equation}

\begin{equation}
L = 150ms
\end{equation}

Nesse cenário podemos entender que para que nosso sistema volte a operar com o `L(Alvo)` de `150`, precisamos diminuir nosso tempo de processamento `(W)` de `300ms` para `150ms`. Nesse novo formato otimizado, o sistema processa 50% mais mensagens mantendo a mesma concorrência média interna. O objetivo é que o crescimento seja absorvido estruturalmente, sem acúmulo adicional de filas ou pressão excessiva sobre recursos.

<br>

### Knee Curve (Curva do Joelho)

![Knee Curve](/assets/images/system-design/knee-curve.png)

A Knee Curve, ou Curva do Joelho, é um conceito que demonstra a relação de utilização de um sistema e o seu ponto de degradação de capacidade. Em um [teste de carga](/load-testing/), **representa onde o tempo de resposta muda drasticamente comparado a tendência anterior**. 

Em termos normais, **a latência cresce de forma linear conforme a quantidade de requisições que um sistema esteja lidando aumenta**. A Curva do Joelho **revela o ponto a partir do qual o sistema deixa de se comportar de forma previsível e passa a apresentar degradação acelerada**. 

![Knee Curve](/assets/images/system-design/knee-requests.png)

Enquanto a utilização está antes da formação do "joelho", o sistema tem capacidade de operar de forma saudável e segura e absorver pequenas variações carga. Operar proximo, ou além da curva, aumentamos muito o enfileiramento interno de recursos, aumento de retries e saturação dos componentes.

![Knee Curve](/assets/images/system-design/knee-cpu.png)

Podemos aplicar o modelo para demais métricas além de requests propriamente ditos. Podemos utilizar recursos fisicos como CPU e Memória para **entender a partir de que ponto de uso nosso sistema começa a degradar de throughput e latência**, e a partir disso estimar suas devidas capacidades e automações preventivas de [auto scaling](/performance-capacidade-escalabilidade/) de forma mais assertiva.

Em paralelo da Teoria das Filas, a medida em que a utilização cresce e se aproxima da capacidade maxima ou passa do "Ponto Saudável" da Lei de Little, **as filas internas começam a se formar e o tempo de espera passa a ser dominante perante a todo o tempo de processamento definido**. A partir desse ponto, a latência cresce de forma não linear, frequentemente exponencial, mesmo quando o aumento de utilização a partir desse ponto é pequeno ou irrelevante.

![L-Alvo](/assets/images/system-design/knee-l-alvo.png)

Em testes de performance, **encontrar a curva do joelho do sistema permite levantar dois pontos importantes, o "Ponto Saudável" e o "Ponto Maximo de Utilização"**. O Ponto Saudável, normalmente é uma **zona anterior a Curva do Joelho onde temos o maior equilibro operacional entre eficiência e previsibilidade**. Dentro desse intervalo, entendemos que **o throughput cresce de forma saudável e os tempos de resposta permanecem conhecidos e controlados**. 

Já o **Ponto Máximo de Utilização corresponde ao limite teórico em que o sistema ainda processa requisições, porém à custa de latências elevadas, alta imprevisibilidade e risco significativo** de indisponibilidade e falhas na experiência do usuário. O ideal é que ambas as zonas se estabeleçam antes da curva do joelho definitiva. Uma para operar, outra para definir um limite máximo de risco. 

<br>

## Modelagem de Carga

A modelagem de carga é um dos principais requisitos para se estimar o capacity planning de um sistema. Dentro de ambientes modernos, possuimos diversas ferramentas de monitoramento e observabilidade que coletam sinais de **logs, métricas e traces emitidos pelas aplicações e seus componentes para gerar diversas dimensões de visualizações e alertas**. Quando vamos estimar a capacidade de um sistema, **precisamos análisar algumas delas de forma unificada e correlacionada**. **Transações por segundo**, **requests concorrentes** e o **payload médio** formam, em conjunto, uma representação fiel do comportamento real do que qualquer uma dessas métricas analisada de forma independente pode gerar. Juntas, essas três métricas formam a base mais sólida para uma modelagem de carga mais realista. **As Transações por Segundo descreve. o ritmo de solicitações**, a **concorrência descreve a pressão acumulada no sistema perante a chegada dessas solicitações**, e **tamanho do payload descreve o peso individual de cada transação** a nível de networking, storage, peso de serialização e memória.

### Transações por Segundo 

As Transações por Segundo, **representam a taxa de chegada de requisições ao sistema**, e representam o ponto inicial de qualquer estimativa. **Nenhuma métrica é mais importante do que a quantidade de interações que um sistema recebe, ou irá receber**. 

Mesmo dentro do mesmo segundo, um sistema ainda pode apresentar insights valiosos de burst. **Dois sistemas podem operar com o mesmo TPS médio e apresentarem comportamentos totalmente diferentes se a distribuição temporal dessas transações variar**. Um workload com 1000 TPS distribuídos de forma homogênea ao longo do segundo impõe uma pressão completamente distinta de outro com a mesma média, mas concentrado em bursts de 5–10 ms, e conhecer esse nível de granularidade pode nos ajudar a estimar com muito mais precisão a capacidade necessária para suprir as demandas de forma inteligente. 

### Processos Concorrentes 

Os requests concorrentes representam uma dimensão interna dentro do sistema que reflete a capacidade de processamento do mesmo. Diferente das Transações por Segundo que descrevem a taxa de chegada de solicitações do sistema, os Processos Concorrentes descrevem a quantidade de trabalho simultâneo que o sistema sustenta. 

Em sistemas sincronos como servidores gRPC ou API's REST, isso se representa como thread ocupadas, conexões abertas e etc. Em sistemas assincronos, pode ser interpretado como mensagens em vôo, partições ocupadas, consumidores ativos e taxa de solicitações de eventos e mensagens para seus brokers. 

Podemos ilustrar um exemplo  em APIs que apresentam latências aceitáveis em p95, mas mantêm concorrência interna elevada devido a pequenas degradações em dependências externas. Nesses casos, a capacidade aparente parece suficiente, enquanto o sistema já opera próximo a limites estruturais invisíveis. Precisamos ter consciência de formas de estimar e medir a concorrência interna para evitar esbarrar em "curvas do joelho" do sistema. 

### Tamanho de Payload 

Estimar o tamanho do payload, seja esse mensagens ou requests HTTP, é uma dimensão que é rotineiramente ignorada durante a estimativa de capacidade. Em sistemas com requisições mais homogêneas, ou seja, microserviços que possuem poucos endpoints, ou contratos bem definidos de mensagens e eventos, podem facilmente prever o tamanho desses payloads com certa precisão e estimar de forma mais confiável a pressão de tráfego de I/O que sistema irá lidar. Porém, em sistemas que possuem multiplas funcionalidades distribuídas em diversas filas e endpoints, o payload médio pode não representar uma dimensão fiel a realidade do sistema. O risco do erro da estimativa não está na média dessa variável, mas sim na dispersão em torno dessa média. 

Payloads maiores tendem a ampliar o tempo de processamento, consumo de memória, pressão em garbage collection, uso de buffers de rede e latência de serialização. Um sistema que processa majoritariamente payloads pequenos, mas ocasionalmente recebe payloads muito maiores, pode apresentar comportamento estável na média e, ainda assim, sofrer degradações abruptas sob cenários perfeitamente válidos do ponto de vista funcional. Essa variabilidade cria caudas longas no tempo de resposta e amplifica o efeito de filas internas, mesmo sem alterações perceptíveis na TPS.

Idealmente precisamos modelar sistemas e contratos que não sofram muita variação de tamanho.  Quando não for possível, estimar cada uma das funcionalidades de forma isolada e se concentrar em encontrar alguma estatística que represente mais fielmente o sistema perante suas particularidades. 

<br>

### Calculos de Estimativa de Carga

Podemos estimar matematicamente nossa modelagem de carga com uma série de equações simples que podem ser aplicadas a dimensões já conhecidas do sistema, ou fornecidas por times de produto. E a seguir, iremos abordar como dispersar ainda mais a aplicação das mesmas em diversos cenários mais específicos. 

#### Estimativa de Transações por Segundo

Quando falamos sobre [Performance, Capacidade e Escalabilidade](/performance-capacidade-escalabilidade/) já ressaltamos o quanto o throughput é uma métrica extremamente valiosa e importante para entender todo tipo de comportamento do sistema. Essa métrica é a primeira a precisar ser levantada porque conecta diretamente o comportamento do usuário à pressão exercida sobre a arquitetura. 

Embora simples, o TPS deve ser interpretado como um valor estatístico médio, mínimo e maximo, e não como um fluxo contínuo e uniforme. Em sistemas reais, a taxa de chegada oscila ao longo do tempo, sofre efeitos de sincronização, burstiness e correlação entre usuários ou clientes. Levantar o desvio padrão do TPS também pode fornecer insights valiosos sobre a variação do mesmo ao decorrer de certos períodos.

\begin{equation}
\text{TPS} = \frac{\text{Unidades de Trabalho Processadas no Período}}{\text{Tempo em Segundos do Período}}
\end{equation}

Na prática, esse valor costuma ser extraído de métricas sazonais de séries históricas, projeções de crescimento ou metas de negócio, e posteriormente ajustado para picos, sazonalidade e eventos especiais que podem acontecer em certos períodos do mês ou ano, como promoções, ações de marketing, black friday, Natal e etc.

#### TPS Sistemico 

O TPS Sistêmico representa a capacidade efetiva de vazão de todo o sistema, considerando não apenas a aplicação principal, mas todas as suas dependências críticas. Em arquiteturas distribuídas, o throughput observado externamente é sempre limitado pelo menor gargalo ativo no caminho de processamento.

\begin{equation}
\text{TPS Sistêmico} =
\min(\text{TPS App}, \text{TPS Database}, \text{TPS Cache}, \text{TPS etc...})
\end{equation}

Não importa o quão escalável seja a camada de aplicação se o banco de dados, o cache, o broker de mensagens ou uma API externa impõem limites mais restritivos. Além disso, o gargalo dominante pode mudar dinamicamente conforme o perfil de carga, tamanho de payload ou tipo de operação

#### Estimativa de tamanho de Payload 

A estimativa de tamanho de payload busca quantificar o volume médio de dados trafegados por requisição, considerando tanto o corpo da mensagem quanto o overhead de protocolos de transporte, como HTTP, TLS, mTLS e etc.

\begin{equation}
\text{Payload_bytes} = (\text{Body_bytes} + \text{Headers_bytes})
\end{equation}

Entretanto, em sistemas reais, é necessário considerar camadas adicionais de overhead como encoding, compressão, criptografia e framing de protocolo que podem tanto ampliar quanto reduzir o tamanho efetivamente trafegado. 

\begin{equation}
\text{Payload_bytes} = (\text{Body_bytes} + \text{Headers_bytes}) \times \text{Overhead}
\end{equation}

Mais importante do que o valor médio absoluto é a variabilidade do payload, pois payloads grandes tendem a amplificar latência, consumo de memória e tempo de processamento, criando caudas longas que afetam a estabilidade do sistema mesmo quando a média parece controlada.

#### Estimativa de Bytes de Uma Transação

Enquanto o payload representa uma única mensagem, a estimativa de bytes por transação considera o custo completo de uma interação, incluindo request e response. Essa visão é mais adequada para análises de capacidade fim a fim e para estimativas de custo e banda sob carga real.


\begin{equation}
\text{Payload_médio(bytes)} = \text{Request_payload} + \text{Response_payload}
\end{equation}

Essa métrica se torna especialmente relevante em APIs verbosas, fluxos com respostas ricas em dados ou sistemas onde o volume de resposta cresce com o contexto da operação. Ignorar o payload de resposta é um erro comum que pode fazer muita diferença para entender divergências das estimativas versus o tráfego real. 

#### Estimativa de Banda pelo Payload e Transações por Segundo

A estimativa de banda conecta diretamente throughput lógico (TPS) com consumo físico de rede. A partir do payload médio por transação, é possível estimar o volume de dados trafegados por segundo e, consequentemente, dimensionar links, limites de ingress, e custos de transferência.

\begin{equation}
\text{Banda_bytes/s} = \text{TPS} \times \text{Payload_médio(bytes)}
\end{equation}

Esse cálculo fornece uma aproximação inicial que deve ser refinada com fatores como retries, retransmissões, fan-out interno e replicação de tráfego entre zonas ou regiões.

<br>

### Distribuição Estatística da Carga
- Cargas uniformes e poissonianas
- Cargas bursty e heavy-tailed
- Impacto das caudas longas em filas e latência
- Correlação temporal e efeitos acumulativos

<br>


### Perfis de Tráfego

#### Perfil Diário 

O Perfil Diário busca estudar o comportamento de uso do sistema ao decorrer de um dia corrido, um período fechado de 24 horas. Normalmente está associado ao hábito e rotina dos usuários e os agendamentos das integrações sistêmicas. Aqui temos análises mais granulares com agregações de poucos minutos como 1, 2, 5 e 10 minutos para análises de tendência. Podemos aqui análisar diversas estatísticas como média, p95, p99, tempo máximo e mínimo da agregação dos requests.

![Perfil Diário](/assets/images/system-design/perfil-diario.png)

Em sistemas com finalidade operacional voltados a usuários finais, podemos entender em que momento do dia eles começam a operar dentro do sistema, normalmente tendo sua maior pressão de tráfego dentro das janelas de expediente, aliviando nos horarios de almoço e ficando com pouco, ou nenhum tráfego durante noite e madrugada. Em sistemas de delivery de comida, podemos presumir os maiores picos de uso minutos ou horas antes dos horarios de almoço e jantar, sistemas de carona proximos do inicio e fim do expediente e em sistemas B2B ou internos, os picos tendem a se alinhar a rotinas operacionais, fechamentos de lote ou execuções agendadas.

Do ponto de vista de capacity planning, o perfil diário é crítico porque define a duração dos períodos de alta utilização e os de baixa utilização. Podemos utilizar esse tipo de estudo para entender os momentos do dia em que nosso tráfego irá aumentar de forma rotineira para ajustarmos preventivamente nosso capacity, ou quando o sistema ficará subutilizado. 

#### Perfil Semanal

O Perfil semanaal busca entender padrões de carga que se repetem durante os dias da semana, num período de tempo de 7 dias, para encontrar assim padrões e desvios de uso, erros e latência distribuídos entre os 7 dias da semana fechada, utilizando agregações de tempo maiores como 1, 2, 3 e 5 horas, ainda utilizando estatísticas de média e percentis de forma comparativa para entender desvios e comportamentos do sistema. 

![Perfil Semanal](/assets/images/system-design/perfil-semanal.png)

Um sistema pode operar confortavelmente abaixo do ponto saudável durante boa parte da semana e, ainda assim, entrar em regiões de saturação previsível em dias específicos. Diferente do perfil diário, que tende a ser mais suave e previsível, o perfil semanal pode introduzir assimetrias abruptas, como segundas-feiras sistematicamente mais carregadas ou sextas-feiras com picos concentrados em horários específicos, uso mais suavizado durante o restante dos dias úteis e trafego baixo durante os finais de semana. 

Esse perfil é util para entender desvios de uso do sistema e nos ajuda a projetar capacidade com base em períodos repetitivos dentro de uma semana, nos proporcionando formas de realizar warm ups preventivos ou descomissionamento de containers ou servidores em períodos de ociosidade conhecida. 

#### Perfil Sazonal

O perfil sazonal descreve variações de carga em escalas mais longas como semanas, meses ou anos e está  normalmente associadas a ciclos de negócio, eventos externos ou mudanças de comportamento dos usuários. Esse tipo de dimensão nos ajuda a projetar diversas estratégias valiosas de capacity. Aqui a agregação pode ser feita de periodos maiores, como dias ou semanas. 

![Perfil Sazonal](/assets/images/system-design/perfil-sazonal.png)

Essa estratégia nos permite estudar o crescimento gradativo do sistema, e como ele se comporta em periodos específicos de fatias de tempo maiores. Exemplos comuns incluem períodos promocionais, datas comemorativas, ciclos fiscais, eventos regulatórios ou mesmo fatores externos como clima e calendário escolar. Podemos atingir níveis de escalabilidade adequados analizando apenas periodos mensais ou semanais, mas podemos ainda assim sofrer com falhas de capacidade em determinados períodos do ano que não estão no padrão encontrado em um "mês comum" ou "semana comum", por exemplo e-commerces em promoções de Black Friday, onde em uma semana específica de novembro excede todos os padrões encontrados no restante do ano. 

Combinando os perfis diários para análises mais granulares, semanais para encontrar tendências e sazonais a nível de mês e ano nos permitem elevar nossa capacidade de projetar e estimar o capacity de nossos sistemas durante longos períodos de forma totalmente profissional.  

### Períodos Anômalos
- Períodos de pico previsíveis
- Eventos especiais e comportamento não estacionário
- Falhas de extrapolação histórica
- Estratégias de contingência e overprovisioning temporário

## Dimensões de Capacidade

### Capacidade por Instância
- Limites de CPU, memória, I/O e rede
- Capacidade elástica vs. capacidade fixa
- Overhead de runtime e plataformas

### Gargalos de Dependências
- Bancos de dados, caches e filas
- Serviços externos e APIs de terceiros
- Efeito cascata de gargalos
- Mudança dinâmica do gargalo dominante

### Restrições de Capacidade
- Latência como restrição operacional
- Taxa de erro como limite funcional
- Saturação progressiva vs. colapso abrupto
- Modos de falha sob sobrecarga

### Capacidade Fim a Fim
- Throughput sistêmico
- Dependência do menor gargalo
- Capacidade percebida pelo usuário final

## Planejamento de Storage e Crescimento de Dados
### Estimativa de Geração de Dados
- Taxa diária média
- Variabilidade e picos de ingestão
- Dados derivados e efeitos colaterais

### Projeção de Crescimento
- Crescimento linear vs. não linear
- Crescimento acoplado a features e negócio
- Incerteza de retenção e políticas de expurgo

### Capacidade Lógica vs. Capacidade Física
- Índices, metadados e estruturas auxiliares
- Réplicas, backups e snapshots
- Overhead invisível ao modelo lógico

### Tiered Storage
- Classificação por latência e custo
- Hot, warm e cold data
- Trade-offs entre acesso, custo e durabilidade

## Custos e Trade-offs de Capacidade
### Custo por Transação
- Custo marginal vs. custo médio
- Elasticidade e eficiência econômica
- Impacto do overprovisioning e underprovisioning

### Capacidade, Desempenho e Custo
- Triângulo de trade-offs
- Decisões locais vs. otimização global
- Capacidade como instrumento de governança técnica

## Considerações Finais
- Limites das previsões de capacidade
- Importância de observabilidade para realimentação do modelo
- Planejamento contínuo e adaptativo
- Capacidade como disciplina viva de System Design


# Custos por Transação 


### Referências 

[Improving the performance of complex software is difficult, but understanding some fundamental principles can make it easier.](https://queue.acm.org/detail.cfm?id=1854041)

[Teoria das Filas](https://pt.wikipedia.org/wiki/Teoria_das_filas)

[Elementos das Teorias das Filas](https://www.scielo.br/j/rae/a/34fWxG9RqkRmd8spnbPfJnR/?format=html&lang=pt)

[Lei de Little (Little’s Law): A Ciência por Trás de Fazer Menos e Entregar Mais](https://br.k21.global/gestao-de-times-ageis/lei-de-little-littles-law-a-ciencia-por-tras-de-fazer-menos-e-entregar-mais)

[Little's law](https://en-wikipedia-org.translate.goog/wiki/Little%27s_law?_x_tr_sl=en&_x_tr_tl=pt&_x_tr_hl=pt&_x_tr_pto=tc)

[Knee of a curve](https://en.wikipedia.org/wiki/Knee_of_a_curve)

[The “Knee” in Performance Testing: Where Throughput Meets the Wall](https://medium.com/@lahirukavikara/the-knee-in-performance-testing-where-throughput-meets-the-wall-904f90474346)