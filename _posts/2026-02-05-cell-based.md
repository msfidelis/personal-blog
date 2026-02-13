---
layout: post
image: assets/images/system-design/capa-bulkheads.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering ]
title: System Design - Cell-Based Architecture
---

A arquitetura celular é um tema particularmente especial pra mim, olhando para o próximo passo de sistemas distribuídos de ambientes criticos, o tema é particularmente fascinante. 

Esse foi o tema da minha pesquisa de mestrado, e depois de bastante tempo tentando consolidar o tema academicamente, decidi que tenho material o suficiente pra compor mais um capitulo dessa série de artigos com o tema.  

Fui introduzido ao conceito há pelo menos 4 anos antes da escrita desse texto através de uma iniciativa interna da empresa na qual trabalho como uma proposta de alavancar os níveis de alta disponibilidade. Quando fui confrontado por "qual seria o tema da minha pesquisa de mestrado", tive a ideia de alavancar um conceito emergente de mercado academicamente, e Arquitetura Celular e seus arredores serviram como uma luva. Baita desafio. Precisei consolidar conceitos já firmados em mercado e academia como replicação, bulkheads, isolamento de falhas e demais tecnologias cloud native para sustentar o termo. 

Esse texto se baseia em uma alternativa mais legal, e menos formal de abordar o tema. 

<br>

# Definindo a Arquitetura Celular

O modelo de Arquitetura Celular é um modelo de arquitetura descentralizada onde as capacidades de uma organização são estruturadas em uma rede de células independentes e auto-contidas, como uma evolução do que entendemos pelo [Bulkhead Pattern](/bulkheads).

O conceito que conecta os bulkheads a arquitetura celular em sistemas complexos é a proposta de criar fronteiras de isolamento de falhas, garantindo que o impacto de um erro seja restrito a um número limitado de componentes, sem afetar o restante do ecossistema, com o adicional de componentes de replicação de dados entre células para conter ainda mais o escopo de uma eventual falha isolada. 

<br>

# Unidades Celulares 

## Dimensão estrutural de uma celula

Uma célula é um compilado de um ou mais componentes (microsserviços, funções, databases, gateways, etc.) agrupados desde o design até a implementação e implantação. Estruturalmente, ela possui as características de isolamento e independência, onde cada celula, ou conjunto de celulas, é responsável por atender uma parcela determinada do publico de forma autocontida, e toda comunicação externa deve ocorrer obrigatoriamente através de um gateway de borda ou proxy, que expõe APIs, eventos ou streams de dados. 

Os componentes internos comunicam-se de forma contínua intra-celular, enquanto dependências externas são mediadas pelo gateway da célula. Os componentes internos da celula só podem conhecer e se comunicar com componentes da propria célula, nunca de outra. Cada célula possui um nome e um identificador de versão único, facilitando o gerenciamento de dependências no ecossistema distribuído e resiliente. 

## Isolamento de estado 

Uma característica deterministica da implementação da arquitetura celular, é que as células não compartilham estado com outras células de forma primária, apenas por replicação passiva. Em termos de persistência, uma célula pode conter seus próprios clusters de bancos de dados relacionais, sistemas de arquivos locais ou repositórios de dados necessários para cumprir sua função de negócio. 

Cada unidade é independente e lida com um subconjunto específico das requisições totais do sistema, e pode ter unidades passivas que assumem a liderança dos dados replicados em caso de falha da celula principal. 

<br>

# Estratégias de roteamento e direcionamento para células

O princípio fundamental é que toda requisição deve ser roteada para uma célula específica com base em uma chave estável, como customerId, accountId ou tenantId. Esse roteamento pode ocorrer em múltiplas camadas: DNS, API Gateway, proxies de borda ou service mesh.

É fundamental que o algoritmo de roteamento seja determinístico, garantindo que requisições relacionadas ao mesmo estado sempre atinjam a mesma célula ativa. Em cenários de failover, o roteador deve ser capaz de redirecionar para a célula passiva correspondente sem que o cliente perceba a transição.

## Células e segmentação de carga

A segmentação de carga na Arquitetura Celular é uma decisão estrutural de como os dados serão divididos e replicados entre as celulas. Isso vai muito além de um particionamento horizontal de de dispersar throughput entre vários estanques isolados de capacidade. Em arquiteturas tradicionais, o [load balancer]() distribui requisições de maneira estatística através de vários algoritmos como round robin, least connection e afins, mas o estado permanece logicamente compartilhado. Já em uma arquitetura celular, a segmentação é determinística e vinculada a uma chave de negócio estável, podendo ser tratado de forma cadastral e mapeamento intencional, ou distribuído estatisticamente através de algoritmos de hashing e hashing consistente. Isso significa que cada célula absorve um subconjunto fixo e deterministico da carga total, e essa distribuição não varia dinamicamente conforme a pressão momentânea do sistema.

## Células Sincronas 

No contexto síncrono, o roteamento ocorre no caminho crítico da requisição. HTTP, gRPC ou mesmo protocolos binários proprietários são direcionados para uma célula específica antes da execução do fluxo transacional.

