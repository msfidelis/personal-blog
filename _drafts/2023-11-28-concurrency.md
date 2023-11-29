---
layout: post
image: assets/images/system-design/concurrency.png
author: matheus
featured: false
published: true
categories: [ system-design, golang, engineering ]
title: System & Design para SRE's - Paralelismo, Concorrência e Multithreading
---

Esse artigo é o primeiro de uma série sobre System Design. Essa série tem a intenção de explicar conceitos complexos de programação de forma simples para todos os tipos de profissionais, não importanto o nível de sênioridade ou tempo de experiência, ajudando a fixar conceitos de ciências da computação e arquitetura. 

Comecei a escrever esses textos em 2021, quanto tinha a intenção de produzir algum material para explicar conceitos de engenharia para profissionais de Site Reliability Engineering, hoje olhando com outros olhos, consigui revisar esse material e torná-lo útil e acessível pra todo mundo. 

Todos os artigos vão utilizar em algum momento alguma analogia com o "mundo real" para externalizar a lógica e facilitar a explicacão e compreensão utilizando exemplos do dia a dia das pessoas. Nesse texto, vou te explicar conceitos de **Multithreading**, **Concorrência** e **Paralelismo** fazendo um **churasco**. 


<br>

## O que é um Processo?

Imagine o ultimo churrasco que você participou junto com sua familia e amigos. Pense nesse churrasco como um processo sendo executado por um computador. 

Um processo nada mais é do que uma **instância de um programa que está sendo executado no momento**. Esse programa contém uma série de instruções, o processo é a execução real dessas instruções. **Um processo é um programa em movimento**.  

Quando iniciamos o **navegador**, **IDE**, **agents**, **aplicações**, **bancos de dados** e outros serviços, o sistema operacional cria um processo para esses programas, fornecendo os recursos necessários para execução do mesmo, como **espaço de memória isolado**, **threads**, **contextos** e a gestão do **próprio ciclo de vida** do mesmo. 

<br>

## O que é uma Thread?

Uma **Thread é a menor unidade de processamento que pode ser gerenciada por um sistema operacional**. Ela é uma sequência de instruções previamente programadas que podem ser executadas independentemente por uma CPU. No mesmo processo, multiplas threads podem ser usadas para executar as tarefas de forma **concorrente** para melhorar a eficiência. As threads de um programa compartilham o mesmo espaço em memória e os recursos alocados, mas também podem ser executadas simultâneamente em cores de CPU diferentes, permitindo o **paralelismo**. Pense em threads como tarefas que precisam ser executadas dentro de um churrasco. 

<br>

## Multithreading

**Multithreading** é uma técnica de programação que envolve a criação de múltiplas threads (fluxos de execução de uma tarefa) dentro de um único processo. Cada thread pode lidar com diferentes tarefas ou partes de uma tarefa maior. Esse método pode ser usado **tanto em contextos concorrentes quanto paralelos**. Em sistemas com **um único processador, o multithreading permite concorrência** (troca rápida entre threads para dar a ilusão de simultaneidade). Em sistemas **multiprocessador, o multithreading pode alcançar paralelismo verdadeiro, onde diferentes threads são executadas em paralelo em diferentes núcleos**, ambos os casos permitindo melhor aproveitamento de recursos e melhoria de eficiência e performance. 

Te tirando do seu churrasco, imagine agora seu **restaurante favorito**. O **processo é o restaurante em funcionamento** com objetivo de **fornecer comida aos clientes**. Imagine esse restaurante num horário de pico, hora do almoço em dia de semana, em seguida **veja as threads como funcionários da cozinha**. Cada cozinheiro disponível é **responsável por preparar um prato diferente ao mesmo tempo** para acelerar a vazão dos pedidos feitos para a cozinha. Assim vários pratos são preparados simultâneamente aumentando a eficiência na entrega dos pratos reduzindo o tempo de espera dos clientes. 

<br>

# Concorrência 

![Concorrência Robô](/assets/images/system-design/concurrency-example.png)

