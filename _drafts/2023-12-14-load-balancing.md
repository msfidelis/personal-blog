---
layout: post
image: assets/images/system-design/balance-1.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Load Balancing, Proxy Reversos e Algoritmos
---

Este é o terceiro artigo da série sobre System Design. Hoje, vamos dar um *deep dive* em um tópico interessante e frequentemente subestimado: os **Balanceadores de Carga** e os **Proxies Reversos**.

Escrever este artigo foi particularmente interessante, pois o tema dos balanceadores de carga é muitas vezes abstraído por soluções Open Source e por plataformas de Cloud Públicas. No entanto, entender seu funcionamento em ambientes que permitem um nível maior de customização pode ser valioso para aprimorar aspectos de escalabilidade, performance e resiliência.

Este texto foi concebido para ser útil e informativo para todos os níveis de conhecimento sobre o assunto. Iniciaremos com uma abstração lúdica para ilustrar o problema real resolvido por um balanceador de carga, seguindo depois para tópicos mais complexos relacionados a este tema.

Vamos iniciar desenhando um cenário do "mundo real" que exemplifica a necessidade e a eficácia de um balanceador de carga.

<br>

### O Problema da Falta de Balanceamento de Carga

![sem load balancing](/assets/images/system-design/no-balance.png)

Imagine um pequeno supermercado em seu bairro, lotado em um horário de pico. **Este estabelecimento conta apenas com um caixa para atender todos os clientes presentes**. Podemos observar o seguinte cenário: 

Todos os clientes são forçados a esperar na mesma fila gigante, gerando atrasos e irritação generalizada.

O único caixa eletrônico fica sobrecarregado, aumentando o risco de erros cometidos pelo atendente devido ao estresse constante.

Clientes com compras pequenas, como uma garrafa de refrigerante ou um pacote de papel higienico, são obrigados a aguardar no mesmo lugar que aqueles com carrinhos lotados com suas compras do mês, tornando o processo ineficiente.

Se, por alguma razão, esse caixa falhar ou se quebrar, toda a operação do mercadinho será afetada.

Este exemplo ilustra os desafios de um ambiente sem balanceamento de carga, ajudando a compreender que tipos de problemas essa abordagem se propõe a solucionar.

<br>

### Resolvendo problemas com balanceamento de carga

![com load balancing](/assets/images/system-design/com-balance.png)

Agora para entender o funcionamento e diferencial de um balanceamento de carga, imagine que o dono desse mercadinho fez um investimento e comprou mais alguns caixas e contratou mais alguns atendentes para acelerar a fila de espera. 

Com a presença de múltiplos caixas, os clientes têm a opção de escolher entre diferentes filas, levando a uma redução significativa no tempo de espera. Cada caixa, enfrentando uma menor carga de trabalho, tem menor probabilidade de estresse e erro.

No caso de um caixa apresentar problemas e necessitar de manutenção, o impacto no fluxo geral de clientes é apenas parcial, permitindo que a operação continue, embora de forma degradada.

Alguns desses caixas podem ser utilizados para um numero menor de volumes, ou para atendimento preferencial, fazendo com que os mesmos evitem concorrência com clientes com carrinhos lotados. 

Esta abordagem não só agiliza o atendimento, aumentando a eficiência do estabelecimento, mas também melhora significativamente a experiência dos clientes.

Esse cenário exemplifica o funcionamento do balanceamento de carga no seu dia a dia, agora podemos entrar em termos técnicos do funcionamento e aplicações de balanceadores de carga. 

<br>

# Fundamentos de Balanceadores de Carga

Um Load Balancer é uma ferramenta essencial para a gestão de tráfego de rede em ambientes com múltiplos servidores, tais como datacenters privados, nuvens públicas e aplicações web distribuídas. Sua função principal é **distribuir as requisições de entrada entre vários hosts de maneira eficiente e equitativa, otimizando o uso dos recursos, aprimorando os tempos de resposta, reduzindo a carga em cada servidor e assegurando a disponibilidade do serviço, mesmo em caso de falhas em algum dos hosts do pool**.

