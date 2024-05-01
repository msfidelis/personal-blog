---
layout: post
image: assets/images/system-design/async.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Padrões de Mensageria e Eventos
---

Arquiteturas assincronas derivadas do uso de mensageria e eventos são recursos muito valiosos quando arquitetamos soluções complexas de sistemas distribuídos. Assim como os dois capitulos anteriores onde falamos sobre [protocolos e padrões de rede](/protocolos-de-rede/) e [padrões de comunicação sincronos](/padroes-de-comunicacao-sincronos/) em sistemas, esse tópico também visa detalhar comunicações entre componentes de uma arquitetura de serviço, mas com uma abordagem de comunicação assincrona. Vamos detalhar e diferenciar alguns tópicos importantes como Mensagens e Eventos, e como utilizá-los para resolver problemas de comunicação em larga escala utilizando protocolos como MQTT, AMQP, comunicação assincrona Over-TCP com o Kafka, arquitetura desses componentes, assim como suas vantegens e limitações. 

<br>

# Mensagens e Eventos

A comunicação em sistemas distribuídos de forma assincrona pode ser categorizada e simplificada através de duas formas: **mensagens e eventos**. A função da comunicação assincrona, assim como qualquer tipo de comunicação, **visa trocar dados e comandos entre diversos componentes que compõe um sistema**, e tanto mensagens quanto eventos cumprem esse objetivo de forma louvável, mesmo ambas possuindo peculiaridades, conceitos e características distintas que podem complementar, ou mudar totalmente um padrão de design de comunicação entre sistemas. Ambas podem ser empregadas para **distribuir cargas de trabalho de forma assincrona entre vários consumidores que podem trabalhar paralelamente para processar itens de um mesmo domínio**, assim como os [balanceadores de carga](/load-balancing/) e forma ultra-superficial e simplista, que por sua vez se encarrega de cumprir o mesmo objetivo de forma sincrona. 

<br>

## Definindo Mensageria 

![Exemplo Mensagem](/assets/images/system-design/Mensageria-Exemplo.png)

Mensageria, em termos simplistas, refere-se a troca de mensagens através de componentes intermediários. Ela se baseia em produção e consumo, onde um produtor interessado em notificar e estimular comportamentos em outro componente subsequente, envia os dados necessários para que essa finalidade seja concluída com exito, e esses dados são enfileirados em uma queue, ou fila, onde são recebidos pelo sistema destino de forma ordenada, ou não. Estabelecer um canal comum entre o destinatário e remetente da mensagem é uma premissa para que esse tipo de abordagem funcione bem. 

Mensagens geralmente são **construídas para trabalharem de forma imperativa**, onde eu **"envio uma mensagem para um sistema de e-mail, e espero que esse sistema envie o e-mail para o destinatário especificado com o conteúdo fornecido"**, ou também **"envio uma mensagem para meu sistema de atualização cadastral de usuários, onde esse sistema ao receber a mensagem atualiza o cliente existente na base comum desse domínio com as informações enviadas de forma assincrona"**, ou **"envio os dados de uma compra para um sistema de faturamento, ao receber essa mensagem de uma compra, o sistema resposável realiza todas as tarefas esperadas"**. Em todos os casos, uma mensagem na grande maioria das vezes possui um destinatário conhecido e intencional, que é capaz de tomar ações sobre o dado fornecido conforme o produtor da mensagem espera. Conceitualmente, mas não sempre, um para um. 

Uma alusão para mensagerias, é de fato, **pensar em uma carta**, correspondência ou pacote de uma encomenda. Onde ela tem um destinatário único e conhecido. Imagine que você recebe por correio, de meios formais, um envelope que te notifica do casamento de um amigo próximo te convidando para ser padrinho. É uma mensagem especialista enviada unica e exclusivamente para pessoas pelas quais esse amigo tem carinho o suficiente para ser apadrinhado. Pode-se esperar que convidados normais também receberam uma carta por correio, mas com o convite normal, mas com um conteúdo diferente, apenas os convidando para a cerimônia. Podemos imaginar que os noivos utilizaram duas filas: uma para padrinhos, e outra para os demais convidados. 

<br>

## Definindo Eventos

![Exemplo Evento](/assets/images/system-design/Eventos-Exemplo.png)

Ao contrário das mensagens que são conteúdos entregues de forma intencional para destinos conhecidos com comportamentos controlados e esperados, **um evento pode ser tratado como uma notificação genérica de que algo ocorreu**, e diversas partes de um sistema complexo que estejam interessadas nesse tipo de evento, **escutam sobre essa notificação e tomam suas devidas ações se necessário**, ou não. Ao contrário das mensagens que trafegam suas informações de um para um através de filas, **os eventos são trafegados através de tópicos, onde o conteúdo desse evento chega ao mesmo tempo, para todos os interessados no assunto do tópico**. Mensagens podem introduzir um nível maior de acoplamento entre o emissor e o receptor, especialmente se o formato da mensagem ou o protocolo de comunicação exigir que ambos os lados concordem com um contrato comum. **Eventos tendem a promover um desacoplamento maior, pois o emissor não precisa saber quem está consumindo o evento ou como**. Essa é uma forma de mensageria que garante baixo acoplamento entre sistemas, e facilita a escala e criação de novos componentes e subsistemas.  

Eventos são utilizados proximos de streaming, e **esperam que expectadores reajam a uma notificação assim que ela ocorre para executar suas funções**. Ao lado da mensageria, onde em um exemplo de e-commerce teriamos filas especificas para cobrar, faturar, enviar o e-mail, notificar o estoque e o produtor teria que enviar pontualmente a mensagem especifica para cada uma delas, quando olhamos para arquitetura de eventos, teriamos um evento proximo de um **"uma venda aconteceu!!!, sistemas interessados nisso, podem trabalhar"**, e **o sistema de cobrança, faturamento, e-mail e estoque respondem a isso de forma simultânea e isolada**. 

Uma alusão a eventos seria **o mestre de cerimônia da festa do casamento**, ou mesmo o **DJ da pista que anuncia todos eventos que estão para acontecer**. Como por exemplo ele vai até o microfone e **anuncia o horario da valsa dos padrinhos, do buquê da noiva, da gravata, do sapatinho e do esperado jantar estar sendo servido**, e todos os interessados nesses eventos tomam suas devidas ações em prol dos mesmos, se locomovendo pros locais indicados, seguindo as instruções e etc.

