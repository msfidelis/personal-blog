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

A importância do sharding em sistemas distribuídos está principalmente **na necessidade de lidar com grandes volumes de dados** e garantir que o **sistema possa escalar horizontalmente, em um dos pontos mais críticos de escala, que são os databases**.

Ao dividir os dados em múltiplos shards, **cada shard pode ser armazenado e gerenciado em servidores diferentes**. Isso permite que mais capacidade seja adicionada ao sistema sem a necessidade de reestruturar a base de dados original.

Com os dados divididos em shards menores, as **operações de leitura e escrita podem ser distribuídas entre diferentes capacidades computacionais**. Isso **reduz a carga em qualquer servidor individual**, resultando em tempos de resposta mais rápidos e melhor performance geral.

Além disso, **o sharding pode contribuir para a alta disponibilidade do sistema**. Se um servidor que contém **um shard específico falhar, os outros shards ainda estarão disponíveis**, permitindo que o sistema continue a operar com funcionalidades reduzidas, em vez de ocorrer uma falha total.

<br>

# Estratégias e Aplicações de Sharding

## Sharding Keys 

Quando pensamos em uma estratégia de particionamento de dados para resolver problemas de escalabilidade, a primeira pergunta que devemos fazer é: **"Particionar baseado em quê?"**. Definir como vamos dividir os dados de um determinado contexto é o passo mais importante, antes de qualquer escolha de tecnologia. **Ao definir uma dimensão de corte para o particionamento, encontramos nossa sharding key**.

A **sharding key, ou chave de partição, é a chave utilizada como critério para determinar como e em qual partição os dados serão armazenados**. A shard key deve ter alta cardinalidade para **garantir uma distribuição uniforme dos dados e deve ser baseada em campos frequentemente acessados, como datas, identificadores, categorias, etc**.

Sharding keys comuns podem incluir as iniciais de um identificador de cliente, o ID de uma entidade, o hash de um valor comum e categorias. Por exemplo, em um sistema financeiro, **é comum dividir a base de clientes entre Pessoas Físicas e Pessoas Jurídicas**. Instituições bancárias podem realizar **shardings baseados em ranges de agências**. Em sistemas de vendas ou logística, **dividir a base por intervalo de datas em que as transações ocorreram** pode ser uma alternativa de escalabilidade, utilizando sharding keys como meses ou anos. Em sistemas multi-tenant, é possível **particionar baseado no hash de um identificador do tenant**.

Existem várias estratégias e aplicações para definir quais sharding keys escolher para a distribuição de dados. Iremos explorar algumas adiante.

## Sharding por ranges de iniciais

Uma estratégia, não tão efetiva, mas ótima para ilustrar a estratégia de sharding é ilustrar um exemplo de distribuição de uma base de usuários, clientes ou tenants baseado na inicial. Podemos **definir a distribuição dos dados entre intervalos de iniciais das sharding keys**, como por exemplo **utilizando intervalos de A-E para um shard, F-J para outro, K-N, O-R, S-V e W-Z consecutivamente**. 

![Sharding Letras](/assets/images/system-design/sharding-letras.png)

Embora seja o exemplo mais simples de ilustrar uma distribuição de dados entre partições, encontramos um dos problemas que o sharding conceitualmente tende a evitar, **que são as hot-partitions, ou partições quentes, onde teremos um outlier de uso entre os shards**. Para complementar o exemplo, em um caso de distribuição baseada em iniciais de um cliente, **podemos presumir por inferência que existem mais Anas, Brunos, Carlos e Danielas do que Wesleys, Yasmins e Ziraldos**. Nesse caso, em um curto médio prazo teremos um **desbalanceamento de performance** muito grande entre a partição 1 e 6, onde a 1 seria superutilizada enquanto a 6 viveria em sub-utilização.

## Sharding por Ranges de Identificadores

Estabelecer uma estratégia de distribuição onde os dados são divididos baseados em intervalos contínuos de valores da sharding key também é uma estratégia muito comum quando olhamos para o mercado. Uma distribuição sequencial requer um controle maior de governança onde acabamos por ter um fenômeno de "transbordo", pois pode ser traçado um paralelo onde shardings podem estar "cheios" e outros "vazios". 