Imagine que você está preparando um churrasco sozinho. Você está responsável por organizar a geladeira, fazer os cortes de carne, cortar os vegetais para os amigos vegetarianos, fazendo a caipirinha, gelando a cerveja. Você alterna as tarefas fazendo um pouco de cada vez, **trabalhando um pouco em cada uma**, por mais que seja responsável por todas elas.

Esse é um exemplo de concorrência, você está gerenciando muitas tarefas, mas não necessariamente trabalhando nelas ao mesmo tempo. Você troca entre as tarefas, dando a impressão de que tudo está progredindo ao mesmo tempo em conjunto. 

**Concorrência é sobre lidar com muitas tarefas ao mesmo tempo**, mas não simultâneamente. É a capacidade de uma aplicação fazer a gestão de multiplas tarefas e instruções em segundo plano, mas não necessariamente essas instruções estão recebendo atenção do processador ao mesmo tempo, ou sendo executada em mais de um core.  

<br>

### Exemplo de um processamento concorrente de tarefas

Vamos tentar criar um  algortimo que se abstraia o nosso churrasco. Esse algoritmo deverá seguir a lógica:

```
* Listar as atividades do churrasco
* Executar essas tarefas em goroutines simultêneas, cada uma esperando o tempo de preparo devido
* Monitorar a saída das atividades
```

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

type Atividade struct {
	Nome  string
	Tempo int
}

// Função para simular o tempo de preparo de cada atividade do churrasco
func preparar(item string, tempoPreparo int, churrasco chan<- string) {
	fmt.Printf("Preparando %s...\n", item)
	time.Sleep(time.Duration(tempoPreparo) * time.Second)
	churrasco <- item
}

func main() {

	// Canal das atividades que compõe o churrasco
	churrasco := make(chan string)

	// Wait Group para esperar todas as goroutines terminarem
	var wg sync.WaitGroup

	// Lista de Atividades do Churrasco
	tarefas := []Atividade{
		{"picanha", 5},
		{"costela", 7},
		{"linguica", 3},
		{"salada", 2},
		{"bebidas", 1},
		{"churrasqueira", 2},
		{"queijo", 3},
	}

	for _, tarefa := range tarefas {
		wg.Add(1) // Adiciona 1 atividade ao contador do WaitGroup
		go func(t Atividade) {
			preparar(t.Nome, t.Tempo, churrasco) // Inicia o preparo de uma atividade do churrasco
		}(tarefa)
	}

	go func() {
		wg.Wait()        // Espera que todas as goroutines chamem Done()
		close(churrasco) // Fecha o canal após todas as atividades do churrasco terminarem
		fmt.Println("Churrasco terminou :/")
	}()

	for item := range churrasco {
		fmt.Printf("%s foi preparado.\n", item)
		wg.Done() // Remove um contador do wait group
	}

}
```

```text
Preparando picanha...
Preparando costela...
Preparando linguica...
Preparando churrasqueira...
Preparando salada...
Preparando queijo...
Preparando bebidas...

