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

Imagine um supermercado pequeno do seu bairro. Imagine esse estabeleciomento lotado num horário de pico. **Esse supermercado possui apenas um caixa de atendimento para todos os clientes presentes**. Nesse ambiente, podemos fazer a seguinte leitura: 

Todos os clientes têm que esperar na mesma fila, e como ela está longa, isso causa atrasos e deixa todos irritados. 

O único caixa eletrônico está sobrecarregado, aumentando o estresse do atendente, podendo ocasionar erros devido à pressão constante.

Mesmo que alguns clientes tenham apenas poucos itens, como por exemplo um litro de refrigerante, eles ainda têm que esperar sua vez, disputando com pessoas com carrinhos extremamente lotados com sua compra do mês de algumas pessoas. 

Se esse caixa por ventura falhar, quebrar, queimar, toda a operação do mercadinho será comprometida. 

Nesse exemplo podemos traçar um paralelo para um ambiente que não faz uso de um balanceamento de carga e podemos começar a entender que tipo de problemas esse tipo de abordagem resolve. 

<br>

### Resolvendo problemas com balanceamento de carga

![com load balancing](/assets/images/system-design/com-balance.png)

Agora para entender o funcionamento e diferencial de um balanceamento de carga, imagine que o dono desse mercadinho fez um investimento e comprou mais alguns caixas e contratou mais alguns atendentes para acelerar a fila de espera. 

Com vários caixas, os clientes podem se distribuir entre eles, resultando em filas mais curtas, onde cada um dos caixas tem menos pressão, o que diminui a chance de estresse e erros humanos. 

Se caso um caixa der problema e precisar de manutenção, o fluxo é apenas degradado parcialmente, e ainda continua operando apesar disso. 

Alguns desses caixas podem ser utilizados para um numero menor de volumes, ou para atendimento preferncial, fazendo com que os mesmos evitem concorrência com clientes com carrinhos lotados. 

Dessa forma, os clientes podem ser atendidos de forma mais rápida aumentado a eficiência do estabelecimento, o que acarreta por tabela em uma experiência melhor para os clientes. 

Esse cenário exemplifica o funcionamento do balanceamento de carga no seu dia a dia, agora podemos entrar em termos técnicos do funcionamento e aplicações de balanceadores de carga. 

<br>

# Fundamentos de Balanceadores de Carga

Um Load Balancer é uma ferramenta para gestão de tráfego de rede em ambientes com múltiplos servidores, como datacenters privados, clouds públicas e aplicações web distribuídas. Seu principal objetivo é **distribuir as requisições de entrada entre vários hosts de forma eficiente e equitativa, otimizando o uso de recursos, melhorando tempos de resposta, minimizando a carga em cada servidor e garantindo a disponibilidade do serviço em caso de falha de algum dos hosts de seu pool**. 

Quando olhamos para o lado de resiliência, um load balancer desempenha uma função crucial, **evitando que qualquer host de seu pool de servidores se torne um ponto único de falha**. 

As aplicações de um balanceador de carga pode variar desde hardwares de networking até softwares específicos que atuam em alguma camada de rede para distribuir carga entre hosts que falem o mesmo protocolo do balanceador. 

Alguns balanceadores podem desempenhar algumas outras funções além da distribuição de tráfego propriamente dita, podendo aceitar customizações de camada 7 para fazer roteamentos especificos com base em basepaths, querystrings, headers e ip's de origem. Outra função muito comum de ser encontrada em softwares e apliances de balanceamento de carga é o offload de certificados SSL/TLS tirando essa responsabilidade de cada uma das aplicações do pool. 

Abaixo podemos ver um exemplo do funcionamento de de um balanceador de carga: 


![GIT Load Balancer](/assets/images/system-design/load-balancer.gif)

<br>

## Proxy Reverso vs Load Balancer