No mais, a estratégia consiste na ideia em que cada shard contém um intervalo específico de valores, e as consultas são direcionadas ao shard apropriado com base na sharding key. Esta abordagem é particularmente útil quando os dados podem ser ordenados de forma natural, ou não e as consultas frequentemente envolvem intervalos de valores. 

![Sharding Range](/assets/images/system-design/sharding-range.png)

Imagine que temos uma base de 10.000 usuários que foram ordenados de forma sequencial durante a sua criação. Após supostas análises, foi visto que essa base de dados poderia ser particionada em 3 shards, e inclusive suportar a criação de novos usuários. Se levarmos o aspecto sequencial ao pé da letra, teriamos 2 shards "cheios" e um com capacidade ociosa suficiente para suportar o crescimento de usuários da base. 

## Sharding por Ranges de Datas

Utilizar atributos sequenciais é uma das possibilidades quando olhamos para distribuições baseadas em ranges de valores das sharding keys, esse aspecto pode ser reaproveitado por exemplo por ranges de tempo. Dentro deum microserviço de vendas, poderiamos por exemplo definir o sharding por intervalos de datas, em um exemplo mais direto, imagine que temos uma base de dados para comportar as transações que ocorreram dentro de cada ano. A longo prazo teriamos uma base de dados que seria responsável por agrupar todas as transacões do ano. 

![Sharding Ano](/assets/images/system-design/sharding-ano.png)

Nesse sentido poderiamos aplicar uma outra estratégia que normalmente se aplicam em shardings que é ter vários "tiers" de storage dos dados, deixando opções mais caras e performáticas para o ano corrente e ano anterior em tier "hot", ter um tier intermediário "warm" para anos que ainda tem acesso frequente mas sem a mesma intensidade que os anos acessados em meior volume e uma opção de tier mais barata e menos performática em "cold" para armazenar os dados de vendas de anos muito anteriores que são acessados esporádicamente. 
 

## Sharding por Hashing

O Sharding por Hashing é uma técnica de particionamento de dados ou computação onde uma função hash é aplicada sobre a Shard Key e o resultado é utilizado para decidir onde cada dado será armazenado, ou o cliente será roteado. Essa função converte o valor do atributo em um valor de hash que deve resultar em um número inteiro. O valor de hash é então mapeado para um dos shards disponíveis usando uma operação de módulo (`mod`), que retorna o resto da divisão de um número por outro. Por exemplo, se o valor de hash for 15 e houver 3 shards, a operação `15 % 3` resultará em 0, indicando que o registro deve ser armazenado no shard 0. Caso o valor do hash seja 10, a operação `10 % 3` retornará 1, o que significa que o cliente será alocado no shard 1.

![Hash function](/assets/images/system-design/sharding-hash.png)

#### Exemplo de Balanceamento por Hash Functions

Vamos imaginar um sistema multi-tenant que atende a vários cenários de negócio. Foi identificado que o identificador do tenant seria a melhor shard key para distribuir os clientes de forma equitativa entre os shards. Nesse caso, para descobrir em qual shard o cliente será alocado, podemos aplicar o algoritmo SHA-256 para criar um hash do valor e, em seguida, converter o hash para um inteiro. Com base nesse inteiro, aplicamos a operação de módulo pelo número de shards disponíveis, e o resultado será o shard no qual o tenant será alocado.



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

	// Converte o valor do tenant para minúsculas
	tenant = strings.ToLower(tenant) 

	// Converte a string tenant para um byte slice e calcula o hash.
	hash := sha256.New()
	hash.Write([]byte(tenant))
	hashBytes := hash.Sum(nil)

	// Converte o hash para um número inteiro
	hashInt := binary.BigEndian.Uint64(hashBytes)
	
	// Converte o valor para um valor positivo caso o hashint venha a ser negativo
	if int(hashInt) < 0 {
		return -int(hashInt)
	}
	return int(hashInt)
}

