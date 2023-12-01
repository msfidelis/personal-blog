---
layout: post
image: assets/images/system-design/concurrency.png
author: matheus
featured: false
published: true
categories: [ system-design, golang, engineering ]
title: System & Design - Paralelismo, Concorrência e Multithreading
---

Esse artigo é o primeiro de uma série sobre **System Design**. Essa série tem a intenção de explicar conceitos complexos de programação de forma simples e objetiva para todos os tipos de profissionais, não importanto o nível de sênioridade ou tempo de experiência, ajudando a fixar conceitos de ciências da computação e arquitetura. 

Comecei a escrever esses textos em 2021, quanto tinha a intenção de produzir algum material para explicar conceitos de engenharia para profissionais de Site Reliability Engineering, hoje olhando com outros olhos, consigui revisar esse material e torná-lo útil e acessível pra todo mundo. 

Todos os artigos vão utilizar em algum momento alguma analogia com o "mundo real" para externalizar a lógica e facilitar a explicacão e compreensão, utilizando exemplos do dia a dia das pessoas. Nesse texto, vou te explicar tópicos de **Multithreading**, **Concorrência** e **Paralelismo**.

Não é meu objeito gerar o conteúdo detalhado do mundo, nem explicar minuciosamente todos os tópicos que envolvem esse tema usando termos complexos da literatura. Meu objeitvo é que você **compreenda** os conceitos, consiga **aplicar** e principalmente **explicar pra outra pessoa** usando os mesmos exemplos ou criando novos. **Prometo fazer ser divertido.**

Iremos utilizar a linguagem `Go` para exemplificar alguns algoritmos, mas a ideia não é tornar esse material um artigo da linguagem especificamente, embora vamos usar alguns recursos nativos como `Goroutines`, `Channels` e `WaitGroups` ele pode ser aproveitado conceitualmente pra qualquer coisa. 

Vamos começar detalhando alguns conceitos que vão ser úteis durante o artigo:

<br>

## O que é um Processo?

Imagine o ultimo churrasco que você participou junto com sua familia e amigos. Pense nesse churrasco como um processo sendo executado por um computador. 

Um processo nada mais é do que uma **instância de um programa que está sendo executado no momento**. Esse programa contém uma série de instruções, o processo é a execução real dessas instruções. **Um processo é um programa em movimento**.  

Quando iniciamos o **navegador**, **IDE**, **agents**, **aplicações**, **bancos de dados** e outros serviços, o sistema operacional cria um processo para esses programas, fornecendo os recursos necessários para execução do mesmo, como **espaço de memória isolado**, **threads**, **contextos** e a gestão do **próprio ciclo de vida** do mesmo. 

<br>

## O que é uma Thread?

Uma **Thread é a menor unidade de processamento que pode ser gerenciada por um sistema operacional**. Ela é uma sequência de instruções previamente programadas que podem ser executadas independentemente por uma CPU. No mesmo processo, multiplas threads podem ser usadas para executar as tarefas de forma **concorrente** para melhorar a eficiência. As threads de um programa compartilham o mesmo espaço em memória e os recursos alocados, mas também podem ser executadas simultâneamente em cores de CPU diferentes, permitindo o **paralelismo**. Pense em threads como tarefas que precisam ser executadas dentro de um churrasco. 

<br>

## O que é Multithreading?

**Multithreading** é uma técnica de programação que envolve a criação de múltiplas threads (fluxos de execução de uma tarefa) dentro de um único processo. Cada thread pode lidar com diferentes tarefas ou partes de uma tarefa maior. Esse método pode ser usado **tanto em contextos concorrentes quanto paralelos**. Em sistemas com **um único processador, o multithreading permite concorrência** (troca rápida entre threads para dar a ilusão de simultaneidade). Em sistemas **multiprocessador, o multithreading pode alcançar paralelismo verdadeiro, onde diferentes threads são executadas em paralelo em diferentes núcleos**, ambos os casos permitindo melhor aproveitamento de recursos e melhoria de eficiência e performance. 