Do ponto de vista da resiliência, o load balancer desempenha um papel crucial, **evitando que qualquer servidor individual do pool se torne um ponto único de falha**.

As aplicações de um balanceador de carga são diversas, abrangendo desde hardwares de rede até softwares especializados que operam em determinadas camadas de rede, distribuindo a carga entre hosts que operam no mesmo protocolo do balanceador.

Além da distribuição de tráfego, muitos balanceadores de carga oferecem funcionalidades adicionais. Eles podem permitir customizações na camada 7 da rede, como roteamento específico baseado em basepaths, querystrings, headers e IPs de origem. Uma função comum em softwares e dispositivos de balanceamento de carga é o offload de certificados SSL/TLS, removendo essa carga de processamento das aplicações individuais do pool.

A seguir, apresentaremos um exemplo ilustrativo do funcionamento de um balanceador de carga:



![GIF Load Balancer](/assets/images/system-design/load-balancer.gif)

<br>

## Proxy Reverso vs Load Balancer

Um Proxy Reverso, ou Reverse Proxy, atua como um intermediário para requisições destinadas a um ou mais servidores internos. Ele recebe as requisições dos clientes e as encaminha para o servidor apropriado. Após o servidor processar a requisição, o proxy reverso retorna a resposta do servidor ao cliente original.

> Ué, não é isso que um Load Balancer faz?

A definição de ambos parece semelhante, já que as duas ferramentas atuam entre clientes e servidores como pontos únicos de acesso a múltiplos hosts de aplicação. Portanto, é compreensível a confusão sobre o papel de cada um.

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

A seguir, apresentarei alguns dos algoritmos de balanceamento de carga que considero mais relevantes para o entendimento do tema. Existem muitos outros que não estão listados aqui, mas você pode encontrar material adicional no final deste artigo para explorar mais sobre o assunto.


<br>

## Round Robin 

**Round Robin** é um dos algoritmos mais utilizados em balanceamento de carga, com o objetivo de **distribuir a carga de maneira uniforme e cíclica entre os servidores disponíveis**. Originalmente concebido para o escalonamento de processos a nível de CPU, baseia-se na variável `quantum`, que define o tempo dedicado pela CPU a cada processo na fila. Essa abordagem previne o problema de `Starvation`, assegurando uma rotatividade cíclica e equitativa dos processos. Compreender esse conceito no contexto do escalonamento de processos é essencial para entender sua aplicação em balanceadores de carga.

No âmbito do balanceamento de carga, o **Round Robin** é empregado para distribuir uniformemente as requisições de rede ou o tráfego entre um grupo de servidores. Cada nova requisição é direcionada ao próximo servidor na fila, seguindo ou não a lógica do `quantum`.

O principal objetivo é assegurar que nenhum servidor seja desproporcionalmente sobrecarregado com requisições, enquanto outros permanecem subutilizados. O **Round Robin** é valorizado tanto no balanceamento de carga entre servidores quanto no escalonamento de CPU por sua simplicidade e abordagem justa, que distribui trabalho ou recursos de forma equânime, evitando a sobrecarga de um único recurso.

Sua natureza cíclica faz com que o algoritmo seja particularmente eficaz em ambientes com escalabilidade horizontal, facilitando a adição ou remoção de hosts do pool.

Analogamente, em um supermercado, o **Round Robin** seria como direcionar os clientes para cada caixa em sequência, um após o outro, independentemente do tamanho da fila de cada um.


### Limitações do Round Robin

Uma crítica frequente ao método **Round Robin** é que, apesar de distribuir requisições de forma igualitária entre os hosts, ele não leva em conta que nem todas as requisições demandam o mesmo nível de processamento. Isso pode levar a ineficiências, especialmente se os servidores envolvidos possuírem capacidades variadas.

Na prática, em aplicações web, alguns requests podem exigir mais recursos computacionais do que outros. Por exemplo, uma requisição para salvar um pedido de compra pode acabar competindo no mesmo host com uma requisição que gera um relatório de fechamento contábil da empresa. Isso pode resultar em uma resposta mais lenta para a solicitação, devido à saturação desigual dos hosts.

