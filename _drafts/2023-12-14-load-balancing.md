---
layout: post
image: assets/images/system-design/balance-1.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering ]
title: System Design - Load Balancing, Proxy Reversos e Algoritmos
---

# Balanceamento de Carga

<br>

### O Problema da Falta de Balanceamento de Carga

![sem load balancing](/assets/images/system-design/no-balance.png)

Imagine um pequeno supermercado em seu bairro, lotado em um horário de pico. **Este estabelecimento conta apenas com um caixa para atender todos os clientes presentes**. Podemos observar o seguinte cenário: 

Todos os clientes são forçados a esperar na mesma longa fila, gerando atrasos e irritação generalizada.

O único caixa eletrônico, sob intensa pressão, fica sobrecarregado, aumentando o risco de erros cometidos pelo atendente devido ao estresse constante.

Clientes com compras pequenas, como um litro de refrigerante, são obrigados a aguardar o mesmo tempo que aqueles com carrinhos repletos, tornando o processo ineficiente.

Se, por alguma razão, esse caixa falhar ou se danificar, toda a operação do mercado será afetada.

Este exemplo ilustra os desafios de um ambiente sem balanceamento de carga, ajudando-nos a compreender que tipos de problemas essa abordagem visa solucionar.

<br>

### Resolvendo problemas com balanceamento de carga

![com load balancing](/assets/images/system-design/com-balance.png)

Agora para entender o funcionamento e diferencial de um balanceamento de carga, imagine que o dono desse mercadinho fez um investimento e comprou mais alguns caixas e contratou mais alguns atendentes para acelerar a fila de espera. 

Com a presença de múltiplos caixas, os clientes têm a opção de escolher entre diferentes filas, levando a uma redução significativa no tempo de espera. Cada caixa, enfrentando uma menor carga de trabalho, tem menos probabilidade de estresse e erro.

No caso de um caixa apresentar problemas e necessitar de manutenção, o impacto no fluxo geral de clientes é apenas parcial, permitindo que a operação continue, embora de forma degradada.

Alguns desses caixas podem ser utilizados para um numero menor de volumes, ou para atendimento preferncial, fazendo com que os mesmos evitem concorrência com clientes com carrinhos lotados. 

Esta abordagem não só agiliza o atendimento, aumentando a eficiência do estabelecimento, mas também melhora significativamente a experiência dos clientes.

Esse cenário exemplifica o funcionamento do balanceamento de carga no seu dia a dia, agora podemos entrar em termos técnicos do funcionamento e aplicações de balanceadores de carga. 

<br>

# Fundamentos de Balanceadores de Carga

Um Load Balancer é uma ferramenta essencial para a gestão de tráfego de rede em ambientes com múltiplos servidores, tais como datacenters privados, nuvens públicas e aplicações web distribuídas. Sua função principal é **distribuir as requisições de entrada entre vários hosts de maneira eficiente e equitativa, otimizando o uso dos recursos, aprimorando os tempos de resposta, reduzindo a carga em cada servidor e assegurando a disponibilidade do serviço, mesmo em caso de falhas em algum dos hosts do pool**.

Do ponto de vista da resiliência, o load balancer desempenha um papel crucial, **evitando que qualquer servidor individual do pool se torne um ponto único de falha**.

As aplicações de um balanceador de carga são diversas, abrangendo desde hardwares de rede até softwares especializados que operam em determinadas camadas de rede, distribuindo a carga entre hosts que operam no mesmo protocolo do balanceador.

Além da distribuição de tráfego, muitos balanceadores de carga oferecem funcionalidades adicionais. Eles podem permitir customizações na camada 7 da rede, como roteamento específico baseado em basepaths, querystrings, headers e IPs de origem. Uma função comum em softwares e dispositivos de balanceamento de carga é o offload de certificados SSL/TLS, removendo essa carga de processamento das aplicações individuais do pool.

A seguir, apresentamos um exemplo ilustrativo do funcionamento de um balanceador de carga:



![GIF Load Balancer](/assets/images/system-design/load-balancer.gif)

<br>

## Proxy Reverso vs Load Balancer