// Recebe uma string do tenant e o número de shards, retornando o número do shard correspondente
func getShardByTenant(tenant string) int {
	// Número disponível de Shards 
	numShards := 3

	// Calcula o mod do hash baseado no numero de shards
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

```bash
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

Este esquema de distribuição é simples, intuitivo e funciona bem. Ou seja, **até que o número de servidores mude**. **O que acontece se um dos servidores falhar ou ficar indisponível? As chaves precisam ser redistribuídas** para compensar a ausência do servidor, é claro. O mesmo se aplica se um ou mais servidores novos forem adicionados ao pool. Resumindo, **sempre que o número de servidores mudar, o resultado da operação de módulo também mudará**, o que acarretará em uma perda de referências da distribuição.

![Sharding: Rehash](/assets/images/system-design/sharding-rehash.png)
> Exemplo de perda de referências entre shardings pelo resultado do modulo

Em recursos stateless, como por exemplo um shardeamento de recursos computacionais, como servidores de aplicação, essa é uma dificuldade fácil de ser superada. Ou também em aplicações que mantêm dados em estado, mas esses dados possam ser facilmente recriados e reconsistidos, como por exemplo camadas de cache. No entanto, **em particionamentos que envolvem dados, essa estratégia passa a apresentar dificuldades com a mudança de servidores, perdendo totalmente o roteamento para o armazenamento de dados original**, podendo instantaneamente criar inconsistências. Nesse caso, é necessário um árduo trabalho de redistribuição de dados entre os shards, imediatamente após a escalabilidade horizontal ocorrer. Para estender esse tipo de abordagem de hashing para cenários onde os nodes podem mudar, normalmente adotamos uma estratégia de Hashing Consistente.

### Distribuição e os Algoritmos de Hashing

```go
package main

import (
	"crypto/md5"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/binary"
	"fmt"
	"hash/fnv"
	"strings"
)

// Função de hash utilizando SHA-256
func hashSHA256(tenant string) int {
	tenant = strings.ToLower(tenant)
	hash := sha256.New()
	hash.Write([]byte(tenant))
	hashBytes := hash.Sum(nil)
	hashInt := binary.BigEndian.Uint64(hashBytes)
	return int(hashInt)
}

// Função de hash utilizando SHA-512
func hashSHA512(tenant string) int {
	tenant = strings.ToLower(tenant)
	hash := sha512.New()
	hash.Write([]byte(tenant))
	hashBytes := hash.Sum(nil)
	hashInt := binary.BigEndian.Uint64(hashBytes)
	return int(hashInt)
}

// Função de hash utilizando MD5
func hashMD5(tenant string) int {
	tenant = strings.ToLower(tenant)
	hash := md5.New()
	hash.Write([]byte(tenant))
	hashBytes := hash.Sum(nil)
	hashInt := binary.BigEndian.Uint64(hashBytes)
	return int(hashInt)
}

// Função de hash utilizando FNV-1a
func hashFNV1a(tenant string) int {
	tenant = strings.ToLower(tenant)
	hash := fnv.New64a()
	hash.Write([]byte(tenant))
	hashInt := hash.Sum64()
	return int(hashInt)
}

// Função de hash simples
func hashSimple(tenant string) int {
	tenant = strings.ToLower(tenant)
	var hash int
	for _, char := range tenant {
		hash += int(char)
	}
	return hash
}

// Função para obter o shard utilizando o hash escolhido
func getShardByTenant(tenant string, hashFunc func(string) int, numShards int) int {
	hashValue := hashFunc(tenant)
	shard := hashValue % numShards

	if int(shard) < 0 {
		return -int(shard)
	}
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
		"Salão-Beleza-Filial-1",
		"Salão-Beleza-Filial-2",
		"Auto-Peças-Sul",
		"Academia-BoaForma",
		"Escola-Livre",
		// ... 
	}

	// Número de shards
	numShards := 5

	// Hash functions
	hashFuncs := map[string]func(string) int{
		"SHA-256":      hashSHA256,
		"SHA-512":      hashSHA512,
		"MD5":          hashMD5,
		"FNV-1a":       hashFNV1a,
		"Hash Simples": hashSimple,
	}

	// Resultado das distribuições
	distributions := make(map[string][]int)

	// Inicializa as distribuições
	for name := range hashFuncs {
		distributions[name] = make([]int, numShards)
	}

	// Calcula a distribuição dos tenants entre os shards para cada algoritmo de hash
	for _, tenant := range tenants {
		for name, hashFunc := range hashFuncs {
			shard := getShardByTenant(tenant, hashFunc, numShards)
			distributions[name][shard]++
		}
	}

	// Exibe os resultados
	for name, dist := range distributions {
		fmt.Printf("Distribuição para %s:\n", name)
		for i, count := range dist {
			fmt.Printf("Shard %d: %d tenants\n", i, count)
		}
		fmt.Println()
	}
}
```

#### Output

```bash
 go run main.go
