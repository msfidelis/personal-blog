---
layout: post
image: assets/images/system-design/capa-bulkheads.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering ]
title: System Design - Bulkhead Pattern
---


# Definindo Bulkheads 

O Bulkhead Pattern é um padrão arquitetural de contenção de falhas, mas que seu objetivo central não é evitar que falhas aconteçam, mas garantir que uma eventual adversidade em uma parte do sistema não se propague e comprometa ele por inteiro. Ele parte do pressuposto de que falhas são inevitáveis em sistemas distribuídos e, portanto, devem ser estruturalmente esperadas, limitadas e absorvidas em diversas dimensões.  A essência do Bulkhead não está em mecanismos de retry, timeout ou fallbacks, mas na separação explícita de destinos operacionais. Quando corretamente aplicado, o sistema deixa de ser um bloco homogêneo e passa a se comportar como um conjunto de compartimentos independentes, cada um com capacidade, escalabilidade, limites e impacto bem definidos.

## Bulkheads e a Engenharia Naval 

![Bulkhead Naval](/assets/images/system-design/bulkhead-naval.jpg)

O termo Bulkhead tem sua origem na engenharia naval. Dentro dela, bulkheads são paredes estruturais internas que dividem o casco de um navio em compartimentos isolados, para que se por ventura ocorra um dano no casco eum compartimento for perfurado, apenas aquela seção se enche de água, preservando a flutuabilidade do restante da embarcação. O objetivo dessa estratégia não é impedir que o dano aconteça, mas impedir sua propagação e por sua vez o naufrágio completo da embarcação. Esse mesmo raciocínio se aplica também a sistemas críticos de larga escala, e então foi portado para a engenharia de software como conceito a ser estudado e entendido. 

## Bulkheads e a Arquitetura de Software 

![Bulkhead Tradicional](/assets/images/system-design/bulkhead-tradicional.png)

O Bulkhead Pattern é um padrão de design de resiliência aplicado em microsserviços que tem como objetivo isolar falhas e impedir que um problema em um componente derrube todo o sistema, e na arquitetura de software, um bulkhead representa uma separação explicita e delimitada de recursos e de destino de execução de transação. A ideia é segregar pools de recursos específicos para evitar que a saturação ou falha de um componente afete outros domínios ou segmentações de clientes de todo o sistema, e representa uma separação explícita de recursos e destinos de execução.  

Um erro conceitual recorrente é imaginar que bulkheads precisam existir em apenas uma camada do sistema. Na prática, sistemas resilientes aplicam o mesmo princípio de isolamento de forma consistente ao longo da stack. É comum observar separação no nível de aplicação, mas não no banco de dados ou isolamento de infraestrutura, mas compartilhamento de filas ou tópicos.

O Bulkhead pode ser aplicado em diferentes dimensões, como pools de thread, filas, tópicos, pools de conexão, bandos de dados, VM's, containers, clusters ou shards. Se dois fluxos compartilham os mesmos recursos, as mesmas conexões ou databases, os mesmos não possuem bulkheads, pois a falha de um fluxo inevitávelmente se propaga para os outros. 

Quando aplicado de forma correta, o sistema deixa de ser visto como um bloco único, altamente acoplado e representante de todas as operações do sistema e passa a se comportar como blocos e partições independentes, cada um com sua própria capacidade, limites, escalabilidade e funcionalidades e usuários bem definidos. 

<br>

# Implementações e Contenção de Falhas 

Bulkheads podem ser implementados em diferentes níveis da arquitetura, mas todos compartilham o mesmo objetivo: impedir que a saturação de um recurso consuma a capacidade global do sistema. A implementação correta exige clareza sobre quais recursos são finitos e como eles devem ser particionados. Para a melhor implementação, a estratégia de bulkheads exige clareza sobre quais recursos são finitos, quais são críticos e como eles devem ser particionados, e assim definir formas de como identificar, redirecionar, redistribuir e monitorar o tráfego e operações nesses compartimentos distintos. 

![Contenção](/assets/images/system-design/Scale-Bulkhead-Falhas.png)

## Recursos Lógicos

Bulkheads lógicos atuam sobre recursos de execução e concorrência, como threads, filas, conexões e limites de requisição. São os mais comuns e, ao mesmo tempo, os mais frequentemente mal implementados. 

Um exemplo é o uso de thread pools dedicados para diferentes tipos de operação. Sem bulkhead, uma operação lenta ou bloqueante pode consumir todas as threads disponíveis e gerando gargalos e filas internas, acarretando em uma saturação e problemas de performance. Com pools dedicados, a falha fica confinada ao fluxo que a originou. 

