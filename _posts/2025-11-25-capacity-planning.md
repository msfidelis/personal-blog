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


### A Lei de Little
- Interpretação prática além da fórmula
- Relação entre WIP, latência e vazão
- Uso correto e armadilhas comuns
- Aplicações reais em arquiteturas distribuídas

### Knee Curve (Curva do Joelho)
- Relação entre utilização e latência
- Ponto ótimo operacional vs. ponto máximo de utilização
- Custos técnicos e econômicos de operar próximo ao joelho
- Implicações organizacionais e de SLO

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