<br>

## Eventos vs Mensagens

Por mais que ambos os conceitos andem proximos em definições de arquiteturas, e comumente sejam até confundidos e intercambiáveis, onde tópicos de eventos sejam usados como filas, e filas sejam usadas como eventos de forma errônea, ou não, **entender as diferenças e pontos fortes de cada uma dessas alternativas pode fazer com que engenheiros e arquitetos projetem soluções ainda mais escaláveis e performáticas**. Com esse objetivo, vamos analisar os paralelos entre eventos e mensagens de forma conceitual, lado a lado. A principal diferença conceitual que permeia mensagens e ventos, como vimos, é o **propósito imperativo e o propósito reativo**. Enquanto **mensagens são concentradas em enviar mensagens para atores especificos com uma abordagem imperativa e direta de "faça algo"**, **eventos trabalham de forma reativa e desacoplada, onde temos a abordagem de "aconteceu algo", e os membros reativos tomam as devidas decisões com base nisso**. 

Mensagens são geralmente usadas para **transferir dados de um ponto a outro**, frequentemente com a expectativa de uma resposta ou reação de alguma forma. Eventos, por outro lado, **são emitidos para informar outros componentes do sistema sobre mudanças de estado**, sem esperar uma resposta. Muitas vezes em arquiteturas reativas a eventos, **o responsável pela produção do evento não conhece todos os seus consumidores e quais ações os mesmos tomam**, pois a fonte do evento é de uma para muitas, não exigindo confirmação ou conhecimento prévio. Eventos são ideais **para a construção de sistemas reativos que respondem a mudanças de estado**, como o **"o estado de determinada compra se tornou CANCELADO"**, enquanto **mensagens são mais adequadas para integrações diretas** onde uma ação específica é requerida aos dados enviados, como **"cancele essa compra"**.

<br>

# Conceitos e Padrões

![Conceitos](/assets/images/system-design/mensageria-conceitos.png)

Tanto em ferramentais que possibilitam o uso de mensageria quanto eventos e streaming, alguns conceitos podem estar presentes de forma singela em ambos os casos. Nessa sessão vamos detalhar alguns deles para que, conceitualmente, seja possível guiar as melhores decisões arquiteturais. 

<br>

## FIFO e Queues - First In First Out

O Padrão FIFO, ou *First In First Out*, é um conceito muito presente em tecnologias de mensageria e processamento de filas, onde neste modelo, podemos entender que as **mensagens serão tratadas na forma de uma fila literal**, onde **a primeira mensagem a chegar, será consequentemente a primeira a ser disponibilizada para consumo**. Este padrão pode ser habilitado e adotado em mensageria em casos de uso onde uma **ordem mínima de processamento precisa ser garantida**, pois a ordem do consumo representa exatamente a ordem de chegada da mensagem. O FIFO é uma estrutura interessante para ser empregado em sistemas financeiros, onde **a ordem de execução de um grupo de transações precisa ser respeitado**, ou em sistemas de vendas onde a ordem de compra **precisa ser tratada de forma justa pela ordem de confirmação**. 

![Queue](/assets/images/system-design/queue.png)

As operações conhecidas dentro da estrutura de dados de Queue geralmente são conhecidas como `Enqueue`, que se encarrega de adicionar um item ao fim de uma lista ou fila, e o `Dequeue`, que se encarrega de remover o primeiro item da lista ou fila. Abaixo temos um funcionamento simples de uma implementação de Queue FIFO para compreendermos a lógica da estrutura: 

```go
package main

import (
	"fmt"
)

// Interface genérica para implementar os métodos de enfileiramento
type Queue []interface{}

// Adiciona um item na fila
func (q *Queue) Enqueue(item interface{}) {
	*q = append(*q, item)
}

// Remove o primeiro item da fila e o retorna
func (q *Queue) Dequeue() interface{} {
	if len(*q) == 0 {
		return nil
	}
	item := (*q)[0]
	*q = (*q)[1:]
	return item
}

func main() {
	queue := Queue{}

	// Itens a serem adicionados na Queue
	items := []string{
		"Pizza",
		"Hamburger",
		"Churrasco",
	}

	// Adicionando os itens na ordem da lista
	for _, item := range items {
		fmt.Println("Input:", item)
		queue.Enqueue(item)
	}

	fmt.Println()

	// Removendo os itens em ordem de chegada na lista
	fmt.Println("Output:", queue.Dequeue())
	fmt.Println("Output:", queue.Dequeue())
	fmt.Println("Output:", queue.Dequeue())
}
```

##### Output: 

```
Input: Pizza
Input: Hamburger
Input: Churrasco

Output: Pizza
Output: Hamburger
Output: Churrasco
```

<br>

## LIFO e Stacks - Last In First Out

Por mais que o padrão LIFO, ou *Last In First Out*, seja empregado também em Queues no conceito de mensageria, em estruturas de dados esse padrão pode ser associado a uma Stack. Ao contrário do FIFO onde temos uma percepção de uma fila literal, onde o primeiro achegar é o primeio a ser atendido, o LIFO nos entrega uma e**xperiência de uma Pilha**, onde **a ultima mensagem a ser incluída, será a primeira a ser consumida na priorização**. Por mais que, pelos exemplos que vimos até então, o conceito de LIFO seja anti-intuitivo quando olhamos para o conceito de distribuição de cargas de trabalho, desacoplamento e processamento em batch, ele pode ser implementado em funcionalidades que podem requerer uma ação de "desfazer", onde precisamos preservar uma "memória" de etapas de um processamento que precisa ser desfeita na ordem inversa, como por exemplo um processo de calculos de descontos dentro de um plano com multiplas condições e regras. 

![Stack](/assets/images/system-design/stack.png)

De formas simplistas, a principal diferença entre uma queue e uma stack é a o sentido da remoção dos itens da lista. Uma stack é uma queue ao contrário, e vice versa. As operações conhecidas dentro dessa estrutura de dados são geralmente a definidas como `Push`, onde adicionamos um item no inicio da pilha e `Pop` onde retiramos o primeiro item da mesma. 