bebidas foi preparado.
salada foi preparado.
churrasqueira foi preparado.
queijo foi preparado.
linguica foi preparado.
picanha foi preparado.
costela foi preparado.
```

[Exemplo de Concorrencia - Go Playground](https://go.dev/play/p/d7HzIKIRnD0)


<br>

# Paralelismo 

![Paralelismo Robô](/assets/images/system-design/paralelism-example.png)

Vamos voltar pro exemplo do churrasco. Agora você tem tem seus amigos pra te ajudar a cortar a carne, acender a churrasqueira, gelar a cerveja e fazer a caipirinha. Todas essas tarefas agora estão sendo acontecendo em paralelo, cada pessoa responsável por uma parte do processo. 

Isso é paralelismo. **Multiplas tarefas** e instruções estão acontecendo **ao mesmo tempo**, **simultaneamente**, por **multiplos cores de processadores**. 

Diferente da Concorrência, **paralelismo é estar fazendo muitas coisas ao mesmo tempo.**

Paralelismo é usado em situações onde o desempenho e a eficiência são críticos, e há recursos suficientes como múltiplos cores de CPU para executar várias tarefas simultaneamente. 

Em ambientes paralelos, processos ou threads frequentemente precisam sincronizar suas ações e comunicar-se entre si. Mecanismos de sincronização, como **semáforos**, **mutexes** e **monitores**, são ferramentas essenciais para evitar **race conditions** e garantir a consistência dos dados, isso acarreta numa eventual dificuldade de programação, debugs de programas que implementem paralelismo. 

O paralelismo em computação é uma área de pesquisa ativa e continua evoluindo, especialmente com o surgimento de novas arquiteturas de hardware e demandas crescentes por processamento de grandes volumes de dados e computação de alto desempenho.

<br>

## Exemplo de um processamento paralelo de tarefas

Novamente vamos simular um churrasco no código. Diferente das condições de concorrência, nesse snippet vamos escrever um algoritmo que:

* Identificar quantos **amigos (CPU's)** estão disponíveis para ajudar no churrasco. 
* Criar uma lista de atividades do churrasco informando o tempo de preparo e o responsável pela tarefa 
* Encontrar o número ideal de tarefas e dividí-las entre os amigos (balanceamento)
* Dividir as tarefas entre os **amigos (CPU's)** em threads 
* Monitorar o output das tarefas:


```go
package main

import (
	"fmt"
	"runtime"
	"sync"
	"time"
)

type Atividade struct {
	Nome        string
	Tempo       int
	Responsavel int
}

// Função para simular o tempo de preparo de cada atividade do churrasco - Agor aceita uma lista de atividades
func preparar(atividades []Atividade, churrasco chan<- Atividade, amigo int, wg *sync.WaitGroup) {
	defer wg.Done()
	for _, atividade := range atividades {
		atividade.Responsavel = amigo // Identifica um responsável pela tarefa
		fmt.Printf("Amigo %v começou a prepação de %s...\n", amigo, atividade.Nome)
		time.Sleep(time.Duration(atividade.Tempo) * time.Second)
		churrasco <- atividade
	}
}

func main() {

	// Canal das atividades que compõe o churrasco
	churrasco := make(chan Atividade)

	// Wait Group para esperar todas as goroutines terminarem
	var wg sync.WaitGroup

	// Recuperando o número de CPU's (pessoas) disponíveis para ajudar no churrasco
	numCPU := runtime.NumCPU()

	fmt.Printf("Número de CPU's (amigos) pra ajudar no churrasco: %v.\n", numCPU)

	// Lista de Atividades do Churrasco - Atividade / Tempo de Execução / Amigo Responsável
	tarefas := []Atividade{
		{"picanha", 5, 0},
		{"costela", 7, 0},
		{"linguica", 3, 0},
		{"salada", 2, 0},
		{"gelar cerveja", 1, 0},
		{"organizar geladeira", 1, 0},
		{"queijo", 3, 0},
		{"caipirinha", 2, 0},
		{"panceta", 4, 0},
		{"espetinhos", 3, 0},
		{"abacaxi", 3, 0},
		{"limpar piscina", 1, 0},
		{"molhos", 2, 0},
		{"pão de alho", 4, 0},
		{"arroz", 4, 0},
		{"farofa", 4, 0},
	}

	fmt.Printf("Número tarefas do churrasco: %v.\n", len(tarefas))

	// Dividindo lista de tarefas do churrasco entre os CPU's (amigos) disponíveis
	// Efetuando o balanceamento arrendondando a divisão sempre pra cima para evitar
	// que alguém CPU (amigo) fique sem fazer nada :)
	sliceSize := (len(tarefas) + numCPU - 1) / numCPU
	fmt.Printf("Número tarefas pra cada CPU (amigo): %v.\n", sliceSize)

	// Dividindo as tarefas entre as CPUs (amigos)
	for i := 0; i < len(tarefas); i += sliceSize {
		end := i + sliceSize
		amigo := end / 2
		if end > len(tarefas) {
			end = len(tarefas)
		}
		wg.Add(1)
		go preparar(tarefas[i:end], churrasco, amigo, &wg)
	}

	go func() {
		wg.Wait()        // Espera que todas as goroutines chamem Done()
		close(churrasco) // Fecha o canal após todas as atividades do churrasco terminarem
	}()

	for atividade := range churrasco {
		fmt.Printf("Amigo %v terminou de preparar %s...\n", atividade.Responsavel, atividade.Nome)
	}

}

