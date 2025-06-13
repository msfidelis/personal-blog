---
layout: post
image: assets/images/system-design/capa-cap.png
author: matheus
featured: false
published: true
categories: [ system-design, databases, engineering ]
title: System Design - Teorema CAP, ACID, BASE e Bancos de Dados Distribuídos
seo_title: Teorema CAP — Consistência, Disponibilidade e Tolerância à Partições em Sistemas Distribuídos
seo_description: Entenda o que é o Teorema CAP, como ele impacta o design de sistemas distribuídos e como escolher entre consistência, disponibilidade e tolerância a partições em cenários reais.
excerpt: Neste artigo, descomplicamos o Teorema CAP, explicando como os princípios de consistência, disponibilidade e tolerância à partições afetam a arquitetura e as decisões técnicas em sistemas distribuídos modernos.
---

Esse é mais um artigo da série de **System Design**, que está se mostrando extremamente prazerosa de escrever. Tem sido muito gratificante me desafiar a entender temas densos e complexos e simplificar suas explicações. Da ultima vez falamos sobre [Concorrência, Paralelismo e Multithreading](), hoje não consegui gerar exemplos tão didáticos para o mundo real quando nesse artigo, mas ainda assim espero de coração que você ainda saia com algum conhecimento bacana daqui. 

Hoje vamos abordar alguns tópicos muito importantes relacionados à arquitetura de bancos de dados. Discutiremos o Teorema CAP, desde sua concepção até outros tópicos que tangenciam este tema, e, por fim, reavaliaremos a evolução do teorema muitos anos após sua publicação, comparando-o com soluções modernas e a evolução contínua da engenharia de software.


# O Teorema CAP 

O Teorema CAP é uma sigla para **Consistency, Availability, and Partition Tolerance** (Consistência, Disponibilidade e Tolerância a Partições), e representa um princípio fundamental para compreender a arquitetura e as limitações na escolha de uma base de dados.

Esse modelo foi proposto por **Eric Brewer** da **Universidade da Califórnia** durante uma conferência no ano 2000. O teorema foi crucial para influenciar escolhas arquiteturais em bancos de dados distribuídos.

O teorema propõe que, na perspectiva de sistemas distribuídos, um banco de dados só pode entregar dois dos três atributos descritos no CAP. Isso é análogo à máxima popular de ***"Escolha 2: Bom, Rápido e Barato"***. Se for **Bom e Barato, não vai Rápido**. Se for **Rápido e Bom não vai ser Barato**. Se for **Barato e Rápido não vai ser Bom**. A proposta inicial segue essa lógica. 

Ele fornece uma base para entender as limitações inerentes a qualquer sistema de banco de dados distribuído e ajuda a esclarecer por que não é possível atingir todas as três propriedades simultaneamente. Vamos explorar o modelo proposto comparando com abordagens mais modernas ao longo deste artigo.

Para entender a concepção completa de todas as propriedades do terema CAP, precisamos explorar alguns conceitos que irão ajudar na sua compreesão. Antes de detalhar o que significa cada item do CAP, é necessário entender os conceitos de **ACID** e **BASE** e compreender como funcionam transações e operações dentro dos bancos de dados. 

<br>

# ACID e BASE, os trade-offs entre SQL e NoSQL

Nas disciplinas de bancos de dados, dois conjuntos de conceitos são fundamentais para guiar o design e a gestão das transações e/ou consultas: **ACID** e **BASE**.

Entender a diferença entre ambos é crucial para qualquer pessoa que trabalhe com engenharia ou arquitetura, e que deseje trabalhar de forma eficiente com bancos de dados distribuídos, além da escolha de uma tecnologia específica.

Vamos começar detalhando sobre ACID. 

## Modelo ACID - Atomicity, Consistency, Isolation, Durability

Quando falamos sobre ACID, um acrônimo para **Atomicidade**, **Consistência**, **Isolamento** e **Durabilidade**, estamos nos referindo a bancos de dados que **proporcionam operações transacionais processadas de forma atômica e confiável**, em troca, talvez, de outras propriedades possíveis em requisitos diferentes. É o caso dos bancos de dados SQL tradicionais, onde a consistência e o commit das transações de escrita são priorizados em detrimento da performance e disponibilidade.

Os itens do ACID são definidos da seguinte forma: 

### Atomicidade