Um Reverse Proxy, ou Proxy Reverso, atua como um intermediário para requisições destinadas a um ou mais servidores internos. Ele recebe as requisições dos clientes e as encaminha para o servidor apropriado. Após o servidor processar a requisição, o reverse proxy retorna a resposta do servidor ao cliente inicial. 

> Ué, não é exatamente isso que um Load Balancer faz? 

A definição dos dois soam bem parecidas, pois ambas as aplicações se baseiam em ficar entre clientes e servidores para cumprir o papel de ponto único de acesso entre N hosts de aplicação, então é compreensivel que exista muita confusão sobre o papel de cada um. 

A implementação de um load balancer faz bastante sentido **quando temos muitos hosts no pool**, **quando o volume é grande demais para ser endereçado para apenas um servidor**, e quando a resiliência e diminuição de pontos únicos de falha são requisitos essenciais. 

Um load balancer também é bem vindo em ambientes onde a **escalabilidade horizontal é presente e constante**, pois é um requisito de design balanceadores serem **receptíveis a entrada e saída de novos hosts do pool** a todo momento, e inclusive serem capazes disponibilizar algum mecanismo de **checar a saúde dos hosts** constantemente para evitar degradação da experiência do cliente por falha ou degradação de algum deles.

Comparando com um proxy reverso, a implementação do mesmo pode estar ligado mais ser uma simples camada entre cliente e servidor servindo como uma camada de controle intermediária, aplicando regras de roteamento, fazendo offload de SSL e implementando **caching**. 

Enquanto o load balancer é implementado quando existem vários hosts da mesma aplicação, o reverse proxy pode ser implementado de 1:1. É comum um servidor expor a aplicação atrás de uma camada de proxy reverso que é encarregada de gerenciar pool de conexões, limites de upload, tipos de conteúdo, restrições, segurança e cacheamento. É o caso por exemplo de **Sidecars de Envoy no Kubernetes**, A Stack** Nginx com PHP FPM**, Servidores Web rodando NodeJS, Java com Spring, Golang serem disponibilizados atrás de um proxy reverso para fazer a gestão das requisições e etc. 

Também é possível encontrar configurações de proxy reverso onde temos mais de um host no pool assim no presumido no load balancer, e também mais de uma aplicação sendo servida pelo mesmo proxy fazendo um controle de redirecionamento através de URL's, Basepaths, Headers, IP de origem e etc. 

Soluções modernas de balanceamento de carga podem cumprir tanto o papel inicial de load balancing quanto de reverse proxy em alguma escala. 


<br>

# Algoritmos de Balanceamento de Carga

Existem várias abordagens diferentes quando falamos de balanceamento de carga. Alguns algoritmos podem ter melhor performance e eficiência que outros em determinados cenários como também podem ser causadores de mais problemas. 

É interessante entender quais os tipos de algoritmos de balanceamento existem e que tipo de problemas cada um resolve, e também onde empregar e onde evitar empregar cada um deles. 

A seguir vamos encontrar uma série de algoritmos de balanceamento de carga que eu considerei mais importantes para entendimento. Existem vários outros que não estão listados, mas tem material de apoio no final do artigo caso se sinta a vontade para explorar mais. 

<br>

## Round Robin 

Round Robin é um dos algoritmos mais comuns quando falamos sobre balanceamento de carga, e seu objetivo é **distribuir carga para os servidores disponíveis de forma uniforme e ciclica**. Sua implementação inicial vem para resolver problemas de escalonamento de processos a nível de CPU, e é baseado em uma variável de tempo identificada como `quantum`. Essa variáve identifica quanto tempo uma CPU vai dar de "atenção" para um processo na fila, esse tipo de técnica impede que os processos que estão sendo executados morram por `Starvation`, criando uma  uma rotatividade cíclica de forma equitativa. Entender esse conceito a nível de schueduling de processos é necessário para compreender como ele funciona a nível de um balanceador de carga. 