```

```
Número de CPU's (amigos) pra ajudar no churrasco: 8.
Número tarefas do churrasco: 16.
Número tarefas pra cada CPU (amigo): 2.
Amigo 1 começou a prepação de picanha...
Amigo 3 começou a prepação de gelar cerveja...
Amigo 6 começou a prepação de abacaxi...
Amigo 2 começou a prepação de linguica...
Amigo 7 começou a prepação de molhos...
Amigo 5 começou a prepação de panceta...
Amigo 8 começou a prepação de arroz...
Amigo 4 começou a prepação de queijo...
Amigo 3 começou a prepação de organizar geladeira...
Amigo 3 terminou de preparar gelar cerveja...
Amigo 3 terminou de preparar organizar geladeira...
Amigo 7 começou a prepação de pão de alho...
Amigo 7 terminou de preparar molhos...
Amigo 6 começou a prepação de limpar piscina...
Amigo 6 terminou de preparar abacaxi...
Amigo 2 começou a prepação de salada...
Amigo 2 terminou de preparar linguica...
Amigo 4 terminou de preparar queijo...
Amigo 4 começou a prepação de caipirinha...
Amigo 6 terminou de preparar limpar piscina...
Amigo 8 começou a prepação de farofa...
Amigo 8 terminou de preparar arroz...
Amigo 5 terminou de preparar panceta...
Amigo 5 começou a prepação de espetinhos...
Amigo 1 começou a prepação de costela...
Amigo 1 terminou de preparar picanha...
Amigo 2 terminou de preparar salada...
Amigo 4 terminou de preparar caipirinha...
Amigo 7 terminou de preparar pão de alho...
Amigo 5 terminou de preparar espetinhos...
Amigo 8 terminou de preparar farofa...
Amigo 1 terminou de preparar costela...