Te tirando do seu churrasco, imagine agora seu **restaurante favorito**. O **processo é o restaurante em funcionamento** com objetivo de **fornecer comida aos clientes**. Imagine esse restaurante num horário de pico, hora do almoço em dia de semana, em seguida **veja as threads como funcionários da cozinha**. Cada cozinheiro disponível é **responsável por preparar um prato diferente ao mesmo tempo** para acelerar a vazão dos pedidos feitos para a cozinha. Assim vários pratos são preparados simultâneamente aumentando a eficiência na entrega dos pratos reduzindo o tempo de espera dos clientes. 

<br>

Agora que já temos uma bagagem teórica de alguns termos e conceitos que vão aparecer nas próximas explicações, vamos detalhar com um pouco mais de segurança. 

<br>


# Concorrência 

![Concorrência Robô](/assets/images/system-design/concurrency-example.png)

Imagine que você está preparando um churrasco sozinho. Você está responsável por organizar a geladeira, fazer os cortes de carne, cortar os vegetais para os amigos vegetarianos, fazendo a caipirinha, gelando a cerveja. Você alterna as tarefas fazendo um pouco de cada vez, **trabalhando um pouco em cada uma**, por mais que seja responsável por todas elas.

Esse é um exemplo de concorrência, você está gerenciando muitas tarefas, mas não necessariamente trabalhando nelas ao mesmo tempo. Você troca entre as tarefas, dando a impressão de que tudo está progredindo ao mesmo tempo em conjunto. 

**Concorrência é sobre lidar com muitas tarefas ao mesmo tempo**, mas não simultâneamente. É a capacidade de uma aplicação fazer a gestão de multiplas tarefas e instruções em segundo plano, mas não necessariamente essas instruções estão recebendo atenção do processador ao mesmo tempo, ou sendo executada em mais de um core.  

<br>

### Exemplo de Implementação

Vamos tentar criar um  algortimo que se abstraia o nosso churrasco. Esse algoritmo deverá seguir a lógica:


* Listar as atividades do churrasco
* Executar essas tarefas em goroutines simultêneas, cada uma esperando o tempo de preparo devido
* Monitorar a saída das atividades


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

### Implementando um algoritmo de paralelismo

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


![Paralelismo Interno e Externo](/assets/images/system-design/paralelismo-interno-externo.png)

O paralelismo pode ser dividido em duas frentes muito simples de compreender a diferença: o **interno** e **externo**. Pode parecer complexo mas eu vou te provar que é simples com a explicação a seguir. 


### Paralelismo Interno

O **paralelismo interno**, também conhecido como **paralelismo intrínseco**, ocorre dentro de uma **única aplicação ou processo**. É o paralelismo que você **implementa na sua aplicação via código** quando p**recisa dividir as tarefas ou itens em memória entre várias sub-tarefas** que podem ser processadas simultaneamente. **Basicamente é o paralelismo que você cria via código para ser executado dentro do seu container ou servidor**. 


### Paralelismo Externo

É o paralelismo que se refere a **execução simultânea de multiplas tarefas em diferentes hardwares, maquinas ou containers**. Podemos ver esse conceito sendo aplicado em ambientes de computação distribuída como **Haddop**, **Spark** que distribuiem grandes volumes de dados em muitos servidores e instâncias para realizar tarefas de ETL, Machine Learning e Analytics ou como simples **Load Balancers, ou Balanceadores de Carga** que dividem as requisições entre diversas instâncias da mesma aplicação para distribuir o tráfego. 

![Paralelismo Load Balancer](/assets/images/system-design/load-balancer.gif)

<br>

# Paralelismo vs Concorrência 

Depois de bastante trabalho, conseguimos resumir conceitualmente a diferença entre **concorrência** e **paralelismo**. **Concorrência** é sobre lidar com várias tarefas ao mesmo tempo. Ela permite que um sistema execute várias operações aparentemente ao mesmo tempo, e **Paralelismo** é a execução literal de várias operações ou tarefas simultaneamente.

Em sistemas com um único núcleo de CPU, a concorrência é geralmente alcançada através de multithread, onde as tarefas são **alternadas rapidamente**, dando a ilusão de que estão sendo executadas simultaneamente, já **Paralelismo** requer hardware com **múltiplos cores**, onde cada um deles executa **diferentes threads ou processos ao mesmo tempo**.

![Cocorrencia vs Paralelismo](/assets/images/system-design/concorrencia-paralelismo.png)

<br>

## Lidando com Paralelismo e Concorrência

