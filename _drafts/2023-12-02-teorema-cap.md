---
layout: post
image: assets/images/system-design/cap-logo.png
author: matheus
featured: false
published: true
categories: [ system-design, databases, engineering ]
title: System & Design - Teorema CAP, ACID, BASE e Bancos de Dados Distribuídos
---

Esse é mais um artigo da série de System Design. Essa série está se demonstrando muito prazerosa de se escrever. Está sendo muito legal me desafiar a entender temas densos e complexos e simplificar a explicação. Hoje vamos falar sobre alguns tópicos muito importantes sobre a arquitetura de bancos de dados. Vamos falar sobre o Teorema CAP com sua concepção, outros tópicos que tangem esse tema, e por final reavaliar a evolução do teorema muitos anos depois que foi escrito comparando com soluções modernas e a agregação de alguns anos de experiência e evolução da engenharia. 


# Teorema CAP 

O Teorena CAP é uma sigla para **Consistency, Availability and Partition Tolerance**, ou **Consistência, Disponibilidade e Tolerância a Partições** e é um principio fundamental para compreender a arquitetura e limitações na escolha de uma base de dados. 

O teorema propõe que na perspectiva de sistemas distribuídos, um banco de dados só pode entregar 2 dos 3 atributos do descritos no CAP. Algo como ***"Escolha 2 B's: Bom, Rápido e Barato"***

Esse modelo foi proposto por **Eric Brewer** da **Universidade da Califórnia** durante uma conferência no ano 2000. Esse teorema foi crucial para influenciar em escolhas arquiteturais quando trabalhamos com bancos de dados distribuídos. 

Ele fornece uma base para entender as limitações inerentes a qualquer sistema de banco de dados distribuído e ajuda a esclarecer por que não é possível atingir todas as três propriedades simultaneamente em sua forma mais forte, é o que vamos entender durante esse artigo. 

# ACID e BASE, os tradeoffs entre SQL e NoSQL

Nas disciplinas de bancos de dados, dois conjuntos de conceitos são responsáveis por guiar o design e gestão das transações e/ou querys, são eles o **ACID** e **BASE**. 

Entender a diferênça entre ambos é crucial para qualquer tipo de engenheiro ou arquiteto trabalhar de forma eficiênte em bancos de dados distribuídos, além da escolha de algum tipo de tecnologia. Antes de entendermos as aplicações do Teorema CAP, é muito interessante ter esses dois conceitos frescos na cabeca de antemão para melhor entendimento.

## Modelo ACID  - Atomicity, Consistency, Isolation, Durability

Quando falamos sobre ACID, acrônimo para (Atomicidade, Consitência, Isolamento e Durabilidade) estamos falando de bancos de dados que nos proporcionam operações transacionais que são processadas de forma atômica e confiável em troca de talvez alguns requisitos de performance, como os bancos SQL tradicionais, onde a consistência e o commit das transações de escrita são priorizados ao invés de performance e resiliência. 

### Atomicidade 

Atomicidade assegura que cada transação é tratada como uma unidade indivisível, ou seja, todas as operações de escrita dentro de uma transaction devem ser concluídas com sucesso, ou nenhuma delas será de fato realizada. 