Um Proxy Reverso, ou Reverse Proxy, atua como um intermediário para requisições destinadas a um ou mais servidores internos. Ele recebe as requisições dos clientes e as encaminha para o servidor apropriado. Após o servidor processar a requisição, o proxy reverso retorna a resposta do servidor ao cliente original.

> Ué, não é isso que um Load Balancer faz?

A definição de ambos pode soar semelhante, já que as duas ferramentas atuam entre clientes e servidores como pontos únicos de acesso a múltiplos hosts de aplicação. Portanto, é compreensível a confusão sobre o papel de cada um.

A implementação de um Load Balancer é ideal **quando há muitos hosts no pool**, **quando o volume de requisições é extenso demais para ser gerido por apenas um servidor**, e quando a resiliência e a minimização de pontos únicos de falha são essenciais.

Um Load Balancer também é apropriado em ambientes com **escalabilidade horizontal constante**, pois é projetado para ser **adaptável à inclusão e remoção de hosts do pool a qualquer momento**. Além disso, ele geralmente oferece mecanismos para **verificar constantemente a saúde dos hosts**, evitando a degradação da experiência do usuário devido a falhas ou problemas de desempenho.

Comparado ao proxy reverso, que pode atuar como uma camada intermediária simples entre cliente e servidor, aplicando regras de roteamento, realizando offload de SSL e implementando **cache**.

Enquanto o Load Balancer é utilizado quando existem vários hosts da mesma aplicação, o Proxy Reverso pode ser aplicado em uma relação de 1:1. É comum um servidor expor sua aplicação por trás de um Proxy Reverso, responsável pela gestão de pools de conexões, limites de upload, tipos de conteúdo, restrições, segurança e cacheamento. Um exemplo é o uso de **Sidecars de Envoy no Kubernetes**, a stack **Nginx com PHP FPM**, ou servidores Web rodando NodeJS, Java com Spring, Golang, entre outros, posicionados atrás de um proxy reverso para gerir as requisições.

Também é possível encontrar configurações de Proxy Reverso com mais de um host no pool, semelhante ao Load Balancer, e até mesmo servindo mais de uma aplicação, controlando o redirecionamento por meio de URLs, Basepaths, Headers, IPs de origem, etc.

Soluções modernas de balanceamento de carga muitas vezes podem desempenhar tanto o papel de Load Balancer quanto de Proxy Reverso em alguma medida.



<br>

# Algoritmos de Balanceamento de Carga

Existem diversas abordagens quando se trata de balanceamento de carga, cada uma com suas especificidades e adequações a diferentes cenários. Alguns algoritmos podem oferecer melhor performance e eficiência em determinadas situações, enquanto em outros contextos podem não ser a escolha ideal.

Compreender os tipos de algoritmos de balanceamento disponíveis e as problemáticas que cada um deles visa resolver é fundamental. Igualmente importante é saber onde cada um se encaixa melhor e onde sua utilização pode não ser recomendada.

A seguir, serão apresentados alguns dos algoritmos de balanceamento de carga que considero mais relevantes para o entendimento do tema. Existem muitos outros que não estão listados aqui, mas você pode encontrar material adicional no final deste artigo para explorar mais sobre o assunto.


<br>

## Round Robin 

Round Robin é um dos algoritmos mais utilizados em balanceamento de carga, com o objetivo de **distribuir a carga de maneira uniforme e cíclica entre os servidores disponíveis**. Originalmente concebido para o escalonamento de processos a nível de CPU, baseia-se na variável `quantum`, que define o tempo dedicado pela CPU a cada processo na fila. Essa abordagem previne o problema de `Starvation`, assegurando uma rotatividade cíclica e equitativa dos processos. Compreender esse conceito no contexto do escalonamento de processos é essencial para entender sua aplicação em balanceadores de carga.

No âmbito do balanceamento de carga, o **Round Robin** é empregado para distribuir uniformemente as requisições de rede ou o tráfego entre um grupo de servidores. Cada nova requisição é direcionada ao próximo servidor na fila, seguindo ou não a lógica do quantum.