A **atomicidade assegura que cada transação seja tratada como uma unidade indivisível**, ou seja, **todas as operações de escrita dentro de uma transação devem ser concluídas com sucesso; caso contrário, nenhuma delas será efetivada.**

Uma transação pode conter uma ou mais queries que correspondem a uma lógica ou funcionalidade de negócio específica. Por exemplo, imagine um **sistema simples que registra vendas de um e-commerce**. Recebemos um evento fictício que representa a venda de um produto qualquer, no qual precisamos decrementar o estoque desse produto e registrar a venda. Nesse caso, seriam duas operações: **decrementar o contador de estoque** do produto numa tabela chamada `estoque` e, em seguida, **fazer um INSERT** em uma tabela chamada `vendas`. Ambas as operações precisam ser concluídas de forma dependente, pois tanto atualizar o estoque sem registrar a venda quanto registrar a venda sem atualizar o estoque podem gerar problemas de consistência logística e contábil para o e-commerce, além de transtornos para o cliente. Esse é o real benefício das transações, que garantem a atomicidade no modelo ACID.


```go
package main

import (
    "database/sql"
    "log"

    _ "github.com/go-sql-driver/mysql"
)

func main() {
    // Representa uma conexão com o banco de dados MySQL 
    db, err := sql.Open("mysql", "username:password@tcp(host:port)/dbname")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    // Iniciando a Transação
    tx, err := db.Begin()
    if err != nil {
        log.Fatal(err)
    }

    // Representação do produto vendido
    produtoID := 1
    quantidadeVendida := 10

    // 1ª Operação: Atualizar o estoque do produto
    _, err = tx.Exec("UPDATE produtos SET estoque = estoque - ? WHERE id = ?", quantidadeVendida, produtoID)
    if err != nil {
        tx.Rollback() // Em caso de falha, é efetuado o rollback de todas as queries dentro da transaction
        log.Fatal(err)
    }

    // 2ª Operação: Registrar a venda
    _, err = tx.Exec("INSERT INTO vendas (produto_id, quantidade) VALUES (?, ?)", produtoID, quantidadeVendida)
    if err != nil {
        tx.Rollback() // Em caso de falha, é efetuado o rollback de todas as queries dentro da transaction
        log.Fatal(err)
    }

    // Se chegou até aqui, ambas as operações foram bem-sucedidas. Então, faz commit.
    err = tx.Commit()
    if err != nil {
        log.Fatal(err)
    }
}

```

### Consistência

A consistência em um banco de dados refere-se à **garantia de que todas as transações conduzam o banco de dados de um estado consistente para outro estado igualmente consistente**. Esta definição, embora elegante, pode ser difícil de compreender inicialmente. Em termos práticos, a **consistência nos assegura a integridade dos dados, evitando dados corrompidos ou inválidos**. Isso significa que, em nenhum momento, o banco de dados operará com dados desatualizados ou indisponíveis na visão do cliente.

O nível de consistência também **garante a validação das transações, conforme discutido no tópico de atomicidade**, além de respeitar restrições e condições impostas durante a modelagem dos dados. Na prática, isso se traduz na **garantia de que todas as foreign keys, especificações de nullabilidade, triggers e tipos sejam respeitados em todo momento**. Por exemplo, uma tentativa de inserir uma string em um campo do tipo decimal resultará em um erro de validação, ou a garantia de que um valor nunca será menor que zero ou excederá um determinado tamanho.

### Isolamento

O isolamento, em nível transacional nos bancos de dados no modelo ACID, refere-se à capacidade de uma transação operar independentemente de outras transações simultâneas, ou seja, a garantia de que várias transações ocorrendo ao mesmo tempo não interfiram umas nas outras.

Existem diversos níveis de isolamento, mas todos visam prevenir situações como **Dirty Reads**, onde uma transação de leitura acessa dados que foram inseridos ou modificados por outra transação ainda não confirmada; **Non-repeatable Reads**, onde a mesma transação lê os mesmos dados mais de uma vez e obtém resultados diferentes devido a outra transação de escrita concluída entre essas leituras; e **Phantom Reads**, onde a re-execução da mesma leitura em uma transação recupera dados que não existiam na primeira leitura, devido ao mesmo motivo.