```go
package main

import (
	"fmt"
)

type Stack []interface{}

// Adiciona um item na pilha
func (s *Stack) Push(item interface{}) {
	*s = append(*s, item)
}

// Remove o item do topo da pilha e o retorna
func (s *Stack) Pop() interface{} {
	if len(*s) == 0 {
		return nil
	}
	index := len(*s) - 1
	item := (*s)[index]
	*s = (*s)[:index]
	return item
}

func main() {
	stack := Stack{}

	// Itens a serem adicionados na Stack
	items := []string{
		"Pizza",
		"Hamburger",
		"Churrasco",
	}

	// Adicionando os itens na pilha
	for _, item := range items {
		fmt.Println("Input:", item)
		stack.Push(item)
	}

	fmt.Println()

	// Removendo os itens da pilha
	fmt.Println("Output:", stack.Pop())
	fmt.Println("Output:", stack.Pop())
	fmt.Println("Output:", stack.Pop())
}
```

##### Output: 

```
Input: Pizza
Input: Hamburger
Input: Churrasco

Output: Churrasco
Output: Hamburger
Output: Pizza
```

## Funout 

O padrão de Funout é um pattern empregado onde é **necessário uma estratégia de 1:N no envio de mensagens**. Isso pode ser empregado em mensageria quando temos **uma unica mensagem que precisa ser distribuída para um numero maior de filas**, ou quando olhamos para o comportamento padrão de um evento, em que a mesma mensagem é repassada para todos os grupos de consumidores com funções diferentes interessadas no mesmo tópico. Em termos simplistas, o **Fanout é enviar a mesma mensagem para todos os lugares possíveis dentro de algum contexto que faça sentido**. 

Esse padrão é útil, como citado, quando precisamos notificar a mesma mensagem para vários grupos, tanto quando para replicação de dados, onde por intermédio de alguma carga de trabalho segundária, replicamos o processamento ou o dado para outros tipos de bancos de dados, datacenters e subsistemas. 

## DLQ - Dead Letter Queues

As **Dead Letter Queues são mecanismos de post-mortem de mensagens** que não conseguiram ser processadas. Elas são utilizadas para **centralizar mensagens que por ventura falharam em ser consumidas durante seu ciclo de vida**, sejam por erros, timeouts para serem confirmadas ou quantidades de retentativas excedidas. Utilizar as DLQ's permite aos times de engenharia que suportam sistemas que fazem uso de mensageria, analisar e tratar os casos de insucesso das integrações sem criarem um overhead desnecessário de retentativas infinitas na fila principal, ou até mesmo as recolocando na fila principal depois de tratamentos em caso de uma indisponibilidade em um subsistema que demorou tempo demais para se reestabelecer e automaticamente moveu suas mensagens até ela. 

![DLQ](/assets/images/system-design/dlq.png)

Implementar DLQ's nos permite através de estratégias de monitoramento identificar um possível problema nos sistemas que se comunicam dessa forma, uma vez que, não faz parte do fluxo padrão encaminhar uma grande quantidade de mensagens para elas. Observar o numero de mensagens disponíveis em em DLQ's durante o tempo pode ser um indicador chave em sistemas assincronos. 

<br>

# Protocolos e Arquiteturas de Eventos

Prococolos e arquiteturas de eventos, ou event-driven, são ferramentas extremamente úteis em ambientes distribueidos, e podem facilitar o processamento e análise de volumes significativos de dados em tempo real, ou muito próximo disso. 

## Streaming e Reatividade

O Streaming de dados pode ser considerado um pattern que visa realizar o processamento de um fluxo contínuo de dados que são gerados em tempo real. Diferente de processamentos em batch que lida com blocos de dados estáticos, o streaming visa abordar a mesma quantidade de dados, ou até maiores, em tempos muito proximos dos que foram gerados. Streaming engloba tecnologias e padrões de projetos que possibilitam escrever aplicações que se utilizam de reatividade para realizar suas funções para lidar com esses mesmos dados e eventos. 

Um exemplo classico, mas não limitado a isso, é a implementação de streaming em redes sociais e ferramentas de monitoramento de comportamento de usuários, onde acessos e cliques que acontecem dentro de suas plataformas são transformados em eventos analiticos, que assim que são produzidos, são processados e catalogados para enriquecer relatórios analíticos e algoritmos de recomendação. Um simples clique em um botão, a busca por um termo específico, a altura de uma rolagem na págica pode ser um evento capturado, transformado e processado quase no mesmo instante que ocorrem. 

Um outro exemplo interessante e classico são sistemas de fraude, que de acordo com o padrão de comportamento e compra conhecido, pode capturar detalhes, valores e métodos de pagamento para classificar se determinada transação é uma fraude ou está ocorrendo de forma legítima, ou uma plataforma de streaming que com base no seu historico de navegação e títulos consumidos de séries e filmes pode automaticamente recomendar itens parecidos sem precisar de um bloco de tempo grande para tomar essas decisões. 

### Reatividade e Arquiteturas Event-Driven

Aplicações orientadas a eventos, ou event-driven, são projetadas para detectar eventos vindos ou não de streaming e serem estimulados para tomar alguma decisão com base nisso. Várias aplicações processos podem responder ao mesmo evento de forma totalmente indepentene. Esse tipo de arquitetura, ou grupo de patterns, são úteis e bem vindos a aplicações que interagem a ambientes de constate mudanças, ou reagem a mudanças de estado de vários objetos trafegados no sistema. A capacidade de vários atores responderem a eventos em tempo real pode tornar o desacoplamento de sistemas produtivos de larga escala uma tarefa muito mais interessante e eficiente. Imagine que vários sistemas distribuídos e com diferentes finalidades monitoram através de um sistema de notificações a mudança de status de um pedido realizado em uma plataforma de delivery de comida. Um grupo de listeners pode responder quando o pedido está com o status `CRIADO` onde podem notificar o backoffice do restaurante, mandar notificações em push para o usuário, outro grupo pode responder quando o status muda para `ACEITO` onde o processamento de cobrança é iniciado no meio de pagamento escolhido, outro grupo responde para quando status muda para `PRONTO` notificando os entregadores disponíveis, mais grupos tomam decisões com base na mudança do status para `A_CAMINHO`, `ENTREGUE`, `FINALIZADO` e etc.