O principal objetivo é assegurar que nenhum servidor seja desproporcionalmente sobrecarregado com requisições, enquanto outros permanecem subutilizados. O Round Robin é valorizado tanto no balanceamento de carga entre servidores quanto no escalonamento de CPU por sua simplicidade e abordagem justa, que distribui trabalho ou recursos de forma equânime, evitando a sobrecarga de um único recurso.

Sua natureza cíclica faz com que o algoritmo seja particularmente eficaz em ambientes com escalabilidade horizontal, facilitando a adição ou remoção de hosts do pool.

Analogamente, em um supermercado, o Round Robin seria como direcionar os clientes para cada caixa em sequência, um após o outro, independentemente do tamanho da fila de cada um.


### Limitações do Round Robin

Uma crítica frequente ao método Round Robin é que, apesar de distribuir requisições de forma igualitária entre os hosts, ele não leva em conta que nem todas as requisições demandam o mesmo nível de processamento. Isso pode levar a ineficiências, especialmente se os servidores envolvidos possuírem capacidades variadas.

Na prática, em aplicações web, alguns requests podem exigir mais recursos computacionais do que outros. Por exemplo, uma requisição para salvar um pedido de compra pode acabar competindo no mesmo host com uma requisição que gera um relatório de fechamento contábil da empresa. Isso pode resultar em uma resposta mais lenta para a solicitação, devido à saturação desigual dos hosts.

Outra desvantagem do Round Robin se manifesta em balanceadores que adotam a variável de tempo `quantum`. Em cenários onde workloads experimentam picos de carga repentina dentro do breve intervalo do quantum, todas essas requisições podem ser direcionadas para o mesmo host. Isso pode sobrecarregar temporariamente um servidor específico, enquanto os outros permanecem subutilizados.


### Exemplo de um Algoritmo de Round Robin

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

// Abstração de um Mecanismo de Round Robin
type RoundRobin struct {
	hosts        []string      // Lista de Hosts disponíveis para balanceamento
	index        int           // Index de controle
	mutex        sync.Mutex    // Mutex para lock do index
	quantum      time.Duration // Variável de Tempo "Quantum"
	ultimoAcesso time.Time     // TImestamp do ultimo acesso para calcular a diferença do Quantum para troca de hosts
}

// Retorna o host ativo no momento
func (rb *RoundRobin) getHost() string {

	// Trava e destrava a seleção de hosts
	rb.mutex.Lock()
	defer rb.mutex.Unlock()

	// Verifica se o timestamp atual é menor do que o ultimo somado com o quantum
	// Caso seja isso significa que o host no index ainda é o ativo
	if time.Now().Before(rb.ultimoAcesso.Add(rb.quantum)) {
		return rb.hosts[rb.index]
	}

	// Caso o timestamp seja maior, atualiza o ultimo acesso e avança para o proximo host
	rb.ultimoAcesso = time.Now()
	rb.index = (rb.index + 1) % len(rb.hosts)

	return rb.hosts[rb.index]
}

func main() {
	// Variável de tempo em milisegundos pra escolha de hosts
	var quantum int = 300

	// Lista de hosts disponíveis
	hosts := []string{
		"http://host1.com",
		"http://host2.com",
		"http://host3.com",
	}

	// Inicia o mecanismo de Round Robin
	roundRobin := RoundRobin{
		hosts:        hosts,
		quantum:      time.Millisecond * time.Duration(quantum),
		ultimoAcesso: time.Now(),
	}

	// Simula 20 Requests
	for i := 0; i < 20; i++ {
		host := roundRobin.getHost()
		fmt.Printf("Requisição %d direcionada para: %s\n", i+1, host)
		time.Sleep(200 * time.Millisecond)
	}
}