Outro exemplo são filas e tópicos independentes por domínio, evitando que um pico de mensagens em um fluxo impeça o processamento de eventos críticos em outro. Com pools e "gatilhos" sistemicos segregados, cada tipo de operação possui um limite claro de concorrência. Quando esse limite é atingido, apenas aquele fluxo degrada, enquanto os demais continuam operando dentro de parâmetros aceitáveis. O mesmo raciocínio se aplica a filas e tópicos independentes por domínio ou clientes, evitando que picos de eventos não críticos atrasem ou bloqueiem fluxos essenciais que são criticos para outro tipo de público ou domínio.

Bulkheads lógicos são frequentemente confundidos com simples aplicações de rate limiting ou com limites globais de concorrência. No entanto, a diferença fundamental está no escopo do impacto. Um limite global protege o sistema como um todo, mas não protege os fluxos críticos entre si. Já o bulkhead lógico cria fronteiras internas, onde cada fluxo opera dentro de sua própria capacidade alocada.

No dia a dia de um time de engenharia, isso se traduz em decisões como pools de threads separados para leitura e escrita, filas distintas para eventos críticos e não críticos, ou até mesmo executores dedicados para integrações externas sabidamente instáveis. Um serviço que consome múltiplas APIs de terceiros, por exemplo, não deveria permitir que a lentidão de uma integração consuma os recursos responsáveis por operações internas além desse processo. Cada integração externa representa, por definição, uma superfície de risco distinta e, portanto, merece seu próprio compartimento lógico.

## Recursos Físicos 

![Bulkhead Fisico](/assets/images/system-design/bulkhead-types.png)

Bulkheads físicos envolvem a separação concreta de infraestrutura, como servidores, nodes, instâncias, zonas de disponibilidade ou até regiões. Aqui, o isolamento passa a ser definitivamente estrutural. Por exemplo, alocar workloads críticos e não críticos nos mesmos nós de um cluster cria um shared fate implícito. A saturação de CPU ou memória por um workload pode derrubar todos os outros. Separar esses workloads em pools de nós distintos cria um bulkhead físico que protege o sistema como um todo. Esse tipo de isolamento é mais caro, mas fornece garantias mais fortes, especialmente em sistemas de alta criticidade. 

![Bulkhead Cluster](/assets/images/system-design/bulkhead-cluster.png)

No dia a dia, isso aparece de forma clara em clusters Kubernetes, ambientes de virtualização ou até mesmo em servidores bare metal. Um workload mal dimensionado, com vazamento de memória ou comportamento não linear sob carga, pode pressionar o kernel, o scheduler ou o hypervisor, afetando todos os serviços alocados por tabela. Nesse ponto, nenhum thread pool ou fila dedicada é suficiente para conter a falha, é necessária uma segregação física dos recursos. O critério utilizado para isso pode e deve variar, como por exemplo tipos de clientes, segmentos, prioridade, criticidade, hashing consistente, identificaçadores e etc.

Bulkheads físicos surgem como resposta a esse tipo de risco. Separar workloads críticos em pools de nós dedicados, usar clusters distintos para domínios com SLOs incompatíveis ou até isolar componentes por região são decisões que aumentam custo, mas reduzem drasticamente o blast radius.

## Bulkheads em Camadas Diferentes da Arquitetura

<br>

# Bulkheads e Shardings 

Sharding é uma das formas mais poderosas e perigosas de implementar bulkheads. Quando bem aplicado, oferece isolamento estrutural, e quando mal projetado, cria acoplamentos invisíveis que só se manifestam sob estresse e acabam não impedindo a propagação de falha de um recurso isolado. Aqui precisamos segregar todos os recursos fisicos que podem compor o bulkhead, como balanceadores de carga, aplicações, bancos de dados, tópicos, filas e afins e criar réplicas literais dedicadas apenas para aquele bulkhead, de forma que os fluxos iniciados em uma segmentação do bulkhead permaneça no mesmo até o fim da execução, e assim não ofereça risco de performance e disponibilidade por conta de saturação de uso daquela partição específica do sistema. Outros bulkheads devem estar aptos para executar as mesmas funções porém com capacidade isolada para outros tipos de públicos e operações. 

## Sharding Funcional 

No sharding funcional, o sistema é dividido por domínio de negócio. Cada shard atende a um conjunto específico de funcionalidades, com recursos próprios e limites bem definidos.
Por exemplo, separar processamento de pagamentos, consultas e relatórios em shards distintos evita que um pico analítico degrade operações críticas de transação. Aqui, o bulkhead é alinhado ao valor de negócio.

![Sharding Funcional](/assets/images/system-design/bulkhead-funcional.png)

