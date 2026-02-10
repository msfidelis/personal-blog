---
layout: post
image: assets/images/system-design/capa-bulkheads.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering ]
title: System Design - Cell-Based Architecture
---

A arquitetura celulas é um tema particilarmente especial pra mim, olhando para o próximo passo de sistemas distribuídos de ambientes criticos, o tema é particularmente fascinante. 

A arquitetura celular é o tema da minha pesquisa de mestrado, e depois de bastante tempo tentando consolidar o tema academicamente.  Fui introduzido ao termo há ao menos 4 anos anteriores a escrita desse texto através de uma iniciativa interna da empresa na qual trabalho como uma proposta de alavancar os níveis de alta disponibilidade, e quando fui confrontado pelo tema da minha pesquisa de mestrado, tive a ideia de alavancar um conceito emergente de mercado academicamente. Baita desafio. Precisei consolidar conceitos já firmados como replicação, bulkheads, isolamento de falhas e demais tecnologias cloud native para sustentar o termo. Esse texto se baseia em uma alternativa mais legal, e menos formal de abordar o tema. 

# Definindo a Arquitetura Celular

O modelo de Arquitetura Celular é um modelo de arquitetura descentralizada onde as capacidades de uma organização são estruturadas em uma rede de células independentes e auto-contidas, como uma evolução do que entendemos pelo [Bulkhead Pattern](/bulkheads).

O conceito que conecta os bulkheads a arquitetura celular em sistemas complexos é a proposta de criar fronteiras de isolamento de falhas, garantindo que o impacto de um erro seja restrito a um número limitado de componentes, sem afetar o restante do ecossistema, com o adicional de componentes de replicação de dados entre células para conter ainda mais o escopo de uma eventual falha isolada. 

# Unidades Celulares 


## Dimensão estrutural de uma celula

Uma célula é um compilado de um ou mais componentes (microsserviços, funções, databases, gateways, etc.) agrupados desde o design até a implementação e implantação. Estruturalmente, ela possui as características de isolamento e independência, onde cada celula, ou conjunto de celulas, é responsável por atender uma parcela determinada do publico de forma autocontida, e toda comunicação externa deve ocorrer obrigatoriamente através de um gateway de borda ou proxy, que expõe APIs, eventos ou streams de dados. 

Os componentes internos comunicam-se de forma contínua intra-celular, enquanto dependências externas são mediadas pelo gateway da célula. Os componentes internos da celula só podem conhecer e se comunicar com componentes da propria célula, nunca de outra. Cada célula possui um nome e um identificador de versão único, facilitando o gerenciamento de dependências no ecossistema distribuído e resiliente. 

## Isolamento de estado 

Uma característica deterministica da implementação da arquitetura celular, é que as células não compartilham estado com outras células de forma primária, apenas por replicação passiva. Em termos de persistência, uma célula pode conter seus próprios clusters de bancos de dados relacionais, sistemas de arquivos locais ou repositórios de dados necessários para cumprir sua função de negócio. 

Cada unidade é independente e lida com um subconjunto específico das requisições totais do sistema, e pode ter unidades passivas que assumem a liderança dos dados replicados em caso de falha da celula principal. 

# Replicação Celular

No modelo celular a replicação é direcionada para a criação de células passivas que atuam como espelhos de células ativas nos requitos de dados. Cada célula é projetada como uma unidade auto-contida, incluindo todos os componentes de execução e armazenamento necessários para sua operação independente, porém podemos assumir conjuntos de celulas passivas que recebem os dados de celulas ativas, prioritariamente com consistencia eventual e replicação assincrona através de componentes adicionais, ou com consistencia forte, criando um modelo transacional de "Two-Phase Commit", garantindo que todas as celulas participantes da replicação celular irão confirmar a transação ou ela será inteiramente abortada.