```

```go
❯ go run main.go
Requisição 1 direcionada para: http://host1.com
Requisição 2 direcionada para: http://host1.com
Requisição 3 direcionada para: http://host2.com
Requisição 4 direcionada para: http://host2.com
Requisição 5 direcionada para: http://host3.com
Requisição 6 direcionada para: http://host3.com
Requisição 7 direcionada para: http://host1.com
Requisição 8 direcionada para: http://host1.com
Requisição 9 direcionada para: http://host2.com
Requisição 10 direcionada para: http://host2.com
Requisição 11 direcionada para: http://host3.com
Requisição 12 direcionada para: http://host3.com
Requisição 13 direcionada para: http://host1.com
Requisição 14 direcionada para: http://host1.com
Requisição 15 direcionada para: http://host2.com
Requisição 16 direcionada para: http://host2.com
Requisição 17 direcionada para: http://host3.com
Requisição 18 direcionada para: http://host3.com
Requisição 19 direcionada para: http://host1.com
Requisição 20 direcionada para: http://host1.com
```

[Go Playground - Round Robin](https://go.dev/play/p/sUrhELXqIJW)

<br>

## Least Request

O algoritmo "Least Request" é uma abordagem de balanceamento de carga simples, porém eficiente, que direciona a requisição atual para o servidor que processou o menor número de requisições até aquele momento. Este método utiliza um contador associado a cada host ativo, que incrementa individualmente à medida que as requisições são distribuídas. Para escolher o próximo host, o algoritmo prioriza aquele com o menor contador dentre as opções disponíveis. Dependendo da implementação, este contador pode ser reiniciado após um período específico, tornando-o escalável em ambientes com escalabilidade horizontal.

O objetivo do "Least Request" é **garantir uma distribuição equitativa de carga baseada na frequência com que as requisições são atendidas**, ao invés de focar na duração ou complexidade delas. Isso o torna **uma opção vantajosa para cenários com requisições uniformes e curtas**. Um exemplo seria um microserviço com poucas rotas, mas de alta performance, como um serviço de consulta de usuários que recebe um `id` e retorna o recurso rapidamente.

Analogamente, no supermercado, seria como direcionar os clientes para o caixa com a menor fila, buscando uma distribuição mais equilibrada.

### Limitações do Least Request

Embora o "Least Request" aborde a uniformidade das requisições, ele ainda pode enfrentar problemas de desbalanceamento em ambientes com requisições muito diversificadas e de durações variadas. Assim como o Round Robin, ele não considera a saturação dos hosts, o que pode tornar a simples contagem de requisições insuficiente para representar a real distribuição de carga.

Implementações que não possuem um mecanismo para "zerar" o contador de requisições podem se tornar problemáticas em ambientes com escalabilidade horizontal. Uma má implementação desse algoritmo pode resultar em uma "negação de serviço" involuntária para novos hosts que entram no pool do balanceador.


### Exemplo de Implementação 

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

// Abstração de um Mecanismo Least Request
type LeastRequest struct {
	hosts    []string   // Lista de Hosts disponíveis para balanceamento
	requests []int      // Contagem de requisições ativas para cada host
	mutex    sync.Mutex // Mutex para operações thread-safe
}

// Inicializa um novo balanceador Least Request
func NewLeastRequest(hosts []string) *LeastRequest {
	return &LeastRequest{
		hosts:    hosts,
		requests: make([]int, len(hosts)),
	}
}

// Retorna o host com o menor número de requisições ativas
func (lr *LeastRequest) getHost() string {
	lr.mutex.Lock()
	defer lr.mutex.Unlock()

	minIndex := 0
	minRequests := lr.requests[0]

	// Encontra o host com o menor número de requisições ativas
	for i, reqs := range lr.requests {
		if reqs < minRequests {
			minIndex = i
			minRequests = reqs
		}
	}

	// Incrementa a contagem de requisições para o host selecionado
	lr.requests[minIndex]++

	return lr.hosts[minIndex]
}

func main() {
	// Lista de hosts disponíveis
	hosts := []string{
		"http://host1.com",
		"http://host2.com",
		"http://host3.com",
	}

	// Inicia o mecanismo Least Request
	leastRequest := NewLeastRequest(hosts)

	// Simula 30 Requests
	for i := 0; i < 30; i++ {
		host := leastRequest.getHost()
		fmt.Printf("Requisição %d direcionada para: %s\n", i+1, host)
	}

	// Simula um pequeno delay para permitir que as goroutines terminem
	time.Sleep(5 * time.Second)

	fmt.Println("Distribuição de requisições executadas:", leastRequest.requests)
}

```