O maior desafio a nível arquitetural é encontrar o equilíbrio certo entre isolamento e desempenho no design de sistemas de banco de dados. Níveis mais altos de isolamento tendem a reduzir a concorrência e podem afetar o desempenho, enquanto níveis mais baixos podem aumentar a concorrência, mas com riscos de inconsistência.

### Durabilidade

A durabilidade, no modelo ACID, é o pilar que garante que, uma vez confirmada, uma transação permanecerá assim permanentemente. Isso significa que, após a confirmação de uma operação de escrita, ela não será perdida mesmo diante de diversas possibilidades de falha, assegurando a persistência dos dados em uma fonte não volátil, como disco rígido, e não apenas em armazenamento volátil, como memória, que pode ser perdida caso o servidor desligue.

Ela é fundamental para a confiabilidade do sistema, especialmente em aplicações onde a perda de dados pode ter consequências sérias.


<br>

## Modelo BASE - Basically Available, Soft State, Eventual Consistency

Enquanto o ACID foca na precisão e confiabilidade, o BASE, um acrônimo para **Basicamente Disponível**, **Soft State** e **Eventualmente Consistente**, adota uma abordagem com níveis de **flexibilidade mais adequados para lidar com sistemas distribuídos modernos**, onde a disponibilidade e a tolerância a falhas são prioridades. Assim como o Teorema CAP, o **BASE** também foi proposto por Brewer junto a um grupo de pesquisadores. 

### Basicamente Disponível

O termo **Basicamente Disponível** implica que o sistema é projetado para maximizar a disponibilidade, mas não garante uma disponibilidade total e ininterrupta. Em outras palavras, o sistema será acessível na maior parte do tempo, mas pode haver momentos em que alguns dados ou funcionalidades não estejam disponíveis, devido a falhas de rede, manutenção ou particionamento de dados.

Para alcançar essa disponibilidade, os dados são frequentemente particionados e replicados em múltiplos servidores. Isso permite que, mesmo se uma parte do sistema falhar, outras partes continuem funcionando.

Bancos de dados NoSQL, como Dynamo, Cassandra ou MongoDB, empregam estratégias de replicação e particionamento para garantir que os dados estejam disponíveis mesmo quando alguns nós do cluster falham.

Essa abordagem é ideal para ambientes de larga escala e alta demanda, onde a capacidade de lidar com falhas parciais e a necessidade de manter a operação contínua são mais críticas do que manter uma consistência estrita dos dados em todos os momentos.


### Soft State

O conceito de **Soft State** se refere à ideia de que o estado do sistema pode mudar ao longo do tempo, mesmo sem uma entrada externa ou uma intervenção intencional. Em um sistema operando sob o princípio de "Soft State", os dados podem expirar ou ser atualizados automaticamente, e não há garantia de que as informações permaneçam consistentes se não forem atualizadas ou verificadas periodicamente. Esse princípio reconhece que manter a consistência rigorosa em todos os momentos pode ser impraticável ou desnecessária para certos tipos de aplicações e dados.

Em sistemas que aplicam o Soft State, os dados podem se autogerenciar, autodeletar e autoatualizar. Essa abordagem é comum em sistemas de cache distribuído, como **Memcached**, **Redis**, onde os dados armazenados são frequentemente considerados como tendo um "Soft State". Eles podem ser substituídos ou expirar com o tempo para refletir mudanças no estado dos dados originais.

### Eventualmente Consistente

A **Consistência Eventual** descreve que as escritas realizadas em um determinado dado em um sistema de banco de dados distribuído serão replicadas para todos os nós de forma assíncrona. Isso significa que, por algum tempo, diferentes nós podem ter versões diferentes dos mesmos dados. O termo "eventual" nesse contexto é a garantia de que, se nenhuma nova alteração for feita em um dado por um certo período, todos os dados distribuídos entre os nós se tornarão consistentes em algum momento.

Este modelo é adequado para sistemas que operam em redes com latência significativa ou onde falhas de nós são comuns, permitindo que o sistema continue operacional apesar de inconsistências temporárias.

A consistência eventual é crucial para sistemas que precisam escalar para lidar com grandes volumes de tráfego ou grandes conjuntos de dados. Ela permite uma operação mais eficiente em larga escala, por isso muitos bancos de dados NoSQL, projetados para esse tipo de demanda, como Cassandra e DynamoDB, utilizam a consistência eventual para proporcionar alta disponibilidade e escalabilidade, sendo especialmente útil em aplicações web de larga escala.