O foco na replicação para células passivas garante que falhas críticas como bugs, erros de deploy ou as chamadas poison pill requests (requisições corrompidas que derrubam o serviço) sejam contidas dentro da fronteira da célula afetada, mas que o cliente seja redirecionado para uma celula passiva para qual seus dados estejam sendo replicados de forma transparente. Como cada célula atende a apenas um subconjunto das requisições totais, assumindo um roteamento forte por chave de partição, a perda de uma célula principal não resulta em um apagão da experiência do cliente. 

## Replicação Assincrona entre Células

A replicação assíncrona entre células de uma arquitetura desse tipo é o modelo mais comum dentro de arquiteturas celulares, principalmente quando podemos abrir mão de uma consistencia forte nos critérios de alta disponibilidade e tolerância a falhas. Nesse modelo, a célula ativa é a fonte primária de escrita, enquanto células passivas recebem atualizações de estado por meio de streams de eventos, logs de mudança ou filas assíncronas.

O custo desse modelo é a aceitação da consistência eventual. O objetivo dessa estratégia é a propagação dos dados entre as células ativas e passivas fora do que consideramos o "caminho crítico" transacional do cliente, permitindo que as operações da célula continuem atendendo com baixa latência, mesmo sob carga elevada e saturação da célula em carga. Em uma falha súbita da célula ativa, a célula passiva pode assumir com um pequeno atraso de estado. 

## Replicação Consistente entre Células 

A replicação consistente entre células surge quando o domínio de negócio não tolera divergência de estado, mesmo que temporária em uma eventual mudança de responsabilidade entre uma celula ativa e passiva. Nesses cenários, a arquitetura celular precisa incorporar mecanismos de coordenação distribuída, como Two-Phase Commit (2PC) ou variações mais modernas de consenso para garantir um estado transacional em todas as celulas do conjunto do contexto.

Esse modelo assume mais complexidade e riscos, onde múltiplas células participam de uma transação distribuída, garantindo que o estado só seja considerado confirmado quando todas as células envolvidas reconhecem a operação, e em caso qualquer participante falhe, a transação inteira é abortada, preservando uma integridade global. 

Embora conceitualmente elegante, esse modelo introduz acoplamento temporal entre células, aumenta a latência e reduz a capacidade de isolamento absoluto de falhas. Por isso, sua aplicação deve ser extremamente criteriosa, restrita a fluxos realmente críticos e evitando um volume que possa desencadear uma saturação em cascata em todas as células participantes do conjunto.

## Replicação e Shuffle Sharding

A combinação de arquitetura celular com shuffle sharding representa uma das estratégias mais eficientes para reduzir impacto sistêmico em larga escala e aplicar a replicação cross-celular.

Em vez de associar cada cliente ou tenant a uma única célula fixa, o shuffle sharding mapeia cada entidade a um subconjunto estável de células, calculado por hashing consistente. Assim, um cliente interage apenas com um pequeno grupo de células, e não com o sistema inteiro, assumindo que seus dados estão replicados entre todas elas de forma consistente ou assincrona.

## Replicação e Blast Radius

A principal virtude da arquitetura celular, quando combinada com replicação, é a previsibilidade do impacto de falhas.

Como vimos no exemplo dos Bulkheads, se uma carga de trabalho é distribuída igualmente entre 10 shards e uma delas falha, 90% dos usuários ou recursos permanecem operacionais e inalterados. Quando confrontamos com a proposta da Arquitetura Celular com replicacão, 

A literatura clássica de sistemas distribuídos mostra que a replicação é um mecanismo-chave para garantir disponibilidade e continuidade operacional, permitindo que o sistema mantenha o serviço mesmo diante de falhas de nós ou partições de rede. 

Do ponto de vista conceitual, células podem ser compreendidas como domínios de falha isolados, alinhados ao padrão arquitetural de bulkheads, cujo objetivo é compartimentalizar o impacto de incidentes

# Estratégias de roteamento e direcionamento para células

## Células e segmentação de carga


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