<br>

## Least Connection

Os algoritmos de "Least Connection" são técnicas mais avançadas de balanceamento de carga que são utilizadas para distribuir requisições de maneira mais inteligente em uma série de hosts. Diferentemente do Round Robin e Least Request que tem objetivo de distribuir requisições de maneira uniforme sem considerar o estado atual dos servidores, esta abordagem é uma tentativa de levar em conta a carga de trabalho presente em cada um deles.

O método de **Least Connection** **encaminha a solicitação atual para o servidor que detêm menos conexões ativas no momento**. Uma "conexão ativa" significa uma **sessão ou interação em andamento entre o cliente e o servidor**, independentemente de a requisição ter sido processada ou não, como implementações que suporte keep alive, web sockets, grpc persistentes e etc. 

Se um host está gerenciando 5 conexões ativas e outro está gerenciando 3, o próximo request será direcionado para o host com apenas 3 conexões, mesmo que essas conexões possam ser tarefas de baixa demanda.


### Limitações do Least Connection 

A "não tão importante" desvantagem que podemos citar é que ambos os algoritmos são muito mais complexos de se implementar em comparação a simplicidade do Round Robin, porém essa característica pode ser fácilmente vencida se nos limitarmos a sermos meros usuários de algum tipo de tecnologia que já possui suporte para esses cenários. 

O Least Connection foca no número de conexões ativas, sem avaliar a carga associada a cada conexão, o que pode resultar em sobrecarga de servidores com conexões mais intensivas assim como as opções anteriores e o fato de ter que fazer essa gestão pode acabar consumindo recursos significativos no balanceador. 

Servidores com várias conexões de longa duração (keep alive) podem parecer menos ocupados do que realmente estão, criando um potencial para ineficiências na distribuição da carga gerando desbalanceamento.


<br>

## Least Outstanding Requests (LOR)

O **Least Outstanding Request** ou **LOR** é um algoritmo de balanceamento de carga muito sofitsticado que resolve o maior problema dos algoritmos anteriores, que é a **saturação dos hosts**. De certa forma é fácil confundir as abordagens do LOR e do Least Connections. Enquanto o Least Connection se concentra em gerenciar conexões ativas, independente de estarem sendo utilizadas ou não, o Least Outstanding Request considera o número de **requisições pendentes em cada host**. Uma **"requisição pendente" é uma requisição que foi iniciada, mas ainda não foi concluída**, independentemente de haver uma conexão ativa contínua ou não, fazendo o mesmo ser mais eficiente quando comparado ao Least Connection na hora de identificar hosts que estejam com um processamento maior, segurando mais conexões, tendo um tempo de resposta maior e etc.

Resumindo, o Least Connection foca em "quantas conexões" estão ativas, enquanto o LOR olha para "quantas requisições" estão ainda sendo processadas.

O LOR procura equilibrar a carga de trabalho distribuindo novas requisições para os hosts com menos requisições pendentes, tentando garantir que todos os servidores tenham um volume de trabalho semelhante e gerenciável. Ou seja, o foco de balanceamento do LOR é a possível saturação, e não a quantidade de requests, fazendo o mesmo ser uma alternativa eficaz em ambientes onde as requisições podem ter tempos de resposta variáveis e imprevisíveis.

### Limitações do Least Outstanding Requests

O LOR requer um monitoramento contínuo e detalhado do estado das requisições em cada host implementado junto ao algoritmo. Isso pode aumentar a complexidade da implementação em si e exigir mais recursos computacionais para manter o acompanhamento em tempo real, e mais ainda onde esse controle precise funcionar de forma distribuída. 

Essa complexidade pode invariavelmente impactar em performance do balanceador em caso de variações de carga de trabalho repentina.  Além do mais, pode ser um desafio entender quando uma conexão foi concluída ou não.

<br>

## IP Hash Balancing

