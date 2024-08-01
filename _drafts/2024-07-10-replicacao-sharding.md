---
layout: post
image: assets/images/system-design/escalabilidade-capa.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Sharding e Hashing Consistente
---

# Definindo Sharding

Sharding, ou Partição, é uma técnica de divisão de grandes conjuntos em várias partes de conjuntos menores. Essas partes são cosideradas um shard, ou uma partição, de um todo. Esse todo, é frequentemente associado a dados por ser a abordagem mais comum de utilizar partições, porém não se limita a esse tópico nas disciplinas de engenharia. 

![Sharding Definição](/assets/images/system-design/sharding-definicao.png)

Usando dados como exemplo, cada shard é um subconjunto do banco de dados original e pode ser armazenado em diferentes servidores ou nós de um sistema distribuído. Esta abordagem permite que os dados sejam distribuídos e gerenciados de maneira eficiente, melhorando a escalabilidade, a performance e a disponibilidade do sistema que outrora agruparia e centralizaria todos os dados em um único ponto. 

<br>

# Escalabilidade e Performance 

A importância do sharding em sistemas distribuídos se dá principalmente devido à necessidade de lidar com grandes volumes de dados e garantir que o sistema possa escalar horizontalmente em que seria o ponto mais crítico de escala: O volume de dados. 

Ao dividir os dados em múltiplos shards, cada shard pode ser armazenado e gerenciado em servidores diferentes. Isso permite que mais capacidade seja adicionada ao sistema, sem a necessidade de reestruturar a base de dados original.

Com os dados divididos em shards menores, as operações de leitura e escrita podem ser distribuídas entre diferentes servidores. Isso reduz a carga em qualquer servidor individual, resultando em tempos de resposta mais rápidos e melhor performance geral.

Sharding pode melhorar a disponibilidade do sistema. Se um servidor que contém um shard específico falhar, os outros shards ainda estarão disponíveis, permitindo que o sistema continue a operar com funcionalidades reduzidas, em vez de uma falha total.

<br>

# Estratégias e Aplicações de Sharding

## Sharding Keys 

A shard key é a chave utilizada para determinar em qual shard os dados serão armazenados. A shard key deve ter uma alta cardinalidade para garantir uma distribuição uniforme dos dados, e deve ser baseada em campos frequentemente acessados. 

## Sharding por Ranges

Estabelecer Sharding por ranges é uma estratégia de particionamento de dados onde os dados são divididos em intervalos contínuos baseados em valores das sharding keys. Cada shard contém um intervalo específico de valores, e as consultas são direcionadas ao shard apropriado com base na chave de partição. Esta abordagem é particularmente útil quando os dados podem ser ordenados de forma natural, ou não e as consultas frequentemente envolvem intervalos de valores. 

Imagine que temos uma base de 10.000 usuários que foram ordenados de forma sequencial durante a sua criação. Após supostas análises, foi visto que essa base de dados poderia ser particionada em 3 shards, e inclusive suportar a criação de novos usuários. Se levarmos o aspecto sequencial ao pé da letra, teriamos 2 shards "cheios" e um com capacidade ociosa suficiente para suportar o crescimento de usuários da base. 

![Sharding Range](/assets/images/system-design/sharding-range.png)

Utilizar atributos sequenciais é uma das possibilidades quando olhamos para distribuições baseadas em ranges de valores das sharding keys, esse aspecto pode ser reaproveitado por exemplo por ranges de tempo. Dentro deum microserviço de vendas, poderiamos por exemplo definir o sharding por intervalos de datas, em um exemplo mais direto, imagine que temos uma base de dados para comportar as transações que ocorreram dentro de cada ano. A longo prazo teriamos uma base de dados que seria responsável por agrupar todas as transacões do ano. 

![Sharding Ano](/assets/images/system-design/sharding-ano.png)

Nesse sentido poderiamos aplicar uma outra estratégia que normalmente se aplicam em shardings que é ter vários "tiers" de storage dos dados, deixando opções mais caras e performáticas para o ano corrente e ano anterior em tier "hot", ter um tier intermediário "warm" para anos que ainda tem acesso frequente mas sem a mesma intensidade que os anos acessados em meior volume e uma opção de tier mais barata e menos performática em "cold" para armazenar os dados de vendas de anos muito anteriores que são acessados esporádicamente. 

![Sharding Letras](/assets/images/system-design/sharding-letras.png)

Uma estratégia, não tão efetiva, mas ótima para ilustrar a estratégia de sharding por ranges é ilustrar um exemplo de distribuição de uma base de usuários, clientes ou tenants baseado na inicial. Podemos definir a distribuição dos dados entre intervalos de iniciais das sharding keys, como por exemplo utilizando intervalos de A-E para um shard, F-J para outro, K-N, O-R, S-V e W-Z consecutivamente. Embora seja o exemplo mais simples de ilustrar uma distribuição de dados entre partições, encontramos um dos problemas que o sharding conceitualmente tende a evitar, que são as hot-partitions, ou partições quentes, onde teremos um outlier de uso entre os shards. Para complementar o exemplo, em um caso de distribuição baseada em iniciais de um cliente, podemos presumir por inferência que existem mais Anas, Brunos, Carlos e Danielas do que Wesleys, Yasmins e Ziraldos. Nesse caso, em um curto médio prazo teremos um desbalanceamento de performance muito grande entre a partição 1 e 6, onde a 1 seria superutilizada enquanto a 6 viveria em sub-utilização. 