## Kafka 

O Apache Kafka, por mais que não seja a única opção, é talvez a mais conhecida e associada a arquiteturas orientadas a eventos. O Kafka é uma plataforma de streaming que é projetada intencionalmente para lidar com um volume gigante de dados garantindo performance e alta disponibilidade. O Kafka é composto inicialmente de alguns componentes importantes, e dentro dos componentes e conceitos mais importantes podemos encontrar: 

### Clusters e Brokers 

### Tópicos

### Partições

### Producers 

### Consumers


## R2DBC



# Protocolos e Arquiteturas de Mensageria

Os protocolos de mensageria desempenham papéis na facilitação da comunicação entre sistemas distribuídos, permitindo a troca eficiente de mensagens de forma assíncrona. Dois dos protocolos mais importantes nesta categoria são o **MQTT** (*Message Queuing Telemetry Transport*) e o **AMQP** (*Advanced Message Queuing Protocol*). Esses protocolos são projetados para otimizar o tráfego de dados, garantir a entrega de mensagens e suportar padrões de comunicação flexíveis, confiáveis e performáticos. Normalmente as comunicações que se utilizam do HTTP tem uma responsabilidade sincrona de solicitação e resposta, utilizado onde é necessário receber do servidor uma resposta imediata para a transação solicitada. Porém em termos de performance, os protocolos que possibilitam comunicações assincronas podem nos ajudar a extender as capacidades de processamento em background de tarefas custosas, paralelizar e distribuir tarefas entre diversos microserviços com diferentes possibilidades necessárias para completar a solicitação, continuar o trabalho de uma solicitação inicialmente sincrona em background entre diversas outras possibilidades. Aqui falaremos inicialmente de como funciona o protocolo. Breve falaremos mais detalhadamente da aplicação e implementação de tarefas assincronas em engenharia de fato. 

<br>

## MQTT (Message Queuing Telemetry Transport)

O **MQTT** (*Message Queuing Telemetry Transport*) é um protocolo de mensageria leve e eficiente, projetado para situações em que as aplicações possuem recursos computacionais limitados e a largura de banda da rede é limitada ou instável. Esse protocolo é **amplamente utilizado em aplicações de Internet das Coisas** (IoT) e **Edge Computing**, e facilita a **comunicação entre dispositivos com recursos limitados e servidores**, usando um modelo **publicar/assinar**, ou **publisher/subscriber**, ou **pub/sub**. Isso permite que dispositivos **publiquem mensagens em tópicos, que são então distribuídos aos clientes inscritos, garantindo que as mensagens sejam entregues mesmo em condições de rede instáveis**. Suas principais características incluem simplicidade, eficiência e baixo consumo de energia, tornando-o ideal para cenários de comunicação em tempo real em ambientes com conectividade restrita.

![MQTT - Arquitetura](/assets/images/system-design/arquitetura-simples.png)
> Arquitetur MQTT Resumida

No quesito de topologia, a arquitetura de uma implementação MQTT precisam de alguns agentes e responsabilidades. Como a **finalidade do protocolo é o envio de mensagens assincronas vindas de diferentes tipos de dispositivos** que serão processadas por outros tipos de aplicacão no lado do servidor, o responsável por receber e orquestrar essas mensagens para seus destinatários são clusters de servidores MQTT. **Esse conjunto de servidores são conhecidos como brokers**, que trabalham como centralizadores dessas mensagens enviadas por vários dispoitivos. Esses agentes **responsáveis por enviar as mensagens são conhecidos como Publishers**. Os brokers após receberem as mensagens, ele as armazenam em **tópicos** identificados durante a publicação. Após o armazenamento, o cluster disponibiliza as mensagens para serem consumidas por outras aplicações que vão fazer um uso para essas informações publicadas. **Essas aplicações que consomem os dados são identificadas como Subscribers.**

### Quebrar em componentes

![MQTT - Workflow](/assets/images/system-design/protocolos-mqtt.png)

O **MQTT opera sobre o protocolo TCP/IP**, estabelecendo uma **conexão de socket persistente entre o cliente e o broker**. Isso proporciona uma comunicação bidirecional confiável, onde os pacotes de dados são garantidos a chegar na ordem e sem duplicidades.

Dentro desta conexão persistente, os clientes podem publicar mensagens em tópicos específicos usando a mensagem de `PUBLISH`, e assinar tópicos para receber mensagens usando a mensagem de `SUBSCRIBE`. Dentro dessa conexão todas as mensagens são trocadas de forma performática e confiável.  

### MQTT Default Subscription 

A subscrição normal no MQTT segue o modelo de publicação/assinatura tradicional, onde cada assinante que se inscreve em um tópico recebe uma cópia da mensagem publicada nesse tópico. Isso significa que se três dispositivos estão inscritos no tópico `"sensor/temperatura"`, e uma mensagem é publicada neste tópico, cada um dos três dispositivos receberá uma cópia independente da mensagem.

![MTT - Normal](/assets/images/system-design/mqtt-normal.png)
> Modelo de subscription padrão do MQTT

Existem várias formas de projetar arquiteturas MQTT, e este modelo padrão é extremamente útil quando é necessário que todos os assinantes recebam todas as mensagens, garantindo que a informação distribuída seja amplamente acessível para vários tipos de aplicações que precisem tomar vários tipos de ações diferentes. Caso você precise por exemplo receber a medição do `sensor/temperatura`, armazená-la em um database, enviá-la para um processo de analytics e com base no valor recebido tomar alguma ação em outro sistema, você pode criar 3 tipos de aplicações interessadas nessa mensagem e recebê-las ao mesmo tempo. 


### MQTT Shared Subscription 

A **Shared Subscription**, introduzida em versões mais recentes do padrão MQTT, é uma importante adição que **permite um modelo de distribuição de mensagens mais proximo do balanceamento de carga**. Em uma subscrição compartilhada, mensagens publicadas em um tópico são distribuídas de maneira balanceada entre os assinantes do grupo de subscrição compartilhada, em vez de cada assinante receber uma cópia da mensagem. 


![MTT - Shared](/assets/images/system-design/mqtt-shared.png)
> Modelo de shared subscription do MQTT