![HTTP Layer](/assets/images/system-design/cell-http-layer.png)

Aqui presumimos um gateway de borda que recebe todas as requisições de domínio. Esse gateway tem a função de atuar como um proxy de encaminhamento inteligente, como um roteador que sabe identificar deterministicamente através de chaves conhecidas como ids de clientes, tennants, usuários e direcionar para a celula, ou conjunto de celulas correspondente. Esse mecanismo de roteamento e proxy pode operar baseado em DNS, Hashing Consistente, Roteamento via Service Mesh ou de forma cadastral consultando fontes externas para determinar onde o cliente será direcionado. 

Em cenários síncronos, a latência da célula é diretamente percebida pelo usuário. Portanto, cada célula deve ser dimensionada como unidade autônoma de performance. CPU, memória, conexões de banco, thread pools e limites de rate limiting devem ser configurados por célula, não globalmente. Cada celula precisa ser seu capacity isolado e independente. 


## Células Assincronas

Quando entramos no domínio assíncrono, a arquitetura celular assume ainda mais capacidade e estratégia de desacoplamento estrutural. Em cenários de arquitetura celular que são acionadas por eventos em tópicos ou mensagens em filas, cada celula consome apenas as mensagens e eventos pertencentes a seu contexto. 

![Async Layer](/assets/images/system-design/cell-async-layer.png)

Podemos presumir um consumidor de borda que consome alguma fila ou tópico de domínio e republica as mensagens ou eventos para tópicos e filas segmentados da celula, atuando como um filtro roteador da mensagem em contexto para sua celula específica, que por sua vez só conhece seus próprios mecanismos de mensageria. A consequência é a eliminação do acoplamento temporal entre células. Uma célula pode atrasar processamento, sofrer backpressure ou mesmo ficar indisponível sem bloquear o restante do sistema.


<br>

# Replicação Celular

No modelo celular a replicação é direcionada para a criação de células passivas que atuam como espelhos de células ativas nos requitos de dados. Cada célula é projetada como uma unidade auto-contida, incluindo todos os componentes de execução e armazenamento necessários para sua operação independente, porém podemos assumir conjuntos de celulas passivas que recebem os dados de celulas ativas, prioritariamente com consistencia eventual e replicação assincrona através de componentes adicionais, ou com consistencia forte, criando um modelo transacional de "Two-Phase Commit", garantindo que todas as celulas participantes da replicação celular irão confirmar a transação ou ela será inteiramente abortada.

![Replicação](/assets/images/system-design/cell-replication.png)

O foco na replicação para células passivas garante que falhas críticas como bugs, erros de deploy ou as chamadas poison pill requests (requisições corrompidas que derrubam o serviço) sejam contidas dentro da fronteira da célula afetada, mas que o cliente seja redirecionado para uma celula passiva para qual seus dados estejam sendo replicados de forma transparente. Como cada célula atende a apenas um subconjunto das requisições totais, assumindo um roteamento forte por chave de partição, a perda de uma célula principal não resulta em um apagão da experiência do cliente. 

## Replicação Assincrona entre Células

A replicação assíncrona entre células de uma arquitetura desse tipo é o modelo mais comum dentro de arquiteturas celulares, principalmente quando podemos abrir mão de uma consistencia forte nos critérios de alta disponibilidade e tolerância a falhas. Nesse modelo, a célula ativa é a fonte primária de escrita, enquanto células passivas recebem atualizações de estado por meio de streams de eventos, logs de mudança ou filas assíncronas.

![Replicação Assincrona Entre Celulas](/assets/images/system-design/cell-replicacao-async.png)

O custo desse modelo é a aceitação da consistência eventual. O objetivo dessa estratégia é a propagação dos dados entre as células ativas e passivas fora do que consideramos o "caminho crítico" transacional do cliente, permitindo que as operações da célula continuem atendendo com baixa latência, mesmo sob carga elevada e saturação da célula em carga. Em uma falha súbita da célula ativa, a célula passiva pode assumir com um pequeno atraso de estado. 

## Replicação Consistente entre Células 

A replicação consistente entre células surge quando o domínio de negócio não tolera divergência de estado, mesmo que temporária em uma eventual mudança de responsabilidade entre uma celula ativa e passiva. Nesses cenários, a arquitetura celular precisa incorporar mecanismos de coordenação distribuída, como Two-Phase Commit (2PC) ou variações mais modernas de consenso para garantir um estado transacional em todas as celulas do conjunto do contexto.


![Replicação Sincrona Entre Celulas](/assets/images/system-design/cell-replicacao-sync.png)

Esse modelo assume mais complexidade e riscos, onde múltiplas células participam de uma transação distribuída, garantindo que o estado só seja considerado confirmado quando todas as células envolvidas reconhecem a operação, e em caso qualquer participante falhe, a transação inteira é abortada, preservando uma integridade global. 

Embora conceitualmente elegante, esse modelo introduz acoplamento temporal entre células, aumenta a latência e reduz a capacidade de isolamento absoluto de falhas. Por isso, sua aplicação deve ser extremamente criteriosa, restrita a fluxos realmente críticos e evitando um volume que possa desencadear uma saturação em cascata em todas as células participantes do conjunto.

