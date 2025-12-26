---
layout: post
image: assets/images/system-design/capa-event-source.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering ]
title: System Design - Capacity Planning
---

{% include latex.html %}

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

Da forma mais simples, uma fila é um mecanismo onde **solicitações chegam (λ), e são processados (μ)**, e o sistema **oscila continuamente entre estados de ociosidade, equilíbrio e saturação** dentro desses dois parâmetros. **Quando a taxa de chegada (λ) se aproxima ou ultrapassa da taxa de processamento (μ), a gera um gargalo físico**, onde tempos de resposta aumentam e o throughput degrada por ter uma taxa de envio maior que o a taxa de vazão. É por esse tipo de detalhe técnico que um microsserviço em p95 saudável pode degradar em uma dimensão de p99 sob picos inesperados mesmo com CPU e outros recursos disponível. No geral, o problema não é falta de capacidade física, mas sim variabilidade temporal, bursts e o custo de espera entre as chamadas e processos.

Isso explica porque o autoscaling normalmente não resolve todos os problemas de capacidade, uma vez que o mesmo normalmente só reage a aumento de uso ou saturação dos recursos para adicionar e remover réplicas de um serviço. **O Autoscaling, superficialmente, aumenta a taxa de processamento (μ) de forma momentânea**, permitindo que a taxa de vazão aumente, mas ainda funciona com base a gatilhos temporais, ainda deixando o sistema sensível a bursts e picos de uso. Em outras palavras, **um sistema não sofre porque recebe “muitas requisições”, mas porque recebe requisições de forma imprevisível ou não uniformes**.

A teoria das filas propõe o **uso da variabilidade do coeficiente de variação ou do desvio padrão ao invés de medidas como percentís, mínimos, máximos e médias na taxa de processamento**. Analisamos então a variação da taxa de chegada (λ) e variação da taxa de processamento (μ). Essa visão explica por que sistemas com a mesma capacidade de recursos podem ter comportamentos completamente distintos sob carga real. Dois serviços com a mesma taxa média de atendimento podem apresentar curvas de latência radicalmente diferentes se um deles processar requests com desvio padrão alto.

Estratégias já vistas anteriormente como sharding, bulkheads, caching, escalabilidade vertical e horizontal, desacoplamento a nível de filas e eventos, aumento de consumidores, estratégias de concorrência e paralelismo nos ajudam a lidar com estabilidade de sistemas quando a taxa de chegada supera a taxa de processamento. 

<br>

## A Lei de Little na Teoria das Filas

A Lei de Little, ou Little's Law, é um principio matematico simples integrado a Teoria das Filas apresentado por John D. C. Little na década de 1960 que nos fornece insights valiosos para entender qualquer comportamento de qualquer sistema sob carga. A lei não foi inicialmente formulada para conceitos computacionais complexos, ela pode ser utilizada para analisar a pressão de qualquer tipo de sistema sob a ótica da média de três variáveis, sendo elas o **número médio de itens em processamento no sistema (L)**, a **taxa média de chegada (λ)** e o **tempo médio de processamento e permanência desses itens (W) no sistema**. Essa relação é expressa pela equação:

\begin{equation}
L = \lambda \times W
\end{equation}

Esse calculo, por mais que seja simples, é valido para interpretar qualquer sistema estável, pois independe de estatisticas complexas e valores exatos da taxa de processamento e permanencia `(W)` e da taxa de chegada de itens ao sistema `(λ)`, **desde que suas médias sejam bem definidas**. 

![Lei de Little](/assets/images/system-design/little-law.png)

Em sistemas distribuídos, a Lei de Little nos ajuda a interpretar a capacidade de forma granular, a nível de cada componente, dependência ou microserviço, ou de forma mais ampla analisando um fluxo completo em cenários onde estimar as capacidades exatas de todos os componentes pode ser muito complexo ou inviável. 


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

## Knee Curve (Curva do Joelho)
- Relação entre utilização e latência
- Ponto ótimo operacional vs. ponto máximo de utilização
- Custos técnicos e econômicos de operar próximo ao joelho
- Implicações organizacionais e de SLO
  
a curva do joelho revela o ponto a partir do qual o sistema deixa de se comportar de forma previsível e passa a apresentar degradação acelerada

## Modelagem de Carga
### Métricas Fundamentais de Carga
- Transações por Segundo (TPS)
- Requests concorrentes
- Payload médio e variabilidade

### Cálculo de Capacidade para Transações
- Capacidade teórica vs. capacidade observada
- Margens de segurança e buffers
- Capacidade sob degradação controlada

### Distribuição Estatística da Carga
- Cargas uniformes e poissonianas
- Cargas bursty e heavy-tailed
- Impacto das caudas longas em filas e latência
- Correlação temporal e efeitos acumulativos

### Perfis de Tráfego
- Perfil diário
- Perfil semanal
- Perfil sazonal
- Sobreposição de ciclos de carga
- Multi-tenancy e efeitos de sincronização

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