Distribuição para SHA-512:
Shard 0: 8 tenants
Shard 1: 9 tenants
Shard 2: 12 tenants
Shard 3: 7 tenants
Shard 4: 5 tenants

Distribuição para MD5:
Shard 0: 13 tenants
Shard 1: 9 tenants
Shard 2: 4 tenants
Shard 3: 5 tenants
Shard 4: 10 tenants

Distribuição para FNV-1a:
Shard 0: 6 tenants
Shard 1: 6 tenants
Shard 2: 6 tenants
Shard 3: 14 tenants
Shard 4: 9 tenants

Distribuição para Hash Simples:
Shard 0: 5 tenants
Shard 1: 7 tenants
Shard 2: 9 tenants
Shard 3: 10 tenants
Shard 4: 10 tenants

Distribuição para SHA-256:
Shard 0: 9 tenants
Shard 1: 7 tenants
Shard 2: 6 tenants
Shard 3: 8 tenants
Shard 4: 11 tenants
```

<br>


## Sharding por Hashing Consistente

O Hashing Consistente é uma técnica de sharding de sistemas distribuídos usada para particionar em sistemas onde a adição ou remoção de servidores (ou shards) é uma tarefa comum. Diferente do sharding por hashing simples, onde a adição ou remoção de um shard pode exigir a redistribuição de muitos, senão todos os dados, o hashing consistente minimiza a quantidade de dados que precisam ser realocados, adicionando mais alguns graus de escalabilidade. Importante ressaltar que, por mais que seja minimizado, a redistribuição precisa acontecer, ainda que em menor escala. 

As representações visuais de hashing consistente normalmente são representadas de forma cíclica, logo sua estrutura de dado central para a distribuição das chaves entre os nós é representada em forma de anel, e é conhecida como anel de hashs, ou hash ring. Dado isso, a implementação da distribuição de uma hash em num nó, na verdade se dá por um range de intervalos do anel, não apenas pelo valor da hash da chave diretamente, o que permite que ao alterar a quantidade de nós, os valores de mod se movimentem pouco.


```go
package main

import (
	"crypto/sha256"
	"encoding/binary"
	"fmt"
	"sort"
	"strconv"
	"strings"
)

// Representa um nó no anel de hash.
type Node struct {
	ID   string
	Hash uint64
}

// Representa o hash ring que contém vários nós.
type ConsistentHashRing struct {
	Nodes       []Node
	NumReplicas int
}

// Cria um novo anel de hash ring.
func NewConsistentHashRing(numReplicas int) *ConsistentHashRing {
	return &ConsistentHashRing{
		Nodes:       []Node{},
		NumReplicas: numReplicas,
	}
}

// Adiciona um novo node ao Hash Ring
func (ring *ConsistentHashRing) AddNode(nodeID string) {
	for i := 0; i < ring.NumReplicas; i++ {
		replicaID := nodeID + strconv.Itoa(i)
		hash := hashTenant(replicaID)
		ring.Nodes = append(ring.Nodes, Node{ID: nodeID, Hash: hash})
	}
	sort.Slice(ring.Nodes, func(i, j int) bool {
		return ring.Nodes[i].Hash < ring.Nodes[j].Hash
	})
}

// Remove um node existente do Hash Ring
func (ring *ConsistentHashRing) RemoveNode(nodeID string) {
	var newNodes []Node
	for _, node := range ring.Nodes {
		if node.ID != nodeID {
			newNodes = append(newNodes, node)
		}
	}
	ring.Nodes = newNodes
	sort.Slice(ring.Nodes, func(i, j int) bool {
		return ring.Nodes[i].Hash < ring.Nodes[j].Hash
	})
}