Outra desvantagem do **Round Robin** se manifesta em balanceadores que adotam a variável de tempo `quantum`. Em cenários onde workloads experimentam picos de carga repentina dentro do breve intervalo do `quantum`, todas essas requisições podem ser direcionadas para o mesmo host. Isso pode sobrecarregar temporariamente um servidor específico, enquanto os outros permanecem subutilizados.


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

O algoritmo **Least Request** é uma abordagem de balanceamento de carga simples, porém eficiente, que direciona a requisição atual para o servidor que processou o menor número de requisições até aquele momento. Este método utiliza um contador associado a cada host ativo, que incrementa individualmente à medida que as requisições são distribuídas. Para escolher o próximo host, o algoritmo prioriza aquele com o menor contador dentre as opções disponíveis. Dependendo da implementação, este contador pode ser reiniciado após um período específico, tornando-o escalável em ambientes com escalabilidade horizontal.

O objetivo do **Least Request** é **garantir uma distribuição equitativa de carga baseada na frequência com que as requisições são atendidas**, ao invés de focar na duração ou complexidade delas. Isso o torna **uma opção vantajosa para cenários com requisições uniformes e curtas**. Um exemplo seria um microserviço com poucas rotas, mas de alta performance, como um serviço de consulta de usuários que recebe um `id` e retorna o recurso rapidamente.

Analogamente, no supermercado, seria como direcionar os clientes para o caixa com a menor fila, buscando uma distribuição mais equilibrada.

### Limitações do Least Request