Esse modo de subscription é particularmente úteis em cenários de **processamento de mensagens em larga escala**, onde o balanceamento de carga entre múltiplos consumidores é necessária para otimizar o processamento devido ao alto volume de entrada. Elas permitem uma **arquitetura mais escalável e eficiente**.

Enquanto a **subscrição normal garante que todas as mensagens sejam distribuídas a todos os assinantes**, a **subscrição compartilhada oferece uma abordagem mais eficiente e escalável para o balanceamento de carga entre os assinantes**. Ambos os tipos de subscrição têm seu lugar no ecossistema MQTT e abrem o leque para projetar arquiteturas. Um ponto interessante é que podemos combinar as duas possibilidades, criando várias shared subscriptions que recebem a mesma mensagem, e que distribuem a carga para os membros de cada pool de subscribers.

<br>

## AMQP (Advanced Message Queuing Protocol)

O **AMQP** (*Advanced Message Queuing Protocol*) é um protocolo de mensageria aberto, que ao contrário do MQTT, que se concentra na simplicidade e eficiência, o fornece um **conjunto mais rico de funcionalidades, incluindo confirmação de mensagens, roteamento flexível e transações seguras**. Ele é projetado para **integrar sistemas corporativos e aplicações complexas**, proporcionando uma solução interoperável para mensageria assíncrona. O AMQP **suporta tanto o modelo de publicação/assinatura quanto o de enfileiramento de mensagens**, oferecendo uma maior flexibilidade na implementação de padrões de comunicação. Esse padrão é implementado pelo **RabbitMQ**, uma solução muito conhecida para troca de mensagens de forma assincrona. 

![Arquitetura AMQP](/assets/images/system-design/amqp-arquitetura.png)

![Workflow AMQP](/assets/images/system-design/amqp.png)

Tudo começa com a criação de uma conexão TCP entre o cliente (produtor ou consumidor) e o servidor AMQP (broker). O TCP/IP serve como a base para a comunicação, estabelecendo um canal de comunicação bidirecional e confiável entre as partes. Após o estabelecimento da conexão TCP, inicia-se a negociação do protocolo AMQP. O cliente envia um protocolo header para o servidor, indicando a versão do AMQP que deseja usar. O servidor responde, confirmando a versão do protocolo ou sugerindo uma alternativa.

Uma vez acordada a versão do protocolo, estabelece-se uma **sessão AMQP**. Dentro dessa sessão, podem ser **criados vários canais de comunicação lógicos, que permitem múltiplas correntes de comunicação sobre a mesma conexão TCP**.

O produtor publica mensagens enviando-as ao broker através de um canal específico na sessão AMQP. Cada mensagem é rotulada com uma chave de roteamento ou enviada para uma exchange específica, que determina como a mensagem deve ser encaminhada às filas. O broker utiliza as informações e metadados contidas na mensagem, como a exchange e a chave de roteamento, para determinar a fila destino das mensagens. As mensagens são então encaminhadas para as filas apropriadas, aguardando pelo consumo.

### Brokers 

Dentro da arquitetura do AMQP, um broker é um centralizador de componentes intermediário entre produtores e consumidores que atua realizando a gestão do tráfego de mensagens entre ambos. Os brokers fazem a gestão da recepção, tratamento, armazenamento e direcionamento da mensagem para suas queues apropriadas, fazendo o uso de metadados e informacões enviadas pelo produtor para realizar esse direcionamento de forma correta. Um broker agrupa tanto as exchanges, routes e queues, e  disponibiliza as mensagens para serem consumidas pelos consumidores. Eles trabalham mais proximos do físico. 

### Channels

No AMQP, um **Channel é uma sessão virtual que é estabelecida tanto pelo consumidor quanto pelo produtor** através do próprio protocolo. Os Channels são persistentes e fornecem a possibilidade de operacões e mensagens sejam trafegados simultâneamente através de uma unica conexão, o que torna o protocolo muito "barato" em termos computacionais. Resumidamente, cada sessão é uma conexão independente que possibilita multiplas operações, evitando assim a necessidade de serem criadas multiplas conexões de rede que podem sobrecarregar os brokers e tornar a performance e gestão dessas conexões ineficientes em média/larga escala.  

### Queues

Uma queue, de forma genérica tem o mesmo conceito dentro da arquitetura do AMQP, sendo a estrutura de dados que armazena as mensagens temporariamente para que sejam processadas pelo consumidor posteriormentee. Nelas podem ser configurados parâmetros de persistência, visibilidade, durabilidade e time to live. As queues no sentido mais amplo são os intermediários diretos do dado produzido e consumido de forma enfileirada. 

### Producers 

Um producer é a entidade que **envia as mensagens para uma exchange através de canais estabelecidos AMQP** para que as mesmas sejam direcionadas para a queue correta. A sua responsabilidade é informar a mensagem e a binding key especifica para indicar para onde a mensagem será roteada dentro do conjunto de queues possíveis. Eles podem especificar como será feita a persistência e prioridade da mensagem enviada. 

### Consumers 

Um consumidor é a entidade que **recebe as mensagens que estavam armazenadas na queue de forma enfileirada**. Suas responsabilidades são se inscrever nas queues de interesse e receber as mensagens conforme a lógica definida nas mesmas. Elas podem operar no modo de auto-ack, onde a primeira recepção já é um indicativo para deletar a mensagem da fila, ou com confirmações manuais, onde após um processamento intenso, o consumidor especifica diretamente para a queue se a mensagem recebida pode, ou não pode ser deletada ou re-enviada para consumo em caso de erros. 

### Exchanges e Binding Keys

As **Exchanges são os componentes dentro do broker responsáveis por receber as mensagens dos produtores e através das regras de roteamento fazer a entrega para as queues corretas**. Existem vários tipos de exchanges, como direct, topic, fanout, e headers, cada um definindo uma estratégia de roteamento diferente para a queue correta. A escolha da exchange depende do padrão de mensageria desejado entre o produtor e consumidor. As exchanges distribuem as mensagens para as queues específicas fazendo uso das **binging keys**. As 

### Tipos de Exchanges

Dentro do AMQP possuimos alguns tipos de exchanges que tem finalidades e funcionamentos específicos. Nesse tópico vamos abordar algumas das mais importantes e que, ao meu ver, são as mais úteis para projetar soluções de arquitetura. 

