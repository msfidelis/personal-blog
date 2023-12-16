---
layout: post
image: assets/images/system-design/balance-1.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering ]
title: System Design - Load Balancing, Proxy Reverso e Alguma Coisa
---

# Balanceadores de Carga 

# Fundamentos de Balanceadores de Carga

# Algoritmos de Balanceamento de Carga

## Round Robin 

Round Robin é um dos algoritmos mais comuns quando falamos sobre balanceamento de carga, e seu objetivo é **distribuir carga para os servidores disponíveis de forma uniforme e ciclica**. Sua implementação inicial vem para resolver problemas de escalonamento de processos a nível de CPU, e é baseado em uma variável de tempo identificada como `quantum`. Essa variáve identifica quanto tempo uma CPU vai dar de "atenção" para um processo na fila, esse tipo de técnica impede que os processos que estão sendo executados morram por `Starvation`, criando uma  uma rotatividade cíclica de forma equitativa. Entender esse conceito a nível de schueduling de processos é necessário para compreender como ele funciona a nível de um balanceador de carga. 

No contexto de balanceamento de carga, **Round Robin** é usado para distribuir as requisições de rede ou tráfego de maneira uniforme entre um conjunto de servidores. Cada nova requisição requisição consulta o atual host ativo dentro do calculo de tempo do quantum e encaminha a requisição para o mesmo. 

O objetivo é garantir que nenhum servidor seja sobrecarregado com muitos requests de forma desproporcional enquanto outros fiquem subutilizados. 

Tanto no balanceamento de carga entre servidores quanto no escalonamento de CPU, o Round Robin é centrado na ideia de distribuir o trabalho ou recursos de maneira justa e equitativa, evitando a sobrecarga de um único recurso, em ambos os casos, o Round Robin é apreciado por sua simplicidade e abordagem justa.

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

## Least Request

O algoritmo de "Least Request" é uma abordagem de balanceamento simples mas bem eficiente que nos permite direcionar o request atual para o servidor que processo menos requisições até o momento. Ele trabalha com um contador vinculado aos hosts ativos que incrementa individualmente conforme as requisições vão sendo distribuídas. Para selecionar o proximo host para o qual o request será redirecionado, ele prioriza o host com o menor valor entre as possibilidades.  Dependendo da implementação esse contador pode zerado dentro de um período razoável de tempo, o tornando escalável para ambientes que possuam escalabilidade horizontal. 

O objetivo do Least Request é **garantir uma distribuição de carga equitativa baseada na frequência de requisições atendidas** em vez de sua duração ou complexidade, o que faz ele **uma alternativa vantajosa para cenários que possuam requisições uniformes e curtas**, como um microserviço que possuam poucas rotas que sejam muito bem performáticas por exemplo um serviço de consulta de usuários que receba um `id` e retorne o recurso muito rapidamente. 

### Desvantagens do Least Request

Por mais que o Least Request resolva o grande problema de uniformidade de requisições, ele ainda pode apresentar problemas de desbalanceamento em ambientes que possuam requisicões muito diversificadas que possuam durações muito diferentes. Assim como o Round Robin, ele não leva em conta a saturação dos hosts, fazendo com que apenas "contar" as requisições não sejam suficientes para representar a real distribuição de carga.


## Least Connection

Os algoritmos de "Least Connection" são técnicas mais avançadas de balanceamento de carga que são utilizadas para distribuir requisições de maneira mais inteligente em uma série de hosts. Diferentemente do Round Robin, que distribui requisições de maneira uniforme sem considerar o estado atual dos servidores, estas abordagens levam em conta a carga de trabalho atual dos servidores levando em consideração dois critérios que os diferenciam entre si. 

O método de **Least Connection** encaminha a solicitação atual para o servidor que detêm menos conexões ativas no momento. Uma "conexão ativa" significa uma sessão ou interação em andamento entre o cliente e o servidor, independentemente de a requisição ter sido processada ou não.

O **Least Request** trabalha com um contador que encaminha o request atual para o host que recebeu menos requisições até o momento sendo uma abordagem muito mais simples porém muito eficaz para trazer uniformidade para a distribuição de carga. 

As duas abordagem cabem perfeitamente em cenários onde as requisições são relativamente uniformes e curtas, pois ambas ajudam a garantir uma distribuição equilibrada e baseada em utilização, e ambos os métodos se adaptam dinamicamente às mudanças repentinas na quantidade de requests. 


### Desvantagens do Least Request e Least Connection 

A "não tão importante" desvantagem que podemos citar é que ambos os algoritmos são muito mais complexos de se implementar em comparação a simplicidade do Round Robin, porém essa característica pode ser fácilmente vencida se nos limitarmos a sermos meros usuários de algum tipo de tecnologia que já possui suporte para esses cenários. 

Em cenários onde temos uma diversidade muito grande de tipos de chamadas que possuam durações diferentes, é comum também acontecer um desbalanceamento de uso assim como no Round Robin, principalmente no caso do Least Request, pois ainda que o tráfego seja distribuído de forma mais inteligente, ainda não leva em consideração a capacidade de processamento dos hosts. 


## Least Outstanding Requests

O **Least Outstanding Request** ou **LOR** é um algoritmo de balanceamento de carga muito sofitsticado que resolve o maior problema dos algoritmos anteriores, que é a **saturação dos hosts**. Ao contrário do **Least Request** que encaminha o request para o host que recebeu menos requisições até o momento ou o **Least Connection** que encaminha para o host que detêm o host com menos conexões ativas, o LOR encaminha o request para aquele servidor que possui 

## Manglev

## Random 

# Proxy Reverso

# Implamentações e Tecnologias



#### Revisores



#### Referencias

[Load Balancing 101 - Priyanka Hariharan](https://medium.com/the-kickstarter/load-balancing-101-81710aa7a3d7)
[What is Round Robin Scheduling in OS?](https://www.scaler.com/topics/round-robin-scheduling-in-os/)
[https://www.nginx.com/resources/glossary/load-balancing/](What Is Load Balancing?)