<br>

# Explicação dos Componentes do CAP

Agora que já exploramos os conceitos e aplicações de **ACID** e **BASE**, podemos traçar um paralelo mais claro com as combinações de funcionalidades propostas no Teorema CAP. Vamos detalhar cada um dos componentes da sigla tentando gerar familiaridade com ambos os conceitos:

## Consistency / Consistência (C)

O nível de **Consistência** refere-se à garantia de que todos os nós de um banco de dados distribuído exibam os mesmos dados simultaneamente. Isso significa que, independentemente de qual nó seja consultado, todos retornarão sempre a versão mais recente dos dados.

Imagine uma situação onde uma operação de escrita precise aguardar a confirmação de replicação de todos os nós para concluir a transação e liberar o dado para consulta.

A consistência é essencial em aplicações onde a atomicidade e a atualização dos dados são partes críticas da solução, como em sistemas financeiros e registros hospitalares.

<br>

## Availability / Disponibilidade (A)

O nível de **Disponibilidade** assegura que todas as solicitações feitas ao sistema **receberão uma resposta**, independentemente de os dados estarem atualizados no nó consultado ou não.

Quando a disponibilidade é priorizada em uma escolha arquitetural, geralmente se presume que o dado retornado pode não ser o mais recente, desde a operação de escrita até a de leitura.

Isso significa que as operações de escrita e leitura podem atuar de forma independente uma das outras. Ou seja, a solicitação de escrita pode ser concluída antes de todo o processo de replicação entre os nós estar completo.

Este atributo é particularmente valioso em sistemas que exigem alta performance, volumosa ingestão de dados e tempos de resposta rápidos, como em fluxos de streaming e análise de dados (analytics).

Os sistemas alcançam a disponibilidade dos dados normalmente através da replicação, que consiste em "duplicar" as informações entre os nós disponíveis.


<br>

## Partition Tolerance / Tolerância a Partições (P)

O nível de **Tolerância a Partições** refere-se à capacidade de um banco de dados distribuído continuar operacional, apesar de falhas que "particionem" a rede e duas ou mais partes que não conseguem mais se comunicar.

Em ambientes distribuídos, é cada vez mais necessário assumir que falhas de rede, hardware, atualizações programadas e de segurança emergencial feitas pelos provedores podem ocorrer a qualquer momento. Um sistema tolerante a partições é capaz de oferecer um certo nível de continuidade do serviço em caso de falhas parciais.

Esse atributo é particularmente valioso em aplicações distribuídas geograficamente, redes sociais, agregadores de logs, brokers de eventos, sistemas de filas, entre outros.

### O que é uma Partição de Rede?

O termo "partição" pode gerar confusão, especialmente quando já estamos familiarizados com outros termos de Bancos de Dados. Porém, no contexto de "CAP" e "Tolerância a Partições", **Partição de Rede** refere-se a uma situação onde ocorre uma falha sistêmica de rede entre dois ou mais nós do banco de dados, impedindo que eles permaneçam sincronizados e gerando uma inconsistência temporária. Isso se torna mais complexo quando a escrita é distribuída entre os nós.

Frequentemente, em um cluster otimizado para tolerância a partições, é possível isolar um nó do restante do cluster para executar manutenção, troubleshooting, adição de recursos ou atualização. Após a conclusão, esse nó é reintegrado ao cluster, passando por um processo de sincronização para retomar a operação consistente com os demais.


<br>

# As combinações do Teorema: "Escolha 2"

## CP (Consistência e Tolerância a Partições)

Nesta configuração, o sistema prioriza a consistência e a tolerância a partições, sacrificando a disponibilidade.

O sistema mantém a consistência através de todos os nós que continuam operando em caso de falhas de rede ou partições. Quando uma partição ocorre entre dois ou mais nós, o sistema deve ter a capacidade de desativar os nós inconsistentes, tornando-os indisponíveis até que a consistência seja restaurada.

Esta abordagem é mais utilizada em situações onde a precisão dos dados é crítica e a atomicidade transacional é inegociável, como em sistemas financeiros, calculadores de crédito, sistemas de controle de estoque, entre outros.

### Exemplos