Embora o **Least Request** aborde a uniformidade das requisições, ele ainda pode enfrentar problemas de desbalanceamento em ambientes com requisições muito diversificadas e de durações variadas. Assim como o [Round Robin](#round-robin), ele não considera a saturação dos hosts, o que pode tornar a simples contagem de requisições insuficiente para representar a real distribuição de carga.

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

```
Requisição 1 direcionada para: http://host1.com
Requisição 2 direcionada para: http://host2.com
Requisição 3 direcionada para: http://host3.com
Requisição 4 direcionada para: http://host1.com
Requisição 5 direcionada para: http://host2.com
// ...
Requisição 21 direcionada para: http://host3.com
Requisição 22 direcionada para: http://host1.com
Requisição 23 direcionada para: http://host2.com
Requisição 24 direcionada para: http://host3.com
Requisição 25 direcionada para: http://host1.com
Requisição 26 direcionada para: http://host2.com
Requisição 27 direcionada para: http://host3.com
Requisição 28 direcionada para: http://host1.com
Requisição 29 direcionada para: http://host2.com
Requisição 30 direcionada para: http://host3.com
Distribuição de requisições executadas: [10 10 10]
```

<br>

## Least Connection

Os algoritmos de **Least Connection** representam técnicas mais sofisticadas de balanceamento de carga, utilizadas para distribuir requisições de forma inteligente entre os hosts do pool de um balanceador. Ao contrário do [Round Robin](#round-robin) e [Least Request](#least-request), que visam distribuir requisições uniformemente sem considerar o estado atual dos servidores, essa abordagem tenta levar em conta a carga de trabalho de cada servidor.

O método **Least Connection** **direciona a solicitação atual para o servidor com o menor número de conexões ativas no momento**. Uma "conexão ativa" se refere a **uma sessão ou interação em andamento entre cliente e servidor**, independentemente de a requisição já ter sido processada, como em casos de implementações que suportam keep alive, web sockets, GRPC persistentes, etc.

Por exemplo, se um host está gerenciando 5 conexões ativas e outro apenas 3, a próxima requisição será direcionada para o host com 3 conexões, mesmo que essas possam ser tarefas de menor demanda.

### Limitações do Least Connection

Uma desvantagem menos crítica, mas ainda relevante, é que tanto o **Least Connection** quanto algoritmos semelhantes são mais complexos de implementar em comparação à simplicidade do [Round Robin](#round-robin). No entanto, essa complexidade pode ser facilmente superada ao se utilizar tecnologias que já suportam esses cenários.

O **Least Connection** se concentra no número de conexões ativas, sem avaliar a carga de cada uma delas. Isso pode levar à sobrecarga de servidores que lidam com conexões mais exigentes, um problema semelhante ao observado nas opções anteriores. Além disso, a necessidade de gerenciar essas conexões pode consumir recursos significativos do balanceador.

Servidores com muitas conexões de longa duração, como as mantidas por keep alive, podem aparentar estar menos ocupados do que realmente estão. Isso cria um potencial para ineficiências na distribuição de carga, levando a um desbalanceamento.



<br>

## Least Outstanding Requests (LOR)

O **Least Outstanding Requests (LOR)** é um algoritmo de balanceamento de carga muito sofisticado que aborda o principal problema encontrado nos algoritmos anteriores: a **saturação dos hosts**. Há uma uma diferença sutíl entre o **LOR** e o **Least Connection**. Enquanto o **Least Connection foca em gerenciar conexões ativas (independente de estarem em uso ou não)**, o LOR considera o número de **requisições pendentes em cada host**. Uma **"requisição pendente"** é aquela que foi iniciada, mas ainda não concluída, seja ou não parte de uma conexão ativa contínua. Isso torna o LOR mais eficiente do que o Least Connection na identificação de hosts com maior carga de processamento, mais conexões em espera, e tempos de resposta mais longos.

Em resumo, enquanto o **Least Connection considera "quantas conexões"** estão ativas, o **LOR foca em "quantas requisições" ainda estão sendo processadas**.

O LOR busca equilibrar a carga de trabalho, direcionando novas requisições para os hosts com menos requisições pendentes. Dessa forma, ele visa garantir que todos os servidores mantenham um volume de trabalho semelhante e gerenciável, concentrando-se na possível saturação em vez da quantidade de requisições. Isso o torna uma opção eficaz em ambientes onde as requisições podem ter tempos de resposta variáveis e imprevisíveis.

### Limitações do Least Outstanding Requests

O LOR exige monitoramento contínuo e detalhado do estado das requisições em cada servidor. Essa necessidade aumenta a complexidade da implementação e exige mais recursos computacionais para manter o acompanhamento em tempo real, especialmente em sistemas distribuídos.

Essa complexidade pode impactar negativamente no desempenho do balanceador, principalmente em situações de variação repentina de carga de trabalho. Além disso, determinar com precisão quando uma requisição é concluída pode ser um desafio significativo.


<br>

## IP Hash Balancing

O algoritmo de IP Hash é uma técnica de balanceamento de carga frequentemente empregada em componentes de rede, mas sua lógica também pode ser aplicada em diversos outros tipos de algoritmos de balanceamento em aplicações. É particularmente útil para manter a persistência da sessão em aplicações web.

Algoritmos baseados em IP Hash criam um hash consistente a partir do endereço IP do cliente para determinar para qual host as requisições ou pacotes de rede serão direcionados.

O processo de hashing do IP do cliente sempre resulta no mesmo hash, o que significa que as requisições de um cliente específico serão consistentemente encaminhadas para o mesmo host de destino, **contanto que este esteja disponível**.

Essa técnica é utilizada em diversos outros algoritmos, como o **Maglev** que será discutido posteriormente. Ela se mostra eficaz em workloads onde é crucial manter um tipo de "sessão", em situações que exigem que as requisições sejam resolvidas em uma certa ordem de dependência, facilitadas por caching, ou que necessitem sumarizar chunks de dados ou executar operações de persistência de maneira contínua.

### Limitações ao Implementar a Técnica de IP Hashing

O IP Hashing é menos eficaz quando os usuários estão atrás de NATs ou proxies, situação em que muitos podem compartilhar o mesmo endereço IP público. Além disso, pode resultar em uma distribuição desigual de carga entre os servidores, especialmente se a base de usuários não estiver distribuída uniformemente em termos de endereços IP. Como alternativa a isso a lógica de IP Hash pode se extender a outros valores vindos de headers, URL's e etc. 


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

	// Simula 20 Requisições
	for i := 0; i < 20; i++ {
		clientIP := clientIPs[i%len(clientIPs)]
		host := ipHashBalancer.getHost(clientIP)
		fmt.Printf("Requisição %d do IP %s direcionada para: %s\n", i+1, clientIP, host)
	}
}
```

```
Requisição 1 do IP 192.168.1.1 direcionada para: http://host1.com
Requisição 2 do IP 10.0.0.2 direcionada para: http://host1.com
Requisição 3 do IP 10.0.0.3 direcionada para: http://host2.com
Requisição 4 do IP 172.16.1.1 direcionada para: http://host3.com
Requisição 5 do IP 172.16.1.2 direcionada para: http://host3.com
Requisição 6 do IP 192.168.2.1 direcionada para: http://host3.com
Requisição 7 do IP 192.168.2.2 direcionada para: http://host2.com
Requisição 8 do IP 192.168.1.1 direcionada para: http://host1.com
Requisição 9 do IP 10.0.0.2 direcionada para: http://host1.com
Requisição 10 do IP 10.0.0.3 direcionada para: http://host2.com
Requisição 11 do IP 172.16.1.1 direcionada para: http://host3.com
Requisição 12 do IP 172.16.1.2 direcionada para: http://host3.com
Requisição 13 do IP 192.168.2.1 direcionada para: http://host3.com
Requisição 14 do IP 192.168.2.2 direcionada para: http://host2.com
Requisição 15 do IP 192.168.1.1 direcionada para: http://host1.com
Requisição 16 do IP 10.0.0.2 direcionada para: http://host1.com
Requisição 17 do IP 10.0.0.3 direcionada para: http://host2.com
Requisição 18 do IP 172.16.1.1 direcionada para: http://host3.com
Requisição 19 do IP 172.16.1.2 direcionada para: http://host3.com
Requisição 20 do IP 192.168.2.1 direcionada para: http://host3.com
```

<br>

## Maglev

O Maglev é um algoritmo desenvolvido pela Google e representa uma técnica avançada de balanceamento de carga, ideal para sistemas complexos de computação distribuída. Apesar de ser uma inovação relativamente recente, ainda não é amplamente utilizado fora de certos contextos.

Este algoritmo distribui as requisições de clientes para um conjunto de servidores de maneira que cada cliente seja consistentemente encaminhado para o mesmo servidor, **desde que este esteja disponível**. Isso é realizado através do uso de **tabelas de hash consistentes** que mapeiam clientes para servidores de forma determinística, mas equilibrada, assim tendo familiaridade com o que foi discutido em **IP Hash**,

O Maglev tem como objetivo garantir uma **distribuição consistente das requisições, priorizando o cache de dados e a manutenção da sessão do usuário**. Ele oferece uma noção de "persistência", o que pode gerar desafios de escalabilidade em comparação com outras opções de balanceamento de carga. Isso ocorre porque os cenários de aplicação do Maglev são distintos dos encontrados em um balanceamento stateless entre várias réplicas de uma API REST, por exemplo.

O objetivo principal do Maglev é assegurar uma mínima flutuação no mapeamento das requisições, garantindo consistência e algo similar a uma "sessão".

Esse algoritmo é especialmente adequado para balanceamento entre datacenters, ingestão de dados e outros cenários que exigem continuidade e persistência entre as requisições. Também é aplicável em soluções multi-tenant, onde a segregação do ambiente é feita com base no IP de origem do cliente.

### Limitações do Maglev

O Maglev, embora eficiente para balanceamento de carga em grandes sistemas e ambientes de data center, enfrenta desafios ao lidar com mudanças rápidas no pool de hosts, como em ambientes com escalabilidade horizontal. Além disso, muitas vezes requer hardware e software específicos para operar em seu pleno potencial.


<br>

## Random Load Balancing

Dentre todos os algoritmos apresentados, o **Random** pode ser considerado o mais simples, embora seja um dos menos utilizados. Diferentemente de outros métodos, como Round Robin ou Least Connections, este algoritmo não leva em conta o estado atual ou a carga de trabalho dos servidores ao tomar decisões. Ele simplesmente seleciona um host aleatoriamente do pool de servidores para encaminhar a requisição.

O balanceador de carga mantém uma lista de todos os servidores disponíveis, e quando uma requisição chega, ele escolhe um servidor de maneira aleatória. Esse processo é geralmente realizado por meio de um gerador de números aleatórios para selecionar um índice na lista de servidores.

Sua implementação é extremamente simples, não requerendo estado ou monitoramento contínuo dos servidores. O algoritmo também tem a vantagem de baixa **"latência"** na decisão, já que não há estados a serem gerenciados.

É mais frequentemente utilizado em cenários onde a carga de trabalho é leve ou uniformemente distribuída, e em ambientes que priorizam a escalabilidade rápida e fácil. Em outros contextos, o uso deste método é geralmente desaconselhado.

### Limitações do Random

A natureza aleatória do algoritmo pode resultar em uma distribuição desigual da carga, especialmente quando o número de requisições é baixo. Isso pode levar tanto à sobrecarga inesperada de alguns servidores quanto à subutilização de outros recursos.


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

	// Simula 10 requisições
	for i := 0; i < 10; i++ {
		host := randomBalancer.getHost()
		fmt.Printf("Requisição %d direcionada para: %s\n", i+1, host)
	}
}
```

```
❯ go run main.go
Requisição 1 direcionada para: http://host2.com
Requisição 2 direcionada para: http://host3.com
Requisição 3 direcionada para: http://host2.com
Requisição 4 direcionada para: http://host3.com
Requisição 5 direcionada para: http://host3.com
Requisição 6 direcionada para: http://host3.com
Requisição 7 direcionada para: http://host2.com
Requisição 8 direcionada para: http://host1.com
Requisição 9 direcionada para: http://host1.com
Requisição 10 direcionada para: http://host2.com
```

# Implamentações e Tecnologias


### Envoy Proxy

![Envoy Logo](/assets/images/system-design/envoy-logo.png)

O [Envoy Proxy](https://www.envoyproxy.io) é um proxy construído para suportar altos volumes, de alto desempenho, e que precisem de alta confiabilidade e escalabiliade utilizando muito pouco recurso computacional. O Envoy é projetado para aplicações Cloud Native e arquiteturas baseadas em microserviços. Criado pela Lyft e agora um projeto da [Cloud Native Computing Foundation](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers), o Envoy é uma solução de código aberto que ganhou popularidade por sua flexível para o gerenciamento de tráfego de rede, e por ser fácilmente extensível para vários cenários.

Várias outras tecnologias Cloud Native se baseiam no Envoy para cumprir tarefas de controle de rede, como o [Istio Service Mesh](), o [Contor Ingress Controller](), [Gloo Ingress Controller](), [Emissary Ingress Controller](), [enRoute API Gateway](), [Higress API Gateway](), [Kusk Gateway]() e o próprio [Envoy Gateway](). 

São várias tecnologias que desemprenham papel de Load Balancers, Reverse Proxys e API Gateways (vamos tratar especificamente desse tópico nos proximos capítulos) que são construídos em torno do Envoy por conta de suas facilidades e extrema performance para lidar com alto volume de forma econômica. Particularmente considero o Envoy Proxy como o coração dos ecossistemas Cloud native tal como o proprio Kubernetes. 

O Envoy trabalha como Proxy de Layer 7 na camada de Aplicação para HTTP, gRPC e Websockets da mesma forma como consegue desempenhar o mesmo papel em Layers 3/4, o que torna o Envoy muito interessante quando existem vários cenários de uso dentro do mesmo workload. 

Ele possui suporte [a vários algoritmos de balanceamento de carga apresentados no texto](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers) e também a monitoramento avançado para praticamente todas as funcionalidades. 


### Nginx 

![Nginx Controller](/assets/images/system-design/nginx-logo.png)

O [Nginx]() é um servidor web e proxy reverso de alto desempenho, conhecido por sua estabilidade, rico conjunto de recursos, configuração simples e baixo consumo de recursos. Originalmente criado por Igor Sysoev em 2002, o Nginx rapidamente se tornou uma escolha muito moderna e bem vinda entre os aplicações de baixo, médio e alto tráfego por sua eficiência e escalabilidade.

O Nginx é conhecido por sua capacidade de lidar com um grande número de conexões simultâneas com um uso de memória relativamente baixo, sem perder simplicidade e interface intuitíva de configuração. 

Além de ser um servidor web, o Nginx funciona eficientemente como proxy reverso e balanceador de carga, suportando protocolos como HTTP, HTTPS, SMTP, POP3 e IMAP e inclui recursos de segurança como autenticação básica HTTP, SSL/TLS, e suporte para firewalls de aplicações web.

Sua capacidade de funcionar tanto como um servidor web quanto como um proxy reverso e balanceador de carga o torna uma ferramenta extremamente versátil em qualquer stack de tecnologia moderna.

### HAProxy

![Haproxy Logo](/assets/images/system-design/haproxy-logo.png)

O [HAProxy]() é um dos balanceadores de carga e proxies reversos mais populares e confiáveis, amplamente reconhecido por sua alta eficiência, robustez e flexibilidade. Desenvolvido por Willy Tarreau em 2000, ele é uma solução open-source que se destaca em ambientes de alto tráfego e é frequentemente usado para melhorar a performance e a confiabilidade de sites e aplicações, sendo a principal alternativa para o Nginx em alguns cenários. 

Oferece algoritmos sofisticados de balanceamento de carga, como **Round Robin**, **Least Connections** e **Source IP** hash que abordamos por aqui, permitindo uma distribuição eficiente do tráfego em vários tipos de cenários, podendo atuar como um proxy reverso para HTTP e TCP, oferecendo recursos como SSL/TLS offloading, HTTP/2 support e WebSockets.


### Traefik

![Traefik Logo](/assets/images/system-design/traefik-logo.png)

O [Traefik]() é um moderno proxy reverso e balanceador de carga HTTP de código aberto, conhecido por sua simplicidade de configuração e capacidade de se integrar automaticamente a serviços em ambientes de containerização, como Docker e Kubernetes. Lançado em 2015, o Traefik rapidamente ganhou popularidade na comunidade de DevOps e Cloud devido à sua facilidade de uso. Além do HTTP e HTTPS, o Traefik também suporta outros protocolos, como TCP e UDP.

O Traefik detecta automaticamente as alterações na configuração dos serviços, como quando containers são iniciados ou parados em ambientes como Docker ou Kubernetes, e ajusta as rotas de tráfego em tempo real sem necessidade de downtime. Essa funcionalidade de atualização dinamica é talvez um dos principais motivos de adoção do mesmo para cumprir papel de proxys reversos e balanceamento de carga. 

### Kubernetes Ingress Controllers

![Kubernetes Ingress Controllers](/assets/images/system-design/kubernetes-ingress-controller.png)

Kubernetes Ingress Controllers são componentes importantíssimos em clusters Kubernetes, oferecendo uma forma eficiente e padronizada de gerenciar o acesso externo às aplicações rodando em um cluster. Eles atuam como um ponto de entrada para o tráfego TCP, HTTP e HTTPS, permitindo a definição de regras de roteamento para distribuir o tráfego para diferentes serviços dentro do cluster, cumprindo um papel de Load Balancer externo de várias formas.

Existem uma variedade de implementações, incluindo Nginx, HAProxy, Traefik, Service Meshes, Envoy e outros, cada um com suas características e benefícios específicos que devem ser avaliados caso a caso. .

Ambos permitem de alguma forma a definição de regras de roteamento, SSL/TLS offloading e outras configurações em um único recurso, facilitando o gerenciamento e a manutenção.

Eles não apenas simplificam o gerenciamento de tráfego, mas também oferecem recursos avançados que são fundamentais para a segurança, desempenho e escalabilidade das aplicações em um ou mais clusters.


#### Cloud Load Balancers



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

[Customizing Load Balancing Algorithms in HAProxy](https://mhsamsal.wordpress.com/2021/10/14/customizing-load-balancing-algorithms-in-haproxy/)