<br>

## Sharding por Hashing Consistente

Sharding por hashing consistente é uma técnica onde uma função de hash é usada para mapear dados para diferentes shards. Em vez de distribuir os dados uniformemente entre os shards, o hashing consistente distribui os dados de maneira a minimizar o número de movimentos de dados quando os shards são adicionados ou removidos. A função hash é aplicada a partir do valor da Sharding Key, e a partir do algoritmo selecionado, o número do shard é retornado com base no hash da sharding key. 

```go
package main

import (
	"crypto/sha256"
	"encoding/binary"
	"fmt"
	"strings"
)

// Calcula o hash SHA-256 do valor do tenant e o converte para um inteiro
func hashTenant(tenant string) int {
	tenant = strings.ToLower(tenant) // Converte o valor do tenant para minúsculas
	hash := sha256.New()
	hash.Write([]byte(tenant))
	hashBytes := hash.Sum(nil)
	hashInt := binary.BigEndian.Uint64(hashBytes)
	
	// Converte o valor para um valor positivo caso o hashint venha a ser negativo
	if int(hashInt) < 0 {
		return -int(hashInt)
	}
	return int(hashInt)
}

// Recebe uma string do tenant e o número de shards, retornando o número do shard correspondente
func getShardByTenant(tenant string) int {
	numShards := 3

	hashValue := hashTenant(tenant)
	shard := hashValue % numShards
	return shard
}

func main() {
	// Lista de tenants
	tenants := []string{
		"Petshops-Souza",
		"Pizzarias-Carvalho",
		"Mecanica-Dois-Irmaos",
		"Padaria-Estrela-Filial-1",
		"Padaria-Estrela-Filial-2",
		"Padaria-Estrela-Filial-3",
		"Hortifruti-Oba",
		"Acougue-Zona-Leste",
		"Acougue-Zona-Oeste",
		"Acougue-Zona-Norte",
	}

	// Verifica a distribuição dos tenants entre os shards
	for _, tenant := range tenants {
		shard := getShardByTenant(tenant)
		fmt.Printf("Tenant: %s, Shard: %d\n", tenant, shard)
	}
}
```

#### Output
```
Tenant: Petshops-Souza, Shard: 1
Tenant: Pizzarias-Carvalho, Shard: 2
Tenant: Mecanica-Dois-Irmaos, Shard: 1
Tenant: Padaria-Estrela-Filial-1, Shard: 0
Tenant: Padaria-Estrela-Filial-2, Shard: 2
Tenant: Padaria-Estrela-Filial-3, Shard: 1
Tenant: Hortifruti-Oba, Shard: 2
Tenant: Acougue-Zona-Leste, Shard: 2
Tenant: Acougue-Zona-Oeste, Shard: 0
Tenant: Acougue-Zona-Norte, Shard: 1
```

## Sharding Consistente e Gestão de Chaves

![Sharding Key Service](/assets/images/system-design/sharding-hash-consistente-key-service.png)

<br>


<br>

# Problemas Conhecidos

## Hot Partitions

## Balanceamento 

## Extensão do número de shardings

<br>

#### Referencias 

[Sharding pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/sharding)

[Database Sharding](https://www.geeksforgeeks.org/database-sharding-a-system-design-concept/)

[Database Sharding for System Design Interview ](https://dev.to/somadevtoo/database-sharding-for-system-design-interview-1k6b)

[Database Sharding Pattern for Scaling Microservices Database Architecture](https://medium.com/design-microservices-architecture-with-patterns/database-sharding-pattern-for-scaling-microservices-database-architecture-2077a556078)

[Sharding: Architecture Pattern](https://www.linkedin.com/pulse/sharding-architecture-pattern-pratik-pandey/)

[Consistent hashing](https://en.wikipedia.org/wiki/Consistent_hashing)

[A Guide to Consistent Hashing](https://www.toptal.com/big-data/consistent-hashing)

[What Is Consistent Hashing?](https://www.baeldung.com/cs/consistent-hashing)

[Shuffle Sharding: Massive and Magical Fault Isolation](https://aws.amazon.com/pt/blogs/architecture/shuffle-sharding-massive-and-magical-fault-isolation/)

[System Design — Consistent Hashing](https://medium.com/must-know-computer-science/system-design-consistent-hashing-f66fa9b75f3f)

[A Crash Course in Database Sharding](https://blog.bytebytego.com/p/a-crash-course-in-database-sharding)