No contexto de balanceamento de carga, **Round Robin** é usado para distribuir as requisições de rede ou tráfego de maneira uniforme entre um conjunto de servidores. Cada nova requisição requisição consulta o atual host ativo dentro do calculo de tempo do quantum e encaminha a requisição para o mesmo. 

O objetivo é garantir que nenhum servidor seja sobrecarregado com muitos requests de forma desproporcional enquanto outros fiquem subutilizados. 

Tanto no balanceamento de carga entre servidores quanto no escalonamento de CPU, o Round Robin é centrado na ideia de distribuir o trabalho ou recursos de maneira justa e equitativa, evitando a sobrecarga de um único recurso, em ambos os casos, o Round Robin é apreciado por sua simplicidade e abordagem justa.

Essa forma de balanceamento ciclico torna esse tipo de algoritmo altamente receptivo em ambientes que possuam escalabilidade horizontal, tornando muito fácil remover e adicionar novos hosts do pool. 

No exemplo do supermercado, imagine que podemos direcionar os clientes para cada caixa em ordem, um após o outro, independentemente do tamanho da fila.

### Limitações do Round Robin

A grande crítica ao Round Robin é que por mais que seu funcionamento cíclico entre os hosts entregue requests de forma igualitária, nem todos os requests tem o mesmo peso de processamento, e isso pode resultar em ineficiências se os servidores tiverem capacidades variadas. 

Em uma aplicação Web alguns requests podem requerer mais poder computacional que outros, fazendo com que diferentes hosts da lista apresentem saturação e tempos de resposta diferentes. Um exemplo nem tão lúdico assim, um request para salvar um pedido de compra pode concorrer no mesmo host com um request que está gerando um relatório de fechamento contábil da empresa, fazendo com que essa solicitação demore mais do que normalmente demoraria. 

Outra grande desvantagem pode ser encontrada em alguns balanceadores que respeitam a variável de tempo `quantum`. Workloads que se utilizam desses algoritmos podem receber cargas repentinas dentro do curto espaço de tempo do quantum, e todas essas requisições acabarem sendo encaminhadas para o mesmo host. 

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

O algoritmo de "Least Request" é uma abordagem de balanceamento simples mas bem eficiente que nos permite direcionar o request atual para o servidor que processo menos requisições até o momento. Ele trabalha com um contador vinculado aos hosts ativos que incrementa individualmente conforme as requisições vão sendo distribuídas. Para selecionar o proximo host para o qual o request será redirecionado, ele prioriza o host com o menor valor entre as possibilidades.  Dependendo da implementação esse contador pode zerado dentro de um período razoável de tempo, o tornando escalável para ambientes que possuam escalabilidade horizontal. 

O objetivo do Least Request é **garantir uma distribuição de carga equitativa baseada na frequência de requisições atendidas** em vez de sua duração ou complexidade, o que faz ele **uma alternativa vantajosa para cenários que possuam requisições uniformes e curtas**, como um microserviço que possuam poucas rotas que sejam muito bem performáticas por exemplo um serviço de consulta de usuários que receba um `id` e retorne o recurso muito rapidamente. 

No mercado, imagine que podemos direcionar clientes para o caixa que tem menos pessoas na fila, assegurando uma distribuição mais equilibrada.

### Limitações do Least Request

Por mais que o Least Request resolva o grande problema de uniformidade de requisições, ele ainda pode apresentar problemas de desbalanceamento em ambientes que possuam requisicões muito diversificadas que possuam durações muito diferentes. Assim como o Round Robin, ele não leva em conta a saturação dos hosts, fazendo com que apenas "contar" as requisições não sejam suficientes para representar a real distribuição de carga.

Implementações que não tenham uma forma de "zerar" o contador de requisições podem se tornar altamente problematicos em ambientes sucetiveis a escabalilidade horizontal. Uma má implementação desse algoritmo pode acarretar em uma "negação de serviço" involuntária em novos hosts que entrarem no pool do balanceador. 

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