Program exited.
```

[Exemplo de Concorrencia - Go Playground](https://go.dev/play/p/2qEtDrT9p2V)

<br>

## Paralelismo Externo vs Paralelismo Interno. 

O paralelismo pode ser dividido em duas frentes muito simples de compreender a diferença: o interno e externo. Eu vou te provar que é simples. 

<br>

### Paralelismo Interno

O paralelismo interno, também conhecido como paralelismo intrínseco, ocorre dentro de uma única aplicação ou processo. É o paralelismo que você implementa na sua aplicação via código quando precisa dividir as tarefas ou itens em memória entre várias sub-tarefas que podem ser processadas simultaneamente. Basicamente é o paralelismo que você cria via código para ser executado dentro do seu container ou servidor. 

<br>

### Paralelismo Externo

É o paralelismo que se refere a execução simultânea de multiplas tarefas em diferentes hardwares, maquinas ou containers. Podemos ver esse conceito sendo aplicado em ambientes de computação distribuída como **Haddop**, **Spark** que distribuiem grandes volumes de dados em muitos servidores e instâncias para realizar tarefas de ETL, Machine Learning e Analytics ou como simples **Load Balancers, ou Balanceadores de Carga** que dividem as requisições entre diversas instâncias da mesma aplicação para distribuir o tráfego. 

![Paralelismo Load Balancer](/assets/images/system-design/load-balancer.gif)

<br>

## Lidando com Paralelismo e Concorrência

<br>

### Race Conditions - Condições de Corrida

Imagine que você está organizando um outro churrasco com seus amigos. Vocês tem apenas uma churrasqueira pra grelhar os alimentos. Vocês precisam preparar picanha, maminha, legumes, abacaxi, linguiça, pão de alho e afins. Essa churrasqueira é muito pequena, e só possibilita assar um alimento por vez. Aqui, a churrasqueira é um recurso compartilhado, e uma **race condition** pode acontecer caso todos os alimentos sejam preparados para serem assados ao mesmo tempo. 

Uma **Race Condition**, ou **condição de corrida** é um comportentamento extremamente comum quando temos um recurso compartilhado que é acessado e modificado por várias tarefas e threads em paralelo, na qual o estado final desse recurso pode depender da ordem na qual as modificações ocorrem, que podem variar de execução para execução. Como por exemplo, vamos executar o algoritmo a seguir várias vezes: 

* Temos o número de itens disponíveis pra serem colocados na brasa. 
* Temos um controle de numero de itens grelhados que foram para a churrasqueira
* Temos `100` itens disponíveis, então o correto seria que o contador de itens grelhados também terminasse a execução com o valor `100`

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

// Variável compartilhada para contar os alimentos grelhados
var grelhados int = 0

// Função para simular o tempo de preparo de um alimento na churrasqueira
func grelhar() {
	grelhados++
	time.Sleep(time.Millisecond * 100)
}

func main() {

	// Wait Group para esperar todas as goroutines terminarem
	var wg sync.WaitGroup

	// Alimentos disponíveis pra colocar na grelha
	var alimentosChurrasco = 100

	// Simula a concorrência pela grelha
	for i := 0; i < alimentosChurrasco; i++ {
		wg.Add(1) // Adiciona 1 alimento ao contador do WaitGroup
		go func() {
			grelhar()       // Inicia o processo de grelhar o alimento
			defer wg.Done() // Remove um contador do wait group da grelha
		}()
	}

	wg.Wait() // Espera que todas as goroutines chamem Done()

	fmt.Println("Total de itens grelhados na churrasqueira:", grelhados)

}

```

Podemos ver que o resultado sempre varia de acordo com as goroutines que acessam o contador. Esse é o problema de race condition, onde na realidade não poderia ser representado num churrasco real, pois a grelha não comportaria todas os alimentos ao mesmo tempo na churrasqueira de qualquer forma. 

```
❯ go run problem/main.go
Total de itens grelhados na churrasqueira: 97
❯ go run problem/main.go
Total de itens grelhados na churrasqueira: 96
❯ go run problem/main.go
Total de itens grelhados na churrasqueira: 100
❯ go run problem/main.go
Total de itens grelhados na churrasqueira: 99
❯ go run problem/main.go
Total de itens grelhados na churrasqueira: 97
❯ go run problem/main.go
Total de itens grelhados na churrasqueira: 100
❯ go run problem/main.go
Total de itens grelhados na churrasqueira: 99
```