#### Direct Exchange

Uma exchange do tipo Direct é o tipo default e mais comum de produção de mensagens em filas gerenciadas pelo AMQP. Ela é o modelo basico de associação de uma exchange para uma queue, e utiliza a binding key para direcionar a mensagem para a queue correta. Esse é o tipo de roteamento que caracteriza um encaminhamento ponto a ponto, onde a binding key precisa ser interpretada de maneira exata para o encaminhamento correto. Ela pode ser pensada para arquiteturas que façam a distribuição de "comandos" entre sistemas de maneira imperativa, como por exemplo "cobrar", "enviar", "processar", "criar", "cadastrar" e etc. 

Imagine em uma arquitetura de e-commerce onde você precisa mandar mensagens com assinaturas e conteúdos diferentes para vários outros sistemas. O conteúdo dessas mensagens é diferente entre os sistemas e não pode ser reaproveitado por N questões. Sempre que uma compra precisar ser confirmada, utilizamos a binding key `confirmar_compra` para enviar a mensagem para a fila de confirmação de compra, a mesma coisa quando precisamos enviar um e-mail de forma assincrona enviamos o conteúdo desse e-mail para a fila correta usando uma binding key `enviar_email`, reforçando o exemplo, quando precisamos notificar o sistema de cobrança para processar financeiramente a compra, utilizamos a binding key `cobrar` para rotear a mensagem para a fila de de cobrança. Esse é um exemplo de uso do funcionamento de uma Direct Exchange. 

![Exchange Default](/assets/images/system-design/amqp-default.png)

Abaixo temos uma implementação básica de um produtor e consumidor no padrão de exchange direct, onde criamos uma exchange chamada `ecommerce.nova.venda`, onde iremos simular que mensagens de vendas concluidas de um suposto e-commerce serão trafegadas. Vamos criar uma queue chamada `cobrar` e a associar a exchange junto a uma binding key também chamada `cobrar`. 

Na produção, nos conectamos no broker e informando a exchange criada, e enviando a binding key `cobrar`, a mesma estará disponível na queue para ser consumida.

##### Setup e Binding no Modo Direct
```go
conn, err := amqp.Dial("amqp://user:password@localhost:5672/")
if err != nil {
    fmt.Println("Falha ao conectar com o broker", err)
    return
}
defer conn.Close()

// Criando um canal
ch, err := conn.Channel()
if err != nil {
    fmt.Println("Falha ao abrir um canal com o broker", err)
    return
}
defer ch.Close()

// Criação da Exchange
err = ch.ExchangeDeclare(
    "ecommerce.nova.venda", // Nome da exchange
    "direct",               // Tipo da exchange
    true,                   // durable
    false,                  // auto-deleted
    false,                  // internal
    false,                  // no-wait
    nil,                    // arguments
)
if err != nil {
    fmt.Println("Falha ao construir a exchange", err)
    return
}
```


```go
// Criação de uma Queue
q, err := ch.QueueDeclare(
    "cobrar", // Nome da fila
    true,     // durable
    false,    // delete when unused
    false,    // exclusive
    false,    // no-wait
    nil,      // arguments
)
if err != nil {
    fmt.Println("Falha ao criar a queue", err)
    return
}

// Associando a Queue até a Exchange
// e informando a binding key para roteamento
err = ch.QueueBind(
    q.Name,                 // Nome da fila
    "cobrar",               // Binding key de roteamento
    "ecommerce.nova.venda", // Nome da exchange
    false,                  // no-wait
    nil,                    // arguments
)
```

##### Producer no Modo Direct
```go
// ...
for i := 0; i < 10; i++ {

    id := uuid.New()

    // Mensagem simples
    body := fmt.Sprintf("id:%v", id)

    // Publicando a mensagem na exchange
    err = ch.Publish(
        "ecommerce.nova.venda", // exchange
        "cobrar",               // routing key (binding key)
        false,                  // mandatory
        false,                  // immediate
        amqp.Publishing{
            ContentType: "text/plain",
            Body:        []byte(body),
        })
    if err != nil {
        fmt.Println("Falha ao publicar a mensagem na exchange", err)
    }

    fmt.Printf("Mensagem de venda enviada para a exchangeecommerce.nova.venda: %v\n", body)
}

```


##### Consumer no Modo Direct
```go
// Criação de uma Queue // Caso já exista, simplesmente se conecta
q, err := ch.QueueDeclare(
    "cobrar", // Nome da fila
    true,     // durable
    false,    // delete when unused
    false,    // exclusive
    false,    // no-wait
    nil,      // arguments
)
if err != nil {
    fmt.Println("Falha ao criar a queue", err)
    return
}

msgs, err := ch.Consume(
    q.Name, // queue
    "",     // consumer
    false,  // auto-ack
    false,  // exclusive
    false,  // no-local
    false,  // no-wait
    nil,    // args
)

forever := make(chan bool)

go func() {
    for d := range msgs {
        fmt.Printf("Mensagem de cobrança recebida na queue %v: %v\n", q.Name, string(d.Body))
        d.Ack(true)
    }
}()

fmt.Println("[Cobranca de Vendas] Aguardando por mensagens")
<-forever
```

```
```

```
```


#### Topic Exchange

As Topic Exchanges oferecem roteamentos mais dinâmicos quando comparados a correspondência exata das Direct Exchanges. Nelas podemos fazer roteamentos entre a exchange e as queues baseados em padrões da binding key. Isso significa que podemos criar bindings baseados em caracteres curingaas como `*` que substituem uma sequencia de palavras ou `#` que subistituem zero ou uma sequência de palavras. 

Vamos imaginar que dentro do nosso e-commerce, o sistema de faturamento é notificado através de mensageria. Utilizaremos uma exchange e uma queue para enviar as mensagens dos pedidos a serem faturados, essa queue chamada `queue.faturamento` é usada para enfileirar todos os comandos de faturamento da solução, porém encontramos um cenário de [gargalo](/performance-capacidade-escalabilidade/) em alguns clientes críticos que precisam de um SLA de faturamento menor, e devido ao alto volume financeiro e criticidade, não podem concorrer com as mensagens de todos os outros clientes no sistema inteiro. Nesse caso, criamos uma seguda queue chamada `queue.faturamento.prioritario` onde através da binding key informada, a mensagem é destinada para uma carga de trabalho dedicada para esses casos. Nesse caso decidimos utilizar a binding key `faturamento.prioridade.default` e `faturamento.prioridade.alta` para fazer essa diferenciação. 

