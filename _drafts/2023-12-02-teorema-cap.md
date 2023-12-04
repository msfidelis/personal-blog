---
layout: post
image: assets/images/system-design/cap-logo.png
author: matheus
featured: false
published: true
categories: [ system-design, databases, engineering ]
title: System & Design - Teorema CAP e Bancos de Dados Distribuídos
---


# Breve histórico

O Teorena CAP é uma sigla para **Consistency, Availability and Partition Tolerance**, ou **Consistência, Disponibilidade e Tolerância a Partições** e é um principio fundamental para compreender a arquitetura e limitações na escolha de uma base de dados. 

O teorema propõe que na perspectiva de sistemas distribuídos, um banco de dados só pode entregar 2 dos 3 atributos do descritos no CAP. Algo como ***"Escolha 2 B's: Bom, Rápido e Barato"***

Esse modelo foi proposto por **Eric Brewer** da **Universidade da Califórnia** durante uma conferência no ano 2000. Esse teorema foi crucial para influenciar em escolhas arquiteturais quando trabalhamos com bancos de dados distribuídos. 

Ele fornece uma base para entender as limitações inerentes a qualquer sistema de banco de dados distribuído e ajuda a esclarecer por que não é possível atingir todas as três propriedades simultaneamente em sua forma mais forte, é o que vamos entender durante esse artigo. 


<br>

# Explicação dos Componentes

## Consistency / Consistência (C)

O nível de **Consistência** refere-se a **garantia de que todos os nodes de um banco de dados distribuídos exibem os mesmos dados ao mesmo tempo**. Isso significa que independente de qual dos nodes for consultado, todos eles vão retornar sempre a versão mais recente de todos os dados ao mesmo tempo... 

**Imagine que uma operação de escrita precise aguardar a confirmação de replicação de todos os nós para concluir a transação, liberar o processo e disponibilizar o dado para consulta.**

O atributo de consistência é essencial para aplicações onde a atomicidade e atualização do dados são parte crítica da solução, como sistemas financeiros, dados hospitalares. 

<br>

## Availability / Disponibilidade 

O nível de **Disponibilidade** assegura que todas as solicitações realizadas **vão receber uma resposta** sem erro, independente dos dados dessa reposta estarem atualizados no nó consultado ou não.

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

# "Escolha 2: Bom, Rápido ou Barato"

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
* [SQL Server.]()
* [Redis Standalone]()
* [Memcached Standalone]()


# Tabela de Flavors (CAP)



#### Referências 

[Seth Gilbert and Nancy Lynch. 2002. Brewer's conjecture and the feasibility of consistent, available, partition-tolerant web services. SIGACT News 33, 2 (June 2002)](https://dl.acm.org/doi/10.1145/564585.564601)

[O que é o Teorema CAP?](https://www.ibm.com/br-pt/topics/cap-theorem)

[Breve Introdução ao Teorema CAP](https://medium.com/@ruan.victor/breve-introdu%C3%A7%C3%A3o-ao-teorema-cap-eb8bb0a0d7a4)

[Teorema CAP](https://docs.aws.amazon.com/pt_br/whitepapers/latest/availability-and-beyond-improving-resilience/cap-theorem.html)