Dentro de uma **transação podem conter uma ou mais queries que correspondam a uma lógica ou funcionalidade de negócio**. Como por exemplo, vamos imaginar um sistema simples que registra vendas de um e-commerce. Nesse sistema recebemos um evento fictício de que representa a venda de um produto qualquer, no qual precisamos decrementar o estoque desse produto, e registrar a venda no mesmo. Nesse caso, seriam 2 operações: Decrementar o contador de estoque do produto numa tabela chamada `estoque` e em seguida fazer um INSERT em uma tabela chamada `vendas`. **Ambas as operações precisam ser concluídas de forma dependente**, pois tanto atualizar o estoque sem registrar a venda quando registrar a venda sem atualizar o estoque podem gerar problemas de consistência logistica e contábil para o e-commerce, além de transtornos para o cliente. Esse é o real benefício das transacions, que garantem **atomicidade do modelo ACID**. 

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
        tx.Rollback() // Em caso de falha, é efetuado o rollback de todas as query dentro da transaction
        log.Fatal(err)
    }

    // 2ª Operação: Registrar a venda
    _, err = tx.Exec("INSERT INTO vendas (produto_id, quantidade) VALUES (?, ?)", produtoID, quantidadeVendida)
    if err != nil {
        tx.Rollback() // Em caso de falha, é efetuado o rollback de todas as query dentro da transaction
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

A consistência em um banco de dados refere-se a garantia de que todas as transações que ocorrem **levam o banco de dados de um sistema consistente apenas para outro estado consistente**. Essa frase é muito bonita, mas dificil de entender de primeiro momento. Filosofias a parte, a **Consistência nos garante a integridade dos dados** evitando dados corrompidos ou inválidos, **isso quer dizer que em nenhum momento o banco de dados irá existir ou operar com dados desatualizados ou indisponíveis** na visão do cliente. 

O nível de consistência nos garante também **validação das transações** que vimos no tópico de atomicidade, e também o respeito a **restrições e condições** que foram impostas durante a modelagem dos dados. Na prática é a garantia que todas as foreign keys, especificações de nullabilidade, triggers e tipos sejam respeitadas a todo momento, fazendo com que caso uma string tente ser inserida num campo de tipo decimal gere um erro de validação, ou que um valor nunca seja menor que 0 ou tenha algum tamanho específico. 


### Isolamento 

O isolamento em nível transacional nos bancos de dados no modelo ACID refere-se a capacidade de uma transação operar mediante a outras transações simultâneas, ou seja, garantindo que várias transações que ocorram ao mesmo tempo não interfiram umas nas outras. 

Existem alguns níveis de isolamento, mas todos eles existem para garantir que não ocorram eventos como  **Dirty Reads** onde uma transação de leitura acessa dados que foram inseridos ou modificados por outra transação ainda não confirmada, ou como **Non-repeatable Read** onde a mesma transação lê os mesmos dados duas ou mais vezes e recuperam resultados diferentes devido uma outra transação de escrita finalizar entre elas e os **Phanton Reads** onde mediante a re-execução da mesma leitura na mesma transação a segunda recupere dados que ainda não existiam na primeira devido ao mesmo motivo. 

O maior desafio a nível arquitetural é encontrar o **equilíbrio certo entre isolamento e desempenho**  no design de sistemas de banco de dados. Níveis mais altos de isolamento tendem a reduzir a concorrência e podem afetar o desempenho, enquanto níveis mais baixos podem aumentar a concorrência, mas com riscos potenciais de inconsistência dos tipos citados acima. 

### Durabilidade

A durabilidade no modelo ACID é o pilar que garante que uma vez que uma transação é confirmada, ela permanecerá confirmada permanentemente. Isso significa que uma vez que confirmarmos uma operação de escrita, a mesma não será perdida mediante a N possibilidades de falha, garantindo a persistência dos dados em uma fonte não-volátil

la é fundamental para a confiabilidade do sistema, especialmente em aplicações onde a perda de dados pode ter consequências sérias.

<br>

## Modelo BASE - Basically Available, Soft State, Eventual Consitency

Enquanto ACID foca na precisão e confiabilidade, o BASE, acronimo para **Basicamente Disponível**, **Soft State** e **Eventualmente Consistente**, adota uma abordagem com níveis de flexibilidade adequada para lidar com sistemas distribuitos modernos, onde a disponibilidade e tolerância a falhas é o tópico prioritário. 

### Basicamente Disponível

O termo **Basicamente Disponível** implica que o sistema é projetado para maximizar a disponibilidade, mas não garante uma disponibilidade total e ininterrupta. Em outras palavras, o sistema será acessível na maior parte do tempo, mas pode haver momentos em que alguns dados ou funcionalidades não estejam disponíveis devido a falhas de networking, manutenção ou particionamento de dados.

Para alcançar essa disponibilidade, os dados são frequentemente particionados e replicados em vários servidores ou locais. Isso permite que, mesmo se uma parte do sistema falhar, outras partes continuem funcionando.

Bancos de dados NoSQL, como Dynamo, Cassandra ou MongoDB, empregam estratégias de replicação e particionamento para garantir que os dados estejam disponíveis mesmo quando alguns nodes do cluster falham.

Essa abordagem é ideal para ambientes de larga escala e alta demanda, onde a capacidade de lidar com falhas parciais e a necessidade de manter a operação contínua são mais críticas do que manter uma consistência estrita dos dados em todos os momentos.

### Soft State

Soft State se refere à ideia de que o **estado do sistema pode mudar com o tempo**, mesmo sem uma entrada externa de uma intervenção intencional. Em um sistema que opera sob o princípio de "Soft State", **os dados podem expirar ou serem atualizados automaticamente**, e **não é garantido que a informação permaneça consistente se não for atualizada ou verificada periodicamente**. Ela reconhece que manter a consistência rigorosa em todos os momentos pode ser impraticável ou desnecessária para certos tipos de aplicações e dados.

Em sistemas que aplicam Soft State, os dados podem se autogerenciar, autodeletar e se autoatualizar. Isso significa que o estado do sistema é muito comum em sistemas de cache, como **Memcached**, **Redis** ou sistemas de cache distribuído, onde os dados armazenados são frequentemente considerados como tendo um "Soft State". Eles podem ser substituídos ou expirar com o tempo para refletir as mudanças no estado dos dados originais.

### Eventualmente Consistente

Consistência eventual é um conceito que descreve que a escrita realizada em um determinado dado num sistema de banco de dados distribuído irá ser replicada para todos os nodes de forma assíncrona, significando que **por alguns momentos, diferentes nodes podem ter versões diferentes dos mesmos dados**. O termo "eventual" nesse cenário, é a garantia que se nenhuma nova alteração for feita em um determinado dado em certo período de tempo, todos os dados distribuídos entre os nodes se tornaram consistentes em algum momento. 

Este modelo é projetado para sistemas que operam em redes com latência significativa ou onde falhas de nodes são comuns, permitindo que o sistema continue operacional apesar de inconsistências temporárias.

A consistência eventual é crucial para sistemas que devem escalar para lidar com grandes volumes de tráfego ou grandes conjuntos de dados, permitindo-lhes operar de forma mais eficiente em larga escala, portanto muitos bancos de dados NoSQL projetados para esse tipo de demanda, como Cassandra e DynamoDB, utilizam a consistência eventual para proporcionar alta disponibilidade e escalabilidade, especialmente útil em aplicações web de larga escala.

<br>

# Explicação dos Componentes do CAP

Agora que já tivemos contato com os conceitos e aplicações de ACID e BASE, podemos traçar o paralalo para as combinações de features propostas no Teorema CAP com mais segurança e embasamento. Vamos iniciar detalhando todos os itens da sigla:

## Consistency / Consistência (C)

O nível de **Consistência** refere-se a **garantia de que todos os nodes de um banco de dados distribuídos exibem os mesmos dados ao mesmo tempo**. Isso significa que independente de qual dos nodes for consultado, todos eles vão retornar sempre a versão mais recente de todos os dados ao mesmo tempo... 

**Imagine que uma operação de escrita precise aguardar a confirmação de replicação de todos os nós para concluir a transação, liberar o processo e disponibilizar o dado para consulta.**

O atributo de consistência é essencial para aplicações onde a atomicidade e atualização do dados são parte crítica da solução, como sistemas financeiros, dados hospitalares. 

<br>

## Availability / Disponibilidade 

O nível de **Disponibilidade** assegura que todas as solicitações realizadas **vão receber uma resposta**, independente dos dados dessa reposta estarem atualizados no nó consultado ou não.

Quando a disponibilidade é priorizada numa escolha de arquitetura, na maioria dos casos **presume que o dado retornado pode não ser o mais atual desde a operação de escrita até o de leitura**. 

Isso significa que **as operações de escrita e leitura podem atuar de forma independente uma das outras**. Ou seja, a **solicitação de escrita pode terminar antes de todo o processo de replicação entre os nós estar concluído**. 

Esse atributo é de grande valor em sistemas que existem uma alta performance, ingestão volumosa e tempo de resposa rápido como fluxos de streaming, analytics. 

Os sistemas alcançam a disponibilidade dos dados normalmente fazendo uso de replicação, que significa "duplicar" as informações entre os nós disponíveis. 

<br>

## Partition Tolerance / Tolerância a Partições

O nível de **Tolerância a Partições** refere-se ao banco de dados distribuído **continuar operacional apesar de alguma ou algumas das suas "partições" estiverem indisponíveis ou eventuais falhas de comunicação acontecerem entre seus nodes**. 

Em ambientes distribuídos temos que assumir cada vez mais que falhas de networking, de hardware, atualizações programadas, atualizações de segurança de emergência feitas pelos providers podem acontecer a qualquer momento. Um sistema tolerânte a partições pode oferecer um certo nível de continuidade do serviço em caso de falhas parciais. 

Esse atributo é muito interessante entre aplicações distribuídas geograficamente, redes sociais, agregadores de logs, event brokers, sistemas de filas e etc.

### O que é uma Partição de Dados?

O termo "partição" pode confundir bastante a cabeça, principalmente quando já estamos familizarizados com outros termos vindos de Bancos de Dados, mas quando falamos de "CAP" e "Partition Tolerance", a **Partição de dado** se refere a uma situação onde ocorre uma falha sistemica ou de rede entre dois ou mais nodes do banco de dados e isso impede que eles fiquem sincronizados, gerando uma incosistência temporária. Isso se agrava quando a escrita também é distribuída entre os nós. 

Muitas vezes em um cluster otimizado para partition tolerance, é possível isolar um nó do restante do cluster para executar alguma manutenção, troubleshooting, adicionar recursos ou update. Depois que esse nó já está apto a voltar a operar junto aos demais, é efetuado reingresso do mesmo, onde ocorre o processo de sincronização para voltar a operar em consistência. 


<br>

# "Escolha 2: Bom, Rápido ou Barato" - As combinações do Teorema


## CP (Consistência e Tolerância a Partições)

O sistêma prioriza a consistência e a tolerância a partições, sacrificando a disponibilidade. 

O Sistema **mantém a consistência através de todos os nodes que continuam operando em caso de falhas** de networking ou partições. Quando uma partição ocorre entre dois nodes, o sistema deve ter a capacidade de dasativar o nó consistente, tornando o mesmo indisponível, até que a consistência seja resolvida. 

Esse é o tipo de abordagem mais utilizado onde a precisão do dado é crítica e a atomicidade transacional é algo inegociável, como sistemas financeiros, calculadores de crédito, saldo, estoque e etc. 

### Exemplos

* [MongoDB]()
* [Cassandra]()
* [Couchbase]()
* [Etcd]()
* [Consul]()

<br>

## AP (Disponibilidade e Tolerância a Partições)

**O sistêma prioriza entregar a alta disponibilidade e tolerância a partições, sacrificando a consistência.**

Quando uma partição de dados acontece, todos os nós permanecem disponíveis para consulta independente do seu nível de atualização. Independente dos processos de ressincronização dos nós, todas os nós vão ser consultados e responder as solicitações com dados desatualizados ou não. 

Essa abordagem é empregada quando a continuidade da operação é mais importante do que os dados consistentes 100% do tempo, como buscas de e-commerce, redes sociais, buscadores e etc. 

### Exemplos

* [CouchDB]()
* [DynamoDB]()
* [Cassandra]()
* [SimpleDB]()

<br>

## CA (Consistência e Disponibilidade)

**O sistema prioriza consistência e disponibilidade das solicitações, em troca de ser sensível partições de dados**. Ou seja, **se houver uma falha de rede ou partição, o sistema pode ficar completamente inoperante.**

Esse é o sistema menos comum de ser utilizado em ambientes distribuídos, pois a grande maioria é projetada para se lidar com falhas de networking, partições e inconsistências. 

Ele pode ser encontrado em outros tipos de databases que podem ou não ser distribuídos, variando apenas uma necessidade de configuração. Como o Redis Standalone, bancos de dados SQL centralizados como MySQL, PostgreSQL. Esse tipo de abordagem é tratada para garantir operações ACID. 

### Exemplos

* [MySQL/MariaDB]()
* [PostgreSQL]()
* [Oracle]()
* [SQL Server]()
* [Redis Standalone]()
* [Memcached Standalone]()


# Tabela de Flavors (CAP)


# O que mudou depois da concepção do CAP?

Em 2012, Eric Brewer, autor do teorema publicou um paper chamado [CAP Twelve Years Later: How the "Rules" Have Changed](https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/), fazendo uma revisão do que foi proposto no primeiro trabaho de 2000 baseado na evolução tecnologica das opções de bancos de dados, clouds e arquiteturas de microserviços modernas, listando as lições aprendidas e os conceitos que precisam ser revisitados.



#### Referências 

[Seth Gilbert and Nancy Lynch. 2002. Brewer's conjecture and the feasibility of consistent, available, partition-tolerant web services. SIGACT News 33, 2 (June 2002)](https://dl.acm.org/doi/10.1145/564585.564601)

[Eric Brewer. 2012. CAP Twelve Years Later: How the "Rules" Have Changed ](https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/)

[O que é o Teorema CAP?](https://www.ibm.com/br-pt/topics/cap-theorem)

[Breve Introdução ao Teorema CAP](https://medium.com/@ruan.victor/breve-introdu%C3%A7%C3%A3o-ao-teorema-cap-eb8bb0a0d7a4)

[Teorema CAP](https://docs.aws.amazon.com/pt_br/whitepapers/latest/availability-and-beyond-improving-resilience/cap-theorem.html)

[Princípios de funcionamento ACID vs BASE nos bancos de dados ](https://edge.uol/en/insights/article/principios-de-funcionamento-acid-vs-base-nos-bancos-de-dados/)