[Exemplo de Race Condition - Go Playground](https://go.dev/play/p/QQQwp9YuikV)

<br>

### Mutex

De volta ao churrasco. Chegamos na conclusão após o exemplo de Race Conditions de que é impossível todos os alimentos serem assados ao mesmo tempo, pois só cabe 1 por vez na nossa pobre grelha. Para isso precisamos de que algum membro do churrasco fique responsável por assar os alimentos em sequencia. 

Como a churrasqueira é um recurso compartilhado, essa pessoa irá atuar como uma "trava" do uso da churrasqueira. *Terminou um, coloca o próximo e espera*. Isso é um exemplo de como funciona um **Mutex**.

Mutex é uma abreviação para **Mutual Exclusion**, ou **Exclusão Mutua**, e é uma estratégia muito eficiente que serve para controlar acesso a um recurso compartilhado em um ambiente multithread, paralelo ou concorrente, fazendo com que exista a possibilidade de um acesso sequencial e organizado para os recursos distribuídos, sendo uma das principais ferramentas para se trabalhar com programação concorrente e paralela

O objetivo principal do Mutex é evitar **Race Conditions** do tipo que vimos no exemplo anterior garantindo que só uma thread por vez consiga acessar o recurso. As operações básicas de um Mutex são de "lock" para bloquear o acesso a um determinado recurso, e "unlock" para liberar esse recurso para a proxima thread acessar. 

Essas operações de **lock/unlock** também precisam respeitar uma certa prioridade, ou seja, apenas a thread que bloqueou o recurso tem acesso para desbloquear o mesmo. 

Sem um mutex, **todos tentariam usar a churrasqueira ao mesmo tempo**. Isso resultaria em confusão, com as pessoas se empurrando, brigando e tentando colocar sua carne na grelha, possivelmente gerando carnes mal grelhadas ou até mesmo queimadas.

Existem alguns riscos do uso de Mutex como em qualquer outra estratégia, o maior deles são os riscos de **Deadlock**, que é a condição onde várias threads tentam bloquear multiplos mutexes em uma ordem inconsistente. 

No Go podemos trabalhar com Mutexes através do pacote `sync`. Vamos resolver o problema de race condition da grelha da churrasqueira. 

* Criamos um orquestrador de uso da grelha, chamado `grelhaOcupada` usando o `sync.Mutex`
* Durante a preparação, `grelhar()`, colocamos um `Mutex.Lock()` no inicio, e um `Mutex.Unlock()` no final para liberar o recurso para a proxima thread. 
* Dessa forma conseguimos garantir um acesso sequencial de todos os processos para grelhar coisas na churrasqueira. 

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

// Variável compartilhada para contar os alimentos grelhados
var grelhados int = 0

// Variável de Mutex
var grelhaOcupada sync.Mutex

// Função para simular o tempo de preparo de um alimento na churrasqueira
func grelhar() {
	grelhaOcupada.Lock() // Trava o acesso ao contador (grelha)

	fmt.Println("Grelhando um alimento na churrasqueira")
	grelhados++
	time.Sleep(time.Millisecond * 100)

	fmt.Println("Liberando a grelha pro proximo alimento")
	grelhaOcupada.Unlock() // Destrava o acesso ao contador (grelha)
}

func main() {

	// Wait Group para esperar todas as goroutines terminarem
	var wg sync.WaitGroup

	// Alimentos disponíveis pra colocar na grelha
	var alimentosChurrasco = 100

	// Simula a concorrência pela grelha
	for i := 0; i < alimentosChurrasco; i++ {
		wg.Add(1) // Adiciona 1 alimento ao contador do WaitGroup
		go func() {
			grelhar()       // Inicia o processo de grelhar o alimento
			defer wg.Done() // Remove um contador do wait group da grelha
		}()
	}

	wg.Wait() // Espera que todas as goroutines chamem Done()

	fmt.Println("Total de itens grelhados na churrasqueira:", grelhados)

}

```

```
...
Grelhando um alimento na churrasqueira
Liberando a grelha pro proximo alimento
Grelhando um alimento na churrasqueira
Liberando a grelha pro proximo alimento
Grelhando um alimento na churrasqueira
Liberando a grelha pro proximo alimento
Grelhando um alimento na churrasqueira
Liberando a grelha pro proximo alimento
Grelhando um alimento na churrasqueira
Liberando a grelha pro proximo alimento
Grelhando um alimento na churrasqueira
Liberando a grelha pro proximo alimento

Total de itens grelhados na churrasqueira: 100
```

[Exemplo de Mutex - Go Playground](https://go.dev/play/p/sjqz6rD_aYB)

<br>

### Semáforos 

<br>

### Mutex

<br>

### Spinlock

<br>

### Backpressure

<br>



#### Topicos
Thread, Espera ocupada, multiprocessamento, paralelismo interno vs externo, mecanismos de concorrencia (mutex, semaforo, spinlock), backpressure, 



https://medium.com/the-kickstarter/load-balancing-101-81710aa7a3d7


https://medium.com/@rgribeiro/desvendando-a-concorr%C3%AAncia-e-paralelismo-em-go-7a33d33f5510

https://www.tabnews.com.br/lucchesisp/concorrencia-e-paralelismo-com-golang#s