Esse cenário ainda pode ser facilmente resolvido com a Exchange Direct, somente criando bindings especificos para cada valor de binding key que correspondessem de forma exata. Porém, temos uma segunda integração, onde todas mensagens de faturamento, independente do nível de criticidade, são enviadas para um datalake, e isso também é feito de forma assincrona com base em mensageria utilizando a queue `queue.faturamento.datalake`. Nesse caso uma Topic Exchange pode nos ajudar, onde podemos criar regras de binding específicas para cada nível de prioridade, e também uma binding com um curinga `*` para duplicar e rotear também, todas as mensagens para a queue do Data Lake, no formato `faturamento.prioridade.*`.

Nesse cenário, mesmo utilizando tanto a binding key de prioridade default quanto a de prioridade alta, todas as mensagens que corresponderem ao padrão `faturamento.prioridade.*` por tabela também serão enviadas para a fila do lake. 

![Exchange - Topic 1](/assets/images/system-design/amqp-topic-1.png)

![Exchange - Topic 2](/assets/images/system-design/amqp-topic-2.png)

Vamos reproduzir exatamente esse cenário hipotético abaixo, onde criaremos 3 queues e 3 bindings, para o faturamento de prioridade default, o faturamento de prioridade alta e o envio dos faturamentos para o datalake analitico. E informando a prioridade requisitada na produção, a mensagem será devidamente roteada para o microserviço segregado específico, e também de forma genérica para o lake hipotético. 

##### Setup e Binding no Topic

```go
// Criação da Exchange
err = ch.ExchangeDeclare(
    "ecommerce.nova.venda.faturamento", // Nome da exchange
    "topic",                            // Tipo da exchangem - topic
    true,                               // durable
    false,                              // auto-deleted
    false,                              // internal
    false,                              // no-wait
    nil,                                // arguments
)
if err != nil {
    fmt.Println("Falha ao construir a exchange", err)
    return
}
```

```go
// Criação de uma Queue de faturamento de vendas
// de prioridade default, onde em teoria a maior parte das
// mensagens será enviada
queueDefault, err := ch.QueueDeclare(
    "queue.faturamento", // Nome da fila
    true,                // durable
    false,               // delete when unused
    false,               // exclusive
    false,               // no-wait
    nil,                 // arguments
)
if err != nil {
    fmt.Println("Falha ao criar a queue", err)
    return
}

// Associando a Queue até a Exchange
// e informando a binding key para roteamento
err = ch.QueueBind(
    queueDefault.Name,                  // Nome da fila
    "faturamento.prioridade.default",   // Binding key de roteamento - chave de prioridade default
    "ecommerce.nova.venda.faturamento", // Nome da exchange
    false,                              // no-wait
    nil,                                // arguments
)
if err != nil {
    fmt.Println("Falha associar a queue a exchange", err)
    return
}
```

```go
// Criação de uma Queue de faturamento de vendas
// de prioridade alta, onde somente os clientes de maior volume
// financeiro será destinada
queuePrioridade, err := ch.QueueDeclare(
    "queue.faturamento.prioritario", // Nome da fila
    true,                            // durable
    false,                           // delete when unused
    false,                           // exclusive
    false,                           // no-wait
    nil,                             // arguments
)
if err != nil {
    fmt.Println("Falha ao criar a queue", err)
    return
}

// Associando a Queue até a Exchange
// e informando a binding key para roteamento
err = ch.QueueBind(
    queuePrioridade.Name,               // Nome da fila
    "faturamento.prioridade.alta",      // Binding key de roteamento - chave de prioridade alta
    "ecommerce.nova.venda.faturamento", // Nome da exchange
    false,                              // no-wait
    nil,                                // arguments
)
if err != nil {
    fmt.Println("Falha associar a queue a exchange", err)
    return
}
```
    
```go
// Criação de uma Queue que receberá todas as mensagens, independente da prioridade
// A intenção é receber todos os pedidos de faturamento e enviar para um
// suposto analitico
queueLake, err := ch.QueueDeclare(
    "queue.faturamento.datalake", // Nome da fila
    true,                         // durable
    false,                        // delete when unused
    false,                        // exclusive
    false,                        // no-wait
    nil,                          // arguments
)
if err != nil {
    fmt.Println("Falha ao criar a queue", err)
    return
}

// Associando a queue na exchange, todas as mensagems que forem enviadas com o pattern
// faturamento.prioridade.* será enviada para essa fila independente da prioridade informada
err = ch.QueueBind(
    queueLake.Name,                     // Nome da fila
    "faturamento.prioridade.*",         // Binding key de roteamento - chave de prioridade alta
    "ecommerce.nova.venda.faturamento", // Nome da exchange
    false,                              // no-wait
    nil,                                // arguments
)
if err != nil {
    fmt.Println("Falha associar a queue a exchange", err)
    return
}
```

##### Producer no Modo Topic

```go
for i := 0; i < 3000000000; i++ {

    routingKey := "faturamento.prioridade.default"
    if rand.Float64() < 0.1 { // mock para dar 10% de chance de uma mensagem ser encaminhada para a queue prioritária
        routingKey = "faturamento.prioridade.alta"
    }

    id := uuid.New()
    // Mensagem simples
    body := fmt.Sprintf("id:%v:%v", routingKey, id)

    // Publicando a mensagem na exchange usando a routing key de default/prioritario
    err = ch.Publish(
        "ecommerce.nova.venda.faturamento", // exchange
        routingKey,                         // routing key (binding key)
        false,                              // mandatory
        false,                              // immediate
        amqp.Publishing{
            ContentType: "text/plain",
            Body:        []byte(body),
        })
    if err != nil {
        fmt.Println("Falha ao publicar a mensagem na exchange", err)
    }
    fmt.Printf("Mensagem de faturamento enviada para a queue %v: %v\n", routingKey, body)
}
```

#### Fanout Exchange