Agora que já detalhamos de forma lúdica e conceitual a definição de programação paralela, podemos entrar em detalhes sobre os desafios e ferramentas existentes para se trabalhar com esse tipo de estratégia. Uma vez que esse tipo de abordagem tenha várias vantagens como performance, escalabilidade e aproveitamento de recursos, existem muitos desafios como sincronização, condições de corrida, deadlocks, starvation, balanceamento de carga de trabalho entre outros. Agora vamos definir conceitualmente alguns desses termos para que você consiga entender e explicar futuramente. 

### Deadlocks e Starvation

![Deadlock](/assets/images/system-design/deadlocks.png)

Imagine que você está do ocupando a grelha que é um recurso compartilhado do seu churrasco para prepara o pão de alho, e seu amigo está segurando a espátula (não fure a carne com garfo) que também é um recurso compartilhado para a preparação. Você precisa da espátula tanto quanto seu amigo precisa da grelha. Cada um de vocês aguarda o recurso do outro estar disponível sem desocupar o seu próprio, e nenhum de vocês dois pode continuar com sua tarefa. Isso é um exemplo de **Deadlock**. 

Um deadlock ocorre quando duas ou mais threads (ou processos) estão em um estado de espera permanente porque cada uma delas está esperando por um recurso que a outra detém. Em outras palavras, há um ciclo de dependências de recursos que impede o progresso adicional.

Agora visualize uma situação onde cada um precisa preparar sua própria refeição por conta de preferencias de ponto de carne e o seu grupo de amigos é dividido entre um grupo muito cara-de-pau, rápido e esfomeado e outro mais educado e lentos. Conforme temos grelhas disponíveis, as pessoas mais rápidas e esfomeadas ocupam a churrasqueira de forma desbalanceada, tirando o lugar das pessoas mais tranquilas. Essas pessoas mais tranquilas tendem a ficar com fome pela dificuldade de acessar o recurso compartilhado para assar sua comida. Esse é um processo de **Starvation**. 

Starvation, ou inanição, ocorre quando uma ou mais threads não conseguem acessar os recursos de que precisam para prosseguir por um longo período de tempo. Isso geralmente acontece devido a um problema de alocação de recursos, onde algumas threads são priorizadas em detrimento de outras.


### Race Conditions - Condições de Corrida

![Robô Race Condition](/assets/images/system-design/race-condition.png)

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

![Robô Mutex](/assets/images/system-design/mutex.png)

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

### Mutex Distribuído 

![Robô Mutex Distríbuido](/assets/images/system-design/mutex-distribuido.png)

Já demonstramos como trabalhar com mutex no modelo de paralelismo interno, onde implementamos todo o controle de paralelismo via código. É importante também portar essa lógica para o paralelismo externo, onde arquiteturalmente podemos consumir **mensagens produzidas em uma fila**, **eventos de um tópico do Kafka**, lidar com **solicitações** HTTP e muitos outros cenários onde precisamos ter **idempotencia**, **atomicidade** e **exclusividade** em algum processo. 

Criar um Mutex para sistemas distribuídos é um desafio um pouco complexo, mas também de certa forma facilitado do que quando comparado com mutexes de paralelismo interno de memória compartilhada. Existem desafios como **comunicação com componentes, latência de rede e falhas nos serviços em geral**. 

É necessário ter alguma **base de dados centralizada** onde podemos manter o estado dos processos compartilhados entre todas as replicas dos consumidores dessas mensagens, para caso de duplicidade da mensagem, evento ou solicitacão ou duplicação das mesmas por algum cenário não previsto. 

Para isso são utilizadas algumas estratégias utilizando bancos otimizados para leitura e escrita chave/valor como **Redis, Memcached, Cassandra, DynamoDB** e etc ou tecnologias como **Zookeeper**. 

No exemplo abaixo utilizando o Redis, fiz um fluxo lógico do algoritmo de mutex, onde recebemos uma pseudo-mensagem, checamos existe um lock criado pra ela no Redis, caso exista descartamos o processamento. Caso não exista, criamos o lock, processamos a mensagem e liberamos o lock na sequencia. 