// Retorna o node onde o Tenant deverá estar alocado
func (ring *ConsistentHashRing) GetTenantNode(key string) string {
	hash := hashTenant(key)
	idx := sort.Search(len(ring.Nodes), func(i int) bool {
		return ring.Nodes[i].Hash >= hash
	})

	// Se o índice estiver fora dos limites, retorna ao primeiro nó
	if idx == len(ring.Nodes) {
		idx = 0
	}

	return ring.Nodes[idx].ID
}

// Calcula o hash do tenant e a converte para uint64.
func hashTenant(s string) uint64 {
	s = strings.ToLower(s)
	hash := sha256.New()
	hash.Write([]byte(s))
	hashBytes := hash.Sum(nil)
	return binary.BigEndian.Uint64(hashBytes[:8])
}

func main() {
	// Cria um novo anel de hash consistente com 3 réplicas por nó.
	ring := NewConsistentHashRing(3)

	// Adiciona pseudo-nodes ao hash ring
	ring.AddNode("Shard-00")
	ring.AddNode("Shard-01")
	ring.AddNode("Shard-02")
	ring.AddNode("Shard-03")

	// Lista de Tenants
	keys := []string{
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

	// Distribuição Inicial dos Tenants pelos Nodes
	for _, key := range keys {
		node := ring.GetTenantNode(key)
		fmt.Printf("Tenant: %s, Node: %s\n", key, node)
	}

	// Remove um nó e exibe a nova distribuição de chaves.
	ring.RemoveNode("Shard-02")
	fmt.Println("\nRemovendo Shard-02:\n")
	for _, key := range keys {
		node := ring.GetTenantNode(key)
		fmt.Printf("Tenant: %s, Shard: %s\n", key, node)
	}

	ring.AddNode("Shard-04")
	fmt.Println("\nAdicionando Shard-04:\n")
	for _, key := range keys {
		node := ring.GetTenantNode(key)
		fmt.Printf("Tenant: %s, Shard: %s\n", key, node)
	}

}
```

```
❯ go run main.go
Tenant: Petshops-Souza, Node: Shard-03
Tenant: Pizzarias-Carvalho, Node: Shard-01
Tenant: Mecanica-Dois-Irmaos, Node: Shard-02
Tenant: Padaria-Estrela-Filial-1, Node: Shard-01
Tenant: Padaria-Estrela-Filial-2, Node: Shard-03
Tenant: Padaria-Estrela-Filial-3, Node: Shard-02
Tenant: Hortifruti-Oba, Node: Shard-01
Tenant: Acougue-Zona-Leste, Node: Shard-02
Tenant: Acougue-Zona-Oeste, Node: Shard-03
Tenant: Acougue-Zona-Norte, Node: Shard-01

Removendo Shard-02:

Tenant: Petshops-Souza, Shard: Shard-03
Tenant: Pizzarias-Carvalho, Shard: Shard-01
Tenant: Mecanica-Dois-Irmaos, Shard: Shard-00 // Nova movimentação
Tenant: Padaria-Estrela-Filial-1, Shard: Shard-01
Tenant: Padaria-Estrela-Filial-2, Shard: Shard-03
Tenant: Padaria-Estrela-Filial-3, Shard: Shard-00 // Nova movimentação
Tenant: Hortifruti-Oba, Shard: Shard-01
Tenant: Acougue-Zona-Leste, Shard: Shard-00 // Nova movimentação
Tenant: Acougue-Zona-Oeste, Shard: Shard-03
Tenant: Acougue-Zona-Norte, Shard: Shard-01

Adicionando Shard-04:

Tenant: Petshops-Souza, Shard: Shard-03
Tenant: Pizzarias-Carvalho, Shard: Shard-01
Tenant: Mecanica-Dois-Irmaos, Shard: Shard-00
Tenant: Padaria-Estrela-Filial-1, Shard: Shard-01
Tenant: Padaria-Estrela-Filial-2, Shard: Shard-03
Tenant: Padaria-Estrela-Filial-3, Shard: Shard-00
Tenant: Hortifruti-Oba, Shard: Shard-04 // Nova movimentação
Tenant: Acougue-Zona-Leste, Shard: Shard-00
Tenant: Acougue-Zona-Oeste, Shard: Shard-03
Tenant: Acougue-Zona-Norte, Shard: Shard-01
```


### Algoritmos de Hashing Consistente




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