* [MongoDB](https://www.mongodb.com/)
* [Cassandra - Sob Determinadas Configurações](https://cassandra.apache.org/)
* [Couchbase](https://www.couchbase.com/)
* [Etcd](https://etcd.io/)
* [Consul](https://www.consul.io/)


<br>

## AP (Disponibilidade e Tolerância a Partições)

Nesta configuração, **o sistema prioriza a entrega de alta disponibilidade e tolerância a partições, sacrificando a consistência.**

Quando ocorre uma partição de rede, todos os nós permanecem disponíveis para consultas, independentemente do seu nível de atualização. Mesmo durante os processos de ressincronização, todos os nós continuarão respondendo a solicitações, podendo fornecer dados desatualizados ou não.

Essa abordagem é empregada quando a continuidade da operação é mais importante do que a manutenção de dados consistentes o tempo todo. Exemplos típicos incluem buscas em e-commerces, redes sociais e sistemas de busca.

### Exemplos

* [CouchDB](https://couchdb.apache.org/)
* [DynamoDB](https://aws.amazon.com/dynamodb/)
* [Cassandra - Sob Determinadas Configurações](https://cassandra.apache.org/)
* [SimpleDB](https://aws.amazon.com/simpledb/)


<br>

## CA (Consistência e Disponibilidade)

Nesta configuração, **o sistema prioriza a consistência e a disponibilidade das solicitações, mas torna-se sensível a partições de dados**. Em outras palavras, **se ocorrer uma falha de rede ou partição, o sistema pode ficar completamente inoperante.**

Este tipo de sistema é menos comum em ambientes distribuídos, pois a maioria deles é projetada para lidar com falhas de rede, partições e inconsistências.

Tal abordagem pode ser encontrada em outros tipos de bancos de dados que podem ou não ser distribuídos, variando conforme a necessidade de configuração específica. Exemplos incluem o Redis Standalone e bancos de dados SQL centralizados, como MySQL e PostgreSQL. Este modelo é frequentemente adotado para garantir operações ACID.

### Exemplos

* [MySQL/MariaDB](https://www.mysql.com/)
* [PostgreSQL](https://www.postgresql.org/)
* [Oracle](https://www.oracle.com/database/)
* [SQL Server](https://www.microsoft.com/sql-server/)
* [Redis Standalone](https://redis.io/)
* [Memcached Standalone](https://memcached.org/)

<br>

# Tabela de Flavors (CAP)

Assumindo o que já vimos até aqui, segue uma tabela de refência de diferentes flavors de databases e onde cada uma das opções **melhor** se encaixa dentro da proposta do CAP. 

| Banco de Dados   | Consistência (C) | Disponibilidade (A) | Tolerância a Partições (P) |
|------------------|------------------|---------------------|---------------------------|
| Cassandra        | ❌               | ✅                   | ✅                        |
| MongoDB          | ✅               | ❌                   | ✅                        |
| Couchbase        | ✅               | ❌                   | ✅                        |
| DynamoDB         | ❌               | ✅                   | ✅                        |
| Redis            | ✅               | ✅                   | ❌                        |
| MySQL/MariaDB    | ✅               | ✅                   | ❌                        |
| PostgreSQL       | ✅               | ✅                   | ❌                        |
| Oracle           | ✅               | ✅                   | ❌                        |
| Etcd             | ✅               | ❌                   | ✅                        |
| Consul           | ✅               | ❌                   | ✅                        |
| CockroachDB      | ✅               | ❌                   | ✅                        |
| Riak             | ❌               | ✅                   | ✅                        |
| HBase            | ✅               | ❌                   | ✅                        |
| Neo4j            | ✅               | ✅                   | ❌                        |
| FoundationDB     | ✅               | ❌                   | ✅                        |
| VoltDB           | ✅               | ✅                   | ❌                        |
| ArangoDB         | ✅               | ✅                   | ❌                        |
| FaunaDB          | ✅               | ✅                   | ❌                        |
| Aerospike        | ❌               | ✅                   | ✅                        |
| Amazon Aurora    | ✅               | ✅                   | ❌                        |
| CouchDB          | ❌               | ✅                   | ✅                        |
| SimpleDB         | ❌               | ✅                   | ✅                        |


<br>

# O que mudou depois da concepção do CAP?

Em 2012, Eric Brewer, autor do teorema, publicou um artigo intitulado [CAP Twelve Years Later: How the "Rules" Have Changed](https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/), revisando o que foi proposto em seu trabalho original de 2000 com base na evolução tecnológica das opções de bancos de dados, clouds e arquiteturas de microserviços modernas. Ele lista as lições aprendidas e os conceitos que precisam ser revisitados.

Um dos pontos principais desse artigo é desmistificar a ideia de "2 de 3" entre consistência, disponibilidade e tolerância a partições, considerada enganosa na realidade atual. A formulação inicial do teorema era o já mencionado "Bom, Rápido e Barato, escolha 2". No entanto, segundo o autor, essa visão sugere que as propriedades do sistema são binárias e altamente exclusivas.

A simplificação excessiva das compensações revelou-se limitante nas escolhas de arquitetura ao projetar sistemas modernos. Consistência e disponibilidade, na realidade, não são estados "on-off", mas espectros que oferecem graus variados de realização. 

Ao considerar consistência, disponibilidade e tolerância a partições, é mais produtivo pensar nelas como **propriedades contínuas**, em vez de **estados binários**. Por exemplo, a disponibilidade pode variar de 0 a 100%, e existem muitos níveis de consistência que podem ser explorados em sistemas modernos.

As partições de rede, embora críticas, são eventos relativamente raros em muitos workloads. A interpretação original do teorema sugere que as decisões de design devem presumir a presença constante de partições. Na prática, porém, a maior parte do tempo, os sistemas de bancos de dados operam em um estado não particionado, permitindo que consistência e disponibilidade sejam otimizadas conjuntamente.

Em resumo, o teorema CAP é útil para compreensões e discussões iniciais sobre design e escolhas arquiteturais. No entanto, é uma simplificação enganosa, uma vez que "2 de 3" não são necessariamente exclusivos, permitindo a existência de níveis de consistência e disponibilidade além de um estado binário de "consistente/não consistente", "disponível/não disponível", como demonstrado no modelo **BASE**.

<br>

#### Obrigado aos Revisores 

* [Tarsila, amor da minha vida](https://twitter.com/tarsilabianca_c/)
* [Klecianny Melo](https://twitter.com/Kecbm)
* [Juliana Gaioso](https://twitter.com/juligaioso)
* [Luiz Aoqui, o revisor universal da comunidade](https://twitter.com/luiz_aoqui)

> Imagens geradas pelo DALL-E

<br>

#### Referências 

[Seth Gilbert and Nancy Lynch. 2002. Brewer's conjecture and the feasibility of consistent, available, partition-tolerant web services. SIGACT News 33, 2 (June 2002)](https://dl.acm.org/doi/10.1145/564585.564601)

[Theo Haerder and Andreas Reuter. 1983. Principles of transaction-oriented database recovery. ACM Comput. Surv. 15, 4 (December 1983), 287–317](https://doi.org/10.1145/289.291)

[Eric Brewer. 2012. CAP Twelve Years Later: How the "Rules" Have Changed ](https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/)

[Problems with CAP, and Yahoo’s little known NoSQL system ](http://dbmsmusings.blogspot.com/2010/04/problems-with-cap-and-yahoos-little.html)

[Basically Available, Soft State, Eventual Consistency](https://www.devx.com/terms/basically-available-soft-state-eventual-consistency/)

[O que é o Teorema CAP?](https://www.ibm.com/br-pt/topics/cap-theorem)

[Breve Introdução ao Teorema CAP](https://medium.com/@ruan.victor/breve-introdu%C3%A7%C3%A3o-ao-teorema-cap-eb8bb0a0d7a4)

[Teorema CAP](https://docs.aws.amazon.com/pt_br/whitepapers/latest/availability-and-beyond-improving-resilience/cap-theorem.html)

[Princípios de funcionamento ACID vs BASE nos bancos de dados ](https://edge.uol/en/insights/article/principios-de-funcionamento-acid-vs-base-nos-bancos-de-dados/)

[Please stop calling databases CP or AP](https://martin.kleppmann.com/2015/05/11/please-stop-calling-databases-cp-or-ap.html)

[Martin Kleppmann. 2015. A Critique of the CAP Theorem](https://arxiv.org/abs/1509.05393)

[Hermitage: Testing the “I” in ACID - Martin Kleppmann ](https://martin.kleppmann.com/2014/11/25/hermitage-testing-the-i-in-acid.html)