## Replicação e Shuffle Sharding

A combinação de arquitetura celular com shuffle sharding representa uma das estratégias mais eficientes para reduzir impacto sistêmico em larga escala e aplicar a replicação cross-celular.

![Shuffle Sharding](/assets/images/system-design/cell-shuffle.png)

Em vez de associar cada cliente ou tenant a uma única célula fixa, o shuffle sharding mapeia cada entidade a um subconjunto estável de células, calculado por hashing consistente. Assim, um cliente interage apenas com um pequeno grupo de células, e não com o sistema inteiro, assumindo que seus dados estão replicados entre todas elas de forma consistente ou assincrona.

Quando uma célula falha, apenas os clientes cujo conjunto inclui aquela célula são afetados. Os demais continuam operando normalmente. Isso reduz drasticamente o blast radius estatístico, mesmo em sistemas com milhares ou milhões de clientes. Quando aplicamos o shuffle sharding, os clientes afetados podem ser redirecionados para uma celula ao lado cujo qual seus dados foram replicados, dessa forma só começamos a calcular o blast radius a partir da falha de duas, ou mais celulas (dependendo da quantidade de replicação cross celular dos dados), e reduzimos a porcentagem de impacto para uma probabilidade dos clientes estarem em todo o conjunto de celulas indisponíveis. 

## Replicação e Blast Radius

A principal característica da arquitetura celular, quando combinada com replicação, é a previsibilidade do impacto de falhas.

Como vimos no exemplo dos Bulkheads, se uma carga de trabalho é distribuída igualmente entre 10 shards e uma delas falha, 90% dos usuários ou recursos permanecem operacionais e inalterados. Quando confrontamos com a proposta da Arquitetura Celular com replicacão.

A literatura clássica de sistemas distribuídos mostra que a replicação é um mecanismo chave para garantir disponibilidade e continuidade operacional, permitindo que o sistema mantenha o serviço mesmo diante de falhas de nós ou partições de rede. 

Do ponto de vista matemático, se temos N células e roteamento uniforme por hashing consistente, cada célula tende a absorver aproximadamente 1/N da carga total. Isso permite modelar blast radius como função direta da cardinalidade de células.

Do ponto de vista conceitual, células podem ser compreendidas como domínios de falha isolados, alinhados ao padrão arquitetural de bulkheads, cujo objetivo é compartimentalizar o impacto de incidentes. Quando trabalhamos com a replicação celular, e temos a capacidade de redirecionar nossos clientes para celulas passivas para o dado do mesmo, conseguimos adicionais ainda mais camadas de disponibilidade na experiência do cliente. 

| Células Totais | Células Indisponíveis | Réplicas em Shuffle | Probabilidade de Impacto do Cliente|
|----------------|-----------------------|---------------------|--------------------------|
| 20             | 2                     | 2                   | 1%                       |
| 20             | 2                     | 3                   | 0.1%                     |
| 20             | 2                     | 5                   | 0.001%                   |

<br>
<br>




### Referências

[BR AWS re:Invent 2022 - Camada Zero: A real-world architecture framework (PRT268)](https://www.youtube.com/watch?v=7IUgTNcPFlU)

[A Crash Course on Cell-based Architecture](https://blog.bytebytego.com/p/a-crash-course-on-cell-based-architecture)

[Mastering Cell-Based Architecture for Modern Enterprises](https://wso2.com/library/conference/2025/07/mastering-cell-based-architecture-for-modern-enterprises)

[Cell-Based Architecture Reference](https://github.com/wso2/reference-architecture/blob/master/reference-architecture-cell-based.md)

[Cloud Native Middleware: Domain-Driven Design, Cell-Based Architecture, Service Mesh, and More](https://wso2.com/library/conference/2024/05/cloud-native-middleware-domain-driven-design-cell-based-architecture-service-mesh-and-more/)

[Reference Architecture for Agility, Version-0.9](https://wso2.com/wso2_resources/wso2-reference-architecture-for-agility-version-0-9.pdf)

[What is a cell-based architecture?](https://docs.aws.amazon.com/wellarchitected/latest/reducing-scope-of-impact-with-cell-based-architecture/what-is-a-cell-based-architecture.html)

[Guidance for Cell-Based Architecture on AWS](https://aws.amazon.com/solutions/guidance/cell-based-architecture-on-aws/)

[Two-Phase Commit](https://martinfowler.com/articles/patterns-of-distributed-systems/two-phase-commit.html)

[Shuffle Sharding: Massive and Magical Fault Isolation](https://aws-amazon-com.translate.goog/blogs/architecture/shuffle-sharding-massive-and-magical-fault-isolation/?_x_tr_sl=en&_x_tr_tl=pt&_x_tr_hl=pt&_x_tr_pto=tc)

[Bulkhead Pattern -> Cell based architecture](https://www.wedaa.tech/docs/blog/2024/05/05/Bulkhead-Pattern)