```go
package main

import (
	"context"
	"fmt"
	"time"

	redis "github.com/redis/go-redis/v9"
)

type PedidoDeCompra struct {
	Id         string
	Item       string
	Quantidade float64
}

// Função mock para exemplificar a chegada de alguma mensagem
func consomeMensagem() PedidoDeCompra {
	return PedidoDeCompra{
		Id:         "12345",
		Item:       "pão de alho",
		Quantidade: 4,
	}
}

// Função mock para exemplificar o processamento de uma mensagem
func processaMensagem(pedido PedidoDeCompra) bool {
	fmt.Println("Processando pedido:", pedido.Id)
	time.Sleep(1 * time.Second)
	return true
}

func main() {

	var ctx = context.Background()

	// Create a new Redis client
	client := redis.NewClient(&redis.Options{
		Addr:     "0.0.0.0:6379",
		Password: "", // no password set
		DB:       0,  // use default DB
	})

	// looping de consumo
	NovoPedido := consomeMensagem()
	mutexKey := NovoPedido.Id

	// Verifica se o Lock já existe
	lock, _ := client.Get(ctx, mutexKey).Result()
	if lock != "" {
		fmt.Println("Mutex travado para o recurso", mutexKey)
		return
	}

	// Criando um lock para o registro por 10 segundos
	err := client.Set(ctx, mutexKey, "locked", 10*time.Second).Err()
	if err != nil {
		panic(err)
	}
	fmt.Println("Mutex criado para o recurso por 10s:", mutexKey)

	// Processa o registro
	success := processaMensagem(NovoPedido)
	if !success {
		return
	}

	fmt.Println("Pedido processado:", mutexKey)

	// Libera o Mutex
	_, err = client.Del(ctx, mutexKey).Result()
	if err != nil {
		panic(err)
	}
	fmt.Println("Mutex liberado para o recurso:", mutexKey)

}
```

```
❯ go run main.go
Mutex criado para o recurso por 10s: 12345
Processando pedido: 12345
Pedido processado: 12345
Mutex liberado para o recurso: 12345
```

Caso outro processo tentasse acessar o recurso 12345 durante a execução do primeiro receberia o seguinte retorno: 

```
❯ go run main.go
Mutex travado para o recurso 12345
```