O algoritmo de IP Hash é uma técnica de balanceamento de carga frequentemente utilizada em componentes de networking, mas a lógica também pode ser implementada em vários outros tipos de algoritmos de balanceadores de aplicação. Essa técnica é especialmente útil para manter a persistência da sessão em aplicações web. 

Os algoritmos que se baseiam em IP Hash se baseia na criação de um hash consistente a partir do endereço IP do cliente para decidir para qual host a requisição ou pacotes de rede serão encaminhados. 

O hashing do IP do cliente, ou origem, sempre resultará no mesmo hash, o que significa que todas as requisições de um cliente específico serão consistentemente encaminhadas para o mesmo host de destino, **desde que o mesmo esteja disponível**. 

Esse tipo de técnica é encontrada em diversos outros algoritmos como o **manglev** que vamos ver a seguir. Ela é aplicada em workloads onde manter certo tipo de "sessão" é crúcial, ou onde as requisições precisam ser resolvidas em uma certa ordem de dependencia, ou sendo facilitada por caching, tenham a necessidade de sumarizar chunks de dados ou executar operações de persistencia de forma contínua. 

### Limitações de implementar uma técnica de IP Hashing

O algoritmo é menos eficaz em situações onde os usuários estão atrás de NAT ou proxies, onde muitos usuários podem compartilhar o mesmo endereço IP público, e também pode levar a uma distribuição desigual de carga entre os servidores, especialmente se a base de usuários não estiver uniformemente distribuída em termos de endereços IP.

### Exemplo de Implementação 

```go
package main

import (
	"crypto/md5"
	"encoding/binary"
	"fmt"
)

// Abstração de um Mecanismo IP Hashing
type IPHashBalancer struct {
	hosts []string
}

func NewIPHashBalancer(hosts []string) *IPHashBalancer {
	return &IPHashBalancer{hosts: hosts}
}

// Retorna o host com base no hash do endereço IP do cliente
func (ipb *IPHashBalancer) getHost(clientIP string) string {
	// Calcula o hash MD5 do endereço IP
	// Qualquer outro mecanismo de hashing pode ser utilizado
	hasher := md5.New()
	hasher.Write([]byte(clientIP))
	hashBytes := hasher.Sum(nil)

	// Calcula o index a partir dos 4 primeiros bytes do hash
	// Transformamos ele em um Integer para facilitar o exemplo
	// O resultado é um índice entre 0 e len(ipb.hosts) - 1
    // que são os índices válidos para a nossa slice de hosts.
	hashIndex := binary.BigEndian.Uint32(hashBytes[:4]) % uint32(len(ipb.hosts))
	return ipb.hosts[hashIndex]
}

func main() {
	hosts := []string{"http://host1.com", "http://host2.com", "http://host3.com"}
	ipHashBalancer := NewIPHashBalancer(hosts)

	// Define uma lista de IP's fakes
	clientIPs := []string{
		"192.168.1.1", "10.0.0.2", "10.0.0.3",
		"172.16.1.1", "172.16.1.2", "192.168.2.1", "192.168.2.2",
	}

	// Simula 30 Requisições
	for i := 0; i < 30; i++ {
		clientIP := clientIPs[i%len(clientIPs)]
		host := ipHashBalancer.getHost(clientIP)
		fmt.Printf("Requisição %d do IP %s direcionada para: %s\n", i+1, clientIP, host)
	}
}
```

<br>

## Manglev

O Manglev é um algoritmo relativamente novo desenvolvido pela Google e é considerado uma técnica avançada de balanceamento de carga, usada principalmente em sistemas complexos de computação distribuída, por mais que ainda bem pouco utilizada. 

O algoritmo Maglev distribui as requisições de clientes para um conjunto de servidores de maneira que cada cliente sempre seja encaminhado para o mesmo servidor, **desde que este esteja disponível**. Isso é alcançado através do uso de **tabelas de hash consistentes**, que mapeiam clientes para servidores de uma forma determinística, mas equilibrada.

O Manglev busca garantir uma **distribuição consistente priorizando cache de dados e manutenção de sessão do usuário**. O Manglev passa uma ideia de "persistência", o que acarretaria em N outros problemas de escalabilidade quando comparado com outras opções apresentadas anteriormente. Isso se dá pois os cenários de aplicação do Manglev são diferentes de um balanceamento stateless entre várias replicas de uma API REST por exemplo. 

