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

Essa forma de balanceamento ciclico torna esse tipo de algoritmo altamente receptivo em ambientes que possuam escalabilidade horizontal, tornando muito fácil remover e adicionar novos hosts do pool. 

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

### Limitações do Least Request

Por mais que o Least Request resolva o grande problema de uniformidade de requisições, ele ainda pode apresentar problemas de desbalanceamento em ambientes que possuam requisicões muito diversificadas que possuam durações muito diferentes. Assim como o Round Robin, ele não leva em conta a saturação dos hosts, fazendo com que apenas "contar" as requisições não sejam suficientes para representar a real distribuição de carga.

Implementações que não tenham uma forma de "zerar" o contador de requisições podem se tornar altamente problematicos em ambientes sucetiveis a escabalilidade horizontal. Uma má implementação desse algoritmo pode acarretar em uma "negação de serviço" involuntária em novos hosts que entrarem no pool do balanceador. 


## Least Connection

Os algoritmos de "Least Connection" são técnicas mais avançadas de balanceamento de carga que são utilizadas para distribuir requisições de maneira mais inteligente em uma série de hosts. Diferentemente do Round Robin e Least Request que tem objetivo de distribuir requisições de maneira uniforme sem considerar o estado atual dos servidores, esta abordagem é uma tentativa de levar em conta a carga de trabalho presente em cada um deles.

O método de **Least Connection** **encaminha a solicitação atual para o servidor que detêm menos conexões ativas no momento**. Uma "conexão ativa" significa uma **sessão ou interação em andamento entre o cliente e o servidor**, independentemente de a requisição ter sido processada ou não, como implementações que suporte keep alive, web sockets, grpc persistentes e etc. 

Se um host está gerenciando 5 conexões ativas e outro está gerenciando 3, o próximo request será direcionado para o host com apenas 3 conexões, mesmo que essas conexões possam ser tarefas de baixa demanda.


### Limitações do Least Connection 

A "não tão importante" desvantagem que podemos citar é que ambos os algoritmos são muito mais complexos de se implementar em comparação a simplicidade do Round Robin, porém essa característica pode ser fácilmente vencida se nos limitarmos a sermos meros usuários de algum tipo de tecnologia que já possui suporte para esses cenários. 

O Least Connection foca no número de conexões ativas, sem avaliar a carga associada a cada conexão, o que pode resultar em sobrecarga de servidores com conexões mais intensivas assim como as opções anteriores e o fato de ter que fazer essa gestão pode acabar consumindo recursos significativos no balanceador. 

Servidores com várias conexões de longa duração (keep alive) podem parecer menos ocupados do que realmente estão, criando um potencial para ineficiências na distribuição da carga gerando desbalanceamento.


## Least Outstanding Requests (LOR)

O **Least Outstanding Request** ou **LOR** é um algoritmo de balanceamento de carga muito sofitsticado que resolve o maior problema dos algoritmos anteriores, que é a **saturação dos hosts**. De certa forma é fácil confundir as abordagens do LOR e do Least Connections. Enquanto o Least Connection se concentra em gerenciar conexões ativas, independente de estarem sendo utilizadas ou não, o Least Outstanding Request considera o número de **requisições pendentes em cada host**. Uma **"requisição pendente" é uma requisição que foi iniciada, mas ainda não foi concluída**, independentemente de haver uma conexão ativa contínua ou não, fazendo o mesmo ser mais eficiente quando comparado ao Least Connection na hora de identificar hosts que estejam com um processamento maior, segurando mais conexões, tendo um tempo de resposta maior e etc.

Resumindo, o Least Connection foca em "quantas conexões" estão ativas, enquanto o LOR olha para "quantas requisições" estão ainda sendo processadas.

O LOR procura equilibrar a carga de trabalho distribuindo novas requisições para os hosts com menos requisições pendentes, tentando garantir que todos os servidores tenham um volume de trabalho semelhante e gerenciável. Ou seja, o foco de balanceamento do LOR é a possível saturação, e não a quantidade de requests, fazendo o mesmo ser uma alternativa eficaz em ambientes onde as requisições podem ter tempos de resposta variáveis e imprevisíveis.

### Limitações do Least Outstanding Requests

O LOR requer um monitoramento contínuo e detalhado do estado das requisições em cada host implementado junto ao algoritmo. Isso pode aumentar a complexidade da implementação em si e exigir mais recursos computacionais para manter o acompanhamento em tempo real, e mais ainda onde esse controle precise funcionar de forma distribuída. 

Essa complexidade pode invariavelmente impactar em performance do balanceador em caso de variações de carga de trabalho repentina.  Além do mais, pode ser um desafio entender quando uma conexão foi concluída ou não.


## Manglev

O Manglev é um algoritmo relativamente novo desenvolvido pela Google e é considerado uma técnica avançada de balanceamento de carga, usada principalmente em sistemas complexos de computação distribuída, por mais que ainda bem pouco utilizada. 

O algoritmo Maglev distribui as requisições de clientes para um conjunto de servidores de maneira que cada cliente sempre seja encaminhado para o mesmo servidor, **desde que este esteja disponível**. Isso é alcançado através do uso de **tabelas de hash consistentes**, que mapeiam clientes para servidores de uma forma determinística, mas equilibrada.

O Manglev busca garantir uma **distribuição consistente priorizando cache de dados e manutenção de sessão do usuário**. O Manglev passa uma ideia de "persistência", o que acarretaria em N outros problemas de escalabilidade quando comparado com outras opções apresentadas anteriormente. Isso se dá pois os cenários de aplicação do Manglev são diferentes de um balanceamento stateless entre várias replicas de uma API REST por exemplo. 

O Objetivo do Manglev é garantir mínima flutuação no mapeamento das requisições, garantindo consistencia baseada em algo parecido com uma "sessão". 

Esse algoritmo é ideal para balanceamento entre datacenters, ingestão de dados e outros cenários que exijam uma continuidade e persistências entre as requisições

### Limitações do Manglev

## Random 

# Proxy Reverso

# Implamentações e Tecnologias



#### Revisores



#### Referencias

[Load Balancing 101 - Priyanka Hariharan](https://medium.com/the-kickstarter/load-balancing-101-81710aa7a3d7)
[What is Round Robin Scheduling in OS?](https://www.scaler.com/topics/round-robin-scheduling-in-os/)
[https://www.nginx.com/resources/glossary/load-balancing/](What Is Load Balancing?)