Esse é um exemplo simples pra entendimento do algoritmo que não trata dodos os cenários de um ambiente produto. Para isso eu recomendo o uso de alguma biblioteca especifica para locks no Redis como [RedisLock](https://github.com/bsm/redislock)

<br>

### Mutex Distribuído - Zookeeper

Uma opção bem elegante em alternativa ao Redis é utilizar o **Apache Zookeeper** para gerenciar os locks distribuiídos. A lógica é exatamente a mesma do exemplo anterior porém com algumas peculiaridades.

Criar um mutex distribuído em Go usando **Apache ZooKeeper** é uma tarefa avançada que envolve manipular **znodes** (Nós do  **ZooKeeper**) para gerenciar essas travas de forma distribuída. Vamos passar por um exemplo básico de como isso pode ser feito.

Uma coisa legal dos locks do zookeeper é que você pode determinar um timeout de sessão para que todas os locks gerenciados pelo processo sejam excluídos após o termino da execução do programa. 

A lógica é exatamente igual ao do Redis:

* Verificar se existe um lock para o recurso 
* Se existir, ignorar a mensagem e retorná-la para o pool
* Se não existir, criar
* Processar a solicitação 
* Remover o lock em caso de sucesso


```go
package main

import (
	"fmt"
	"time"

	"github.com/go-zookeeper/zk"
)

type PedidoDeCompra struct {
	Id         string
	Item       string
	Quantidade float64
}

// Função mock para exemplificar a chegada de alguma mensagem
func consomeMensagem() PedidoDeCompra {
	return PedidoDeCompra{
		Id:         "12345",
		Item:       "pão de alho",
		Quantidade: 4,
	}
}

// Função mock para exemplificar o processamento de uma mensagem
func processaMensagem(pedido PedidoDeCompra) bool {
	fmt.Println("Processando pedido:", pedido.Id)
	time.Sleep(1 * time.Second)
	return true
}

func main() {

	// Conecta ao ZooKeeper
	conn, _, err := zk.Connect([]string{"0.0.0.0"}, 10*time.Second)
	if err != nil {
		panic(err)
	}
	defer conn.Close()

	// looping de consumo
	NovoPedido := consomeMensagem()
	mutexKey := fmt.Sprintf("/%v", NovoPedido.Id)

	// Verifica se o Znode de lock já existe
	exists, _, err := conn.Exists(mutexKey)
	if err != nil || exists == true {
		fmt.Println("Mutex travado para o recurso", mutexKey)
		return
	}

	// Criando um lock para o registro
	acl := zk.WorldACL(zk.PermAll) // Permissões abertas, ajuste conforme necessário
	path, err := conn.Create(mutexKey, []byte{}, zk.FlagEphemeral, acl)
	if err != nil {
		panic(err)
	}
	fmt.Println("Mutex criado para o recurso", mutexKey)

	// Processa o registro
	success := processaMensagem(NovoPedido)
	if !success {
		return
	}

	fmt.Println("Pedido processado:", mutexKey)

	// Libera o Mutex manualmente
	conn.Delete(path, -1)
	fmt.Println("Mutex liberado para o recurso:", mutexKey)

	// Caso a sessão com o zookeeper acabe, todos os locks gerados pela conexão serão liberados.
	time.Sleep(50 * time.Second)
}
```

```
2023/11/30 08:08:38 connected to 0.0.0.0:2181
2023/11/30 08:08:38 authenticated: id=72058178855239682, timeout=40000
2023/11/30 08:08:38 re-submitting `0` credentials after reconnect
Mutex criado para o recurso /123456
Processando pedido: 123456
Pedido processado: /123456
Mutex liberado para o recurso: /123456
```

```
2023/11/30 08:05:19 connected to 0.0.0.0:2181
2023/11/30 08:05:19 authenticated: id=72058073710329942, timeout=40000
2023/11/30 08:05:19 re-submitting `0` credentials after reconnect
Mutex travado para o recurso /12345
2023/11/30 08:05:19 recv loop terminated: EOF
2023/11/30 08:05:19 send loop terminated: <nil>
```

<br>

## Spinlock

![Spinlock](/assets/images/system-design/spinlock.png)

Volte para o churrasco com seus amigos onde há uma única grelha que todos querem usar pra assar um tipo de alimento pra comer. Ao invés de ficar esperando, como no Mutex, cada pessoa fica parada ao lado da grelha, verificando constantemente se ela está livre para uso. Assim que a grelha fica disponível, a pessoa que está verificando nesse momento a utiliza.

Um spinlock é um tipo de mecanismo de sincronização usado em ambientes de programação concorrente para proteger o acesso a recursos compartilhados. A ideia principal por trás de um spinlock é bastante simples: **em vez de bloquear uma thread e colocá-la para dormir quando ela tenta acessar um recurso que já está bloqueado, a thread "gira" (ou seja, entra em um loop) até que o lock seja liberado**.

### Exemplo de Implementação

```go
package main

import (
	"fmt"
	"runtime"
	"sync"
	"sync/atomic"
	"time"
)

type SpinLock struct {
	state int32
}

// Método do SpinLock para "travar a grelha"
// Cria um loop ativo (spin) que aguarda o valor do state ter o valor de 1
// Quando entrar na condição de `Unlock()`, libera o runtime para executar outras goroutines
func (s *SpinLock) Lock() {
	for !atomic.CompareAndSwapInt32(&s.state, 0, 1) {
		runtime.Gosched() // Permite que outras goroutines sejam executadas
	}
}

// Método do SpinLock para "destravar a grelha"
// Seta o valor da propriedade `state` para 0
func (s *SpinLock) Unlock() {
	atomic.StoreInt32(&s.state, 0)
}

// Função para simular o tempo de preparo de cada atividade do churrasco
func grelhar(amigo int, lock *SpinLock, wg *sync.WaitGroup) {
	fmt.Printf("Amigo %d está esperando para usar a grelha\n", amigo)
	lock.Lock() // Trava as demais Goroutines para usar a grelha

	fmt.Printf("Amigo %d está grelhando seu almoço\n", amigo)
	time.Sleep(1 * time.Second) // Simulando o tempo para grelhar

	fmt.Printf("Amigo %d terminou de usar a grelhar\n", amigo)
	lock.Unlock() // Destrava a grelha para a proxima goroutine (amigo)

	defer wg.Done() // Decrementa o contador de Goroutines
}

func main() {
	var wg sync.WaitGroup
	var lock SpinLock

	// Define a quantidade de gente no churrasco
	var amigosNoChurrasco = 10

	// Cria go routines para colocar todos os amigos para esperar a grelha liberar
	for i := 1; i <= amigosNoChurrasco; i++ {
		wg.Add(1)                 // Incrementa o contador dos WaitGroups das Goroutines
		go grelhar(i, &lock, &wg) // Inicia a preparação da comida
	}

	wg.Wait()
	fmt.Println("O churrasco terminou :/")

}
```

```
❯ go run main.go
Amigo 10 está esperando para usar a grelha
Amigo 10 está grelhando seu almoço
Amigo 1 está esperando para usar a grelha
Amigo 2 está esperando para usar a grelha
Amigo 3 está esperando para usar a grelha
Amigo 4 está esperando para usar a grelha
Amigo 5 está esperando para usar a grelha
Amigo 6 está esperando para usar a grelha
Amigo 7 está esperando para usar a grelha
Amigo 8 está esperando para usar a grelha
Amigo 9 está esperando para usar a grelha
Amigo 10 terminou de usar a grelhar
Amigo 3 está grelhando seu almoço
Amigo 3 terminou de usar a grelhar
Amigo 5 está grelhando seu almoço
Amigo 5 terminou de usar a grelhar
Amigo 1 está grelhando seu almoço
Amigo 1 terminou de usar a grelhar
Amigo 9 está grelhando seu almoço
Amigo 9 terminou de usar a grelhar
Amigo 2 está grelhando seu almoço
Amigo 2 terminou de usar a grelhar
Amigo 8 está grelhando seu almoço
Amigo 8 terminou de usar a grelhar
Amigo 7 está grelhando seu almoço
Amigo 7 terminou de usar a grelhar
Amigo 4 está grelhando seu almoço
Amigo 4 terminou de usar a grelhar
Amigo 6 está grelhando seu almoço
Amigo 6 terminou de usar a grelhar
O churrasco terminou :/
```

[Spinlock - Go Playground](https://go.dev/play/p/AsoJtOIUyde)

<br>

## Semáforos e Worker Pools

![Semaforos](/assets/images/system-design/worker-pools.png)

Existem dois tipos importantes de semaforo, o Semáforo Binário, que é muito parecido como o **Mutex** que já vimos, e o **Semáforo Contador**, que é o que vamos definir agora. 

Imagine um churrasco onde temos uma grelha um pouco maior que pode comportar agora um certo número de alimentos de cada vez. Aqui a grelha ainda representa um recurso compartilhado, e o numero máximo de carnes que podem ser assadas por vez é o conceito aplicado de **semáforo contador**. 

Agora a grelha da churrasqueira que você arrumou cabe até 3 pedaços de carte de cada vez, cada alimento que é colocado na churrasqueira adquire um espaço de semaforo e decrementa seu valor até chegar ao numero 0, que significa a grelha totalmente ocupada com 0 espaços disponíveis. Quando um alimento fica pronto, ele é removido da grelha o contador é incrementado dizendo que mais um alimento pode ser assado. 

Um **semáforo** também é um mecanismo de sincronização que ajuda a controlar acessos a recursos compartilhados em programação paralela e também é utilizado para evitar Race Conditions e problemas de consistência de dados, porém com outra abordagem que também nos permite coordenar várias threads de uma maneira bem legal.

Os semaforos possuem recursos para controle que são baseados em operações atômicas, sendo elas 

* **Wait (Ocupar um recurso)**: Essa operação é usada para adquirir um recurso dentro do range disponível. Se temos um semaforo de 3 posições, significa que podemos ter 3 threads trabalhando por vez no maximo. Se tivermos 3 livres e executarmos uma operação de `Wait()`, esse numero é decrementado para 2 significando que temos 1 espaço de trabalho ocupado. 
* **Signal (Liberar um recurso)**: Ao contrário do Wait, a operação `Signal()` incrementa o valor do contador do semaforo com o limite de espaço especificado, no caso o exemplo 2. Se um processo que estavaem  `Wait()` terminou, ele chama a operação de `Signal()` para desocupar um espaço do semaforo para que outra thread possa consumir. 

Os semaforos são ferramentas muito eficiêntes para trabalhar com **Worker Pools**, que são um conjunto de threads que executam tarefas de forma controlada. É um padrão útil quando se tem um grande número de tarefas a serem executadas mas precisa se limitar o número de threads que podem estar sendo executadas simultaneamente. No caso da nossa analogia, o **Worker Pool** é número de alimentos que a grelha comporta. 

### Exemplo de implementação: 

* Vamos encontrar a capacidade da grelha: `3`
* Verificar qual a quantidade de comida disponível pro churrasco: `10`
* Criar um channel com o tamanho da capacidade da grelha para gerenciarmos o uso
* Iniciar o preparo da comida adicionando um espaço no semaforo quando começar a assar o alimento
* Remover um espaço do semaforo quando terminar de assar o alimento


```go
package main

import (
	"fmt"
	"sync"
	"time"
)

// Função para simular o tempo de preparo de cada atividade do churrasco
func preparar(item int, tempoPreparo int) {
	fmt.Printf("Preparando o alimento %v...\n", item)
	time.Sleep(time.Duration(tempoPreparo) * time.Second)
	fmt.Printf("Alimento %v preparado, desocupando a grelha...\n", item)
}

func main() {

	var wg sync.WaitGroup

	// Numero maximo de goroutines / threads / alimentos que podem ser assados
	var capacidadeDaGrelha = 3
	// Alimentos disponíveis pra colocar na grelha
	var alimentosChurrasco = 10

	// Criando canal que tenha o tamanho maximo igual ao tamanho da grelha
	semaforo := make(chan struct{}, capacidadeDaGrelha)

	// Inicia o processo de assar os alimentos disponíveis
	for i := 0; i < alimentosChurrasco; i++ {

		wg.Add(1)              // Adiciona 1 atividade ao contador do WaitGroup
		semaforo <- struct{}{} // Adquire 1 espaço no semáforo adicionando 1 item ao channel

		// Começando a assar os alimentos na churrasqueira
		go func(i int) {
			alimento := i + 1

			preparar(alimento, 2) // Inicia o preparo da comida
			<-semaforo            // Libera um espaço no semaforo quando terminar o preparo
			wg.Done()             // Termina uma ativilidade no contador do WaitGroup

		}(i)
	}

	wg.Wait() // Espera todos os alimentos serem preparados
	fmt.Println("Acabou o churrasco :/")

}
```

```
❯ go run main.go
Preparando o alimento 2...
Preparando o alimento 1...
Preparando o alimento 3...
Alimento 3 preparado, desocupando a grelha...
Alimento 1 preparado, desocupando a grelha...
Alimento 2 preparado, desocupando a grelha...
Preparando o alimento 6...
Preparando o alimento 5...
Preparando o alimento 4...
Alimento 4 preparado, desocupando a grelha...
Alimento 6 preparado, desocupando a grelha...
Alimento 5 preparado, desocupando a grelha...
Preparando o alimento 9...
Preparando o alimento 7...
Preparando o alimento 8...
Alimento 8 preparado, desocupando a grelha...
Alimento 7 preparado, desocupando a grelha...
Alimento 9 preparado, desocupando a grelha...
Preparando o alimento 10...
Alimento 10 preparado, desocupando a grelha...
Acabou o churrasco :/
```

[Exemplo de Semaphore - Go Playground](https://go.dev/play/p/qZmrpyU_6a9)

Essa foi uma implementação manual que pode ou não ser utilizada pra resolver algum problema, o objetivo foi explicar o funcionamento. Caso for implementar em produção, recomendo a utilização da bibliote [semaphore](https://pkg.go.dev/golang.org/x/sync/semaphore) do Golang que abstrai muita coisa da lógica dos Worker Pools. 

<br>

> Imagens geradas pelo DALL-E

#### Referências

https://medium.com/the-kickstarter/load-balancing-101-81710aa7a3d7

https://medium.com/@rgribeiro/desvendando-a-concorr%C3%AAncia-e-paralelismo-em-go-7a33d33f5510

https://www.tabnews.com.br/lucchesisp/concorrencia-e-paralelismo-com-golang#

https://dev.to/jdvert/handling-mutexes-in-distributed-systems-with-redis-and-go-5g0d

https://github.com/bsm/redislock

https://afteracademy.com/blog/difference-between-mutex-and-semaphore-in-operating-system/

https://dev.to/yanpiing/go-paralelismo-e-concorrencia-4mlo

https://pkg.go.dev/golang.org/x/sync/semaphore