O Objetivo do Manglev é garantir mínima flutuação no mapeamento das requisições, garantindo consistencia baseada em algo parecido com uma "sessão". 

Esse algoritmo é ideal para balanceamento entre datacenters, ingestão de dados e outros cenários que exijam uma continuidade e persistências entre as requisições. Também pode fornecer a possibilidade de se trabalhar com produtos Multi-Tenants, onde a segregação do ambiente dá pelo IP de origem do cliente. 

### Limitações do Manglev

O algoritmo Maglev, apesar de ser altamente eficiente para balanceamento de carga em grandes sistemas e ambientes de data center, pode ser um desafio lidar com mudanças rápidas no pool de hosts, como por exemplo em ambientes sucetíveis a escalabilidade horizontal, além de precisar muitas vezes de software e hardwares específicos para operar em todo seu potencial. 

<br>

## Random Load Balancing

Talvez de todos os algoritmos apresentados, o **Random** é o mais simples, mas também o menos utilizado. Ao contrário de outros métodos, como Round Robin ou Least Connections, este algoritmo não se baseia no estado atual ou na carga de trabalho dos servidores para tomar sua decisão, apenas pega um host aleatoriamente do seu pool de servidores e encaminha a resquisição. 

O balanceador de carga mantém uma lista de todos os hosts disponíveis, e quando uma requisição chega, o balanceador de carga seleciona um servidor de maneira aleatória. Isso geralmente é feito usando um gerador de números aleatórios para escolher um índice na lista de servidores como vamos exemplificar no exemplo a seguir. 

O algoritmo é extremamente simples de implementar e não requer estado ou monitoramento contínuo dos servidores, e também possui baixa **"latência"** na decisão, pois não possui nenhum estado para ser controlado em nenhum local. 

É frequentemente utilizado em cenários onde a carga de trabalho é leve ou uniformemente distribuída por natureza, e em ambientes onde a escalabilidade rápida e fácil é uma prioridade. Caso contrário, sua utilização é amplamente desaconselhada. 

### Limitações do Random

A natureza aleatória significa que a distribuição da carga pode não ser uniforme, especialmente com um número menor de requisições. Isso pode acarretar em sobrecarga não prevista, como também subutilização de recursos. 

```go
package main

import (
	"fmt"
	"math/rand"
	"sync"
	"time"
)

// Abstração de um Mecanismo Random
type RandomBalancer struct {
	hosts  []string // Lista de Hosts disponíveis para balanceamento
	mutex  sync.Mutex
	random *rand.Rand // Gerador de números aleatórios
}

// Inicializa um novo balanceador Random
func NewRandomBalancer(hosts []string) *RandomBalancer {
	src := rand.NewSource(time.Now().UnixNano())
	return &RandomBalancer{
		hosts:  hosts,
		random: rand.New(src),
	}
}

// Retorna um host aleatório
func (r *RandomBalancer) getHost() string {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	// Simplesmente calcula um número aleatório entre 0 e o len(r.hosts)
	randomIndex := r.random.Intn(len(r.hosts))
	return r.hosts[randomIndex]
}

func main() {
	// Lista de hosts disponíveis
	hosts := []string{
		"http://host1.com",
		"http://host2.com",
		"http://host3.com",
	}

	// Inicia o mecanismo Random
	randomBalancer := NewRandomBalancer(hosts)

	// Simula 30 requisições
	for i := 0; i < 30; i++ {
		host := randomBalancer.getHost()
		fmt.Printf("Requisição %d direcionada para: %s\n", i+1, host)
	}
}

```

# Implamentações e Tecnologias

## Envoy Proxy

## Nginx 

## HAProxy

## Cloud Load Balancers

## Kubernetes Ingress Controllers



#### Revisores

* [Tarsila, o amor da minha vida]()

* Teste

> Imagens geradas pelo DALL-E

#### Referencias