Uma Fanout Exchange é um tipo muito interessante de abordagem, pois nos permite amarras várias queues em uma exchange, e sem precisar informar nenhuma binding key, replicar a mesma mensagem entre todas elas. Esse tipo de abordagem é interessante quando precisamos notificar subsistemas com uma abordagem um pouco mais proxima de um evento, mas ainda assim funcionando como mensageria. Imagine que no nosso sistema de e-commerce precisamos ao mesmo tempo notificar os sistemas de cobrança, logistica e estoque, com base em uma nova venda que ocorreu. Esses processos podem ser efetuados de forma paralela e não dependem de uma ordem específica para serem concluídos, podendo demorar o quanto for necessário, e todos eles podem fazer uso dos campos presentes de um só payload. Esse é um caso perfeito para uma Exchange do tipo Fanout, onde com base em apenas uma ação de produção, a mesma mensagem é entregue de forma identica entre todas as queues associadas. 

![Exchange Fanout](/assets/images/system-design/amqp-funout.png)

##### Setup no Fanout

![Exchange - Fanout](/assets/images/system-design/amqp-funout.png)

```go
// Criação da Exchange
err = ch.ExchangeDeclare(
    "ecommerce.nova.venda", // Nome da exchange
    "fanout",               // Tipo da exchange
    true,                   // durable
    false,                  // auto-deleted
    false,                  // internal
    false,                  // no-wait
    nil,                    // arguments
)
if err != nil {
    fmt.Println("Falha ao construir a exchange", err)
    return
}
```

```go
// Criação de uma Queue de cobranca
qCobranca, err := ch.QueueDeclare(
    "cobrar_pedido", // Nome da fila
    true,            // durable
    false,           // delete when unused
    false,           // exclusive
    false,           // no-wait
    nil,             // arguments
)
if err != nil {
    fmt.Println("Falha ao criar a queue", err)
    return
}
// Associando a Queue até a Exchange
err = ch.QueueBind(
    qCobranca.Name,         // Nome da fila
    "",                     // Binding key de roteamento - Ignorada no Fanout
    "ecommerce.nova.venda", // Nome da exchange
    false,                  // no-wait
    nil,                    // arguments
)
```

```go
// Criação de uma Queue de cobranca
qEstoque, err := ch.QueueDeclare(
    "reservar_estoque", // Nome da fila
    true,               // durable
    false,              // delete when unused
    false,              // exclusive
    false,              // no-wait
    nil,                // arguments
)
if err != nil {
    fmt.Println("Falha ao criar a queue", err)
    return
}
// Associando a Queue até a Exchange
err = ch.QueueBind(
    qEstoque.Name,          // Nome da fila
    "",                     // Binding key de roteamento - Ignorada no Fanout
    "ecommerce.nova.venda", // Nome da exchange
    false,                  // no-wait
    nil,                    // arguments
)
```

```go
// Criação de uma Queue de cobranca
qLogistica, err := ch.QueueDeclare(
    "informar_logistica", // Nome da fila
    true,                 // durable
    false,                // delete when unused
    false,                // exclusive
    false,                // no-wait
    nil,                  // arguments
)
if err != nil {
    fmt.Println("Falha ao criar a queue", err)
    return
}
// Associando a Queue até a Exchange
err = ch.QueueBind(
    qLogistica.Name,        // Nome da fila
    "",                     // Binding key de roteamento - Ignorada no Fanout
    "ecommerce.nova.venda", // Nome da exchange
    false,                  // no-wait
    nil,                    // arguments
)
```

##### Producer no Fanout

```go
for i := 0; i < 3000000000; i++ {

    id := uuid.New()

    // Mensagem simples
    body := fmt.Sprintf("id:%v", id)

    // Publicando a mensagem na exchange
    err = ch.Publish(
        "ecommerce.nova.venda", // exchange
        "",                     // Binding key de roteamento - Ignorada no Fanout
        false,                  // mandatory
        false,                  // immediate
        amqp.Publishing{
            ContentType: "text/plain",
            Body:        []byte(body),
        })
    if err != nil {
        fmt.Println("Falha ao publicar a mensagem na exchange", err)
    }

    fmt.Printf("Mensagem de venda enviada para a exchange ecommerce.nova.venda: %v\n", body)
}
```



### Revisores

### Referências

[MQTT](https://mqtt.org/)

[O que é MQTT?](https://aws.amazon.com/pt/what-is/mqtt/)

[Conhecendo o MQTT](https://www.mercatoautomacao.com.br/blogs/novidades/conhecendo-o-mqtt)

[Arquitetura do agente MQTT independente no Google Cloud](https://cloud.google.com/architecture/connected-devices/mqtt-broker-architecture?hl=pt-br)

[Eclipse Paho MQTT Go client](https://pkg.go.dev/github.com/eclipse/paho.mqtt.golang#section-readme)

[AMQP](https://www.amqp.org/)

[Advanced Message Queuing Protocol](https://pt.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)

[AMQP — Propriedades de Mensagem](https://medium.com/xp-inc/amqp-propriedades-de-mensagem-f56a14e92409)

[FAQ: What is AMQP and why is it used in RabbitMQ?](https://www.cloudamqp.com/blog/what-is-amqp-and-why-is-it-used-in-rabbitmq.html)

[RabbitMQ Exchange Type](https://hevodata.com/learn/rabbitmq-exchange-type/)

[Enqueue and Dequeue](https://docs.oracle.com/cd/E19253-01/820-0446/chp-sched-10/index.html)

[Kafka - Architecture](https://kafka.apache.org/10/documentation/streams/architecture)

[Kafka Basics and Core Concepts](https://medium.com/inspiredbrilliance/kafka-basics-and-core-concepts-5fd7a68c3193)

[Apache Kafka: 10 essential terms and concepts explained](https://www.redhat.com/en/blog/apache-kafka-10-essential-terms-and-concepts-explained)

[Event Driven Architecture, The Hard Parts: Events Vs Messages](https://medium.com/simpplr-technology/event-driven-architecture-the-hard-parts-events-vs-messages-0fcfc7243703)

[How Much Data Does Streaming Netflix Use?](https://www.buckeyebroadband.com/support/internet/how-much-data-does-streaming-netflix-use)