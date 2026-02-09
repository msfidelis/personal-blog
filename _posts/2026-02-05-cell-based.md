---
layout: post
image: assets/images/system-design/capa-bulkheads.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering ]
title: System Design - Cell-Based Architecture
---

# Definindo a Arquitetura Celular

O modelo de Arquitetura Celular é um modelo de arquitetura descentralizada onde as capacidades de uma organização são estruturadas em uma rede de células independentes e auto-contidas, como uma evolução do que entendemos pelo [Bulkhead Pattern](/bulkheads).

O conceito que conecta os bulkheads a arquitetura celular em sistemas complexos é a proposta de criar fronteiras de isolamento de falhas, garantindo que o impacto de um erro seja restrito a um número limitado de componentes, sem afetar o restante do ecossistema, com o adicional de componentes de replicação de dados entre células para conter ainda mais o escopo de uma eventual falha isolada. 

# Unidades Celulares 


## Dimensão estrutural de uma celula

Uma célula é um compilado de um ou mais componentes (microsserviços, funções, databases, gateways, etc.) agrupados desde o design até a implementação e implantação. Estruturalmente, ela possui as características de isolamento e independência, onde cada celula, ou conjunto de celulas, é responsável por atender uma parcela determinada do publico de forma autocontida, e toda comunicação externa deve ocorrer obrigatoriamente através de um gateway de borda ou proxy, que expõe APIs, eventos ou streams de dados. 

Os componentes internos comunicam-se de forma contínua intra-celular, enquanto dependências externas são mediadas pelo gateway da célula. Os componentes internos da celula só podem conhecer e se comunicar com componentes da propria célula, nunca de outra. Cada célula possui um nome e um identificador de versão único, facilitando o gerenciamento de dependências no ecossistema distribuído e resiliente. 

## Isolamento de estado 

Uma característica deterministica da implementação da arquitetura celular, é que as células não compartilham estado com outras células de forma primária, apenas por replicação passiva. Em termos de persistência, uma célula pode conter seus próprios clusters de bancos de dados relacionais, sistemas de arquivos locais ou repositórios de dados necessários para cumprir sua função de negócio. +

Cada unidade é independente e lida com um subconjunto específico das requisições totais do sistema, e pode ter unidades passivas que assumem a liderança dos dados replicados em caso de falha da celula principal. 

# Replicação Celular

No modelo celular a replicação é direcionada para a criação de células passivas que atuam como espelhos de células ativas nos requitos de dados. Cada célula é projetada como uma unidade auto-contida, incluindo todos os componentes de execução e armazenamento necessários para sua operação independente, porém podemos assumir conjuntos de celulas passivas que recebem os dados de celulas ativas, prioritariamente com consistencia eventual e replicação assincrona através de componentes adicionais, ou com consistencia forte, criando um modelo transacional de "Two-Phase Commit", garantindo que todas as celulas participantes da replicação celular irão confirmar a transação ou ela será inteiramente abortada. 

## Replicação e Blast Radius

# Estratégias de roteamento e direcionamento para células

## Células e segmentação de carga


### Referências

[A Crash Course on Cell-based Architecture](https://blog.bytebytego.com/p/a-crash-course-on-cell-based-architecture)

[Mastering Cell-Based Architecture for Modern Enterprises](https://wso2.com/library/conference/2025/07/mastering-cell-based-architecture-for-modern-enterprises)

[Cell-Based Architecture Reference](https://github.com/wso2/reference-architecture/blob/master/reference-architecture-cell-based.md)

[Cloud Native Middleware: Domain-Driven Design, Cell-Based Architecture, Service Mesh, and More](https://wso2.com/library/conference/2024/05/cloud-native-middleware-domain-driven-design-cell-based-architecture-service-mesh-and-more/)

[Reference Architecture for Agility, Version-0.9](https://wso2.com/wso2_resources/wso2-reference-architecture-for-agility-version-0-9.pdf)

[What is a cell-based architecture?](https://docs.aws.amazon.com/wellarchitected/latest/reducing-scope-of-impact-with-cell-based-architecture/what-is-a-cell-based-architecture.html)

[Guidance for Cell-Based Architecture on AWS](https://aws.amazon.com/solutions/guidance/cell-based-architecture-on-aws/)

[Two-Phase Commit](https://martinfowler.com/articles/patterns-of-distributed-systems/two-phase-commit.html)