[Load balancing in cloud computing: A big picture](https://www.sciencedirect.com/science/article/pii/S1319157817303361)

[Availability and Load Balancing in Cloud Computing](https://d1wqtxts1xzle7.cloudfront.net/76748183/25-ICCSM2011-S0063-libre.pdf?1639832780=&response-content-disposition=inline%3B+filename%3DAvailability_and_Load_Balancing_in_Cloud.pdf&Expires=1703003902&Signature=gAi9-DNn~~xSieqOS~ZWrtG-Nf9QRUHyfad0uYjSTtSU~3mdPfguO7LTxYoIjio2j8asc2B62qSLA8QuN3p5xkPNte5jfbLnykFJseai~hiB01wATbxInnWwPwmz73WWs1tNxQ4gvODIof1t4jhS8AN9n2UfHHkMcwXFhgLsHSIk9FkXDp1MCXrIsQzK8728nb55fbQ7E312yVT7BstOlkQxwF62rFo8GpO-bFShYs7a5a~ZVpjTT-lAozeYDWrvG8Etn2nA5RncuWFDisU4MmN29-4bksPdX-7f1rOvbP8nBpVtG4UKqyQSN4Mx2bv7PZDvkkdlMPktu1mvGcw55w__&Key-Pair-Id=APKAJLOHF5GGSLRBV4ZA)

[Singh, Gurasis, and Kamalpreet Kaur. "An improved weighted least connection scheduling algorithm for load balancing in web cluster systems."](https://d1wqtxts1xzle7.cloudfront.net/56786000/IRJET-V5I3455-libre.pdf?1528867659=&response-content-disposition=inline%3B+filename%3DAn_Improved_Weighted_Least_Connection_Sc.pdf&Expires=1703004066&Signature=E~zGV5JM41QwUw29m~Hv836Zr9FotHK0ahR5Ss5i5LBFx324-Fj1sDmHN70lQYa3vWnOxOKFFOMPWqAgeK~OgEaaeFS1aHX0twhCFZkTJyXc5wdOHu2gc9Xwp6RFuFjt14jHFU83Ztg~Sat2VgAElLwgAv6VypmMtU1aZSgu65Xy8BRHLReLugC9WgE5K7Mefk-5D3WDl4LlCiS32SMeZiN2cRRAsAnwSrnk94Hpp5cGAd1~sxAqCQydhIkWUoKpIY2JCtsXBpGTAa0rqjLCIfSmhzwdu4fJEm2e0q85c~QzXvZZ6Ki2NNrwyyppHogXONTy21zA4HVn8Sx1Es2HCQ__&Key-Pair-Id=APKAJLOHF5GGSLRBV4ZA)

[S. Kaur, K. Kumar, J. Singh and Navtej Singh Ghumman, "Round-robin based load balancing in Software Defined Networking", 2015](https://ieeexplore.ieee.org/abstract/document/7100616/)

[Load Balancing 101 - Priyanka Hariharan](https://medium.com/the-kickstarter/load-balancing-101-81710aa7a3d7)

[What is Round Robin Scheduling in OS?](https://www.scaler.com/topics/round-robin-scheduling-in-os/)

[What Is Load Balancing?](https://www.nginx.com/resources/glossary/load-balancing/)

[AWS - Application Load Balancers / Routing algorithms](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-target-groups.html#modify-routing-algorithm)

[](https://medium.com/dazn-tech/aws-application-load-balancer-algorithms-765be2eca158)

[Reverse Proxy vs Load Balancer](https://www.nginx.com/resources/glossary/reverse-proxy-vs-load-balancer/)

[Maglev: A Fast and Reliable Software Network Load Balancer](https://static.googleusercontent.com/media/research.google.com/pt-BR//pubs/archive/44824.pdf)

[Envoy - Supported load balancers](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers)

[Load balancing services in Consul service mesh with Envoy](https://developer.hashicorp.com/consul/tutorials/developer-mesh/load-balancing-envoy)

[Kubernetes Networking: Load Balancing Techniques and Algorithms](https://romanglushach.medium.com/kubernetes-networking-load-balancing-techniques-and-algorithms-5da85c5c7253)