É razoavelmente comum segregar bulkheads específicos para operações transacionais e just-in-time e uma separação dedicada para processamento de lotes e batches. Inserir uma quantidade gigante de processos em repouso para concorrer com fluxos que possuem SLO's e contratos de tempos de resposta e disponibilidade transacionais podem acabar gerando saturação e ofendendo os indicadores, desse modo podemos ter infraestrutura dedicada dentro do possível para direcionar as solicitações em batch ou de sincronização agendadas de outros domínios e parceiros e outra segregada para as operações convencionais do sistema. 

Outra estratégia é ter infraestrutura dedicada para diversas prioridades de processamento do mesmo tipo de transação, tendo formas de dedicar capacidade exclusiva para transações prioritárias, normais e de baixa prioridade, de forma que se em caso de um spike ou burst de solicitações normais ou de baixa prioridade chegem ao sistema, não comprometam as solicitações enviadas para o bulkhead de alta prioridade. 

## Sharding Operacional 

No sharding operacional, a divisão ocorre por volume ou características de carga, não por função. Exemplos comuns incluem sharding por identificadores de cliente, região ou faixa de tráfego.
Esse modelo é eficaz para limitar o blast radius de picos localizados, mas exige cuidado com operações globais, que podem atravessar múltiplos shards e reintroduzir acoplamento. É comum que shards sejam bem isolados no início, mas gradualmente passem a compartilhar dependências globais, como serviços de configuração, catálogos ou bancos de dados auxiliares. Esses pontos se tornam canais ocultos de acoplamento.

![Sharding Operacional](/assets/images/system-design/bulkhead-operacional.png)

## Sharding e Isolamento por Tenants

Isolar tenants vai muito além de separar dados dos mesmos em tabelas ou instâncias de dados diferentes. Trata-se de garantir que o comportamento de consumo, erros ou picos de um tenant não alterem o perfil operacional dos demais. Em plataformas SaaS, isso frequentemente significa criar limites explícitos de capacidade por tenant, combinando bulkheads lógicos e físicos conforme o nível de criticidade e monetização.

![Bulkhead Tenant](/assets/images/system-design/bulkhead-tenant.png)

Podemos ter replicas inteiras de toda a infraestrutura dedicada para cada um dos tenants, que são roteados através de regras de balanceamento, ingress ou DNS, isolando totalmente a operação dos mesmos para evitar Noisy Neighbor. 

No mundo real, é comum observar plataformas que isolam dados, mas compartilham integralmente threads, filas e infraestrutura. O resultado é que um único cliente com comportamento anômalo pode comprometer toda a experiência da plataforma. Bulkheads por tenant transformam esse risco em um problema localizado, onde a degradação é previsível, mensurável e, principalmente, negociável do ponto de vista de negócio.

### Noisy Neighbor

O problema do "noisy neighbor", ou vizinho barulhento, surge quando múltiplos tenants compartilham os mesmos recursos físicos e lógicos e o comportamento de um impacta negativamente os demais. Sem bulkheads, basta um tenant com desvio de comportamento e saturação acima do previsto para degradar toda a plataforma.
Esse problema é especialmente crítico em plataformas SaaS e ambientes multi-tenant de alta escala. 

<br>

# Distribuição de Bulkheads 

| Bulkheads | Blast Radius | Disponibilidade | Impacto     |
|--------: |-------------:|----------------:|-------------|
| 1       | 100%         | 0%              | Total       |
| 2       | 50%          | 50%             | Muito alto  |
| 3       | 33%          | 66%             | Alto        |
| 5       | 20%          | 80%             | Moderado    |
| 10      | 10%          | 90%             | Moderado    |
| 20      | 5%           | 95%             | Baixo       |
| 50      | 2%           | 98%             | Muito Baixo |
| 100     | 1%           | 99%             | Mínimo      |


<br>

### Referências 

[Bulkhead Pattern — Distributed Design Pattern](https://medium.com/nerd-for-tech/bulkhead-pattern-distributed-design-pattern-c673d5e81523)

[Bulkhead Pattern in Microservices](https://www.systemdesignacademy.com/blog/bulkhead-pattern)

[Bulkhead pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead)

[Building a fault tolerant architecture with a Bulkhead Pattern on AWS App Mesh](https://aws.amazon.com/blogs/containers/building-a-fault-tolerant-architecture-with-a-bulkhead-pattern-on-aws-app-mesh/)

[Bulkhead Pattern](https://www.geeksforgeeks.org/system-design/bulkhead-pattern/)

[Failsafe - Bulkhead Go](https://failsafe-go.dev/bulkhead/)